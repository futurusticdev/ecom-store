import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { OrderList } from "@/components/dashboard/orders/OrderList";
import { OrderFilters } from "@/components/dashboard/orders/OrderFilters";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { unstable_cache } from "next/cache";

// Cache the user lookup to avoid repeated database calls
const getUserId = unstable_cache(
  async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return user?.id;
  },
  ["user-id"],
  { revalidate: 3600 } // Cache for 1 hour
);

function OrderListSkeleton() {
  return (
    <div className="space-y-4 text-center sm:text-left">
      <Skeleton className="h-8 w-1/3 mx-auto sm:mx-0" />
      <Skeleton className="h-4 w-1/4 mx-auto sm:mx-0" />
      <div className="space-y-4 mt-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 sm:h-40 rounded-md" />
        ))}
      </div>
    </div>
  );
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const userId = await getUserId(session.user.email);

  if (!userId) {
    redirect("/auth/signin");
  }

  // Await the searchParams promise
  const resolvedParams = await searchParams;

  // Convert to number safely
  let pageNumber = 1;
  if (resolvedParams && typeof resolvedParams.page === "string") {
    const parsed = parseInt(resolvedParams.page);
    if (!isNaN(parsed)) {
      pageNumber = parsed;
    }
  }

  // Handle status parameter
  const statusParam =
    resolvedParams && typeof resolvedParams.status === "string"
      ? resolvedParams.status
      : undefined;

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 md:p-8 text-center sm:text-left">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Your Orders
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          View and manage your order history
        </p>
      </div>

      <OrderFilters />

      <Suspense fallback={<OrderListSkeleton />}>
        {/* Add TypeScript expect error directive for async components */}
        {/* @ts-expect-error Server Component */}
        <OrderList userId={userId} page={pageNumber} status={statusParam} />
      </Suspense>
    </div>
  );
}

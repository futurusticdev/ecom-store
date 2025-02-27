import { getServerSession } from "next-auth";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { unstable_cache } from "next/cache";

// Cache user data lookup
const getUserData = unstable_cache(
  async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true },
    });
    return user;
  },
  ["user-data"],
  { revalidate: 3600 } // Cache for 1 hour
);

function StatsLoading() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <Skeleton className="h-20 md:h-24 rounded-md" />
      <Skeleton className="h-20 md:h-24 rounded-md" />
      <Skeleton className="h-20 md:h-24 rounded-md" />
      <Skeleton className="h-20 md:h-24 rounded-md" />
    </div>
  );
}

function OrdersLoading() {
  return (
    <div className="space-y-3 md:space-y-4">
      <Skeleton className="h-8 w-1/3 mx-auto sm:mx-0" />
      <Skeleton className="h-32 md:h-40 rounded-md" />
      <Skeleton className="h-32 md:h-40 rounded-md" />
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Get the user data from the cached function
  const user = await getUserData(session.user.email);

  if (!user) {
    redirect("/auth/signin");
  }

  const firstName = user.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6 md:space-y-8 p-4 sm:p-6 md:p-8 text-center sm:text-left">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Welcome back, {firstName}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Here&apos;s an overview of your account
        </p>
      </div>

      <Suspense fallback={<StatsLoading />}>
        <DashboardStats userId={user.id} />
      </Suspense>

      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
          Recent Orders
        </h3>
        <Suspense fallback={<OrdersLoading />}>
          <RecentOrders userId={user.id} />
        </Suspense>
      </div>
    </div>
  );
}

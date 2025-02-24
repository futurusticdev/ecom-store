import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { AddressList } from "@/components/dashboard/addresses/AddressList";
import { Skeleton } from "@/components/ui/skeleton";

// Cache user lookup
const getCachedUser = unstable_cache(
  async (email: string) => {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
  },
  ["user-by-email"],
  { revalidate: 60 }
);

// Loading skeleton for the address list
function AddressListSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-48" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-end gap-2 mt-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AddressesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/sign-in");
  }

  const user = await getCachedUser(session.user.email);

  if (!user) {
    redirect("/sign-in");
  }

  // Await and safely parse the page parameter
  const params = await searchParams;
  const page = Number(params.page) || 1;

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight">Addresses</h1>
        <p className="text-muted-foreground">
          Manage your shipping and billing addresses
        </p>
      </div>

      <Suspense fallback={<AddressListSkeleton />}>
        <AddressList userId={user.id} page={page} />
      </Suspense>
    </div>
  );
}

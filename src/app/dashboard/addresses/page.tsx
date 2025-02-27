import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
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

// Cache the addresses query
const getCachedAddresses = unstable_cache(
  async ({
    userId,
    page = 1,
    limit = 10,
  }: {
    userId: string;
    page: number;
    limit: number;
  }) => {
    const skip = (page - 1) * limit;

    try {
      const addresses = await prisma.address.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      });

      const total = await prisma.address.count({
        where: { userId },
      });

      return {
        addresses,
        total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Error fetching addresses:", error);
      return {
        addresses: [],
        total: 0,
        totalPages: 0,
      };
    }
  },
  ["addresses-list"],
  { revalidate: 60 } // Cache for 60 seconds
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

// Address list component
async function AddressList({
  userId,
  page,
  limit = 10,
}: {
  userId: string;
  page: number;
  limit?: number;
}) {
  // Use the cached function
  const { addresses, total, totalPages } = await getCachedAddresses({
    userId,
    page,
    limit,
  });

  if (!addresses.length) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">
          You haven&apos;t added any addresses yet.
        </p>
        <Link href="/dashboard/addresses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-xs sm:text-sm text-muted-foreground">
          Showing {addresses.length} of {total} addresses
        </div>
        <Link href="/dashboard/addresses/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <Card key={address.id} className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="text-base font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {address.name}
                </div>
                <div className="flex gap-1">
                  {address.isDefault && (
                    <Badge variant="outline" className="text-xs">
                      Default
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {address.type === "SHIPPING" ? "Shipping" : "Billing"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2 text-sm">
              <p>{address.street}</p>
              <p>
                {address.city}, {address.state} {address.postalCode}
              </p>
              <p>{address.country}</p>

              <div className="flex justify-end gap-2 pt-4">
                <Link href={`/dashboard/addresses/${address.id}/edit`}>
                  <Button size="sm" variant="outline">
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                </Link>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-1 sm:gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            // Create query string with page parameter
            const query = new URLSearchParams();
            query.set("page", p.toString());

            return (
              <Link
                key={p}
                href={`/dashboard/addresses?${query.toString()}`}
                className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md ${
                  p === page
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
                prefetch={true}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
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
        {/* Add TypeScript expect error directive for async components */}
        {/* @ts-expect-error Server Component */}
        <AddressList userId={user.id} page={page} />
      </Suspense>
    </div>
  );
}

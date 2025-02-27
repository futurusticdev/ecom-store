import Link from "next/link";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";

interface AddressListProps {
  userId: string;
  page?: number;
  limit?: number;
}

// Cache the addresses query
const getCachedAddresses = unstable_cache(
  async ({ userId, page = 1, limit = 10 }: AddressListProps) => {
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

// This is a Server Component that fetches data
export async function getAddressListData({
  userId,
  page = 1,
  limit = 10,
}: AddressListProps) {
  return getCachedAddresses({
    userId,
    page,
    limit,
  });
}

// This is the actual React component that renders the UI
export function AddressList({
  userId,
  page = 1,
  limit = 10,
}: AddressListProps) {
  // The parent component should handle the data fetching and pass it as props
  // This component just renders the UI based on the data
  return <AddressListContent userId={userId} page={page} limit={limit} />;
}

// This is the async Server Component that fetches and renders
export async function AddressListContent({
  userId,
  page = 1,
  limit = 10,
}: AddressListProps) {
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

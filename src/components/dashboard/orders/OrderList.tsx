import Link from "next/link";
import Image from "next/image";
import { formatDate, formatCurrency } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { unstable_cache } from "next/cache";

// Define the OrderStatus type to match the enum in the Prisma schema
type OrderStatus = "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface OrderListProps {
  userId: string;
  page?: number;
  limit?: number;
  status?: string;
}

// Cache the orders query
const getCachedOrders = unstable_cache(
  async ({ userId, page = 1, limit = 10, status }: OrderListProps) => {
    const skip = (page - 1) * limit;

    try {
      const orders = await prisma.order.findMany({
        where: {
          userId,
          ...(status ? { status: status as OrderStatus } : {}),
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  images: true,
                },
              },
            },
          },
        },
      });

      const total = await prisma.order.count({
        where: {
          userId,
          ...(status ? { status: status as OrderStatus } : {}),
        },
      });

      return {
        orders,
        total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Error fetching orders:", error);
      return {
        orders: [],
        total: 0,
        totalPages: 0,
      };
    }
  },
  ["orders-list"],
  { revalidate: 60 } // Cache for 60 seconds
);

export async function OrderList({
  userId,
  page = 1,
  limit = 10,
  status,
}: OrderListProps) {
  const { orders, total, totalPages } = await getCachedOrders({
    userId,
    page,
    limit,
    status,
  });

  if (!orders.length) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">
          You haven&apos;t placed any orders yet.
        </p>
        <Link href="/products">
          <button className="text-primary hover:underline">
            Browse Products
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-xs sm:text-sm text-muted-foreground">
        Showing {orders.length} of {total} orders
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-lg border bg-card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={
                      order.status === "DELIVERED"
                        ? "success"
                        : order.status === "CANCELLED"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {order.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <p className="text-sm font-medium">Order #{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  Total: {formatCurrency(order.total)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.items.length} items
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {order.items.map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="relative aspect-square">
                    <Image
                      src={item.product.images[0] || "/placeholder.png"}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <p className="text-xs line-clamp-1">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-1 sm:gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            // Create query string with page parameter
            const query = new URLSearchParams();
            query.set("page", p.toString());
            if (status) {
              query.set("status", status);
            }

            return (
              <Link
                key={p}
                href={`/dashboard/orders?${query.toString()}`}
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

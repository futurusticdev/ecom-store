import Image from "next/image";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import { getRecentOrders } from "@/lib/db";
import { unstable_cache } from "next/cache";

// Cache the getRecentOrders function
const getCachedRecentOrders = unstable_cache(
  async (userId: string) => {
    return getRecentOrders(userId);
  },
  ["recent-orders"],
  { revalidate: 60 } // Cache for 60 seconds
);

interface RecentOrdersProps {
  userId: string;
}

interface Order {
  id: string;
  total: number;
  items: OrderItem[];
  createdAt: Date;
  status: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

async function RecentOrdersComponent({ userId }: { userId: string }) {
  // Use the cached version of getRecentOrders
  const orders = await getCachedRecentOrders(userId);

  if (!orders.length) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No recent orders found. Let&apos;s get shopping!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {orders.map((order: Order) => (
        <div
          key={order.id}
          className="rounded-lg border bg-card p-4 sm:p-6 text-card-foreground shadow-sm text-center sm:text-left"
        >
          <div className="flex flex-col items-center sm:items-start sm:flex-row sm:justify-between mb-3 sm:mb-4 gap-2">
            <div>
              <p className="font-medium text-sm sm:text-base">
                Order #{order.id}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex flex-col sm:text-right sm:block">
              <p className="font-medium text-sm sm:text-base">
                {formatCurrency(order.total)}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {order.status}
              </p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {order.items.slice(0, 2).map((item: OrderItem) => (
              <div
                key={item.id}
                className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4"
              >
                <div className="relative h-12 w-12 sm:h-16 sm:w-16 overflow-hidden rounded flex-shrink-0">
                  <Image
                    src={item.product.images[0] || "/placeholder.png"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    priority={false}
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm sm:text-base truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-sm sm:text-base">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
            {order.items.length > 2 && (
              <p className="text-xs text-muted-foreground pt-1">
                +{order.items.length - 2} more items
              </p>
            )}
          </div>

          <div className="mt-3 sm:mt-4 flex justify-center sm:justify-end">
            <Link
              href={`/dashboard/orders/${order.id}`}
              className="text-xs sm:text-sm font-medium text-primary hover:underline"
              prefetch={true}
            >
              View Order Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

// Type cast to work around TS2786 error
export const RecentOrders = RecentOrdersComponent as unknown as (props: {
  userId: string;
}) => JSX.Element;

import Image from "next/image";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import { getRecentOrders } from "@/lib/db";

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

export async function RecentOrders({ userId }: RecentOrdersProps) {
  const orders = await getRecentOrders(userId);

  if (!orders.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No recent orders found. Let&apos;s get shopping!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {orders.map((order: Order) => (
        <div
          key={order.id}
          className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Order #{order.id}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">{formatCurrency(order.total)}</p>
              <p className="text-sm text-muted-foreground">{order.status}</p>
            </div>
          </div>

          <div className="space-y-4">
            {order.items.map((item: OrderItem) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded">
                  <Image
                    src={item.product.images[0] || "/placeholder.png"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <Link
              href={`/dashboard/orders/${order.id}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              View Order Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

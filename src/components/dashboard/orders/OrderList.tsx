import Image from "next/image";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

interface OrderListProps {
  userId: string;
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

async function getOrders({
  userId,
  page = 1,
  limit = 10,
  status,
}: OrderListProps) {
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(status && { status }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function OrderList({
  userId,
  page = 1,
  limit = 10,
  status,
}: OrderListProps) {
  const { orders, total, totalPages } = await getOrders({
    userId,
    page,
    limit,
    status,
  });

  if (!orders.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No orders found.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-sm text-muted-foreground">
        Showing {orders.length} of {total} orders
      </div>

      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">Order #{order.id}</p>
                <Badge
                  variant={
                    order.status === "DELIVERED"
                      ? "success"
                      : order.status === "PROCESSING"
                      ? "default"
                      : order.status === "SHIPPED"
                      ? "info"
                      : "destructive"
                  }
                >
                  {order.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">{formatCurrency(order.total)}</p>
              <Link
                href={`/dashboard/orders/${order.id}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                View Details
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded">
                  <Image
                    src={item.product.images[0]}
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
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/dashboard/orders?page=${p}${
                status ? `&status=${status}` : ""
              }`}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

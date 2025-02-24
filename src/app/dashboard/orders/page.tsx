import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { OrderList } from "@/components/dashboard/orders/OrderList";
import { OrderFilters } from "@/components/dashboard/orders/OrderFilters";

export default async function OrdersPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Orders</h1>
        <p className="text-muted-foreground">
          View and manage your order history
        </p>
      </div>

      <OrderFilters />
      <OrderList userId={user.id} />
    </div>
  );
}

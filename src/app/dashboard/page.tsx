import { getServerSession } from "next-auth";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Get the user ID from the database
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
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {session.user.name}
        </h2>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your account
        </p>
      </div>

      <DashboardStats userId={user.id} />

      <div>
        <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
        <RecentOrders userId={user.id} />
      </div>
    </div>
  );
}

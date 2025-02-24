import { ShoppingBag, Heart, CreditCard, Package } from "lucide-react";
import { getUserStats } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/types/dashboard";

interface DashboardStatsProps {
  userId: string;
}

export async function DashboardStats({ userId }: DashboardStatsProps) {
  const stats = await getUserStats(userId);

  const statCards: StatCard[] = [
    {
      name: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      change: "+4.75%",
      changeType: "positive",
    },
    {
      name: "Saved Items",
      value: stats.savedItems.toString(),
      icon: Heart,
      change: "+10.18%",
      changeType: "positive",
    },
    {
      name: "Total Spent",
      value: formatCurrency(stats.totalSpent),
      icon: CreditCard,
      change: "+12.5%",
      changeType: "positive",
    },
    {
      name: "Active Orders",
      value: stats.activeOrders.toString(),
      icon: Package,
      change: "0",
      changeType: "neutral",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <div
          key={stat.name}
          className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
        >
          <div className="flex items-center gap-2">
            <stat.icon className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">{stat.name}</h4>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stat.value}</span>
              <span
                className={
                  stat.changeType === "positive"
                    ? "text-sm text-green-600"
                    : stat.changeType === "negative"
                    ? "text-sm text-red-600"
                    : "text-sm text-gray-600"
                }
              >
                {stat.change}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

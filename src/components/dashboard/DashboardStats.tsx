import { ShoppingBag, Heart, CreditCard, Package } from "lucide-react";
import { getUserStats } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/types/dashboard";
import { unstable_cache } from "next/cache";

interface DashboardStatsProps {
  userId: string;
}

// Cache stats data
const getCachedUserStats = unstable_cache(
  async (userId: string) => {
    return getUserStats(userId);
  },
  ["user-stats"],
  { revalidate: 60 } // Cache for 60 seconds
);

async function DashboardStatsComponent({ userId }: { userId: string }) {
  const stats = await getCachedUserStats(userId);

  // Helper function to determine change type
  const getChangeType = (percentChange: number) => {
    if (percentChange > 0) return "positive";
    if (percentChange < 0) return "negative";
    return "neutral";
  };

  // Format percentage with + or - sign
  const formatPercentage = (percentChange: number) => {
    const prefix = percentChange > 0 ? "+" : "";
    return `${prefix}${percentChange}%`;
  };

  const orderPercentChange = parseFloat(stats.orderPercentChange || "0");
  const spendingPercentChange = parseFloat(stats.spendingPercentChange || "0");
  const favoritesPercentChange = parseFloat(
    stats.favoritesPercentChange || "0"
  );

  const statCards: StatCard[] = [
    {
      name: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      change: formatPercentage(orderPercentChange),
      changeType: getChangeType(orderPercentChange),
    },
    {
      name: "Saved Items",
      value: stats.savedItems.toString(),
      icon: Heart,
      change: formatPercentage(favoritesPercentChange),
      changeType: getChangeType(favoritesPercentChange),
    },
    {
      name: "Total Spent",
      value: formatCurrency(stats.totalSpent),
      icon: CreditCard,
      change: formatPercentage(spendingPercentChange),
      changeType: getChangeType(spendingPercentChange),
    },
    {
      name: "Active Orders",
      value: stats.activeOrders.toString(),
      icon: Package,
      change: "Current",
      changeType: "neutral",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {statCards.map((stat) => (
        <div
          key={stat.name}
          className="rounded-lg border bg-card p-3 sm:p-4 md:p-6 text-card-foreground shadow-sm text-center sm:text-left"
        >
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <stat.icon className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-xs sm:text-sm md:text-base font-medium">
              {stat.name}
            </h4>
          </div>
          <div className="mt-2 md:mt-3">
            <div className="flex items-baseline gap-1 sm:gap-2 justify-center sm:justify-start">
              <span className="text-lg sm:text-xl md:text-2xl font-bold">
                {stat.value}
              </span>
              <span
                className={
                  stat.changeType === "positive"
                    ? "text-xs sm:text-sm text-green-600"
                    : stat.changeType === "negative"
                    ? "text-xs sm:text-sm text-red-600"
                    : "text-xs sm:text-sm text-gray-600"
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

// Type cast to work around TS2786 error
export const DashboardStats = DashboardStatsComponent as unknown as (props: {
  userId: string;
}) => JSX.Element;

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  ShoppingCart,
  Users,
  Percent,
} from "lucide-react";
import {
  getDashboardStats,
  DashboardStats,
} from "@/services/dashboard-service";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError(
          "Failed to load dashboard statistics. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Render loading skeletons
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-24" />
              </CardTitle>
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Skeleton className="h-8 w-20" />
              </div>
              <div className="text-xs text-muted-foreground">
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  // Render actual stats
  if (!stats) return null;

  const items = [
    {
      title: "Total Sales",
      value: `$${stats.totalSales.value.toLocaleString()}`,
      percentChange: parseFloat(stats.totalSales.change),
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.value.toLocaleString(),
      percentChange: parseFloat(stats.totalOrders.change),
      icon: ShoppingCart,
    },
    {
      title: "New Customers",
      value: stats.newCustomers.value.toLocaleString(),
      percentChange: parseFloat(stats.newCustomers.change),
      icon: Users,
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate.value}%`,
      percentChange: parseFloat(stats.conversionRate.change),
      icon: Percent,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              {item.percentChange > 0 ? (
                <ArrowUp className="h-3 w-3 text-emerald-500" />
              ) : item.percentChange < 0 ? (
                <ArrowDown className="h-3 w-3 text-rose-500" />
              ) : null}
              <span
                className={
                  item.percentChange > 0
                    ? "text-emerald-500"
                    : item.percentChange < 0
                    ? "text-rose-500"
                    : ""
                }
              >
                {Math.abs(item.percentChange).toFixed(1)}%
              </span>{" "}
              from last month
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

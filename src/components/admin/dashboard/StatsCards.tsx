"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDashboardStats,
  DashboardStats,
} from "@/services/dashboard-service";

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="bg-white">
            <CardContent className="pt-6 pb-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white">
          <CardContent className="pt-6 pb-4">
            <p className="text-sm text-red-500">Failed to load stats</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsCards = [
    {
      label: "Total Sales",
      value: formatCurrency(stats.totalSales.current),
      change: formatPercentage(stats.totalSales.percentChange),
      trend: stats.totalSales.percentChange > 0 ? "up" : "down",
      comparison: `Compared to ${formatCurrency(
        stats.totalSales.previous
      )} last month`,
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.current.toString(),
      change: formatPercentage(stats.totalOrders.percentChange),
      trend: stats.totalOrders.percentChange > 0 ? "up" : "down",
      comparison: `Compared to ${stats.totalOrders.previous} last month`,
    },
    {
      label: "New Customers",
      value: stats.newCustomers.current.toString(),
      change: formatPercentage(stats.newCustomers.percentChange),
      trend: stats.newCustomers.percentChange > 0 ? "up" : "down",
      comparison: `Compared to ${stats.newCustomers.previous} last month`,
    },
    {
      label: "Conversion Rate",
      value: `${stats.conversionRate.current.toFixed(2)}%`,
      change: formatPercentage(stats.conversionRate.percentChange),
      trend: stats.conversionRate.percentChange > 0 ? "up" : "down",
      comparison: `Compared to ${stats.conversionRate.previous.toFixed(
        2
      )}% last month`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((stat, index) => (
        <Card
          key={index}
          className="bg-white hover:shadow-md transition-shadow"
        >
          <CardContent className="pt-6 pb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {stat.label}
              </p>
              <div className="flex items-center mb-1">
                <span className="text-2xl font-bold">{stat.value}</span>
                <Badge
                  className={`ml-2 ${
                    stat.trend === "up"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <span className="flex items-center text-xs">
                    {stat.trend === "up" ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    )}
                    {stat.change}
                  </span>
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{stat.comparison}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

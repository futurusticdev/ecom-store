"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Discount } from "@/types/discount";

interface DiscountStatisticsProps {
  activeDiscounts: Discount[];
  scheduledDiscounts: Discount[];
  stats: {
    endingThisWeek: number;
    appliedToOrders: number;
    usageRate: number;
    comparedToLastMonth: number;
  };
}

export function DiscountStatistics({
  activeDiscounts,
  scheduledDiscounts,
  stats,
}: DiscountStatisticsProps) {
  // Calculate total savings (simulated)
  const totalSavings = activeDiscounts.reduce((sum, discount) => {
    // In a real app, this would be calculated from actual order data
    const avgOrderValue = 120;
    const discountAmount =
      discount.type === "PERCENTAGE"
        ? (avgOrderValue * discount.value) / 100
        : discount.value;
    return sum + discountAmount * discount.usage.current;
  }, 0);

  // Calculate overall usage rate
  const overallUsageRate =
    activeDiscounts.length > 0
      ? (activeDiscounts.reduce((sum, d) => sum + d.usage.current, 0) /
          activeDiscounts.reduce((sum, d) => sum + d.usage.max, 0)) *
        100
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Active Discounts */}
      <Card>
        <CardContent className="p-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-500">Active Discounts</h3>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                Live
              </Badge>
            </div>
            <div className="mb-1">
              <h2 className="text-2xl font-bold">{activeDiscounts.length}</h2>
            </div>
            <p className="text-xs text-gray-500">
              {stats.endingThisWeek} ending this week
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Total Savings */}
      <Card>
        <CardContent className="p-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-500">Total Savings</h3>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                This Month
              </Badge>
            </div>
            <div className="mb-1">
              <h2 className="text-2xl font-bold">${totalSavings.toFixed(2)}</h2>
            </div>
            <p className="text-xs text-gray-500">
              Applied to {stats.appliedToOrders.toLocaleString()} orders
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Usage Rate */}
      <Card>
        <CardContent className="p-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-500">Usage Rate</h3>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                +{overallUsageRate.toFixed(1)}%
              </Badge>
            </div>
            <div className="mb-1">
              <h2 className="text-2xl font-bold">
                {overallUsageRate.toFixed(1)}%
              </h2>
            </div>
            <p className="text-xs text-gray-500">
              Compared to {stats.comparedToLastMonth}% last month
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled */}
      <Card>
        <CardContent className="p-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-500">Scheduled</h3>
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                Upcoming
              </Badge>
            </div>
            <div className="mb-1">
              <h2 className="text-2xl font-bold">
                {scheduledDiscounts.length}
              </h2>
            </div>
            <p className="text-xs text-gray-500">Starting next week</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

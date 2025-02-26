"use client";

import { StatsCards } from "@/components/admin/dashboard/StatsCards";
import { RecentOrders } from "@/components/admin/dashboard/RecentOrders";
import { RecentActivity } from "@/components/admin/dashboard/RecentActivity";
import { SalesChart } from "@/components/admin/dashboard/SalesChart";

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <StatsCards />

      {/* Sales Chart */}
      <div className="mb-8">
        <SalesChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - Takes up 2/3 of the space on large screens */}
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>

        {/* Recent Activity - Takes up 1/3 of the space on large screens */}
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}

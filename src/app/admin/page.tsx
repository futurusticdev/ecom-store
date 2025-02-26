"use client";

import { Metadata } from "next";
import { StatsCards } from "@/components/admin/dashboard/StatsCards";
import { SalesChart } from "@/components/admin/dashboard/SalesChart";
import { RecentOrders } from "@/components/admin/dashboard/RecentOrders";
import { RecentActivity } from "@/components/admin/dashboard/RecentActivity";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <Suspense fallback={<Skeleton className="h-[120px] w-full" />}>
        <StatsCards />
      </Suspense>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-4">
          <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
            <SalesChart />
          </Suspense>
        </div>

        <div className="col-span-1 lg:col-span-3 space-y-6">
          <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1">
        <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
          <RecentOrders />
        </Suspense>
      </div>
    </div>
  );
}

import { format, subDays } from "date-fns";
import { fetchWithFallback, fetchWithCache } from "@/lib/data-utils";
import {
  fetchCryptoData,
  generateRealDashboardStats,
  generateRealOrders,
  generateRealActivity,
} from "./external-data-service";

// API endpoints
const API_ENDPOINTS = {
  STATS: "/api/dashboard/stats",
  RECENT_ORDERS: "/api/dashboard/recent-orders",
  RECENT_ACTIVITY: "/api/dashboard/recent-activity",
  SALES_DATA: "/api/dashboard/sales-data",
};

// Types for dashboard data
export interface DashboardStats {
  totalSales: {
    current: number;
    previous: number;
    percentChange: number;
  };
  totalOrders: {
    current: number;
    previous: number;
    percentChange: number;
  };
  newCustomers: {
    current: number;
    previous: number;
    percentChange: number;
  };
  conversionRate: {
    current: number;
    previous: number;
    percentChange: number;
  };
}

export interface Order {
  id: string;
  customer: string;
  product: string;
  date: string;
  status: "Completed" | "Processing" | "Shipped" | "Cancelled";
  amount: string;
}

export interface Activity {
  id: string;
  type: string;
  time: string;
  icon: "user" | "order" | "product";
}

// Mock data generators
function generateMockDashboardStats(): DashboardStats {
  return {
    totalSales: {
      current: 24500,
      previous: 21000,
      percentChange: 16.7,
    },
    totalOrders: {
      current: 450,
      previous: 385,
      percentChange: 16.9,
    },
    newCustomers: {
      current: 89,
      previous: 76,
      percentChange: 17.1,
    },
    conversionRate: {
      current: 3.2,
      previous: 2.8,
      percentChange: 14.3,
    },
  };
}

function generateMockRecentOrders(limit: number = 5): Order[] {
  const statuses: ("Completed" | "Processing" | "Shipped" | "Cancelled")[] = [
    "Completed",
    "Processing",
    "Shipped",
    "Cancelled",
  ];

  return Array.from({ length: limit }, (_, i) => ({
    id: `ORD-${1000 + i}`,
    customer: `Customer ${i + 1}`,
    product: `Product ${i + 1}`,
    date: `Jan ${10 + i}, 2023`,
    status: statuses[i % statuses.length],
    amount: `$${(100 + i * 10).toFixed(2)}`,
  }));
}

function generateMockRecentActivity(limit: number = 5): Activity[] {
  const icons: ("user" | "order" | "product")[] = ["user", "order", "product"];
  const times = [
    "2 minutes ago",
    "15 minutes ago",
    "1 hour ago",
    "3 hours ago",
    "5 hours ago",
  ];

  return Array.from({ length: limit }, (_, i) => ({
    id: `act-${1000 + i}`,
    type: `Activity ${i + 1}`,
    time: times[i % times.length],
    icon: icons[i % icons.length],
  }));
}

function generateMockSalesData(
  days: number = 7
): { date: string; sales: number }[] {
  const dates = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return Array.from({ length: days }, (_, i) => ({
    date: dates[i % dates.length],
    sales: Math.floor(Math.random() * 5000) + 1000,
  }));
}

// Public API
export async function getDashboardStats(): Promise<DashboardStats> {
  return await fetchWithFallback<DashboardStats>(
    API_ENDPOINTS.STATS,
    async () => await generateRealDashboardStats(),
    generateMockDashboardStats
  );
}

export async function getRecentOrders(limit: number = 5): Promise<Order[]> {
  return await fetchWithFallback<Order[]>(
    `${API_ENDPOINTS.RECENT_ORDERS}?limit=${limit}`,
    async () => await generateRealOrders(limit),
    () => generateMockRecentOrders(limit)
  );
}

export async function getRecentActivity(
  limit: number = 5
): Promise<Activity[]> {
  return await fetchWithFallback<Activity[]>(
    `${API_ENDPOINTS.RECENT_ACTIVITY}?limit=${limit}`,
    async () => await generateRealActivity(limit),
    () => generateMockRecentActivity(limit)
  );
}

export async function getSalesData(
  days: number = 7
): Promise<{ date: string; sales: number }[]> {
  return await fetchWithCache<{ date: string; sales: number }[]>(
    `${API_ENDPOINTS.SALES_DATA}?days=${days}`,
    "sales_data",
    async () => await fetchCryptoData(days),
    () => generateMockSalesData(days),
    60 * 60 * 1000 // 1 hour cache
  );
}

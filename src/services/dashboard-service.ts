import { format, subDays } from "date-fns";
import { fetchWithFallback, fetchWithCache } from "@/lib/data-utils";

// API endpoints
const API_ENDPOINTS = {
  STATS: "/api/dashboard",
  RECENT_ORDERS: "/api/dashboard/recent-orders",
  RECENT_ACTIVITY: "/api/dashboard/recent-activity",
  SALES_DATA: "/api/dashboard/sales",
};

// Types for dashboard data
export interface DashboardStats {
  totalSales: {
    value: number;
    change: string;
  };
  totalOrders: {
    value: number;
    change: string;
  };
  newCustomers: {
    value: number;
    change: string;
  };
  conversionRate: {
    value: string;
    change: string;
  };
}

export interface Order {
  id: string;
  customer: {
    name: string;
    email: string | null;
    image: string | null;
  };
  status: string;
  total: number;
  date: Date;
  items: {
    id: string;
    productName: string;
    quantity: number;
    price: number;
    image: string | null;
  }[];
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  data: Record<string, any>;
}

export interface SalesDataPoint {
  date: string;
  amount: number;
}

export interface SalesSummary {
  totalSales: number;
  averageDailySales: number;
  peakSalesDay: {
    date: string;
    amount: number;
  };
  period: string;
}

// Mock data generators for fallback
function generateMockDashboardStats(): DashboardStats {
  return {
    totalSales: {
      value: 86161000,
      change: "1.4",
    },
    totalOrders: {
      value: 2343165,
      change: "2.1",
    },
    newCustomers: {
      value: 520920,
      change: "0.0",
    },
    conversionRate: {
      value: "3.2",
      change: "0.7",
    },
  };
}

function generateMockRecentOrders(limit: number = 5): Order[] {
  const statuses = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  const productNames = [
    "Premium Subscription",
    "Gold Package",
    "Silver Package",
    "Digital Asset Bundle",
    "Enterprise License",
  ];
  const customerNames = [
    "Sarah Johnson",
    "Michael Chen",
    "Emily Wilson",
    "David Rodriguez",
    "Jennifer Lee",
  ];

  return Array.from({ length: limit }, (_, i) => ({
    id: `ORD-${7880 + i}`,
    customer: {
      name: customerNames[i % customerNames.length],
      email: `customer${i}@example.com`,
      image: null,
    },
    status: statuses[i % statuses.length],
    total: [861610, 23713, 10, 22, 6093][i % 5],
    date: new Date(2025, 1, 22 + i),
    items: [
      {
        id: `item-${1000 + i}`,
        productName: productNames[i % productNames.length],
        quantity: 1,
        price: [861610, 23713, 10, 22, 6093][i % 5],
        image: null,
      },
    ],
  }));
}

function generateMockRecentActivity(limit: number = 5): Activity[] {
  const activities = [
    {
      type: "NEW_USER",
      message: "New customer registered",
      timeAgo: "2 minutes ago",
    },
    {
      type: "ORDER_STATUS",
      message: "Order #ORD-7891 cancelled",
      timeAgo: "15 minutes ago",
    },
    {
      type: "STORE_UPDATE",
      message: "Premium Subscription added to store",
      timeAgo: "1 hour ago",
    },
    {
      type: "NEW_ACCOUNT",
      message: "New business account created",
      timeAgo: "3 hours ago",
    },
    {
      type: "ORDER_STATUS",
      message: "Order #ORD-7885 shipped",
      timeAgo: "5 hours ago",
    },
  ];

  return Array.from({ length: Math.min(limit, activities.length) }, (_, i) => {
    const now = new Date();
    const timestamp = new Date(now);

    // Calculate timestamp based on timeAgo
    if (activities[i].timeAgo.includes("minutes")) {
      const minutes = parseInt(activities[i].timeAgo);
      timestamp.setMinutes(now.getMinutes() - minutes);
    } else if (activities[i].timeAgo.includes("hour")) {
      const hours = parseInt(activities[i].timeAgo);
      timestamp.setHours(now.getHours() - hours);
    }

    return {
      id: `act-${1000 + i}`,
      type: activities[i].type,
      message: activities[i].message,
      timestamp,
      data: {},
    };
  });
}

function generateMockSalesData(period: string = "7d"): {
  salesData: SalesDataPoint[];
  summary: SalesSummary;
} {
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const endDate = new Date();
  const salesData: SalesDataPoint[] = [];

  let totalSales = 0;
  let maxSales = 0;
  let maxSalesDate = "";

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(endDate.getDate() - (days - i - 1));
    const dateString = date.toISOString().split("T")[0];

    // Generate higher sales on weekends
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const amount =
      Math.floor(Math.random() * (isWeekend ? 120000 : 60000)) + 20000;

    salesData.push({
      date: dateString,
      amount,
    });

    totalSales += amount;

    if (amount > maxSales) {
      maxSales = amount;
      maxSalesDate = dateString;
    }
  }

  return {
    salesData,
    summary: {
      totalSales,
      averageDailySales: totalSales / days,
      peakSalesDay: {
        date: maxSalesDate,
        amount: maxSales,
      },
      period,
    },
  };
}

// Public API functions
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await fetch(API_ENDPOINTS.STATS);
    if (!response.ok) throw new Error("Failed to fetch dashboard stats");

    const data = await response.json();

    // Ensure we're returning the expected structure
    if (data && data.stats) {
      return data.stats;
    } else {
      console.error(
        "API returned unexpected format for dashboard stats:",
        data
      );
      // If data is not in expected format, return mock data
      return generateMockDashboardStats();
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Fall back to mock data on error
    return generateMockDashboardStats();
  }
}

export async function getRecentOrders(limit: number = 5): Promise<Order[]> {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.RECENT_ORDERS}?limit=${limit}`
    );
    if (!response.ok) throw new Error("Failed to fetch recent orders");

    const data = await response.json();

    // Ensure we're returning an array
    if (data && Array.isArray(data.orders)) {
      return data.orders;
    } else if (data && typeof data === "object" && !Array.isArray(data)) {
      console.error("API returned unexpected format:", data);
      // If data is not in expected format, return mock data
      return generateMockRecentOrders(limit);
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    // Fall back to mock data on error
    return generateMockRecentOrders(limit);
  }
}

export async function getRecentActivity(
  limit: number = 5
): Promise<Activity[]> {
  try {
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(
      `${API_ENDPOINTS.RECENT_ACTIVITY}?limit=${limit}`,
      {
        signal: controller.signal,
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      }
    );

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(`API error (${response.status}): ${errorText}`);
      throw new Error(
        `Failed to fetch recent activity: ${response.status} ${response.statusText}`
      );
    }

    // Parse the response
    const data = await response.json();

    // Ensure we're returning an array
    if (data && Array.isArray(data.activities)) {
      return data.activities;
    } else {
      console.error("API returned unexpected format for activities:", data);
      // If data is not in expected format, return mock data
      return generateMockRecentActivity(limit);
    }
  } catch (error) {
    // Handle different types of errors
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("Request timed out fetching recent activity");
    } else {
      console.error("Error fetching recent activity:", error);
    }

    // Try to get from cache if available
    const cachedData =
      typeof window !== "undefined"
        ? localStorage.getItem(`recent_activity_${limit}`)
        : null;
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (parsed.value && Array.isArray(parsed.value)) {
          console.log("Using cached recent activity data");
          return parsed.value;
        }
      } catch (e) {
        console.error("Error parsing cached activity data:", e);
      }
    }

    // Fall back to mock data on error
    return generateMockRecentActivity(limit);
  }
}

export async function getSalesData(
  period: string = "7d"
): Promise<{ salesData: SalesDataPoint[]; summary: SalesSummary }> {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.SALES_DATA}?period=${period}`
    );
    if (!response.ok) throw new Error("Failed to fetch sales data");

    const data = await response.json();

    // Validate the data structure
    if (data && Array.isArray(data.salesData) && data.summary) {
      return data;
    } else {
      console.error("API returned unexpected format for sales data:", data);
      // If data is not in expected format, return mock data
      return generateMockSalesData(period);
    }
  } catch (error) {
    console.error("Error fetching sales data:", error);

    // Try to get from cache if available
    const cachedData =
      typeof window !== "undefined"
        ? localStorage.getItem(`sales_data_${period}`)
        : null;

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (parsed.value && parsed.value.salesData) {
          return parsed.value;
        }
      } catch (e) {
        console.error("Error parsing cached sales data:", e);
      }
    }

    // Fall back to mock data
    return generateMockSalesData(period);
  }
}

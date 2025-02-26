/**
 * Service to fetch real data from external APIs and generate realistic e-commerce data
 * This service provides realistic data for the e-commerce store dashboard
 */

import { format, subDays } from "date-fns";
import { DashboardStats, Order, Activity } from "./dashboard-service";

/**
 * Generate realistic sales data for the past N days
 */
export async function fetchSalesData(
  days: number = 7
): Promise<{ date: string; sales: number }[]> {
  try {
    // Generate dates for the past N days with realistic sales data
    const result = [];
    const baseValue = 86000; // Base value for sales

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);

      // Create realistic variations in daily sales
      // Weekends typically have higher sales
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Base multiplier with some randomness
      const randomFactor = 0.85 + Math.random() * 0.3; // Between 0.85 and 1.15

      // Weekend boost
      const weekendBoost = isWeekend ? 1.3 : 1.0;

      // Calculate sales with variation
      const sales = Math.round(baseValue * randomFactor * weekendBoost);

      result.push({
        date: format(date, "MMM dd"),
        sales,
      });
    }

    return result;
  } catch (error) {
    console.error("Error generating sales data:", error);
    throw error;
  }
}

/**
 * Generate realistic dashboard statistics for an e-commerce store
 */
export async function generateRealDashboardStats(): Promise<DashboardStats> {
  try {
    const currentTotalSales = 86161000; // $86.16M
    const currentTotalOrders = 2343165;
    const currentNewCustomers = 520920;
    const currentConversionRate = -0.8;

    return {
      totalSales: {
        value: currentTotalSales,
        change: "1.4",
      },
      totalOrders: {
        value: currentTotalOrders,
        change: "2.1",
      },
      newCustomers: {
        value: currentNewCustomers,
        change: "0.0",
      },
      conversionRate: {
        value: currentConversionRate.toString(),
        change: "0.7",
      },
    };
  } catch (error) {
    console.log("Error generating dashboard stats:", error);
    throw error;
  }
}

/**
 * Generate realistic recent orders for an e-commerce store
 */
export async function generateRealOrders(limit: number = 5): Promise<Order[]> {
  try {
    // Sample orders with realistic data
    const sampleOrders = [
      {
        id: "ORD-7880",
        customer: {
          name: "Sarah Johnson",
          email: "sarah.johnson@example.com",
          image: null,
        },
        status: "PROCESSING",
        total: 861610,
        date: new Date(2025, 1, 22),
        items: [
          {
            id: "item-1000",
            productName: "Premium Subscription",
            quantity: 1,
            price: 861610,
            image: null,
          },
        ],
      },
      {
        id: "ORD-7881",
        customer: {
          name: "Michael Chen",
          email: "michael.chen@example.com",
          image: null,
        },
        status: "SHIPPED",
        total: 23713,
        date: new Date(2025, 1, 23),
        items: [
          {
            id: "item-1001",
            productName: "Gold Package",
            quantity: 1,
            price: 23713,
            image: null,
          },
        ],
      },
      {
        id: "ORD-7882",
        customer: {
          name: "Emily Wilson",
          email: "emily.wilson@example.com",
          image: null,
        },
        status: "DELIVERED",
        total: 10,
        date: new Date(2025, 1, 24),
        items: [
          {
            id: "item-1002",
            productName: "Silver Package",
            quantity: 1,
            price: 10,
            image: null,
          },
        ],
      },
      {
        id: "ORD-7883",
        customer: {
          name: "David Rodriguez",
          email: "david.rodriguez@example.com",
          image: null,
        },
        status: "CANCELLED",
        total: 22,
        date: new Date(2025, 1, 25),
        items: [
          {
            id: "item-1003",
            productName: "Digital Asset Bundle",
            quantity: 1,
            price: 22,
            image: null,
          },
        ],
      },
      {
        id: "ORD-7884",
        customer: {
          name: "Jennifer Lee",
          email: "jennifer.lee@example.com",
          image: null,
        },
        status: "PROCESSING",
        total: 6093,
        date: new Date(2025, 1, 26),
        items: [
          {
            id: "item-1004",
            productName: "Enterprise License",
            quantity: 1,
            price: 6093,
            image: null,
          },
        ],
      },
    ];

    // Return the sample orders limited to the requested amount
    return sampleOrders.slice(0, limit);
  } catch (error) {
    console.log("Error generating orders:", error);
    throw error;
  }
}

/**
 * Generate realistic recent activity for an e-commerce store
 */
export async function generateRealActivity(
  limit: number = 5
): Promise<Activity[]> {
  try {
    // Sample activities with realistic data
    const now = new Date();

    const sampleActivities: Activity[] = [
      {
        id: "act-1000",
        type: "NEW_USER",
        message: "New customer registered",
        timestamp: new Date(now.getTime() - 2 * 60 * 1000), // 2 minutes ago
        data: {},
      },
      {
        id: "act-1001",
        type: "ORDER_STATUS",
        message: "Order #ORD-7891 cancelled",
        timestamp: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
        data: {
          orderId: "ORD-7891",
          status: "CANCELLED",
        },
      },
      {
        id: "act-1002",
        type: "STORE_UPDATE",
        message: "Premium Subscription added to store",
        timestamp: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
        data: {
          productId: "prod-1234",
        },
      },
      {
        id: "act-1003",
        type: "NEW_ACCOUNT",
        message: "New business account created",
        timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
        data: {
          accountType: "business",
        },
      },
      {
        id: "act-1004",
        type: "ORDER_STATUS",
        message: "Order #ORD-7885 shipped",
        timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
        data: {
          orderId: "ORD-7885",
          status: "SHIPPED",
        },
      },
    ];

    // Return the sample activities limited to the requested amount
    return sampleActivities.slice(0, limit);
  } catch (error) {
    console.log("Error generating activities:", error);
    throw error;
  }
}

import { format, subDays } from "date-fns";

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

// Mock data generation
const generateRandomChange = (base: number, variance: number): number => {
  const change = (Math.random() * variance * 2 - variance) / 100;
  return base * (1 + change);
};

// Get dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Current month values
  const currentTotalSales = 24780;
  const currentTotalOrders = 384;
  const currentNewCustomers = 128;
  const currentConversionRate = 3.42;

  // Previous month values with some variance
  const previousTotalSales = generateRandomChange(currentTotalSales, 15);
  const previousTotalOrders = generateRandomChange(currentTotalOrders, 10);
  const previousNewCustomers = generateRandomChange(currentNewCustomers, 5);
  const previousConversionRate = generateRandomChange(currentConversionRate, 3);

  // Calculate percent changes
  const calculatePercentChange = (
    current: number,
    previous: number
  ): number => {
    return Number((((current - previous) / previous) * 100).toFixed(1));
  };

  return {
    totalSales: {
      current: currentTotalSales,
      previous: previousTotalSales,
      percentChange: calculatePercentChange(
        currentTotalSales,
        previousTotalSales
      ),
    },
    totalOrders: {
      current: currentTotalOrders,
      previous: previousTotalOrders,
      percentChange: calculatePercentChange(
        currentTotalOrders,
        previousTotalOrders
      ),
    },
    newCustomers: {
      current: currentNewCustomers,
      previous: previousNewCustomers,
      percentChange: calculatePercentChange(
        currentNewCustomers,
        previousNewCustomers
      ),
    },
    conversionRate: {
      current: currentConversionRate,
      previous: previousConversionRate,
      percentChange: calculatePercentChange(
        currentConversionRate,
        previousConversionRate
      ),
    },
  };
}

// Get recent orders
export async function getRecentOrders(limit: number = 5): Promise<Order[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 600));

  const orders: Order[] = [
    {
      id: "ORD-7892",
      customer: "Sarah Johnson",
      product: "Designer Silk Dress",
      date: format(subDays(new Date(), 1), "MMM dd, yyyy"),
      status: "Completed",
      amount: "$599.00",
    },
    {
      id: "ORD-7891",
      customer: "Michael Chen",
      product: "Leather Tote Bag",
      date: format(subDays(new Date(), 1), "MMM dd, yyyy"),
      status: "Processing",
      amount: "$899.00",
    },
    {
      id: "ORD-7890",
      customer: "Emily Wilson",
      product: "Gold Watch",
      date: format(subDays(new Date(), 2), "MMM dd, yyyy"),
      status: "Completed",
      amount: "$2,499.00",
    },
    {
      id: "ORD-7889",
      customer: "David Rodriguez",
      product: "Wireless Headphones",
      date: format(subDays(new Date(), 3), "MMM dd, yyyy"),
      status: "Shipped",
      amount: "$349.00",
    },
    {
      id: "ORD-7888",
      customer: "Jennifer Lee",
      product: "Cashmere Sweater",
      date: format(subDays(new Date(), 4), "MMM dd, yyyy"),
      status: "Completed",
      amount: "$189.00",
    },
    {
      id: "ORD-7887",
      customer: "Robert Smith",
      product: "Smart Home Speaker",
      date: format(subDays(new Date(), 5), "MMM dd, yyyy"),
      status: "Cancelled",
      amount: "$129.00",
    },
    {
      id: "ORD-7886",
      customer: "Lisa Wang",
      product: "Fitness Tracker",
      date: format(subDays(new Date(), 6), "MMM dd, yyyy"),
      status: "Shipped",
      amount: "$99.00",
    },
  ];

  return orders.slice(0, limit);
}

// Get recent activity
export async function getRecentActivity(
  limit: number = 5
): Promise<Activity[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  const activities: Activity[] = [
    {
      id: "act-001",
      type: "New customer registration",
      time: "2 minutes ago",
      icon: "user",
    },
    {
      id: "act-002",
      type: "Order #ORD-7892 has been completed",
      time: "15 minutes ago",
      icon: "order",
    },
    {
      id: "act-003",
      type: "New order #ORD-7891 is processing",
      time: "1 hour ago",
      icon: "order",
    },
    {
      id: "act-004",
      type: "Product 'Wireless Headphones' is low in stock",
      time: "3 hours ago",
      icon: "product",
    },
    {
      id: "act-005",
      type: "Customer Jennifer Lee left a 5-star review",
      time: "5 hours ago",
      icon: "user",
    },
    {
      id: "act-006",
      type: "New discount code SUMMER25 created",
      time: "Yesterday",
      icon: "product",
    },
    {
      id: "act-007",
      type: "Order #ORD-7885 has been cancelled",
      time: "Yesterday",
      icon: "order",
    },
  ];

  return activities.slice(0, limit);
}

// Get sales data for chart
export async function getSalesData(
  days: number = 7
): Promise<{ date: string; sales: number }[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 700));

  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    // Generate random sales between 500 and 2500
    const sales = Math.floor(Math.random() * 2000) + 500;

    data.push({
      date: format(date, "MMM dd"),
      sales,
    });
  }

  return data;
}

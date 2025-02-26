/**
 * Service to fetch real data from external APIs and generate realistic e-commerce data
 * This service provides realistic data for the e-commerce store dashboard
 */

import { format, subDays, addDays } from "date-fns";
import { DashboardStats, Order, Activity } from "./dashboard-service";

// Public APIs that could be used for real data (currently using generated data)
const PUBLIC_APIS = {
  PRODUCTS: "https://fakestoreapi.com/products",
  USERS: "https://fakestoreapi.com/users",
  ORDERS: "https://fakestoreapi.com/carts",
};

// E-commerce product categories
const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home & Kitchen",
  "Beauty & Personal Care",
  "Books",
  "Toys & Games",
  "Sports & Outdoors",
  "Jewelry",
];

// E-commerce product names
const PRODUCT_NAMES = {
  Electronics: [
    "Wireless Earbuds",
    "Smart Watch",
    "Bluetooth Speaker",
    "Tablet Pro",
    "Ultra HD Monitor",
    "Gaming Keyboard",
    "Wireless Charger",
  ],
  Clothing: [
    "Premium Denim Jeans",
    "Cotton T-Shirt",
    "Wool Sweater",
    "Leather Jacket",
    "Summer Dress",
    "Athletic Shorts",
    "Winter Coat",
  ],
  "Home & Kitchen": [
    "Coffee Maker",
    "Air Fryer",
    "Knife Set",
    "Bedding Set",
    "Towel Collection",
    "Cookware Set",
    "Smart Thermostat",
  ],
  "Beauty & Personal Care": [
    "Facial Cleanser",
    "Moisturizer",
    "Hair Dryer",
    "Perfume Collection",
    "Makeup Set",
    "Electric Toothbrush",
    "Skincare Kit",
  ],
  Books: [
    "Bestseller Novel",
    "Cookbook",
    "Self-Help Guide",
    "Children's Book",
    "Business Strategy",
    "Science Fiction",
    "Biography",
  ],
  "Toys & Games": [
    "Building Blocks",
    "Board Game",
    "Action Figure",
    "Remote Control Car",
    "Educational Toy",
    "Puzzle Set",
    "Doll Collection",
  ],
  "Sports & Outdoors": [
    "Yoga Mat",
    "Fitness Tracker",
    "Tennis Racket",
    "Camping Tent",
    "Basketball",
    "Hiking Backpack",
    "Golf Clubs",
  ],
  Jewelry: [
    "Diamond Earrings",
    "Gold Necklace",
    "Silver Bracelet",
    "Watch Collection",
    "Pearl Set",
    "Engagement Ring",
    "Gemstone Pendant",
  ],
};

// Customer names
const CUSTOMERS = [
  "Sarah Johnson",
  "Michael Chen",
  "Emily Wilson",
  "David Rodriguez",
  "Jennifer Lee",
  "Robert Smith",
  "Lisa Wang",
  "James Brown",
  "Maria Garcia",
  "Thomas Anderson",
  "Emma Davis",
  "Daniel Martinez",
  "Olivia Taylor",
  "William Thompson",
];

// Product tiers
const PRODUCT_TIERS = [
  "Basic",
  "Standard",
  "Premium",
  "Deluxe",
  "Ultimate",
  "Professional",
  "Limited Edition",
];

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
    // Current month values with realistic e-commerce numbers
    const currentTotalSales = 86161000; // $86.16M
    const currentTotalOrders = 2343165;
    const currentNewCustomers = 520920;
    const currentConversionRate = -0.8;

    // Previous month values with realistic changes
    const previousTotalSales = currentTotalSales / 1.014; // 1.4% increase
    const previousTotalOrders = currentTotalOrders / 1.021; // 2.1% increase
    const previousNewCustomers = currentNewCustomers; // 0% change
    const previousConversionRate = currentConversionRate - 0.7; // 0.7% increase

    return {
      totalSales: {
        current: currentTotalSales,
        previous: Math.round(previousTotalSales),
        percentChange: 1.4,
      },
      totalOrders: {
        current: currentTotalOrders,
        previous: Math.round(previousTotalOrders),
        percentChange: 2.1,
      },
      newCustomers: {
        current: currentNewCustomers,
        previous: Math.round(previousNewCustomers),
        percentChange: 0.0,
      },
      conversionRate: {
        current: currentConversionRate,
        previous: previousConversionRate,
        percentChange: 0.7,
      },
    };
  } catch (error) {
    console.error("Error generating dashboard stats:", error);
    throw error;
  }
}

/**
 * Generate realistic recent orders for an e-commerce store
 */
export async function generateRealOrders(limit: number = 5): Promise<Order[]> {
  try {
    // Create orders with realistic e-commerce data
    const orders: Order[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();

    // Sample order data matching the user's example
    const sampleOrders = [
      {
        id: "ORD-7892",
        customer: "Sarah Johnson",
        product: "Premium Subscription",
        date: format(addDays(today, 0), "MMM dd, yyyy").replace(
          /\d{4}$/,
          "2025"
        ),
        status: "Shipped",
        amount: "$861,610",
      },
      {
        id: "ORD-7891",
        customer: "Michael Chen",
        product: "Gold Package",
        date: format(addDays(today, -1), "MMM dd, yyyy").replace(
          /\d{4}$/,
          "2025"
        ),
        status: "Shipped",
        amount: "$23,713",
      },
      {
        id: "ORD-7890",
        customer: "Emily Wilson",
        product: "Silver Package",
        date: format(addDays(today, -2), "MMM dd, yyyy").replace(
          /\d{4}$/,
          "2025"
        ),
        status: "Processing",
        amount: "$10",
      },
      {
        id: "ORD-7889",
        customer: "David Rodriguez",
        product: "Digital Asset Bundle",
        date: format(addDays(today, -3), "MMM dd, yyyy").replace(
          /\d{4}$/,
          "2025"
        ),
        status: "Shipped",
        amount: "$22",
      },
      {
        id: "ORD-7888",
        customer: "Jennifer Lee",
        product: "Enterprise License",
        date: format(addDays(today, -4), "MMM dd, yyyy").replace(
          /\d{4}$/,
          "2025"
        ),
        status: "Shipped",
        amount: "$6,093",
      },
    ];

    // Return the sample orders limited to the requested amount
    return sampleOrders.slice(0, limit);
  } catch (error) {
    console.error("Error generating orders:", error);
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
    // Sample activity data with e-commerce activities
    const sampleActivities = [
      {
        id: "act-001",
        type: "New customer registered",
        time: "2 minutes ago",
        icon: "user",
      },
      {
        id: "act-002",
        type: "Order #ORD-7891 cancelled",
        time: "15 minutes ago",
        icon: "order",
      },
      {
        id: "act-003",
        type: "Premium Subscription added to store",
        time: "1 hour ago",
        icon: "product",
      },
      {
        id: "act-004",
        type: "New business account created",
        time: "3 hours ago",
        icon: "user",
      },
      {
        id: "act-005",
        type: "Order #ORD-7885 shipped",
        time: "5 hours ago",
        icon: "order",
      },
    ];

    // Return the sample activities limited to the requested amount
    return sampleActivities.slice(0, limit);
  } catch (error) {
    console.error("Error generating activities:", error);
    throw error;
  }
}

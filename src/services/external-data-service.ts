/**
 * Service to fetch real data from external APIs
 * This service attempts to fetch real-world data from public APIs
 * to provide more realistic data for the dashboard
 */

import { format, subDays } from "date-fns";
import { DashboardStats, Order, Activity } from "./dashboard-service";

// Public APIs that don't require authentication
const PUBLIC_APIS = {
  CRYPTO:
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1",
  STOCKS:
    "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSFT&apikey=demo",
  NEWS: "https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=YOUR_API_KEY",
};

/**
 * Fetch real-time cryptocurrency data to use for sales data
 */
export async function fetchCryptoData(
  days: number = 7
): Promise<{ date: string; sales: number }[]> {
  try {
    const response = await fetch(PUBLIC_APIS.CRYPTO);
    if (!response.ok) throw new Error("Failed to fetch crypto data");

    const data = await response.json();

    // Use crypto prices as sales data
    return data.slice(0, days).map((coin: any, index: number) => {
      const date = subDays(new Date(), days - index - 1);
      // Use market cap as "sales" value, scaled down
      const sales = Math.round(coin.market_cap / 10000000);

      return {
        date: format(date, "MMM dd"),
        sales,
      };
    });
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    throw error;
  }
}

/**
 * Generate dashboard stats based on real crypto market data
 */
export async function generateRealDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await fetch(PUBLIC_APIS.CRYPTO);
    if (!response.ok) throw new Error("Failed to fetch crypto data");

    const data = await response.json();

    // Use first 4 cryptocurrencies for our stats
    const bitcoin = data[0];
    const ethereum = data[1];
    const binance = data[2];
    const ripple = data[3];

    // Calculate percent changes
    const calculatePercentChange = (
      current: number,
      previous: number
    ): number => {
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    // Use real price changes for our stats
    return {
      totalSales: {
        current: Math.round(bitcoin.current_price * 1000),
        previous: Math.round(
          (bitcoin.current_price * 1000) /
            (1 + bitcoin.price_change_percentage_24h / 100)
        ),
        percentChange: bitcoin.price_change_percentage_24h,
      },
      totalOrders: {
        current: Math.round(ethereum.total_volume / 10000),
        previous: Math.round(
          ethereum.total_volume /
            10000 /
            (1 + ethereum.price_change_percentage_24h / 100)
        ),
        percentChange: ethereum.price_change_percentage_24h,
      },
      newCustomers: {
        current: Math.round(binance.total_volume / 100000),
        previous: Math.round(
          binance.total_volume /
            100000 /
            (1 + binance.price_change_percentage_24h / 100)
        ),
        percentChange: binance.price_change_percentage_24h,
      },
      conversionRate: {
        current: parseFloat(ripple.price_change_percentage_24h.toFixed(2)),
        previous: parseFloat(
          (
            ripple.price_change_percentage_24h /
            (1 + ripple.price_change_percentage_24h / 100)
          ).toFixed(2)
        ),
        percentChange: ripple.price_change_percentage_24h,
      },
    };
  } catch (error) {
    console.error("Error generating real dashboard stats:", error);
    throw error;
  }
}

/**
 * Generate orders based on cryptocurrency data
 */
export async function generateRealOrders(limit: number = 5): Promise<Order[]> {
  try {
    const response = await fetch(PUBLIC_APIS.CRYPTO);
    if (!response.ok) throw new Error("Failed to fetch crypto data");

    const data = await response.json();

    // Create orders based on crypto data
    const orders: Order[] = data
      .slice(0, limit)
      .map((coin: any, index: number) => {
        const date = subDays(new Date(), index);
        const statuses: (
          | "Completed"
          | "Processing"
          | "Shipped"
          | "Cancelled"
        )[] = ["Completed", "Processing", "Shipped", "Cancelled"];

        // Determine status based on price change
        let status: "Completed" | "Processing" | "Shipped" | "Cancelled";
        if (coin.price_change_percentage_24h > 5) {
          status = "Completed";
        } else if (coin.price_change_percentage_24h > 0) {
          status = "Processing";
        } else if (coin.price_change_percentage_24h > -5) {
          status = "Shipped";
        } else {
          status = "Cancelled";
        }

        const customers = [
          "Sarah Johnson",
          "Michael Chen",
          "Emily Wilson",
          "David Rodriguez",
          "Jennifer Lee",
          "Robert Smith",
          "Lisa Wang",
        ];

        const products = [
          "Premium Subscription",
          "Gold Package",
          "Silver Package",
          "Digital Asset Bundle",
          "Enterprise License",
          "Pro Membership",
          "Starter Kit",
        ];

        return {
          id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          customer: customers[index % customers.length],
          product: `${coin.name} ${products[index % products.length]}`,
          date: format(date, "MMM dd, yyyy"),
          status,
          amount: `$${Math.round(coin.current_price * 10).toLocaleString()}`,
        };
      });

    return orders;
  } catch (error) {
    console.error("Error generating real orders:", error);
    throw error;
  }
}

/**
 * Generate activity based on cryptocurrency data
 */
export async function generateRealActivity(
  limit: number = 5
): Promise<Activity[]> {
  try {
    const response = await fetch(PUBLIC_APIS.CRYPTO);
    if (!response.ok) throw new Error("Failed to fetch crypto data");

    const data = await response.json();

    // Create activity based on crypto data
    const activities: Activity[] = data
      .slice(0, limit)
      .map((coin: any, index: number) => {
        const timeAgo = [
          "2 minutes ago",
          "15 minutes ago",
          "1 hour ago",
          "3 hours ago",
          "5 hours ago",
          "Yesterday",
          "2 days ago",
        ];

        const icons: ("user" | "order" | "product")[] = [
          "user",
          "order",
          "product",
        ];
        const icon = icons[index % icons.length];

        let type = "";
        if (icon === "user") {
          type = `New ${coin.name} investor registered`;
        } else if (icon === "order") {
          type = `${coin.name} purchase ${
            coin.price_change_percentage_24h > 0 ? "completed" : "cancelled"
          }`;
        } else {
          type = `${coin.name} ${
            coin.price_change_percentage_24h > 0
              ? "added to portfolio"
              : "removed from watchlist"
          }`;
        }

        return {
          id: `act-${Math.floor(1000 + Math.random() * 9000)}`,
          type,
          time: timeAgo[index % timeAgo.length],
          icon,
        };
      });

    return activities;
  } catch (error) {
    console.error("Error generating real activity:", error);
    throw error;
  }
}

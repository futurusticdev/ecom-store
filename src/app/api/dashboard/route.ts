import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkDatabaseConnection } from "@/lib/db-check";

// Define types for our data structures
interface Order {
  id: string;
  total: number;
  status: string;
  userId: string | null;
  createdAt: Date;
}

// Define the type for a single unique customer result
interface UniqueCustomer {
  userId: string;
  _count: {
    id: number;
  };
}

export async function GET() {
  try {
    // First check database connection
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.log("Database connection failed");
      return NextResponse.json(
        {
          error: "Database connection failed",
          stats: null,
        },
        { status: 500 }
      );
    }

    // Get total sales from the current month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    // Set time to start/end of day for more accurate comparisons
    oneMonthAgo.setHours(0, 0, 0, 0);
    twoMonthsAgo.setHours(0, 0, 0, 0);

    const now = new Date();
    now.setHours(23, 59, 59, 999);

    // Current month orders (last 30 days)
    let currentMonthOrders: Order[] = [];
    try {
      currentMonthOrders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: oneMonthAgo,
            lte: now,
          },
          NOT: {
            status: "CANCELLED",
          },
        },
      });
    } catch (orderError) {
      console.log("Error fetching current month orders:", orderError);
      return NextResponse.json(
        { error: "Error fetching orders data" },
        { status: 500 }
      );
    }

    const totalSales = currentMonthOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );
    const totalOrders = currentMonthOrders.length;

    // Get new customers (users created in the last month)
    let newCustomers = 0;
    try {
      newCustomers = await prisma.user.count({
        where: {
          createdAt: {
            gte: oneMonthAgo,
            lte: now,
          },
        },
      });
    } catch (customerError) {
      console.log("Error fetching new customers:", customerError);
      return NextResponse.json(
        { error: "Error fetching customer data" },
        { status: 500 }
      );
    }

    // Calculate conversion rate (orders / unique users who placed orders)
    let uniqueCustomers: UniqueCustomer[] = [];
    let totalUsers = 0;

    try {
      // Fix: Use the raw Prisma query to avoid TypeScript errors
      const groupResult = await prisma.$queryRaw<
        Array<{ userId: string; count: number }>
      >`
        SELECT "userId", COUNT("id") as count
        FROM "Order"
        WHERE "userId" IS NOT NULL
        AND "createdAt" >= ${oneMonthAgo}
        AND "createdAt" <= ${now}
        GROUP BY "userId"
      `;

      // Transform the raw query result to match our UniqueCustomer interface
      uniqueCustomers = groupResult.map((result) => ({
        userId: result.userId,
        _count: {
          id: Number(result.count),
        },
      }));

      totalUsers = await prisma.user.count({
        where: {
          createdAt: {
            lte: now,
          },
        },
      });
    } catch (conversionError) {
      console.log("Error calculating conversion rate:", conversionError);
      return NextResponse.json(
        { error: "Error calculating conversion metrics" },
        { status: 500 }
      );
    }

    const conversionRate =
      totalUsers > 0 ? (uniqueCustomers.length / totalUsers) * 100 : 0;

    // Get previous month's data for comparison
    let previousMonthOrders: Order[] = [];
    let previousMonthNewCustomers = 0;
    let previousMonthUniqueCustomers: UniqueCustomer[] = [];
    let previousMonthTotalUsers = 0;

    try {
      previousMonthOrders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: twoMonthsAgo,
            lt: oneMonthAgo,
          },
          NOT: {
            status: "CANCELLED",
          },
        },
      });

      previousMonthNewCustomers = await prisma.user.count({
        where: {
          createdAt: {
            gte: twoMonthsAgo,
            lt: oneMonthAgo,
          },
        },
      });

      // Calculate previous month's conversion rate
      // Fix: Use the raw Prisma query to avoid TypeScript errors
      const previousGroupResult = await prisma.$queryRaw<
        Array<{ userId: string; count: number }>
      >`
        SELECT "userId", COUNT("id") as count
        FROM "Order"
        WHERE "userId" IS NOT NULL
        AND "createdAt" >= ${twoMonthsAgo}
        AND "createdAt" < ${oneMonthAgo}
        GROUP BY "userId"
      `;

      // Transform the raw query result to match our UniqueCustomer interface
      previousMonthUniqueCustomers = previousGroupResult.map((result) => ({
        userId: result.userId,
        _count: {
          id: Number(result.count),
        },
      }));

      previousMonthTotalUsers = await prisma.user.count({
        where: {
          createdAt: {
            lt: oneMonthAgo,
          },
        },
      });
    } catch (previousMonthError) {
      console.log("Error fetching previous month data:", previousMonthError);
      return NextResponse.json(
        { error: "Error fetching comparison data" },
        { status: 500 }
      );
    }

    const previousMonthSales = previousMonthOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );
    const previousMonthOrderCount = previousMonthOrders.length;

    const previousMonthConversionRate =
      previousMonthTotalUsers > 0
        ? (previousMonthUniqueCustomers.length / previousMonthTotalUsers) * 100
        : 0;

    // Calculate percentage changes
    const salesChange =
      previousMonthSales > 0
        ? ((totalSales - previousMonthSales) / previousMonthSales) * 100
        : totalSales > 0
        ? 100
        : 0; // If previous month was 0 but we have sales now, that's a 100% increase

    const ordersChange =
      previousMonthOrderCount > 0
        ? ((totalOrders - previousMonthOrderCount) / previousMonthOrderCount) *
          100
        : totalOrders > 0
        ? 100
        : 0; // If previous month was 0 but we have orders now, that's a 100% increase

    const customersChange =
      previousMonthNewCustomers > 0
        ? ((newCustomers - previousMonthNewCustomers) /
            previousMonthNewCustomers) *
          100
        : newCustomers > 0
        ? 100
        : 0; // If previous month was 0 but we have customers now, that's a 100% increase

    const conversionRateChange =
      previousMonthConversionRate > 0
        ? conversionRate - previousMonthConversionRate
        : conversionRate > 0
        ? conversionRate
        : 0; // If previous month was 0 but we have conversion now, use current rate

    // Add debug logging
    console.log("===== DASHBOARD STATS DEBUG =====");
    console.log(
      `Date ranges: Current (${oneMonthAgo.toISOString().split("T")[0]} to ${
        now.toISOString().split("T")[0]
      }), Previous (${twoMonthsAgo.toISOString().split("T")[0]} to ${
        oneMonthAgo.toISOString().split("T")[0]
      })`
    );
    console.log("Current month:");
    console.log(`- Total sales: ${totalSales}`);
    console.log(`- Total orders: ${totalOrders}`);
    console.log(`- New customers: ${newCustomers}`);
    console.log(`- Conversion rate: ${conversionRate.toFixed(1)}%`);
    console.log("Previous month:");
    console.log(`- Previous month sales: ${previousMonthSales}`);
    console.log(`- Previous month orders: ${previousMonthOrderCount}`);
    console.log(`- Previous month new customers: ${previousMonthNewCustomers}`);
    console.log(
      `- Previous month conversion rate: ${previousMonthConversionRate.toFixed(
        1
      )}%`
    );
    console.log("Calculated percentage changes:");
    console.log(`- Sales change: ${salesChange.toFixed(1)}%`);
    console.log(`- Orders change: ${ordersChange.toFixed(1)}%`);
    console.log(`- Customers change: ${customersChange.toFixed(1)}%`);
    console.log(
      `- Conversion rate change: ${conversionRateChange.toFixed(1)}%`
    );
    console.log("================================");

    return NextResponse.json({
      stats: {
        totalSales: {
          value: totalSales,
          change: salesChange.toFixed(1),
        },
        totalOrders: {
          value: totalOrders,
          change: ordersChange.toFixed(1),
        },
        newCustomers: {
          value: newCustomers,
          change: customersChange.toFixed(1),
        },
        conversionRate: {
          value: conversionRate.toFixed(1),
          change: conversionRateChange.toFixed(1),
        },
      },
    });
  } catch (error) {
    // Fix for Next.js 15 error handling issue
    if (error instanceof Error) {
      console.log("Error stack:", error.stack);
    } else {
      console.log("Unknown error:", error);
    }

    return NextResponse.json(
      { error: "Error fetching dashboard statistics" },
      { status: 500 }
    );
  } finally {
    // Always disconnect from the database to prevent connection pool issues
    await prisma.$disconnect().catch((err) => {
      console.log("Error disconnecting from database:", err);
    });
  }
}

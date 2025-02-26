import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkDatabaseConnection } from "@/lib/db-check";

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

    // Get total sales
    let orders = [];
    try {
      orders = await prisma.order.findMany({
        where: {
          NOT: {
            status: "CANCELLED",
          },
        },
      });
    } catch (orderError) {
      console.log("Error fetching orders:", orderError);
      return NextResponse.json(
        { error: "Error fetching orders data" },
        { status: 500 }
      );
    }

    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);

    // Get total orders count
    const totalOrders = orders.length;

    // Get new customers (users created in the last month)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    let newCustomers = 0;
    try {
      newCustomers = await prisma.user.count({
        where: {
          emailVerified: {
            gte: oneMonthAgo,
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
    let uniqueCustomers = [];
    let totalUsers = 0;

    try {
      uniqueCustomers = await prisma.order.groupBy({
        by: ["userId"],
        _count: {
          id: true,
        },
      });

      totalUsers = await prisma.user.count();
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
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    let previousMonthOrders = [];
    let previousMonthNewCustomers = 0;
    let previousMonthUniqueCustomers = [];
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
          emailVerified: {
            gte: twoMonthsAgo,
            lt: oneMonthAgo,
          },
        },
      });

      // Calculate previous month's conversion rate
      previousMonthUniqueCustomers = await prisma.order.groupBy({
        by: ["userId"],
        where: {
          createdAt: {
            gte: twoMonthsAgo,
            lt: oneMonthAgo,
          },
        },
        _count: {
          id: true,
        },
      });

      previousMonthTotalUsers = await prisma.user.count({
        where: {
          emailVerified: {
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
        : 0;

    const ordersChange =
      previousMonthOrderCount > 0
        ? ((totalOrders - previousMonthOrderCount) / previousMonthOrderCount) *
          100
        : 0;

    const customersChange =
      previousMonthNewCustomers > 0
        ? ((newCustomers - previousMonthNewCustomers) /
            previousMonthNewCustomers) *
          100
        : 0;

    const conversionRateChange =
      previousMonthConversionRate > 0
        ? conversionRate - previousMonthConversionRate
        : 0;

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

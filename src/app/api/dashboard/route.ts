import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get total sales
    const orders = await prisma.order.findMany({
      where: {
        NOT: {
          status: "CANCELLED",
        },
      },
    });

    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);

    // Get total orders count
    const totalOrders = orders.length;

    // Get new customers (users created in the last month)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const newCustomers = await prisma.user.count({
      where: {
        createdAt: {
          gte: oneMonthAgo,
        },
      },
    });

    // Calculate conversion rate (orders / unique users who placed orders)
    const uniqueCustomers = await prisma.order.groupBy({
      by: ["userId"],
      _count: {
        id: true,
      },
    });

    const totalUsers = await prisma.user.count();
    const conversionRate =
      totalUsers > 0 ? (uniqueCustomers.length / totalUsers) * 100 : 0;

    // Get previous month's data for comparison
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const previousMonthOrders = await prisma.order.findMany({
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

    const previousMonthSales = previousMonthOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );
    const previousMonthOrderCount = previousMonthOrders.length;

    const previousMonthNewCustomers = await prisma.user.count({
      where: {
        createdAt: {
          gte: twoMonthsAgo,
          lt: oneMonthAgo,
        },
      },
    });

    // Calculate previous month's conversion rate
    const previousMonthUniqueCustomers = await prisma.order.groupBy({
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

    const previousMonthTotalUsers = await prisma.user.count({
      where: {
        createdAt: {
          lt: oneMonthAgo,
        },
      },
    });

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
    console.error("Error fetching dashboard stats:", { error });
    return NextResponse.json(
      { error: "Error fetching dashboard statistics" },
      { status: 500 }
    );
  }
}

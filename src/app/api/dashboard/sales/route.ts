import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7d";

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    // Get all orders within the date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        NOT: {
          status: "CANCELLED",
        },
      },
      select: {
        id: true,
        total: true,
        createdAt: true,
      },
    });

    // Group orders by date
    const salesByDate = new Map();

    // Initialize all dates in the range with zero sales
    const dateIterator = new Date(startDate);
    while (dateIterator <= endDate) {
      const dateString = dateIterator.toISOString().split("T")[0];
      salesByDate.set(dateString, 0);
      dateIterator.setDate(dateIterator.getDate() + 1);
    }

    // Sum up sales for each date
    orders.forEach((order) => {
      const dateString = order.createdAt.toISOString().split("T")[0];
      const currentTotal = salesByDate.get(dateString) || 0;
      salesByDate.set(dateString, currentTotal + order.total);
    });

    // Convert to array format for the chart
    const salesData = Array.from(salesByDate.entries())
      .map(([date, amount]) => ({
        date,
        amount,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate total sales for the period
    const totalSales = salesData.reduce((sum, item) => sum + item.amount, 0);

    // Calculate average daily sales
    const dayCount = salesData.length;
    const averageDailySales = dayCount > 0 ? totalSales / dayCount : 0;

    // Find peak sales day
    const peakSalesDay = salesData.reduce(
      (max, item) => (item.amount > max.amount ? item : max),
      { date: "", amount: 0 }
    );

    return NextResponse.json({
      salesData,
      summary: {
        totalSales,
        averageDailySales,
        peakSalesDay: {
          date: peakSalesDay.date,
          amount: peakSalesDay.amount,
        },
        period,
      },
    });
  } catch (error) {
    console.error("Error fetching sales data:", { error });
    return NextResponse.json(
      { error: "Error fetching sales data" },
      { status: 500 }
    );
  }
}

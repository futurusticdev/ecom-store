import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 5;

    // Test database connection first
    try {
      await prisma.$connect();
    } catch (connectionError) {
      console.error("Database connection error:", { connectionError });
      return NextResponse.json(
        { error: "Database connection failed", activities: [] },
        { status: 500 }
      );
    }

    // Get recent user registrations
    let recentUsers = [];
    try {
      recentUsers = await prisma.user.findMany({
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      });
    } catch (userError) {
      console.error("Error fetching recent users:", { userError });
      // Continue with empty array
    }

    // Get recent orders
    let recentOrders = [];
    try {
      recentOrders = await prisma.order.findMany({
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      });
    } catch (orderError) {
      console.error("Error fetching recent orders:", { orderError });
      // Continue with empty array
    }

    // Get recent reviews
    let recentReviews = [];
    try {
      recentReviews = await prisma.review.findMany({
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          rating: true,
          createdAt: true,
          product: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch (reviewError) {
      console.error("Error fetching recent reviews:", { reviewError });
      // Continue with empty array
    }

    // Combine and sort all activities
    const activities = [
      ...recentUsers.map((user) => ({
        id: `user-${user.id}`,
        type: "NEW_USER",
        message: `New customer ${user.name || "Anonymous"} registered`,
        timestamp: user.createdAt,
        data: { userId: user.id },
      })),
      ...recentOrders.map((order) => ({
        id: `order-${order.id}`,
        type: "ORDER_STATUS",
        message: `Order #${order.id
          .substring(0, 8)
          .toUpperCase()} ${order.status.toLowerCase()}`,
        timestamp: order.createdAt,
        data: { orderId: order.id, status: order.status },
      })),
      ...recentReviews.map((review) => ({
        id: `review-${review.id}`,
        type: "NEW_REVIEW",
        message: `${review.user?.name || "Anonymous"} left a ${
          review.rating
        }-star review on ${review.product?.name || "a product"}`,
        timestamp: review.createdAt,
        data: { reviewId: review.id, rating: review.rating },
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    // Return empty array if no activities found
    if (activities.length === 0) {
      return NextResponse.json({
        activities: [],
        message: "No recent activities found",
      });
    }

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching recent activity:", { error });
    return NextResponse.json(
      { error: "Error fetching recent activity", activities: [] },
      { status: 500 }
    );
  } finally {
    // Disconnect from the database to prevent connection pool issues
    await prisma.$disconnect();
  }
}

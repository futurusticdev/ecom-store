import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 5;

    // Get recent user registrations
    const recentUsers = await prisma.user.findMany({
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

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
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

    // Get recent reviews
    const recentReviews = await prisma.review.findMany({
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
        message: `${review.user.name || "Anonymous"} left a ${
          review.rating
        }-star review on ${review.product.name}`,
        timestamp: review.createdAt,
        data: { reviewId: review.id, rating: review.rating },
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json(
      { error: "Error fetching recent activity" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 5;

    // Get recent orders with product and user information
    const recentOrders = await prisma.order.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    });

    // Transform the data to a more usable format for the frontend
    const formattedOrders = recentOrders.map((order) => ({
      id: order.id,
      customer: {
        name: order.user.name || "Anonymous",
        email: order.user.email,
        image: order.user.image,
      },
      status: order.status,
      total: order.total,
      date: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        image: item.product.images[0] || null,
      })),
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error("Error fetching recent orders:", { error });
    return NextResponse.json(
      { error: "Error fetching recent orders" },
      { status: 500 }
    );
  }
}

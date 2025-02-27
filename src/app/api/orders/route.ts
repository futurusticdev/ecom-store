import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma, OrderStatus, PaymentStatus } from "@prisma/client";

// Utility function to validate and map status values
const mapToOrderStatus = (status: string | null): OrderStatus | undefined => {
  if (!status || status === "All Status") return undefined;

  // Check if the value is a valid OrderStatus enum value
  const validStatuses = Object.values(OrderStatus) as string[];

  // Try to normalize the status (uppercase for enum matching)
  const normalizedStatus = status.toUpperCase();

  if (validStatuses.includes(normalizedStatus)) {
    return normalizedStatus as OrderStatus;
  }

  // Map common UI display values to valid enum values
  switch (status.toLowerCase()) {
    case "pending":
    case "processing":
      return OrderStatus.PROCESSING;
    case "shipped":
      return OrderStatus.SHIPPED;
    case "delivered":
    case "completed":
      return OrderStatus.DELIVERED;
    case "cancelled":
    case "canceled":
      return OrderStatus.CANCELLED;
    default:
      return undefined;
  }
};

// Utility function to validate and map payment status values
const mapToPaymentStatus = (
  status: string | null
): PaymentStatus | undefined => {
  if (!status || status === "Payment Status") return undefined;

  // Check if the value is a valid PaymentStatus enum value
  const validStatuses = Object.values(PaymentStatus) as string[];

  // Try to normalize the status (uppercase for enum matching)
  const normalizedStatus = status.toUpperCase();

  if (validStatuses.includes(normalizedStatus)) {
    return normalizedStatus as PaymentStatus;
  }

  // Map common UI display values to valid enum values
  switch (status.toLowerCase()) {
    case "pending":
      return PaymentStatus.PENDING;
    case "paid":
      return PaymentStatus.PAID;
    case "refunded":
      return PaymentStatus.REFUNDED;
    case "failed":
      return PaymentStatus.FAILED;
    default:
      return undefined;
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse pagination params
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Parse filter params
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const date = searchParams.get("date");
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build filter object
    const filter: Prisma.OrderWhereInput = {};

    // Use the mapping function to get a valid OrderStatus enum value
    const orderStatus = mapToOrderStatus(status);
    if (orderStatus) {
      filter.status = orderStatus;
    }

    // Use the mapping function to get a valid PaymentStatus enum value
    const orderPaymentStatus = mapToPaymentStatus(paymentStatus);
    if (orderPaymentStatus) {
      filter.paymentStatus = orderPaymentStatus;
    }

    if (date) {
      const dateObj = new Date(date);
      filter.createdAt = {
        gte: new Date(dateObj.setHours(0, 0, 0, 0)),
        lte: new Date(dateObj.setHours(23, 59, 59, 999)),
      };
    }

    // Build sort object
    const orderBy: Prisma.OrderOrderByWithRelationInput = {};
    if (sortBy === "date") {
      orderBy.createdAt = sortOrder as Prisma.SortOrder;
    } else if (sortBy === "total") {
      orderBy.total = sortOrder as Prisma.SortOrder;
    } else if (sortBy === "status") {
      orderBy.status = sortOrder as Prisma.SortOrder;
    } else {
      orderBy.createdAt = "desc"; // Default sort
    }

    // Get count of total orders for pagination
    const totalOrders = await prisma.order.count({
      where: filter,
    });

    // Get orders with filter and pagination
    const orders = await prisma.order.findMany({
      where: filter,
      skip,
      take: limit,
      orderBy,
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
    const formattedOrders = orders.map((order) => {
      // Calculate the actual total based on current item quantities and prices
      const calculatedTotal = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return {
        id: order.id,
        orderId: `#ORD-${order.id.toString().padStart(4, "0")}`,
        customer: {
          name: order.user?.name || "Anonymous",
          email: order.user?.email || null,
          image: order.user?.image || null,
        },
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: calculatedTotal, // Use the calculated total instead of order.total
        date: order.createdAt,
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          image: item.product.images[0] || null,
        })),
      };
    });

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        total: totalOrders,
        page,
        limit,
        pages: Math.ceil(totalOrders / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Error fetching orders" },
      { status: 500 }
    );
  }
}

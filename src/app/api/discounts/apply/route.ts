import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

// Schema for applying a discount to an order
const applyDiscountSchema = z.object({
  orderId: z.string(),
  discountId: z.string(),
  discountAmount: z.number().min(0),
});

// POST /api/discounts/apply - Apply a discount to an order
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();

    // Validate request body
    const validatedData = applyDiscountSchema.parse(body);

    // Find order
    const order = await prisma.order.findUnique({
      where: {
        id: validatedData.orderId,
      },
      include: {
        user: true,
      },
    });

    // Check if order exists and belongs to the user
    if (!order || order.user.email !== session.user.email) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Find discount
    const discount = await prisma.discount.findUnique({
      where: {
        id: validatedData.discountId,
      },
    });

    // Check if discount exists
    if (!discount) {
      return NextResponse.json(
        { error: "Discount not found" },
        { status: 404 }
      );
    }

    // Check if discount is active
    if (!discount.isActive) {
      return NextResponse.json(
        { error: "Discount code is inactive" },
        { status: 400 }
      );
    }

    // Check if discount has expired
    if (discount.expiryDate && new Date(discount.expiryDate) < new Date()) {
      return NextResponse.json(
        { error: "Discount code has expired" },
        { status: 400 }
      );
    }

    // Check if discount has reached maximum uses
    if (discount.usedCount >= discount.maxUses) {
      return NextResponse.json(
        { error: "Discount code has reached maximum uses" },
        { status: 400 }
      );
    }

    // Update order with discount
    const updatedOrder = await prisma.order.update({
      where: {
        id: validatedData.orderId,
      },
      data: {
        discountId: validatedData.discountId,
        discountAmount: validatedData.discountAmount,
        total: order.total - validatedData.discountAmount,
      },
    });

    // Increment discount used count
    await prisma.discount.update({
      where: {
        id: validatedData.discountId,
      },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error applying discount:", error);
    return NextResponse.json(
      { error: "Failed to apply discount" },
      { status: 500 }
    );
  }
}

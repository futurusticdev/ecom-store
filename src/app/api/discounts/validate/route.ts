import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";

// Schema for validating a discount code
const validateDiscountSchema = z.object({
  code: z.string().min(1),
  cartTotal: z.number().min(0),
  productCategories: z.array(z.string()).optional(),
});

// POST /api/discounts/validate - Validate a discount code
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();

    // Validate request body
    const validatedData = validateDiscountSchema.parse(body);

    // Find discount by code
    const discount = await prisma.discount.findUnique({
      where: {
        code: validatedData.code,
      },
    });

    // Check if discount exists
    if (!discount) {
      return NextResponse.json(
        { valid: false, error: "Invalid discount code" },
        { status: 400 }
      );
    }

    // Check if discount is active
    if (!discount.isActive) {
      return NextResponse.json(
        { valid: false, error: "Discount code is inactive" },
        { status: 400 }
      );
    }

    // Check if discount has expired
    if (discount.expiryDate && new Date(discount.expiryDate) < new Date()) {
      return NextResponse.json(
        { valid: false, error: "Discount code has expired" },
        { status: 400 }
      );
    }

    // Check if discount has reached maximum uses
    if (discount.usedCount >= discount.maxUses) {
      return NextResponse.json(
        { valid: false, error: "Discount code has reached maximum uses" },
        { status: 400 }
      );
    }

    // Check if cart total meets minimum purchase requirement
    if (validatedData.cartTotal < discount.minPurchase) {
      return NextResponse.json(
        {
          valid: false,
          error: `Minimum purchase amount of $${discount.minPurchase.toFixed(
            2
          )} required`,
        },
        { status: 400 }
      );
    }

    // Check if discount applies to product categories
    if (
      discount.productCategory &&
      validatedData.productCategories &&
      !validatedData.productCategories.includes(discount.productCategory)
    ) {
      return NextResponse.json(
        {
          valid: false,
          error: `Discount only applies to ${discount.productCategory} products`,
        },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;

    switch (discount.type) {
      case "PERCENTAGE":
        discountAmount = (validatedData.cartTotal * discount.value) / 100;
        break;
      case "FIXED":
        discountAmount = Math.min(discount.value, validatedData.cartTotal);
        break;
      case "SHIPPING":
        // Assuming shipping is a fixed cost that would be added to the cart total
        discountAmount = discount.value;
        break;
    }

    // Return discount details
    return NextResponse.json({
      valid: true,
      discount: {
        id: discount.id,
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { valid: false, error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error validating discount:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate discount" },
      { status: 500 }
    );
  }
}

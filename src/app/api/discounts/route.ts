import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Schema for creating a discount
const createDiscountSchema = z.object({
  code: z.string().min(3).max(20),
  type: z.enum(["PERCENTAGE", "FIXED", "SHIPPING"]),
  value: z.number().min(0),
  minPurchase: z.number().min(0).default(0),
  maxUses: z.number().int().min(1).default(100),
  expiryDate: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  productCategory: z.string().optional().nullable(),
});

// GET /api/discounts - Get all discounts
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get("isActive");
    const code = searchParams.get("code");

    // Build filter object
    const filter: Prisma.DiscountWhereInput = {};
    if (isActive !== null) {
      filter.isActive = isActive === "true";
    }
    if (code) {
      filter.code = {
        contains: code,
        mode: "insensitive",
      };
    }

    // Get discounts from database
    const discounts = await prisma.discount.findMany({
      where: filter,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(discounts);
  } catch (error) {
    console.error("Error fetching discounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch discounts" },
      { status: 500 }
    );
  }
}

// POST /api/discounts - Create a new discount
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();

    // Validate request body
    const validatedData = createDiscountSchema.parse(body);

    // Check if discount code already exists
    const existingDiscount = await prisma.discount.findUnique({
      where: {
        code: validatedData.code,
      },
    });

    if (existingDiscount) {
      return NextResponse.json(
        { error: "Discount code already exists" },
        { status: 400 }
      );
    }

    // Create discount
    const discount = await prisma.discount.create({
      data: {
        code: validatedData.code,
        type: validatedData.type,
        value: validatedData.value,
        minPurchase: validatedData.minPurchase,
        maxUses: validatedData.maxUses,
        expiryDate: validatedData.expiryDate
          ? new Date(validatedData.expiryDate)
          : null,
        isActive: validatedData.isActive,
        productCategory: validatedData.productCategory,
      },
    });

    return NextResponse.json(discount, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating discount:", error);
    return NextResponse.json(
      { error: "Failed to create discount" },
      { status: 500 }
    );
  }
}

// DELETE /api/discounts - Delete a discount
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get discount ID from query parameters
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Discount ID is required" },
        { status: 400 }
      );
    }

    // Delete discount
    await prisma.discount.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting discount:", error);
    return NextResponse.json(
      { error: "Failed to delete discount" },
      { status: 500 }
    );
  }
}

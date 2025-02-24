import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const colors = searchParams.get("colors")?.split(",") || [];
    const sizes = searchParams.get("sizes")?.split(",") || [];
    const minPrice = Number(searchParams.get("minPrice")) || undefined;
    const maxPrice = Number(searchParams.get("maxPrice")) || undefined;

    // Build the where clause based on filters
    const where: any = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
      ],
    };

    // Add category filter
    if (category && category !== "All") {
      where.category = category;
    }

    // Add color filter
    if (colors.length > 0) {
      where.color = { in: colors };
    }

    // Add size filter
    if (sizes.length > 0) {
      where.size = { in: sizes };
    }

    // Add price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit results to 50 products
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { error: "Error searching products" },
      { status: 500 }
    );
  }
}

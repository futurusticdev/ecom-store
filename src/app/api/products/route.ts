import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

// Define type with relations
type ProductWithTags = Prisma.ProductGetPayload<{
  include: {
    category: true;
    tags: {
      include: {
        tag: true;
      };
    };
  };
}>;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 12;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const tags = searchParams.get("tags")?.split(",") || [];
    const minPrice = Number(searchParams.get("minPrice")) || undefined;
    const maxPrice = Number(searchParams.get("maxPrice")) || undefined;
    const sort = searchParams.get("sort") || "createdAt.desc";

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      inStock: true,
    };

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Add category filter
    if (category) {
      where.categoryId = category;
    }

    // Add tags filter
    if (tags.length > 0) {
      where.tags = {
        some: {
          tagId: {
            in: tags,
          },
        },
      };
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

    // Parse sort parameter
    const [sortField, sortOrder] = sort.split(".");
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortField]: sortOrder.toLowerCase() as Prisma.SortOrder,
    };

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    // Get products with proper typing
    const products = (await prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })) as ProductWithTags[];

    // Transform response with proper typing
    const transformedProducts = products.map((product) => ({
      ...product,
      tags: product.tags.map((pt) => pt.tag),
    }));

    return NextResponse.json({
      products: transformedProducts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        products: [],
        total: 0,
        page: 1,
        totalPages: 0,
        error: "Error fetching products",
      },
      { status: 500 }
    );
  }
}

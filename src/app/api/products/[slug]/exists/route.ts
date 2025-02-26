import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    console.log(
      `API route (exists): Checking if product exists with slug/id: ${slug}`
    );

    if (!slug) {
      console.error("API route (exists): Missing slug parameter");
      return NextResponse.json(
        { exists: false, error: "Missing parameter" },
        { status: 400 }
      );
    }

    // First try to find by ID
    console.log(`API route (exists): Trying to find product by ID: ${slug}`);
    let product = await prisma.product.findUnique({
      where: {
        id: slug,
      },
      select: { id: true, name: true },
    });

    // If not found by ID, try to find by slug
    if (!product) {
      console.log(
        `API route (exists): Product not found by ID, trying slug: ${slug}`
      );
      product = await prisma.product.findUnique({
        where: {
          slug: slug,
        },
        select: { id: true, name: true },
      });
    }

    if (!product) {
      console.log(
        `API route (exists): Product not found with slug/id: ${slug}`
      );
      return NextResponse.json({ exists: false, product: null });
    }

    console.log(`API route (exists): Product found: ${product.id}`);
    return NextResponse.json({ exists: true, product });
  } catch (error) {
    // Safely handle the error logging
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      "API route (exists): Error checking product:",
      errorMessage,
      error
    );

    // Return a properly structured error response
    return NextResponse.json(
      { exists: false, error: errorMessage },
      { status: 500 }
    );
  }
}

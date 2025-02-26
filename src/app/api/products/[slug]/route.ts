import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    console.log(`API route: Fetching product with slug/id: ${slug}`);
    console.log(`API route: Request URL: ${req.url}`);
    console.log(`API route: Request method: ${req.method}`);
    console.log(
      `API route: Request headers:`,
      Object.fromEntries(req.headers.entries())
    );

    if (!slug) {
      console.error("API route: Missing slug parameter");
      return NextResponse.json({ error: "Missing parameter" }, { status: 400 });
    }

    // First try to find by ID
    console.log(`API route: Trying to find product by ID: ${slug}`);
    let product = await prisma.product.findUnique({
      where: {
        id: slug,
      },
      include: {
        category: true,
      },
    });

    // If not found by ID, try to find by slug
    if (!product) {
      console.log(`API route: Product not found by ID, trying slug: ${slug}`);
      product = await prisma.product.findUnique({
        where: {
          slug: slug,
        },
        include: {
          category: true,
        },
      });
    }

    if (!product) {
      console.error(`API route: Product not found with slug/id: ${slug}`);

      // Check if the product exists at all in the database
      const allProducts = await prisma.product.findMany({
        select: { id: true, name: true, slug: true },
        take: 5,
      });

      console.log(`API route: First 5 products in database:`, allProducts);

      return NextResponse.json(
        {
          error: "Product not found",
          requestedId: slug,
          availableProducts: allProducts,
        },
        { status: 404 }
      );
    }

    console.log(`API route: Product found: ${product.id}`);
    return NextResponse.json(product);
  } catch (error) {
    // Safely handle the error logging
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("API route: Error fetching product:", errorMessage, error);

    // Return a properly structured error response
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    if (!slug) {
      return NextResponse.json({ error: "Missing parameter" }, { status: 400 });
    }

    // First try to find by ID
    let existingProduct = await prisma.product.findUnique({
      where: { id: slug },
    });

    // If not found by ID, try to find by slug
    if (!existingProduct) {
      existingProduct = await prisma.product.findUnique({
        where: { slug: slug },
      });
    }

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await req.json();

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: {
        id: existingProduct.id,
      },
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        images: Array.isArray(body.images) ? body.images : [],
        categoryId: body.categoryId,
        inStock: body.isAvailableForSale === true,
        // Make sure to handle other fields from your schema
        // If slug needs to be updated, generate it from the name
        slug: body.slug || existingProduct.slug,
        // Handle any other fields that need updating
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error updating product:", errorMessage);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

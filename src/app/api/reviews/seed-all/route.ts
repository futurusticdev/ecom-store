import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateFakeReviews } from "../seed-data";

// This endpoint seeds fake reviews for all products or a specific number of products
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const countParam = searchParams.get("count");

    // Number of products to seed (all by default)
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    // Number of reviews per product
    const reviewsPerProduct = countParam ? parseInt(countParam, 10) : 5;

    // Get all products or a limited number
    const products = await prisma.product.findMany({
      take: limit,
      select: {
        id: true,
        name: true,
      },
    });

    if (products.length === 0) {
      return NextResponse.json(
        { error: "No products found in the database" },
        { status: 404 }
      );
    }

    const results = [];

    // For each product, seed reviews
    for (const product of products) {
      // Generate fake reviews
      const reviews = generateFakeReviews(product.id, reviewsPerProduct);

      // Save each review to the database
      for (const review of reviews) {
        await fetch(`${req.nextUrl.origin}/api/reviews`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Special header to bypass authentication in the reviews POST handler
            "X-Seed-Authorization": "seeding-reviews-bypass-auth",
          },
          body: JSON.stringify({
            productId: review.productId,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            userId: review.userId,
            isVerified: review.isVerified,
            createdAt: review.createdAt,
          }),
        });
      }

      results.push({
        productId: product.id,
        productName: product.name,
        reviewsAdded: reviewsPerProduct,
      });
    }

    return NextResponse.json({
      message: `Successfully seeded reviews for ${products.length} products`,
      details: results,
    });
  } catch (error) {
    console.error("Error seeding reviews for all products:", error);
    return NextResponse.json(
      {
        error: "Failed to seed reviews",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

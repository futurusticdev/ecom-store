import { NextRequest, NextResponse } from "next/server";
import { generateFakeReviews } from "../seed-data";

// Mock API endpoint for getting fake reviews data
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const count = parseInt(searchParams.get("count") || "8", 10);

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Generate fake reviews without saving to database
    const reviews = generateFakeReviews(productId, count);

    // Calculate average rating
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    // Count reviews by rating
    const ratingCounts = {
      1: reviews.filter((review) => review.rating === 1).length,
      2: reviews.filter((review) => review.rating === 2).length,
      3: reviews.filter((review) => review.rating === 3).length,
      4: reviews.filter((review) => review.rating === 4).length,
      5: reviews.filter((review) => review.rating === 5).length,
    };

    return NextResponse.json({
      reviews,
      totalReviews,
      averageRating,
      ratingCounts,
    });
  } catch (error) {
    console.error("Error generating mock reviews:", error);
    return NextResponse.json(
      {
        error: "Failed to generate mock reviews",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

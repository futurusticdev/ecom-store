import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema for review validation
const reviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  title: z.string().max(100, "Title cannot exceed 100 characters").optional(),
  comment: z
    .string()
    .max(1000, "Review cannot exceed 1000 characters")
    .optional(),
});

// Get reviews for a product
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get reviews for the specified product with user information
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

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
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// Create a review
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check for seeding bypass header
    const isSeedRequest =
      req.headers.get("X-Seed-Authorization") === "seeding-reviews-bypass-auth";

    // Normal authentication check for non-seed requests
    let session;
    if (!isSeedRequest) {
      session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Validate request body
    const validationResult = reviewSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid review data",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { productId, rating, title, comment } = validationResult.data;

    let userId;

    // Handle user ID differently for seed requests
    if (isSeedRequest) {
      userId = body.userId; // Use the provided user ID directly
    } else if (session) {
      // Get user ID from session
      const user = await prisma.user.findUnique({
        where: { email: session.user.email as string },
        select: { id: true },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if user has already reviewed this product (skip for seed requests)
      const existingReview = await prisma.review.findFirst({
        where: {
          userId: user.id,
          productId,
        },
      });

      if (existingReview) {
        return NextResponse.json(
          { error: "You have already reviewed this product" },
          { status: 400 }
        );
      }

      userId = user.id;
    }

    // For seed requests, we don't need to check if the user has purchased the product
    const hasPurchased = isSeedRequest
      ? true
      : await prisma.orderItem.findFirst({
          where: {
            productId,
            order: {
              userId,
              status: { in: ["DELIVERED"] },
            },
          },
        });

    // Create the review with optional custom created date for seeding
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        title,
        comment,
        isVerified: isSeedRequest ? body.isVerified ?? true : !!hasPurchased,
        ...(isSeedRequest && body.createdAt
          ? { createdAt: new Date(body.createdAt) }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

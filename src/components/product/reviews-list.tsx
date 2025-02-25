"use client";

import { useState, useEffect, useCallback } from "react";
import { RatingSummary } from "./rating-summary";
import { ReviewItem } from "./review-item";
import { ReviewForm } from "./review-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

// Define Review type to replace any
interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
}

interface ReviewsListProps {
  productId: string;
}

export function ReviewsList({ productId }: ReviewsListProps) {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  const [activeTab, setActiveTab] = useState("read");
  const { data: session } = useSession();

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews?productId=${productId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();

      // If no reviews exist, fetch mock data instead
      if (data.totalReviews === 0) {
        try {
          const mockResponse = await fetch(
            `/api/reviews/mock?productId=${productId}`
          );
          if (mockResponse.ok) {
            const mockData = await mockResponse.json();
            setReviews(mockData.reviews);
            setTotalReviews(mockData.totalReviews);
            setAverageRating(mockData.averageRating);
            setRatingCounts(mockData.ratingCounts);
            // Store in sessionStorage to keep the same mock reviews during the session
            sessionStorage.setItem(
              `mock-reviews-${productId}`,
              JSON.stringify(mockData)
            );
            setLoading(false);
            return;
          }
        } catch (mockError) {
          console.error("Error fetching mock reviews:", mockError);
          // Continue with real data (empty reviews) if mock fails
        }
      }

      setReviews(data.reviews);
      setTotalReviews(data.totalReviews);
      setAverageRating(data.averageRating);
      setRatingCounts(data.ratingCounts);
    } catch (error) {
      console.error("Error fetching reviews:", error);

      // If API call fails, try to load mock data from sessionStorage if available
      const cachedMockData = sessionStorage.getItem(
        `mock-reviews-${productId}`
      );
      if (cachedMockData) {
        try {
          const mockData = JSON.parse(cachedMockData);
          setReviews(mockData.reviews);
          setTotalReviews(mockData.totalReviews);
          setAverageRating(mockData.averageRating);
          setRatingCounts(mockData.ratingCounts);
        } catch (parseError) {
          console.error("Error parsing cached mock data:", parseError);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [productId, fetchReviews]);

  const handleReviewSubmitted = () => {
    // Refresh reviews after a new one is submitted
    fetchReviews();
    // Switch to the read tab to show the new review
    setActiveTab("read");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Reviews</h2>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {totalReviews > 0 ? (
            <RatingSummary
              averageRating={averageRating}
              totalReviews={totalReviews}
              ratingCounts={ratingCounts}
            />
          ) : (
            <p className="text-muted-foreground">
              This product has no reviews yet. Be the first to leave a review!
            </p>
          )}

          <Tabs
            defaultValue="read"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="read">Read Reviews</TabsTrigger>
              <TabsTrigger value="write" disabled={!session}>
                Write a Review
              </TabsTrigger>
            </TabsList>

            <TabsContent value="read" className="space-y-4">
              {totalReviews > 0 ? (
                <div className="divide-y">
                  {reviews.map((review) => (
                    <ReviewItem key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No reviews yet for this product.
                  </p>
                  {session ? (
                    <Button onClick={() => setActiveTab("write")}>
                      Write the First Review
                    </Button>
                  ) : (
                    <Button asChild>
                      <a href="/auth/signin?callbackUrl=/products/{productId}">
                        Sign in to Write a Review
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="write">
              {session ? (
                <ReviewForm
                  productId={productId}
                  onSuccess={handleReviewSubmitted}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Please sign in to write a review.
                  </p>
                  <Button asChild>
                    <a href="/auth/signin?callbackUrl=/products/{productId}">
                      Sign in
                    </a>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

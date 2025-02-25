"use client";

import { Rating } from "@/components/ui/rating";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface RatingSummaryProps {
  averageRating: number;
  totalReviews: number;
  ratingCounts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  className?: string;
}

export function RatingSummary({
  averageRating,
  totalReviews,
  ratingCounts,
  className,
}: RatingSummaryProps) {
  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const calculatePercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start">
        {/* Average rating display */}
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold">
            {formatRating(averageRating)}
          </span>
          <Rating value={averageRating} readOnly size="sm" className="mt-1" />
          <span className="text-xs text-muted-foreground mt-1">
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </span>
        </div>

        {/* Rating breakdown */}
        <div className="flex-1 w-full space-y-1.5">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <div className="w-7 text-xs font-medium text-right">
                {rating}
                <span className="sr-only">stars</span>
              </div>
              <Progress
                value={calculatePercentage(
                  ratingCounts[rating as keyof typeof ratingCounts]
                )}
                className="h-2"
              />
              <div className="w-9 text-xs text-muted-foreground">
                {ratingCounts[rating as keyof typeof ratingCounts]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

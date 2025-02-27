"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { generateProductImages, formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Rating } from "@/components/ui/rating";

interface ProductCardProps {
  data: Product;
}

export function ProductCard({ data }: ProductCardProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    if (data.images && data.images.length > 0) {
      setImageUrl(data.images[0]);
    } else {
      const generatedImages = generateProductImages(data.id);
      setImageUrl(generatedImages[0]);
    }
  }, [data.id, data.images]);

  // Fetch the average rating for this product
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await fetch(`/api/reviews?productId=${data.id}`);
        if (response.ok) {
          const { averageRating, totalReviews } = await response.json();
          setAverageRating(averageRating);
          setReviewCount(totalReviews);
        }
      } catch (error) {
        console.error("Error fetching product ratings:", error);
      }
    };

    fetchRatings();
  }, [data.id]);

  const handleImageError = () => {
    setImageError(true);
    const newImages = generateProductImages(data.id);
    setImageUrl(newImages[0]);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <Link
      href={`/products/${data.slug}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 transition-all duration-300 hover:border-gray-900"
    >
      <div className="relative w-full pt-[100%]">
        <div className="absolute inset-0">
          {imageUrl && !imageError ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
                </div>
              )}
              <Image
                src={imageUrl}
                alt={data.name}
                fill
                className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                  isLoading ? "opacity-0" : "opacity-100"
                }`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={handleImageError}
                onLoad={handleImageLoad}
                priority={false}
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-100">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{data.name}</h3>
        {reviewCount > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <Rating value={averageRating} readOnly size="sm" />
            <span className="text-xs text-muted-foreground">
              ({reviewCount})
            </span>
          </div>
        )}
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {data.description}
        </p>
        <p className="mt-2 text-lg font-medium text-gray-900">
          {formatCurrency(data.price)}
        </p>
      </div>
    </Link>
  );
}

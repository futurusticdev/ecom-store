import React from "react";

export default function ProductDetailLoading(): React.JSX.Element {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Product Image Skeleton */}
        <div className="relative aspect-square animate-pulse overflow-hidden rounded-lg bg-gray-200" />

        {/* Product Info Skeleton */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-1/4 animate-pulse rounded bg-gray-200" />
          </div>

          {/* Color Selection Skeleton */}
          <div className="space-y-3">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            <div className="flex space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-8 animate-pulse rounded-full bg-gray-200"
                />
              ))}
            </div>
          </div>

          {/* Size Selection Skeleton */}
          <div className="space-y-3">
            <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded bg-gray-200"
                />
              ))}
            </div>
          </div>

          {/* Quantity Skeleton */}
          <div className="space-y-3">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-6 animate-pulse rounded bg-gray-200" />
              <div className="h-10 w-10 animate-pulse rounded bg-gray-200" />
            </div>
          </div>

          {/* Buttons Skeleton */}
          <div className="flex space-x-4">
            <div className="h-12 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-12 w-12 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";

export default function ProductsLoading(): JSX.Element {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array(8)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              <div className="h-64 w-full animate-pulse bg-gray-200"></div>
              <div className="p-4">
                <div className="mb-2 h-4 w-3/4 animate-pulse bg-gray-200"></div>
                <div className="mb-4 h-6 w-1/2 animate-pulse bg-gray-200"></div>
                <div className="h-10 w-full animate-pulse bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";

// Use dynamic import for client component
const FavoriteItem = dynamic(() => import("./FavoriteItem"), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border bg-card overflow-hidden shadow-sm flex flex-col h-[280px]">
      <div className="h-48 w-full bg-gray-200 animate-pulse"></div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="h-5 bg-gray-200 animate-pulse rounded w-3/4"></div>
        <div className="h-10 bg-gray-200 animate-pulse rounded w-full mt-1"></div>
        <div className="flex justify-between mt-4">
          <div className="h-5 bg-gray-200 animate-pulse rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3"></div>
        </div>
      </div>
    </div>
  ),
});

export function FavoritesGrid({ products }: { products: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <FavoriteItem key={product.id} product={product} />
      ))}
    </div>
  );
}

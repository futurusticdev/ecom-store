"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState, useCallback, useEffect } from "react";
import type { Product } from "@/types";
import { FavoritesGrid } from "./FavoritesClient";

interface InitialData {
  favorites: Product[];
  total: number;
  totalPages: number;
}

interface FavoritesListProps {
  initialData?: InitialData;
}

export default function FavoritesList({ initialData }: FavoritesListProps) {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>(
    initialData?.favorites || []
  );
  const [isLoading, setIsLoading] = useState(!initialData);

  const fetchFavorites = useCallback(async () => {
    if (!session?.user || initialData) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/wishlist");

      if (!response.ok) {
        throw new Error("Failed to fetch favorites");
      }

      const data = await response.json();
      setProducts(data.wishlist || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session, initialData]);

  const handleRemove = (id: string) => {
    setProducts(products.filter((item) => item.id !== id));
  };

  useEffect(() => {
    if (!initialData) {
      fetchFavorites();
    }
  }, [fetchFavorites, initialData]);

  if (isLoading) {
    return <div className="py-12 text-center">Loading your favorites...</div>;
  }

  if (!session && !initialData) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">
          Please sign in to view your favorites.
        </p>
        <Link href="/auth/signin">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">
          You haven&apos;t saved any items to your favorites yet.
        </p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-xs sm:text-sm text-muted-foreground">
        Showing {products.length} {initialData && `of ${initialData.total}`}{" "}
        saved items
      </div>

      <FavoritesGrid products={products} onRemove={handleRemove} />

      {initialData && initialData.totalPages > 1 && (
        <div className="flex justify-center gap-1 sm:gap-2 mt-6 sm:mt-8">
          {Array.from({ length: initialData.totalPages }, (_, i) => i + 1).map(
            (p) => {
              // Create query string with page parameter
              const query = new URLSearchParams();
              query.set("page", p.toString());

              return (
                <Link
                  key={p}
                  href={`/dashboard/favorites?${query.toString()}`}
                  className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md ${
                    p ===
                    parseInt(
                      new URLSearchParams(window.location.search).get("page") ||
                        "1",
                      10
                    )
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                  prefetch={true}
                >
                  {p}
                </Link>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

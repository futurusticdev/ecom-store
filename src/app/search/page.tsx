"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { ProductCard } from "@/components/ui/product-card";
import { ProductFilters } from "@/components/ui/product-filters";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  color?: string;
  size?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products based on search query and filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        const response = await fetch(`/api/products/search?q=${query}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {query ? `Search results for "${query}"` : "All Products"}
          </h1>

          <div className="flex items-center">
            <button
              type="button"
              className="flex items-center gap-x-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsFiltersVisible(!isFiltersVisible)}
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters */}
          {isFiltersVisible && (
            <div className="lg:col-span-1">
              <ProductFilters />
            </div>
          )}

          {/* Product grid */}
          <div className={isFiltersVisible ? "lg:col-span-3" : "lg:col-span-4"}>
            {products.length === 0 ? (
              <div className="text-center">
                <p className="text-lg text-gray-500">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

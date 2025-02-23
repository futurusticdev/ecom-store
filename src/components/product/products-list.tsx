"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/ui/product-card";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  images: string[];
  sizes: string[];
  inStock: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: string;
  name: string;
}

interface ProductsListProps {
  initialProducts: Product[];
  categories: Category[];
}

export function ProductsList({
  initialProducts,
  categories,
}: ProductsListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const handleCategoryChange = async (categoryId: string) => {
    setLoading(true);
    setSelectedCategory(categoryId);

    try {
      const url = new URL("/api/products", window.location.origin);
      if (categoryId) {
        url.searchParams.append("categoryId", categoryId);
      }
      url.searchParams.append("limit", "12");

      const response = await fetch(url);
      const data = await response.json();
      setProducts(data.items);
    } catch (error) {
      // Set products to empty array on error
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            All Products
          </h1>
          <div className="flex items-center gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-black focus:outline-none focus:ring-black"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-lg bg-gray-200"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center text-center">
            <p className="text-lg text-gray-500">
              No products found. Try changing your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} data={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

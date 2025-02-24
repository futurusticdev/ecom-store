"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORIES = [
  "All",
  "Men",
  "Women",
  "Accessories",
  "Shoes",
  "Bags",
  "Jewelry",
];

const COLORS = [
  { name: "Black", value: "black" },
  { name: "White", value: "white" },
  { name: "Gray", value: "gray" },
  { name: "Blue", value: "blue" },
  { name: "Red", value: "red" },
  { name: "Green", value: "green" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const PRICE_RANGES = [
  { name: "Under $50", min: 0, max: 50 },
  { name: "$50 to $100", min: 50, max: 100 },
  { name: "$100 to $200", min: 100, max: 200 },
  { name: "$200 & Above", min: 200, max: null },
];

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    searchParams.get("colors")?.split(",") || []
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    searchParams.get("sizes")?.split(",") || []
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState<{
    min: number;
    max: number | null;
  } | null>(null);

  const updateFilters = ({
    category,
    colors,
    sizes,
    priceRange,
  }: {
    category?: string;
    colors?: string[];
    sizes?: string[];
    priceRange?: { min: number; max: number | null };
  }) => {
    const params = new URLSearchParams(searchParams);

    // Update category
    if (category) {
      if (category === "All") {
        params.delete("category");
      } else {
        params.set("category", category);
      }
    }

    // Update colors
    if (colors) {
      if (colors.length === 0) {
        params.delete("colors");
      } else {
        params.set("colors", colors.join(","));
      }
    }

    // Update sizes
    if (sizes) {
      if (sizes.length === 0) {
        params.delete("sizes");
      } else {
        params.set("sizes", sizes.join(","));
      }
    }

    // Update price range
    if (priceRange) {
      params.set("minPrice", priceRange.min.toString());
      if (priceRange.max) {
        params.set("maxPrice", priceRange.max.toString());
      } else {
        params.delete("maxPrice");
      }
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Categories</h3>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <label
              key={category}
              className="flex items-center cursor-pointer group"
            >
              <input
                type="radio"
                name="category"
                value={category}
                checked={selectedCategory === category}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  updateFilters({ category: e.target.value });
                }}
                className="h-4 w-4 border-gray-300 text-black focus:ring-black"
              />
              <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900">
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Colors</h3>
        <div className="space-y-2">
          {COLORS.map(({ name, value }) => (
            <label
              key={value}
              className="flex items-center cursor-pointer group"
            >
              <input
                type="checkbox"
                value={value}
                checked={selectedColors.includes(value)}
                onChange={(e) => {
                  const newColors = e.target.checked
                    ? [...selectedColors, value]
                    : selectedColors.filter((c) => c !== value);
                  setSelectedColors(newColors);
                  updateFilters({ colors: newColors });
                }}
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900">
                {name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Sizes</h3>
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map((size) => (
            <label
              key={size}
              className={`flex items-center justify-center px-3 py-2 text-sm border rounded-md cursor-pointer ${
                selectedSizes.includes(size)
                  ? "border-black bg-black text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <input
                type="checkbox"
                value={size}
                checked={selectedSizes.includes(size)}
                onChange={(e) => {
                  const newSizes = e.target.checked
                    ? [...selectedSizes, size]
                    : selectedSizes.filter((s) => s !== size);
                  setSelectedSizes(newSizes);
                  updateFilters({ sizes: newSizes });
                }}
                className="sr-only"
              />
              {size}
            </label>
          ))}
        </div>
      </div>

      {/* Price Ranges */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Price Range</h3>
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => (
            <label
              key={range.name}
              className="flex items-center cursor-pointer group"
            >
              <input
                type="radio"
                name="price-range"
                checked={
                  selectedPriceRange?.min === range.min &&
                  selectedPriceRange?.max === range.max
                }
                onChange={() => {
                  setSelectedPriceRange(range);
                  updateFilters({ priceRange: range });
                }}
                className="h-4 w-4 border-gray-300 text-black focus:ring-black"
              />
              <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900">
                {range.name}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

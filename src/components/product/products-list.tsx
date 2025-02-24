"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/ui/product-card";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

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
  productTags: {
    tag: {
      id: string;
      name: string;
    };
  }[];
}

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface ProductsListProps {
  initialProducts: Product[];
  categories: Category[];
  tags: Tag[];
}

const PRICE_RANGES = [
  { label: "All Prices", min: undefined, max: undefined },
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50 to $100", min: 50, max: 100 },
  { label: "$100 to $200", min: 100, max: 200 },
  { label: "$200 & Above", min: 200, max: undefined },
];

const SORT_OPTIONS = [
  { label: "Newest", value: "createdAt.desc" },
  { label: "Price: Low to High", value: "price.asc" },
  { label: "Price: High to Low", value: "price.desc" },
  { label: "Name: A to Z", value: "name.asc" },
];

export function ProductsList({
  initialProducts = [],
  categories = [],
  tags = [],
}: ProductsListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<{
    min?: number;
    max?: number;
  }>({});
  const [sortBy, setSortBy] = useState("createdAt.desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(0);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const searchParams = new URLSearchParams();
        if (selectedCategory) searchParams.set("category", selectedCategory);
        if (selectedTags.length > 0)
          searchParams.set("tags", selectedTags.join(","));
        if (page) searchParams.set("page", page.toString());
        if (limit) searchParams.set("limit", limit.toString());
        if (debouncedSearch) searchParams.set("search", debouncedSearch);
        if (selectedPriceRange.min !== undefined)
          searchParams.set("minPrice", selectedPriceRange.min.toString());
        if (selectedPriceRange.max !== undefined)
          searchParams.set("maxPrice", selectedPriceRange.max.toString());
        if (sortBy) searchParams.set("sort", sortBy);

        const response = await fetch(
          `/api/products?${searchParams.toString()}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data.products || []);
        setTotalPages(Math.ceil((data.total || 0) / limit));
      } catch (err) {
        console.error(
          "Error fetching products:",
          err instanceof Error ? err.message : "Unknown error"
        );
        setProducts([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    selectedCategory,
    selectedTags,
    selectedPriceRange,
    sortBy,
    debouncedSearch,
    page,
    limit,
  ]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
    setPage(1);
  };

  const handlePriceRangeChange = (min?: number, max?: number) => {
    setSelectedPriceRange({ min, max });
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedTags([]);
    setSelectedPriceRange({});
    setSortBy("createdAt.desc");
    setSearchQuery("");
    setPage(1);
  };

  const hasActiveFilters =
    selectedCategory ||
    selectedTags.length > 0 ||
    selectedPriceRange.min !== undefined ||
    selectedPriceRange.max !== undefined ||
    sortBy !== "createdAt.desc" ||
    searchQuery;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Header and Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            All Products
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 sm:max-w-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="block w-full rounded-md border-gray-300 pl-10 py-2 text-sm focus:border-black focus:outline-none focus:ring-black"
              />
            </div>
            <button
              onClick={() => setIsFiltersVisible(!isFiltersVisible)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters */}
        {isFiltersVisible && (
          <div className="mb-8 rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Clear all
                </button>
              )}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full rounded-md border-gray-300 text-sm focus:border-black focus:outline-none focus:ring-black"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="space-y-2 max-h-40 overflow-auto">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-gray-700">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={`${selectedPriceRange.min}-${selectedPriceRange.max}`}
                  onChange={(e) => {
                    const [min, max] = e.target.value.split("-").map(Number);
                    handlePriceRangeChange(min || undefined, max || undefined);
                  }}
                  className="w-full rounded-md border-gray-300 text-sm focus:border-black focus:outline-none focus:ring-black"
                >
                  {PRICE_RANGES.map((range) => (
                    <option
                      key={range.label}
                      value={`${range.min}-${range.max}`}
                    >
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full rounded-md border-gray-300 text-sm focus:border-black focus:outline-none focus:ring-black"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
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
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} data={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      page === i + 1
                        ? "bg-black text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

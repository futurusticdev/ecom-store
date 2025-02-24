"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle search submission
  const handleSearch = (searchQuery: string) => {
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set("q", searchQuery);
    } else {
      params.delete("q");
    }
    router.push(`/search?${params.toString()}`);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Clear search
  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  // Submit on Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(query);
    }
  };

  // Update search when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== initialQuery) {
      handleSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <div className="relative w-full max-w-md">
      <div
        className={cn(
          "flex items-center rounded-full border bg-gray-50/90 px-4 transition-colors",
          isFocused && "border-gray-900 bg-white"
        )}
      >
        <Search className="h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search products..."
          className="flex-1 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-gray-400"
          aria-label="Search products"
        />
        {query && (
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

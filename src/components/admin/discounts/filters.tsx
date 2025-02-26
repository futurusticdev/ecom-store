"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DiscountFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filterType: "all" | "PERCENTAGE" | "FIXED";
  setFilterType: (value: "all" | "PERCENTAGE" | "FIXED") => void;
}

export function DiscountFilters({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
}: DiscountFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
      <div className="flex-1">
        <Label htmlFor="search" className="mb-2">
          Search
        </Label>
        <Input
          id="search"
          placeholder="Search by code or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="w-full md:w-48">
        <Label htmlFor="filter-type" className="mb-2">
          Discount Type
        </Label>
        <select
          id="filter-type"
          className="w-full h-10 px-3 py-2 border rounded-md"
          value={filterType}
          onChange={(e) =>
            setFilterType(e.target.value as "all" | "PERCENTAGE" | "FIXED")
          }
        >
          <option value="all">All Types</option>
          <option value="PERCENTAGE">Percentage</option>
          <option value="FIXED">Fixed Amount</option>
        </select>
      </div>
    </div>
  );
}

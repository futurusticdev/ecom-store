"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const statuses = [
  { label: "All", value: "" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function OrderFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [currentStatus, setCurrentStatus] = useState("");

  // Handle searchParams safely in a useEffect hook
  useEffect(() => {
    const status = searchParams?.get("status") || "";
    setCurrentStatus(status);
  }, [searchParams]);

  function onFilterChange(status: string) {
    // Create a new URLSearchParams instance to prevent direct mutation
    const params = new URLSearchParams(searchParams?.toString());

    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }

    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
      {statuses.map((status) => (
        <Button
          key={status.value}
          variant={currentStatus === status.value ? "default" : "outline"}
          onClick={() => onFilterChange(status.value)}
          className="min-w-[100px]"
        >
          {status.label}
        </Button>
      ))}
    </div>
  );
}

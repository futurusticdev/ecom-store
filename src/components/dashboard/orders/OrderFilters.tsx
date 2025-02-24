"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
  const currentStatus = searchParams.get("status") || "";

  function onFilterChange(status: string) {
    const params = new URLSearchParams(searchParams);
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
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

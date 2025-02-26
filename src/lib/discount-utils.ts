import { Discount } from "@/types/discount";
import { format } from "date-fns";

// Format discount value for display
export const formatDiscountValue = (discount: Discount) => {
  switch (discount.type) {
    case "PERCENTAGE":
      return `${discount.value}%`;
    case "FIXED":
      return `$${discount.value.toFixed(2)}`;
    case "SHIPPING":
      return `Free Shipping`;
    default:
      return discount.value.toString();
  }
};

// Filter active discounts by search query and type
export const filterDiscounts = (
  discounts: Discount[],
  searchQuery: string,
  filterType: "all" | "PERCENTAGE" | "FIXED"
) => {
  return discounts.filter((discount) => {
    const matchesSearch =
      discount.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (discount.productCategory &&
        discount.productCategory
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));

    const matchesType = filterType === "all" || discount.type === filterType;

    return matchesSearch && matchesType;
  });
};

// Export discounts as CSV
export const exportDiscountsAsCSV = (discounts: Discount[]) => {
  // Create CSV header
  const headers = [
    "ID",
    "Code",
    "Type",
    "Value",
    "Min Purchase",
    "Max Uses",
    "Start Date",
    "End Date",
    "Status",
    "Product Category",
    "Used",
    "Total Usage",
    "Created At",
    "Updated At",
  ].join(",");

  // Create CSV rows
  const rows = discounts.map((d) =>
    [
      d.id,
      d.code,
      d.type,
      d.value,
      d.minPurchase || "",
      d.maxUses || "",
      format(new Date(d.startDate), "yyyy-MM-dd"),
      format(new Date(d.endDate), "yyyy-MM-dd"),
      d.status,
      d.productCategory || "All",
      d.usage.current,
      d.usage.max,
      format(new Date(d.createdAt), "yyyy-MM-dd"),
      format(new Date(d.updatedAt), "yyyy-MM-dd"),
    ].join(",")
  );

  // Combine header and rows
  return [headers, ...rows].join("\n");
};

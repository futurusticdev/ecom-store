import { Discount } from "@/types/discount";
import { addDays } from "date-fns";
import { v4 as uuidv4 } from "uuid";

// In-memory storage for discounts (will be reset on page refresh in this demo)
// In a real app, these would be stored in a database
let activeDiscountsStore: Discount[] = [];
let scheduledDiscountsStore: Discount[] = [];

// Get all discounts
export async function getDiscounts(): Promise<{
  activeDiscounts: Discount[];
  scheduledDiscounts: Discount[];
}> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    activeDiscounts: activeDiscountsStore,
    scheduledDiscounts: scheduledDiscountsStore,
  };
}

// Toggle discount status
export async function toggleDiscountStatus(
  id: string,
  active: boolean
): Promise<boolean> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Find the discount in either store
  const discountFromActive = activeDiscountsStore.find((d) => d.id === id);
  const discountFromScheduled = scheduledDiscountsStore.find(
    (d) => d.id === id
  );

  if (active && discountFromScheduled) {
    // Move from scheduled to active
    const updatedDiscount = {
      ...discountFromScheduled,
      status: "Active" as Discount["status"],
      updatedAt: new Date().toISOString(),
    };

    scheduledDiscountsStore = scheduledDiscountsStore.filter(
      (d) => d.id !== id
    );
    activeDiscountsStore.push(updatedDiscount);
    return true;
  } else if (!active && discountFromActive) {
    // Move from active to scheduled
    const updatedDiscount = {
      ...discountFromActive,
      status: "Scheduled" as Discount["status"],
      updatedAt: new Date().toISOString(),
    };

    activeDiscountsStore = activeDiscountsStore.filter((d) => d.id !== id);
    scheduledDiscountsStore.push(updatedDiscount);
    return true;
  }

  return false;
}

// Delete discount
export async function deleteDiscount(id: string): Promise<boolean> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Remove from either store
  const wasInActive = activeDiscountsStore.some((d) => d.id === id);
  const wasInScheduled = scheduledDiscountsStore.some((d) => d.id === id);

  activeDiscountsStore = activeDiscountsStore.filter((d) => d.id !== id);
  scheduledDiscountsStore = scheduledDiscountsStore.filter((d) => d.id !== id);

  return wasInActive || wasInScheduled;
}

// Create new discount
export async function createDiscount(
  discountData: Partial<Discount>
): Promise<Discount> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const newDiscount: Discount = {
    id: uuidv4(),
    code: discountData.code || "UNKNOWN",
    type: discountData.type || "PERCENTAGE",
    value: discountData.value || 0,
    usage: { current: 0, max: discountData.maxUses || 100 },
    startDate: discountData.startDate || new Date().toISOString(),
    endDate: discountData.endDate || new Date().toISOString(),
    status:
      (discountData.status as Discount["status"]) ||
      ("Active" as Discount["status"]),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    minPurchase: discountData.minPurchase,
    productCategory: discountData.productCategory,
    customerGroups: discountData.customerGroups || [],
  };

  // Add to appropriate store
  if (newDiscount.status === "Active") {
    activeDiscountsStore.push(newDiscount);
  } else {
    scheduledDiscountsStore.push(newDiscount);
  }

  return newDiscount;
}

/**
 * Get statistics about discount usage
 */
export async function getDiscountStatistics() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Get discount data from the existing function
  const { activeDiscounts, scheduledDiscounts } = await getDiscounts();

  // Calculate total savings based on discount usage
  const allDiscounts = [...activeDiscounts, ...scheduledDiscounts];
  const totalSavings = allDiscounts.reduce((sum, discount) => {
    const avgOrderValue = 120;
    const discountAmount =
      discount.type === "PERCENTAGE"
        ? (avgOrderValue * discount.value) / 100
        : discount.value;
    return sum + discountAmount * discount.usage.current;
  }, 0);

  // Calculate actual usage rates based on discount redemptions
  const totalPossibleUses =
    allDiscounts.reduce((sum, d) => sum + d.usage.max, 0) || 1; // Avoid division by zero

  const totalActualUses = allDiscounts.reduce(
    (sum, d) => sum + d.usage.current,
    0
  );

  const currentUsageRate =
    totalPossibleUses > 0
      ? Math.round((totalActualUses / totalPossibleUses) * 100)
      : 0;

  // Simulate last month's usage rate (slightly lower)
  const lastMonthUsageRate = Math.max(0, currentUsageRate - 3.2);

  return {
    endingThisWeek: activeDiscounts.filter((d) => {
      const endDate = new Date(d.endDate);
      const oneWeekFromNow = addDays(new Date(), 7);
      return endDate <= oneWeekFromNow;
    }).length,
    appliedToOrders: totalActualUses,
    usageRate: currentUsageRate,
    comparedToLastMonth: lastMonthUsageRate,
    totalSavings: totalSavings,
  };
}

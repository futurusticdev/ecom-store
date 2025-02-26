// Define discount type
export type Discount = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED" | "SHIPPING";
  value: number;
  usage: {
    current: number;
    max: number;
  };
  startDate: string;
  endDate: string;
  status: "Active" | "Inactive" | "Ending Soon" | "Scheduled";
  createdAt: string;
  updatedAt: string;
  minPurchase?: number;
  maxUses?: number;
  productCategory?: string;
  customerGroups?: string[];
};

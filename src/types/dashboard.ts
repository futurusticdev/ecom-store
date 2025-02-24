import { LucideIcon } from "lucide-react";

export type StatCard = {
  name: string;
  value: string;
  icon: LucideIcon;
  change: string;
  changeType: "positive" | "negative" | "neutral";
};

export type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export type Order = {
  id: string;
  date: string;
  total: number;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  products: Product[];
};

export type Address = {
  id: string;
  type: "Shipping" | "Billing";
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export type UserStats = {
  totalOrders: number;
  savedItems: number;
  totalSpent: number;
  activeOrders: number;
};

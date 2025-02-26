"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Define discount type
type Discount = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED" | "SHIPPING";
  value: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  expiryDate: string | null;
  isActive: boolean;
  productCategory: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function AdminDiscountsPage() {
  // State for creating a discount
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountType, setDiscountType] = useState<
    "PERCENTAGE" | "FIXED" | "SHIPPING"
  >("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState(10);
  const [minPurchase, setMinPurchase] = useState(0);
  const [maxUses, setMaxUses] = useState(100);
  const [expiryDate, setExpiryDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [productCategory, setProductCategory] = useState("all");

  // State for managing discounts
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);
  const [stats, setStats] = useState({
    activeDiscounts: 0,
    totalRedemptions: 0,
    revenueImpact: 0,
  });

  // Fetch discounts on page load
  useEffect(() => {
    fetchDiscounts();
  }, []);

  // Fetch discounts from API
  const fetchDiscounts = async () => {
    try {
      setLoadingDiscounts(true);
      const response = await fetch("/api/discounts");

      if (!response.ok) {
        throw new Error("Failed to fetch discounts");
      }

      const data = await response.json();
      setDiscounts(data);

      // Calculate stats
      const activeCount = data.filter((d: Discount) => d.isActive).length;
      const totalUsed = data.reduce(
        (sum: number, d: Discount) => sum + d.usedCount,
        0
      );

      // Rough estimate of revenue impact (would be more accurate with actual order data)
      let impact = 0;
      data.forEach((d: Discount) => {
        if (d.type === "PERCENTAGE") {
          // Assume average order value of $100
          impact += (d.usedCount * 100 * d.value) / 100;
        } else if (d.type === "FIXED") {
          impact += d.usedCount * d.value;
        } else if (d.type === "SHIPPING") {
          // Assume average shipping cost of $10
          impact += d.usedCount * Math.min(d.value, 10);
        }
      });

      setStats({
        activeDiscounts: activeCount,
        totalRedemptions: totalUsed,
        revenueImpact: impact,
      });

      setLoadingDiscounts(false);
    } catch (error) {
      console.error("Error fetching discounts:", error);
      toast.error("Failed to fetch discounts");
      setLoadingDiscounts(false);
    }
  };

  // Create a new discount
  const createDiscount = async () => {
    if (!discountCode) {
      toast.error("Please enter a discount code");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: discountCode,
          type: discountType,
          value: discountValue,
          minPurchase,
          maxUses,
          expiryDate: expiryDate || null,
          isActive,
          productCategory: productCategory === "all" ? null : productCategory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create discount");
      }

      await response.json();

      toast.success(`Successfully created discount code: ${discountCode}`);

      // Reset form
      setDiscountCode("");
      setDiscountType("PERCENTAGE");
      setDiscountValue(10);
      setMinPurchase(0);
      setMaxUses(100);
      setExpiryDate("");
      setIsActive(true);
      setProductCategory("all");

      // Refresh discounts list
      fetchDiscounts();

      setLoading(false);
    } catch (error) {
      console.error("Error creating discount:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create discount"
      );
      setLoading(false);
    }
  };

  // Delete a discount
  const deleteDiscount = async (id: string) => {
    try {
      const response = await fetch(`/api/discounts?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete discount");
      }

      toast.success("Discount deleted successfully");

      // Refresh discounts list
      fetchDiscounts();
    } catch (error) {
      console.error("Error deleting discount:", error);
      toast.error("Failed to delete discount");
    }
  };

  // Format discount value for display
  const formatDiscountValue = (discount: Discount) => {
    switch (discount.type) {
      case "PERCENTAGE":
        return `${discount.value}%`;
      case "FIXED":
        return `$${discount.value.toFixed(2)}`;
      case "SHIPPING":
        return `$${discount.value.toFixed(2)} off shipping`;
      default:
        return discount.value.toString();
    }
  };

  return (
    <div className="py-6 md:py-10">
      <div className="flex flex-wrap items-center mb-6">
        <Link href="/admin" className="mr-2 md:mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">Discount Management</h1>
      </div>

      {/* Discount Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="text-center">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">
                Active Discounts
              </p>
              <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">
                {stats.activeDiscounts}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="text-center">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">
                Total Redemptions
              </p>
              <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">
                {stats.totalRedemptions}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 md:col-span-1">
          <CardContent className="pt-4 md:pt-6">
            <div className="text-center">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">
                Revenue Impact
              </p>
              <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">
                -${stats.revenueImpact.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discount Management Section */}
      <div className="mt-6 md:mt-10">
        <Tabs defaultValue="manage" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 md:mb-6">
            <TabsTrigger value="manage">Manage Discounts</TabsTrigger>
            <TabsTrigger value="create">Create Discount</TabsTrigger>
          </TabsList>

          <TabsContent value="manage">
            <Card className="h-auto">
              <CardHeader className="pb-2 md:pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg md:text-xl">
                      Active Discounts
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Manage your store&apos;s discount codes
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchDiscounts}
                    disabled={loadingDiscounts}
                  >
                    {loadingDiscounts ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-2 hidden md:inline">Refresh</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingDiscounts ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : discounts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No discounts found. Create your first discount code.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead className="hidden md:table-cell">
                            Min. Purchase
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Usage
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Expiry
                          </TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {discounts.map((discount) => (
                          <TableRow key={discount.id}>
                            <TableCell className="font-medium">
                              {discount.code}
                            </TableCell>
                            <TableCell>
                              {discount.type === "PERCENTAGE"
                                ? "%"
                                : discount.type === "FIXED"
                                ? "$"
                                : "Shipping"}
                            </TableCell>
                            <TableCell>
                              {formatDiscountValue(discount)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              ${discount.minPurchase.toFixed(2)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {discount.usedCount} / {discount.maxUses}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {discount.expiryDate
                                ? format(
                                    new Date(discount.expiryDate),
                                    "MMM d, yyyy"
                                  )
                                : "No expiry"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  discount.isActive ? "default" : "secondary"
                                }
                              >
                                {discount.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteDiscount(discount.id)}
                                title="Delete discount"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <Card className="h-auto">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-lg md:text-xl">
                  Create a New Discount Code
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Set up a new discount code for your customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="space-y-1 md:space-y-2">
                  <Label htmlFor="discountCode" className="text-sm">
                    Discount Code
                  </Label>
                  <Input
                    id="discountCode"
                    placeholder="e.g., SUMMER2023"
                    value={discountCode}
                    onChange={(e) =>
                      setDiscountCode(e.target.value.toUpperCase())
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="discountType" className="text-sm">
                      Discount Type
                    </Label>
                    <Select
                      value={discountType}
                      onValueChange={(value) =>
                        setDiscountType(
                          value as "PERCENTAGE" | "FIXED" | "SHIPPING"
                        )
                      }
                    >
                      <SelectTrigger id="discountType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">
                          Percentage (%)
                        </SelectItem>
                        <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
                        <SelectItem value="SHIPPING">Free Shipping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="discountValue" className="text-sm">
                      {discountType === "PERCENTAGE"
                        ? "Percentage (%)"
                        : discountType === "FIXED"
                        ? "Amount ($)"
                        : "Shipping Discount ($)"}
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      min="0"
                      max={discountType === "PERCENTAGE" ? "100" : undefined}
                      value={discountValue}
                      onChange={(e) =>
                        setDiscountValue(parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="minPurchase" className="text-sm">
                      Minimum Purchase ($)
                    </Label>
                    <Input
                      id="minPurchase"
                      type="number"
                      min="0"
                      value={minPurchase}
                      onChange={(e) => setMinPurchase(parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="maxUses" className="text-sm">
                      Maximum Uses
                    </Label>
                    <Input
                      id="maxUses"
                      type="number"
                      min="1"
                      value={maxUses}
                      onChange={(e) => setMaxUses(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="expiryDate" className="text-sm">
                      Expiry Date
                    </Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="productCategory" className="text-sm">
                      Apply to Category
                    </Label>
                    <Select
                      value={productCategory}
                      onValueChange={setProductCategory}
                    >
                      <SelectTrigger id="productCategory">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="home">Home & Kitchen</SelectItem>
                        <SelectItem value="beauty">Beauty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1 md:pt-2">
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="isActive" className="text-sm">
                    Active
                  </Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={createDiscount}
                  disabled={loading || !discountCode}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Discount...
                    </>
                  ) : (
                    "Create Discount"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

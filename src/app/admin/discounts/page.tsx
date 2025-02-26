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
import {
  Loader2,
  ArrowLeft,
  Trash2,
  RefreshCw,
  Plus,
  Filter,
  Download,
  Edit,
} from "lucide-react";
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
import { format, addDays } from "date-fns";

// Define discount type
type Discount = {
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
  const [activeDiscounts, setActiveDiscounts] = useState<Discount[]>([]);
  const [scheduledDiscounts, setScheduledDiscounts] = useState<Discount[]>([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);
  const [stats, setStats] = useState({
    activeDiscounts: 24,
    endingThisWeek: 8,
    totalSavings: 12450,
    appliedToOrders: 1245,
    usageRate: 68,
    comparedToLastMonth: 64.8,
    scheduledDiscounts: 12,
    startingNextWeek: 5,
  });

  // Fetch discounts on page load
  useEffect(() => {
    // This would normally fetch from API
    // For demo purposes, we're creating sample data
    const now = new Date();

    const sampleActiveDiscounts: Discount[] = [
      {
        id: "1",
        code: "SPRING25",
        type: "PERCENTAGE",
        value: 25,
        usage: {
          current: 245,
          max: 500,
        },
        startDate: format(now, "MMM d, yyyy"),
        endDate: format(addDays(now, 30), "MMM d, yyyy"),
        status: "Active",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "2",
        code: "WELCOME50",
        type: "FIXED",
        value: 50,
        usage: {
          current: 89,
          max: 100,
        },
        startDate: format(addDays(now, 10), "MMM d, yyyy"),
        endDate: format(addDays(now, 20), "MMM d, yyyy"),
        status: "Active",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "3",
        code: "FREESHIP",
        type: "SHIPPING",
        value: 100,
        usage: {
          current: 156,
          max: 200,
        },
        startDate: format(addDays(now, 5), "MMM d, yyyy"),
        endDate: format(addDays(now, 25), "MMM d, yyyy"),
        status: "Ending Soon",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ];

    const sampleScheduledDiscounts: Discount[] = [
      {
        id: "4",
        code: "SUMMER30",
        type: "PERCENTAGE",
        value: 30,
        usage: {
          current: 0,
          max: 1000,
        },
        startDate: format(addDays(now, 35), "MMM d, yyyy"),
        endDate: format(addDays(now, 65), "MMM d, yyyy"),
        status: "Scheduled",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "5",
        code: "FLASH75",
        type: "PERCENTAGE",
        value: 75,
        usage: {
          current: 0,
          max: 500,
        },
        startDate: format(addDays(now, 25), "MMM d, yyyy"),
        endDate: format(addDays(now, 26), "MMM d, yyyy"),
        status: "Scheduled",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ];

    setActiveDiscounts(sampleActiveDiscounts);
    setScheduledDiscounts(sampleScheduledDiscounts);
  }, []);

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
    toast.success("Discount deleted successfully");
    // In a real app, you would call an API to delete the discount
  };

  // Format discount value for display
  const formatDiscountValue = (discount: Discount) => {
    switch (discount.type) {
      case "PERCENTAGE":
        return `${discount.value}%`;
      case "FIXED":
        return `$${discount.value}`;
      case "SHIPPING":
        return `100%`;
      default:
        return discount.value.toString();
    }
  };

  return (
    <div className="py-8 px-6">
      {/* Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Active Discounts */}
        <Card>
          <CardContent className="p-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500">Active Discounts</h3>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  Live
                </Badge>
              </div>
              <div className="mb-1">
                <h2 className="text-2xl font-bold">{stats.activeDiscounts}</h2>
              </div>
              <p className="text-xs text-gray-500">
                {stats.endingThisWeek} ending this week
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Savings */}
        <Card>
          <CardContent className="p-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500">Total Savings</h3>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  This Month
                </Badge>
              </div>
              <div className="mb-1">
                <h2 className="text-2xl font-bold">
                  ${stats.totalSavings.toLocaleString()}
                </h2>
              </div>
              <p className="text-xs text-gray-500">
                Applied to {stats.appliedToOrders.toLocaleString()} orders
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Usage Rate */}
        <Card>
          <CardContent className="p-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500">Usage Rate</h3>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  +5.2%
                </Badge>
              </div>
              <div className="mb-1">
                <h2 className="text-2xl font-bold">{stats.usageRate}%</h2>
              </div>
              <p className="text-xs text-gray-500">
                Compared to {stats.comparedToLastMonth}% last month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled */}
        <Card>
          <CardContent className="p-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500">Scheduled</h3>
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                  Upcoming
                </Badge>
              </div>
              <div className="mb-1">
                <h2 className="text-2xl font-bold">
                  {stats.scheduledDiscounts}
                </h2>
              </div>
              <p className="text-xs text-gray-500">Starting next week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Discounts Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Active Discounts</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="flex items-center">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Link href="/admin/discounts/new">
              <Button size="sm" className="flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                New Discount
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-md shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">CODE</TableHead>
                <TableHead>TYPE</TableHead>
                <TableHead>VALUE</TableHead>
                <TableHead>USAGE</TableHead>
                <TableHead>START DATE</TableHead>
                <TableHead>END DATE</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeDiscounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell className="font-medium">{discount.code}</TableCell>
                  <TableCell>
                    {discount.type === "PERCENTAGE"
                      ? "Percentage"
                      : discount.type === "FIXED"
                      ? "Fixed Amount"
                      : "Free Shipping"}
                  </TableCell>
                  <TableCell>{formatDiscountValue(discount)}</TableCell>
                  <TableCell>
                    {discount.usage.current}/{discount.usage.max}
                  </TableCell>
                  <TableCell>{discount.startDate}</TableCell>
                  <TableCell>{discount.endDate}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        discount.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : discount.status === "Ending Soon"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {discount.status === "Ending Soon"
                        ? "Ending Soon"
                        : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        onClick={() => deleteDiscount(discount.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Scheduled Discounts Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Scheduled Discounts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scheduledDiscounts.map((discount) => (
            <div key={discount.id} className="bg-white p-4 rounded-md shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-lg">{discount.code}</h3>
                  <Badge className="bg-purple-100 text-purple-800 mt-1">
                    Scheduled
                  </Badge>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" title="Edit">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete"
                    onClick={() => deleteDiscount(discount.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-gray-600 mb-2">
                {discount.type === "PERCENTAGE"
                  ? `${discount.value}% off`
                  : discount.type === "FIXED"
                  ? `$${discount.value} off`
                  : "Free shipping"}
                {discount.code === "SUMMER30"
                  ? " summer collection"
                  : discount.code === "FLASH75"
                  ? " flash sale - 75% off"
                  : ""}
              </p>
              <div className="text-sm text-gray-500">
                <div>Starts: {discount.startDate}</div>
                <div>Ends: {discount.endDate}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

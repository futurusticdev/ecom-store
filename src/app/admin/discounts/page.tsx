"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Download, Trash } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Discount } from "@/types/discount";
import {
  getDiscounts,
  toggleDiscountStatus,
  deleteDiscount,
  getDiscountStatistics,
} from "@/services/discount-service";
import {
  formatDiscountValue,
  filterDiscounts,
  exportDiscountsAsCSV,
} from "@/lib/discount-utils";

export default function AdminDiscountsPage() {
  // State for managing discounts
  const [loading, setLoading] = useState(true);
  const [activeDiscounts, setActiveDiscounts] = useState<Discount[]>([]);
  const [scheduledDiscounts, setScheduledDiscounts] = useState<Discount[]>([]);
  const [stats, setStats] = useState({
    endingThisWeek: 0,
    appliedToOrders: 0,
    usageRate: 0,
    comparedToLastMonth: 0,
    totalSavings: 0,
  });

  // State for filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType] = useState<"all" | "PERCENTAGE" | "FIXED">("all");

  // State for delete confirmation
  const [deleteDiscountId, setDeleteDiscountId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch discounts on page load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch discounts and stats
        const [discountData, statsData] = await Promise.all([
          getDiscounts(),
          getDiscountStatistics(),
        ]);

        setActiveDiscounts(discountData.activeDiscounts);
        setScheduledDiscounts(discountData.scheduledDiscounts);
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching discounts:", error);
        toast.error("Failed to load discounts");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle toggling discount status
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const success = await toggleDiscountStatus(id, isActive);

      if (success) {
        if (isActive) {
          // Activate discount (move from scheduled to active)
          const discountToActivate = scheduledDiscounts.find(
            (d) => d.id === id
          );
          if (discountToActivate) {
            const updatedDiscount: Discount = {
              ...discountToActivate,
              status: "Active",
              updatedAt: new Date().toISOString(),
            };
            setScheduledDiscounts((prev) => prev.filter((d) => d.id !== id));
            setActiveDiscounts((prev) => [...prev, updatedDiscount]);
            toast.success(`Discount ${discountToActivate.code} activated`);
          }
        } else {
          // Deactivate discount (move from active to scheduled)
          const discountToDeactivate = activeDiscounts.find((d) => d.id === id);
          if (discountToDeactivate) {
            const updatedDiscount: Discount = {
              ...discountToDeactivate,
              status: "Scheduled",
              updatedAt: new Date().toISOString(),
            };
            setActiveDiscounts((prev) => prev.filter((d) => d.id !== id));
            setScheduledDiscounts((prev) => [...prev, updatedDiscount]);
            toast.success(`Discount ${discountToDeactivate.code} deactivated`);
          }
        }
      }
    } catch (error) {
      console.error("Error toggling discount status:", error);
      toast.error("Failed to update discount status");
    }
  };

  // Handle discount deletion
  const handleDeleteDiscount = async (id: string) => {
    try {
      const success = await deleteDiscount(id);

      if (success) {
        // Remove from active discounts
        const activeDiscount = activeDiscounts.find((d) => d.id === id);
        if (activeDiscount) {
          setActiveDiscounts((prev) => prev.filter((d) => d.id !== id));
          toast.success(`Discount ${activeDiscount.code} deleted`);
          return;
        }

        // Remove from scheduled discounts
        const scheduledDiscount = scheduledDiscounts.find((d) => d.id === id);
        if (scheduledDiscount) {
          setScheduledDiscounts((prev) => prev.filter((d) => d.id !== id));
          toast.success(`Discount ${scheduledDiscount.code} deleted`);
        }
      }
    } catch (error) {
      console.error("Error deleting discount:", error);
      toast.error("Failed to delete discount");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteDiscountId(null);
    }
  };

  // Handle export discounts
  const handleExportDiscounts = () => {
    try {
      const allDiscounts = [...activeDiscounts, ...scheduledDiscounts];
      const csv = exportDiscountsAsCSV(allDiscounts);

      // Create download link
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `discounts-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Discounts exported successfully");
    } catch (error) {
      console.error("Error exporting discounts:", error);
      toast.error("Failed to export discounts");
    }
  };

  // Filter active discounts based on search query and filter type
  const filteredActiveDiscounts = filterDiscounts(
    activeDiscounts,
    searchQuery,
    filterType
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        {/* Search Box */}
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Search discounts..."
            className="w-full px-4 py-2 pl-10 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute left-3 top-3 h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Button Group */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleExportDiscounts}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link href="/admin/discounts/new">
            <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4" />
              New Discount
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Active Discounts */}
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-500">Active Discounts</h3>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 font-normal">
              Live
            </Badge>
          </div>
          <div className="mb-1">
            <h2 className="text-2xl font-bold">{activeDiscounts.length}</h2>
          </div>
          <p className="text-xs text-gray-500">
            {stats.endingThisWeek} ending this week
          </p>
        </div>

        {/* Total Savings */}
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-500">Total Savings</h3>
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 font-normal">
              This Month
            </Badge>
          </div>
          <div className="mb-1">
            <h2 className="text-2xl font-bold">
              $
              {stats.totalSavings.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
          </div>
          <p className="text-xs text-gray-500">
            Applied to {stats.appliedToOrders.toLocaleString()} orders
          </p>
        </div>

        {/* Usage Rate */}
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-500">Usage Rate</h3>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 font-normal">
              +{(stats.usageRate - stats.comparedToLastMonth).toFixed(1)}%
            </Badge>
          </div>
          <div className="mb-1">
            <h2 className="text-2xl font-bold">{stats.usageRate}%</h2>
          </div>
          <p className="text-xs text-gray-500">
            Compared to {stats.comparedToLastMonth.toFixed(1)}% last month
          </p>
        </div>

        {/* Scheduled */}
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-500">Scheduled</h3>
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 font-normal">
              Upcoming
            </Badge>
          </div>
          <div className="mb-1">
            <h2 className="text-2xl font-bold">{scheduledDiscounts.length}</h2>
          </div>
          <p className="text-xs text-gray-500">Starting next week</p>
        </div>
      </div>

      {/* Active Discounts Table */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Active Discounts</h2>
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="flex items-center text-sm text-gray-600 font-medium"
              onClick={() => {}}
            >
              <svg
                className="h-4 w-4 mr-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filter
            </Button>
            <Button
              variant="ghost"
              className="flex items-center text-sm text-gray-600 font-medium"
              onClick={handleExportDiscounts}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50 text-xs uppercase">
              <TableRow>
                <TableHead className="font-medium text-gray-500">
                  CODE
                </TableHead>
                <TableHead className="font-medium text-gray-500">
                  TYPE
                </TableHead>
                <TableHead className="font-medium text-gray-500">
                  VALUE
                </TableHead>
                <TableHead className="font-medium text-gray-500">
                  USAGE
                </TableHead>
                <TableHead className="font-medium text-gray-500">
                  START DATE
                </TableHead>
                <TableHead className="font-medium text-gray-500">
                  END DATE
                </TableHead>
                <TableHead className="font-medium text-gray-500">
                  STATUS
                </TableHead>
                <TableHead className="font-medium text-gray-500 text-right">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Loading discounts...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredActiveDiscounts.length > 0 ? (
                filteredActiveDiscounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-medium">
                      {discount.code}
                    </TableCell>
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
                    <TableCell>
                      {format(new Date(discount.startDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(discount.endDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`font-normal ${
                          discount.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : discount.status === "Ending Soon"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {discount.status === "Ending Soon"
                          ? "Ending Soon"
                          : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/admin/discounts/${discount.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600"
                          onClick={() => {
                            setDeleteDiscountId(discount.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No active discounts found
                    </div>
                    <div className="mt-4">
                      <Link href="/admin/discounts/new">
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          Create Your First Discount
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Scheduled Discounts */}
      <div>
        <h2 className="text-lg font-medium mb-4">Scheduled Discounts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 bg-white rounded-lg p-5 shadow-sm flex justify-center items-center py-12">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2" />
                <div className="text-sm text-muted-foreground">
                  Loading scheduled discounts...
                </div>
              </div>
            </div>
          ) : scheduledDiscounts.length > 0 ? (
            scheduledDiscounts.map((discount) => (
              <div
                key={discount.id}
                className="bg-white rounded-lg p-5 shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Badge className="mb-2 bg-purple-100 text-purple-800 hover:bg-purple-100 font-normal">
                      Scheduled
                    </Badge>
                    <h3 className="text-lg font-medium">{discount.code}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {discount.type === "PERCENTAGE"
                        ? `${discount.value}% off ${
                            discount.productCategory || "all products"
                          }`
                        : discount.type === "FIXED"
                        ? `${formatDiscountValue(discount)} off`
                        : "Free shipping"}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Link href={`/admin/discounts/${discount.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600"
                      onClick={() => {
                        setDeleteDiscountId(discount.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <p>
                    Starts:{" "}
                    {format(new Date(discount.startDate), "MMM d, yyyy")}
                  </p>
                  <p>
                    Ends: {format(new Date(discount.endDate), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 bg-white rounded-lg p-8 shadow-sm border border-gray-100 text-center">
              <p className="text-muted-foreground mb-4">
                No scheduled discounts found
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Create a discount and set its status to &quot;Scheduled&quot; to
                have it appear here.
              </p>
              <Link href="/admin/discounts/new">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  Create a Scheduled Discount
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Discount"
        description="Are you sure you want to delete this discount? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() =>
          deleteDiscountId && handleDeleteDiscount(deleteDiscountId)
        }
      />
    </div>
  );
}

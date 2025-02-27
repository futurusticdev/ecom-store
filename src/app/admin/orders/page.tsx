"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import {
  Eye,
  Pencil,
  Trash2,
  Filter,
  ChevronDown,
  Download,
} from "lucide-react";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  image: string | null;
}

interface Customer {
  name: string;
  email: string | null;
  image: string | null;
}

interface Order {
  id: string;
  orderId: string;
  customer: Customer;
  status: string;
  paymentStatus: string;
  total: number;
  date: string;
  items: OrderItem[];
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState<string>("Payment Status");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("");

  // Fetch orders with filters using useCallback
  const fetchOrders = useCallback(
    async (page: number = 1) => {
      setLoading(true);

      try {
        // Build query params
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "10");

        if (statusFilter !== "All Status") {
          params.append("status", statusFilter);
        }

        if (paymentStatusFilter !== "Payment Status") {
          params.append("paymentStatus", paymentStatusFilter);
        }

        if (dateFilter) {
          params.append("date", dateFilter.toISOString().split("T")[0]);
        }

        // Use date sorting as default when sortBy is empty
        params.append("sortBy", sortBy || "date");
        params.append("sortOrder", "desc");

        const apiUrl = `/api/orders?${params.toString()}`;
        console.log("Fetching orders from:", apiUrl);

        const response = await fetch(apiUrl);
        console.log("API Response status:", response.status);

        if (!response.ok) {
          throw new Error(`Error fetching orders: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response data:", data);

        setOrders(data.orders);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, paymentStatusFilter, dateFilter, sortBy]
  );

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Apply filters
  const handleApplyFilters = () => {
    fetchOrders(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setStatusFilter("All Status");
    setPaymentStatusFilter("Payment Status");
    setDateFilter(undefined);
    setSortBy("");
    fetchOrders(1);
  };

  // Handle row selection
  const handleSelectRow = (orderId: string) => {
    setSelectedRows((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchOrders(page);
  };

  // Handle row actions
  const handleViewOrder = (orderId: string) => {
    console.log("View order:", orderId);
    // Implementation for viewing order details
  };

  const handleEditOrder = (orderId: string) => {
    console.log("Edit order:", orderId);
    // Implementation for editing order
  };

  const handleDeleteOrder = (orderId: string) => {
    console.log("Delete order:", orderId);
    // Implementation for deleting order
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get status color classes
  const getStatusClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
        return "bg-red-100 text-red-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle export to CSV
  const handleExport = () => {
    // Skip if no orders
    if (orders.length === 0) return;

    // Define CSV headers
    const headers = [
      "Order ID",
      "Customer Name",
      "Customer Email",
      "Products",
      "Date",
      "Status",
      "Payment Status",
      "Amount",
    ];

    // Convert orders to CSV rows
    const rows = orders.map((order) => [
      order.orderId,
      order.customer.name,
      order.customer.email || "",
      order.items
        .map((item) => `${item.productName} (${item.quantity})`)
        .join(", "),
      format(new Date(order.date), "MM/dd/yyyy"),
      order.status,
      order.paymentStatus,
      order.total.toString(),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    // Set download attributes
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders-export-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";

    // Append, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Button variant="outline" className="flex items-center px-3 py-2">
              <Filter className="h-4 w-4 mr-2" />
              <span>Filter</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <Button
            variant="outline"
            className="flex items-center px-3 py-2"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>

        <div>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
          >
            <option>Payment Status</option>
            <option>Pending</option>
            <option>Paid</option>
            <option>Refunded</option>
            <option>Failed</option>
          </select>
        </div>

        <div>
          <DatePicker
            date={dateFilter}
            setDate={setDateFilter}
            placeholder="Select date"
          />
        </div>

        <div className="flex space-x-4 items-center">
          <div className="flex-1 relative min-w-[120px]">
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-left appearance-none pr-10"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="" disabled>
                Order By
              </option>
              <option value="date">Date</option>
              <option value="total">Amount</option>
              <option value="status">Status</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>

          <Button
            onClick={handleApplyFilters}
            className="bg-indigo-600 hover:bg-indigo-700 text-white whitespace-nowrap"
          >
            Apply Filters
          </Button>

          <Button
            onClick={handleResetFilters}
            variant="outline"
            className="whitespace-nowrap"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-md shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">
                <Checkbox />
              </TableHead>
              <TableHead className="font-medium">ORDER ID</TableHead>
              <TableHead className="font-medium">CUSTOMER</TableHead>
              <TableHead className="font-medium">PRODUCTS</TableHead>
              <TableHead className="font-medium">DATE</TableHead>
              <TableHead className="font-medium">STATUS</TableHead>
              <TableHead className="font-medium">PAYMENT</TableHead>
              <TableHead className="font-medium">AMOUNT</TableHead>
              <TableHead className="font-medium text-center">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={`loading-${i}`} className="h-16">
                  <TableCell colSpan={9} className="text-center">
                    <div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-red-500 py-10"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedRows.includes(order.id)}
                      onCheckedChange={() => handleSelectRow(order.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{order.orderId}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full w-full flex items-center justify-center text-xs font-medium text-gray-500">
                          {order.customer.name.charAt(0)}
                        </div>
                      </div>
                      <span>{order.customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{order.items[0]?.productName}</TableCell>
                  <TableCell>
                    {format(new Date(order.date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClasses(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusClasses(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditOrder(order.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Showing{" "}
          {pagination.total > 0
            ? (pagination.page - 1) * pagination.limit + 1
            : 0}{" "}
          to {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
          {pagination.total} entries
        </div>
        <div className="flex space-x-1">
          <Button
            variant="outline"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </Button>

          {Array.from({ length: Math.min(pagination.pages, 5) }).map((_, i) => {
            const pageNumber = i + 1;
            return (
              <Button
                key={pageNumber}
                variant={pagination.page === pageNumber ? "default" : "outline"}
                className={
                  pagination.page === pageNumber ? "bg-indigo-600" : ""
                }
                onClick={() => handlePageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            );
          })}

          <Button
            variant="outline"
            disabled={pagination.page >= pagination.pages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

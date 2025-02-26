"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRecentOrders, Order } from "@/services/dashboard-service";
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRecentOrders(5);

        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error("Expected array of orders but got:", data);
          setOrders([]);
          setError("Received invalid data format from server");
        }
      } catch (err) {
        console.error("Error fetching recent orders:", err);
        setError("Failed to load recent orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Latest customer orders</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-destructive p-4">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Array.isArray(orders) && orders.length > 0 ? (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {order.items[0]?.productName || "Unknown Product"}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {order.customer.name}
                      </p>
                      <span className="text-xs text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.date), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {formatCurrency(order.total)}
                    </p>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0) +
                        order.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No recent orders found
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

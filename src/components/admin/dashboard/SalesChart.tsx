"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSalesData, SalesDataPoint } from "@/services/dashboard-service";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";

// Define proper types for the tooltip props
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    name: string;
    color: string;
    fill: string;
  }>;
  label?: string;
}

export function SalesChart() {
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("7d");

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getSalesData(timeframe);

        // Validate the data structure
        if (result && Array.isArray(result.salesData)) {
          setSalesData(result.salesData);
        } else {
          console.error("Expected sales data object but got:", result);
          setSalesData([]);
          setError("Received invalid data format from server");
        }
      } catch (err) {
        console.error("Error fetching sales data:", err);
        setError("Failed to load sales data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [timeframe]);

  const handleTabChange = (value: string) => {
    setTimeframe(value as "7d" | "30d" | "90d");
  };

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-sm p-2 text-sm">
          <p className="font-medium">{formatDate(label || "")}</p>
          <p className="text-primary">
            Sales: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>
            View your sales performance over time
          </CardDescription>
        </div>
        <Tabs
          defaultValue="7d"
          value={timeframe}
          onValueChange={handleTabChange}
        >
          <TabsList>
            <TabsTrigger value="7d">7d</TabsTrigger>
            <TabsTrigger value="30d">30d</TabsTrigger>
            <TabsTrigger value="90d">90d</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <div className="space-y-2 w-full">
              <Skeleton className="h-[300px] w-full rounded-md" />
            </div>
          </div>
        ) : error ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        ) : Array.isArray(salesData) && salesData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickFormatter={formatDate}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#8884d8"
                  fill="url(#colorSales)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="w-full h-[300px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              No sales data available for this period
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

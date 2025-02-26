"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Users, Tag, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminPage() {
  // Stats cards with percentage changes
  const statsCards = [
    {
      label: "Total Sales",
      value: "$24,780",
      change: "+12.5%",
      trend: "up",
      comparison: "Compared to $22,580 last month",
    },
    {
      label: "Total Orders",
      value: "384",
      change: "+8.2%",
      trend: "up",
      comparison: "Compared to 355 last month",
    },
    {
      label: "New Customers",
      value: "128",
      change: "-2.4%",
      trend: "down",
      comparison: "Compared to 131 last month",
    },
    {
      label: "Conversion Rate",
      value: "3.42%",
      change: "+1.8%",
      trend: "up",
      comparison: "Compared to 3.36% last month",
    },
  ];

  // Recent orders data
  const recentOrders = [
    {
      id: "ORD-7892",
      customer: "Sarah Johnson",
      product: "Designer Silk Dress",
      date: "Mar 14, 2025",
      status: "Completed",
      amount: "$599.00",
    },
    {
      id: "ORD-7891",
      customer: "Michael Chen",
      product: "Leather Tote Bag",
      date: "Mar 14, 2025",
      status: "Processing",
      amount: "$899.00",
    },
    {
      id: "ORD-7890",
      customer: "Emily Wilson",
      product: "Gold Watch",
      date: "Mar 13, 2025",
      status: "Completed",
      amount: "$2,499.00",
    },
  ];

  // Recent activity data
  const recentActivity = [
    {
      type: "New customer registration",
      time: "2 minutes ago",
    },
    {
      type: "Order #ORD-7892 has been completed",
      time: "15 minutes ago",
    },
    {
      type: "New order #ORD-7891 is processing",
      time: "1 hour ago",
    },
  ];

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <Card key={index} className="bg-white">
            <CardContent className="pt-6 pb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <div className="flex items-center mb-1">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <Badge
                    className={`ml-2 ${
                      stat.trend === "up"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <span className="flex items-center text-xs">
                      {stat.trend === "up" ? (
                        <ArrowUp className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 mr-1" />
                      )}
                      {stat.change}
                    </span>
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.comparison}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ORDER ID</TableHead>
                  <TableHead>CUSTOMER</TableHead>
                  <TableHead>PRODUCT</TableHead>
                  <TableHead>DATE</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead className="text-right">AMOUNT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.product}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          order.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{order.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      index === 0
                        ? "bg-blue-100 text-blue-600"
                        : index === 1
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {index === 0 ? (
                      <Users className="h-4 w-4" />
                    ) : index === 1 ? (
                      <ShoppingBag className="h-4 w-4" />
                    ) : (
                      <Tag className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{activity.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Features Grid - Hidden for now to match the image layout */}
      {/* <h2 className="text-xl font-semibold mb-4">Admin Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {adminFeatures.map((feature, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <feature.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={feature.action}
              >
                Manage
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div> */}
    </div>
  );
}

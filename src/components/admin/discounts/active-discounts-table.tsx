"use client";

import { Discount } from "@/types/discount";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { format } from "date-fns";

interface ActiveDiscountsTableProps {
  discounts: Discount[];
  loading: boolean;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onDeleteClick: (id: string) => void;
  formatDiscountValue: (discount: Discount) => string;
}

export function ActiveDiscountsTable({
  discounts,
  loading,
  onToggleStatus,
  onDeleteClick,
  formatDiscountValue,
}: ActiveDiscountsTableProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium mb-4">Active Discounts</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Loading discounts...
                    </div>
                  </TableCell>
                </TableRow>
              ) : discounts.length > 0 ? (
                discounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-medium">
                      {discount.code}
                    </TableCell>
                    <TableCell>{formatDiscountValue(discount)}</TableCell>
                    <TableCell>
                      {discount.productCategory || "All Products"}
                    </TableCell>
                    <TableCell>
                      {discount.usage.current}/{discount.usage.max}
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (discount.usage.current / discount.usage.max) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {format(new Date(discount.startDate), "MMM d, yyyy")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        to {format(new Date(discount.endDate), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={discount.status === "Active"}
                        onCheckedChange={(checked) =>
                          onToggleStatus(discount.id, checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/admin/discounts/${discount.id}`}>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDeleteClick(discount.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No active discounts found
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

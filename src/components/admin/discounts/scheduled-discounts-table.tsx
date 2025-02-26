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
import { formatDistanceToNow } from "date-fns";

interface ScheduledDiscountsTableProps {
  discounts: Discount[];
  loading: boolean;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onDeleteClick: (id: string) => void;
  formatDiscountValue: (discount: Discount) => string;
}

export function ScheduledDiscountsTable({
  discounts,
  loading,
  onToggleStatus,
  onDeleteClick,
  formatDiscountValue,
}: ScheduledDiscountsTableProps) {
  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Scheduled Discounts</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Starting</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
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
                      <div>
                        {formatDistanceToNow(new Date(discount.startDate), {
                          addSuffix: true,
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(discount.startDate), "MMM d, yyyy")}
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
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No scheduled discounts found
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

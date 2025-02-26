"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/context/cart-context";
import { X } from "lucide-react";

export function CartDiscount() {
  const [discountCode, setDiscountCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();
  const {
    items,
    subtotal,
    discount,
    applyDiscount,
    removeDiscount,
    discountAmount,
  } = useCart();

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a discount code",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);

    try {
      const response = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: discountCode,
          cartTotal: subtotal,
          productCategories: items.map((item) => item.category).filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to apply discount");
      }

      // Apply the discount to the cart
      applyDiscount(data.discount);

      // Show success message
      toast({
        title: "Discount Applied!",
        description: `${data.discount.code} - ${
          data.discount.type === "PERCENTAGE"
            ? `${data.discount.value}% off`
            : data.discount.type === "FIXED"
            ? `$${data.discount.value} off`
            : "Free shipping"
        }`,
      });

      // Clear the input field
      setDiscountCode("");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to apply discount",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveDiscount = () => {
    removeDiscount();
    toast({
      title: "Discount Removed",
      description: "The discount has been removed from your cart",
    });
  };

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      {discount ? (
        <div className="flex flex-col space-y-2">
          <p className="text-sm font-medium text-gray-900">Applied Discount</p>
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <div>
              <p className="font-medium">{discount.code}</p>
              <p className="text-sm text-gray-500">
                {discount.type === "PERCENTAGE"
                  ? `${discount.value}% off`
                  : discount.type === "FIXED"
                  ? `$${discount.value} off`
                  : "Free shipping"}
              </p>
              <p className="text-sm font-medium">
                You saved: ${discountAmount.toFixed(2)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveDiscount}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove discount</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-2">
          <p className="text-sm font-medium text-gray-900">Discount Code</p>
          <div className="flex space-x-2">
            <Input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Enter code"
              className="h-9"
            />
            <Button
              onClick={handleApplyDiscount}
              disabled={isApplying}
              className="h-9"
              variant="outline"
            >
              {isApplying ? "Applying..." : "Apply"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

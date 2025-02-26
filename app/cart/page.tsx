"use client";

import { useState, useEffect } from "react";
import OrderSummary from "@/components/OrderSummary";
import { CartItem } from "@/types";
import { Discount } from "@/context/cart-context";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [effectiveShipping, setEffectiveShipping] = useState(0);
  const [effectiveDiscount, setEffectiveDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [baseShipping, setBaseShipping] = useState(0);

  // Initialize with sample data
  useEffect(() => {
    // Sample cart items
    const sampleItems: CartItem[] = [
      {
        id: "1",
        name: "Product 1",
        price: 29.99,
        quantity: 2,
        image: "/images/products/product-1.jpg",
      },
      {
        id: "2",
        name: "Product 2",
        price: 49.99,
        quantity: 1,
        image: "/images/products/product-2.jpg",
      },
    ];

    setCartItems(sampleItems);

    // Calculate base values
    const baseSubtotal = sampleItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setSubtotal(baseSubtotal);

    const baseShippingCost = 10.0;
    setBaseShipping(baseShippingCost);
    setEffectiveShipping(baseShippingCost);

    const taxRate = 0.08; // 8% tax
    const calculatedTax = baseSubtotal * taxRate;
    setTax(calculatedTax);

    // Calculate total
    setTotal(baseSubtotal + baseShippingCost + calculatedTax);
  }, []);

  // Recalculate totals when discount changes
  useEffect(() => {
    if (discount) {
      // Apply discount to shipping
      setEffectiveShipping(baseShipping * 0.5); // 50% off shipping

      // Recalculate total with discount
      setTotal(subtotal + effectiveShipping + tax - effectiveDiscount);
    } else {
      setEffectiveShipping(baseShipping);
      setTotal(subtotal + baseShipping + tax);
    }
  }, [
    discount,
    subtotal,
    baseShipping,
    tax,
    effectiveDiscount,
    effectiveShipping,
  ]);

  const removeDiscount = () => {
    setDiscount(null);
    setDiscountAmount(0);
    setEffectiveDiscount(0);
  };

  const applyDiscount = (code: string) => {
    if (code) {
      // Create a proper Discount object
      const newDiscount: Discount = {
        id: `discount-${Date.now()}`, // Generate a unique ID
        code: code,
        type: "PERCENTAGE", // Assuming percentage discount for demo
        value: 10, // 10% discount
      };

      setDiscount(newDiscount);
      // Simple discount calculation for demo
      const calculatedDiscount = subtotal * 0.1;
      setDiscountAmount(calculatedDiscount);
      setEffectiveDiscount(calculatedDiscount);
    }
  };

  return (
    <div className="cart-page">
      <h1>Your Shopping Cart</h1>
      <OrderSummary
        items={cartItems}
        subtotal={subtotal}
        discount={discount}
        discountAmount={discountAmount}
        effectiveShippingCost={effectiveShipping}
        effectiveDiscountAmount={effectiveDiscount}
        taxAmount={tax}
        total={total}
        shippingCost={baseShipping}
        removeDiscount={removeDiscount}
        onApplyDiscount={applyDiscount}
      />
    </div>
  );
}

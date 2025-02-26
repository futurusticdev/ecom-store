"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart, Discount } from "@/context/cart-context";
import { CartItem } from "@/types";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  discount: Discount | null;
  discountAmount: number;
  effectiveShippingCost: number;
  effectiveDiscountAmount: number;
  taxAmount: number;
  total: number;
  currentStep: number;
  handleBack: () => void;
  handleContinue: () => void;
  stepsLength: number;
  removeDiscount: () => void;
}

export default function OrderSummary({
  items,
  subtotal,
  discount,
  discountAmount,
  effectiveShippingCost,
  effectiveDiscountAmount,
  taxAmount,
  total,
  currentStep,
  handleBack,
  handleContinue,
  stepsLength,
  removeDiscount,
}: OrderSummaryProps) {
  const { applyDiscount, updateQuantity } = useCart();
  const [discountCode, setDiscountCode] = useState("");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState("");

  // Define steps for navigation
  const steps = [
    { id: 1, name: "Shipping" },
    { id: 2, name: "Payment" },
    { id: 3, name: "Review" },
    { id: 4, name: "Confirmation" },
  ];

  // Check if we're on the last step
  const isLastStep = currentStep === stepsLength - 1;

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Please enter a discount code");
      return;
    }

    setIsApplyingDiscount(true);
    setDiscountError("");

    try {
      // Create a proper Discount object
      const discountObj: Discount = {
        id: `discount-${Date.now()}`, // Generate a unique ID
        code: discountCode,
        type: "PERCENTAGE", // Assuming percentage discount for demo
        value: 10, // 10% discount
      };

      applyDiscount(discountObj);
      // For demo purposes, always consider it successful
      const success = true;

      if (!success) {
        setDiscountError("Invalid or expired discount code");
      }
    } catch (error: unknown) {
      setDiscountError("Error applying discount code");
      console.error("Error applying discount:", error);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  // Handle quantity increase
  const handleIncreaseQuantity = (itemId: string, currentQuantity: number) => {
    updateQuantity(itemId, currentQuantity + 1);
  };

  // Handle quantity decrease
  const handleDecreaseQuantity = (itemId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
      <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-4 sm:mb-6">
        Order Summary
      </h2>

      <ul className="divide-y divide-gray-200">
        {items.map((item) => (
          <li key={item.id} className="flex py-4 sm:py-6">
            <div className="relative h-16 w-16 sm:h-24 sm:w-20 rounded-md overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover object-center"
              />
            </div>
            <div className="ml-2 sm:ml-4 flex flex-1 flex-col">
              <div>
                <div className="flex justify-between">
                  <h3 className="text-xs sm:text-sm font-medium">
                    {item.name}
                  </h3>
                  <p className="ml-2 sm:ml-4 text-xs sm:text-sm font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                {item.size && (
                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500">
                    Size: {item.size}
                  </p>
                )}
                {item.color && (
                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500">
                    Color: {item.color}
                  </p>
                )}
              </div>
              <div className="flex flex-1 items-end justify-between">
                <div className="flex items-center">
                  {/* Only show quantity adjustment if not in confirmation step */}
                  {currentStep < 4 ? (
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        onClick={() =>
                          handleDecreaseQuantity(item.id, item.quantity)
                        }
                        className="px-1 sm:px-2 py-0.5 sm:py-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label="Decrease quantity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 sm:h-4 sm:w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                      <span className="px-1 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm text-gray-700">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleIncreaseQuantity(item.id, item.quantity)
                        }
                        className="px-1 sm:px-2 py-0.5 sm:py-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label="Increase quantity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 sm:h-4 sm:w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  )}
                </div>
                {currentStep < 4 && (
                  <button
                    onClick={() => updateQuantity(item.id, 0)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                    aria-label="Remove item"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Discount Code Input */}
      {currentStep < 4 && (
        <div className="mt-4 sm:mt-6 border-t border-gray-200 pt-4 sm:pt-6">
          <div className="flex flex-col space-y-2">
            <p className="text-xs sm:text-sm font-medium text-gray-900">
              Discount Code
            </p>

            {discount ? (
              <div className="flex items-center justify-between bg-gray-100 p-2 sm:p-3 rounded-md">
                <div>
                  <p className="text-xs sm:text-sm font-medium">
                    {discount.code}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {discount.type === "PERCENTAGE"
                      ? `${discount.value}% off`
                      : discount.type === "FIXED"
                      ? `$${discount.value} off`
                      : "Free shipping"}
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-green-600">
                    You saved: ${effectiveDiscountAmount.toFixed(2)}
                    {discountAmount !== effectiveDiscountAmount && (
                      <span className="text-xs text-gray-500 ml-1">
                        (Original: ${discountAmount.toFixed(2)})
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={removeDiscount}
                  className="text-xs sm:text-sm text-gray-500 hover:text-gray-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Enter code"
                    className="w-full rounded-md border border-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:border-black focus:ring-black"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    disabled={isApplyingDiscount}
                    className="rounded-md border border-gray-300 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  >
                    {isApplyingDiscount ? "Applying..." : "Apply"}
                  </button>
                </div>
                {discountError && (
                  <p className="text-xs sm:text-sm text-red-600">
                    {discountError}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Cost breakdown */}
      <dl className="mt-4 sm:mt-8 space-y-2 sm:space-y-4">
        <div className="flex items-center justify-between">
          <dt className="text-xs sm:text-sm text-gray-600">Subtotal</dt>
          <dd className="text-xs sm:text-sm font-medium text-gray-900">
            ${subtotal.toFixed(2)}
          </dd>
        </div>

        {discount && (
          <div className="flex items-center justify-between">
            <dt className="text-xs sm:text-sm text-green-600">
              Discount ({discount.code})
            </dt>
            <dd className="text-xs sm:text-sm font-medium text-green-600">
              -${effectiveDiscountAmount.toFixed(2)}
              {discountAmount !== effectiveDiscountAmount && (
                <span className="text-xs text-gray-500 ml-1">
                  (Original: ${discountAmount.toFixed(2)})
                </span>
              )}
            </dd>
          </div>
        )}

        <div className="flex items-center justify-between">
          <dt className="text-xs sm:text-sm text-gray-600">Shipping</dt>
          <dd className="text-xs sm:text-sm font-medium text-gray-900">
            {effectiveShippingCost === 0
              ? "Free"
              : `$${effectiveShippingCost.toFixed(2)}`}
          </dd>
        </div>

        <div className="flex items-center justify-between">
          <dt className="text-xs sm:text-sm text-gray-600">Tax</dt>
          <dd className="text-xs sm:text-sm font-medium text-gray-900">
            ${taxAmount.toFixed(2)}
          </dd>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-3 sm:pt-4">
          <dt className="text-sm sm:text-base font-medium text-gray-900">
            Total
          </dt>
          <dd className="text-sm sm:text-base font-medium text-gray-900">
            ${total.toFixed(2)}
          </dd>
        </div>
      </dl>

      {/* Navigation buttons */}
      {currentStep < 4 && (
        <div className="mt-4 sm:mt-8 space-y-3 sm:space-y-4">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="w-full bg-white text-black border border-gray-200 rounded-lg px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Back
            </button>
          )}
          {isLastStep ? (
            <button
              type="button"
              onClick={handleContinue}
              className="w-full bg-black text-white rounded-lg px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Place Order
            </button>
          ) : (
            <button
              type="button"
              onClick={handleContinue}
              className="w-full bg-black text-white rounded-lg px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Continue to {steps[currentStep]?.name || "Next Step"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

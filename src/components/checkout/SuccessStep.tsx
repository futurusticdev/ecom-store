"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Package, Truck, Calendar } from "lucide-react";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useSession } from "next-auth/react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

interface SuccessStepProps {
  orderNumber: string;
  email: string;
  items?: OrderItem[];
  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: { type: string } | null;
  discountAmount?: number;
  effectiveShippingCost?: number;
  effectiveDiscountAmount?: number;
  taxAmount?: number;
  total: number;
  date: string;
  removeDiscount?: () => void;
}

export default function SuccessStep({
  orderNumber,
  email,
  items = [],
  subtotal = 0,
  discount = null,
  effectiveShippingCost = 0,
  effectiveDiscountAmount = 0,
  taxAmount = 0,
  total = 0,
  date,
  removeDiscount,
}: SuccessStepProps) {
  const { data: session } = useSession();
  const { shippingInfo, selectedShipping } = useCheckout();

  // Estimate delivery date (7-10 days from now for standard, 2-3 for express)
  const today = new Date();
  const deliveryDays = selectedShipping === "express" ? 3 : 10;
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + deliveryDays);

  // Format the delivery date
  const formattedDeliveryDate = deliveryDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Thank you header */}
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="flex flex-col items-center">
          <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mb-3 sm:mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
            Thank you for your order!
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Your order has been placed and is being processed.
          </p>
        </div>
      </div>

      {/* Order information */}
      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
          Order Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">
              Order Number
            </p>
            <p className="text-sm sm:text-base font-medium">{orderNumber}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">
              Order Date
            </p>
            <p className="text-sm sm:text-base font-medium">{date}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">
              Email
            </p>
            <p className="text-sm sm:text-base font-medium">{email}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">
              Payment Method
            </p>
            <p className="text-sm sm:text-base font-medium">
              Credit Card (ending in 4242)
            </p>
          </div>
        </div>
      </div>

      {/* Shipping information */}
      {shippingInfo && (
        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
            Shipping Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">
                Shipping Address
              </p>
              <div className="text-sm sm:text-base font-medium">
                <p>
                  {shippingInfo.firstName} {shippingInfo.lastName}
                </p>
                <p>{shippingInfo.address}</p>
                <p>
                  {shippingInfo.city}, {shippingInfo.postalCode}
                </p>
                <p>{shippingInfo.country}</p>
              </div>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">
                Shipping Method
              </p>
              <p className="text-sm sm:text-base font-medium capitalize">
                {selectedShipping} Shipping
                {selectedShipping === "express"
                  ? " (2-3 business days)"
                  : " (7-10 business days)"}
              </p>
              <div className="mt-3 sm:mt-4 flex items-center text-gray-600">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                <p className="text-xs sm:text-sm">
                  Estimated delivery: {formattedDeliveryDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order items */}
      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
          Order Summary
        </h3>

        {/* Items list */}
        <ul className="divide-y divide-gray-200 mb-4 sm:mb-6">
          {items && items.length > 0 ? (
            items.map((item) => (
              <li key={item.id} className="py-3 sm:py-4 flex">
                {item.image && (
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-md overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                )}
                <div className="ml-3 sm:ml-4 flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium">
                        {item.name}
                      </h4>
                      {item.size && (
                        <p className="mt-0.5 sm:mt-1 text-xs text-gray-500">
                          Size: {item.size}
                        </p>
                      )}
                      {item.color && (
                        <p className="text-xs text-gray-500">
                          Color: {item.color}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <p className="text-xs sm:text-sm text-gray-500 py-2">
              Order items will appear here
            </p>
          )}
        </ul>

        {/* Order totals */}
        <div className="border-t border-gray-200 pt-3 sm:pt-4">
          <dl className="space-y-1.5 sm:space-y-2">
            <div className="flex justify-between">
              <dt className="text-xs sm:text-sm text-gray-600">Subtotal</dt>
              <dd className="text-xs sm:text-sm font-medium">
                ${subtotal.toFixed(2)}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-xs sm:text-sm text-gray-600">Shipping</dt>
              <dd className="text-xs sm:text-sm font-medium">
                {effectiveShippingCost === 0
                  ? "Free"
                  : `$${effectiveShippingCost.toFixed(2)}`}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-xs sm:text-sm text-gray-600">Tax</dt>
              <dd className="text-xs sm:text-sm font-medium">
                ${taxAmount.toFixed(2)}
              </dd>
            </div>

            {discount && (
              <div className="flex justify-between">
                <dt className="text-xs sm:text-sm text-gray-600">
                  Discount
                  {removeDiscount && (
                    <button
                      onClick={removeDiscount}
                      className="ml-1 text-xs text-red-500 hover:text-red-700"
                    >
                      (Remove)
                    </button>
                  )}
                </dt>
                <dd className="text-xs sm:text-sm font-medium text-green-600">
                  -${effectiveDiscountAmount.toFixed(2)}
                </dd>
              </div>
            )}

            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <dt className="text-sm sm:text-base font-medium text-gray-900">
                Total
              </dt>
              <dd className="text-sm sm:text-base font-medium text-gray-900">
                ${total.toFixed(2)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
          What&apos;s Next?
        </h3>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5 sm:mt-1">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-gray-900">
                Order Processing
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                Your order is being processed and prepared for shipping.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5 sm:mt-1">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-gray-900">
                Shipping
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                You&apos;ll receive a shipping confirmation email with tracking
                information once your order ships.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5 sm:mt-1">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-gray-900">
                Delivery
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                Estimated delivery: {formattedDeliveryDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation message */}
      <div className="text-center space-y-3 sm:space-y-4">
        <p className="text-xs sm:text-sm text-gray-600">
          We&apos;ve sent a confirmation email to{" "}
          <span className="font-medium">{email}</span> with your order details.
        </p>
      </div>

      {/* Action buttons */}
      <div className="pt-3 sm:pt-4 space-y-3 sm:space-y-4">
        {session ? (
          <Link
            href="/dashboard/orders"
            className="block w-full bg-black py-2.5 sm:py-3 px-3 sm:px-4 rounded-md text-white text-sm sm:text-base font-medium hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            View Order Status
          </Link>
        ) : (
          <div className="text-center mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-gray-600">
              Sign in to view your order status in your account
            </p>
          </div>
        )}
        <Link
          href="/"
          className="block w-full bg-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-md text-black text-sm sm:text-base font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

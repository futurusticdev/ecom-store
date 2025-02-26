"use client";

import { X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { CartItem } from "./cart-item";
import { CartDiscount } from "./cart-discount";

export function CartSidebar() {
  const {
    items,
    subtotal,
    total,
    isOpen,
    toggleCart,
    discount,
    discountAmount,
  } = useCart();

  // Debug logs
  console.log("Cart Items:", items);
  console.log(
    "Cart Item IDs:",
    items.map((item) => item.id)
  );
  console.log(
    "Duplicate IDs:",
    items.filter(
      (item, index) => items.findIndex((i) => i.id === item.id) !== index
    )
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={toggleCart}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <div className="w-screen max-w-md">
          <div className="flex h-full flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-6 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">
                Shopping Cart
              </h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={toggleCart}
              >
                <span className="sr-only">Close panel</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
              {items.length === 0 ? (
                <div
                  className="flex h-full flex-col items-center justify-center"
                  data-testid="cart-empty"
                >
                  <p className="text-lg text-gray-500">Your cart is empty</p>
                  <button
                    onClick={toggleCart}
                    className="mt-4 text-sm text-black hover:text-gray-600"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul className="space-y-8">
                  {items.map((item) => (
                    <li
                      key={`${item.productId}-${item.size || "no-size"}-${
                        item.color || "no-color"
                      }`}
                    >
                      <CartItem item={item} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                {/* Discount Component */}
                <CartDiscount />

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-base font-medium text-gray-500">
                    <p>Subtotal</p>
                    <p>${subtotal.toFixed(2)}</p>
                  </div>

                  {discount && (
                    <div className="flex justify-between text-base font-medium text-green-600">
                      <p>Discount</p>
                      <p>-${discountAmount.toFixed(2)}</p>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Total</p>
                    <p>${total.toFixed(2)}</p>
                  </div>
                </div>

                <p className="mt-0.5 text-sm text-gray-500">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="mt-6">
                  <a
                    href="/checkout"
                    className="flex items-center justify-center rounded-md border border-transparent bg-black px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-black/90"
                    data-testid="checkout-button"
                  >
                    Checkout
                  </a>
                </div>
                <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                  <button
                    type="button"
                    className="font-medium text-black hover:text-gray-600"
                    onClick={toggleCart}
                  >
                    Continue Shopping
                    <span aria-hidden="true"> &rarr;</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

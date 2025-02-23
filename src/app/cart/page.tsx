"use client";

import { useCart } from "@/context/cart-context";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { PaymentMethods } from "@/components/payment-methods";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, total } = useCart();

  if (!items || items.length === 0) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">
          Add some items to your cart to continue shopping.
        </p>
        <Link
          href="/products"
          className="bg-black text-white px-8 py-3 rounded-md hover:bg-black/90 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16 py-16">
        <h1 className="text-[32px] font-bold mb-12">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.id} className="flex py-8 gap-8">
                  <div className="relative h-[170px] w-[135px] bg-gray-50 rounded-md overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover object-center"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        {item.size && (
                          <p className="text-[15px] text-gray-500 mb-1">
                            Size: {item.size}
                          </p>
                        )}
                        {item.color && (
                          <p className="text-[15px] text-gray-500">
                            Color: {item.color}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center border rounded-md">
                        <button
                          type="button"
                          className="p-2 hover:bg-gray-50"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="p-2 hover:bg-gray-50"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-lg font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-gray-50 rounded-lg px-8 py-10">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Order Summary
              </h2>

              <dl className="space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-[15px] text-gray-600">Subtotal</dt>
                  <dd className="text-[15px] font-medium text-gray-900">
                    ${subtotal.toFixed(2)}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-[15px] text-gray-600">Shipping</dt>
                  <dd className="text-[15px] font-medium text-gray-900">
                    Free
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-[15px] text-gray-600">Tax</dt>
                  <dd className="text-[15px] font-medium text-gray-900">
                    ${(total - subtotal).toFixed(2)}
                  </dd>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">Total</dt>
                  <dd className="text-base font-medium text-gray-900">
                    ${total.toFixed(2)}
                  </dd>
                </div>
              </dl>

              <div className="mt-8">
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center bg-black text-white px-6 py-4 text-[15px] font-medium rounded-lg hover:bg-black/90 transition-colors"
                >
                  Proceed to Checkout
                </Link>
              </div>

              <div className="mt-6">
                <PaymentMethods />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "000100";

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          {/* Order Confirmation Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-medium text-gray-900 mb-2">
              Thank you for your order!
            </h1>
            <p className="text-gray-600">Order #{orderId}</p>
          </div>

          {/* Order Status */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              What&apos;s Next?
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black">
                    <span className="text-sm font-medium text-black">1</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    Order Confirmation
                  </p>
                  <p className="text-sm text-gray-500">
                    You will receive an email confirmation shortly at your
                    provided email address.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black">
                    <span className="text-sm font-medium text-black">2</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    Order Processing
                  </p>
                  <p className="text-sm text-gray-500">
                    We&apos;ll start processing your order right away and notify
                    you when it ships.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black">
                    <span className="text-sm font-medium text-black">3</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Delivery</p>
                  <p className="text-sm text-gray-500">
                    Your order will be delivered within the selected shipping
                    timeframe.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Support */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Need Help?
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              If you have any questions about your order, please contact our
              customer support team.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> support@luxe.com
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Phone:</span> 1-800-LUXE
              </p>
            </div>
          </div>

          {/* Continue Shopping Button */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-block bg-black text-white rounded-lg px-8 py-4 text-sm font-medium hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

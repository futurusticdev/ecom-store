"use client";

import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { StripeCardElementChangeEvent } from "@stripe/stripe-js";

interface PaymentStepProps {
  handleBack: () => void;
  handleContinue: () => void;
  isProcessingPayment: boolean;
  setIsProcessingPayment: (isProcessing: boolean) => void;
}

export default function PaymentStep({
  handleBack,
  handleContinue,
  isProcessingPayment,
  setIsProcessingPayment,
}: PaymentStepProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string | null>(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setIsProcessingPayment(true);
    setCardError(null);

    // In a real implementation, you would create a payment intent here
    // and confirm the payment with the card details

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessingPayment(false);
      handleContinue();
    }, 1500);
  };

  const handleCardChange = (event: StripeCardElementChangeEvent) => {
    setCardError(event.error ? event.error.message : null);
  };

  return (
    <div>
      <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-8">
        Payment Information
      </h2>

      {/* Test Mode Indicator */}
      <div className="mb-4 sm:mb-6 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start sm:items-center">
          <div className="flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-2 sm:ml-3">
            <h3 className="text-xs sm:text-sm font-medium text-blue-800">
              Test Mode
            </h3>
            <div className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-blue-700">
              <p>
                This checkout is in test mode. You can use the following test
                card:
              </p>
              <p className="mt-1 font-mono bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-blue-200 inline-block text-xs sm:text-sm">
                4242 4242 4242 4242
              </p>
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm">
                Use any future expiration date, any 3-digit CVC, and any postal
                code.
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Card Element */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Card Details
          </label>
          <div className="border border-gray-300 rounded-md p-3 sm:p-4 bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#32325d",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#dc2626",
                  },
                },
              }}
              onChange={handleCardChange}
            />
          </div>
          {cardError && (
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600">
              {cardError}
            </p>
          )}
        </div>

        {/* Billing Address */}
        <div>
          <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-4">
            Billing Address
          </h3>
          <div className="flex items-center mb-3 sm:mb-4">
            <input
              id="same-address"
              name="same-address"
              type="checkbox"
              checked={sameAsShipping}
              onChange={() => setSameAsShipping(!sameAsShipping)}
              className="h-3 w-3 sm:h-4 sm:w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <label
              htmlFor="same-address"
              className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-600"
            >
              Same as shipping address
            </label>
          </div>

          {!sameAsShipping && (
            <div className="grid grid-cols-1 gap-y-3 sm:gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  First name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-black focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Last name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-black focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-black focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-black focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Postal code
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-black focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Country
                </label>
                <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-black focus:border-black">
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 sm:pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleBack}
            className="bg-white py-1.5 sm:py-2 px-3 sm:px-4 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isProcessingPayment || !stripe}
            className="bg-black py-1.5 sm:py-2 px-3 sm:px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessingPayment ? "Processing..." : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}

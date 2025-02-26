"use client";

import React from "react";

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface ReviewStepProps {
  shippingInfo: ShippingInfo;
  selectedShipping: string;
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
  setCurrentStep: (step: number) => void;
}

export default function ReviewStep({
  shippingInfo,
  selectedShipping,
  termsAccepted,
  setTermsAccepted,
  setCurrentStep,
}: ReviewStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-8">
          Review Your Order
        </h2>

        {/* Shipping Information Review */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-gray-900">
              Shipping Information
            </h3>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-sm text-gray-600 hover:text-black"
            >
              Edit
            </button>
          </div>
          <div className="text-sm text-gray-600">
            <p className="mb-1">
              {shippingInfo.firstName} {shippingInfo.lastName}
            </p>
            <p className="mb-1">{shippingInfo.address}</p>
            <p className="mb-1">
              {shippingInfo.city}, {shippingInfo.postalCode}
            </p>
            <p className="mb-1">{shippingInfo.country}</p>
            <p className="mt-3">
              <span className="font-medium">Shipping Method: </span>
              {selectedShipping === "standard"
                ? "Standard Shipping (5-7 business days)"
                : "Express Shipping (2-3 business days)"}
            </p>
          </div>
        </div>

        {/* Payment Method Review */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-gray-900">
              Payment Method
            </h3>
            <button
              onClick={() => setCurrentStep(2)}
              className="text-sm text-gray-600 hover:text-black"
            >
              Edit
            </button>
          </div>
          <div className="text-sm text-gray-600">
            <p>Credit Card ending in ****</p>
            <p className="mt-2">
              <span className="font-medium">Billing Address: </span>
              Same as shipping
            </p>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-center mb-6">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
          />
          <label htmlFor="terms" className="ml-3">
            <span className="text-sm text-gray-600">
              I agree to the{" "}
              <a href="#" className="text-black hover:underline">
                Terms and Conditions
              </a>{" "}
              and{" "}
              <a href="#" className="text-black hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

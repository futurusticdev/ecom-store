"use client";

import { useCart } from "@/context/cart-context";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const steps = [
  { id: 1, name: "Shipping" },
  { id: 2, name: "Payment" },
  { id: 3, name: "Review" },
];

const SHIPPING_OPTIONS = {
  standard: {
    id: "standard",
    name: "Standard Shipping",
    description: "5-7 business days",
    price: 0,
  },
  express: {
    id: "express",
    name: "Express Shipping",
    description: "2-3 business days",
    price: 15,
  },
};

function PaymentStep() {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/thank-you`,
      },
    });

    if (error) {
      console.error("[error]", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-8">
          Payment Method
        </h2>
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="card"
                    name="payment-method"
                    type="radio"
                    defaultChecked
                    className="h-4 w-4 text-black focus:ring-black border-gray-300"
                  />
                  <label htmlFor="card" className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">
                      Credit Card
                    </span>
                  </label>
                </div>
              </div>
              <div className="mt-6">
                <PaymentElement />
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Test Mode:</strong> Use these card numbers for
                  testing:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-blue-600">
                  <li>Visa: 4242 4242 4242 4242</li>
                  <li>Mastercard: 5555 5555 5555 4444</li>
                  <li>American Express: 3782 822463 10005</li>
                  <li>Use any future date for expiry and any 3-digit CVC</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-8">
          Billing Address
        </h2>
        <div className="flex items-center mb-6">
          <input
            id="same-as-shipping"
            name="same-as-shipping"
            type="checkbox"
            defaultChecked
            className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
          />
          <label htmlFor="same-as-shipping" className="ml-3">
            <span className="text-sm font-medium text-gray-900">
              Same as shipping address
            </span>
          </label>
        </div>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedShipping, setSelectedShipping] = useState<
    "standard" | "express"
  >("standard");
  const [clientSecret, setClientSecret] = useState<string>();
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "US",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Calculate totals
  const shippingCost = SHIPPING_OPTIONS[selectedShipping].price;
  const taxRate = 0.1; // 10% tax rate
  const taxAmount = subtotal * taxRate;
  const total = subtotal + shippingCost + taxAmount;

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    if (currentStep === 2) {
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret))
        .catch((error) => console.error("Error:", error));
    }
  }, [currentStep, total]);

  if (!items || items.length === 0) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-medium mb-4">Your cart is empty</h1>
        <p className="text-gray-500">
          Add some items to your cart to checkout.
        </p>
      </div>
    );
  }

  const handleShippingChange = (method: "standard" | "express") => {
    setSelectedShipping(method);
  };

  const handleShippingInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleContinue = async () => {
    if (currentStep === 3 && !termsAccepted) {
      alert("Please accept the terms and conditions to place your order");
      return;
    }

    if (currentStep === steps.length) {
      // Get the last order ID from localStorage or start from 100
      const lastOrderId = parseInt(localStorage.getItem("lastOrderId") || "99");
      const newOrderId = lastOrderId + 1;

      // Store the new order ID
      localStorage.setItem("lastOrderId", newOrderId.toString());

      // Format order ID to be 6 digits with leading zeros
      const formattedOrderId = newOrderId.toString().padStart(6, "0");

      // Clear the cart
      clearCart();

      // Redirect to thank you page
      window.location.href = `/thank-you?orderId=${formattedOrderId}`;
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const options: StripeElementsOptions = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#000000",
          },
        },
      }
    : {};

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-16">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  step.id === currentStep
                    ? "bg-black text-white"
                    : step.id < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {step.id < currentStep ? "✓" : step.id}
              </div>
              <span
                className={`ml-4 text-sm font-medium ${
                  step.id === currentStep ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div className="ml-4 h-[1px] w-24 bg-gray-200" />
              )}
            </div>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
          <div className="lg:col-span-7">
            {currentStep === 1 ? (
              // Shipping step content
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-8">
                    Shipping Information
                  </h2>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                    <div className="col-span-1">
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={shippingInfo.firstName}
                        onChange={handleShippingInfoChange}
                        className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-black focus:ring-black"
                      />
                    </div>

                    <div className="col-span-1">
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={shippingInfo.lastName}
                        onChange={handleShippingInfoChange}
                        className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-black focus:ring-black"
                      />
                    </div>

                    <div className="col-span-2">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={shippingInfo.email}
                        onChange={handleShippingInfoChange}
                        className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-black focus:ring-black"
                      />
                    </div>

                    <div className="col-span-2">
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        value={shippingInfo.address}
                        onChange={handleShippingInfoChange}
                        className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-black focus:ring-black"
                      />
                    </div>

                    <div className="col-span-1">
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={shippingInfo.city}
                        onChange={handleShippingInfoChange}
                        className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-black focus:ring-black"
                      />
                    </div>

                    <div className="col-span-1">
                      <label
                        htmlFor="postalCode"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        value={shippingInfo.postalCode}
                        onChange={handleShippingInfoChange}
                        className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-black focus:ring-black"
                      />
                    </div>

                    <div className="col-span-2">
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Country
                      </label>
                      <select
                        id="country"
                        value={shippingInfo.country}
                        onChange={handleShippingInfoChange}
                        className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-black focus:ring-black"
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-8">
                    Shipping Method
                  </h2>

                  <div className="space-y-4">
                    <label
                      className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer ${
                        selectedShipping === "standard"
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="shipping"
                          value="standard"
                          checked={selectedShipping === "standard"}
                          onChange={() => handleShippingChange("standard")}
                          className="h-4 w-4 text-black focus:ring-black border-gray-300"
                        />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {SHIPPING_OPTIONS.standard.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {SHIPPING_OPTIONS.standard.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        Free
                      </span>
                    </label>

                    <label
                      className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer ${
                        selectedShipping === "express"
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="shipping"
                          value="express"
                          checked={selectedShipping === "express"}
                          onChange={() => handleShippingChange("express")}
                          className="h-4 w-4 text-black focus:ring-black border-gray-300"
                        />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {SHIPPING_OPTIONS.express.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {SHIPPING_OPTIONS.express.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        ${SHIPPING_OPTIONS.express.price.toFixed(2)}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ) : currentStep === 2 ? (
              // Payment step content
              clientSecret ? (
                <Elements stripe={stripePromise} options={options}>
                  <PaymentStep />
                </Elements>
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
                </div>
              )
            ) : currentStep === 3 ? (
              // Review step content
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
            ) : null}
          </div>

          <div className="mt-10 lg:col-span-5 lg:mt-0">
            <div className="bg-gray-50 rounded-lg px-6 py-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Order Summary
              </h2>

              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.id} className="flex py-6">
                    <div className="relative h-24 w-20 rounded-md overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover object-center"
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium">{item.name}</h3>
                          <p className="ml-4 text-sm font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        {item.size && (
                          <p className="mt-1 text-sm text-gray-500">
                            Size: {item.size}
                          </p>
                        )}
                        {item.color && (
                          <p className="mt-1 text-sm text-gray-500">
                            Color: {item.color}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-1 items-end">
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <dl className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    ${subtotal.toFixed(2)}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Shipping</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {shippingCost === 0
                      ? "Free"
                      : `$${shippingCost.toFixed(2)}`}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Tax</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    ${taxAmount.toFixed(2)}
                  </dd>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">Total</dt>
                  <dd className="text-base font-medium text-gray-900">
                    ${total.toFixed(2)}
                  </dd>
                </div>
              </dl>

              <div className="mt-8 space-y-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-full bg-white text-black border border-gray-200 rounded-lg px-6 py-4 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleContinue}
                  className="w-full bg-black text-white rounded-lg px-6 py-4 text-sm font-medium hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  {currentStep === steps.length - 1
                    ? "Place Order"
                    : "Continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

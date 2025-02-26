"use client";

import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCart, CartItem, Discount } from "@/context/cart-context";
import { CheckoutProvider, useCheckout } from "@/contexts/CheckoutContext";
import StepsIndicator from "@/components/checkout/StepsIndicator";
import ShippingStep from "@/components/checkout/ShippingStep";
import PaymentStep from "@/components/checkout/PaymentStep";
import ReviewStep from "@/components/checkout/ReviewStep";
import SuccessStep from "@/components/checkout/SuccessStep";
import OrderSummary from "@/components/checkout/OrderSummary";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Types
interface CheckoutContentProps {
  items: CartItem[];
  subtotal: number;
  discount: Discount | null;
  discountAmount: number;
  shippingCost: number;
  expressShippingCost: number;
  taxAmount: number;
  removeDiscount: () => void;
  clearCart: () => void;
  setPreventRedirect: (value: boolean) => void;
}

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Define checkout steps
const steps = [
  { id: 1, name: "Shipping" },
  { id: 2, name: "Payment" },
  { id: 3, name: "Review" },
  { id: 4, name: "Confirmation" },
];

// Loading component
function LoadingState() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
          Loading checkout...
        </h1>
        <div className="flex justify-center items-center">
          <div className="relative h-32 w-32">
            {/* Vertical part of L with gradient and animation */}
            <div
              className="absolute left-0 top-0 h-24 w-6 rounded-t-md"
              style={{
                background: "linear-gradient(to bottom, #000000, #333333)",
                animation: "pulseAndGlow 2s infinite alternate",
              }}
            ></div>

            {/* Horizontal part of L with gradient and animation */}
            <div
              className="absolute left-0 bottom-0 h-6 w-24 rounded-r-md"
              style={{
                background: "linear-gradient(to right, #000000, #333333)",
                animation: "pulseAndGlow 2s infinite alternate-reverse",
              }}
            ></div>

            {/* Animated dots with color transitions */}
            <div
              className="absolute left-8 top-4 h-3 w-3 rounded-full"
              style={{
                animation: "pingAndChangeColor 1.5s infinite",
                background: "#4a90e2",
              }}
            ></div>
            <div
              className="absolute left-14 top-10 h-3 w-3 rounded-full"
              style={{
                animation: "pingAndChangeColor 1.8s infinite",
                animationDelay: "0.3s",
                background: "#50e3c2",
              }}
            ></div>
            <div
              className="absolute left-20 top-16 h-3 w-3 rounded-full"
              style={{
                animation: "pingAndChangeColor 1.6s infinite",
                animationDelay: "0.6s",
                background: "#b8e986",
              }}
            ></div>
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-500">
          Preparing your shopping experience...
        </p>

        {/* Add custom keyframes for animations */}
        <style jsx>{`
          @keyframes pulseAndGlow {
            0% {
              opacity: 0.7;
              box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
            }
            100% {
              opacity: 1;
              box-shadow: 0 0 15px rgba(0, 0, 0, 0.8);
            }
          }

          @keyframes pingAndChangeColor {
            0% {
              transform: scale(0.8);
              opacity: 1;
            }
            50% {
              transform: scale(1.5);
              opacity: 0.5;
            }
            100% {
              transform: scale(0.8);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

// Empty cart component
function EmptyCart() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Your cart is empty
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Add some items to your cart before checking out.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-900"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main checkout component
export default function CheckoutPage() {
  const [preventRedirect, setPreventRedirect] = useState(false);
  const {
    items,
    subtotal,
    discount,
    discountAmount,
    removeDiscount,
    isLoaded,
    clearCart,
  } = useCart();

  // Check if we have a completed order in session storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const orderCompleted = sessionStorage.getItem("orderCompleted");
      if (orderCompleted === "true") {
        setPreventRedirect(true);
      }
    }
  }, []);

  // Calculate costs
  const shippingCost = 0;
  const expressShippingCost = 15;
  const taxRate = 0.08;
  const taxAmount = subtotal * taxRate;

  // Get current step from storage
  const getCurrentStepFromStorage = () => {
    if (typeof window !== "undefined") {
      // First check browser history state
      const historyState = window.history.state;
      if (
        historyState &&
        historyState.completedOrder &&
        historyState.currentStep
      ) {
        return historyState.currentStep;
      }

      const savedStep = localStorage.getItem("checkoutStep");
      return savedStep ? parseInt(savedStep) : 1;
    }
    return 1;
  };

  // Check if we're on the confirmation step
  useEffect(() => {
    const isConfirmationStep = getCurrentStepFromStorage() === 4;
    if (isConfirmationStep) {
      setPreventRedirect(true);
    }
  }, []);

  // Early returns for special states
  if (!isLoaded) {
    return <LoadingState />;
  }

  const isConfirmationStep = getCurrentStepFromStorage() === 4;

  // Only show empty cart message if we're not on confirmation step
  if (items.length === 0 && !isConfirmationStep && !preventRedirect) {
    return <EmptyCart />;
  }

  // Main checkout content
  return (
    <CheckoutProvider>
      <Elements stripe={stripePromise}>
        <CheckoutContent
          items={items}
          subtotal={subtotal}
          discount={discount}
          discountAmount={discountAmount}
          shippingCost={shippingCost}
          expressShippingCost={expressShippingCost}
          taxAmount={taxAmount}
          removeDiscount={removeDiscount}
          clearCart={clearCart}
          setPreventRedirect={setPreventRedirect}
        />
      </Elements>
    </CheckoutProvider>
  );
}

// Checkout content component with access to checkout context
function CheckoutContent({
  items,
  subtotal,
  discount,
  discountAmount,
  shippingCost,
  expressShippingCost,
  taxAmount,
  removeDiscount,
  clearCart,
  setPreventRedirect,
}: CheckoutContentProps) {
  const router = useRouter();
  const {
    currentStep,
    setCurrentStep,
    shippingInfo,
    selectedShipping,
    termsAccepted,
    setTermsAccepted,
    isProcessingPayment,
    setIsProcessingPayment,
    orderNumber,
    handleShippingSubmit,
    handlePaymentSuccess,
    handlePlaceOrder,
  } = useCheckout();

  // Handle successful order completion
  useEffect(() => {
    if (orderNumber && currentStep === 4) {
      // Set prevent redirect flag to true
      setPreventRedirect(true);

      // Store the order completion state in sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem("orderCompleted", "true");

        // Save the current URL state with order information in browser history
        // This ensures that if a user navigates away and comes back using browser history,
        // they'll see the thank you page
        const orderState = {
          orderNumber,
          currentStep: 4,
          completedOrder: true,
        };

        // Replace current history state to preserve the order completion
        window.history.replaceState(orderState, "", window.location.pathname);
      }
    }
  }, [orderNumber, currentStep, setPreventRedirect]);

  // Check for order completion in browser history on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if we have order state in history
      const historyState = window.history.state;
      if (
        historyState &&
        historyState.completedOrder &&
        historyState.orderNumber
      ) {
        // If we have order state in history, restore the order completion state
        setPreventRedirect(true);
        if (currentStep !== 4) {
          setCurrentStep(4);
        }
      }
    }
  }, [setCurrentStep, currentStep, setPreventRedirect]);

  // Force display of step 4 if order number exists on component mount
  useEffect(() => {
    if (orderNumber && currentStep !== 4) {
      setCurrentStep(4);
    }
  }, [orderNumber, currentStep, setCurrentStep]);

  // Calculate effective shipping cost based on selected method
  const effectiveShippingCost =
    discount?.type === "SHIPPING"
      ? 0
      : selectedShipping === "express"
      ? expressShippingCost
      : shippingCost;

  // Calculate effective discount amount
  const effectiveDiscountAmount =
    discount?.type === "SHIPPING"
      ? selectedShipping === "express"
        ? expressShippingCost
        : shippingCost
      : discountAmount || 0;

  // Calculate final total with selected shipping method
  const finalTotal =
    subtotal + taxAmount - effectiveDiscountAmount + effectiveShippingCost;

  // Handle back button
  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle continue button
  const handleContinue = () => {
    if (currentStep === 3 && termsAccepted) {
      // Explicitly handle the order placement
      handlePlaceOrder();
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Show order summary even on final step
  const showOrderSummary = true;

  return (
    <div className="bg-gray-50">
      {/* Test Mode Banner */}
      <div className="bg-blue-600 text-white text-center py-2 px-4">
        <p className="text-sm font-medium">
          Test Mode Active — No real payments will be processed
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="max-w-2xl mx-auto lg:max-w-none">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 sm:mb-8 text-center lg:text-left">
            {currentStep === 4 ? "Order Confirmation" : "Checkout"}
          </h1>

          {/* Steps indicator */}
          <div className="mb-8 sm:mb-12 overflow-x-auto pb-2 -mx-4 px-4 sm:overflow-visible sm:pb-0 sm:px-0 sm:-mx-0">
            <StepsIndicator steps={steps} currentStep={currentStep} />
          </div>

          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            {/* Main content */}
            <div className="lg:col-span-7">
              <div className="bg-white shadow-sm rounded-lg p-4 sm:p-8">
                {/* Step 1: Shipping */}
                {currentStep === 1 && (
                  <ShippingStep
                    handleContinue={handleShippingSubmit}
                    defaultValues={shippingInfo || undefined}
                  />
                )}

                {/* Step 2: Payment */}
                {currentStep === 2 && (
                  <PaymentStep
                    handleBack={handleBack}
                    handleContinue={handlePaymentSuccess}
                    isProcessingPayment={isProcessingPayment}
                    setIsProcessingPayment={setIsProcessingPayment}
                  />
                )}

                {/* Step 3: Review */}
                {currentStep === 3 && shippingInfo && (
                  <ReviewStep
                    shippingInfo={shippingInfo}
                    selectedShipping={selectedShipping}
                    termsAccepted={termsAccepted}
                    setTermsAccepted={setTermsAccepted}
                    setCurrentStep={setCurrentStep}
                  />
                )}

                {/* Step 4: Success */}
                {currentStep === 4 && (
                  <div className="flex justify-center items-center">
                    <div className="w-full max-w-3xl">
                      <SuccessStep
                        orderNumber={orderNumber || "ORD-000000"}
                        email={shippingInfo?.email || ""}
                        items={items}
                        subtotal={subtotal}
                        shipping={effectiveShippingCost}
                        tax={taxAmount}
                        discount={discount}
                        discountAmount={effectiveDiscountAmount}
                        total={finalTotal}
                        date={new Date().toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      />
                      <div className="mt-8 mb-4 text-center">
                        <button
                          onClick={() => {
                            clearCart();
                            router.push("/");
                          }}
                          className="inline-flex items-center px-6 sm:px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200 w-full sm:w-auto"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order summary - show only if not on success step */}
            {showOrderSummary && currentStep !== 4 && (
              <div className="mt-8 lg:mt-0 lg:col-span-5 sticky top-4">
                <OrderSummary
                  items={items}
                  subtotal={subtotal}
                  discount={discount}
                  discountAmount={discountAmount}
                  effectiveShippingCost={effectiveShippingCost}
                  effectiveDiscountAmount={effectiveDiscountAmount}
                  taxAmount={taxAmount}
                  total={finalTotal}
                  currentStep={currentStep}
                  handleBack={handleBack}
                  handleContinue={handleContinue}
                  stepsLength={steps.length}
                  removeDiscount={removeDiscount}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

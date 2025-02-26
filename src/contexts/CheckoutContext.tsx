"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useCart } from "@/context/cart-context";

// Define the shape of shipping information
export interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

// Define the context type
interface CheckoutContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  shippingInfo: ShippingInfo | null;
  setShippingInfo: (info: ShippingInfo) => void;
  selectedShipping: string;
  setSelectedShipping: (method: string) => void;
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
  isProcessingPayment: boolean;
  setIsProcessingPayment: (isProcessing: boolean) => void;
  orderNumber: string | null;
  setOrderNumber: (number: string) => void;
  handleShippingSubmit: (data: ShippingInfo, shippingMethod: string) => void;
  handlePaymentSuccess: () => void;
  handlePlaceOrder: () => Promise<void>;
  resetCheckout: () => void;
}

// Create the context
const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined
);

// Provider component
export function CheckoutProvider({ children }: { children: ReactNode }) {
  const { clearCart } = useCart();

  // Initialize order number from history state or session storage
  const initializeOrderNumber = (): string | null => {
    if (typeof window !== "undefined") {
      // First check browser history state
      const historyState = window.history.state;
      if (historyState && historyState.orderNumber) {
        return historyState.orderNumber;
      }

      // Then check session storage
      const orderCompleted = sessionStorage.getItem("orderCompleted");
      if (orderCompleted === "true") {
        const savedOrderNumber = sessionStorage.getItem("orderNumber");
        if (savedOrderNumber) {
          return savedOrderNumber;
        }
      }
    }
    return null;
  };

  // State for checkout steps
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== "undefined") {
      // Check if we have order state in history
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
  });

  const persistentSetCurrentStep = (step: number) => {
    setCurrentStep(step);
    if (typeof window !== "undefined") {
      localStorage.setItem("checkoutStep", step.toString());
    }
  };

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(
    initializeOrderNumber
  );

  // Handle shipping form submission
  const handleShippingSubmit = (data: ShippingInfo, shippingMethod: string) => {
    setShippingInfo(data);
    setSelectedShipping(shippingMethod);
    setCurrentStep(2); // Move to payment step
  };

  // Handle successful payment
  const handlePaymentSuccess = () => {
    setCurrentStep(3); // Move to review step
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    if (!termsAccepted || !shippingInfo) {
      return;
    }

    try {
      // In a real implementation, you would make an API call to create the order
      // For now, we'll simulate it with a timeout
      setIsProcessingPayment(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate a random order number
      const generatedOrderNumber = `ORD-${Math.floor(
        100000 + Math.random() * 900000
      )}`;
      setOrderNumber(generatedOrderNumber);

      // Save order number to session storage
      if (typeof window !== "undefined") {
        sessionStorage.setItem("orderNumber", generatedOrderNumber);
      }

      // First set success step
      setCurrentStep(4);

      // Then clear cart after 1 second delay
      setTimeout(() => {
        clearCart();
      }, 1000);
    } catch (error) {
      console.error("Error placing order:", error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Reset checkout state
  const resetCheckout = () => {
    setCurrentStep(1);
    setShippingInfo(null);
    setSelectedShipping("standard");
    setTermsAccepted(false);
    setOrderNumber(null);

    // Clear session storage
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("orderCompleted");
      sessionStorage.removeItem("orderNumber");
    }
  };

  // Context value
  const value = {
    currentStep,
    setCurrentStep: persistentSetCurrentStep,
    shippingInfo,
    setShippingInfo,
    selectedShipping,
    setSelectedShipping,
    termsAccepted,
    setTermsAccepted,
    isProcessingPayment,
    setIsProcessingPayment,
    orderNumber,
    setOrderNumber,
    handleShippingSubmit,
    handlePaymentSuccess,
    handlePlaceOrder,
    resetCheckout,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

// Custom hook to use the checkout context
export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}

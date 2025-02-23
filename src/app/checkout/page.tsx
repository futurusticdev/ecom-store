"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutForm } from "@/components/checkout/checkout-form";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Define proper types for the form data
interface FormData {
  email: string;
  name: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-black hover:text-gray-600"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: FormData) => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Checkout failed");
      }

      // Handle successful checkout
      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred during checkout");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Checkout
          </h1>
          <Elements stripe={stripePromise}>
            <CheckoutForm onSubmit={handleSubmit} />
          </Elements>
        </div>
      </div>
    </div>
  );
}

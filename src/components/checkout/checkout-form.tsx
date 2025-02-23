"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const checkoutSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.object({
    line1: z.string().min(1, "Address is required"),
    line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postal_code: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutResponse {
  success: boolean;
  message?: string;
  orderId?: string;
}

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => Promise<CheckoutResponse>;
}

export function CheckoutForm({ onSubmit }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const handleFormSubmit = async (data: CheckoutFormData) => {
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: stripeError } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement)!,
        billing_details: {
          name: data.name,
          email: data.email,
          address: {
            line1: data.address.line1,
            line2: data.address.line2,
            city: data.address.city,
            state: data.address.state,
            postal_code: data.address.postal_code,
            country: data.address.country,
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register("email")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            {...register("name")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Shipping Address
          </h3>

          <div>
            <label
              htmlFor="line1"
              className="block text-sm font-medium text-gray-700"
            >
              Address Line 1
            </label>
            <input
              type="text"
              id="line1"
              {...register("address.line1")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
            />
            {errors.address?.line1 && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address.line1.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="line2"
              className="block text-sm font-medium text-gray-700"
            >
              Address Line 2 (Optional)
            </label>
            <input
              type="text"
              id="line2"
              {...register("address.line2")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700"
              >
                City
              </label>
              <input
                type="text"
                id="city"
                {...register("address.city")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              />
              {errors.address?.city && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.address.city.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700"
              >
                State
              </label>
              <input
                type="text"
                id="state"
                {...register("address.state")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              />
              {errors.address?.state && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.address.state.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="postal_code"
                className="block text-sm font-medium text-gray-700"
              >
                Postal Code
              </label>
              <input
                type="text"
                id="postal_code"
                {...register("address.postal_code")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              />
              {errors.address?.postal_code && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.address.postal_code.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700"
              >
                Country
              </label>
              <input
                type="text"
                id="country"
                {...register("address.country")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              />
              {errors.address?.country && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.address.country.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
          <div className="rounded-md border border-gray-300 p-4">
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
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-black py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Complete Order"}
        </button>
      </div>
    </form>
  );
}

"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const shippingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

interface ShippingStepProps {
  handleContinue: (data: ShippingFormValues, shippingMethod: string) => void;
  defaultValues?: ShippingFormValues;
}

export default function ShippingStep({
  handleContinue,
  defaultValues = {
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "United States",
  },
}: ShippingStepProps) {
  const [selectedShipping, setSelectedShipping] = useState("standard");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues,
  });

  const onSubmit = (data: ShippingFormValues) => {
    handleContinue(data, selectedShipping);
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-8">
        Shipping Information
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First name
            </label>
            <input
              type="text"
              id="firstName"
              {...register("firstName")}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
            {errors.firstName && (
              <p className="mt-2 text-sm text-red-600">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last name
            </label>
            <input
              type="text"
              id="lastName"
              {...register("lastName")}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
            {errors.lastName && (
              <p className="mt-2 text-sm text-red-600">
                {errors.lastName.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              {...register("address")}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
            {errors.address && (
              <p className="mt-2 text-sm text-red-600">
                {errors.address.message}
              </p>
            )}
          </div>

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
              {...register("city")}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
            {errors.city && (
              <p className="mt-2 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="postalCode"
              className="block text-sm font-medium text-gray-700"
            >
              Postal code
            </label>
            <input
              type="text"
              id="postalCode"
              {...register("postalCode")}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
            {errors.postalCode && (
              <p className="mt-2 text-sm text-red-600">
                {errors.postalCode.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700"
            >
              Country
            </label>
            <select
              id="country"
              {...register("country")}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            >
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
            </select>
            {errors.country && (
              <p className="mt-2 text-sm text-red-600">
                {errors.country.message}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Shipping Method
          </h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="standard"
                name="shipping-method"
                type="radio"
                checked={selectedShipping === "standard"}
                onChange={() => setSelectedShipping("standard")}
                className="h-4 w-4 text-black focus:ring-black border-gray-300"
              />
              <label htmlFor="standard" className="ml-3 flex flex-col">
                <span className="block text-sm font-medium text-gray-900">
                  Standard Shipping
                </span>
                <span className="block text-sm text-gray-500">
                  5-7 business days - Free
                </span>
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="express"
                name="shipping-method"
                type="radio"
                checked={selectedShipping === "express"}
                onChange={() => setSelectedShipping("express")}
                className="h-4 w-4 text-black focus:ring-black border-gray-300"
              />
              <label htmlFor="express" className="ml-3 flex flex-col">
                <span className="block text-sm font-medium text-gray-900">
                  Express Shipping
                </span>
                <span className="block text-sm text-gray-500">
                  2-3 business days - $15.00
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Processing..." : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}

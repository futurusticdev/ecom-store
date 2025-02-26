"use client";

import { useState } from "react";

interface ShippingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface ShippingFormProps {
  onSubmit: (data: ShippingFormData) => void;
}

export function ShippingForm({ onSubmit }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity()) {
      onSubmit(formData);
    } else {
      // Let the browser handle displaying validation messages
      form.reportValidity();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-xs sm:text-sm font-medium text-gray-700"
          >
            First name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-200 px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-xs sm:text-sm font-medium text-gray-700"
          >
            Last name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-200 px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-xs sm:text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-200 px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-xs sm:text-sm font-medium text-gray-700"
        >
          Phone number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          required
          pattern="[0-9]{10,}"
          value={formData.phone}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-200 px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-xs sm:text-sm font-medium text-gray-700"
        >
          Address
        </label>
        <input
          type="text"
          id="address"
          name="address"
          required
          value={formData.address}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-200 px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div>
        <label
          htmlFor="apartment"
          className="block text-xs sm:text-sm font-medium text-gray-700"
        >
          Apartment, suite, etc.
        </label>
        <input
          type="text"
          id="apartment"
          name="apartment"
          value={formData.apartment}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-200 px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label
            htmlFor="city"
            className="block text-xs sm:text-sm font-medium text-gray-700"
          >
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            required
            value={formData.city}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-200 px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div>
          <label
            htmlFor="state"
            className="block text-xs sm:text-sm font-medium text-gray-700"
          >
            State / Province
          </label>
          <input
            type="text"
            id="state"
            name="state"
            required
            value={formData.state}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-200 px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label
            htmlFor="postalCode"
            className="block text-xs sm:text-sm font-medium text-gray-700"
          >
            Postal code
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            required
            pattern="[0-9]{5,}"
            value={formData.postalCode}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-200 px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div>
          <label
            htmlFor="country"
            className="block text-xs sm:text-sm font-medium text-gray-700"
          >
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            required
            value={formData.country}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-200 px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
        <button
          type="submit"
          className="w-full rounded-md border border-transparent bg-black px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white shadow-sm hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          Continue to payment
        </button>
      </div>
    </form>
  );
}

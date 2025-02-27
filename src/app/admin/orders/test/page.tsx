"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EditOrderForm from "@/components/admin/orders/EditOrderForm";
import { Button } from "@/components/ui/button";

export default function TestEditOrderPage() {
  const router = useRouter();
  const [testOrderId, setTestOrderId] = useState("cm7nb8ydj000r"); // Example order ID
  const [showForm, setShowForm] = useState(false);

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleSaved = () => {
    setShowForm(false);
    // Show success message
    alert("Order saved successfully!");
  };

  return (
    <div className="p-6">
      {!showForm ? (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">Test Edit Order Form</h1>

          <div className="mb-4">
            <label
              htmlFor="orderId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Order ID
            </label>
            <input
              type="text"
              id="orderId"
              value={testOrderId}
              onChange={(e) => setTestOrderId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <Button
            onClick={() => setShowForm(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            Test Edit Form
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/admin/orders")}
            className="w-full mt-3"
          >
            Back to Orders
          </Button>
        </div>
      ) : (
        <EditOrderForm
          orderId={testOrderId}
          onCancel={handleCancel}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

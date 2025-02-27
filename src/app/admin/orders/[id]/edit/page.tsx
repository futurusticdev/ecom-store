"use client";

import { useRouter, useParams } from "next/navigation";
import EditOrderForm from "@/components/admin/orders/EditOrderForm";

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id
    ? Array.isArray(params.id)
      ? params.id[0]
      : params.id
    : "";

  if (!orderId) {
    router.push("/admin/orders");
    return null;
  }

  const handleCancel = () => {
    router.push("/admin/orders");
  };

  const handleSaved = () => {
    router.push(`/admin/orders?refresh=${Date.now()}`);
  };

  return (
    <EditOrderForm
      orderId={orderId}
      onCancel={handleCancel}
      onSaved={handleSaved}
    />
  );
}

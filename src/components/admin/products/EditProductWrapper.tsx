"use client";

import { useRouter } from "next/navigation";
import { EditProduct } from "./EditProduct";

interface EditProductWrapperProps {
  productId: string;
}

export function EditProductWrapper({ productId }: EditProductWrapperProps) {
  const router = useRouter();

  const handleCancel = () => {
    router.push("/admin/products");
  };

  return (
    <div className="container mx-auto py-6">
      <EditProduct productId={productId} onCancel={handleCancel} />
    </div>
  );
}

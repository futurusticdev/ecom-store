import { ProductsTable } from "@/components/admin/products/ProductsTable";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin | Products",
  description: "Manage your store products",
};

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
          >
            Add Product
          </Link>
        </div>
      </div>

      <ProductsTable />
    </div>
  );
}

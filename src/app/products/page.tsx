import { ProductsList } from "@/components/product/products-list";
import prisma from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products - Your Store",
  description: "Browse our collection of products",
};

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        inStock: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.category.findMany(),
  ]);

  // Ensure we always pass an array, even if empty
  const safeProducts = products || [];
  const safeCategories = categories || [];

  return (
    <div className="min-h-screen bg-white">
      <ProductsList
        initialProducts={safeProducts}
        categories={safeCategories}
      />
    </div>
  );
}

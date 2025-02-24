import { ProductsList } from "@/components/product/products-list";
import prisma from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products - Your Store",
  description: "Browse our collection of products",
};

export default async function ProductsPage() {
  const [products, categories, tags] = await Promise.all([
    prisma.product.findMany({
      where: {
        inStock: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    }),
    prisma.category.findMany(),
    prisma.tag.findMany(),
  ]);

  // Ensure we always pass arrays, even if empty
  const safeProducts = products || [];
  const safeCategories = categories || [];
  const safeTags = tags || [];

  return (
    <div className="min-h-screen bg-white">
      <ProductsList
        initialProducts={safeProducts}
        categories={safeCategories}
        tags={safeTags}
      />
    </div>
  );
}

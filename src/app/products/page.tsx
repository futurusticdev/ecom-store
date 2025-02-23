import prisma from "@/lib/db";
import { ProductsList } from "@/components/product/products-list";

export const dynamic = "force-dynamic";

async function getProducts() {
  const products = await prisma.product.findMany({
    take: 12,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
    },
  });

  return products;
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return categories;
}

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return <ProductsList initialProducts={products} categories={categories} />;
}

import { ProductClient } from "./product-client";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface Props {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: {
      slug: resolvedParams.slug,
    },
  });

  if (!product) {
    return {
      title: "Product Not Found - Your Store",
      description: "The requested product could not be found.",
    };
  }

  return {
    title: `${product.name} - Your Store`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: {
      slug: resolvedParams.slug,
    },
    include: {
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Fetch related products from the same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      NOT: {
        id: product.id,
      },
    },
    take: 4,
    orderBy: {
      createdAt: "desc",
    },
  });

  return <ProductClient product={product} relatedProducts={relatedProducts} />;
}

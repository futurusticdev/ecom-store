import { ProductsList } from "@/components/product/products-list";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { Prisma } from "@prisma/client";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    tags: {
      include: {
        tag: true;
      };
    };
  };
}>;

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
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    }) as unknown as ProductWithRelations[],
    prisma.category.findMany(),
  ]);

  // Transform products to match the expected format
  const safeProducts = products.map((product: ProductWithRelations) => {
    const { tags, ...rest } = product;
    return {
      ...rest,
      productTags: (tags as Array<{ tag: { id: string; name: string } }>).map(
        (tagRelation) => ({
          tag: tagRelation.tag,
        })
      ),
    };
  });

  const safeCategories = categories || [];

  // Get unique tags from products
  const uniqueTags = Array.from(
    new Set(
      products
        .flatMap((product: ProductWithRelations) => product.tags)
        .map(
          (tagRelation: { tag: { id: string; name: string } }) =>
            tagRelation.tag
        )
    )
  );

  return (
    <div className="min-h-screen bg-white">
      <ProductsList
        initialProducts={safeProducts}
        categories={safeCategories}
        tags={uniqueTags}
      />
    </div>
  );
}

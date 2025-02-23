import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: "clothing" },
      update: {},
      create: {
        id: "clothing",
        name: "Clothing",
        description: "Fashion clothing for all occasions",
      },
    }),
    prisma.category.upsert({
      where: { id: "accessories" },
      update: {},
      create: {
        id: "accessories",
        name: "Accessories",
        description: "Complete your look with our accessories",
      },
    }),
  ]);

  // Create products
  await Promise.all([
    prisma.product.upsert({
      where: { slug: "classic-black-t-shirt" },
      update: {},
      create: {
        name: "Classic Black T-Shirt",
        description: "A timeless black t-shirt made from premium cotton",
        price: 29.99,
        images: [
          "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800",
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800",
          "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800",
          "https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?auto=format&fit=crop&w=800",
        ],
        categoryId: "clothing",
        sizes: ["XS", "S", "M", "L", "XL"],
        slug: "classic-black-t-shirt",
      },
    }),
    prisma.product.upsert({
      where: { slug: "leather-weekender-bag" },
      update: {},
      create: {
        name: "Leather Weekender Bag",
        description: "Premium leather bag perfect for short trips",
        price: 199.99,
        images: [
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800",
          "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800",
          "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800",
          "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?auto=format&fit=crop&w=800",
        ],
        categoryId: "accessories",
        sizes: ["ONE SIZE"],
        slug: "leather-weekender-bag",
      },
    }),
    prisma.product.upsert({
      where: { slug: "premium-wool-sweater" },
      update: {},
      create: {
        name: "Premium Wool Sweater",
        description: "Luxurious wool sweater for cold weather",
        price: 149.99,
        images: [
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800",
          "https://images.unsplash.com/photo-1586765677067-f8030bd8e303?auto=format&fit=crop&w=800",
          "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800",
          "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800",
        ],
        categoryId: "clothing",
        sizes: ["S", "M", "L", "XL"],
        slug: "premium-wool-sweater",
      },
    }),
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "T-Shirts",
        slug: "t-shirts",
      },
    }),
    prisma.category.create({
      data: {
        name: "Hoodies",
        slug: "hoodies",
      },
    }),
  ]);

  // Create products
  await Promise.all(
    categories.map((category) =>
      prisma.product.create({
        data: {
          name: `${category.name} Example`,
          description: `A great ${category.name.toLowerCase()} for any occasion.`,
          price: 29.99,
          images: [
            `/images/${category.name.toLowerCase()}/1.jpg`,
            `/images/${category.name.toLowerCase()}/2.jpg`,
            `/images/${category.name.toLowerCase()}/3.jpg`,
          ],
          categoryId: category.id,
          sizes: ["S", "M", "L", "XL"],
          inStock: true,
          slug: `${category.name.toLowerCase()}-example`,
        },
      })
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

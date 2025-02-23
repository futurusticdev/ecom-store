const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

async function main() {
  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: "jackets" },
      update: {},
      create: {
        id: "jackets",
        name: "Jackets",
        description: "Stay warm and stylish with our collection of jackets",
      },
    }),
    prisma.category.upsert({
      where: { id: "shirts" },
      update: {},
      create: {
        id: "shirts",
        name: "Shirts",
        description: "Classic and modern shirts for every occasion",
      },
    }),
  ]);

  // Create products
  await prisma.product.upsert({
    where: { slug: "classic-leather-jacket" },
    update: {},
    create: {
      name: "Classic Leather Jacket",
      description: "A timeless leather jacket that never goes out of style",
      price: 299.99,
      images: [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5",
        "https://images.unsplash.com/photo-1551028719-00167b16eac6",
      ],
      categoryId: categories[0].id,
      sizes: ["S", "M", "L", "XL"],
      inStock: true,
      slug: "classic-leather-jacket",
    },
  });

  console.log("Seed data created successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

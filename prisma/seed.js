const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

async function main() {
  // Create categories first
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Women",
        slug: "women",
      },
    }),
    prisma.category.create({
      data: {
        name: "Men",
        slug: "men",
      },
    }),
    prisma.category.create({
      data: {
        name: "Accessories",
        slug: "accessories",
      },
    }),
  ]);

  // Sample products
  const products = [
    {
      name: "Classic White T-Shirt",
      description: "A timeless white t-shirt made from premium cotton",
      price: 29.99,
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
      ],
      categoryId: categories[1].id, // Men's category
      sizes: ["XS", "S", "M", "L", "XL"],
      inStock: true,
    },
    {
      name: "Slim Fit Jeans",
      description: "Modern slim fit jeans in dark blue wash",
      price: 79.99,
      images: [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
      ],
      categoryId: categories[1].id, // Men's category
      sizes: ["30x32", "32x32", "34x32", "36x32"],
      inStock: true,
    },
    {
      name: "Floral Summer Dress",
      description: "Light and breezy floral print dress perfect for summer",
      price: 89.99,
      images: [
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800",
      ],
      categoryId: categories[0].id, // Women's category
      sizes: ["XS", "S", "M", "L"],
      inStock: true,
    },
    {
      name: "Leather Crossbody Bag",
      description: "Elegant leather crossbody bag with gold hardware",
      price: 129.99,
      images: [
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
      ],
      categoryId: categories[2].id, // Accessories category
      sizes: ["ONE SIZE"],
      inStock: true,
    },
    {
      name: "Classic Blazer",
      description: "Tailored black blazer for a professional look",
      price: 149.99,
      images: [
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800",
      ],
      categoryId: categories[0].id, // Women's category
      sizes: ["XS", "S", "M", "L", "XL"],
      inStock: true,
    },
  ];

  // Create products
  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        slug: slugify(product.name),
      },
    });
  }

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

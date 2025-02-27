const { PrismaClient, OrderStatus, PaymentStatus } = require("@prisma/client");

const prisma = new PrismaClient();

async function createDummyProducts() {
  console.log("Creating dummy products for orders...");

  // Check if category exists or create it
  const category = await prisma.category.upsert({
    where: { id: "test-category" },
    update: {},
    create: {
      id: "test-category",
      name: "Test Category",
      description: "Category for test products",
    },
  });

  // Create test products
  const products = [];

  for (let i = 1; i <= 5; i++) {
    const product = await prisma.product.upsert({
      where: { slug: `test-product-${i}` },
      update: {},
      create: {
        name: `Test Product ${i}`,
        description: `Description for test product ${i}`,
        price: 99.99 + i * 10,
        images: [`https://picsum.photos/id/${i * 10}/500/500`],
        categoryId: category.id,
        sizes: ["S", "M", "L"],
        inStock: true,
        slug: `test-product-${i}`,
      },
    });

    products.push(product);
  }

  console.log(`Created ${products.length} test products`);
  return products;
}

async function main() {
  try {
    // First, get a user to assign the orders to
    const user = await prisma.user.findFirst();

    if (!user) {
      console.error("No users found. Please create a user first.");
      return;
    }

    console.log(`Found user: ${user.name} (${user.id})`);

    // Get or create products
    let products = await prisma.product.findMany({ take: 5 });

    if (products.length < 5) {
      console.log("Not enough products found. Creating test products...");
      products = await createDummyProducts();
    }

    console.log(`Using ${products.length} products for test orders`);

    // Create 5 orders with different statuses
    const orders = [
      // Order 1: Processing with Pending Payment
      {
        userId: user.id,
        status: OrderStatus.PROCESSING,
        paymentStatus: PaymentStatus.PENDING,
        total: 199.99,
        items: [
          {
            productId: products[0].id,
            quantity: 1,
            price: 199.99,
          },
        ],
      },

      // Order 2: Shipped with Paid Payment
      {
        userId: user.id,
        status: OrderStatus.SHIPPED,
        paymentStatus: PaymentStatus.PAID,
        total: 349.98,
        items: [
          {
            productId: products[1].id,
            quantity: 2,
            price: 174.99,
          },
        ],
      },

      // Order 3: Delivered with Paid Payment
      {
        userId: user.id,
        status: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.PAID,
        total: 299.99,
        items: [
          {
            productId: products[2].id,
            quantity: 1,
            price: 299.99,
          },
        ],
      },

      // Order 4: Cancelled with Refunded Payment
      {
        userId: user.id,
        status: OrderStatus.CANCELLED,
        paymentStatus: PaymentStatus.REFUNDED,
        total: 599.99,
        items: [
          {
            productId: products[3].id,
            quantity: 1,
            price: 599.99,
          },
        ],
      },

      // Order 5: Processing with Failed Payment
      {
        userId: user.id,
        status: OrderStatus.PROCESSING,
        paymentStatus: PaymentStatus.FAILED,
        total: 149.99,
        items: [
          {
            productId: products[4].id,
            quantity: 1,
            price: 149.99,
          },
        ],
      },
    ];

    console.log("Creating test orders...");

    // Create the orders and their items
    for (const orderData of orders) {
      const { items, ...orderInfo } = orderData;

      const order = await prisma.order.create({
        data: {
          ...orderInfo,
          items: {
            create: items,
          },
        },
        include: {
          items: true,
        },
      });

      console.log(
        `Created order ${order.id} with status ${order.status} and payment status ${order.paymentStatus}`
      );
    }

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
    console.error(error);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

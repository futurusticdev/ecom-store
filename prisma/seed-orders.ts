import { PrismaClient, OrderStatus, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // First, get a user to assign the orders to
    const user = await prisma.user.findFirst();

    if (!user) {
      console.error("No users found. Please create a user first.");
      return;
    }

    console.log(`Found user: ${user.name} (${user.id})`);

    // Get products to add to orders
    const products = await prisma.product.findMany({ take: 5 });

    if (products.length === 0) {
      console.error("No products found. Please create products first.");
      return;
    }

    console.log(`Found ${products.length} products`);

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
            productId: products[4 % products.length].id,
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

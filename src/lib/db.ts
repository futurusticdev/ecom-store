import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type GlobalWithPrisma = typeof globalThis & {
  prisma: PrismaClient | undefined;
};

const globalForPrisma = globalThis as GlobalWithPrisma;

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

export async function getUserStats(userId: string) {
  // Get current date and date 30 days ago for comparison
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(today.getDate() - 60);

  const [
    currentOrderCount,
    previousOrderCount,
    activeOrders,
    currentTotalSpent,
    previousTotalSpent,
    currentFavoriteCount,
    previousFavoriteCount,
  ] = await Promise.all([
    // Current period orders (last 30 days)
    prisma.order.count({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    // Previous period orders (30-60 days ago)
    prisma.order.count({
      where: {
        userId,
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
    }),
    // Active orders
    prisma.order.count({
      where: {
        userId,
        status: { in: ["PROCESSING", "SHIPPED"] },
      },
    }),
    // Current period spending (last 30 days)
    prisma.order.aggregate({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { total: true },
    }),
    // Previous period spending (30-60 days ago)
    prisma.order.aggregate({
      where: {
        userId,
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
      _sum: { total: true },
    }),
    // Current favorites count
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        _count: {
          select: { favorites: true },
        },
      },
    }),
    // We don't have historical data for favorites, so we'll use a mock value
    // In a real app, you would track this over time
    Promise.resolve({ _count: { favorites: 0 } }),
  ]);

  // Calculate total orders (all time)
  const totalOrders = await prisma.order.count({
    where: { userId },
  });

  // Calculate percentage changes
  const calculatePercentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const orderPercentChange = calculatePercentChange(
    currentOrderCount,
    previousOrderCount
  );
  const spendingPercentChange = calculatePercentChange(
    currentTotalSpent._sum.total || 0,
    previousTotalSpent._sum.total || 0
  );
  const favoritesPercentChange = calculatePercentChange(
    currentFavoriteCount?._count.favorites || 0,
    previousFavoriteCount?._count.favorites || 0
  );

  return {
    totalOrders,
    activeOrders,
    totalSpent: currentTotalSpent._sum.total ?? 0,
    savedItems: currentFavoriteCount?._count.favorites ?? 0,
    orderPercentChange: orderPercentChange.toFixed(2),
    spendingPercentChange: spendingPercentChange.toFixed(2),
    favoritesPercentChange: favoritesPercentChange.toFixed(2),
  };
}

export async function getRecentOrders(userId: string, limit = 5) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

export async function getUserAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
  });
}

export async function getUserFavorites(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      favorites: true,
    },
  });
}

export async function addToFavorites(userId: string, productId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      favorites: {
        connect: { id: productId },
      },
    },
  });
}

export async function removeFromFavorites(userId: string, productId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      favorites: {
        disconnect: { id: productId },
      },
    },
  });
}

export async function updateAddress(
  userId: string,
  addressId: string,
  data: Partial<AddressData>
) {
  return prisma.address.update({
    where: {
      id: addressId,
      userId, // Ensure the address belongs to the user
    },
    data,
  });
}

export async function createAddress(userId: string, data: AddressData) {
  // If this is the first address or marked as default, ensure it's set as default
  const addressCount = await prisma.address.count({
    where: { userId },
  });

  return prisma.address.create({
    data: {
      ...data,
      isDefault: addressCount === 0 ? true : data.isDefault,
      user: {
        connect: { id: userId },
      },
    },
  });
}

// Simplify by using generic Record type for the Address functions
type AddressData = {
  type: "SHIPPING" | "BILLING";
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

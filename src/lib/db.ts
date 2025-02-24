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
  const [orderCount, activeOrders, totalSpent, favoriteCount] =
    await Promise.all([
      prisma.order.count({
        where: { userId },
      }),
      prisma.order.count({
        where: {
          userId,
          status: { in: ["PROCESSING", "SHIPPED"] },
        },
      }),
      prisma.order.aggregate({
        where: { userId },
        _sum: { total: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          _count: {
            select: { favorites: true },
          },
        },
      }),
    ]);

  return {
    totalOrders: orderCount,
    activeOrders,
    totalSpent: totalSpent._sum.total ?? 0,
    savedItems: favoriteCount?._count.favorites ?? 0,
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

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import FavoritesList from "@/components/dashboard/favorites/FavoritesList";
import { redirect } from "next/navigation";

// Cache the favorites query with a shorter cache duration
const getCachedFavorites = unstable_cache(
  async ({
    userId,
    page = 1,
    limit = 12,
  }: {
    userId: string;
    page?: number;
    limit?: number;
  }) => {
    const skip = (page - 1) * limit;

    try {
      // Get user with favorites using the correct relation name
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          favorites: {
            skip,
            take: limit,
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              description: true,
              slug: true,
              inStock: true,
              sizes: true,
              categoryId: true,
              createdAt: true,
              updatedAt: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              favorites: true,
            },
          },
        },
      });

      return {
        favorites: user?.favorites || [],
        total: user?._count?.favorites || 0,
        totalPages: Math.ceil((user?._count?.favorites || 0) / limit),
      };
    } catch (error) {
      console.error("Error fetching favorites:", error);
      return {
        favorites: [],
        total: 0,
        totalPages: 0,
      };
    }
  },
  ["favorites-list"],
  { revalidate: 10 } // Cache for 10 seconds instead of 60 to ensure fresher data
);

export default async function FavoritesPage(props: {
  params: Promise<Record<string, string>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard/favorites");
  }

  const page =
    typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;

  // Pre-fetch server data
  const data = await getCachedFavorites({
    userId: session.user.id,
    page,
    limit: 12,
  });

  return (
    <div className="container max-w-6xl py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-8">Your Favorites</h1>

      <FavoritesList initialData={data} />
    </div>
  );
}

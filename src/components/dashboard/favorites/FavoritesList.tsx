import Link from "next/link";
import { Button } from "@/components/ui/button";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { FavoritesGrid } from "./FavoritesClient";

interface FavoritesListProps {
  userId: string;
  page?: number;
  limit?: number;
}

// Cache the favorites query
const getCachedFavorites = unstable_cache(
  async ({ userId, page = 1, limit = 12 }: FavoritesListProps) => {
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
  { revalidate: 60 } // Cache for 60 seconds
);

export async function FavoritesList({
  userId,
  page = 1,
  limit = 12,
}: FavoritesListProps) {
  // Use the cached function
  const { favorites, total, totalPages } = await getCachedFavorites({
    userId,
    page,
    limit,
  });

  if (!favorites.length) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">
          You haven&apos;t saved any items to your favorites yet.
        </p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center sm:text-left">
      <div className="text-xs sm:text-sm text-muted-foreground">
        Showing {favorites.length} of {total} saved items
      </div>

      {/* Use client-side grid component */}
      <FavoritesGrid products={favorites} />

      {totalPages > 1 && (
        <div className="flex justify-center gap-1 sm:gap-2 mt-6 sm:mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            // Create query string with page parameter
            const query = new URLSearchParams();
            query.set("page", p.toString());

            return (
              <Link
                key={p}
                href={`/dashboard/favorites?${query.toString()}`}
                className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md ${
                  p === page
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
                prefetch={true}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import dynamic from "next/dynamic";

// Use dynamic import for client component
const FavoriteItem = dynamic(() => import("./FavoriteItem"), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border bg-card overflow-hidden shadow-sm flex flex-col h-[280px]">
      <div className="h-48 w-full bg-gray-200 animate-pulse"></div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="h-5 bg-gray-200 animate-pulse rounded w-3/4"></div>
        <div className="h-10 bg-gray-200 animate-pulse rounded w-full mt-1"></div>
        <div className="flex justify-between mt-4">
          <div className="h-5 bg-gray-200 animate-pulse rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3"></div>
        </div>
      </div>
    </div>
  ),
});

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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {favorites.map((product) => (
          <FavoriteItem key={product.id} product={product} />
        ))}
      </div>

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

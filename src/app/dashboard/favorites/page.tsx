import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { unstable_cache } from "next/cache";
import { FavoritesList } from "@/components/dashboard/favorites/FavoritesList";

// Cache the user lookup to avoid repeated database calls
const getUserId = unstable_cache(
  async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return user?.id;
  },
  ["user-id"],
  { revalidate: 3600 } // Cache for 1 hour
);

function FavoritesListSkeleton() {
  return (
    <div className="space-y-4 text-center sm:text-left">
      <Skeleton className="h-8 w-1/3 mx-auto sm:mx-0" />
      <Skeleton className="h-4 w-1/4 mx-auto sm:mx-0" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-64 rounded-md" />
        ))}
      </div>
    </div>
  );
}

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const userId = await getUserId(session.user.email);

  if (!userId) {
    redirect("/auth/signin");
  }

  // Await the searchParams promise
  const resolvedParams = await searchParams;

  // Convert to number safely
  let pageNumber = 1;
  if (resolvedParams && typeof resolvedParams.page === "string") {
    const parsed = parseInt(resolvedParams.page);
    if (!isNaN(parsed)) {
      pageNumber = parsed;
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 md:p-8 text-center sm:text-left">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Your Favorites
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          View and manage your saved items
        </p>
      </div>

      <Suspense fallback={<FavoritesListSkeleton />}>
        <FavoritesList userId={userId} page={pageNumber} />
      </Suspense>
    </div>
  );
}

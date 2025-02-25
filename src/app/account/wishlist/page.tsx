import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { WishlistItem } from "@/components/product/wishlist-item";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    include: {
      favorites: {
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          slug: true,
          inStock: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  const wishlistItems = user?.favorites || [];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-xl font-medium mb-4">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">
            Add items to your wishlist to save them for later
          </p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <WishlistItem key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

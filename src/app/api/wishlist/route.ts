import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Get user's wishlist
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      select: {
        favorites: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            slug: true,
            inStock: true,
          },
        },
      },
    });

    return NextResponse.json({ wishlist: user?.favorites || [] });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// Add/remove product from wishlist
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, action } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      include: { favorites: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "add") {
      // Check if product is already in favorites
      const isAlreadyFavorite = user.favorites.some(
        (fav) => fav.id === productId
      );

      if (isAlreadyFavorite) {
        return NextResponse.json({ message: "Product already in wishlist" });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          favorites: {
            connect: { id: productId },
          },
        },
      });

      return NextResponse.json({ message: "Product added to wishlist" });
    } else if (action === "remove") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          favorites: {
            disconnect: { id: productId },
          },
        },
      });

      return NextResponse.json({ message: "Product removed from wishlist" });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating wishlist:", error);
    return NextResponse.json(
      { error: "Failed to update wishlist" },
      { status: 500 }
    );
  }
}

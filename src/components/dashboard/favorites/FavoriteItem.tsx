"use client";

import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  category?: {
    id: string;
    name: string;
  };
}

function FavoriteItem({ product }: { product: Product }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const { removeItem } = useWishlist();
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleRemoveFromWishlist = async () => {
    try {
      setIsRemoving(true);
      await removeItem(product.id);

      toast({
        title: "Removed from favorites",
        description: `${product.name} has been removed from your favorites.`,
      });

      // Refresh the page to update the UI after removal
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden shadow-sm flex flex-col">
      <div className="relative h-48 w-full">
        <Image
          src={product.images[0] || "/placeholder.png"}
          alt={product.name}
          fill
          className="object-cover"
          loading="lazy"
        />
        <button
          onClick={handleRemoveFromWishlist}
          disabled={isRemoving}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Remove from favorites"
        >
          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
        </button>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-medium text-sm sm:text-base line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 flex-1">
          {product.description}
        </p>
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm sm:text-base">
              {formatCurrency(product.price)}
            </span>
            <Link href={`/products/${product.id}`}>
              <Button size="sm" variant="outline">
                View Details
              </Button>
            </Link>
          </div>
          <Button size="sm" onClick={handleAddToCart} className="w-full mt-2">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}

// Default export for dynamic import
export default FavoriteItem;

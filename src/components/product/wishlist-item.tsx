"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/context/cart-context";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  slug: string;
  inStock: boolean;
  category: {
    name: string;
  };
}

interface WishlistItemProps {
  product: Product;
}

export function WishlistItem({ product }: WishlistItemProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();
  const { addItem } = useCart();

  const handleRemoveFromWishlist = async () => {
    setIsRemoving(true);
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          action: "remove",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove from wishlist");
      }

      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      });

      // Refresh the page to update the wishlist
      window.location.reload();
    } catch {
      toast({
        title: "Error",
        description: "Failed to remove from wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleAddToCart = () => {
    addItem({
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
    <div className="group relative border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-100">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={product.images[0] || "/placeholder.png"}
            alt={product.name}
            width={500}
            height={500}
            className="h-full w-full object-cover object-center"
          />
        </Link>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm text-gray-500">{product.category.name}</h3>
            <Link
              href={`/products/${product.slug}`}
              className="mt-1 text-lg font-medium"
            >
              {product.name}
            </Link>
            <p className="mt-1 text-lg font-semibold">
              ${product.price.toFixed(2)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveFromWishlist}
            disabled={isRemoving}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-5 w-5" />
            <span className="sr-only">Remove from wishlist</span>
          </Button>
        </div>
        <div className="mt-4">
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>
    </div>
  );
}

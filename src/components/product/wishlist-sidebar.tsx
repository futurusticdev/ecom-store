"use client";

import React from "react";
import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/context/wishlist-context";
import { WishlistItem } from "./wishlist-item";

export function WishlistSidebar() {
  const { items, isOpen, toggleWishlist } = useWishlist();

  if (!isOpen) return null;

  const handleClose = () => {
    toggleWishlist();
  };

  return (
    <Sheet open={isOpen} onOpenChange={toggleWishlist}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader className="px-1">
          <SheetTitle className="flex justify-between items-center">
            Wishlist ({items.length})
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-8">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <p className="text-muted-foreground mb-4">
                Your wishlist is empty
              </p>
              <Button variant="outline" onClick={handleClose} className="mt-2">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item) => (
                <WishlistItem
                  key={item.id}
                  product={{
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    images: [item.image],
                    slug: item.slug,
                    inStock: true,
                    category: {
                      name: "Product",
                    },
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

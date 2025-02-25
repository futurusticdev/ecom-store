"use client";

import { Heart, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/wishlist-context";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/components/ui/use-toast";

export function WishlistSidebar() {
  const { items, isOpen, toggleWishlist, removeItem } = useWishlist();
  const { addItem } = useCart();
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      productId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });

    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const handleRemoveFromWishlist = async (itemId: string, itemName: string) => {
    await removeItem(itemId);

    toast({
      title: "Removed from wishlist",
      description: `${itemName} has been removed from your wishlist.`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={toggleWishlist}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <div className="w-screen max-w-md">
          <div className="flex h-full flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-6 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Heart className="mr-2 h-5 w-5" />
                My Wishlist
              </h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={toggleWishlist}
              >
                <span className="sr-only">Close panel</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Wishlist items */}
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center">
                  <p className="text-lg text-gray-500">
                    Your wishlist is empty
                  </p>
                  <button
                    onClick={toggleWishlist}
                    className="mt-4 text-sm text-black hover:text-gray-600"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={item.id} className="py-6 flex">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <Image
                          src={item.image || "/placeholder.png"}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>
                              <Link
                                href={`/products/${item.slug}`}
                                className="hover:underline"
                              >
                                {item.name}
                              </Link>
                            </h3>
                            <p className="ml-4">${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div className="flex mt-2 space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddToCart(item)}
                            >
                              <ShoppingBag className="mr-2 h-4 w-4" />
                              Add to Cart
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              onClick={() =>
                                handleRemoveFromWishlist(item.id, item.name)
                              }
                            >
                              <X className="mr-2 h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                <div className="mt-6">
                  <Link
                    href="/account/wishlist"
                    className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    onClick={toggleWishlist}
                  >
                    View Full Wishlist
                  </Link>
                </div>
                <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                  <button
                    type="button"
                    className="font-medium text-black hover:text-gray-600"
                    onClick={toggleWishlist}
                  >
                    Continue Shopping
                    <span aria-hidden="true"> &rarr;</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

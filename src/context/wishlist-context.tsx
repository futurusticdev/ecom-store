"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearWishlist: () => void;
  itemCount: number;
  isLoading: boolean;
  isOpen: boolean;
  toggleWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

// Create a type for the API response
interface WishlistApiItem {
  id: string;
  name: string;
  price: number;
  images: string[];
  slug: string;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Toggle wishlist sidebar
  const toggleWishlist = () => {
    setIsOpen((prev) => !prev);
  };

  // Fetch wishlist items on mount
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch("/api/wishlist");
        if (!response.ok) {
          throw new Error("Failed to fetch wishlist");
        }
        const data = await response.json();

        // Transform the data to match our WishlistItem interface
        const transformedItems = data.wishlist.map((item: WishlistApiItem) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.images[0] || "",
          slug: item.slug,
        }));

        setItems(transformedItems);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const addItem = async (newItem: WishlistItem) => {
    try {
      setIsLoading(true);

      // Check if item already exists in wishlist
      if (items.some((item) => item.id === newItem.id)) {
        toast({
          title: "Already in wishlist",
          description: `${newItem.name} is already in your wishlist.`,
        });
        return;
      }

      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: newItem.id,
          action: "add",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to wishlist");
      }

      setItems((prev) => [...prev, newItem]);

      toast({
        title: "Added to wishlist",
        description: `${newItem.name} has been added to your wishlist.`,
      });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to add to wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: itemId,
          action: "remove",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove from wishlist");
      }

      const removedItem = items.find((item) => item.id === itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));

      if (removedItem) {
        toast({
          title: "Removed from wishlist",
          description: `${removedItem.name} has been removed from your wishlist.`,
        });
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to remove from wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearWishlist = () => {
    // This is a client-side only function, as we don't have a bulk remove API
    setItems([]);
  };

  // Calculate total item count
  const itemCount = items.length;

  const value = {
    items,
    addItem,
    removeItem,
    clearWishlist,
    itemCount,
    isLoading,
    isOpen,
    toggleWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

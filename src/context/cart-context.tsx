"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
  category?: string;
}

export interface Discount {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED" | "SHIPPING";
  value: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (newItem: Omit<CartItem, "id">) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  total: number;
  isOpen: boolean;
  toggleCart: () => void;
  discount: Discount | null;
  applyDiscount: (discount: Discount) => void;
  removeDiscount: () => void;
  discountAmount: number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const loadCartData = () => {
      const savedCart = localStorage.getItem("cart");
      const savedDiscount = localStorage.getItem("cartDiscount");

      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to parse cart from localStorage", e);
        }
      }

      if (savedDiscount) {
        try {
          setDiscount(JSON.parse(savedDiscount));
        } catch (e) {
          console.error("Failed to parse discount from localStorage", e);
        }
      }

      // Mark as loaded after data is retrieved
      setIsLoaded(true);
    };

    // Load cart data immediately
    loadCartData();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  // Save discount to localStorage whenever it changes
  useEffect(() => {
    if (discount) {
      localStorage.setItem("cartDiscount", JSON.stringify(discount));
    } else {
      localStorage.removeItem("cartDiscount");
    }
  }, [discount]);

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  // Calculate subtotal
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Calculate discount amount
  const discountAmount = discount
    ? discount.type === "PERCENTAGE"
      ? (subtotal * discount.value) / 100
      : discount.type === "FIXED"
      ? discount.value
      : 0 // For shipping discounts, we'll handle this in the checkout page
    : 0;

  // Calculate total (subtotal - discount)
  const total = Math.max(0, subtotal - discountAmount);

  const addItem = (newItem: Omit<CartItem, "id">) => {
    setItems((currentItems) => {
      // Generate a stable ID based on product attributes
      const stableId = `${newItem.productId}-${newItem.size || "no-size"}-${
        newItem.color || "no-color"
      }`;

      // Check if item already exists in cart
      const existingItemIndex = currentItems.findIndex(
        (item) => item.id === stableId
      );

      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
        };
        console.log("Updated items:", updatedItems);
        return updatedItems;
      }

      // Create new item with stable ID
      const newItemWithStableId = {
        ...newItem,
        id: stableId,
      };

      const newItems = [...currentItems, newItemWithStableId];
      console.log("New items array:", newItems);
      return newItems;
    });
    setIsOpen(true);
  };

  const removeItem = (itemId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId)
    );
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(itemId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setDiscount(null);
  };

  const applyDiscount = (newDiscount: Discount) => {
    setDiscount(newDiscount);
  };

  const removeDiscount = () => {
    setDiscount(null);
  };

  // Calculate total item count (sum of quantities)
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
    subtotal,
    total,
    isOpen,
    toggleCart,
    discount,
    applyDiscount,
    removeDiscount,
    discountAmount,
    isLoaded,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

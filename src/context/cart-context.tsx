"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  total: number;
  isOpen: boolean;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const calculateTotals = (items: CartItem[]) => {
  if (!items || !Array.isArray(items)) return { subtotal: 0, total: 0 };

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Calculate total with tax (10%)
  const total = subtotal + subtotal * 0.1;

  return { subtotal, total };
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleCart = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    // Load cart from localStorage on mount
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(Array.isArray(parsedCart) ? parsedCart : []);
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
        setItems([]);
      }
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    if (initialized) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, initialized]);

  const { subtotal, total } = calculateTotals(items);

  const addItem = (newItem: CartItem) => {
    console.log("Adding new item:", newItem);
    console.log("Current cart items:", items);

    setItems((currentItems) => {
      // Generate a stable ID based on product attributes
      const stableId = `${newItem.productId}${
        newItem.size ? `-${newItem.size}` : ""
      }${newItem.color ? `-${newItem.color}` : ""}`;

      // Check if exact same item exists using the stable ID
      const existingItem = currentItems.find(
        (item) =>
          `${item.productId}${item.size ? `-${item.size}` : ""}${
            item.color ? `-${item.color}` : ""
          }` === stableId
      );

      if (existingItem) {
        // Update quantity of existing item
        const updatedItems = currentItems.map((item) =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
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

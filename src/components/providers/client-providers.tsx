"use client";

import { CartProvider } from "@/context/cart-context";
import { CartSidebar } from "@/components/cart/cart-sidebar";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartSidebar />
    </CartProvider>
  );
}

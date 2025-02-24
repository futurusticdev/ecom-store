"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, User2, Heart, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";

const navigation = [
  { name: "New Arrivals", href: "/new-arrivals" },
  { name: "Women", href: "/women" },
  { name: "Men", href: "/men" },
  { name: "Accessories", href: "/accessories" },
  { name: "Sale", href: "/sale" },
];

export function Header() {
  const pathname = usePathname();
  const { itemCount, toggleCart } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex">
            <Link href="/" className="text-xl font-bold">
              LUXE
            </Link>
          </div>

          <nav className="hidden md:flex md:gap-x-8">
            <Link
              href="/"
              className={`text-[15px] ${
                pathname === "/" ? "text-black" : "text-gray-500"
              } hover:text-black/90 transition-colors`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`text-[15px] ${
                pathname === "/products" ? "text-black" : "text-gray-500"
              } hover:text-black/90 transition-colors`}
            >
              Products
            </Link>
            <Link
              href="/categories"
              className={`text-[15px] ${
                pathname === "/categories" ? "text-black" : "text-gray-500"
              } hover:text-black/90 transition-colors`}
            >
              Categories
            </Link>
          </nav>

          <div className="flex items-center space-x-7">
            <button
              type="button"
              className="text-gray-500 hover:text-black/90 transition-colors"
              aria-label="Show current time"
            >
              <Clock className="h-5 w-5 stroke-[1.75]" />
            </button>

            <Link
              href="/account"
              className="text-gray-500 hover:text-black/90 transition-colors"
              aria-label="Account"
            >
              <User2 className="h-5 w-5 stroke-[1.75]" />
            </Link>

            <Link
              href="/wishlist"
              className="text-gray-500 hover:text-black/90 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5 stroke-[1.75]" />
            </Link>

            <button
              onClick={toggleCart}
              className="relative text-gray-500 hover:text-black/90 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-5 w-5 stroke-[1.75]" />
              {itemCount > 0 && (
                <span className="absolute -right-[5px] -top-[5px] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-black text-[10px] font-medium text-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

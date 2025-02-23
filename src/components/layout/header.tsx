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
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white">
      <div className="mx-auto px-8 sm:px-12 lg:px-16">
        <div className="flex h-[72px] items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-[22px] font-black tracking-[-0.02em] text-black"
            >
              LUXE
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-12">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-[14.5px] font-semibold transition-colors hover:text-black/90",
                  pathname === item.href ? "text-black/90" : "text-gray-500"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Utility Icons */}
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

            <Link
              href="/cart"
              className="relative text-gray-500 hover:text-black/90 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-5 w-5 stroke-[1.75]" />
              {itemCount > 0 && (
                <span className="absolute -right-[5px] -top-[5px] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-black text-[10px] font-medium text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: number;
  name: string;
  href: string;
  price: number;
  image: string;
}

const products: Product[] = [
  {
    id: 1,
    name: "Designer Silk Dress",
    href: "/products/designer-silk-dress",
    price: 599.0,
    image:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=2668&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Leather Tote Bag",
    href: "/products/leather-tote-bag",
    price: 899.0,
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=2669&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Wool Blend Suit",
    href: "/products/wool-blend-suit",
    price: 1299.0,
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=2680&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Gold Watch",
    href: "/products/gold-watch",
    price: 2499.0,
    image:
      "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?q=80&w=2670&auto=format&fit=crop",
  },
];

export function FeaturedProducts() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Featured Products
          </h2>

          <div className="flex gap-4">
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Previous products"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Next products"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Link key={product.id} href={product.href} className="group">
              <div className="aspect-[4/5] w-full overflow-hidden rounded-lg bg-gray-50">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={500}
                  height={625}
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  $
                  {product.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

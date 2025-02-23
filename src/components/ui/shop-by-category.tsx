import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    name: "Women",
    href: "/women",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=2671&auto=format&fit=crop",
    description: "Shop Collection →",
  },
  {
    name: "Men",
    href: "/men",
    image:
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=2664&auto=format&fit=crop",
    description: "Shop Collection →",
  },
  {
    name: "Accessories",
    href: "/accessories",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2659&auto=format&fit=crop",
    description: "Shop Collection →",
  },
];

export function ShopByCategory() {
  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 mb-12">
          Shop by Category
        </h2>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-gray-100"
            >
              {/* Image Container */}
              <div className="relative h-full w-full">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  priority
                  className="object-cover object-center transition duration-300 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:bg-black/30" />

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                <h3 className="text-2xl font-semibold mb-2">{category.name}</h3>
                <p className="text-sm font-medium opacity-90">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Product } from "@prisma/client";

interface ProductCardProps {
  data: Product;
}

export function ProductCard({ data }: ProductCardProps) {
  return (
    <Link
      href={`/products/${data.slug}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
    >
      <div className="relative aspect-square">
        <Image
          src={data.images[0] || "/images/product-placeholder.png"}
          alt={data.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900">{data.name}</h3>
        <div className="mt-1 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              ${data.price.toFixed(2)}
            </p>
          </div>
          {!data.inStock && (
            <span className="text-xs font-medium text-red-600">
              Out of stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

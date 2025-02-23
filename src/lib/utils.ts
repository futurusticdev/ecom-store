import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUnsplashUrl(
  seed: string,
  width: number = 800,
  height: number = 800,
  category: string = "product"
): string {
  // Use the seed to consistently get the same image for a product
  return `https://source.unsplash.com/featured/${width}x${height}/?${category}&sig=${seed}`;
}

export function generateProductImages(
  productId: string,
  count: number = 4
): string[] {
  return Array.from({ length: count }, (_, i) =>
    generateUnsplashUrl(
      `${productId}-${i}`,
      800,
      800,
      "fashion,clothing,product"
    )
  );
}

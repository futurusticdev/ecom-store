"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Product, Category } from "@prisma/client";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Heart,
  Expand,
  X,
} from "lucide-react";
import { ProductCard } from "@/components/ui/product-card";

type ProductWithDetails = Product & {
  category: Category;
  images: string[];
  sizes: string[];
  inStock: boolean;
  slug: string;
};

interface PageProps {
  params: { slug: string };
}

const COLORS = [
  { name: "Black", value: "#000000" },
  { name: "Red", value: "#9B2C2C" },
  { name: "Blue", value: "#2B4C9B" },
  { name: "Green", value: "#1C4532" },
];

export default function ProductPage({ params }: PageProps) {
  const { slug } = params;
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${slug}`);
        const data = await response.json();
        setProduct(data);
        if (data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }

        // Fetch related products
        const relatedResponse = await fetch(
          `/api/products?categoryId=${data.categoryId}&limit=4`
        );
        const relatedData = await relatedResponse.json();
        setRelatedProducts(
          relatedData.items.filter((p: Product) => p.id !== data.id)
        );
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <p className="text-lg text-gray-500">Product not found</p>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;

    const { left, top, width, height } =
      event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - left) / width) * 100;
    const y = ((event.clientY - top) / height) * 100;

    setMousePosition({ x, y });
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              {product.images.length > 0 ? (
                <Image
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-100">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={image}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded-lg ${
                      currentImageIndex === index
                        ? "ring-2 ring-black"
                        : "ring-1 ring-gray-200"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {product.name}
            </h1>
            <div className="mt-3">
              <p className="text-3xl tracking-tight text-gray-900">
                ${product.price.toFixed(2)}
              </p>
            </div>

            {/* Color selector */}
            <div className="mt-8">
              <h2 className="text-sm text-gray-900 mb-2">
                Color: {selectedColor.name}
              </h2>
              <div className="flex gap-3">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full ${
                      selectedColor.value === color.value
                        ? "ring-2 ring-offset-2 ring-black"
                        : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size Selector */}
            {product.sizes.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Size</h3>
                  <button className="text-sm font-medium text-gray-600 hover:text-gray-500">
                    Size guide
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-4">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex items-center justify-center rounded-md border py-3 text-sm font-medium uppercase ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-gray-200 text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="mt-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-16 border-x border-gray-200 py-2 text-center text-gray-900 [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="flex-1 bg-black px-8 py-3 text-sm font-medium text-white hover:bg-black/90"
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center rounded-md border border-gray-200 p-3 hover:bg-gray-50"
                >
                  <Heart className="h-6 w-6 text-gray-600" />
                  <span className="sr-only">Add to wishlist</span>
                </button>
              </div>
            </div>

            {/* Product Description */}
            <div className="mt-8 prose prose-sm text-gray-500">
              <p>{product.description}</p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 sm:mt-24">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              You may also like
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} data={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import type { Product, ProductWithDetails } from "@/types";
import { Heart, ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { ProductCard } from "@/components/ui/product-card";
import { useCart } from "@/context/cart-context";

interface ProductClientProps {
  params: { slug: string };
}

const COLORS = [
  { name: "Black", value: "#000000" },
  { name: "Red", value: "#9B2C2C" },
  { name: "Blue", value: "#2B4C9B" },
  { name: "Green", value: "#1C4532" },
];

const styles = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-20px); }
    15% { opacity: 1; transform: translateY(0); }
    85% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-20px); }
  }
  
  .animate-fade-in-out {
    animation: fadeInOut 2s ease-in-out forwards;
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default function ProductClient({ params }: ProductClientProps) {
  const { slug } = params;
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0].name);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { addItem } = useCart();
  const [error, setError] = useState("");

  const handleImageError = useCallback(() => {
    if (product?.images?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  }, [product?.images?.length]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${slug}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();
        setProduct(data);
        if (data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } catch (err) {
        console.error(
          "Error fetching product:",
          err instanceof Error ? err.message : "Unknown error"
        );
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?.categoryId) return;

      try {
        const response = await fetch(
          `/api/products?categoryId=${product.categoryId}&limit=4`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch related products");
        }
        const data = await response.json();
        setRelatedProducts(
          data.products.filter((p: Product) => p.id !== product.id)
        );
      } catch (err) {
        console.error(
          "Error fetching related products:",
          err instanceof Error ? err.message : "Unknown error"
        );
        // Don't set error state for related products as it's not critical
      }
    };

    fetchRelatedProducts();
  }, [product?.categoryId, product?.id]);

  const nextImage = useCallback(() => {
    if (product?.images.length) {
      setCurrentImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  }, [product?.images.length]);

  const previousImage = useCallback(() => {
    if (product?.images.length) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  }, [product?.images.length]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;

    const { left, top, width, height } =
      event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - left) / width) * 100;
    const y = ((event.clientY - top) / height) * 100;

    setMousePosition({ x, y });
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isLightboxOpen) {
        switch (event.key) {
          case "ArrowLeft":
            previousImage();
            break;
          case "ArrowRight":
            nextImage();
            break;
          case "Escape":
            setIsLightboxOpen(false);
            break;
        }
      }
    },
    [isLightboxOpen, nextImage, previousImage]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedSize || !selectedColor) {
      setError("Please select both size and color");
      return;
    }

    const cartItemId = `${
      product.id
    }-${selectedSize}-${selectedColor}-${Date.now()}`;

    const cartItem = {
      id: cartItemId,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      size: selectedSize,
      color: selectedColor,
      image: product.images[0],
    };

    addItem(cartItem);
    setError("");
    setQuantity(1);
  };

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

  return (
    <div className="bg-white relative">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            <div
              className="relative w-full pt-[100%] group cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <div className="absolute inset-0">
                {product.images.length > 0 ? (
                  <>
                    <Image
                      src={product.images[currentImageIndex]}
                      alt={product.name}
                      fill
                      className={`object-cover transition-all duration-300 ${
                        isZoomed ? "opacity-0" : "opacity-100"
                      }`}
                      quality={90}
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                      onError={handleImageError}
                    />
                    {isZoomed && (
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{
                          backgroundImage: `url(${product.images[currentImageIndex]})`,
                          backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                          backgroundSize: "200%",
                          backgroundRepeat: "no-repeat",
                        }}
                      />
                    )}
                    <button
                      onClick={() => setIsLightboxOpen(true)}
                      className="absolute top-4 right-4 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-110 transform duration-200"
                      aria-label="Open fullscreen view"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                    <button
                      onClick={previousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-110 transform duration-200"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-110 transform duration-200"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image: string, index: number) => (
                  <button
                    key={image}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-full pt-[100%] overflow-hidden rounded-lg transition-all duration-300 ${
                      currentImageIndex === index
                        ? "ring-2 ring-black"
                        : "ring-1 ring-gray-200 hover:ring-gray-400"
                    }`}
                  >
                    <div className="absolute inset-0">
                      <Image
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                        quality={60}
                        sizes="(max-width: 768px) 25vw, 12vw"
                        onError={handleImageError}
                      />
                    </div>
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
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-gray-900">Color</h2>
                <span className="text-sm text-gray-600">{selectedColor}</span>
              </div>
              <div className="flex gap-3">
                {COLORS.map((color) => {
                  const isSelected = selectedColor === color.name;
                  return (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-6 h-6 rounded-full ${
                        isSelected ? "ring-2 ring-offset-2 ring-black" : ""
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                      aria-label={`Select ${color.name} color`}
                    />
                  );
                })}
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
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
                  {product.sizes.map((size: string) => (
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
                  onClick={handleAddToCart}
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

      {/* Lightbox - Moved outside the grid layout */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          <div
            className="absolute inset-0 bg-black/90"
            onClick={() => setIsLightboxOpen(false)}
          />
          <div className="relative h-full w-full flex items-center justify-center p-4">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 hover:scale-110 transform duration-200 z-[110]"
              aria-label="Close fullscreen view"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={previousImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:text-gray-300 hover:scale-110 transform duration-200 z-[110]"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:text-gray-300 hover:scale-110 transform duration-200 z-[110]"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            <div className="relative w-full h-full max-w-6xl max-h-[90vh] mx-auto">
              <Image
                src={product.images[currentImageIndex]}
                alt={product.name}
                fill
                className="object-contain"
                quality={100}
                priority
                sizes="100vw"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

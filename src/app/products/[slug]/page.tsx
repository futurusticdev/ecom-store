"use client";

import { useEffect, useState, use } from "react";
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
  params: Promise<{ slug: string }>;
}

const COLORS = [
  { name: "Black", value: "#000000" },
  { name: "Red", value: "#9B2C2C" },
  { name: "Blue", value: "#2B4C9B" },
  { name: "Green", value: "#1C4532" },
];

export default function ProductPage({ params }: PageProps) {
  const { slug } = use(params);
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

        // Fetch related products from the same category
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
          {/* Image gallery */}
          <div className="space-y-4">
            {/* Main image */}
            <div
              className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {product.images.length > 0 ? (
                <>
                  <div
                    className={`absolute inset-0 transition-transform duration-200 ${
                      isZoomed ? "scale-150" : "scale-100"
                    }`}
                    style={{
                      transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                    }}
                  >
                    <Image
                      src={product.images[currentImageIndex]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                      quality={90}
                    />
                  </div>

                  {/* Image counter */}
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {product.images.length}
                  </div>

                  {/* Fullscreen button */}
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="absolute top-4 right-4 bg-black/70 text-white p-2 rounded-full hover:bg-black/90"
                  >
                    <Expand className="h-4 w-4" />
                  </button>

                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={previousImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 hover:bg-white"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 hover:bg-white"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <Image
                  src="/images/product-placeholder.png"
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              )}
            </div>

            {/* Thumbnail gallery */}
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

          {/* Fullscreen modal */}
          {isFullscreen && (
            <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="relative w-full h-full max-w-5xl max-h-[80vh] mx-4">
                <Image
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  fill
                  className="object-contain"
                  quality={100}
                />
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={previousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 hover:bg-white/20"
                    >
                      <ChevronLeft className="h-8 w-8 text-white" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 hover:bg-white/20"
                    >
                      <ChevronRight className="h-8 w-8 text-white" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Product info */}
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-medium text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-xl text-gray-900">
                ${product.price.toFixed(2)}
              </p>
            </div>

            {/* Color selector */}
            <div className="mb-8">
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

            {/* Size selector */}
            {product.sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-sm font-medium text-black">Size</h2>
                  <button className="text-xs text-gray-600 underline">
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex items-center justify-center border py-2 text-sm text-black ${
                        selectedSize === size
                          ? "border-black"
                          : "border-gray-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to cart section */}
            <div className="flex items-center gap-2 mb-8">
              <div className="flex border border-gray-200">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-50 text-black"
                >
                  -
                </button>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-12 text-center border-x border-gray-200 focus:outline-none text-black"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-gray-50 text-black"
                >
                  +
                </button>
              </div>
              <button
                disabled={!product.inStock}
                className="flex-1 bg-black text-white py-3 text-sm font-medium hover:bg-black/90 disabled:bg-gray-400"
              >
                Add to Cart
              </button>
              <button className="border border-gray-200 p-3 hover:bg-gray-50">
                <Heart className="h-5 w-5" />
              </button>
            </div>

            {/* Accordion sections */}
            <div>
              <div>
                <button
                  onClick={() => toggleSection("details")}
                  className="flex justify-between items-center w-full py-4 border-t border-gray-200"
                >
                  <span className="text-sm text-black font-medium">
                    Product Details
                  </span>
                  <Plus
                    className={`h-4 w-4 text-black transform transition-transform ${openSection === "details" ? "rotate-45" : ""}`}
                  />
                </button>
                {openSection === "details" && (
                  <div className="py-4 text-sm text-gray-600 space-y-2">
                    <p>
                      The perfect addition to your wardrobe, this versatile
                      piece combines style and comfort.
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Premium quality materials</li>
                      <li>Carefully crafted design</li>
                      <li>Durable construction</li>
                      <li>Easy care instructions</li>
                    </ul>
                    <p>Material: 100% Premium Cotton</p>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => toggleSection("size")}
                  className="flex justify-between items-center w-full py-4 border-t border-gray-200"
                >
                  <span className="text-sm text-black font-medium">
                    Size & Fit
                  </span>
                  <Plus
                    className={`h-4 w-4 text-black transform transition-transform ${openSection === "size" ? "rotate-45" : ""}`}
                  />
                </button>
                {openSection === "size" && (
                  <div className="py-4 text-sm text-gray-600 space-y-2">
                    <p>Regular fit, true to size.</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Model is 6&apos;1&quot; and wears size M</li>
                      <li>Fits true to size, take your normal size</li>
                      <li>Cut for a comfortable regular fit</li>
                      <li>Mid-weight fabric</li>
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => toggleSection("shipping")}
                  className="flex justify-between items-center w-full py-4 border-t border-gray-200"
                >
                  <span className="text-sm text-black font-medium">
                    Shipping & Returns
                  </span>
                  <Plus
                    className={`h-4 w-4 text-black transform transition-transform ${openSection === "shipping" ? "rotate-45" : ""}`}
                  />
                </button>
                {openSection === "shipping" && (
                  <div className="py-4 text-sm text-gray-600 space-y-2">
                    <h3 className="font-medium text-black mb-2">
                      Free Shipping
                    </h3>
                    <p>2-4 business days for standard shipping</p>
                    <p>1-2 business days for express shipping</p>

                    <h3 className="font-medium text-black mt-4 mb-2">
                      Returns
                    </h3>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Free returns within 30 days</li>
                      <li>Items must be unworn with original tags</li>
                      <li>See our full return policy for details</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "./ProductForm";
import { useToast } from "@/components/ui/toast-context";
import { ProductFormData } from "./ProductForm";

interface Category {
  id: string;
  name: string;
}

interface EditProductProps {
  productId: string;
  onCancel: () => void;
}

export function EditProduct({ productId, onCancel }: EditProductProps) {
  const [product, setProduct] = useState<ProductFormData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { addToast } = useToast();

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        if (!productId) {
          setError("No product ID provided");
          setLoading(false);
          return;
        }

        console.log(`Fetching product with ID: ${productId}`);

        // Add a cache-busting parameter to avoid Next.js caching
        const timestamp = new Date().getTime();

        // Directly fetch the product data
        const response = await fetch(
          `/api/products/${productId}?t=${timestamp}`,
          {
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }
        );

        console.log("API response status:", response.status);

        if (!response.ok) {
          if (response.status === 404) {
            setError(`Product with ID ${productId} does not exist.`);
          } else {
            const errorText = await response
              .text()
              .catch(() => "No error details available");
            console.error(
              `Failed to fetch product: ${response.status}`,
              errorText
            );
            setError(
              `Failed to load product data (Status: ${response.status}). Please try again later.`
            );
          }
          return;
        }

        const data = await response.json();
        console.log("Product data received:", data);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError(
          `Failed to load product data: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");

        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }

        const data = await response.json();

        if (data && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          console.error("Invalid categories data format:", data);
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories. Please try again later.");
      }
    };

    fetchProductData();
    fetchCategories();
  }, [productId]);

  const handleSubmit = async (formData: ProductFormData) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        const errorMessage =
          errorData.error || `Failed to update product: ${response.status}`;
        console.error(errorMessage);

        addToast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });

        return;
      }

      addToast({
        title: "Success",
        description: "Product updated successfully",
        variant: "success",
      });

      router.refresh();
      onCancel(); // Close the edit form
    } catch (error) {
      console.error("Error updating product:", error);
      addToast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-md shadow p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white rounded-md shadow p-6">
        <div className="text-center p-6">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
          <p className="text-gray-600">
            {error || "Failed to load product data"}
          </p>
          <button
            onClick={onCancel}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Transform product data to match the form structure
  const formattedProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    sku: product.sku || "",
    categoryId: product.categoryId || "",
    price: product.price,
    compareAtPrice: product.compareAtPrice || 0,
    stock: product.stock || 0,
    images: product.images || [],
    variants: product.variants || [],
    isPublished: product.isPublished !== false, // Default to true if not specified
    isAvailableForSale: product.isAvailableForSale !== false, // Default to true if not specified
  };

  return (
    <ProductForm
      initialData={formattedProduct}
      categories={categories}
      onCancel={onCancel}
      onSubmit={handleSubmit}
    />
  );
}

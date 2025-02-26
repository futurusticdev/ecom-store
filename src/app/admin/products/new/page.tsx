"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { useToast } from "@/components/ui/toast-context";

interface Category {
  id: string;
  name: string;
}

// Define a type for the product form data
interface ProductFormData {
  id?: string;
  name: string;
  description: string;
  sku: string;
  categoryId: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images: string[];
  variants: {
    size: string;
    color: string;
    stock: number;
  }[];
  isPublished: boolean;
  isAvailableForSale: boolean;
}

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { addToast } = useToast();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (formData: ProductFormData) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create product: ${response.status}`);
      }

      addToast({
        title: "Success",
        description: "Product created successfully",
        variant: "success",
      });

      router.push("/admin/products");
    } catch (error) {
      console.error("Error creating product:", error);
      addToast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to be caught by the form's error handler
    }
  };

  const handleCancel = () => {
    router.push("/admin/products");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-white rounded-md shadow p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-white rounded-md shadow p-6">
          <div className="text-center p-6">
            <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={handleCancel}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <ProductForm
        categories={categories}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

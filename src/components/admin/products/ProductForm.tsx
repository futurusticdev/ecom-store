"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/toast-context";

interface Category {
  id: string;
  name: string;
}

interface ProductVariant {
  size: string;
  color: string;
  stock: number;
}

// Export the interface so it can be used elsewhere
export interface ProductFormData {
  id?: string;
  name: string;
  description: string;
  sku: string;
  categoryId: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images: string[];
  variants: ProductVariant[];
  isPublished: boolean;
  isAvailableForSale: boolean;
}

interface ProductFormProps {
  initialData?: ProductFormData;
  categories: Category[];
  onCancel: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
}

export function ProductForm({
  initialData = {
    name: "",
    description: "",
    sku: "",
    categoryId: "",
    price: 0,
    compareAtPrice: 0,
    stock: 0,
    images: [],
    variants: [],
    isPublished: true,
    isAvailableForSale: true,
  },
  categories = [],
  onCancel,
  onSubmit,
}: ProductFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    formData.images[0] || null
  );
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  const [newVariant, setNewVariant] = useState<ProductVariant>({
    size: "Small",
    color: "Cream",
    stock: 0,
  });
  const { addToast } = useToast();

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const newImage = event.target.result.toString();
          setFormData({
            ...formData,
            images: [...formData.images, newImage],
          });
          setSelectedImage(newImage);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  // Handle adding a new variant
  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, newVariant],
    });
    setNewVariant({
      size: "Small",
      color: "Cream",
      stock: 0,
    });
  };

  // Handle removing a variant
  const handleRemoveVariant = (index: number) => {
    const updatedVariants = [...formData.variants];
    updatedVariants.splice(index, 1);
    setFormData({
      ...formData,
      variants: updatedVariants,
    });
  };

  // Handle removing an image
  const handleRemoveImage = (indexToRemove: number) => {
    if (imageToDelete === indexToRemove) {
      // Confirm deletion
      const updatedImages = formData.images.filter(
        (_, index) => index !== indexToRemove
      );
      setFormData({
        ...formData,
        images: updatedImages,
      });

      // If the selected image was removed, select another one or set to null
      if (selectedImage === formData.images[indexToRemove]) {
        setSelectedImage(updatedImages.length > 0 ? updatedImages[0] : null);
      }

      addToast({
        title: "Image removed",
        description: "The product image has been removed",
        variant: "default",
      });

      setImageToDelete(null);
    } else {
      // Set this image as the one to delete (first click)
      setImageToDelete(indexToRemove);

      // Auto-reset after 3 seconds
      setTimeout(() => {
        setImageToDelete(null);
      }, 3000);
    }
  };

  // Handle visibility change
  const handleVisibilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const isPublished = e.target.value === "published";
    setFormData({
      ...formData,
      isPublished,
    });
    console.log(
      `Product visibility set to: ${isPublished ? "Published" : "Draft"}`
    );
  };

  // Handle availability for sale change
  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isAvailableForSale = e.target.checked;
    setFormData({
      ...formData,
      isAvailableForSale,
    });
    console.log(`Product availability for sale set to: ${isAvailableForSale}`);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
      addToast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-md shadow">
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-xl font-semibold">Product Information</h2>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div className="md:col-span-2 space-y-6">
          {/* Product Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Product Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* SKU and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="sku"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                SKU
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter product SKU"
              />
            </div>
            <div>
              <label
                htmlFor="categoryId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md appearance-none bg-white"
              >
                {categories.length === 0 ? (
                  <option value="">No categories available</option>
                ) : (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Variants */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Variants</h3>
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50"
              >
                Add Variant
              </button>
            </div>

            <div className="border border-gray-200 rounded-md">
              <div className="grid grid-cols-3 gap-4 p-4">
                <div>
                  <label
                    htmlFor="variantSize"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Size
                  </label>
                  <select
                    id="variantSize"
                    value={newVariant.size}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, size: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                    <option value="X-Large">X-Large</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="variantColor"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Color
                  </label>
                  <select
                    id="variantColor"
                    value={newVariant.color}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, color: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Cream">Cream</option>
                    <option value="Black">Black</option>
                    <option value="Blue">Blue</option>
                    <option value="Red">Red</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="variantStock"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Stock
                  </label>
                  <input
                    type="number"
                    id="variantStock"
                    value={newVariant.stock}
                    onChange={(e) =>
                      setNewVariant({
                        ...newVariant,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Display existing variants */}
            {formData.variants.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Added Variants
                </h4>
                <div className="border border-gray-200 rounded-md divide-y">
                  {formData.variants.map((variant, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-3 gap-4 p-3 items-center"
                    >
                      <div className="text-sm">{variant.size}</div>
                      <div className="text-sm">{variant.color}</div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          {variant.stock} in stock
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(index)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove variant"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing & Inventory */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Pricing & Inventory
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Price
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                  </span>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full p-2 pl-7 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="compareAtPrice"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Compare at Price
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                  </span>
                  <input
                    type="text"
                    id="compareAtPrice"
                    name="compareAtPrice"
                    value={formData.compareAtPrice}
                    onChange={handleChange}
                    className="w-full p-2 pl-7 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="stock"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Stock
                </label>
                <input
                  type="text"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Media */}
          <div className="bg-white rounded-md p-4 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Media</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
              {selectedImage ? (
                <div className="relative w-full h-64 flex items-center justify-center">
                  <Image
                    src={selectedImage}
                    alt="Product"
                    width={300}
                    height={300}
                    className="max-w-full max-h-full object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="text-center text-gray-500 h-64 flex items-center justify-center">
                  <p>No image selected</p>
                </div>
              )}
              <div className="mt-4 flex justify-center">
                <label className="cursor-pointer">
                  <span className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"
                      />
                    </svg>
                    Upload New Image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {formData.images.map((image, index) => (
                  <div
                    key={index}
                    className={`relative border rounded-md overflow-hidden cursor-pointer h-16 ${
                      selectedImage === image ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <div
                      className={`absolute top-0 right-0 p-1 ${
                        imageToDelete === index
                          ? "bg-red-100 rounded-bl-md z-10"
                          : "bg-white rounded-bl-md z-10"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      title={
                        imageToDelete === index
                          ? "Click again to confirm deletion"
                          : "Remove image"
                      }
                    >
                      <X
                        className={`h-4 w-4 ${
                          imageToDelete === index
                            ? "text-red-600 animate-pulse"
                            : "text-red-500 hover:text-red-700"
                        }`}
                      />
                    </div>
                    <div
                      className="w-full h-full"
                      onClick={() => {
                        setSelectedImage(image);
                        setImageToDelete(null);
                      }}
                    >
                      <Image
                        src={image}
                        alt={`Product ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="bg-white rounded-md p-4 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="isPublished"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Visibility
                </label>
                <select
                  id="isPublished"
                  name="isPublished"
                  value={formData.isPublished ? "published" : "draft"}
                  onChange={handleVisibilityChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="isAvailableForSale"
                  name="isAvailableForSale"
                  checked={formData.isAvailableForSale}
                  onChange={handleAvailabilityChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="isAvailableForSale"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Available for sale
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";

/**
 * Deletes a product by ID
 * @param productId - The ID of the product to delete
 * @returns Object with success status and message
 */
export async function deleteProduct(productId: string) {
  try {
    // Validate input
    if (!productId) {
      return {
        success: false,
        message: "Product ID is required",
      };
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) {
      return {
        success: false,
        message: "Product not found",
      };
    }

    // Delete the product
    await prisma.product.delete({
      where: { id: productId },
    });

    // Revalidate the products page to update the cache
    revalidatePath("/admin/products");

    return {
      success: true,
      message: `Product "${product.name}" deleted successfully`,
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      message: "Failed to delete product. Please try again.",
    };
  }
}

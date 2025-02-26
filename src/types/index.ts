export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
  sizes: string[];
  inStock: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductWithDetails = Product & {
  category: Category;
};

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  productId?: string;
  size?: string;
  color?: string;
  category?: string;
}

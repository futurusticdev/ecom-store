import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { CartItem as CartItemType, useCart } from "@/context/cart-context";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 py-4 border-b">
      <div className="relative aspect-square w-24 overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
            <div className="mt-1 text-sm text-gray-500 space-y-1">
              {typeof item.size === "string" && (
                <p>
                  <span className="font-medium">Size:</span> {item.size}
                </p>
              )}
              {typeof item.color === "string" && (
                <p>
                  <span className="font-medium">Color:</span> {item.color}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Remove item"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center border border-gray-200 rounded-md">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="p-2 text-gray-600 hover:bg-gray-50"
              aria-label="Decrease quantity"
              data-testid="decrease-quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span
              className="px-4 py-2 text-sm text-gray-900"
              data-testid="item-quantity"
            >
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="p-2 text-gray-600 hover:bg-gray-50"
              aria-label="Increase quantity"
              data-testid="increase-quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm font-medium text-gray-900">
            ${(item.price * item.quantity).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

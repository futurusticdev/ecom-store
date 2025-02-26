// Define CartItem type if not already defined elsewhere
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Export the props interface so it can be imported elsewhere
export interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  discount: { type: string } | null;
  discountAmount: number;
  effectiveShippingCost: number;
  effectiveDiscountAmount: number;
  taxAmount: number;
  total: number;
  shippingCost: number;
  removeDiscount: () => void;
  onApplyDiscount: (code: string) => void;
}

// Explicitly type the component with the props interface
const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  subtotal,
  discount,
  discountAmount,
  effectiveShippingCost,
  effectiveDiscountAmount,
  taxAmount,
  total,
  shippingCost,
  removeDiscount,
  onApplyDiscount,
}) => {
  return (
    <div className="order-summary">
      <h2>Order Summary</h2>

      <div className="items-list">
        {items.map((item) => (
          <div key={item.id} className="cart-item">
            <span>
              {item.name} x{item.quantity}
            </span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="summary-row">
        <span>Subtotal ({items.length} items):</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>

      {discount && (
        <div className="summary-row discount">
          <span>Discount ({discount.type}):</span>
          <span>
            -${discountAmount.toFixed(2)} (Effective: $
            {effectiveDiscountAmount.toFixed(2)})
          </span>
        </div>
      )}

      <div className="summary-row">
        <span>Shipping:</span>
        <span>
          ${shippingCost.toFixed(2)} → ${effectiveShippingCost.toFixed(2)}
        </span>
      </div>

      <div className="summary-row">
        <span>Tax:</span>
        <span>${taxAmount.toFixed(2)}</span>
      </div>

      <div className="summary-total">
        <span>Total:</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <div className="discount-section">
        <button onClick={removeDiscount} disabled={!discount}>
          Remove Discount
        </button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            onApplyDiscount(formData.get("code") as string);
          }}
        >
          <input name="code" placeholder="Enter discount code" />
          <button type="submit">Apply Discount</button>
        </form>
      </div>
    </div>
  );
};

export default OrderSummary;

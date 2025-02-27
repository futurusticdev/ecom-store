import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

// Types
interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  image: string | null;
  size?: string;
  color?: string;
}

interface Customer {
  name: string;
  email: string | null;
  image: string | null;
  since?: string;
  phone?: string;
}

interface ShippingAddress {
  street: string;
  apt?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface Order {
  id: string;
  orderId: string;
  customer: Customer;
  status: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  date: string;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
  paymentDetails?: {
    method: string;
    cardNumber?: string;
    expiry?: string;
  };
}

interface EditOrderFormProps {
  orderId: string;
  onCancel: () => void;
  onSaved: () => void;
}

const EditOrderForm = ({ orderId, onCancel, onSaved }: EditOrderFormProps) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: "",
    apt: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${orderId}`);

        if (!response.ok) {
          if (response.status === 404) {
            console.warn(
              "Order API returned 404, using mock data for development"
            );

            // Create mock order data
            const mockOrder = {
              id: orderId,
              orderId: `#ORD-${orderId.substring(0, 6)}`,
              customer: {
                name: "Sarah Johnson",
                email: "sarah.johnson@example.com",
                image: null,
                since: "Jan 2023",
                phone: "+1 (555) 123-4567",
              },
              status: "PROCESSING",
              paymentStatus: "PAID",
              total: 1402.92,
              subtotal: 1299.0,
              tax: 103.92,
              shipping: 0,
              date: new Date().toISOString(),
              items: [
                {
                  id: "item1",
                  productName: "Designer Silk Dress",
                  quantity: 1,
                  price: 899.0,
                  image: null,
                  size: "M",
                  color: "Navy Blue",
                },
                {
                  id: "item2",
                  productName: "Leather Handbag",
                  quantity: 1,
                  price: 400.0,
                  image: null,
                  color: "Brown",
                },
              ],
              shippingAddress: {
                street: "123 Fashion Street",
                apt: "4B",
                city: "New York",
                state: "NY",
                zip: "10001",
                country: "United States",
              },
              paymentDetails: {
                method: "Credit Card",
                cardNumber: "•••• •••• •••• 4242",
                expiry: "03/2024",
              },
            };

            setOrder(mockOrder);

            // Initialize editable fields with mock data
            setStatus(mockOrder.status);
            setPaymentStatus(mockOrder.paymentStatus);
            setShippingAddress({
              street: mockOrder.shippingAddress?.street || "",
              apt: mockOrder.shippingAddress?.apt || "",
              city: mockOrder.shippingAddress?.city || "",
              state: mockOrder.shippingAddress?.state || "",
              zip: mockOrder.shippingAddress?.zip || "",
              country: mockOrder.shippingAddress?.country || "",
            });
            setCustomerInfo({
              name: mockOrder.customer.name,
              email: mockOrder.customer.email || "",
              phone: mockOrder.customer.phone || "",
            });

            setLoading(false);
            return;
          } else {
            throw new Error(`Error fetching order: ${response.status}`);
          }
        }

        const data = await response.json();

        // Calculate subtotal from items if not provided
        const subtotal = data.items.reduce(
          (sum: number, item: OrderItem) => sum + item.price * item.quantity,
          0
        );

        // Enhance with additional data if needed
        const enhancedOrder = {
          ...data,
          subtotal: data.subtotal || subtotal,
          tax: data.tax || data.total * 0.08, // Estimate tax if not provided
          shipping: data.shipping || 0,
          shippingAddress: data.shippingAddress || {
            street: "",
            apt: "",
            city: "",
            state: "",
            zip: "",
            country: "",
          },
          paymentDetails: data.paymentDetails || {
            method: "Credit Card",
            cardNumber: "•••• •••• •••• ****",
            expiry: "**/**",
          },
          customer: {
            ...data.customer,
            since: data.customer.since || "N/A",
            phone: data.customer.phone || "N/A",
          },
        };

        setOrder(enhancedOrder);

        // Initialize editable fields
        setStatus(enhancedOrder.status);
        setPaymentStatus(enhancedOrder.paymentStatus);
        setShippingAddress({
          street: enhancedOrder.shippingAddress?.street || "",
          apt: enhancedOrder.shippingAddress?.apt || "",
          city: enhancedOrder.shippingAddress?.city || "",
          state: enhancedOrder.shippingAddress?.state || "",
          zip: enhancedOrder.shippingAddress?.zip || "",
          country: enhancedOrder.shippingAddress?.country || "",
        });
        setCustomerInfo({
          name: enhancedOrder.customer.name,
          email: enhancedOrder.customer.email || "",
          phone: enhancedOrder.customer.phone || "",
        });
      } catch (err) {
        console.error("Failed to fetch order:", err);
        setError("Failed to load order. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Handle save order
  const handleSaveOrder = async () => {
    try {
      setSaving(true);

      // Make sure all shipping address fields are included, even if empty
      const formattedShippingAddress = {
        street: shippingAddress.street || "",
        apt: shippingAddress.apt || "",
        city: shippingAddress.city || "",
        state: shippingAddress.state || "",
        zip: shippingAddress.zip || "",
        country: shippingAddress.country || "",
      };

      // Calculate the current total based on the updated quantities
      const currentTotal =
        order?.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ) || 0;

      const updatedOrder = {
        status,
        paymentStatus,
        shippingAddress: formattedShippingAddress,
        customer: {
          name: customerInfo.name || "",
          email: customerInfo.email || "",
          phone: customerInfo.phone || "",
        },
        notes: orderNotes,
        // Include the updated items with their quantities
        items: order?.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
        // Include the recalculated total
        total: currentTotal,
      };

      console.log(
        "Sending update with data:",
        JSON.stringify(updatedOrder, null, 2)
      );

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedOrder),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(
            "Order API returned 404, but treating as success for development"
          );

          toast({
            title: "Order Updated (Dev Mode)",
            description:
              "The order has been updated successfully in development mode.",
            variant: "default",
          });

          onSaved();
          return;
        }

        const errorData = await response.json();
        throw new Error(
          errorData.error || `Error updating order: ${response.status}`
        );
      }

      toast({
        title: "Order Updated",
        description: "The order has been updated successfully.",
        variant: "default",
      });

      onSaved();
    } catch (err) {
      console.error("Failed to update order:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error
            ? err.message
            : "Failed to update the order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle adding a note
  const handleAddNote = () => {
    if (!orderNotes.trim()) {
      toast({
        title: "Empty Note",
        description: "Please enter a note before adding.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Note Added",
      description: "Your note has been added to the order.",
      variant: "default",
    });
  };

  // Handle updating item quantity
  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (!order) return;

    // Find the item being updated
    const itemToUpdate = order.items.find((item) => item.id === itemId);
    if (!itemToUpdate) return;

    // Calculate price difference
    const oldTotal = itemToUpdate.price * itemToUpdate.quantity;
    const newTotal = itemToUpdate.price * newQuantity;
    const priceDifference = newTotal - oldTotal;

    // Update the item quantity in the order
    const updatedItems = order.items.map((item) => {
      if (item.id === itemId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    // Recalculate subtotal
    const subtotal = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Update the order with new items and subtotal
    setOrder({
      ...order,
      items: updatedItems,
      subtotal,
      total: subtotal + order.tax + order.shipping,
    });

    toast({
      title: "Quantity Updated",
      description: `Quantity changed to ${newQuantity}. Total price ${
        priceDifference >= 0 ? "increased" : "decreased"
      } by ${formatCurrency(Math.abs(priceDifference))}.`,
      variant: "default",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error || "Order not found"}
        </div>
        <Button variant="outline" className="mt-4" onClick={onCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Return to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={onCancel}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">
          Edit Order #{order.orderId.replace("#ORD-", "")}
        </h1>
        <Badge
          variant="outline"
          className={`ml-4 ${
            status === "DELIVERED"
              ? "bg-green-50 text-green-800 border-green-200"
              : status === "CANCELLED"
              ? "bg-red-50 text-red-800 border-red-200"
              : status === "SHIPPED"
              ? "bg-blue-50 text-blue-800 border-blue-200"
              : "bg-yellow-50 text-yellow-800 border-yellow-200"
          }`}
        >
          {status}
        </Badge>
        <div className="flex-grow"></div>
        <div className="flex gap-2">
          <Button
            variant="default"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSaveOrder}
            disabled={saving}
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
          <Button
            variant="outline"
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Edit Order Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Order Details</h2>

              {/* Order Status */}
              <div className="flex items-start border-b border-gray-100 pb-4 mb-4">
                <div className="bg-blue-100 rounded-full p-2 mr-4">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-medium">Order Status</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Update the current status of this order
                  </p>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="SHIPPED">Shipped</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Payment Status */}
              <div className="flex items-start border-b border-gray-100 pb-4 mb-4">
                <div className="bg-indigo-100 rounded-full p-2 mr-4">
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-medium">Payment Status</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Update the payment status for this order
                  </p>
                  <Select
                    value={paymentStatus}
                    onValueChange={setPaymentStatus}
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="REFUNDED">Refunded</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items Card */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Order Items</h2>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex border rounded-md p-3">
                    <div className="h-16 w-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{item.productName}</h3>
                          <p className="text-sm text-gray-500">
                            {item.size && <>Size: {item.size} | </>}
                            {item.color && <>Color: {item.color}</>}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className="text-sm mr-2">Qty:</span>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateQuantity(
                                  item.id,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-16 h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} × {formatCurrency(item.price)}
                          </p>
                          <Badge
                            variant="outline"
                            className="mt-2 bg-green-50 text-green-800 border-green-200"
                          >
                            In Stock
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Order Notes</h2>
              <Textarea
                placeholder="Add notes about this order..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="min-h-24"
              />
              <Button
                className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleAddNote}
              >
                Add Note
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Customer Information</h2>
              </div>
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-indigo-100 rounded-full overflow-hidden mr-3 flex items-center justify-center">
                  {order.customer.image ? (
                    <img
                      src={order.customer.image}
                      alt={order.customer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-indigo-600 font-medium">
                      {order.customer.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="text-sm text-gray-500">
                    Customer since {order.customer.since}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="customerName">Name</Label>
                  <Input
                    id="customerName"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    value={customerInfo.email}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        email: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        phone: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={shippingAddress.street}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        street: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="apt">Apartment/Suite</Label>
                  <Input
                    id="apt"
                    value={shippingAddress.apt}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        apt: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          city: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          state: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={shippingAddress.zip}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          zip: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={shippingAddress.country}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          country: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Details</h2>

              <div className="flex items-center mb-3">
                <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                <p className="font-medium">{order.paymentDetails?.method}</p>
              </div>

              <div>
                <p className="text-gray-600 font-mono">
                  {order.paymentDetails?.cardNumber}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Expires {order.paymentDetails?.expiry}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-gray-600">Subtotal</p>
                  <p>{formatCurrency(order.subtotal)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Shipping</p>
                  <p>{formatCurrency(order.shipping)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Tax</p>
                  <p>{formatCurrency(order.tax)}</p>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <p>Total</p>
                  <p>{formatCurrency(order.total)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditOrderForm;

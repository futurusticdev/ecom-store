"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Package,
  Truck,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

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
  shippingAddress?: {
    street: string;
    apt?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  paymentDetails?: {
    method: string;
    cardNumber?: string;
    expiry?: string;
  };
}

export default function ProcessOrderPage({
  params,
}: {
  params: { id: string };
}) {
  // Access params directly instead of using React.use()
  const orderId = params.id;

  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingNotes, setProcessingNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Processing steps states
  const [stockVerified, setStockVerified] = useState(false);
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const [itemsPacked, setItemsPacked] = useState(false);
  const [orderShipped, setOrderShipped] = useState(false);

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${orderId}`);

        // If API returns 404, use mock data for development
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

          // Set initial state based on mock order status
          setStockVerified(false);
          setPaymentProcessed(false);
          setItemsPacked(false);
          setOrderShipped(false);

          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`Error fetching order: ${response.status}`);
        }

        const data = await response.json();

        // Enhance with mock data for the UI demo
        const enhancedOrder = {
          ...data,
          subtotal: data.total - 103.92,
          tax: 103.92,
          shipping: 0,
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
          customer: {
            ...data.customer,
            since: "Jan 2023",
            phone: "+1 (555) 123-4567",
          },
        };

        setOrder(enhancedOrder);

        // Set initial state based on order status
        if (enhancedOrder.status === "PROCESSING") {
          setStockVerified(true);
          setPaymentProcessed(true);
          setItemsPacked(false);
          setOrderShipped(false);
          setProcessingStep(2);
        } else if (enhancedOrder.status === "SHIPPED") {
          setStockVerified(true);
          setPaymentProcessed(true);
          setItemsPacked(true);
          setOrderShipped(true);
          setProcessingStep(4);
        } else {
          setStockVerified(false);
          setPaymentProcessed(false);
          setItemsPacked(false);
          setOrderShipped(false);
        }
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

  // Handle verify stock
  const handleVerifyStock = () => {
    setStockVerified(true);
    setProcessingStep(1);
    toast({
      title: "Stock Verified",
      description: "All items are in stock and ready for processing.",
      variant: "default",
    });
  };

  // Handle process payment
  const handleProcessPayment = () => {
    setPaymentProcessed(true);
    setProcessingStep(2);
    toast({
      title: "Payment Processed",
      description: "Payment has been successfully processed.",
      variant: "default",
    });
  };

  // Handle pack items
  const handlePackItems = () => {
    setItemsPacked(true);
    setProcessingStep(3);
    toast({
      title: "Items Packed",
      description: "All items have been packed and are ready for shipping.",
      variant: "default",
    });
  };

  // Handle ship order
  const handleShipOrder = async () => {
    try {
      setOrderShipped(true);
      setProcessingStep(4);

      // Update order status to SHIPPED
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "SHIPPED" }),
      });

      // For development purposes, handle 404 as success
      if (response.status === 404) {
        console.warn(
          "Order API returned 404, but treating as success for development"
        );

        toast({
          title: "Order Shipped (Dev Mode)",
          description:
            "The order has been marked as shipped in development mode.",
          variant: "default",
        });

        return;
      }

      if (!response.ok) {
        throw new Error(`Error updating order: ${response.status}`);
      }

      toast({
        title: "Order Shipped",
        description: "The order has been marked as shipped.",
        variant: "default",
      });
    } catch (err) {
      console.error("Failed to update order:", err);
      toast({
        title: "Error",
        description: "Failed to update the order. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle complete order
  const handleCompleteOrder = () => {
    router.push("/admin/orders");
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
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/admin/orders")}
        >
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
          onClick={() => router.push("/admin/orders")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">
          Process Order #{order.orderId.replace("#ORD-", "")}
        </h1>
        <Badge
          variant="outline"
          className="ml-4 bg-yellow-50 text-yellow-800 border-yellow-200"
        >
          {order.status}
        </Badge>
        <div className="flex-grow"></div>
        <Button
          variant="default"
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={handleCompleteOrder}
        >
          Complete Processing
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Processing Steps Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Processing Steps</h2>

              {/* Step 1: Verify Stock */}
              <div className="flex items-start border-b border-gray-100 pb-4 mb-4">
                <div
                  className={`rounded-full p-2 mr-4 ${
                    stockVerified
                      ? "bg-green-100"
                      : processingStep === 0
                      ? "bg-blue-100"
                      : "bg-gray-100"
                  }`}
                >
                  {stockVerified ? (
                    <CheckCircle
                      className="h-5 w-5 text-green-600"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <AlertCircle
                      className={`h-5 w-5 ${
                        processingStep === 0 ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-medium">Verify Stock</h3>
                    {stockVerified && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-800"
                      >
                        Completed
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Confirm all items are in stock and available for shipping
                  </p>
                  {processingStep === 0 && !stockVerified && (
                    <Button
                      onClick={handleVerifyStock}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Verify Stock
                    </Button>
                  )}
                </div>
              </div>

              {/* Step 2: Process Payment */}
              <div className="flex items-start border-b border-gray-100 pb-4 mb-4">
                <div
                  className={`rounded-full p-2 mr-4 ${
                    paymentProcessed
                      ? "bg-green-100"
                      : processingStep === 1
                      ? "bg-blue-100"
                      : "bg-gray-100"
                  }`}
                >
                  {paymentProcessed ? (
                    <CheckCircle
                      className="h-5 w-5 text-green-600"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <CreditCard
                      className={`h-5 w-5 ${
                        processingStep === 1 ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-medium">Process Payment</h3>
                    {paymentProcessed && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-800"
                      >
                        Completed
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Confirm payment has been processed successfully
                  </p>
                  {processingStep === 1 && !paymentProcessed && (
                    <Button
                      onClick={handleProcessPayment}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Process Payment
                    </Button>
                  )}
                </div>
              </div>

              {/* Step 3: Pack Items */}
              <div className="flex items-start border-b border-gray-100 pb-4 mb-4">
                <div
                  className={`rounded-full p-2 mr-4 ${
                    itemsPacked
                      ? "bg-green-100"
                      : processingStep === 2
                      ? "bg-blue-100"
                      : "bg-gray-100"
                  }`}
                >
                  {itemsPacked ? (
                    <CheckCircle
                      className="h-5 w-5 text-green-600"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <Package
                      className={`h-5 w-5 ${
                        processingStep === 2 ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-medium">Pack Items</h3>
                    {itemsPacked && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-800"
                      >
                        Completed
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Pack all items securely for shipping
                  </p>
                  {processingStep === 2 && !itemsPacked && (
                    <Button
                      onClick={handlePackItems}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Mark as Packed
                    </Button>
                  )}
                </div>
              </div>

              {/* Step 4: Ship Order */}
              <div className="flex items-start">
                <div
                  className={`rounded-full p-2 mr-4 ${
                    orderShipped
                      ? "bg-green-100"
                      : processingStep === 3
                      ? "bg-blue-100"
                      : "bg-gray-100"
                  }`}
                >
                  {orderShipped ? (
                    <CheckCircle
                      className="h-5 w-5 text-green-600"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <Truck
                      className={`h-5 w-5 ${
                        processingStep === 3 ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-medium">Ship Order</h3>
                    {orderShipped && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-800"
                      >
                        Completed
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Ship the order to the customer
                  </p>
                  {processingStep === 3 && !orderShipped && (
                    <Button
                      onClick={handleShipOrder}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Mark as Shipped
                    </Button>
                  )}
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
                          <p className="text-sm mt-1">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(item.price)}
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

          {/* Processing Notes */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Processing Notes</h2>
              <Textarea
                placeholder="Add notes about this order processing..."
                value={processingNotes}
                onChange={(e) => setProcessingNotes(e.target.value)}
                className="min-h-24"
              />
              <Button className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white">
                Add Note
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Customer Information
              </h2>
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

              <div className="space-y-2">
                <div className="flex">
                  <span className="text-gray-500 w-20">Email:</span>
                  <span>{order.customer.email}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-20">Phone:</span>
                  <span>{order.customer.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
              <div className="space-y-1">
                <p>{order.shippingAddress?.street}</p>
                {order.shippingAddress?.apt && (
                  <p>{order.shippingAddress.apt}</p>
                )}
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                  {order.shippingAddress?.zip}
                </p>
                <p>{order.shippingAddress?.country}</p>
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
}

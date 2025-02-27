import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  OrderStatus,
  PaymentStatus,
  AddressType,
  Prisma,
} from "@prisma/client";

// Define types for the order with included relations
type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    user: true;
    items: {
      include: {
        product: {
          select: {
            name: true;
            price: true;
            images: true;
          };
        };
      };
    };
  };
}>;

// Define type for OrderItem with product
type OrderItemWithProduct = Prisma.OrderItemGetPayload<{
  include: {
    product: {
      select: {
        name: true;
        price: true;
        images: true;
      };
    };
  };
}>;

// Extended User type to include the phone field
interface UserWithPhone {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  phone: string | null;
  // Include other user fields as needed
}

// GET: Fetch a specific order by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    const order = (await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        user: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    })) as OrderWithRelations | null;

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get shipping address if available
    let shippingAddress = null;
    if (order.userId) {
      const address = await prisma.address.findFirst({
        where: {
          userId: order.userId,
          type: "SHIPPING" as const, // Use const assertion to ensure it's treated as an enum
        },
      });

      if (address) {
        shippingAddress = {
          street: address.street,
          apt: (address as any).apt ?? "", // Type assertion to fix TypeScript error
          city: address.city,
          state: address.state,
          zip: address.postalCode,
          country: address.country,
        };
      }
    }

    // Cast the user to our extended type that includes phone
    const userWithPhone = order.user as unknown as UserWithPhone;

    // Transform the data to a more usable format for the frontend
    const formattedOrder = {
      id: order.id,
      orderId: `#ORD-${order.id.substring(0, 6)}`,
      customer: {
        name: userWithPhone?.name || "Anonymous",
        email: userWithPhone?.email || null,
        image: userWithPhone?.image || null,
        phone: userWithPhone?.phone || null,
      },
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      date: order.createdAt,
      items: order.items.map((item: OrderItemWithProduct) => ({
        id: item.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        image: item.product.images[0] || null,
      })),
      shippingAddress: shippingAddress,
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Error fetching order" },
      { status: 500 }
    );
  }
}

// PATCH: Update a specific order
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const data = await request.json();

    console.log("Received update data:", JSON.stringify(data, null, 2));

    // Validate the order exists
    const existingOrder = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        user: true,
        items: true, // Include items to update them
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Create an update object with only valid fields
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Validate and set status if provided
    if (data.status) {
      // Check if the provided status is a valid OrderStatus enum value
      const validOrderStatuses = Object.values(OrderStatus);
      if (validOrderStatuses.includes(data.status)) {
        updateData.status = data.status;
      } else {
        return NextResponse.json(
          {
            error: `Invalid order status. Must be one of: ${validOrderStatuses.join(
              ", "
            )}`,
            providedStatus: data.status,
          },
          { status: 400 }
        );
      }
    }

    // Validate and set payment status if provided
    if (data.paymentStatus) {
      // Check if the provided payment status is a valid PaymentStatus enum value
      const validPaymentStatuses = Object.values(PaymentStatus);
      if (validPaymentStatuses.includes(data.paymentStatus)) {
        updateData.paymentStatus = data.paymentStatus;
      } else {
        return NextResponse.json(
          {
            error: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(
              ", "
            )}`,
            providedStatus: data.paymentStatus,
          },
          { status: 400 }
        );
      }
    }

    // Update the order with validated data
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: updateData,
    });

    // Process customer information and shipping address updates
    const updatePromises = [];

    // If customer information is provided, update the user
    if (data.customer && existingOrder.userId) {
      const userUpdateData: any = {};

      if (data.customer.name) {
        userUpdateData.name = data.customer.name;
      }

      if (data.customer.email) {
        userUpdateData.email = data.customer.email;
      }

      if (data.customer.phone) {
        userUpdateData.phone = data.customer.phone;
      }

      // Only update user if we have data to update
      if (Object.keys(userUpdateData).length > 0) {
        updatePromises.push(
          prisma.user.update({
            where: {
              id: existingOrder.userId,
            },
            data: userUpdateData,
          })
        );
      }
    }

    // If items are provided, update their quantities
    if (data.items && Array.isArray(data.items)) {
      // Process each item update
      for (const item of data.items) {
        if (item.id && typeof item.quantity === "number") {
          updatePromises.push(
            prisma.orderItem.update({
              where: {
                id: item.id,
              },
              data: {
                quantity: item.quantity,
              },
            })
          );
        }
      }

      // Recalculate the order total based on updated quantities
      if (data.items.length > 0) {
        // Get the latest order items after updates
        const updatedItems = await prisma.orderItem.findMany({
          where: {
            orderId: orderId,
          },
          include: {
            product: true,
          },
        });

        // Calculate the new total
        const newTotal = updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        // Update the order total
        updatePromises.push(
          prisma.order.update({
            where: {
              id: orderId,
            },
            data: {
              total: newTotal,
            },
          })
        );
      }
    }

    // If shipping address is provided, update or create an address
    if (data.shippingAddress && existingOrder.userId) {
      const { street, city, state, zip, country, apt } = data.shippingAddress;

      // Only proceed if we have at least some address data
      if (street || city || state || zip || country) {
        // Check if user already has a shipping address
        const existingAddress = await prisma.address.findFirst({
          where: {
            userId: existingOrder.userId,
            type: "SHIPPING" as const, // Use const assertion to ensure it's treated as an enum
          },
        });

        const addressData = {
          userId: existingOrder.userId,
          type: "SHIPPING" as const, // Use const assertion to ensure it's treated as an enum
          name:
            data.customer?.name ||
            existingOrder.user?.name ||
            "Shipping Address",
          street: street || "",
          apt: apt || "",
          city: city || "",
          state: state || "",
          postalCode: zip || "",
          country: country || "",
          isDefault: true,
        };

        if (existingAddress) {
          // Update existing address
          updatePromises.push(
            prisma.address.update({
              where: {
                id: existingAddress.id,
              },
              data: addressData,
            })
          );
        } else {
          // Create new address
          updatePromises.push(
            prisma.address.create({
              data: addressData,
            })
          );
        }
      }
    }

    // If notes are provided, we could store them in a separate table
    if (data.notes) {
      console.log(`Order notes for ${orderId}: ${data.notes}`);
      // Implementation for storing notes would go here
    }

    // Wait for all updates to complete
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    return NextResponse.json({
      message: "Order updated successfully",
      id: updatedOrder.id,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Error updating order", details: (error as Error).message },
      { status: 500 }
    );
  }
}

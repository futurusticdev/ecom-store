import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import * as z from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to confirm deletion"),
});

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const body = deleteAccountSchema.parse(json);

    // Get the user with their current password
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Verify password if it exists
    if (user.password) {
      const isPasswordValid = await bcrypt.compare(
        body.password,
        user.password
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { message: "Incorrect password" },
          { status: 400 }
        );
      }
    }

    // Delete user data in the correct order to avoid foreign key constraints
    try {
      // First, delete any related data that might have foreign key constraints

      // Check if we have the Order model
      if (prisma.order) {
        // Find all orders for this user
        const orders = await prisma.order.findMany({
          where: { userId: user.id },
          select: { id: true },
        });

        // Delete order items for each order
        if (prisma.orderItem) {
          for (const order of orders) {
            await prisma.orderItem.deleteMany({
              where: { orderId: order.id },
            });
          }
        }

        // Delete all orders for this user
        await prisma.order.deleteMany({
          where: { userId: user.id },
        });
      }

      // Delete addresses if the model exists
      if (prisma.address) {
        await prisma.address.deleteMany({
          where: { userId: user.id },
        });
      }

      // Update user to remove all favorites
      await prisma.user.update({
        where: { id: user.id },
        data: {
          favorites: {
            set: [], // Clear all favorites
          },
        },
      });

      // Delete reviews if the model exists
      if (prisma.review) {
        await prisma.review.deleteMany({
          where: { userId: user.id },
        });
      }

      // Finally, delete the user account
      await prisma.user.delete({
        where: { id: user.id },
      });

      return NextResponse.json(
        { message: "Account deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error in deletion process:", error);
      return NextResponse.json(
        { message: "Error deleting account data" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error deleting account:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", issues: error.issues },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

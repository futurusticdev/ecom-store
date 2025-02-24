import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import * as z from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = passwordSchema.parse(json);

    // Get the user with their current password
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, password: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      body.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return new NextResponse("Invalid current password", { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(body.newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return new NextResponse("Password updated successfully");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

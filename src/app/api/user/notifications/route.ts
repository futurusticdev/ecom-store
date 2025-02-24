import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import * as z from "zod";

const notificationSchema = z.object({
  key: z.enum(["orderUpdates", "promotions", "productUpdates", "newsletter"]),
  enabled: z.boolean(),
});

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse and validate the request body
    const json = await req.json();
    const validatedData = notificationSchema.parse(json);

    // Update notification preferences
    // Note: In a real application, you would have a separate table for notification preferences
    // For this example, we'll just return a success response with the validated data
    return new NextResponse(
      JSON.stringify({
        message: "Notification preferences updated successfully",
        data: validatedData,
      })
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

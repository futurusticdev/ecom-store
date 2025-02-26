import { NextResponse } from "next/server";
import { getDatabaseStatus } from "@/lib/db-check";

export async function GET() {
  try {
    const status = await getDatabaseStatus();

    return NextResponse.json({
      status: status.isConnected ? "connected" : "disconnected",
      message: status.message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error checking database status:", { error });

    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unknown error checking database status",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

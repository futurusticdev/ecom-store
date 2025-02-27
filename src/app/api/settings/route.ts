import { NextResponse } from "next/server";

// Define the interface for store settings
interface StoreSettings {
  storeName: string;
  storeEmail: string;
  phoneNumber: string;
  currency: string;
  streetAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  logoUrl: string | null;
}

// Mock data - in a real app, this would be stored in a database
let storeSettings: StoreSettings = {
  storeName: "LUXE Fashion Store",
  storeEmail: "contact@luxestore.com",
  phoneNumber: "+1 (555) 123-4567",
  currency: "USD ($)",
  streetAddress: "123 Fashion Avenue",
  city: "New York",
  stateProvince: "NY",
  postalCode: "10001",
  country: "United States",
  logoUrl: "https://picsum.photos/id/237/200/200",
};

export async function GET() {
  return NextResponse.json(storeSettings);
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = [
      "storeName",
      "storeEmail",
      "phoneNumber",
      "currency",
      "streetAddress",
      "city",
      "postalCode",
      "country",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        !data[field] || (typeof data[field] === "string" && !data[field].trim())
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (data.storeEmail && !/^\S+@\S+\.\S+$/.test(data.storeEmail)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Update settings with new data
    storeSettings = {
      ...storeSettings,
      ...data,
    };

    // In a real app, you would save this to a database

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      data: storeSettings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update settings" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { lookupPincode } from "@tavistra/shared";
import { resolvePincodeHierarchy } from "@/lib/logisticsEngine";

export async function GET(request: NextRequest) {
  try {
    const pin = request.nextUrl.searchParams.get("pincode")?.replace(/\s+/g, "");

    if (!pin || !/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: "A valid 6-digit PIN code is required" }, { status: 400 });
    }

    const resolved = await resolvePincodeHierarchy(pin);
    return NextResponse.json(resolved);
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("GET /api/pincodes/check error:", error);
    const pin = request.nextUrl.searchParams.get("pincode") || "";
    const baseLookup = lookupPincode(pin);
    return NextResponse.json(baseLookup);
  }
}

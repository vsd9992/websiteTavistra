import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { lookupPincode } from "@tavistra/shared";

export async function GET(request: NextRequest) {
  try {
    const pin = request.nextUrl.searchParams.get("pincode")?.replace(/\s+/g, "");

    if (!pin || !/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: "A valid 6-digit PIN code is required" }, { status: 400 });
    }

    // 1. Fallback base lookup from static authority
    const baseLookup = lookupPincode(pin);

    // 2. Check for dynamic database override in PincodeRange
    // Check exact 6-digit match, 3-digit prefix, or 2-digit prefix
    const prefixes = [pin, pin.slice(0, 3), pin.slice(0, 2)];
    const dbOverride = await prisma.pincodeRange.findFirst({
      where: {
        pincodePrefix: {
          in: prefixes,
        },
      },
      orderBy: {
        pincodePrefix: "desc", // Most specific first
      },
      include: {
        shippingZone: true,
      },
    });

    if (dbOverride) {
      if (!dbOverride.isServiceable) {
        return NextResponse.json({
          pincode: pin,
          isServiceable: false,
          city: baseLookup.city,
          state: baseLookup.state,
          zoneCode: dbOverride.shippingZone.code,
          unserviceableReason: `Deliveries to PIN code ${pin} (${baseLookup.city}) are temporarily suspended by Studio Logistics.`,
        });
      }
    }

    return NextResponse.json({
      pincode: pin,
      isServiceable: baseLookup.isServiceable,
      city: baseLookup.city,
      state: baseLookup.state,
      locality: baseLookup.locality,
      zoneCode: dbOverride ? dbOverride.shippingZone.code : baseLookup.zoneCode,
      unserviceableReason: baseLookup.unserviceableReason,
    });
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("GET /api/pincodes/check error:", error);
    // Graceful fallback to shared library lookup
    const pin = request.nextUrl.searchParams.get("pincode") || "";
    const baseLookup = lookupPincode(pin);
    return NextResponse.json(baseLookup);
  }
}


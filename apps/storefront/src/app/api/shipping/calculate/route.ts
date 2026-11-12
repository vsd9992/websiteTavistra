import { NextRequest, NextResponse } from "next/server";
import { checkBulkOrderCeiling } from "@tavistra/shared";
import { calculateAuthoritativeShipping, ShippingCalcItemInput } from "@/lib/logisticsEngine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pincode, items } = body as {
      pincode?: string;
      items?: ShippingCalcItemInput[];
    };

    const cleanPin = (pincode || "").replace(/\s+/g, "");
    if (!/^\d{6}$/.test(cleanPin)) {
      return NextResponse.json(
        { error: "A valid 6-digit Indian PIN code is required." },
        { status: 400 }
      );
    }

    const validItems = Array.isArray(items) && items.length > 0 ? items : [];
    const bulkCheck = checkBulkOrderCeiling(
      validItems.map((i) => ({
        productId: i.productId || i.slug || "unknown",
        quantity: Math.max(1, i.quantity || 1),
      }))
    );

    const calculation = await calculateAuthoritativeShipping(cleanPin, validItems);

    return NextResponse.json({
      ...calculation,
      bulkCheck,
    });
  } catch (error) {
    console.error("POST /api/shipping/calculate error:", error);
    return NextResponse.json({ error: "Failed to calculate shipping charge" }, { status: 500 });
  }
}

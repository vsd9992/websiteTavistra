import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";

// Fallback metadata for representative PIN display in Admin
const PIN_METADATA_MAP: Record<string, { city: string; state: string; label: string }> = {
  "110001": { city: "Connaught Place, New Delhi", state: "Delhi", label: "Zone A (Delhi Local)" },
  "110019": { city: "Kalkaji, South Delhi", state: "Delhi", label: "Zone A (Delhi Fulfilment Origin)" },
  "110062": { city: "Khanpur / Tigri, South Delhi", state: "Delhi", label: "Zone A (Delhi Fulfilment Origin)" },
  "110074": { city: "Chhatarpur, South Delhi", state: "Delhi", label: "Zone A (Delhi Workshop Origin)" },
  "122002": { city: "DLF Phase 1 / Golf Course, Gurugram", state: "Haryana", label: "Zone A (Delhi NCR)" },
  "201301": { city: "Sector 18, Noida", state: "Uttar Pradesh", label: "Zone A (Delhi NCR)" },
  "400001": { city: "Fort / Colaba, South Mumbai", state: "Maharashtra", label: "Zone C (National Metro)" },
  "400050": { city: "Bandra West, Mumbai", state: "Maharashtra", label: "Zone C (National Metro)" },
  "560001": { city: "MG Road, Bengaluru", state: "Karnataka", label: "Zone C (National Metro)" },
  "560034": { city: "Koramangala, Bengaluru", state: "Karnataka", label: "Zone C (National Metro)" },
  "600002": { city: "Mount Road / Anna Salai, Chennai", state: "Tamil Nadu", label: "Zone C (National Metro)" },
  "500034": { city: "Banjara Hills, Hyderabad", state: "Telangana", label: "Zone C (National Metro)" },
  "700016": { city: "Park Street, Kolkata", state: "West Bengal", label: "Zone C (National Metro)" },
  "380015": { city: "Bodakdev / SG Highway, Ahmedabad", state: "Gujarat", label: "Zone C (National Metro)" },
  "302001": { city: "C-Scheme / MI Road, Jaipur", state: "Rajasthan", label: "Zone B (Regional North)" },
  "160017": { city: "Sector 17, Chandigarh", state: "Chandigarh", label: "Zone B (Regional North)" },
  "194101": { city: "Leh Central, Ladakh", state: "Ladakh", label: "Zone D (Special Terrain - High Altitude)" },
  "737101": { city: "Gangtok, Sikkim", state: "Sikkim", label: "Zone D (Special Terrain - Remote Hill)" },
};

export async function GET() {
  try {
    const ranges = await prisma.pincodeRange.findMany({
      include: {
        shippingZone: true,
      },
      orderBy: { pincodePrefix: "asc" },
    });

    const entries = ranges.map((r) => {
      const meta = PIN_METADATA_MAP[r.pincodePrefix] || {
        city: r.stateName,
        state: r.stateName,
        label: r.shippingZone.name,
      };

      return {
        id: r.id,
        pincode: r.pincodePrefix,
        city: meta.city,
        state: r.stateName,
        zoneCode: r.shippingZone.code,
        zoneLabel: meta.label || r.shippingZone.name,
        isServiceable: r.isServiceable,
        carrierAccepted: r.shippingZone.code !== "ZONE_D" || r.isServiceable,
        verifiedDate: "2026-11-06 (Policy TAV-09)",
      };
    });

    return NextResponse.json({ pincodes: entries });
  } catch (error) {
    console.error("GET /api/admin/pincodes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isServiceable, staffName } = body;

    if (!id || typeof isServiceable !== "boolean") {
      return NextResponse.json({ error: "id and isServiceable boolean are required" }, { status: 400 });
    }

    const updated = await prisma.pincodeRange.update({
      where: { id },
      data: { isServiceable },
      include: { shippingZone: true },
    });

    await prisma.auditLog.create({
      data: {
        action: "PINCODE_SERVICEABILITY_TOGGLE",
        entityType: "PincodeRange",
        entityId: updated.pincodePrefix,
        payloadJson: JSON.stringify({
          prefix: updated.pincodePrefix,
          isServiceable,
          staff: staffName || "Admin Staff",
        }),
      },
    });

    return NextResponse.json({ success: true, pincode: updated });
  } catch (error) {
    console.error("PATCH /api/admin/pincodes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


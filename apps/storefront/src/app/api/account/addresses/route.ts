import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { validateIndianMobile } from "@tavistra/shared";
import { getAuthenticatedUser } from "@/lib/auth";
import { resolvePincodeHierarchy } from "@/lib/logisticsEngine";

export async function GET(req: NextRequest) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const addresses = await prisma.customerAddress.findMany({
    where: { userId: authUser.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({
    addresses: addresses.map((a) => ({
      id: a.id,
      label: a.label || "Delivery Location",
      fullName: a.fullName,
      phone: a.phone,
      addressLine1: a.addressLine1,
      addressLine2: a.addressLine2 || undefined,
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      isDefault: a.isDefault,
    })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const {
      label = "Delivery Location",
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      isDefault = false,
    } = body as {
      label?: string;
      fullName?: string;
      phone?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      pincode?: string;
      isDefault?: boolean;
    };

    if (!fullName || fullName.trim().length < 2) {
      return NextResponse.json({ error: "Recipient name is required." }, { status: 400 });
    }
    if (!addressLine1 || addressLine1.trim().length < 4) {
      return NextResponse.json({ error: "Street address is required." }, { status: 400 });
    }

    const phoneRes = validateIndianMobile(phone || "");
    if (!phoneRes.isValid || !phoneRes.normalizedPhone) {
      return NextResponse.json({ error: phoneRes.error || "Valid 10-digit Indian mobile number required." }, { status: 400 });
    }

    const cleanPin = String(pincode || "").replace(/\D/g, "");
    if (!/^\d{6}$/.test(cleanPin)) {
      return NextResponse.json({ error: "A valid 6-digit Indian PIN code is required." }, { status: 400 });
    }

    const pinCheck = await resolvePincodeHierarchy(cleanPin);
    if (!pinCheck.isServiceable) {
      return NextResponse.json(
        { error: pinCheck.unserviceableReason || `PIN code ${cleanPin} is not serviceable.` },
        { status: 400 }
      );
    }

    const existingCount = await prisma.customerAddress.count({
      where: { userId: authUser.id },
    });
    const shouldBeDefault = Boolean(isDefault) || existingCount === 0;

    const created = await prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.customerAddress.updateMany({
          where: { userId: authUser.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.customerAddress.create({
        data: {
          userId: authUser.id,
          label: label.trim() || "Delivery Location",
          fullName: fullName.trim(),
          phone: phoneRes.normalizedPhone!,
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2?.trim() || null,
          city: city?.trim() || pinCheck.city || "India",
          state: state?.trim() || pinCheck.state || "India",
          pincode: cleanPin,
          isDefault: shouldBeDefault,
        },
      });
    });

    return NextResponse.json({
      success: true,
      address: {
        id: created.id,
        label: created.label,
        fullName: created.fullName,
        phone: created.phone,
        addressLine1: created.addressLine1,
        addressLine2: created.addressLine2 || undefined,
        city: created.city,
        state: created.state,
        pincode: created.pincode,
        isDefault: created.isDefault,
      },
    });
  } catch (error) {
    console.error("POST /api/account/addresses error:", error);
    return NextResponse.json({ error: "Unable to save address." }, { status: 500 });
  }
}


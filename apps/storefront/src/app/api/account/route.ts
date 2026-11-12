import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { validateIndianMobile } from "@tavistra/shared";
import {
  getAuthenticatedUser,
  serializeCustomerProfile,
  validateGstinFormat,
} from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json(
        { authenticated: false, user: null, error: "Authentication required." },
        { status: 401 }
      );
    }

    const addresses = await prisma.customerAddress.findMany({
      where: { userId: authUser.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      authenticated: true,
      user: serializeCustomerProfile(authUser, addresses),
    });
  } catch (error) {
    console.error("GET /api/account error:", error);
    return NextResponse.json({ error: "Unable to load account." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, gstin, practiceOrStudio } = body as {
      name?: string;
      phone?: string;
      gstin?: string;
      practiceOrStudio?: string;
    };

    const updateData: {
      name?: string;
      phone?: string;
      gstin?: string | null;
      practiceOrStudio?: string | null;
    } = {};

    if (name !== undefined) {
      if (name.trim().length < 2) {
        return NextResponse.json({ error: "Full name must be at least 2 characters." }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (phone !== undefined) {
      const phoneRes = validateIndianMobile(phone);
      if (!phoneRes.isValid || !phoneRes.normalizedPhone) {
        return NextResponse.json({ error: phoneRes.error || "Valid 10-digit Indian mobile number required." }, { status: 400 });
      }
      updateData.phone = phoneRes.normalizedPhone;
    }

    if (gstin !== undefined) {
      const gstinRes = validateGstinFormat(gstin);
      if (!gstinRes.isValid) {
        return NextResponse.json({ error: gstinRes.error }, { status: 400 });
      }
      updateData.gstin = gstinRes.normalized || null;
    }

    if (practiceOrStudio !== undefined) {
      updateData.practiceOrStudio = practiceOrStudio.trim() || null;
    }

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData,
      include: {
        addresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: "CUSTOMER_PROFILE_UPDATE",
        entityType: "User",
        entityId: authUser.id,
        payloadJson: JSON.stringify({
          updatedFields: Object.keys(updateData),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      user: serializeCustomerProfile(updated, updated.addresses),
    });
  } catch (error) {
    console.error("PATCH /api/account error:", error);
    return NextResponse.json({ error: "Unable to update profile." }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json(
    { error: "Use /api/auth/register or PATCH /api/account with an authenticated session." },
    { status: 405 }
  );
}

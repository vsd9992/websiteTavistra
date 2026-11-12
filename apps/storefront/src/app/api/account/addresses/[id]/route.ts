import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { validateIndianMobile } from "@tavistra/shared";
import { getAuthenticatedUser } from "@/lib/auth";
import { resolvePincodeHierarchy } from "@/lib/logisticsEngine";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await prisma.customerAddress.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Address not found." }, { status: 404 });
    }
    if (existing.userId !== authUser.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = await req.json();
    const {
      label,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      isDefault,
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

    const updateData: Record<string, any> = {};
    if (label !== undefined) updateData.label = label.trim() || "Delivery Location";
    if (fullName !== undefined) {
      if (fullName.trim().length < 2) {
        return NextResponse.json({ error: "Recipient name is required." }, { status: 400 });
      }
      updateData.fullName = fullName.trim();
    }
    if (phone !== undefined) {
      const phoneRes = validateIndianMobile(phone);
      if (!phoneRes.isValid || !phoneRes.normalizedPhone) {
        return NextResponse.json({ error: phoneRes.error || "Invalid Indian mobile number." }, { status: 400 });
      }
      updateData.phone = phoneRes.normalizedPhone;
    }
    if (addressLine1 !== undefined) updateData.addressLine1 = addressLine1.trim();
    if (addressLine2 !== undefined) updateData.addressLine2 = addressLine2.trim() || null;

    if (pincode !== undefined) {
      const cleanPin = String(pincode).replace(/\D/g, "");
      if (!/^\d{6}$/.test(cleanPin)) {
        return NextResponse.json({ error: "Valid 6-digit PIN code is required." }, { status: 400 });
      }
      const pinCheck = await resolvePincodeHierarchy(cleanPin);
      if (!pinCheck.isServiceable) {
        return NextResponse.json(
          { error: pinCheck.unserviceableReason || `PIN code ${cleanPin} is not serviceable.` },
          { status: 400 }
        );
      }
      updateData.pincode = cleanPin;
      updateData.city = city?.trim() || pinCheck.city || existing.city;
      updateData.state = state?.trim() || pinCheck.state || existing.state;
    } else {
      if (city !== undefined) updateData.city = city.trim();
      if (state !== undefined) updateData.state = state.trim();
    }

    if (isDefault === true) {
      updateData.isDefault = true;
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (isDefault === true) {
        await tx.customerAddress.updateMany({
          where: { userId: authUser.id, id: { not: id } },
          data: { isDefault: false },
        });
      }
      return tx.customerAddress.update({
        where: { id },
        data: updateData,
      });
    });

    return NextResponse.json({
      success: true,
      address: {
        id: updated.id,
        label: updated.label,
        fullName: updated.fullName,
        phone: updated.phone,
        addressLine1: updated.addressLine1,
        addressLine2: updated.addressLine2 || undefined,
        city: updated.city,
        state: updated.state,
        pincode: updated.pincode,
        isDefault: updated.isDefault,
      },
    });
  } catch (error) {
    console.error("PATCH /api/account/addresses/[id] error:", error);
    return NextResponse.json({ error: "Unable to update address." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await prisma.customerAddress.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Address not found." }, { status: 404 });
    }
    if (existing.userId !== authUser.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    // If orders already reference this shippingAddressId, detach userId instead of violating FK constraint
    const linkedOrders = await prisma.order.count({
      where: { shippingAddressId: id },
    });

    await prisma.$transaction(async (tx) => {
      if (linkedOrders > 0) {
        await tx.customerAddress.update({
          where: { id },
          data: { userId: null, isDefault: false },
        });
      } else {
        await tx.customerAddress.delete({ where: { id } });
      }

      if (existing.isDefault) {
        const nextAddr = await tx.customerAddress.findFirst({
          where: { userId: authUser.id },
          orderBy: { createdAt: "desc" },
        });
        if (nextAddr) {
          await tx.customerAddress.update({
            where: { id: nextAddr.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/account/addresses/[id] error:", error);
    return NextResponse.json({ error: "Unable to delete address." }, { status: 500 });
  }
}


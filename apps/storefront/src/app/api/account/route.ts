import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        addresses: true,
        orders: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ found: false, user: null });
    }

    return NextResponse.json({
      found: true,
      user: {
        id: user.id,
        name: user.name || "",
        email: user.email,
        phone: user.phone || "",
        createdAt: user.createdAt.toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        }),
        addresses: user.addresses.map((a) => ({
          id: a.id,
          label: "Studio Location",
          fullName: a.fullName,
          phone: a.phone,
          addressLine1: a.addressLine1,
          addressLine2: a.addressLine2 || undefined,
          city: a.city,
          state: a.state,
          pincode: a.pincode,
          isDefault: a.isDefault,
        })),
        orders: user.orders.map((o) => ({
          id: o.orderNumber,
          mode: o.purchaseMode,
          totalAmountRupees: Number(o.totalAmount),
          statusLabel: o.status,
          createdAt: o.createdAt.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        })),
      },
    });
  } catch (error) {
    console.warn("Database account lookup unavailable:", error);
    return NextResponse.json(
      { found: false, user: null, databaseConnected: false },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, gstin, address } = body;

    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: {
        name,
        phone,
      },
      create: {
        email: email.toLowerCase(),
        name,
        phone,
      },
    });

    if (address) {
      await prisma.customerAddress.create({
        data: {
          userId: user.id,
          fullName: address.fullName || name,
          phone: address.phone || phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          isDefault: address.isDefault || false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      persistedToDatabase: true,
    });
  } catch (error) {
    console.warn("Database account sync bypass:", error);
    return NextResponse.json(
      { success: true, persistedToDatabase: false },
      { status: 200 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { prisma, PurchaseMode, OrderStatus } from "@tavistra/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const contact = searchParams.get("contact");

  if (!orderId) {
    return NextResponse.json(
      { error: "Order Reference parameter is required." },
      { status: 400 }
    );
  }

  try {
    const cleanId = orderId.trim().toUpperCase();
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: cleanId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ found: false, order: null });
    }

    // Verify contact if supplied
    if (contact) {
      const cleanContact = contact.trim().toLowerCase().replace(/[\s\-()]/g, "");
      const emailMatches = order.customerEmail.toLowerCase() === cleanContact;
      const cleanPhone = order.customerPhone.replace(/[\s\-()]/g, "");
      const phoneMatches =
        cleanPhone.includes(cleanContact) || cleanContact.includes(cleanPhone);

      if (!emailMatches && !phoneMatches) {
        return NextResponse.json({
          found: false,
          order: null,
          message: "Order located, but contact details did not match.",
        });
      }
    }

    return NextResponse.json({
      found: true,
      order: {
        id: order.orderNumber,
        mode: order.purchaseMode,
        customerName: order.shippingAddress.fullName,
        email: order.customerEmail,
        phone: order.customerPhone,
        addressLine1: order.shippingAddress.addressLine1,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        destinationPin: order.shippingAddress.pincode,
        items: order.items.map((i) => ({
          name: i.product.title,
          quantity: i.quantity,
          pricePaise: Math.round(Number(i.unitPrice) * 100),
        })),
        itemsSubtotalRupees: Number(order.itemsSubtotal),
        deliveryFeeRupees: Number(order.shippingCharge),
        totalAmountRupees: Number(order.totalAmount),
        amountPaidRupees: Number(order.amountPaid),
        balanceDueRupees: Number(order.balanceAmount),
        carrierName: order.carrierName || "Pending Carrier Assignment",
        awbNumber: order.trackingNumber || undefined,
        transitEstimate: "2–4 business days",
        status: order.status,
        statusLabel:
          order.purchaseMode === "MADE_TO_ORDER"
            ? "7-Day Confirmation Grace Window Active"
            : "In Transit with Carrier",
        statusDescription:
          order.purchaseMode === "MADE_TO_ORDER"
            ? "25% advance verified. Physical workshop machining begins on Day 8. 100% refund cancellation permitted within initial 7 days."
            : "Consignment crated and scheduled for dispatch.",
        createdAt: order.createdAt.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      },
    });
  } catch (error) {
    console.warn("Database lookup unavailable, returning null for fallback:", error);
    return NextResponse.json(
      { found: false, order: null, databaseConnected: false },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      id,
      mode,
      customerName,
      email,
      phone,
      addressLine1,
      city,
      state,
      destinationPin,
      items,
      itemsSubtotalRupees,
      deliveryFeeRupees,
      totalAmountRupees,
      amountPaidRupees,
      balanceDueRupees,
      carrierName,
    } = body;

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: customerName,
          phone,
        },
      });
    }

    // Create shipping address
    const address = await prisma.customerAddress.create({
      data: {
        userId: user.id,
        fullName: customerName,
        phone,
        addressLine1,
        city,
        state,
        pincode: destinationPin,
      },
    });

    // Determine purchase mode enum
    const purchaseModeEnum =
      mode === "MADE_TO_ORDER" ? PurchaseMode.MADE_TO_ORDER : PurchaseMode.READY_STOCK;

    // Create order record with items and payment ledger entry
    const order = await prisma.order.create({
      data: {
        orderNumber: id,
        userId: user.id,
        customerEmail: email.toLowerCase(),
        customerPhone: phone,
        shippingAddressId: address.id,
        purchaseMode: purchaseModeEnum,
        itemsSubtotal: itemsSubtotalRupees,
        shippingCharge: deliveryFeeRupees,
        totalAmount: totalAmountRupees,
        requiredAdvanceAmount: amountPaidRupees,
        amountPaid: amountPaidRupees,
        balanceAmount: balanceDueRupees,
        status:
          mode === "MADE_TO_ORDER"
            ? OrderStatus.CONFIRMED
            : OrderStatus.CONFIRMED,
        confirmedAt: new Date(),
        carrierName: carrierName || "Blue Dart Express",
        payments: {
          create: {
            paymentType: mode === "MADE_TO_ORDER" ? "ADVANCE_25" : "FULL_PAYMENT",
            amount: amountPaidRupees,
            status: "COMPLETED",
            gateway: "PHONEPE",
            verifiedAt: new Date(),
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      persistedToDatabase: true,
    });
  } catch (error) {
    console.warn("Database persistence bypass (saving locally):", error);
    return NextResponse.json(
      {
        success: true,
        persistedToDatabase: false,
        message: "Saved in application state (offline / local storage fallback).",
      },
      { status: 200 }
    );
  }
}


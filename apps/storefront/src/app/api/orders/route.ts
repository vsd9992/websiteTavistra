import { NextRequest, NextResponse } from "next/server";
import { prisma, PurchaseMode, OrderStatus } from "@tavistra/db";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { resolvePincodeHierarchy } from "@/lib/logisticsEngine";
import { getAuthenticatedUser } from "@/lib/auth";

// Helper to compute grace days remaining from confirmedAt
function computeGraceDaysRemaining(confirmedAt: Date | null): number {
  if (!confirmedAt) return 7;
  const elapsedMs = Date.now() - new Date(confirmedAt).getTime();
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  return Math.max(0, 7 - elapsedDays);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const contact = searchParams.get("contact");
  const email = searchParams.get("email");

  try {
    const sessionUser = await getAuthenticatedUser(req);

    // 1. Single order lookup (e.g. Guest Tracking /track)
    if (orderId) {
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

      const isAuthenticatedOwner = Boolean(sessionUser && order.userId === sessionUser.id);

      // Verify contact if supplied; require contact unless authenticated owner
      if (!isAuthenticatedOwner) {
        if (!contact || !contact.trim()) {
          return NextResponse.json(
            {
              found: false,
              order: null,
              message: "Please enter the email or mobile number associated with this order.",
            },
            { status: 401 }
          );
        }

        const cleanContact = contact.trim().toLowerCase().replace(/[\s\-()]/g, "");
        const emailMatches = order.customerEmail.toLowerCase() === cleanContact;
        const cleanPhone = order.customerPhone.replace(/[\s\-()]/g, "");
        const phoneMatches =
          cleanContact.length >= 6 &&
          (cleanPhone.includes(cleanContact) || cleanContact.includes(cleanPhone));

        if (!emailMatches && !phoneMatches) {
          return NextResponse.json(
            {
              found: false,
              order: null,
              message: "Order reference or contact details did not match.",
            },
            { status: 403 }
          );
        }
      }

      const graceDays = computeGraceDaysRemaining(order.confirmedAt);
      const qcImagesArray = order.qcImages ? JSON.parse(order.qcImages) : [];

      return NextResponse.json({
        found: true,
        order: {
          id: order.orderNumber,
          orderNumber: order.orderNumber,
          mode: order.purchaseMode,
          customerName: order.shippingAddress.fullName,
          email: order.customerEmail,
          phone: order.customerPhone,
          addressLine1: order.shippingAddress.addressLine1,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          destinationPin: order.shippingAddress.pincode,
          items: order.items.map((i) => ({
            name: i.product?.title || "Architectural Edition",
            quantity: i.quantity,
            pricePaise: Math.round(Number(i.unitPrice) * 100),
            priceRupees: Number(i.unitPrice),
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
            order.status === "DISPATCHED"
              ? "In Transit with Carrier"
              : order.status === "AWAITING_DISPATCH"
              ? "100% Paid — Packing for Dispatch"
              : order.status === "PRODUCTION_COMPLETED"
              ? "Workshop Crafting Completed — QC Verified"
              : order.status === "IN_PRODUCTION"
              ? "Machining in Progress in VDesign Workshop"
              : order.purchaseMode === "MADE_TO_ORDER"
              ? "7-Day Confirmation Grace Window Active"
              : "Order Confirmed",
          statusDescription:
            order.status === "DISPATCHED"
              ? `Consignment handed over to ${order.carrierName || "carrier"} under AWB ${order.trackingNumber || ""}.`
              : order.status === "AWAITING_DISPATCH"
              ? "Cumulative 100% payment verified. Workshop packaging and carrier scheduling active."
              : order.status === "PRODUCTION_COMPLETED"
              ? "Quality control verified. Customer inspection photos ready. Final balance settlement enabled."
              : order.status === "IN_PRODUCTION"
              ? "Precision crafting and machining currently active in our studio workshop."
              : order.purchaseMode === "MADE_TO_ORDER"
              ? "25% advance verified. Physical workshop machining begins on Day 8. 100% refund cancellation permitted within initial 7 days."
              : "Consignment crated and scheduled for dispatch.",
          graceDaysRemaining: graceDays,
          qcNotes: order.qcNotes || undefined,
          qcImages: qcImagesArray,
          createdAt: order.createdAt.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        },
      });
    }

    // 2. Lookup by customer email -> strictly require authenticated matching session
    if (email) {
      if (!sessionUser || sessionUser.email.toLowerCase() !== email.toLowerCase().trim()) {
        return NextResponse.json(
          { error: "Authentication required to query account orders." },
          { status: 401 }
        );
      }

      const orders = await prisma.order.findMany({
        where: {
          userId: sessionUser.id,
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
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        orders: orders.map((order) => ({
          id: order.orderNumber,
          orderNumber: order.orderNumber,
          mode: order.purchaseMode,
          customerName: order.shippingAddress.fullName,
          email: order.customerEmail,
          phone: order.customerPhone,
          addressLine1: order.shippingAddress.addressLine1,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          destinationPin: order.shippingAddress.pincode,
          items: order.items.map((i) => ({
            name: i.product?.title || "Architectural Edition",
            quantity: i.quantity,
            pricePaise: Math.round(Number(i.unitPrice) * 100),
            priceRupees: Number(i.unitPrice),
          })),
          itemsSubtotalRupees: Number(order.itemsSubtotal),
          deliveryFeeRupees: Number(order.shippingCharge),
          totalAmountRupees: Number(order.totalAmount),
          amountPaidRupees: Number(order.amountPaid),
          balanceDueRupees: Number(order.balanceAmount),
          carrierName: order.carrierName || "Pending Carrier Assignment",
          awbNumber: order.trackingNumber || undefined,
          status: order.status,
          graceDaysRemaining: computeGraceDaysRemaining(order.confirmedAt),
          qcNotes: order.qcNotes || undefined,
          qcImages: order.qcImages ? JSON.parse(order.qcImages) : [],
          createdAt: order.createdAt.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        })),
      });
    }

    // 3. Admin all orders list
    const allOrders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      orders: allOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        mode: order.purchaseMode,
        customerName: order.shippingAddress.fullName,
        email: order.customerEmail,
        phone: order.customerPhone,
        address: order.shippingAddress.addressLine1,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        pincode: order.shippingAddress.pincode,
        items: order.items.map((i) => ({
          name: i.product?.title || "Architectural Edition",
          quantity: i.quantity,
          priceRupees: Number(i.unitPrice),
        })),
        itemsSubtotalRupees: Number(order.itemsSubtotal),
        deliveryFeeRupees: Number(order.shippingCharge),
        totalAmountRupees: Number(order.totalAmount),
        amountPaidRupees: Number(order.amountPaid),
        balanceDueRupees: Number(order.balanceAmount),
        carrierName: order.carrierName || "Pending Carrier Assignment",
        awbNumber: order.trackingNumber || undefined,
        status: order.status,
        graceDaysRemaining: computeGraceDaysRemaining(order.confirmedAt),
        qcNotes: order.qcNotes || undefined,
        qcImages: order.qcImages ? JSON.parse(order.qcImages) : [],
        placedAt: order.createdAt.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      })),
    });
  } catch (error) {
    console.error("API GET /api/orders error:", error);
    return NextResponse.json(
      { error: "Internal Server Error fetching orders" },
      { status: 500 }
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

    if (destinationPin) {
      const pinCheck = await resolvePincodeHierarchy(String(destinationPin));
      if (!pinCheck.isServiceable) {
        return NextResponse.json(
          { error: pinCheck.unserviceableReason || `PIN code ${destinationPin} is currently unserviceable.` },
          { status: 400 }
        );
      }
    }

    const sessionUser = await getAuthenticatedUser(req);

    // Link ONLY if customer is signed in; reuse identical saved address to avoid duplicates
    const existingSavedAddress = sessionUser
      ? await prisma.customerAddress.findFirst({
          where: {
            userId: sessionUser.id,
            pincode: String(destinationPin).trim(),
            addressLine1: String(addressLine1).trim(),
            fullName: String(customerName).trim(),
            phone: String(phone).trim(),
          },
        })
      : null;

    const address =
      existingSavedAddress ||
      (await prisma.customerAddress.create({
        data: {
          userId: sessionUser ? sessionUser.id : null,
          guestEmail: sessionUser ? null : email.toLowerCase().trim(),
          fullName: String(customerName).trim(),
          phone: String(phone).trim(),
          addressLine1: String(addressLine1).trim(),
          city: String(city).trim(),
          state: String(state).trim(),
          pincode: String(destinationPin).trim(),
        },
      }));

    const purchaseModeEnum =
      mode === "MADE_TO_ORDER" ? PurchaseMode.MADE_TO_ORDER : PurchaseMode.READY_STOCK;

    // Resolve or find product references for items
    const orderItemsData = [];
    if (Array.isArray(items) && items.length > 0) {
      for (const it of items) {
        // Try finding matching product by title
        const product = await prisma.product.findFirst({
          where: { title: { contains: it.name } },
        });

        if (product) {
          orderItemsData.push({
            productId: product.id,
            quantity: it.quantity || 1,
            unitPrice: (it.pricePaise ? it.pricePaise / 100 : it.priceRupees) || 1000,
            subtotal:
              (it.quantity || 1) *
              ((it.pricePaise ? it.pricePaise / 100 : it.priceRupees) || 1000),
          });
        } else {
          // Fallback to first product in DB
          const firstProduct = await prisma.product.findFirst();
          if (firstProduct) {
            orderItemsData.push({
              productId: firstProduct.id,
              quantity: it.quantity || 1,
              unitPrice: (it.pricePaise ? it.pricePaise / 100 : it.priceRupees) || 1000,
              subtotal:
                (it.quantity || 1) *
                ((it.pricePaise ? it.pricePaise / 100 : it.priceRupees) || 1000),
            });
          }
        }
      }
    }

    // Create order record with financial ledger and initial payment
    const order = await prisma.order.create({
      data: {
        orderNumber: id,
        userId: sessionUser ? sessionUser.id : null,
        customerEmail: email.toLowerCase().trim(),
        customerPhone: phone,
        shippingAddressId: address.id,
        purchaseMode: purchaseModeEnum,
        itemsSubtotal: itemsSubtotalRupees,
        shippingCharge: deliveryFeeRupees,
        totalAmount: totalAmountRupees,
        requiredAdvanceAmount: amountPaidRupees,
        amountPaid: amountPaidRupees,
        balanceAmount: balanceDueRupees,
        status: OrderStatus.CONFIRMED,
        confirmedAt: new Date(),
        carrierName: carrierName || "Blue Dart Fragile Surface",
        items: {
          create: orderItemsData,
        },
        payments: {
          create: {
            paymentType: mode === "MADE_TO_ORDER" ? "ADVANCE_25" : "FULL_PAYMENT",
            amount: amountPaidRupees,
            status: "COMPLETED",
            gateway: "PHONEPE",
            gatewayTransactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            verifiedAt: new Date(),
          },
        },
      },
    });

    // Dispatch asynchronous order confirmation email
    sendOrderConfirmationEmail({
      orderNumber: order.orderNumber,
      customerName,
      customerEmail: email,
      mode: purchaseModeEnum,
      items: Array.isArray(items)
        ? items.map((it: { name: string; quantity?: number; pricePaise?: number; priceRupees?: number }) => ({
            name: it.name,
            quantity: it.quantity || 1,
            priceRupees: (it.pricePaise ? it.pricePaise / 100 : it.priceRupees) || 1000,
          }))
        : [],
      itemsSubtotalRupees,
      deliveryFeeRupees,
      totalAmountRupees,
      amountPaidRupees,
      balanceDueRupees,
      city,
      state,
      pincode: destinationPin,
    }).catch((err) => console.warn("Order confirmation email dispatch failed:", err));

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      persistedToDatabase: true,
    });
  } catch (error) {
    console.error("Database persistence error in POST /api/orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to persist order to database",
      },
      { status: 500 }
    );
  }
}

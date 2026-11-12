import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { getAuthenticatedUser } from "@/lib/auth";

function computeGraceDaysRemaining(confirmedAt: Date | null): number {
  if (!confirmedAt) return 7;
  const elapsedMs = Date.now() - new Date(confirmedAt).getTime();
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  return Math.max(0, 7 - elapsedDays);
}

/**
 * Strict session-authenticated customer order history.
 * Returns ONLY orders owned by `sessionUser.id` (never leaks guest orders or other users' orders).
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: authUser.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
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
        })),
        itemsSubtotalRupees: Number(order.itemsSubtotal),
        deliveryFeeRupees: Number(order.shippingCharge),
        totalAmountRupees: Number(order.totalAmount),
        amountPaidRupees: Number(order.amountPaid),
        balanceDueRupees: Number(order.balanceAmount),
        carrierName: order.carrierName || "Pending Carrier Assignment",
        awbNumber: order.trackingNumber || undefined,
        transitEstimate: "3–6 business days",
        status: order.status,
        statusLabel:
          order.status === "DISPATCHED"
            ? "In Transit with Carrier"
            : order.status === "AWAITING_DISPATCH"
            ? "100% Paid — Packing for Dispatch"
            : order.status === "PRODUCTION_COMPLETED"
            ? "Workshop Crafting Completed — QC Verified"
            : order.status === "IN_PRODUCTION"
            ? "Machining in Progress in Tavistra Workshop"
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
  } catch (error) {
    console.error("GET /api/account/orders error:", error);
    return NextResponse.json({ error: "Unable to load account orders." }, { status: 500 });
  }
}


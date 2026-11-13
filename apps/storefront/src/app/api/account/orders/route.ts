import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { deriveOrderStatusPresentation, safeParseQcImages } from "@/lib/orderStatus";

export const dynamic = "force-dynamic";

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
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      {
        orders: orders.map((order) => ({
          id: order.orderNumber,
          orderNumber: order.orderNumber,
          quoteNumber: order.quoteNumber || undefined,
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
          ...deriveOrderStatusPresentation(order),
          qcNotes: order.qcNotes || undefined,
          qcImages: safeParseQcImages(order.qcImages),
          cancelledAt: order.cancelledAt
            ? order.cancelledAt.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : null,
          createdAt: order.createdAt.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/account/orders error:", error);
    return NextResponse.json({ error: "Unable to load account orders." }, { status: 500 });
  }
}

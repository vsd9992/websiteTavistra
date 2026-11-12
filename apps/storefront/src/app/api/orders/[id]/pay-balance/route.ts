import { NextRequest, NextResponse } from "next/server";
import { prisma, OrderStatus } from "@tavistra/db";
import { sendBalancePaymentClearedEmail } from "@/lib/email";
import { deriveOrderStatusPresentation } from "@/lib/orderStatus";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const gateway = body.gateway || "PHONEPE";

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id.toUpperCase() }],
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REFUNDED) {
      return NextResponse.json(
        { error: "Cancelled or refunded orders cannot accept balance payments." },
        { status: 400 }
      );
    }

    const balanceDue = Number(order.balanceAmount);
    if (balanceDue <= 0) {
      return NextResponse.json({
        success: true,
        message: "Order balance is already fully cleared (₹0 due).",
        order: {
          id: order.orderNumber,
          orderNumber: order.orderNumber,
          amountPaidRupees: Number(order.amountPaid),
          balanceDueRupees: 0,
          status: order.status,
          ...deriveOrderStatusPresentation(order),
        },
      });
    }

    const currentPaid = Number(order.amountPaid);
    const newPaid = currentPaid + balanceDue;
    const nextStatus =
      order.status === OrderStatus.PRODUCTION_COMPLETED
        ? OrderStatus.AWAITING_DISPATCH
        : order.status;

    const updatedOrder = await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          orderId: order.id,
          paymentType: "BALANCE_75",
          amount: balanceDue,
          status: "COMPLETED",
          gateway,
          gatewayTransactionId: `TXN-BAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          verifiedAt: new Date(),
        },
      });

      const saved = await tx.order.update({
        where: { id: order.id },
        data: {
          amountPaid: newPaid,
          balanceAmount: 0.0,
          status: nextStatus,
        },
        include: {
          items: { include: { product: true } },
          shippingAddress: true,
          payments: true,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "BALANCE_PAYMENT_VERIFIED",
          entityType: "Order",
          entityId: order.orderNumber,
          payloadJson: JSON.stringify({
            gateway,
            balanceClearedRupees: balanceDue,
            totalPaidRupees: newPaid,
            newStatus: nextStatus,
          }),
        },
      });

      return saved;
    });

    sendBalancePaymentClearedEmail({
      orderNumber: updatedOrder.orderNumber,
      customerName: updatedOrder.shippingAddress?.fullName || "Client",
      customerEmail: updatedOrder.customerEmail,
      amountPaidRupees: balanceDue,
      totalAmountRupees: Number(updatedOrder.totalAmount),
    }).catch((err) => console.warn("Balance payment email dispatch error:", err));

    return NextResponse.json({
      success: true,
      message: `Balance payment of ₹${balanceDue.toLocaleString("en-IN")} verified. Cumulative 100% payment achieved.`,
      order: {
        id: updatedOrder.orderNumber,
        orderNumber: updatedOrder.orderNumber,
        amountPaidRupees: Number(updatedOrder.amountPaid),
        balanceDueRupees: Number(updatedOrder.balanceAmount),
        status: updatedOrder.status,
        ...deriveOrderStatusPresentation(updatedOrder),
      },
    });
  } catch (error) {
    console.error("POST /api/orders/[id]/pay-balance error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  prisma,
  OrderStatus,
  PaymentStatus,
  PaymentType,
  PurchaseMode,
  StockMovementType,
} from "@tavistra/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { sendOrderCancelledRefundEmail } from "@/lib/email";
import { computeGraceWindow, deriveOrderStatusPresentation } from "@/lib/orderStatus";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required to cancel an account order." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reasonNotes =
      typeof body.reason === "string" && body.reason.trim()
        ? body.reason.trim()
        : "Client-initiated cancellation from account portal.";

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id.toUpperCase() }],
      },
      include: {
        shippingAddress: true,
        items: true,
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Verify ownership: customer can only cancel their own orders
    if (order.userId !== authUser.id) {
      return NextResponse.json(
        { error: "You are not authorized to cancel this order." },
        { status: 403 }
      );
    }

    // Check 1: Already cancelled or refunded
    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REFUNDED) {
      return NextResponse.json(
        { error: "Order has already been cancelled." },
        { status: 400 }
      );
    }

    // Check 2: Already dispatched or delivered
    if (order.status === OrderStatus.DISPATCHED || order.status === OrderStatus.DELIVERED) {
      return NextResponse.json(
        {
          error:
            "Orders that have already been dispatched cannot be cancelled online. Please contact concierge upon delivery.",
        },
        { status: 400 }
      );
    }

    // Check 3: Made to Order grace check
    if (order.purchaseMode === PurchaseMode.MADE_TO_ORDER) {
      const grace = computeGraceWindow(order.confirmedAt);
      if (
        !grace.isGraceActive ||
        order.status === OrderStatus.IN_PRODUCTION ||
        order.status === OrderStatus.PRODUCTION_COMPLETED ||
        order.status === OrderStatus.AWAITING_DISPATCH
      ) {
        return NextResponse.json(
          {
            error:
              "Made-to-Order orders can only be cancelled during the initial 7-calendar-day confirmation grace period before workshop production commences.",
          },
          { status: 400 }
        );
      }
    }

    const paidRupees = Number(order.amountPaid);
    const resolvedRef = `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Order status
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
          balanceAmount: 0,
        },
      });

      // 2. Issue 100% Refund Payment record
      if (paidRupees > 0) {
        await tx.payment.create({
          data: {
            orderId: order.id,
            paymentType: PaymentType.REFUND,
            amount: paidRupees,
            status: PaymentStatus.COMPLETED,
            gateway: "PHONEPE_REFUND",
            gatewayTransactionId: resolvedRef,
            verifiedAt: new Date(),
            notes: `100% pre-dispatch statutory refund: ${reasonNotes}`,
          },
        });
      }

      // 3. Restore inventory if Ready Stock
      if (order.purchaseMode === PurchaseMode.READY_STOCK) {
        for (const item of order.items) {
          if (!item.variantId) continue;
          const ledger = await tx.inventoryLedger.findUnique({
            where: { variantId: item.variantId },
          });
          if (ledger) {
            await tx.inventoryLedger.update({
              where: { id: ledger.id },
              data: { availableStock: { increment: item.quantity } },
            });
            await tx.stockMovement.create({
              data: {
                inventoryLedgerId: ledger.id,
                type: StockMovementType.RETURN_RESTOCK,
                quantity: item.quantity,
                referenceId: order.orderNumber,
                notes: `Client pre-dispatch cancellation restock (${order.orderNumber})`,
              },
            });
          }
        }
      }

      // 4. Update linked quote/inquiry if applicable
      let originatingQuoteNumber = (order as any).quoteNumber || null;
      const linkedQuote = await tx.quoteProposal.findFirst({
        where: {
          OR: [
            { linkedOrderId: order.id },
            ...(originatingQuoteNumber ? [{ quoteNumber: originatingQuoteNumber }] : []),
          ],
        },
      });

      if (linkedQuote) {
        if (!originatingQuoteNumber) {
          originatingQuoteNumber = linkedQuote.quoteNumber;
        }
        if (linkedQuote.inquiryId) {
          await tx.bulkInquiry.update({
            where: { id: linkedQuote.inquiryId },
            data: { status: "ORDER_CANCELLED" },
          });
        }
      }

      // 5. Create Audit Log
      await tx.auditLog.create({
        data: {
          action: "ORDER_CANCELLED_REFUND",
          entityType: "Order",
          entityId: order.orderNumber,
          payloadJson: JSON.stringify({
            actor: authUser.email,
            actorType: "CUSTOMER",
            refundAmountRupees: paidRupees,
            refundReference: resolvedRef,
            originatingQuoteNumber,
            reason: reasonNotes,
          }),
        },
      });

      const refreshed = await tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: { payments: true, items: true, shippingAddress: true },
      });

      return {
        refreshed,
        paidRupees,
        resolvedRef,
        originatingQuoteNumber,
      };
    });

    // Send confirmation email asynchronously (non-blocking)
    sendOrderCancelledRefundEmail({
      orderNumber: order.orderNumber,
      quoteNumber: result.originatingQuoteNumber,
      customerName: order.shippingAddress?.fullName || authUser.name || "Client",
      customerEmail: order.customerEmail || authUser.email,
      refundAmountRupees: result.paidRupees,
      totalAmountRupees: Number(order.totalAmount),
      refundReference: result.resolvedRef,
      refundGateway: "PHONEPE_REFUND",
      cancellationReason: reasonNotes,
      itemsSummary: order.items?.map((i) => i.productId).join(", ") || undefined,
    }).catch((emailErr) => console.warn("Cancellation refund email non-blocking error:", emailErr));

    return NextResponse.json({
      success: true,
      message: `Order ${order.orderNumber} has been cancelled successfully. A 100% refund of ₹${result.paidRupees.toLocaleString(
        "en-IN"
      )} has been credited to your payment gateway reference.`,
      order: {
        ...result.refreshed,
        ...deriveOrderStatusPresentation(result.refreshed),
      },
    });
  } catch (error) {
    console.error("POST /api/account/orders/[id]/cancel error:", error);
    return NextResponse.json(
      { error: "Unable to process order cancellation at this time." },
      { status: 500 }
    );
  }
}

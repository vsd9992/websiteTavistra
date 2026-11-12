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
import { sendQcPhotosReadyEmail } from "@/lib/email";
import {
  computeGraceWindow,
  deriveOrderStatusPresentation,
  safeParseQcImages,
} from "@/lib/orderStatus";

function matchesOrderContact(
  order: { customerEmail: string; customerPhone: string },
  contact: string | null
): boolean {
  if (!contact || !contact.trim()) return false;
  const cleanContact = contact.trim().toLowerCase().replace(/[\s\-()]/g, "");
  const emailMatches = order.customerEmail.toLowerCase() === cleanContact;
  const cleanPhone = order.customerPhone.replace(/[\s\-()]/g, "");
  const phoneMatches =
    cleanContact.length >= 6 &&
    (cleanPhone.includes(cleanContact) || cleanContact.includes(cleanPhone));
  return emailMatches || phoneMatches;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const contact = searchParams.get("contact");
    const isAdminHeader = req.headers.get("x-tavistra-admin") === "true";

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id.toUpperCase() }],
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
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!isAdminHeader) {
      const sessionUser = await getAuthenticatedUser(req);
      const isOwner = Boolean(sessionUser && order.userId === sessionUser.id);
      if (!isOwner && !matchesOrderContact(order, contact)) {
        return NextResponse.json(
          { error: "Authentication or matching order contact required." },
          { status: contact ? 403 : 401 }
        );
      }
    }

    return NextResponse.json({
      order: {
        ...order,
        ...deriveOrderStatusPresentation(order),
        qcImagesArray: safeParseQcImages(order.qcImages),
      },
    });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, carrierName, awbNumber, qcNotes, qcImages, staffName } = body;
    const actorName = typeof staffName === "string" && staffName.trim() ? staffName.trim() : "Admin Staff";

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id.toUpperCase() }],
      },
      include: {
        shippingAddress: true,
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 1. Production Release (Strict Day 8 IST release from 7-day confirmation grace)
    if (action === "RELEASE_TO_WORKSHOP") {
      if (order.purchaseMode !== PurchaseMode.MADE_TO_ORDER) {
        return NextResponse.json(
          {
            error: "INVALID_MODE",
            message: "Only Made to Order consignments go through workshop production release.",
          },
          { status: 400 }
        );
      }

      if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REFUNDED) {
        return NextResponse.json(
          { error: "ORDER_CANCELLED", message: "Cancelled orders cannot be released to production." },
          { status: 400 }
        );
      }

      if (
        order.productionStartedAt ||
        order.status === OrderStatus.IN_PRODUCTION ||
        order.status === OrderStatus.PRODUCTION_COMPLETED ||
        order.status === OrderStatus.AWAITING_DISPATCH ||
        order.status === OrderStatus.DISPATCHED ||
        order.status === OrderStatus.DELIVERED
      ) {
        return NextResponse.json(
          {
            error: "ALREADY_RELEASED",
            message: "Order has already been released to workshop production.",
          },
          { status: 409 }
        );
      }

      if (Number(order.amountPaid) < Number(order.requiredAdvanceAmount)) {
        return NextResponse.json(
          {
            error: "ADVANCE_NOT_VERIFIED",
            message: "Verified minimum 25% production advance is required before workshop release.",
          },
          { status: 400 }
        );
      }

      const grace = computeGraceWindow(order.confirmedAt);
      if (grace.isGraceActive) {
        return NextResponse.json(
          {
            error: "GRACE_WINDOW_ACTIVE",
            message: `Production Release Blocked: 7-day confirmation grace window is still active (${grace.graceDaysRemaining} day(s) remaining). Physical workshop crafting may start on Day 8${grace.releaseEligibleDate ? ` (${grace.releaseEligibleDate})` : ""}.`,
            graceDaysRemaining: grace.graceDaysRemaining,
            releaseEligibleDate: grace.releaseEligibleDate,
          },
          { status: 400 }
        );
      }

      const updated = await prisma.$transaction(async (tx) => {
        const resOrder = await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.IN_PRODUCTION,
            productionStartedAt: new Date(),
          },
        });
        await tx.auditLog.create({
          data: {
            action: "PRODUCTION_RELEASE",
            entityType: "Order",
            entityId: order.orderNumber,
            payloadJson: JSON.stringify({
              staff: actorName,
              previousStatus: order.status,
              newStatus: OrderStatus.IN_PRODUCTION,
            }),
          },
        });
        return resOrder;
      });

      return NextResponse.json({
        success: true,
        message: "Order successfully released to workshop crafting.",
        order: { ...updated, ...deriveOrderStatusPresentation(updated) },
      });
    }

    // 2. Upload / Update Workshop QC Inspection Photos & Notes
    if (action === "UPDATE_QC") {
      if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REFUNDED) {
        return NextResponse.json(
          { error: "ORDER_CANCELLED", message: "Cannot publish QC inspection on a cancelled order." },
          { status: 400 }
        );
      }

      const cleanedImages = Array.isArray(qcImages)
        ? qcImages.filter((u): u is string => typeof u === "string" && u.trim().length > 0).map((u) => u.trim())
        : null;

      const balanceDue = Number(order.balanceAmount);
      const nextStatus =
        order.status === OrderStatus.DISPATCHED || order.status === OrderStatus.DELIVERED
          ? order.status
          : balanceDue <= 0
          ? OrderStatus.AWAITING_DISPATCH
          : OrderStatus.PRODUCTION_COMPLETED;

      const updated = await prisma.$transaction(async (tx) => {
        const resOrder = await tx.order.update({
          where: { id: order.id },
          data: {
            qcNotes: typeof qcNotes === "string" ? qcNotes.trim() : order.qcNotes,
            qcImages: cleanedImages !== null ? JSON.stringify(cleanedImages) : order.qcImages,
            status: nextStatus,
            productionCompletedAt: order.productionCompletedAt || new Date(),
          },
        });

        await tx.auditLog.create({
          data: {
            action: "QC_PHOTOS_PUBLISHED",
            entityType: "Order",
            entityId: order.orderNumber,
            payloadJson: JSON.stringify({
              staff: actorName,
              imageCount: cleanedImages ? cleanedImages.length : safeParseQcImages(order.qcImages).length,
              newStatus: nextStatus,
            }),
          },
        });

        return resOrder;
      });

      sendQcPhotosReadyEmail({
        orderNumber: order.orderNumber,
        customerName: order.shippingAddress?.fullName || "Client",
        customerEmail: order.customerEmail,
        qcNotes: typeof qcNotes === "string" ? qcNotes.trim() : order.qcNotes || undefined,
        balanceDueRupees: Number(order.balanceAmount),
      }).catch((err) => console.warn("QC email dispatch error:", err));

      return NextResponse.json({
        success: true,
        message: "Workshop QC inspection photos and notes updated successfully.",
        order: {
          ...updated,
          qcImages: safeParseQcImages(updated.qcImages),
          ...deriveOrderStatusPresentation(updated),
        },
      });
    }

    // 3. Carrier Handover & Dispatch (STRICT 100% PAYMENT GATE)
    if (action === "DISPATCH") {
      if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REFUNDED) {
        return NextResponse.json(
          { error: "ORDER_CANCELLED", message: "Cancelled orders cannot be dispatched." },
          { status: 400 }
        );
      }

      const balanceDue = Number(order.balanceAmount);
      if (balanceDue > 0) {
        return NextResponse.json(
          {
            error: "DISPATCH_BLOCKED",
            message: `Dispatch Blocked — 100% Payment Required. Balance Due: ₹${balanceDue.toLocaleString("en-IN")} (paid: ₹${Number(order.amountPaid).toLocaleString("en-IN")}).`,
            balanceDue,
          },
          { status: 400 }
        );
      }

      if (!awbNumber || !String(awbNumber).trim()) {
        return NextResponse.json(
          { error: "AWB tracking number is required for dispatch." },
          { status: 400 }
        );
      }

      const finalCarrier = (carrierName && String(carrierName).trim()) || order.carrierName || "Blue Dart Fragile Surface";
      const finalAwb = String(awbNumber).trim().toUpperCase();

      const updated = await prisma.$transaction(async (tx) => {
        const resOrder = await tx.order.update({
          where: { id: order.id },
          data: {
            carrierName: finalCarrier,
            trackingNumber: finalAwb,
            status: OrderStatus.DISPATCHED,
            dispatchedAt: new Date(),
          },
        });
        await tx.auditLog.create({
          data: {
            action: "AWB_ASSIGNED",
            entityType: "Order",
            entityId: order.orderNumber,
            payloadJson: JSON.stringify({
              staff: actorName,
              carrierName: finalCarrier,
              awbNumber: finalAwb,
            }),
          },
        });
        return resOrder;
      });

      return NextResponse.json({
        success: true,
        message: `Consignment assigned to ${updated.carrierName} with AWB ${updated.trackingNumber}.`,
        order: { ...updated, ...deriveOrderStatusPresentation(updated) },
      });
    }

    // 4. Mark Consignment Delivered
    if (action === "MARK_DELIVERED") {
      if (order.status !== OrderStatus.DISPATCHED) {
        return NextResponse.json(
          { error: "INVALID_STATE", message: "Only dispatched orders can be marked delivered." },
          { status: 400 }
        );
      }

      const updated = await prisma.$transaction(async (tx) => {
        const resOrder = await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.DELIVERED,
            deliveredAt: new Date(),
          },
        });
        await tx.auditLog.create({
          data: {
            action: "ORDER_DELIVERED",
            entityType: "Order",
            entityId: order.orderNumber,
            payloadJson: JSON.stringify({ staff: actorName }),
          },
        });
        return resOrder;
      });

      return NextResponse.json({
        success: true,
        message: `Order ${order.orderNumber} marked delivered.`,
        order: { ...updated, ...deriveOrderStatusPresentation(updated) },
      });
    }

    // 5. Pre-production / Pre-dispatch 100% refund cancellation
    if (action === "CANCEL_ORDER") {
      if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REFUNDED) {
        return NextResponse.json(
          { error: "ALREADY_CANCELLED", message: "Order is already cancelled." },
          { status: 400 }
        );
      }
      if (order.status === OrderStatus.DISPATCHED || order.status === OrderStatus.DELIVERED) {
        return NextResponse.json(
          { error: "ALREADY_DISPATCHED", message: "Dispatched consignments cannot be pre-production cancelled." },
          { status: 400 }
        );
      }
      if (
        order.purchaseMode === PurchaseMode.MADE_TO_ORDER &&
        (order.status === OrderStatus.IN_PRODUCTION ||
          order.status === OrderStatus.PRODUCTION_COMPLETED ||
          order.status === OrderStatus.AWAITING_DISPATCH)
      ) {
        return NextResponse.json(
          {
            error: "PRODUCTION_STARTED",
            message: "Workshop production has already started; pre-production grace cancellation is closed.",
          },
          { status: 400 }
        );
      }

      const updated = await prisma.$transaction(async (tx) => {
        const resOrder = await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.CANCELLED,
            cancelledAt: new Date(),
            balanceAmount: 0,
          },
        });

        const paidRupees = Number(order.amountPaid);
        if (paidRupees > 0) {
          await tx.payment.create({
            data: {
              orderId: order.id,
              paymentType: PaymentType.REFUND,
              amount: paidRupees,
              status: PaymentStatus.COMPLETED,
              gateway: "PHONEPE_REFUND",
              gatewayTransactionId: `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              verifiedAt: new Date(),
              notes: "100% pre-production / pre-dispatch statutory refund.",
            },
          });
        }

        // Restore inventory if Ready Stock order is cancelled before dispatch
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
                  notes: `Pre-dispatch cancellation restock (${order.orderNumber})`,
                },
              });
            }
          }
        }

        await tx.auditLog.create({
          data: {
            action: "ORDER_CANCELLED_REFUND",
            entityType: "Order",
            entityId: order.orderNumber,
            payloadJson: JSON.stringify({
              staff: actorName,
              refundAmountRupees: paidRupees,
            }),
          },
        });

        return resOrder;
      });

      return NextResponse.json({
        success: true,
        message: "Order cancelled and marked for 100% pre-production refund.",
        order: { ...updated, ...deriveOrderStatusPresentation(updated) },
      });
    }

    return NextResponse.json({ error: "Invalid action specified." }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

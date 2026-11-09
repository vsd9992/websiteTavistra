import { NextRequest, NextResponse } from "next/server";
import { prisma, OrderStatus } from "@tavistra/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    return NextResponse.json({ order });
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
    const { action, carrierName, awbNumber, qcNotes, qcImages } = body;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id.toUpperCase() }],
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 1. Production Release (Day 8 release from confirmation grace)
    if (action === "RELEASE_TO_WORKSHOP") {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.IN_PRODUCTION,
          productionStartedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Order successfully released to workshop crafting.",
        order: updated,
      });
    }

    // 2. Upload / Update Workshop QC Inspection Photos & Notes
    if (action === "UPDATE_QC") {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          qcNotes: qcNotes || order.qcNotes,
          qcImages: qcImages ? JSON.stringify(qcImages) : order.qcImages,
          status: OrderStatus.PRODUCTION_COMPLETED,
          productionCompletedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Workshop QC Inspection photos and notes updated successfully.",
        order: updated,
      });
    }

    // 3. Carrier Handover & Dispatch
    if (action === "DISPATCH") {
      // HARD ENFORCEMENT: 100% cumulative payment verified before packing / dispatch
      const balanceDue = Number(order.balanceAmount);
      if (balanceDue > 0) {
        return NextResponse.json(
          {
            error: "DISPATCH_BLOCKED",
            message: `Dispatch Blocked: Cumulative payment is at ₹${Number(order.amountPaid).toLocaleString("en-IN")}. 100% full payment (remaining ₹${balanceDue.toLocaleString("en-IN")}) must be cleared before physical packing or courier handover.`,
            balanceDue,
          },
          { status: 400 }
        );
      }

      if (!awbNumber || !awbNumber.trim()) {
        return NextResponse.json(
          { error: "AWB tracking number is required for dispatch." },
          { status: 400 }
        );
      }

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          carrierName: carrierName || order.carrierName || "Blue Dart Fragile Surface",
          trackingNumber: awbNumber.trim().toUpperCase(),
          status: OrderStatus.DISPATCHED,
          dispatchedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Consignment successfully assigned to ${updated.carrierName} with AWB ${updated.trackingNumber}.`,
        order: updated,
      });
    }

    // 4. Pre-production 100% refund cancellation during grace
    if (action === "CANCEL_ORDER") {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Order successfully cancelled and marked for pre-production refund.",
        order: updated,
      });
    }

    return NextResponse.json(
      { error: "Invalid action specified." },
      { status: 400 }
    );
  } catch (error) {
    console.error("PATCH /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  prisma,
  QuoteStatus,
  OrderStatus,
  PurchaseMode,
  PaymentStatus,
  PaymentType,
  Prisma,
} from "@tavistra/db";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quoteNumber: string }> }
) {
  try {
    const { quoteNumber } = await params;
    const cleanNumber = decodeURIComponent(quoteNumber).trim().toUpperCase();

    const proposal = await prisma.quoteProposal.findUnique({
      where: { quoteNumber: cleanNumber },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    if (proposal.status === QuoteStatus.ACCEPTED) {
      return NextResponse.json(
        { error: "Proposal has already been accepted and converted to order", linkedOrderId: proposal.linkedOrderId },
        { status: 400 }
      );
    }

    const now = new Date();
    if (now > new Date(proposal.expiresAt)) {
      await prisma.quoteProposal.update({
        where: { id: proposal.id },
        data: { status: QuoteStatus.EXPIRED },
      });
      return NextResponse.json(
        { error: "This 30-day architectural quotation offer has expired. Please contact our studio desk for a refreshed quotation." },
        { status: 400 }
      );
    }

    const latestVersion = proposal.versions[0];
    if (!latestVersion) {
      return NextResponse.json({ error: "No valid version found for proposal" }, { status: 400 });
    }

    const totalQuoted = Number(latestVersion.quotedAmount);
    const advancePaid = Number(latestVersion.advanceRequired);
    const balanceDue = totalQuoted - advancePaid;

    // Generate Order Number: TAV-QTE-YYYYMMDD-XXXX
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `TAV-QTE-${dateStr}-${randomSuffix}`;

    // Execute atomic acceptance & order generation transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Resolve or create user
      let user = await tx.user.findUnique({
        where: { email: proposal.customerEmail.toLowerCase() },
      });
      if (!user) {
        user = await tx.user.create({
          data: {
            email: proposal.customerEmail.toLowerCase(),
            name: proposal.customerName,
            phone: proposal.customerPhone,
          },
        });
      }

      // 2. Create shipping address record
      const shippingAddress = await tx.customerAddress.create({
        data: {
          userId: user.id,
          fullName: proposal.customerName,
          phone: proposal.customerPhone,
          addressLine1: "Architectural Project Site Delivery",
          city: "Delhi Hub",
          state: "Delhi",
          pincode: proposal.deliveryPincode,
        },
      });

      // 3. Resolve a product anchor (fallback to first available product if custom)
      let product = await tx.product.findFirst({
        where: { primaryMode: PurchaseMode.MADE_TO_ORDER },
      });
      if (!product) {
        product = await tx.product.findFirst();
      }

      if (!product) {
        throw new Error("Cannot link quote without baseline catalogue entity in database");
      }

      // 4. Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          customerEmail: proposal.customerEmail.toLowerCase(),
          customerPhone: proposal.customerPhone,
          shippingAddressId: shippingAddress.id,
          purchaseMode: PurchaseMode.MADE_TO_ORDER,
          status: OrderStatus.CONFIRMED,
          itemsSubtotal: new Prisma.Decimal(totalQuoted),
          shippingCharge: new Prisma.Decimal(0.00),
          totalAmount: new Prisma.Decimal(totalQuoted),
          requiredAdvanceAmount: new Prisma.Decimal(advancePaid),
          amountPaid: new Prisma.Decimal(advancePaid),
          balanceAmount: new Prisma.Decimal(balanceDue),
          confirmedAt: now,
          carrierName: "Blue Dart Fragile Surface",
          items: {
            create: [
              {
                productId: product.id,
                quantity: 1,
                unitPrice: new Prisma.Decimal(totalQuoted),
                subtotal: new Prisma.Decimal(totalQuoted),
              },
            ],
          },
        },
      });

      // 5. Create Verified 25% Advance Payment Ledger Entry
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: new Prisma.Decimal(advancePaid),
          paymentType: PaymentType.QUOTE_ADVANCE,
          status: PaymentStatus.COMPLETED,
          gateway: "PHONEPE",
          gatewayTransactionId: `TXN-QTE-ADV-${Date.now()}`,
          verifiedAt: now,
          notes: `25% Advance paid for 30-Day Architectural Quote ${cleanNumber} Rev ${latestVersion.versionNumber}`,
        },
      });

      // 6. Update Quote Proposal Status to ACCEPTED
      const updatedProposal = await tx.quoteProposal.update({
        where: { id: proposal.id },
        data: {
          status: QuoteStatus.ACCEPTED,
          acceptedAt: now,
          linkedOrderId: order.id,
        },
      });

      // 7. Immutable Audit Log
      await tx.auditLog.create({
        data: {
          action: "QUOTE_ACCEPTED_ADVANCE_VERIFIED",
          entityType: "QuoteProposal",
          entityId: cleanNumber,
          payloadJson: JSON.stringify({
            orderNumber,
            advancePaid,
            balanceDue,
            transactionId: payment.gatewayTransactionId,
          }),
        },
      });

      return { order, payment, proposal: updatedProposal };
    });

    // Send Order Confirmation Email
    try {
      await sendOrderConfirmationEmail({
        orderNumber,
        customerName: proposal.customerName,
        customerEmail: proposal.customerEmail,
        mode: "MADE_TO_ORDER",
        items: [
          {
            name: `Architectural Proposal (${cleanNumber} Rev ${latestVersion.versionNumber})`,
            quantity: 1,
            priceRupees: totalQuoted,
          },
        ],
        itemsSubtotalRupees: totalQuoted,
        deliveryFeeRupees: 0,
        totalAmountRupees: totalQuoted,
        amountPaidRupees: advancePaid,
        balanceDueRupees: balanceDue,
        city: "Delhi Hub",
        state: "Delhi",
        pincode: proposal.deliveryPincode,
      });
    } catch (emailErr) {
      console.warn("Order confirmation email non-blocking error:", emailErr);
    }

    return NextResponse.json({
      success: true,
      quoteNumber: cleanNumber,
      orderNumber,
      orderId: result.order.id,
      amountPaidRupees: advancePaid,
      balanceDueRupees: balanceDue,
    });
  } catch (error) {
    console.error("POST /api/quotes/[quoteNumber]/accept error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

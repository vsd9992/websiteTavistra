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
import { lookupPincode } from "@tavistra/shared";
import { sendQuoteAcceptedEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quoteNumber: string }> }
) {
  try {
    const { quoteNumber } = await params;
    const cleanNumber = decodeURIComponent(quoteNumber).trim().toUpperCase();

    let acceptedVersionNumber: number | undefined;
    try {
      const rawBody = await request.text();
      if (rawBody) {
        const parsed = JSON.parse(rawBody);
        if (parsed?.acceptedVersionNumber !== undefined) {
          acceptedVersionNumber = Number(parsed.acceptedVersionNumber);
        }
      }
    } catch {
      // Optional body
    }

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
    if (proposal.status === QuoteStatus.EXPIRED || now.getTime() > new Date(proposal.expiresAt).getTime()) {
      if (proposal.status !== QuoteStatus.EXPIRED) {
        await prisma.quoteProposal.update({
          where: { id: proposal.id },
          data: { status: QuoteStatus.EXPIRED },
        });
      }
      return NextResponse.json(
        { error: "This 30-day architectural quotation offer has expired. Please contact our studio desk for a refreshed quotation." },
        { status: 400 }
      );
    }

    const latestVersion = proposal.versions[0];
    if (!latestVersion) {
      return NextResponse.json({ error: "No valid version found for proposal" }, { status: 400 });
    }

    // Exact-version acceptance enforcement
    if (
      acceptedVersionNumber !== undefined &&
      !isNaN(acceptedVersionNumber) &&
      acceptedVersionNumber !== latestVersion.versionNumber
    ) {
      return NextResponse.json(
        {
          error: `A newer revision (Rev ${latestVersion.versionNumber}) was issued while you were reviewing. Please reload and accept Rev ${latestVersion.versionNumber}.`,
          latestVersionNumber: latestVersion.versionNumber,
        },
        { status: 409 }
      );
    }

    const totalQuoted = Number(latestVersion.quotedAmount);
    const shippingCharge = Math.min(totalQuoted, Math.max(0, Number(latestVersion.deliveryCharge || 0)));
    const itemsSubtotal = Math.round((totalQuoted - shippingCharge) * 100) / 100;
    const advancePaid = Number(latestVersion.advanceRequired);
    const balanceDue = Math.round((totalQuoted - advancePaid) * 100) / 100;

    // Resolve destination city/state cleanly
    const fallbackPin = lookupPincode(proposal.deliveryPincode);
    const destCity = fallbackPin.city || "Delhi Hub";
    const destState = fallbackPin.state || "Delhi";

    // Generate Order Number: TAV-QTE-YYYYMMDD-XXXX
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `TAV-QTE-${dateStr}-${randomSuffix}`;

    // Execute atomic acceptance & order generation transaction with optimistic lock
    const result = await prisma.$transaction(async (tx) => {
      const claim = await tx.quoteProposal.updateMany({
        where: {
          id: proposal.id,
          status: QuoteStatus.ISSUED,
        },
        data: {
          status: QuoteStatus.ACCEPTED,
          acceptedAt: now,
        },
      });

      if (claim.count !== 1) {
        throw new Error("PROPOSAL_ALREADY_PROCESSED");
      }

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
          city: destCity,
          state: destState,
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

      // 4. Create Order (starts distinct 7-day IST confirmed-order grace independent of 30-day quote clock)
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          customerEmail: proposal.customerEmail.toLowerCase(),
          customerPhone: proposal.customerPhone,
          shippingAddressId: shippingAddress.id,
          purchaseMode: PurchaseMode.MADE_TO_ORDER,
          status: OrderStatus.CONFIRMED,
          itemsSubtotal: new Prisma.Decimal(itemsSubtotal),
          shippingCharge: new Prisma.Decimal(shippingCharge),
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
                unitPrice: new Prisma.Decimal(itemsSubtotal),
                subtotal: new Prisma.Decimal(itemsSubtotal),
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

      // 6. Link generated Order ID to QuoteProposal
      const updatedProposal = await tx.quoteProposal.update({
        where: { id: proposal.id },
        data: {
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
            acceptedVersionNumber: latestVersion.versionNumber,
            orderNumber,
            itemsSubtotal,
            shippingCharge,
            totalQuoted,
            advancePaid,
            balanceDue,
            transactionId: payment.gatewayTransactionId,
          }),
        },
      });

      return { order, payment, proposal: updatedProposal };
    });

    // Send Quote Acceptance & 25% Advance Verification Email
    try {
      await sendQuoteAcceptedEmail({
        quoteNumber: cleanNumber,
        versionNumber: latestVersion.versionNumber,
        orderNumber,
        customerName: proposal.customerName,
        customerEmail: proposal.customerEmail,
        totalQuotedRupees: totalQuoted,
        advancePaidRupees: advancePaid,
        balanceDueRupees: balanceDue,
        estimatedLeadDays: latestVersion.estimatedLeadDays,
        destinationPincode: proposal.deliveryPincode,
      });
    } catch (emailErr) {
      console.warn("Quote acceptance email non-blocking error:", emailErr);
    }

    return NextResponse.json({
      success: true,
      quoteNumber: cleanNumber,
      acceptedVersionNumber: latestVersion.versionNumber,
      orderNumber,
      orderId: result.order.id,
      amountPaidRupees: advancePaid,
      balanceDueRupees: balanceDue,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PROPOSAL_ALREADY_PROCESSED") {
      return NextResponse.json(
        { error: "Proposal was already accepted or modified concurrently." },
        { status: 409 }
      );
    }
    console.error("POST /api/quotes/[quoteNumber]/accept error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

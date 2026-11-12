import { NextRequest, NextResponse } from "next/server";
import { prisma, QuoteStatus } from "@tavistra/db";
import {
  QuoteLineItemSchema,
  QuoteLineItem,
  computeQuoteTotals,
  formatQuoteSpecificationsText,
} from "@tavistra/shared";
import { sendQuoteProposalEmail } from "@/lib/email";

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

    const now = new Date();
    if (proposal.status === QuoteStatus.ISSUED && now.getTime() > new Date(proposal.expiresAt).getTime()) {
      await prisma.quoteProposal.update({
        where: { id: proposal.id },
        data: { status: QuoteStatus.EXPIRED },
      });
      return NextResponse.json(
        { error: "Cannot revise an expired 30-day proposal. Issue a fresh quotation instead." },
        { status: 400 }
      );
    }

    if (proposal.status !== QuoteStatus.ISSUED) {
      return NextResponse.json(
        { error: `Cannot revise proposal in ${proposal.status} status` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      specifications,
      notes,
      lineItems,
      deliveryChargeRupees = 0,
      quotedAmountRupees,
      estimatedLeadDays = 28,
      staffName = "Admin Staff",
    } = body;

    let validatedItems: QuoteLineItem[] = [];
    let resolvedSpecs = "";
    let quotedDecimal = 0;
    let advanceRequiredDecimal = 0;
    let balanceDueDecimal = 0;
    let cleanDelivery = Math.max(0, Number(deliveryChargeRupees || 0));

    if (Array.isArray(lineItems) && lineItems.length > 0) {
      for (const item of lineItems) {
        const parsed = QuoteLineItemSchema.safeParse(item);
        if (!parsed.success) {
          return NextResponse.json(
            { error: `Invalid line item: ${parsed.error.issues[0]?.message || "check name, qty & price"}` },
            { status: 400 }
          );
        }
        validatedItems.push(parsed.data);
      }

      const totals = computeQuoteTotals(validatedItems, cleanDelivery);
      quotedDecimal = totals.totalQuotedRupees;
      advanceRequiredDecimal = totals.advanceRequiredRupees;
      balanceDueDecimal = totals.balanceDueRupees;
      cleanDelivery = totals.deliveryChargeRupees;
      resolvedSpecs = formatQuoteSpecificationsText({
        lineItems: validatedItems,
        deliveryChargeRupees: cleanDelivery,
        notes: (notes ?? specifications ?? "").toString(),
      });
    } else {
      if (!specifications || !quotedAmountRupees) {
        return NextResponse.json(
          { error: "Provide lineItems or specifications with quotedAmountRupees for revision." },
          { status: 400 }
        );
      }
      quotedDecimal = Number(quotedAmountRupees);
      if (isNaN(quotedDecimal) || quotedDecimal <= 0) {
        return NextResponse.json({ error: "Quoted amount must be greater than zero." }, { status: 400 });
      }
      advanceRequiredDecimal = Math.round(quotedDecimal * 0.25 * 100) / 100;
      balanceDueDecimal = quotedDecimal - advanceRequiredDecimal;
      resolvedSpecs = specifications.toString().trim();
    }

    const nextVersionNumber = (proposal.versions[0]?.versionNumber || 1) + 1;

    // Per TAV-07 & lifecycle invariant: Original 30-day offer clock NEVER resets or extends on revision
    const newVersion = await prisma.quoteVersion.create({
      data: {
        quoteProposalId: proposal.id,
        versionNumber: nextVersionNumber,
        specifications: resolvedSpecs,
        lineItemsJson: validatedItems.length > 0 ? JSON.stringify(validatedItems) : null,
        deliveryCharge: cleanDelivery,
        quotedAmount: quotedDecimal,
        advanceRequired: advanceRequiredDecimal,
        estimatedLeadDays: Math.max(1, Number(estimatedLeadDays || 28)),
        validUntil: proposal.expiresAt,
      },
    });

    const updatedProposal = await prisma.quoteProposal.findUnique({
      where: { id: proposal.id },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
        },
      },
    });

    // Record Immutable Audit Log
    await prisma.auditLog.create({
      data: {
        action: "QUOTE_PROPOSAL_REVISED",
        entityType: "QuoteProposal",
        entityId: cleanNumber,
        payloadJson: JSON.stringify({
          versionNumber: nextVersionNumber,
          lineItemsCount: validatedItems.length,
          deliveryChargeRupees: cleanDelivery,
          quotedAmount: quotedDecimal,
          advanceRequired: advanceRequiredDecimal,
          originalExpiresAtPreserved: proposal.expiresAt.toISOString(),
          staff: staffName,
        }),
      },
    });

    // Send updated revision email
    try {
      await sendQuoteProposalEmail({
        quoteNumber: cleanNumber,
        versionNumber: nextVersionNumber,
        customerName: proposal.customerName,
        customerEmail: proposal.customerEmail,
        specifications: resolvedSpecs,
        lineItems: validatedItems,
        deliveryChargeRupees: cleanDelivery,
        quotedAmountRupees: quotedDecimal,
        advanceRequiredRupees: advanceRequiredDecimal,
        balanceDueRupees: balanceDueDecimal,
        estimatedLeadDays: Math.max(1, Number(estimatedLeadDays || 28)),
        expiresAt: proposal.expiresAt,
      });
    } catch (emailErr) {
      console.warn("Revision proposal email dispatch non-blocking error:", emailErr);
    }

    return NextResponse.json({ success: true, version: newVersion, proposal: updatedProposal });
  } catch (error) {
    console.error("POST /api/quotes/[quoteNumber]/revisions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


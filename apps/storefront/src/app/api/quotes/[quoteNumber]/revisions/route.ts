import { NextRequest, NextResponse } from "next/server";
import { prisma, QuoteStatus } from "@tavistra/db";
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

    if (proposal.status !== QuoteStatus.ISSUED) {
      return NextResponse.json(
        { error: `Cannot revise proposal in ${proposal.status} status` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      specifications,
      quotedAmountRupees,
      estimatedLeadDays = 28,
      staffName = "Admin Staff",
    } = body;

    if (!specifications || !quotedAmountRupees) {
      return NextResponse.json(
        { error: "specifications and quotedAmountRupees are required for revision" },
        { status: 400 }
      );
    }

    const nextVersionNumber = (proposal.versions[0]?.versionNumber || 1) + 1;
    const quotedDecimal = Number(quotedAmountRupees);
    const advanceRequiredDecimal = Math.round(quotedDecimal * 0.25 * 100) / 100;
    const balanceDueDecimal = quotedDecimal - advanceRequiredDecimal;

    // Per TAV-07: Original 30-day offer clock does not reset on revision
    const newVersion = await prisma.quoteVersion.create({
      data: {
        quoteProposalId: proposal.id,
        versionNumber: nextVersionNumber,
        specifications: specifications.trim(),
        quotedAmount: quotedDecimal,
        advanceRequired: advanceRequiredDecimal,
        estimatedLeadDays: Number(estimatedLeadDays),
        validUntil: proposal.expiresAt,
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
          quotedAmount: quotedDecimal,
          advanceRequired: advanceRequiredDecimal,
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
        specifications,
        quotedAmountRupees: quotedDecimal,
        advanceRequiredRupees: advanceRequiredDecimal,
        balanceDueRupees: balanceDueDecimal,
        estimatedLeadDays: Number(estimatedLeadDays),
        expiresAt: proposal.expiresAt,
      });
    } catch (emailErr) {
      console.warn("Revision proposal email dispatch non-blocking error:", emailErr);
    }

    return NextResponse.json({ success: true, version: newVersion });
  } catch (error) {
    console.error("POST /api/quotes/[quoteNumber]/revisions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


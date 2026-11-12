import { NextRequest, NextResponse } from "next/server";
import { prisma, QuoteStatus } from "@tavistra/db";
import { getQuoteExpiryStatus, parseQuoteLineItems } from "@tavistra/shared";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quoteNumber: string }> }
) {
  try {
    const { quoteNumber } = await params;
    const cleanNumber = decodeURIComponent(quoteNumber).trim().toUpperCase();

    let proposal = await prisma.quoteProposal.findUnique({
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

    // Check 30-day IST offer expiration
    const now = new Date();
    if (proposal.status === QuoteStatus.ISSUED && now.getTime() > new Date(proposal.expiresAt).getTime()) {
      proposal = await prisma.quoteProposal.update({
        where: { id: proposal.id },
        data: { status: QuoteStatus.EXPIRED },
        include: {
          versions: {
            orderBy: { versionNumber: "desc" },
          },
        },
      });
      await prisma.auditLog
        .create({
          data: {
            action: "QUOTE_PROPOSAL_EXPIRED",
            entityType: "QuoteProposal",
            entityId: cleanNumber,
            payloadJson: JSON.stringify({ expiresAt: proposal.expiresAt }),
          },
        })
        .catch(() => {});
    }

    const latestVersion = proposal.versions[0] || null;
    const expiryStatus = getQuoteExpiryStatus(proposal.expiresAt, proposal.status, now);

    let linkedOrderNumber: string | null = null;
    if (proposal.linkedOrderId) {
      const orderRow = await prisma.order.findUnique({
        where: { id: proposal.linkedOrderId },
        select: { orderNumber: true },
      });
      linkedOrderNumber = orderRow?.orderNumber || null;
    }

    return NextResponse.json(
      {
        proposal,
        latestVersion,
        lineItems: parseQuoteLineItems(latestVersion?.lineItemsJson),
        deliveryChargeRupees: latestVersion ? Number(latestVersion.deliveryCharge || 0) : 0,
        linkedOrderNumber,
        daysRemaining: expiryStatus.daysRemaining,
        expiresToday: expiryStatus.expiresToday,
        isExpired: expiryStatus.isExpired,
        isAccepted: expiryStatus.isAccepted,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/quotes/[quoteNumber] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


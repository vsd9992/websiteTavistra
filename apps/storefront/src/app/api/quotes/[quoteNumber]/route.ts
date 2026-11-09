import { NextRequest, NextResponse } from "next/server";
import { prisma, QuoteStatus } from "@tavistra/db";

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

    // Check 30-day offer expiration
    const now = new Date();
    if (proposal.status === QuoteStatus.ISSUED && now > new Date(proposal.expiresAt)) {
      proposal = await prisma.quoteProposal.update({
        where: { id: proposal.id },
        data: { status: QuoteStatus.EXPIRED },
        include: {
          versions: {
            orderBy: { versionNumber: "desc" },
          },
        },
      });
    }

    const latestVersion = proposal.versions[0];
    const msRemaining = new Date(proposal.expiresAt).getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

    return NextResponse.json({
      proposal,
      latestVersion,
      daysRemaining,
      isExpired: proposal.status === QuoteStatus.EXPIRED || daysRemaining === 0,
      isAccepted: proposal.status === QuoteStatus.ACCEPTED,
    });
  } catch (error) {
    console.error("GET /api/quotes/[quoteNumber] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


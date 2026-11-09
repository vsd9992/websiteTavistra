import { NextRequest, NextResponse } from "next/server";
import { prisma, QuoteStatus } from "@tavistra/db";
import { sendQuoteProposalEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email");

    const whereClause: { customerEmail?: string } = {};
    if (email) {
      whereClause.customerEmail = email.toLowerCase().trim();
    }

    const proposals = await prisma.quoteProposal.findMany({
      where: whereClause,
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Check expiration on read
    const now = new Date();
    const checkedProposals = await Promise.all(
      proposals.map(async (p) => {
        if (p.status === QuoteStatus.ISSUED && now > new Date(p.expiresAt)) {
          const updated = await prisma.quoteProposal.update({
            where: { id: p.id },
            data: { status: QuoteStatus.EXPIRED },
            include: { versions: true },
          });
          return updated;
        }
        return p;
      })
    );

    return NextResponse.json({ proposals: checkedProposals });
  } catch (error) {
    console.error("GET /api/quotes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryPincode,
      projectSpecifications,
      quotedAmountRupees,
      estimatedLeadDays = 28,
      inquiryId,
      staffName = "Admin Staff",
    } = body;

    if (!customerName || !customerEmail || !quotedAmountRupees || !projectSpecifications) {
      return NextResponse.json(
        { error: "Missing required proposal fields (name, email, quotedAmount, specifications)" },
        { status: 400 }
      );
    }

    // Generate authoritative quote reference: QTE-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const quoteNumber = `QTE-${dateStr}-${randomSuffix}`;

    // 30-day locked offer clock from issuance date
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const quotedDecimal = Number(quotedAmountRupees);
    const advanceRequiredDecimal = Math.round(quotedDecimal * 0.25 * 100) / 100;
    const balanceDueDecimal = quotedDecimal - advanceRequiredDecimal;

    const proposal = await prisma.quoteProposal.create({
      data: {
        quoteNumber,
        customerName: customerName.trim(),
        customerEmail: customerEmail.toLowerCase().trim(),
        customerPhone: (customerPhone || "N/A").trim(),
        deliveryPincode: (deliveryPincode || "110001").trim(),
        projectSpecifications: projectSpecifications.trim(),
        status: QuoteStatus.ISSUED,
        expiresAt,
        versions: {
          create: {
            versionNumber: 1,
            specifications: projectSpecifications.trim(),
            quotedAmount: quotedDecimal,
            advanceRequired: advanceRequiredDecimal,
            estimatedLeadDays: Number(estimatedLeadDays),
            validUntil: expiresAt,
          },
        },
      },
      include: {
        versions: true,
      },
    });

    // If originated from a commercial bulk inquiry, mark inquiry as QUOTE_ISSUED
    if (inquiryId) {
      await prisma.bulkInquiry.update({
        where: { id: inquiryId },
        data: { status: "QUOTE_ISSUED" },
      }).catch((err) => console.warn("Failed to update inquiry status:", err));
    }

    // Record Immutable Audit Log
    await prisma.auditLog.create({
      data: {
        action: "QUOTE_PROPOSAL_ISSUED",
        entityType: "QuoteProposal",
        entityId: quoteNumber,
        payloadJson: JSON.stringify({
          quotedAmount: quotedDecimal,
          advanceRequired: advanceRequiredDecimal,
          expiresAt: expiresAt.toISOString(),
          customerEmail,
          staff: staffName,
        }),
      },
    });

    // Send Formal Proposal Email via Mailpit / SMTP
    try {
      await sendQuoteProposalEmail({
        quoteNumber,
        versionNumber: 1,
        customerName,
        customerEmail,
        specifications: projectSpecifications,
        quotedAmountRupees: quotedDecimal,
        advanceRequiredRupees: advanceRequiredDecimal,
        balanceDueRupees: balanceDueDecimal,
        estimatedLeadDays: Number(estimatedLeadDays),
        expiresAt,
      });
    } catch (emailErr) {
      console.warn("Proposal notification email dispatch non-blocking error:", emailErr);
    }

    return NextResponse.json({ success: true, proposal }, { status: 201 });
  } catch (error) {
    console.error("POST /api/quotes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


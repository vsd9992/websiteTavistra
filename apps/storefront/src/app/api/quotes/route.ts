import { NextRequest, NextResponse } from "next/server";
import { prisma, QuoteStatus } from "@tavistra/db";
import {
  QuoteLineItemSchema,
  QuoteLineItem,
  computeQuoteTotals,
  formatQuoteSpecificationsText,
  computeIstQuoteExpiry,
  validateEmail,
} from "@tavistra/shared";
import { sendQuoteProposalEmail } from "@/lib/email";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email");

    const whereClause: { customerEmail?: string } = {};
    if (email) {
      const sessionUser = await getAuthenticatedUser(request);
      if (!sessionUser || sessionUser.email.toLowerCase() !== email.toLowerCase().trim()) {
        return NextResponse.json(
          { error: "Authentication required to view customer proposals." },
          { status: 401 }
        );
      }
      whereClause.customerEmail = sessionUser.email.toLowerCase();
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
            include: {
              versions: {
                orderBy: { versionNumber: "desc" },
              },
            },
          });
          return updated;
        }
        return p;
      })
    );

    return NextResponse.json(
      { proposals: checkedProposals },
      { headers: { "Cache-Control": "no-store" } }
    );
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
      notes,
      lineItems,
      deliveryChargeRupees = 0,
      quotedAmountRupees,
      estimatedLeadDays = 28,
      inquiryId,
      staffName = "Admin Staff",
    } = body;

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { error: "Client name and email are required to issue a proposal." },
        { status: 400 }
      );
    }

    const emailVal = validateEmail(customerEmail);
    if (!emailVal.isValid) {
      return NextResponse.json({ error: emailVal.error || "Invalid client email address." }, { status: 400 });
    }

    const cleanPin = (deliveryPincode || "110001").toString().trim().replace(/\D/g, "");
    if (cleanPin.length !== 6) {
      return NextResponse.json({ error: "Valid 6-digit destination PIN code is required." }, { status: 400 });
    }

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
        notes: (notes ?? projectSpecifications ?? "").toString(),
      });
    } else {
      if (!quotedAmountRupees || !projectSpecifications) {
        return NextResponse.json(
          { error: "Provide at least one bespoke line item or specifications with quotedAmountRupees." },
          { status: 400 }
        );
      }
      quotedDecimal = Number(quotedAmountRupees);
      if (isNaN(quotedDecimal) || quotedDecimal <= 0) {
        return NextResponse.json({ error: "Quoted amount must be greater than zero." }, { status: 400 });
      }
      advanceRequiredDecimal = Math.round(quotedDecimal * 0.25 * 100) / 100;
      balanceDueDecimal = quotedDecimal - advanceRequiredDecimal;
      resolvedSpecs = projectSpecifications.toString().trim();
    }

    // Generate authoritative quote reference: QTE-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    let quoteNumber = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const candidate = `QTE-${dateStr}-${randomSuffix}`;
      const exists = await prisma.quoteProposal.findUnique({ where: { quoteNumber: candidate } });
      if (!exists) {
        quoteNumber = candidate;
        break;
      }
    }
    if (!quoteNumber) {
      quoteNumber = `QTE-${dateStr}-${Date.now().toString().slice(-4)}`;
    }

    // 30-day locked offer clock from issuance date (through 23:59:59.999 IST on Day 30)
    const now = new Date();
    const expiresAt = computeIstQuoteExpiry(now);

    const normalizedEmail = emailVal.normalizedEmail || customerEmail.toLowerCase().trim();

    const proposal = await prisma.quoteProposal.create({
      data: {
        quoteNumber,
        inquiryId: inquiryId || null,
        customerName: customerName.trim(),
        customerEmail: normalizedEmail,
        customerPhone: (customerPhone || "N/A").toString().trim(),
        deliveryPincode: cleanPin,
        projectSpecifications: resolvedSpecs,
        status: QuoteStatus.ISSUED,
        expiresAt,
        versions: {
          create: {
            versionNumber: 1,
            specifications: resolvedSpecs,
            lineItemsJson: validatedItems.length > 0 ? JSON.stringify(validatedItems) : null,
            deliveryCharge: cleanDelivery,
            quotedAmount: quotedDecimal,
            advanceRequired: advanceRequiredDecimal,
            estimatedLeadDays: Math.max(1, Number(estimatedLeadDays || 28)),
            validUntil: expiresAt,
          },
        },
      },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
        },
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
          versionNumber: 1,
          lineItemsCount: validatedItems.length,
          deliveryChargeRupees: cleanDelivery,
          quotedAmount: quotedDecimal,
          advanceRequired: advanceRequiredDecimal,
          expiresAt: expiresAt.toISOString(),
          customerEmail: normalizedEmail,
          staff: staffName,
        }),
      },
    });

    // Send Formal Proposal Email via Mailpit / SMTP
    try {
      await sendQuoteProposalEmail({
        quoteNumber,
        versionNumber: 1,
        customerName: customerName.trim(),
        customerEmail: normalizedEmail,
        specifications: resolvedSpecs,
        lineItems: validatedItems,
        deliveryChargeRupees: cleanDelivery,
        quotedAmountRupees: quotedDecimal,
        advanceRequiredRupees: advanceRequiredDecimal,
        balanceDueRupees: balanceDueDecimal,
        estimatedLeadDays: Math.max(1, Number(estimatedLeadDays || 28)),
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


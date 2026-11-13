import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { validateEmail, validateIndianMobile, lookupPincode, parseInquiryLineItems, type QuoteLineItem } from "@tavistra/shared";
import { sendBulkInquiryAckEmail } from "@/lib/email";

export async function GET() {
  try {
    const inquiries = await prisma.bulkInquiry.findMany({
      orderBy: { createdAt: "desc" },
    });

    const inquiryIds = inquiries.map((i) => i.id);
    const proposals = await prisma.quoteProposal.findMany({
      where: { inquiryId: { in: inquiryIds } },
      select: {
        id: true,
        inquiryId: true,
        quoteNumber: true,
        status: true,
        linkedOrderId: true,
      },
    });

    const linkedOrderIds = proposals
      .map((p) => p.linkedOrderId)
      .filter((id): id is string => Boolean(id));

    const orders =
      linkedOrderIds.length > 0
        ? await prisma.order.findMany({
            where: { id: { in: linkedOrderIds } },
            select: {
              id: true,
              orderNumber: true,
              status: true,
              totalAmount: true,
              amountPaid: true,
              cancelledAt: true,
            },
          })
        : [];

    const proposalByInquiryId = new Map(proposals.map((p) => [p.inquiryId!, p]));
    const orderById = new Map(orders.map((o) => [o.id, o]));

    return NextResponse.json({
      inquiries: inquiries.map((inq) => {
        const quote = proposalByInquiryId.get(inq.id);
        const order = quote?.linkedOrderId ? orderById.get(quote.linkedOrderId) : null;
        let dynamicStatus = inq.status;
        if (order?.status === "CANCELLED" || order?.status === "REFUNDED") {
          dynamicStatus = "ORDER_CANCELLED";
        } else if (order) {
          dynamicStatus = "ORDER_CONFIRMED";
        } else if (quote) {
          dynamicStatus = "QUOTE_ISSUED";
        }

        return {
          id: inq.id,
          inquiryNumber: inq.inquiryNumber,
          clientName: inq.clientName,
          practiceOrStudio: inq.practiceOrStudio || undefined,
          email: inq.email,
          phone: inq.phone,
          destinationCity: inq.destinationCity,
          destinationPincode: inq.destinationPincode,
          requestedEditions: inq.requestedEditions,
          quantityUnits: inq.quantityUnits,
          specifications: inq.specifications,
          lineItemsJson: inq.lineItemsJson,
          lineItems: parseInquiryLineItems(inq.lineItemsJson, inq.specifications),
          status: dynamicStatus,
          quoteNumber: quote?.quoteNumber || null,
          quoteStatus: quote?.status || null,
          orderNumber: order?.orderNumber || null,
          orderStatus: order?.status || null,
          orderId: order?.id || null,
          submittedAt: inq.createdAt.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        };
      }),
    });
  } catch (error) {
    console.error("GET /api/inquiries error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      practiceOrStudio,
      email,
      phone,
      city,
      pincode,
      productName,
      quantity,
      message,
      lineItems,
      lineItemsJson: rawLineItemsJson,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Client legal name is required." }, { status: 400 });
    }

    const emailVal = validateEmail(email || "");
    if (!emailVal.isValid) {
      return NextResponse.json({ error: emailVal.error || "Valid business email required." }, { status: 400 });
    }

    const phoneVal = validateIndianMobile(phone || "");
    if (!phoneVal.isValid) {
      return NextResponse.json({ error: phoneVal.error || "Valid 10-digit Indian mobile number required." }, { status: 400 });
    }

    const cleanPincode = (pincode || "").toString().trim().replace(/\D/g, "");
    const pinLookup = cleanPincode.length === 6 ? lookupPincode(cleanPincode) : null;
    const resolvedCity = (city || "").trim() || (pinLookup?.city ? `${pinLookup.city}, ${pinLookup.state}` : "Delhi Hub");
    const resolvedPincode = cleanPincode.length === 6 ? cleanPincode : "110001";

    const currentYear = new Date().getFullYear();
    const count = await prisma.bulkInquiry.count();
    const inquiryNumber = `INQ-${currentYear}-${(count + 801).toString().padStart(4, "0")}`;

    const parsedQty = quantity ? Math.max(1, parseInt(quantity, 10)) : 10;
    const resolvedEditions = (productName || "Architectural Bulk Proposal").trim();
    const resolvedSpecs = (message || "Direct bulk inquiry submission.").trim();

    // Resolve structured line items from either payload array, lineItemsJson, or specifications text
    let resolvedLineItems: QuoteLineItem[] = [];
    if (Array.isArray(lineItems) && lineItems.length > 0) {
      resolvedLineItems = lineItems
        .filter((item: any) => item && typeof item.name === "string" && item.name.trim())
        .map((item: any) => ({
          name: String(item.name).trim(),
          finish: item.finish ? String(item.finish).trim() : "Studio Standard Finish",
          quantity: Math.max(1, Number(item.quantity) || 1),
          unitPriceRupees: Math.max(0, Number(item.unitPriceRupees) || 0),
        }));
    } else {
      resolvedLineItems = parseInquiryLineItems(rawLineItemsJson, resolvedSpecs);
    }
    const finalLineItemsJson = resolvedLineItems.length > 0 ? JSON.stringify(resolvedLineItems) : null;

    const normalizedEmail = emailVal.normalizedEmail || email.toLowerCase().trim();
    const normalizedPhone = phoneVal.normalizedPhone || phone.trim();

    const inquiry = await prisma.bulkInquiry.create({
      data: {
        inquiryNumber,
        clientName: name.trim(),
        practiceOrStudio: practiceOrStudio?.trim() || null,
        email: normalizedEmail,
        phone: normalizedPhone,
        destinationCity: resolvedCity,
        destinationPincode: resolvedPincode,
        requestedEditions: resolvedEditions,
        quantityUnits: parsedQty,
        specifications: resolvedSpecs,
        lineItemsJson: finalLineItemsJson,
        status: "NEW",
      },
    });

    // Record Immutable Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: "BULK_INQUIRY_REGISTERED",
          entityType: "BulkInquiry",
          entityId: inquiry.inquiryNumber,
          payloadJson: JSON.stringify({
            clientName: inquiry.clientName,
            email: inquiry.email,
            phone: inquiry.phone,
            requestedEditions: inquiry.requestedEditions,
            quantityUnits: inquiry.quantityUnits,
            destinationPincode: inquiry.destinationPincode,
          }),
        },
      });
    } catch (auditErr) {
      console.warn("Audit log creation non-blocking warning:", auditErr);
    }

    // Send Mailpit acknowledgement notification
    try {
      await sendBulkInquiryAckEmail({
        inquiryNumber: inquiry.inquiryNumber,
        clientName: inquiry.clientName,
        email: inquiry.email,
        requestedEditions: inquiry.requestedEditions,
        quantityUnits: inquiry.quantityUnits,
        destinationCity: inquiry.destinationCity,
        destinationPincode: inquiry.destinationPincode,
      });
    } catch (mailErr) {
      console.warn("Bulk inquiry email acknowledgement non-blocking error:", mailErr);
    }

    return NextResponse.json({
      success: true,
      inquiryNumber: inquiry.inquiryNumber,
      inquiry: {
        id: inquiry.id,
        inquiryNumber: inquiry.inquiryNumber,
        clientName: inquiry.clientName,
        email: inquiry.email,
        phone: inquiry.phone,
        destinationCity: inquiry.destinationCity,
        destinationPincode: inquiry.destinationPincode,
        requestedEditions: inquiry.requestedEditions,
        quantityUnits: inquiry.quantityUnits,
        specifications: inquiry.specifications,
        lineItemsJson: inquiry.lineItemsJson,
        lineItems: parseInquiryLineItems(inquiry.lineItemsJson, inquiry.specifications),
        status: inquiry.status,
      },
      message: "Your inquiry has been registered with our studio commercial desk.",
    });
  } catch (error) {
    console.error("POST /api/inquiries error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    const updated = await prisma.bulkInquiry.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (error) {
    console.error("PATCH /api/inquiries error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


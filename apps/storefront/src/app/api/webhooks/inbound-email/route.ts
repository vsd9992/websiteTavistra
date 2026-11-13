import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { sendTicketEmail, sendBulkInquiryAckEmail } from "@/lib/email";
import { validateEmail } from "@tavistra/shared";

/**
 * Sequential ticket number generator (TCK-YYYY-NNNN).
 */
async function generateNextTicketNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `TCK-${currentYear}-`;

  const latest = await prisma.supportTicket.findFirst({
    where: { ticketNumber: { startsWith: prefix } },
    orderBy: { ticketNumber: "desc" },
    select: { ticketNumber: true },
  });

  let nextSequence = 1001;
  if (latest && latest.ticketNumber) {
    const parts = latest.ticketNumber.split("-");
    const num = parseInt(parts[2], 10);
    if (!isNaN(num)) {
      nextSequence = num + 1;
    }
  }

  return `${prefix}${String(nextSequence).padStart(4, "0")}`;
}

/**
 * Sequential inquiry number generator (INQ-YYYY-NNNN).
 */
async function generateNextInquiryNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `INQ-${currentYear}-`;

  const latest = await prisma.bulkInquiry.findFirst({
    where: { inquiryNumber: { startsWith: prefix } },
    orderBy: { inquiryNumber: "desc" },
    select: { inquiryNumber: true },
  });

  let nextSequence = 1001;
  if (latest && latest.inquiryNumber) {
    const parts = latest.inquiryNumber.split("-");
    const num = parseInt(parts[2], 10);
    if (!isNaN(num)) {
      nextSequence = num + 1;
    }
  }

  return `${prefix}${String(nextSequence).padStart(4, "0")}`;
}

/**
 * POST /api/webhooks/inbound-email
 * Inbound email receiver for official studio channels:
 * - support@tavistra.com  -> Creates SupportTicket (TCK-YYYY-NNNN) with thread message
 * - concierge@tavistra.in -> Creates BulkInquiry (INQ-YYYY-NNNN) identical to /contact general inquiry
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const toAddress = (body.to || body.recipient || "").trim().toLowerCase();
    const fromAddress = (body.from || body.sender || "").trim();
    const senderName = (body.name || body.fromName || fromAddress.split("@")[0] || "Client").trim();
    const subject = (body.subject || "Incoming Client Correspondence").trim();
    const messageText = (body.text || body.body || body.html || "").trim();

    if (!fromAddress || !messageText) {
      return NextResponse.json(
        { error: "Sender email address and message body are required." },
        { status: 400 }
      );
    }

    // Clean sender email (e.g. from "Vikas <user@example.com>")
    const emailMatch = fromAddress.match(/<([^>]+)>/);
    const cleanFromEmail = (emailMatch ? emailMatch[1] : fromAddress).trim().toLowerCase();

    const emailCheck = validateEmail(cleanFromEmail);
    if (!emailCheck.isValid) {
      return NextResponse.json(
        { error: `Invalid sender email: ${emailCheck.error}` },
        { status: 400 }
      );
    }

    // Detect Order Number reference (e.g. TAV-2026-1001 or TAV-QTE-20261112-3608)
    const orderMatch = (subject + " " + messageText).match(/TAV-[A-Z0-9\-]+/i);
    const detectedOrderNumber = orderMatch ? orderMatch[0].toUpperCase() : null;

    // Detect urgent keywords for priority auto-escalation
    const lowerContent = (subject + " " + messageText).toLowerCase();
    const isUrgent =
      lowerContent.includes("damage") ||
      lowerContent.includes("broken") ||
      lowerContent.includes("defect") ||
      lowerContent.includes("crack") ||
      lowerContent.includes("cancel") ||
      lowerContent.includes("refund");

    // ROUTING RULE 1: support@tavistra.com -> Support Ticket Desk
    if (toAddress.includes("support@tavistra.com") || toAddress.startsWith("support@")) {
      const ticketNumber = await generateNextTicketNumber();

      let category = "GENERAL_ASSISTANCE";
      if (lowerContent.includes("cancel") || lowerContent.includes("refund")) {
        category = "CANCELLATION";
      } else if (
        lowerContent.includes("damage") ||
        lowerContent.includes("defect") ||
        lowerContent.includes("transit")
      ) {
        category = "DAMAGE_REPORT";
      } else if (lowerContent.includes("alter") || lowerContent.includes("dimension") || lowerContent.includes("finish")) {
        category = "SPEC_ALTERATION";
      } else if (lowerContent.includes("deliver") || lowerContent.includes("tracking") || lowerContent.includes("courier")) {
        category = "DELIVERY_SCHEDULE";
      } else if (detectedOrderNumber) {
        category = "ORDER_INQUIRY";
      }

      const priority = isUrgent ? "HIGH" : "NORMAL";

      const ticket = await prisma.$transaction(async (tx) => {
        const createdTicket = await tx.supportTicket.create({
          data: {
            ticketNumber,
            orderNumber: detectedOrderNumber,
            customerName: senderName,
            email: cleanFromEmail,
            phone: body.phone || "+91 00000 00000",
            subject,
            category,
            priority,
            status: "OPEN",
          },
        });

        await tx.ticketMessage.create({
          data: {
            ticketId: createdTicket.id,
            sender: "CUSTOMER",
            authorName: senderName,
            text: messageText,
          },
        });

        return createdTicket;
      });

      // Dispatch automated intake acknowledgment email
      try {
        await sendTicketEmail({
          customerName: senderName,
          customerEmail: cleanFromEmail,
          ticketNumber: ticket.ticketNumber,
          subject: ticket.subject,
          messageText: messageText.slice(0, 240),
          isStaffReply: false,
        });
      } catch (mailErr) {
        console.warn("Mailpit ticket notification dispatch failed (non-blocking):", mailErr);
      }

      // Log immutable audit entry
      try {
        await prisma.auditLog.create({
          data: {
            action: "INBOUND_EMAIL_TICKET_CREATED",
            entityType: "SupportTicket",
            entityId: ticket.id,
            payloadJson: JSON.stringify({
              ticketNumber: ticket.ticketNumber,
              from: cleanFromEmail,
              to: toAddress,
              detectedOrderNumber,
              category,
              priority,
            }),
          },
        });
      } catch {}

      return NextResponse.json(
        {
          success: true,
          channel: "SUPPORT_TICKET",
          ticketNumber: ticket.ticketNumber,
          category,
          priority,
          orderNumber: detectedOrderNumber,
          message: "Inbound email successfully ingested as client support ticket.",
        },
        { status: 201 }
      );
    }

    // ROUTING RULE 2: concierge@tavistra.in -> General & Architectural Inquiries
    if (toAddress.includes("concierge@tavistra.in") || toAddress.startsWith("concierge@")) {
      const inquiryNumber = await generateNextInquiryNumber();

      const inquiry = await prisma.bulkInquiry.create({
        data: {
          inquiryNumber,
          clientName: senderName,
          practiceOrStudio: body.practiceOrStudio || null,
          email: cleanFromEmail,
          phone: body.phone || "+91 00000 00000",
          destinationCity: body.city || "Pan-India",
          destinationPincode: body.pincode || "000000",
          requestedEditions: subject,
          quantityUnits: 10,
          specifications: messageText,
          status: "NEW",
        },
      });

      // Dispatch inquiry acknowledgment email
      try {
        await sendBulkInquiryAckEmail({
          inquiryNumber: inquiry.inquiryNumber,
          clientName: senderName,
          email: cleanFromEmail,
          requestedEditions: subject,
          quantityUnits: 10,
          destinationCity: inquiry.destinationCity,
          destinationPincode: inquiry.destinationPincode,
        });
      } catch (mailErr) {
        console.warn("Mailpit inquiry notification dispatch failed (non-blocking):", mailErr);
      }

      // Log immutable audit entry
      try {
        await prisma.auditLog.create({
          data: {
            action: "INBOUND_EMAIL_INQUIRY_CREATED",
            entityType: "BulkInquiry",
            entityId: inquiry.id,
            payloadJson: JSON.stringify({
              inquiryNumber: inquiry.inquiryNumber,
              from: cleanFromEmail,
              to: toAddress,
              subject,
            }),
          },
        });
      } catch {}

      return NextResponse.json(
        {
          success: true,
          channel: "GENERAL_INQUIRY",
          inquiryNumber: inquiry.inquiryNumber,
          message: "Inbound email successfully ingested as general studio inquiry.",
        },
        { status: 201 }
      );
    }

    // Fallback: If sent to another address, default route to General Inquiry desk
    const fallbackInquiryNumber = await generateNextInquiryNumber();
    const fallbackInquiry = await prisma.bulkInquiry.create({
      data: {
        inquiryNumber: fallbackInquiryNumber,
        clientName: senderName,
        email: cleanFromEmail,
        phone: body.phone || "+91 00000 00000",
        destinationCity: "Pan-India",
        destinationPincode: "000000",
        requestedEditions: subject,
        quantityUnits: 10,
        specifications: `Inbound email to [${toAddress}]:\n\n${messageText}`,
        status: "NEW",
      },
    });

    return NextResponse.json(
      {
        success: true,
        channel: "FALLBACK_INQUIRY",
        inquiryNumber: fallbackInquiry.inquiryNumber,
        message: "Inbound email routed to general desk.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/webhooks/inbound-email error:", err);
    return NextResponse.json(
      { error: "Internal error processing inbound email webhook." },
      { status: 500 }
    );
  }
}


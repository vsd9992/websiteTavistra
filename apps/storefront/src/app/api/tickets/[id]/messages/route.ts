import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { sendTicketEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { sender, authorName, text, status } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Message text is required." }, { status: 400 });
    }

    const cleanSender = sender === "CUSTOMER" ? "CUSTOMER" : "STAFF";

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        OR: [{ id }, { ticketNumber: id.toUpperCase() }],
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Support ticket not found." }, { status: 404 });
    }

    const resolvedAuthor =
      authorName && typeof authorName === "string" && authorName.trim()
        ? authorName.trim()
        : cleanSender === "STAFF"
        ? "Studio Concierge"
        : ticket.customerName;

    // Create the message in thread
    const newMsg = await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        sender: cleanSender,
        authorName: resolvedAuthor,
        text: text.trim(),
      },
    });

    // Auto-transition status cleanly
    let newStatus = ticket.status;
    if (status && ["OPEN", "IN_PROGRESS", "RESOLVED"].includes(status)) {
      newStatus = status;
    } else if (cleanSender === "STAFF" && ticket.status === "OPEN") {
      newStatus = "IN_PROGRESS";
    } else if (cleanSender === "CUSTOMER" && ticket.status === "RESOLVED") {
      newStatus = "IN_PROGRESS"; // Re-open on customer follow-up
    }

    if (newStatus !== ticket.status) {
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { status: newStatus },
      });
    }

    // Record Immutable Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: cleanSender === "STAFF" ? "SUPPORT_TICKET_STAFF_REPLY" : "SUPPORT_TICKET_CUSTOMER_REPLY",
          entityType: "SupportTicket",
          entityId: ticket.ticketNumber,
          payloadJson: JSON.stringify({
            authorName: resolvedAuthor,
            sender: cleanSender,
            status: newStatus,
          }),
        },
      });
    } catch (auditErr) {
      console.warn("Audit log creation non-blocking warning:", auditErr);
    }

    // If reply is from staff, dispatch email directly to customer via Mailpit
    if (cleanSender === "STAFF") {
      sendTicketEmail({
        ticketNumber: ticket.ticketNumber,
        customerName: ticket.customerName,
        customerEmail: ticket.email,
        subject: ticket.subject,
        messageText: text.trim(),
        orderNumber: ticket.orderNumber,
        category: ticket.category,
        isStaffReply: true,
        authorName: resolvedAuthor,
      }).catch((err) => console.warn("Staff ticket reply email error:", err));
    }

    return NextResponse.json({
      success: true,
      message: {
        id: newMsg.id,
        sender: newMsg.sender,
        authorName: newMsg.authorName,
        text: newMsg.text,
        timestamp:
          newMsg.createdAt.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }) + " IST",
      },
      ticketStatus: newStatus,
    });
  } catch (error) {
    console.error("POST /api/tickets/[id]/messages error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

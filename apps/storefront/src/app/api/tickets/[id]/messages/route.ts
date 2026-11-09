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

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        OR: [{ id }, { ticketNumber: id.toUpperCase() }],
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const newMsg = await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        sender: sender || "STAFF",
        authorName: authorName || "Studio Concierge",
        text,
      },
    });

    if (status) {
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { status },
      });
    }

    // If reply is from staff, dispatch email directly to customer
    if (!sender || sender === "STAFF") {
      sendTicketEmail({
        ticketNumber: ticket.ticketNumber,
        customerName: ticket.customerName,
        customerEmail: ticket.email,
        subject: ticket.subject,
        messageText: text,
        isStaffReply: true,
        authorName: authorName || "Studio Concierge",
      }).catch((err) => console.warn("Staff ticket reply email error:", err));
    }

    return NextResponse.json({
      success: true,
      message: newMsg,
    });
  } catch (error) {
    console.error("POST /api/tickets/[id]/messages error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


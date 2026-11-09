import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";

export async function GET() {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      tickets: tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        orderNumber: t.orderNumber || undefined,
        customerName: t.customerName,
        email: t.email,
        phone: t.phone,
        subject: t.subject,
        category: t.category,
        priority: t.priority,
        status: t.status,
        createdAt: t.createdAt.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        messages: t.messages.map((m) => ({
          id: m.id,
          sender: m.sender,
          authorName: m.authorName,
          text: m.text,
          timestamp: m.createdAt.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }) + " IST",
        })),
      })),
    });
  } catch (error) {
    console.error("GET /api/tickets error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, category, message, orderNumber } = body;

    const currentYear = new Date().getFullYear();
    const count = await prisma.supportTicket.count();
    const ticketNumber = `TCK-${currentYear}-${(count + 101).toString().padStart(4, "0")}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        orderNumber: orderNumber || null,
        customerName: name,
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        subject: subject || "Customer Service Inquiry",
        category: category || "ORDER_INQUIRY",
        priority: "NORMAL",
        status: "OPEN",
        messages: {
          create: [
            {
              sender: "CUSTOMER",
              authorName: name,
              text: message,
            },
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      ticketNumber: ticket.ticketNumber,
      message: "Support ticket registered successfully.",
    });
  } catch (error) {
    console.error("POST /api/tickets error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

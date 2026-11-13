import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { getAuthenticatedUser } from "@/lib/auth";

const ALLOWED_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED"] as const;
const ALLOWED_PRIORITIES = ["NORMAL", "HIGH", "URGENT"] as const;

function formatTimestamp(d: Date): string {
  return (
    d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " IST"
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const contact = searchParams.get("contact");

    const sessionUser = await getAuthenticatedUser(req);
    const isAdmin = req.headers.get("x-tavistra-admin") === "true";

    const cleanRef = decodeURIComponent(id).trim().toUpperCase();
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        OR: [{ id: cleanRef }, { ticketNumber: cleanRef }],
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Support ticket not found." }, { status: 404 });
    }

    // Access check
    const isOwner = Boolean(sessionUser && ticket.email.toLowerCase() === sessionUser.email.toLowerCase());
    if (!isAdmin && !isOwner) {
      if (!contact || !contact.trim()) {
        return NextResponse.json(
          { error: "Provide registered email or phone number to view ticket conversation." },
          { status: 401 }
        );
      }
      const cleanContact = contact.trim().toLowerCase().replace(/[\s\-()]/g, "");
      const emailMatches = ticket.email.toLowerCase() === cleanContact;
      const cleanPhone = ticket.phone.replace(/[\s\-()]/g, "");
      const phoneMatches =
        cleanContact.length >= 6 &&
        (cleanPhone.includes(cleanContact) || cleanContact.includes(cleanPhone));

      if (!emailMatches && !phoneMatches) {
        return NextResponse.json(
          { error: "Ticket reference or contact details did not match." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        orderNumber: ticket.orderNumber || undefined,
        customerName: ticket.customerName,
        email: ticket.email,
        phone: ticket.phone,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        messages: ticket.messages.map((m) => ({
          id: m.id,
          sender: m.sender,
          authorName: m.authorName,
          text: m.text,
          timestamp: formatTimestamp(m.createdAt),
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/tickets/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, priority, staffName } = body;

    const cleanRef = decodeURIComponent(id).trim().toUpperCase();
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        OR: [{ id: cleanRef }, { ticketNumber: cleanRef }],
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (status && ALLOWED_STATUSES.includes(status)) {
      dataToUpdate.status = status;
    }
    if (priority && ALLOWED_PRIORITIES.includes(priority)) {
      dataToUpdate.priority = priority;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: dataToUpdate,
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: "SUPPORT_TICKET_UPDATED",
          entityType: "SupportTicket",
          entityId: ticket.ticketNumber,
          payloadJson: JSON.stringify({
            staff: staffName || "Admin Staff",
            changes: dataToUpdate,
          }),
        },
      });
    } catch (auditErr) {
      console.warn("Audit log creation non-blocking warning:", auditErr);
    }

    return NextResponse.json({
      success: true,
      ticket: updated,
      message: "Ticket updated successfully.",
    });
  } catch (error) {
    console.error("PATCH /api/tickets/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


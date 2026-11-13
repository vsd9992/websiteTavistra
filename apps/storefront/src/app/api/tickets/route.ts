import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { validateEmail, validateIndianMobile } from "@tavistra/shared";
import { sendTicketEmail } from "@/lib/email";
import { getAuthenticatedUser } from "@/lib/auth";

const ALLOWED_CATEGORIES = [
  "ORDER_INQUIRY",
  "SPEC_ALTERATION",
  "DELIVERY_SCHEDULE",
  "DAMAGE_REPORT",
  "CANCELLATION",
  "GENERAL_ASSISTANCE",
] as const;

const ALLOWED_PRIORITIES = ["NORMAL", "HIGH", "URGENT"] as const;
const ALLOWED_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED"] as const;

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketNumber = searchParams.get("ticketNumber");
    const contact = searchParams.get("contact");
    const orderNumber = searchParams.get("orderNumber");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const email = searchParams.get("email");

    const sessionUser = await getAuthenticatedUser(req);
    const isAdmin = req.headers.get("x-tavistra-admin") === "true";

    // 1. Single Ticket Direct Lookup (e.g. for /track?ticket=TCK-2026-0101)
    if (ticketNumber) {
      const cleanNumber = ticketNumber.trim().toUpperCase();
      const ticket = await prisma.supportTicket.findUnique({
        where: { ticketNumber: cleanNumber },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!ticket) {
        return NextResponse.json({ found: false, error: "Support ticket not found." }, { status: 404 });
      }

      // Authorization guard: Require admin, authenticated ticket owner, or matching contact
      const isOwner = Boolean(sessionUser && ticket.email.toLowerCase() === sessionUser.email.toLowerCase());
      if (!isAdmin && !isOwner) {
        if (!contact || !contact.trim()) {
          return NextResponse.json(
            {
              found: false,
              error: "Please provide the billing email or mobile registered on this ticket to view thread details.",
            },
            { status: 401 }
          );
        }

        const cleanContact = contact.trim().toLowerCase();
        const emailMatches = ticket.email.toLowerCase() === cleanContact;
        const cleanPhone = ticket.phone.replace(/[\s\-()]/g, "");
        const cleanContactPhone = cleanContact.replace(/[\s\-()]/g, "");
        const phoneMatches =
          cleanContactPhone.length >= 6 &&
          (cleanPhone.includes(cleanContactPhone) || cleanContactPhone.includes(cleanPhone));

        if (!emailMatches && !phoneMatches) {
          return NextResponse.json(
            { found: false, error: "Ticket reference or contact details did not match." },
            { status: 403 }
          );
        }
      }

      return NextResponse.json({
        found: true,
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
    }

    // 2. Filtered Listing (Admin Desk & Account Tickets)
    const where: any = {};

    if (email) {
      where.email = email.toLowerCase().trim();
    }
    if (orderNumber) {
      where.orderNumber = orderNumber.trim().toUpperCase();
    }
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (priority && priority !== "ALL") {
      where.priority = priority;
    }
    if (category && category !== "ALL") {
      where.category = category;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { ticketNumber: { contains: q, mode: "insensitive" } },
        { customerName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { orderNumber: { contains: q, mode: "insensitive" } },
        { subject: { contains: q, mode: "insensitive" } },
      ];
    }

    const tickets = await prisma.supportTicket.findMany({
      where,
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
          timestamp: formatTimestamp(m.createdAt),
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
    const { name, email, phone, subject, category, message, orderNumber, priority } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Client legal name is required." }, { status: 400 });
    }

    const emailVal = validateEmail(email || "");
    if (!emailVal.isValid) {
      return NextResponse.json({ error: emailVal.error || "Valid email address required." }, { status: 400 });
    }

    const phoneVal = validateIndianMobile(phone || "");
    if (!phoneVal.isValid) {
      return NextResponse.json(
        { error: phoneVal.error || "Valid 10-digit Indian mobile number required." },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json({ error: "Ticket subject is required." }, { status: 400 });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Detailed message is required." }, { status: 400 });
    }

    const cleanCategory =
      category && ALLOWED_CATEGORIES.includes(category) ? category : "ORDER_INQUIRY";

    // Auto-escalate priority for critical operational categories if not specified
    let cleanPriority = "NORMAL";
    if (priority && ALLOWED_PRIORITIES.includes(priority)) {
      cleanPriority = priority;
    } else if (cleanCategory === "DAMAGE_REPORT" || cleanCategory === "CANCELLATION") {
      cleanPriority = "HIGH";
    }

    const cleanOrderNumber =
      orderNumber && typeof orderNumber === "string" && orderNumber.trim()
        ? orderNumber.trim().toUpperCase()
        : null;

    const currentYear = new Date().getFullYear();
    const count = await prisma.supportTicket.count();
    const ticketNumber = `TCK-${currentYear}-${(count + 101).toString().padStart(4, "0")}`;

    const normalizedEmail = emailVal.normalizedEmail || email.toLowerCase().trim();
    const normalizedPhone = phoneVal.normalizedPhone || phone.trim();

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        orderNumber: cleanOrderNumber,
        customerName: name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        subject: subject.trim(),
        category: cleanCategory,
        priority: cleanPriority,
        status: "OPEN",
        messages: {
          create: [
            {
              sender: "CUSTOMER",
              authorName: name.trim(),
              text: message.trim(),
            },
          ],
        },
      },
      include: {
        messages: true,
      },
    });

    // Record Immutable Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: "SUPPORT_TICKET_CREATED",
          entityType: "SupportTicket",
          entityId: ticket.ticketNumber,
          payloadJson: JSON.stringify({
            customerName: ticket.customerName,
            email: ticket.email,
            orderNumber: ticket.orderNumber,
            category: ticket.category,
            priority: ticket.priority,
          }),
        },
      });
    } catch (auditErr) {
      console.warn("Audit log creation non-blocking warning:", auditErr);
    }

    // Dispatch asynchronous support ticket confirmation email to customer via Mailpit
    sendTicketEmail({
      ticketNumber: ticket.ticketNumber,
      customerName: ticket.customerName,
      customerEmail: ticket.email,
      subject: ticket.subject,
      messageText: message.trim(),
      orderNumber: ticket.orderNumber,
      category: ticket.category,
      isStaffReply: false,
    }).catch((err) => console.warn("Ticket email dispatch error:", err));

    return NextResponse.json(
      {
        success: true,
        ticketNumber: ticket.ticketNumber,
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
        },
        message: "Support ticket registered successfully with the studio concierge desk.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/tickets error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ticketNumber, status, priority, staffName } = body;

    const targetRef = id || ticketNumber;
    if (!targetRef) {
      return NextResponse.json({ error: "Ticket ID or Ticket Number required." }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        OR: [{ id: targetRef }, { ticketNumber: targetRef.toUpperCase() }],
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

    // Record Immutable Audit Log
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
    console.error("PATCH /api/tickets error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

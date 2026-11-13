import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * GET /api/account/tickets
 * Retrieves all client support tickets associated with the authenticated user session.
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || !authUser.email) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const cleanEmail = authUser.email.trim().toLowerCase();

    const tickets = await prisma.supportTicket.findMany({
      where: {
        email: {
          equals: cleanEmail,
          mode: "insensitive",
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const categoryLabels: Record<string, string> = {
      ORDER_INQUIRY: "Order Inquiry & Tracking",
      SPEC_ALTERATION: "7-Day Specification Alteration",
      DELIVERY_SCHEDULE: "Delivery Schedule & Courier Coordination",
      DAMAGE_REPORT: "Transit Damage & Inspection Defect",
      CANCELLATION: "Order Cancellation & Refund",
      GENERAL_ASSISTANCE: "General Studio Assistance",
    };

    const statusLabels: Record<string, string> = {
      OPEN: "Open — Awaiting Studio Review",
      IN_PROGRESS: "In Progress — Desk Active",
      RESOLVED: "Resolved",
    };

    return NextResponse.json({
      tickets: tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        orderNumber: t.orderNumber || null,
        customerName: t.customerName,
        email: t.email,
        phone: t.phone,
        subject: t.subject,
        category: t.category,
        categoryLabel: categoryLabels[t.category] || t.category,
        priority: t.priority,
        status: t.status,
        statusLabel: statusLabels[t.status] || t.status,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        messagesCount: t.messages.length,
        latestMessage: t.messages[t.messages.length - 1]
          ? {
              text: t.messages[t.messages.length - 1].text,
              sender: t.messages[t.messages.length - 1].sender,
              authorName: t.messages[t.messages.length - 1].authorName,
              createdAt: t.messages[t.messages.length - 1].createdAt.toISOString(),
            }
          : null,
        messages: t.messages.map((m) => ({
          id: m.id,
          sender: m.sender,
          authorName: m.authorName,
          text: m.text,
          createdAt: m.createdAt.toISOString(),
        })),
      })),
    });
  } catch (err) {
    console.error("GET /api/account/tickets error:", err);
    return NextResponse.json(
      { error: "Unable to retrieve support tickets." },
      { status: 500 }
    );
  }
}


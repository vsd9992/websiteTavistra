import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { deriveDocumentNumbers } from "@/lib/invoiceUtils";
import { sendOrderTaxInvoiceEmailWithPdf } from "@/lib/sendInvoiceHelper";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const contact = (body.contact || "").trim().toLowerCase();
    const cleanId = (id || "").trim();

    if (!cleanId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: cleanId }, { orderNumber: cleanId.toUpperCase() }],
      },
      include: {
        shippingAddress: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order record not found." }, { status: 404 });
    }

    // Security Verification: Logged-in owner OR matching contact param
    const sessionUser = await getAuthenticatedUser();
    const isOwner = Boolean(sessionUser && order.userId === sessionUser.id);
    const isContactMatched =
      contact.length > 0 &&
      (order.customerEmail.toLowerCase() === contact ||
        order.customerPhone.replace(/\D/g, "").endsWith(contact.replace(/\D/g, "")));

    if (!isOwner && !isContactMatched) {
      return NextResponse.json(
        { error: "Authentication required to dispatch statutory invoice to customer email." },
        { status: 403 }
      );
    }

    const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
    const balanceDueNum = Number(order.balanceAmount);
    const isMtoPending =
      (order.purchaseMode === "MADE_TO_ORDER" || Boolean(order.quoteNumber)) &&
      balanceDueNum > 0 &&
      !isCancelled;

    const docNumbers = deriveDocumentNumbers(order.orderNumber, order.createdAt);
    const documentType = isCancelled
      ? ("CREDIT_NOTE" as const)
      : isMtoPending
      ? ("ADVANCE_RECEIPT" as const)
      : ("TAX_INVOICE" as const);

    const documentNumber = isCancelled
      ? docNumbers.creditNoteNumber
      : isMtoPending
      ? docNumbers.receiptVoucherNumber
      : docNumbers.invoiceNumber;

    const sent = await sendOrderTaxInvoiceEmailWithPdf(order.id);
    if (!sent) {
      throw new Error("PDF generator or email transport failed.");
    }

    return NextResponse.json({
      success: true,
      email: order.customerEmail,
      documentType,
      documentNumber,
      message: `Document with attached statutory PDF dispatched to ${order.customerEmail}`,
    });
  } catch (error) {
    console.error("POST /api/orders/[id]/email-invoice error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while dispatching statutory document email." },
      { status: 500 }
    );
  }
}

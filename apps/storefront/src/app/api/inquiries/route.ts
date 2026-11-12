import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { validateEmail, validateIndianMobile, lookupPincode } from "@tavistra/shared";
import { sendBulkInquiryAckEmail } from "@/lib/email";

export async function GET() {
  try {
    const inquiries = await prisma.bulkInquiry.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      inquiries: inquiries.map((inq) => ({
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
        status: inq.status,
        submittedAt: inq.createdAt.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      })),
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


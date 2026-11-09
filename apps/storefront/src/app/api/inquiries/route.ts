import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";

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

    const currentYear = new Date().getFullYear();
    const count = await prisma.bulkInquiry.count();
    const inquiryNumber = `INQ-${currentYear}-${(count + 801).toString().padStart(4, "0")}`;

    const inquiry = await prisma.bulkInquiry.create({
      data: {
        inquiryNumber,
        clientName: name,
        practiceOrStudio: practiceOrStudio || null,
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        destinationCity: city || "Unspecified City",
        destinationPincode: pincode || "000000",
        requestedEditions: productName || "Architectural Bulk Proposal",
        quantityUnits: quantity ? parseInt(quantity, 10) : 10,
        specifications: message || "Direct bulk inquiry submission.",
        status: "NEW",
      },
    });

    return NextResponse.json({
      success: true,
      inquiryNumber: inquiry.inquiryNumber,
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


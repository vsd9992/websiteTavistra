import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { validateEmail } from "@tavistra/shared";
import {
  attachSessionCookie,
  serializeCustomerProfile,
  verifyEmailOtp,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body as { email?: string; code?: string };

    const emailRes = validateEmail(email || "");
    if (!emailRes.isValid || !emailRes.normalizedEmail) {
      return NextResponse.json({ error: emailRes.error || "Valid email is required." }, { status: 400 });
    }

    const cleanEmail = emailRes.normalizedEmail;
    const check = await verifyEmailOtp({
      email: cleanEmail,
      purpose: "VERIFY_EMAIL",
      code: code || "",
    });

    if (!check.valid) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email: cleanEmail },
      data: { emailVerifiedAt: new Date() },
      include: {
        addresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CUSTOMER_EMAIL_VERIFIED",
        entityType: "User",
        entityId: user.id,
        payloadJson: JSON.stringify({ email: user.email }),
      },
    });

    const response = NextResponse.json({
      success: true,
      user: serializeCustomerProfile(user, user.addresses),
    });

    await attachSessionCookie(response, user.id);
    return response;
  } catch (error) {
    console.error("POST /api/auth/verify-email error:", error);
    return NextResponse.json({ error: "Unable to verify email code." }, { status: 500 });
  }
}


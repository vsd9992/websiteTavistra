import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { validateEmail } from "@tavistra/shared";
import { hashPassword, verifyEmailOtp } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, newPassword } = body as {
      email?: string;
      code?: string;
      newPassword?: string;
    };

    const emailRes = validateEmail(email || "");
    if (!emailRes.isValid || !emailRes.normalizedEmail) {
      return NextResponse.json({ error: emailRes.error || "Valid email is required." }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters long." }, { status: 400 });
    }

    const cleanEmail = emailRes.normalizedEmail;
    const check = await verifyEmailOtp({
      email: cleanEmail,
      purpose: "PASSWORD_RESET",
      code: code || "",
    });

    if (!check.valid) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email: cleanEmail },
      data: {
        passwordHash: hashPassword(newPassword),
        emailVerifiedAt: new Date(),
      },
    });

    // Invalidate all existing sessions on password reset
    await prisma.customerSession.deleteMany({
      where: { userId: user.id },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CUSTOMER_PASSWORD_RESET",
        entityType: "User",
        entityId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password updated cleanly. Please sign in with your new password.",
    });
  } catch (error) {
    console.error("POST /api/auth/reset-password error:", error);
    return NextResponse.json({ error: "Unable to reset password." }, { status: 500 });
  }
}


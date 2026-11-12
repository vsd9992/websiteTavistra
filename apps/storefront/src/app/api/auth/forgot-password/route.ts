import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { validateEmail } from "@tavistra/shared";
import { issueEmailOtp } from "@/lib/auth";
import { sendCustomerOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body as { email?: string };

    const emailRes = validateEmail(email || "");
    if (!emailRes.isValid || !emailRes.normalizedEmail) {
      return NextResponse.json({ error: emailRes.error || "Valid email is required." }, { status: 400 });
    }

    const cleanEmail = emailRes.normalizedEmail;
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (user) {
      const code = await issueEmailOtp({
        email: cleanEmail,
        purpose: "PASSWORD_RESET",
        userId: user.id,
      });
      await sendCustomerOtpEmail({
        email: cleanEmail,
        name: user.name || "Client",
        code,
        purpose: "PASSWORD_RESET",
      });
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists for that email address, a 6-digit password reset code has been sent.",
    });
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);
    return NextResponse.json({ error: "Unable to process password reset request." }, { status: 500 });
  }
}


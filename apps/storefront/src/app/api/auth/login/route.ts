import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { validateEmail } from "@tavistra/shared";
import {
  attachSessionCookie,
  issueEmailOtp,
  serializeCustomerProfile,
  verifyEmailOtp,
  verifyPassword,
} from "@/lib/auth";
import { sendCustomerOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      mode = "password",
      email,
      password,
      code,
    } = body as {
      mode?: "password" | "otp_request" | "otp_verify";
      email?: string;
      password?: string;
      code?: string;
    };

    const emailRes = validateEmail(email || "");
    if (!emailRes.isValid || !emailRes.normalizedEmail) {
      return NextResponse.json({ error: emailRes.error || "Valid email is required." }, { status: 400 });
    }

    const cleanEmail = emailRes.normalizedEmail;

    // 1. One-time code sign-in request
    if (mode === "otp_request") {
      const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (!user) {
        return NextResponse.json(
          { error: "No client account found for this email. Please create an account first." },
          { status: 404 }
        );
      }

      const otpCode = await issueEmailOtp({
        email: cleanEmail,
        purpose: "LOGIN_OTP",
        userId: user.id,
      });

      await sendCustomerOtpEmail({
        email: cleanEmail,
        name: user.name || "Client",
        code: otpCode,
        purpose: "LOGIN_OTP",
      });

      return NextResponse.json({
        success: true,
        otpSent: true,
        email: cleanEmail,
        message: "A 6-digit sign-in code has been sent to your email address.",
      });
    }

    // 2. One-time code verification & sign-in
    if (mode === "otp_verify") {
      const check = await verifyEmailOtp({
        email: cleanEmail,
        purpose: "LOGIN_OTP",
        code: code || "",
      });

      if (!check.valid) {
        return NextResponse.json({ error: check.error }, { status: 401 });
      }

      const user = await prisma.user.update({
        where: { email: cleanEmail },
        data: {
          emailVerifiedAt: new Date(),
        },
        include: {
          addresses: {
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
          },
        },
      });

      const response = NextResponse.json({
        success: true,
        user: serializeCustomerProfile(user, user.addresses),
      });
      await attachSessionCookie(response, user.id);
      return response;
    }

    // 3. Standard Email + Password sign-in
    if (!password) {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        addresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Enforce verified-email gate before issuing a session
    if (!user.emailVerifiedAt) {
      const otpCode = await issueEmailOtp({
        email: cleanEmail,
        purpose: "VERIFY_EMAIL",
        userId: user.id,
      });
      await sendCustomerOtpEmail({
        email: cleanEmail,
        name: user.name || "Client",
        code: otpCode,
        purpose: "VERIFY_EMAIL",
      });

      return NextResponse.json(
        {
          error: "Please verify your email address to sign in. A fresh 6-digit code has been sent to your email.",
          requiresVerification: true,
          email: cleanEmail,
        },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: serializeCustomerProfile(user, user.addresses),
    });
    await attachSessionCookie(response, user.id);
    return response;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}


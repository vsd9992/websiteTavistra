import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { validateEmail, validateIndianMobile } from "@tavistra/shared";
import { hashPassword, issueEmailOtp, validateGstinFormat } from "@/lib/auth";
import { sendCustomerOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      password,
      gstin,
      practiceOrStudio,
    } = body as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      gstin?: string;
      practiceOrStudio?: string;
    };

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Full name must be at least 2 characters." }, { status: 400 });
    }

    const emailRes = validateEmail(email || "");
    if (!emailRes.isValid || !emailRes.normalizedEmail) {
      return NextResponse.json({ error: emailRes.error || "Invalid email address." }, { status: 400 });
    }

    const phoneRes = validateIndianMobile(phone || "");
    if (!phoneRes.isValid || !phoneRes.normalizedPhone) {
      return NextResponse.json({ error: phoneRes.error || "Invalid 10-digit Indian mobile number." }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    const gstinRes = validateGstinFormat(gstin || "");
    if (!gstinRes.isValid) {
      return NextResponse.json({ error: gstinRes.error }, { status: 400 });
    }

    const cleanEmail = emailRes.normalizedEmail;
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (existing && existing.emailVerifiedAt && existing.passwordHash) {
      return NextResponse.json(
        { error: "An account with this email is already registered. Please sign in or reset your password." },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            name: name.trim(),
            phone: phoneRes.normalizedPhone,
            passwordHash,
            gstin: gstinRes.normalized || null,
            practiceOrStudio: practiceOrStudio?.trim() || null,
          },
        })
      : await prisma.user.create({
          data: {
            email: cleanEmail,
            name: name.trim(),
            phone: phoneRes.normalizedPhone,
            passwordHash,
            gstin: gstinRes.normalized || null,
            practiceOrStudio: practiceOrStudio?.trim() || null,
          },
        });

    const code = await issueEmailOtp({
      email: cleanEmail,
      purpose: "VERIFY_EMAIL",
      userId: user.id,
    });

    await sendCustomerOtpEmail({
      email: cleanEmail,
      name: user.name || "Client",
      code,
      purpose: "VERIFY_EMAIL",
    });

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      email: cleanEmail,
      message: "Verification code sent to your email address. Enter the 6-digit code to activate your account.",
    });
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json({ error: "Unable to complete registration right now." }, { status: 500 });
  }
}


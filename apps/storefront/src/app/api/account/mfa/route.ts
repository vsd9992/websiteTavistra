import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@tavistra/db";
import {
  getAuthenticatedUser,
  issueEmailOtp,
  serializeCustomerProfile,
  verifyEmailOtp,
  verifyPassword,
} from "@/lib/auth";
import { sendCustomerOtpEmail } from "@/lib/email";
import { buildOtpAuthUri, generateBase32Secret, verifyTotpCode } from "@/lib/totp";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const { action, code, currentPassword } = body as {
      action?: "setup_totp" | "verify_totp" | "enable_email_request" | "enable_email_verify" | "disable";
      code?: string;
      currentPassword?: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        addresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    if (action === "setup_totp") {
      const secret = generateBase32Secret(20);
      await prisma.user.update({
        where: { id: user.id },
        data: { totpPendingSecret: secret },
      });

      const otpAuthUri = buildOtpAuthUri(user.email, secret);
      const qrDataUrl = await QRCode.toDataURL(otpAuthUri, {
        width: 220,
        margin: 1,
        color: { dark: "#1c1b18", light: "#faf9f6" },
      });

      return NextResponse.json({
        success: true,
        secret,
        otpAuthUri,
        qrDataUrl,
      });
    }

    if (action === "verify_totp") {
      if (!user.totpPendingSecret) {
        return NextResponse.json(
          { error: "No pending authenticator setup found. Start setup again." },
          { status: 400 }
        );
      }

      if (!code || !verifyTotpCode(user.totpPendingSecret, code)) {
        return NextResponse.json(
          { error: "Invalid 6-digit authenticator code. Verify your device clock and try again." },
          { status: 400 }
        );
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          mfaEnabled: true,
          mfaMethod: "TOTP",
          totpSecret: user.totpPendingSecret,
          totpPendingSecret: null,
        },
        include: {
          addresses: {
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
          },
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "CUSTOMER_MFA_ENABLED",
          entityType: "User",
          entityId: user.id,
          payloadJson: JSON.stringify({ method: "TOTP" }),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Authenticator App MFA is now enabled on your account.",
        user: serializeCustomerProfile(updated, updated.addresses),
      });
    }

    if (action === "enable_email_request") {
      const otpCode = await issueEmailOtp({
        email: user.email,
        purpose: "MFA_EMAIL_SETUP",
        userId: user.id,
      });

      await sendCustomerOtpEmail({
        email: user.email,
        name: user.name || "Client",
        code: otpCode,
        purpose: "MFA_EMAIL_SETUP",
      });

      return NextResponse.json({
        success: true,
        message: `A 6-digit confirmation code has been sent to ${user.email}.`,
      });
    }

    if (action === "enable_email_verify") {
      const otpCheck = await verifyEmailOtp({
        email: user.email,
        purpose: "MFA_EMAIL_SETUP",
        code: code || "",
      });

      if (!otpCheck.valid) {
        return NextResponse.json({ error: otpCheck.error }, { status: 400 });
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          mfaEnabled: true,
          mfaMethod: "EMAIL",
          totpSecret: null,
          totpPendingSecret: null,
        },
        include: {
          addresses: {
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
          },
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "CUSTOMER_MFA_ENABLED",
          entityType: "User",
          entityId: user.id,
          payloadJson: JSON.stringify({ method: "EMAIL" }),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Email Multi-Factor Authentication is now enabled on your account.",
        user: serializeCustomerProfile(updated, updated.addresses),
      });
    }

    if (action === "disable") {
      if (user.passwordHash) {
        if (!currentPassword || !verifyPassword(currentPassword, user.passwordHash)) {
          return NextResponse.json(
            { error: "Enter your current password to disable Multi-Factor Authentication." },
            { status: 401 }
          );
        }
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          mfaEnabled: false,
          mfaMethod: null,
          totpSecret: null,
          totpPendingSecret: null,
        },
        include: {
          addresses: {
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
          },
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "CUSTOMER_MFA_DISABLED",
          entityType: "User",
          entityId: user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Multi-Factor Authentication has been disabled.",
        user: serializeCustomerProfile(updated, updated.addresses),
      });
    }

    return NextResponse.json({ error: "Unsupported MFA action." }, { status: 400 });
  } catch (error) {
    console.error("POST /api/account/mfa error:", error);
    return NextResponse.json({ error: "Unable to process MFA settings right now." }, { status: 500 });
  }
}

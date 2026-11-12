import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { validateEmail } from "@tavistra/shared";
import {
  attachSessionCookie,
  getActiveMfaChallenge,
  issueEmailOtp,
  issueMfaChallengeToken,
  serializeCustomerProfile,
  verifyEmailOtp,
  verifyPassword,
} from "@/lib/auth";
import { sendCustomerOtpEmail } from "@/lib/email";
import { verifyTotpCode } from "@/lib/totp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      mode = "password",
      email,
      password,
      code,
      mfaToken,
    } = body as {
      mode?: "password" | "otp_request" | "otp_verify" | "mfa_verify";
      email?: string;
      password?: string;
      code?: string;
      mfaToken?: string;
    };

    // 1. Multi-factor challenge completion
    if (mode === "mfa_verify") {
      if (!mfaToken || !code) {
        return NextResponse.json(
          { error: "MFA session token and 6-digit verification code are required." },
          { status: 400 }
        );
      }

      const challenge = await getActiveMfaChallenge(mfaToken);
      if (!challenge || !challenge.userId) {
        return NextResponse.json(
          { error: "MFA challenge expired or invalid. Please sign in again." },
          { status: 401 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: challenge.userId },
        include: {
          addresses: {
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
          },
        },
      });

      if (!user || !user.mfaEnabled) {
        return NextResponse.json(
          { error: "Account not eligible for MFA challenge." },
          { status: 401 }
        );
      }

      if (user.mfaMethod === "TOTP") {
        if (!user.totpSecret || !verifyTotpCode(user.totpSecret, code)) {
          await prisma.emailVerificationToken.update({
            where: { id: challenge.id },
            data: { attempts: { increment: 1 } },
          });
          return NextResponse.json(
            { error: "Invalid authenticator code. Please enter the current 6-digit code from your app." },
            { status: 401 }
          );
        }
      } else {
        const otpCheck = await verifyEmailOtp({
          email: user.email,
          purpose: "MFA_EMAIL",
          code,
        });
        if (!otpCheck.valid) {
          await prisma.emailVerificationToken.update({
            where: { id: challenge.id },
            data: { attempts: { increment: 1 } },
          });
          return NextResponse.json({ error: otpCheck.error }, { status: 401 });
        }
      }

      await prisma.emailVerificationToken.update({
        where: { id: challenge.id },
        data: { consumedAt: new Date() },
      });

      const response = NextResponse.json({
        success: true,
        user: serializeCustomerProfile(user, user.addresses),
      });
      await attachSessionCookie(response, user.id);
      return response;
    }

    const emailRes = validateEmail(email || "");
    if (!emailRes.isValid || !emailRes.normalizedEmail) {
      return NextResponse.json(
        { error: emailRes.error || "Valid email is required." },
        { status: 400 }
      );
    }

    const cleanEmail = emailRes.normalizedEmail;

    // 2. One-time code sign-in request
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

    // 3. One-time code verification & sign-in
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

      // If Authenticator App (TOTP) MFA is enabled, enforce second factor
      if (user.mfaEnabled && user.mfaMethod === "TOTP") {
        const challengeToken = await issueMfaChallengeToken({
          userId: user.id,
          email: user.email,
        });
        return NextResponse.json({
          success: false,
          requiresMfa: true,
          mfaMethod: "TOTP",
          mfaToken: challengeToken,
          message: "Enter the 6-digit code from your authenticator app to complete sign-in.",
        });
      }

      const response = NextResponse.json({
        success: true,
        user: serializeCustomerProfile(user, user.addresses),
      });
      await attachSessionCookie(response, user.id);
      return response;
    }

    // 4. Standard Email + Password sign-in
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
          error:
            "Please verify your email address to sign in. A fresh 6-digit code has been sent to your email.",
          requiresVerification: true,
          email: cleanEmail,
        },
        { status: 403 }
      );
    }

    // Enforce MFA if enabled on user account
    if (user.mfaEnabled && (user.mfaMethod === "EMAIL" || user.mfaMethod === "TOTP")) {
      const challengeToken = await issueMfaChallengeToken({
        userId: user.id,
        email: user.email,
      });

      if (user.mfaMethod === "EMAIL") {
        const mfaOtp = await issueEmailOtp({
          email: user.email,
          purpose: "MFA_EMAIL",
          userId: user.id,
        });
        await sendCustomerOtpEmail({
          email: user.email,
          name: user.name || "Client",
          code: mfaOtp,
          purpose: "MFA_EMAIL",
        });
      }

      return NextResponse.json({
        success: false,
        requiresMfa: true,
        mfaMethod: user.mfaMethod,
        mfaToken: challengeToken,
        message:
          user.mfaMethod === "TOTP"
            ? "Enter the 6-digit code from your authenticator app."
            : "A 6-digit multi-factor code has been sent to your email address.",
      });
    }

    const response = NextResponse.json({
      success: true,
      user: serializeCustomerProfile(user, user.addresses),
    });
    await attachSessionCookie(response, user.id);
    return response;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json({ error: "Sign in failed. Please try again." }, { status: 500 });
  }
}

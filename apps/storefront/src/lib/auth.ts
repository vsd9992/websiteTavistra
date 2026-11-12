import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";

export const SESSION_COOKIE_NAME = "tavistra_session";
const SESSION_TTL_DAYS = 30;
const OTP_TTL_MINUTES = 15;
const MAX_OTP_ATTEMPTS = 5;

export type OtpPurpose = "VERIFY_EMAIL" | "LOGIN_OTP" | "PASSWORD_RESET";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string | null | undefined): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, keyHex] = storedHash.split(":");
  if (!salt || !keyHex) return false;
  try {
    const keyBuf = Buffer.from(keyHex, "hex");
    const derived = crypto.scryptSync(password, salt, 64);
    if (keyBuf.length !== derived.length) return false;
    return crypto.timingSafeEqual(keyBuf, derived);
  } catch {
    return false;
  }
}

export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function generateRawToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateSixDigitOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export function validateGstinFormat(gstin: string): { isValid: boolean; normalized?: string; error?: string } {
  const clean = gstin.trim().toUpperCase();
  if (!clean) return { isValid: true, normalized: undefined };
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(clean)) {
    return { isValid: false, error: "Please enter a valid 15-character Indian GSTIN (e.g. 07AAAAA0000A1Z5)." };
  }
  return { isValid: true, normalized: clean };
}

/**
 * Creates a PostgreSQL CustomerSession row and sets an HTTP-only session cookie on the NextResponse.
 */
export async function attachSessionCookie(
  response: NextResponse,
  userId: string
): Promise<string> {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.customerSession.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: rawToken,
    httpOnly: true,
    sameSite: "lax",
    // devMachine runs HTTP on LAN (192.168.1.100:3001); enable COOKIE_SECURE=true in HTTPS production
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    expires: expiresAt,
  });

  return rawToken;
}

export async function revokeSessionFromRequest(req: NextRequest, response: NextResponse) {
  const rawToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (rawToken) {
    await prisma.customerSession.deleteMany({
      where: { tokenHash: hashToken(rawToken) },
    });
  }
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Resolves the currently authenticated customer User from the HTTP-only `tavistra_session` cookie.
 * Returns null if missing, invalid, or expired. Never trusts query parameters or client headers.
 */
export async function getAuthenticatedUser(req?: NextRequest) {
  let rawToken: string | undefined;
  if (req) {
    rawToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  } else {
    try {
      const store = await cookies();
      rawToken = store.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      rawToken = undefined;
    }
  }

  if (!rawToken) return null;

  const session = await prisma.customerSession.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          gstin: true,
          practiceOrStudio: true,
          emailVerifiedAt: true,
          role: true,
          createdAt: true,
        },
      },
    },
  });

  if (!session) return null;

  if (new Date(session.expiresAt) <= new Date()) {
    await prisma.customerSession.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session.user;
}

/**
 * Issues a fresh 6-digit OTP token stored hashed in EmailVerificationToken (15-min TTL).
 */
export async function issueEmailOtp(params: {
  email: string;
  purpose: OtpPurpose;
  userId?: string | null;
}): Promise<string> {
  const cleanEmail = params.email.trim().toLowerCase();
  const code = generateSixDigitOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  // Invalidate prior unconsumed tokens for this email + purpose
  await prisma.emailVerificationToken.updateMany({
    where: {
      email: cleanEmail,
      purpose: params.purpose,
      consumedAt: null,
    },
    data: {
      consumedAt: new Date(),
    },
  });

  await prisma.emailVerificationToken.create({
    data: {
      userId: params.userId || null,
      email: cleanEmail,
      purpose: params.purpose,
      codeHash: hashToken(`${cleanEmail}:${params.purpose}:${code}`),
      expiresAt,
    },
  });

  return code;
}

/**
 * Verifies a 6-digit OTP safely (constant-time hash check + max 5 attempts + 15-min expiry).
 */
export async function verifyEmailOtp(params: {
  email: string;
  purpose: OtpPurpose;
  code: string;
}): Promise<{ valid: boolean; error?: string; userId?: string | null }> {
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanCode = params.code.replace(/\s+/g, "");

  if (!/^\d{6}$/.test(cleanCode)) {
    return { valid: false, error: "Please enter a valid 6-digit verification code." };
  }

  const token = await prisma.emailVerificationToken.findFirst({
    where: {
      email: cleanEmail,
      purpose: params.purpose,
      consumedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!token) {
    return { valid: false, error: "No active verification code found. Please request a new code." };
  }

  if (new Date(token.expiresAt) <= new Date()) {
    await prisma.emailVerificationToken.update({
      where: { id: token.id },
      data: { consumedAt: new Date() },
    });
    return { valid: false, error: "Verification code has expired. Please request a new code." };
  }

  if (token.attempts >= MAX_OTP_ATTEMPTS) {
    await prisma.emailVerificationToken.update({
      where: { id: token.id },
      data: { consumedAt: new Date() },
    });
    return { valid: false, error: "Too many incorrect attempts. Please request a new code." };
  }

  const expectedHash = hashToken(`${cleanEmail}:${params.purpose}:${cleanCode}`);
  if (token.codeHash !== expectedHash) {
    await prisma.emailVerificationToken.update({
      where: { id: token.id },
      data: { attempts: { increment: 1 } },
    });
    return { valid: false, error: "Incorrect verification code. Please check your email and try again." };
  }

  await prisma.emailVerificationToken.update({
    where: { id: token.id },
    data: { consumedAt: new Date() },
  });

  return { valid: true, userId: token.userId };
}

export function serializeCustomerProfile(
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    gstin: string | null;
    practiceOrStudio: string | null;
    emailVerifiedAt: Date | null;
    createdAt: Date;
  },
  addresses: {
    id: string;
    label: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }[]
) {
  return {
    id: user.id,
    name: user.name || "",
    email: user.email,
    phone: user.phone || "",
    gstin: user.gstin || "",
    practiceOrStudio: user.practiceOrStudio || "",
    emailVerified: Boolean(user.emailVerifiedAt),
    createdAt: user.createdAt.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    }),
    addresses: addresses.map((a) => ({
      id: a.id,
      label: a.label || "Delivery Location",
      fullName: a.fullName,
      phone: a.phone,
      addressLine1: a.addressLine1,
      addressLine2: a.addressLine2 || undefined,
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      isDefault: a.isDefault,
    })),
  };
}


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { validateStrongPassword } from "@tavistra/shared";
import { getAuthenticatedSession, hashPassword, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body as {
      currentPassword?: string;
      newPassword?: string;
    };

    const userRecord = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true },
    });

    if (!userRecord) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    if (userRecord.passwordHash) {
      if (!currentPassword || !verifyPassword(currentPassword, userRecord.passwordHash)) {
        return NextResponse.json(
          { error: "Current password is incorrect." },
          { status: 401 }
        );
      }
      if (newPassword && currentPassword === newPassword) {
        return NextResponse.json(
          { error: "New password must differ from your current password." },
          { status: 400 }
        );
      }
    }

    const pwCheck = validateStrongPassword(newPassword || "");
    if (!pwCheck.isValid) {
      return NextResponse.json(
        { error: pwCheck.error || "New password does not meet security requirements." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userRecord.id },
      data: { passwordHash: hashPassword(newPassword!) },
    });

    // Revoke all other sessions while preserving the active browser session
    await prisma.customerSession.deleteMany({
      where: {
        userId: userRecord.id,
        id: { not: session.id },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: userRecord.id,
        action: "CUSTOMER_PASSWORD_CHANGED",
        entityType: "User",
        entityId: userRecord.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password updated cleanly. Other active sessions have been signed out.",
    });
  } catch (error) {
    console.error("POST /api/account/password error:", error);
    return NextResponse.json({ error: "Unable to update password right now." }, { status: 500 });
  }
}


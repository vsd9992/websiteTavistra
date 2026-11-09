import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";

export async function GET() {
  try {
    const settingsList = await prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    });

    const settingsMap: Record<string, string> = {};
    for (const s of settingsList) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json({
      settings: settingsMap,
      raw: settingsList,
      maintenanceMode: settingsMap["MAINTENANCE_MODE"] === "true",
      studioHiatus: settingsMap["STUDIO_HIATUS"] === "true",
      announcementBanner:
        settingsMap["ANNOUNCEMENT_BANNER"] ||
        "Studio craftsmanship running normally. All editions dispatched on schedule.",
    });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, description, staffName } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "key and value are required" }, { status: 400 });
    }

    const updated = await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value: String(value),
        ...(description ? { description } : {}),
      },
      create: {
        key,
        value: String(value),
        description: description || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "SYSTEM_SETTING_UPDATE",
        entityType: "SystemSetting",
        entityId: key,
        payloadJson: JSON.stringify({
          key,
          value: String(value),
          staff: staffName || "Admin Staff",
        }),
      },
    });

    return NextResponse.json({ success: true, setting: updated });
  } catch (error) {
    console.error("PATCH /api/admin/settings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


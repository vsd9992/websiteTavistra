import { NextResponse } from "next/server";
import { prisma } from "@tavistra/db";

export async function GET() {
  try {
    const settingsList = await prisma.systemSetting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settingsList) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json({
      maintenanceMode: settingsMap["MAINTENANCE_MODE"] === "true",
      studioHiatus: settingsMap["STUDIO_HIATUS"] === "true",
      announcementBanner:
        settingsMap["ANNOUNCEMENT_BANNER"] ||
        "Studio craftsmanship running normally. All editions dispatched on schedule.",
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    // Graceful default if DB is momentarily unreachable
    return NextResponse.json({
      maintenanceMode: false,
      studioHiatus: false,
      announcementBanner: "Studio craftsmanship running normally. All editions dispatched on schedule.",
    });
  }
}


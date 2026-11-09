import { NextRequest, NextResponse } from "next/server";
import {
  parseProductMarkdown,
  importProductToDatabase,
  syncAllMarkdownEditionsFromDisk,
} from "@/lib/markdownImporter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { syncFromDocs, markdownContent, staffName = "Admin Staff" } = body;

    // Mode 1: Bulk Sync from docs/products
    if (syncFromDocs) {
      const result = await syncAllMarkdownEditionsFromDisk(staffName);
      return NextResponse.json({ success: true, ...result });
    }

    // Mode 2: Single Markdown Specification Upload / Paste
    if (markdownContent) {
      const parsed = parseProductMarkdown(markdownContent);
      const imported = await importProductToDatabase(parsed, staffName);
      return NextResponse.json({
        success: true,
        product: imported.product,
        variant: imported.variant,
      });
    }

    return NextResponse.json(
      { error: "Either syncFromDocs: true or markdownContent string must be provided" },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("POST /api/admin/catalogue/import error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to parse and import markdown specification" },
      { status: 400 }
    );
  }
}


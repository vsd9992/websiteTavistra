import { NextRequest, NextResponse } from "next/server";
import {
  parseProductMarkdown,
  importProductToDatabase,
  importProductZipPackage,
  syncAllMarkdownEditionsFromDisk,
} from "@/lib/markdownImporter";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Mode 1: Multipart form-data (.zip file upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const staffName = (formData.get("staffName") as string) || "Admin Staff";

      if (!file) {
        return NextResponse.json(
          { error: "No file provided in form-data ('file' field required)." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.name.toLowerCase().endsWith(".zip")) {
        const result = await importProductZipPackage(buffer, staffName);
        return NextResponse.json({
          mode: "ZIP_PACKAGE",
          ...result,
        });
      } else if (file.name.toLowerCase().endsWith(".md")) {
        const text = buffer.toString("utf-8");
        const parsed = parseProductMarkdown(text);
        const imported = await importProductToDatabase(parsed, staffName);
        return NextResponse.json({
          success: true,
          mode: "SINGLE_MARKDOWN",
          product: imported.product,
          variants: imported.variants,
        });
      }

      return NextResponse.json(
        { error: "Unsupported file type. Please upload a .zip product package or a .md file." },
        { status: 400 }
      );
    }

    // Mode 2: JSON payload
    const body = await request.json();
    const { syncFromDocs, markdownContent, staffName = "Admin Staff" } = body;

    // 2A: Bulk Sync from docs/products
    if (syncFromDocs) {
      const result = await syncAllMarkdownEditionsFromDisk(staffName);
      return NextResponse.json({ success: true, ...result });
    }

    // 2B: Single Markdown Specification Upload / Paste
    if (markdownContent) {
      const parsed = parseProductMarkdown(markdownContent);
      const imported = await importProductToDatabase(parsed, staffName);
      return NextResponse.json({
        success: true,
        product: imported.product,
        variants: imported.variants,
      });
    }

    return NextResponse.json(
      { error: "Either syncFromDocs: true, markdownContent string, or multipart file must be provided." },
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

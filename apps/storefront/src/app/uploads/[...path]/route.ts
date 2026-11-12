import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getStorageUploadsDir } from "@/lib/markdownImporter";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Prevent directory traversal attacks
    const relativePath = pathSegments.join("/");
    if (relativePath.includes("..")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const uploadsBase = getStorageUploadsDir();
    const filePath = path.join(uploadsBase, relativePath);

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".gif": "image/gif",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Error serving uploaded media:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}


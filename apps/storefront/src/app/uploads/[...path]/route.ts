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
    let filePath = path.join(uploadsBase, relativePath);

    // If file does not exist in storage uploads, check fallback in docs/products/<slug>/images/
    if (!fs.existsSync(/*turbopackIgnore: true*/ filePath) || !fs.statSync(/*turbopackIgnore: true*/ filePath).isFile()) {
      if (pathSegments[0] === "products" && pathSegments.length >= 3) {
        const productSlug = pathSegments[1];
        const filename = pathSegments.slice(2).join("/");

        const candidateFallbacks = [
          path.resolve(process.cwd(), "../../docs/products", productSlug, "images", filename),
          path.resolve(process.cwd(), "docs/products", productSlug, "images", filename),
          path.resolve(process.cwd(), "../../docs/products", productSlug, filename),
          path.resolve(process.cwd(), "docs/products", productSlug, filename),
        ];

        let foundFallback: string | null = null;
        for (const candidate of candidateFallbacks) {
          if (fs.existsSync(/*turbopackIgnore: true*/ candidate) && fs.statSync(/*turbopackIgnore: true*/ candidate).isFile()) {
            foundFallback = candidate;
            break;
          }
        }

        if (foundFallback) {
          filePath = foundFallback;
          // Optionally cache to uploads storage
          try {
            const destDir = path.dirname(path.join(uploadsBase, relativePath));
            fs.mkdirSync(destDir, { recursive: true });
            fs.copyFileSync(foundFallback, path.join(uploadsBase, relativePath));
          } catch {
            // Ignore cache copy error
          }
        }
      }
    }

    if (!fs.existsSync(/*turbopackIgnore: true*/ filePath) || !fs.statSync(/*turbopackIgnore: true*/ filePath).isFile()) {
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
    const fileBuffer = fs.readFileSync(/*turbopackIgnore: true*/ filePath);

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

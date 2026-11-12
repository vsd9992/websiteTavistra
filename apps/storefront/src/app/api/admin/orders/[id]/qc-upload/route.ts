import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@tavistra/db";
import { getStorageUploadsDir } from "@/lib/markdownImporter";

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB per QC photo

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id.toUpperCase() }],
      },
      select: { id: true, orderNumber: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Please attach at least one image file (.jpg, .jpeg, .png, .webp)." },
        { status: 400 }
      );
    }

    const uploadsDir = getStorageUploadsDir();
    const orderQcDir = path.join(uploadsDir, "qc", order.orderNumber);
    fs.mkdirSync(orderQcDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = path.extname(file.name || "").toLowerCase() || ".jpg";
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json(
          { error: `Unsupported file type (${ext}). Only .jpg, .jpeg, .png, and .webp are allowed.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the 8 MB limit per QC photo.` },
          { status: 400 }
        );
      }

      const safeBase = path
        .basename(file.name, ext)
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .slice(0, 40) || `qc-${i + 1}`;
      const filename = `${Date.now()}-${i + 1}-${safeBase}${ext}`;
      const destPath = path.join(orderQcDir, filename);

      const arrayBuffer = await file.arrayBuffer();
      fs.writeFileSync(destPath, Buffer.from(arrayBuffer));

      uploadedUrls.push(`/uploads/qc/${order.orderNumber}/${filename}`);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
    });
  } catch (error) {
    console.error("POST /api/admin/orders/[id]/qc-upload error:", error);
    return NextResponse.json({ error: "Failed to upload workshop QC photos." }, { status: 500 });
  }
}

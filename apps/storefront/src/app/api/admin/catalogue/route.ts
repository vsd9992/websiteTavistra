import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: {
          include: {
            inventoryLedger: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const items = products.map((p) => {
      const primaryVariant = p.variants[0];
      const availableStock = primaryVariant?.inventoryLedger?.availableStock ?? 0;
      const reservedStock = primaryVariant?.inventoryLedger?.reservedStock ?? 0;

      return {
        id: p.id,
        slug: p.slug,
        sku: p.sku,
        name: p.title,
        category: p.category.name,
        categorySlug: p.category.slug,
        mode: p.primaryMode,
        priceRupees: Number(p.taxInclusivePrice),
        availableStock,
        reservedStock,
        isPublished: p.isPublished,
        shortDescription: p.shortDescription,
        fullDescription: p.fullDescription,
        materials: p.materialDescription.split(",").map((m) => m.trim()),
        dimensions: p.dimensions,
        weightGrams: p.weightGrams,
        packedWeightKg: Math.round((p.weightGrams / 1000 + 0.4) * 10) / 10,
        packedVolumetricKg: Math.round(((p.lengthMm * p.widthMm * p.heightMm) / 5000000) * 10) / 10,
        returnPolicy: p.isReturnable
          ? `${p.returnWindowDays || 7}-Day Return Guarantee`
          : "Crafted to Order / Non-returnable",
        markdownFile: `docs/products/${p.slug}.md`,
      };
    });

    return NextResponse.json({ catalogue: items });
  } catch (error) {
    console.error("GET /api/admin/catalogue error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isPublished, priceRupees, fullDescription, staffName } = body;

    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    const updateData: {
      isPublished?: boolean;
      taxInclusivePrice?: number;
      fullDescription?: string;
    } = {};

    if (typeof isPublished === "boolean") {
      updateData.isPublished = isPublished;
    }
    if (typeof priceRupees === "number") {
      updateData.taxInclusivePrice = priceRupees;
    }
    if (typeof fullDescription === "string") {
      updateData.fullDescription = fullDescription;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    // Immutable audit record
    await prisma.auditLog.create({
      data: {
        action: typeof isPublished === "boolean" ? "CATALOGUE_PUBLISH_TOGGLE" : "CATALOGUE_SPEC_UPDATE",
        entityType: "Product",
        entityId: updated.slug,
        payloadJson: JSON.stringify({
          updatedFields: updateData,
          staff: staffName || "Admin Staff",
        }),
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("PATCH /api/admin/catalogue error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


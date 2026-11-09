import { NextResponse } from "next/server";
import { prisma } from "@tavistra/db";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isPublished: true,
      },
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

      return {
        id: p.id,
        slug: p.slug,
        sku: p.sku,
        name: p.title,
        categorySlug: p.category.slug,
        categoryName: p.category.name,
        mode: p.primaryMode,
        pricePaise: Math.round(Number(p.taxInclusivePrice) * 100),
        shortDescription: p.shortDescription,
        fullDescription: p.fullDescription,
        materials: p.materialDescription.split(",").map((m) => m.trim()),
        dimensions: p.dimensions,
        weightGrams: p.weightGrams,
        lengthMm: p.lengthMm,
        widthMm: p.widthMm,
        heightMm: p.heightMm,
        estimatedLeadTime:
          p.primaryMode === "READY_STOCK"
            ? "Dispatches in 24–48 hours"
            : "Handcrafted to order — 3 to 4 weeks workshop lead time",
        returnPolicyText: p.isReturnable
          ? `${p.returnWindowDays || 7}-Day Return Guarantee eligible`
          : "Crafted to Order / Non-returnable",
        features: [
          `Dimensions: ${p.dimensions}`,
          `Craft Material: ${p.materialDescription}`,
          p.primaryMode === "READY_STOCK"
            ? `Ready stock (${availableStock} units allocated)`
            : "Made to order with 25% production advance",
        ],
      };
    });

    return NextResponse.json({ products: items });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


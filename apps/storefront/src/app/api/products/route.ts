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
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          where: { isPublished: true },
          include: {
            inventoryLedger: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const items = products.map((p) => {
      const primaryVariant = p.variants[0];
      const availableStock = p.variants.reduce(
        (sum, v) => sum + (v.inventoryLedger?.availableStock ?? 0),
        0
      );

      const variantPrices = p.variants.map((v) => Number(v.taxInclusivePrice));
      const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : Number(p.taxInclusivePrice);
      const maxPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : Number(p.taxInclusivePrice);
      const isVariablePrice = minPrice !== maxPrice;

      const primaryImage = p.images.find((img) => img.isPrimary) || p.images[0];

      return {
        id: p.id,
        slug: p.slug,
        sku: p.sku,
        name: p.title,
        categorySlug: p.category.slug,
        categoryName: p.category.name,
        subcategory: p.subcategory || null,
        productType: p.productType || null,
        mode: p.primaryMode,
        pricePaise: Math.round(Number(p.taxInclusivePrice) * 100),
        minPricePaise: Math.round(minPrice * 100),
        maxPricePaise: Math.round(maxPrice * 100),
        isVariablePrice,
        priceLabel: isVariablePrice ? `From ₹${minPrice.toLocaleString("en-IN")}` : `₹${Number(p.taxInclusivePrice).toLocaleString("en-IN")}`,
        primaryImageUrl: primaryImage ? primaryImage.url : null,
        images: p.images.map((img) => ({
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary,
        })),
        variants: p.variants.map((v) => {
          let variantImages: { url: string; altText?: string; isPrimary?: boolean }[] | undefined;
          if (v.imageUrls) {
            try {
              const arr = JSON.parse(v.imageUrls);
              if (Array.isArray(arr) && arr.length > 0) {
                variantImages = arr.map((u: string, idx: number) => ({
                  url: u,
                  altText: `${v.title} view ${idx + 1}`,
                  isPrimary: idx === 0,
                }));
              }
            } catch {}
          }
          if (!variantImages && v.imageUrl) {
            variantImages = [{ url: v.imageUrl, altText: v.title, isPrimary: true }];
          }

          return {
            id: v.id,
            sku: v.sku,
            title: v.title,
            materialFinish: v.materialFinish,
            color: v.color,
            imageUrl: v.imageUrl,
            images: variantImages,
            pricePaise: Math.round(Number(v.taxInclusivePrice) * 100),
            stock: v.inventoryLedger?.availableStock ?? 0,
            description: v.description,
            dimensions: v.dimensions,
            weightGrams: v.weightGrams,
          };
        }),
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
            ? `Ready stock (${availableStock} units allocated across editions)`
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

import { prisma } from "@tavistra/db";
import { MOCK_PRODUCTS, MockProduct } from "./products";

export async function getPublishedProducts(): Promise<MockProduct[]> {
  try {
    const dbProducts = await prisma.product.findMany({
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

    if (dbProducts && dbProducts.length > 0) {
      return dbProducts.map((p) => {
        const primaryVariant = p.variants[0];
        const availableStock = primaryVariant?.inventoryLedger?.availableStock ?? 0;

        // Try to match existing subcategory from mock or derive from category
        const mockMatch = MOCK_PRODUCTS.find((m) => m.slug === p.slug);
        const subcategory = mockMatch?.subcategory || p.category.name;

        return {
          id: p.id,
          slug: p.slug,
          name: p.title,
          categorySlug: p.category.slug,
          categoryName: p.category.name,
          subcategory,
          mode: p.primaryMode as MockProduct["mode"],
          pricePaise: Math.round(Number(p.taxInclusivePrice) * 100),
          shortDescription: p.shortDescription,
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
    }
  } catch (error) {
    console.warn("Database product query fallback to mock products:", error);
  }

  return MOCK_PRODUCTS;
}

export async function getPublishedProductBySlug(slug: string): Promise<MockProduct | null> {
  try {
    const p = await prisma.product.findFirst({
      where: {
        slug,
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
    });

    if (p) {
      const primaryVariant = p.variants[0];
      const availableStock = primaryVariant?.inventoryLedger?.availableStock ?? 0;
      const mockMatch = MOCK_PRODUCTS.find((m) => m.slug === p.slug);
      const subcategory = mockMatch?.subcategory || p.category.name;

      return {
        id: p.id,
        slug: p.slug,
        name: p.title,
        categorySlug: p.category.slug,
        categoryName: p.category.name,
        subcategory,
        mode: p.primaryMode as MockProduct["mode"],
        pricePaise: Math.round(Number(p.taxInclusivePrice) * 100),
        shortDescription: p.shortDescription,
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
    }
  } catch (error) {
    console.warn("Database single product query fallback:", error);
  }

  const fallback = MOCK_PRODUCTS.find((p) => p.slug === slug);
  return fallback || null;
}


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

    if (dbProducts && dbProducts.length > 0) {
      return dbProducts.map((p) => {
        const availableStock = p.variants.reduce(
          (sum, v) => sum + (v.inventoryLedger?.availableStock ?? 0),
          0
        );

        const variantPrices = p.variants.map((v) => Number(v.taxInclusivePrice));
        const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : Number(p.taxInclusivePrice);
        const maxPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : Number(p.taxInclusivePrice);
        const isVariablePrice = minPrice !== maxPrice;

        const primaryImage = p.images.find((img) => img.isPrimary) || p.images[0];

        // Subcategory resolution
        const subcategory = p.subcategory || p.category.name;

        return {
          id: p.id,
          slug: p.slug,
          sku: p.sku,
          name: p.title,
          categorySlug: p.category.slug,
          categoryName: p.category.name,
          subcategory,
          productType: p.productType || undefined,
          mode: p.primaryMode as MockProduct["mode"],
          pricePaise: Math.round(Number(p.taxInclusivePrice) * 100),
          minPricePaise: Math.round(minPrice * 100),
          maxPricePaise: Math.round(maxPrice * 100),
          isVariablePrice,
          priceLabel: isVariablePrice
            ? `From ₹${minPrice.toLocaleString("en-IN")}`
            : `₹${Number(p.taxInclusivePrice).toLocaleString("en-IN")}`,
          primaryImageUrl: primaryImage ? primaryImage.url : null,
          images: p.images.map((img) => ({
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary,
          })),
          variants: p.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            title: v.title,
            materialFinish: v.materialFinish,
            color: v.color,
            imageUrl: v.imageUrl,
            pricePaise: Math.round(Number(v.taxInclusivePrice) * 100),
            stock: v.inventoryLedger?.availableStock ?? 0,
          })),
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
    });

    if (p) {
      const availableStock = p.variants.reduce(
        (sum, v) => sum + (v.inventoryLedger?.availableStock ?? 0),
        0
      );

      const variantPrices = p.variants.map((v) => Number(v.taxInclusivePrice));
      const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : Number(p.taxInclusivePrice);
      const maxPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : Number(p.taxInclusivePrice);
      const isVariablePrice = minPrice !== maxPrice;

      const primaryImage = p.images.find((img) => img.isPrimary) || p.images[0];
      const subcategory = p.subcategory || p.category.name;

      return {
        id: p.id,
        slug: p.slug,
        sku: p.sku,
        name: p.title,
        categorySlug: p.category.slug,
        categoryName: p.category.name,
        subcategory,
        productType: p.productType || undefined,
        mode: p.primaryMode as MockProduct["mode"],
        pricePaise: Math.round(Number(p.taxInclusivePrice) * 100),
        minPricePaise: Math.round(minPrice * 100),
        maxPricePaise: Math.round(maxPrice * 100),
        isVariablePrice,
        priceLabel: isVariablePrice
          ? `From ₹${minPrice.toLocaleString("en-IN")}`
          : `₹${Number(p.taxInclusivePrice).toLocaleString("en-IN")}`,
        primaryImageUrl: primaryImage ? primaryImage.url : null,
        images: p.images.map((img) => ({
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary,
        })),
        variants: p.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          title: v.title,
          materialFinish: v.materialFinish,
          color: v.color,
          imageUrl: v.imageUrl,
          pricePaise: Math.round(Number(v.taxInclusivePrice) * 100),
          stock: v.inventoryLedger?.availableStock ?? 0,
        })),
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
    }
  } catch (error) {
    console.warn("Database single product query fallback:", error);
  }

  const fallback = MOCK_PRODUCTS.find((p) => p.slug === slug);
  return fallback || null;
}

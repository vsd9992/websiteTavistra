import fs from "fs";
import path from "path";
import { prisma } from "@tavistra/db";
import { MOCK_PRODUCTS, MockProduct } from "./products";
import {
  parseProductMarkdown,
  importProductToDatabase,
  getStorageUploadsDir,
} from "./markdownImporter";

export function findProductMarkdownPath(slug: string): string | null {
  const candidatePaths = [
    path.resolve(process.cwd(), "../../docs/products", slug, `${slug}.md`),
    path.resolve(process.cwd(), "docs/products", slug, `${slug}.md`),
    path.resolve(process.cwd(), "../docs/products", slug, `${slug}.md`),
    path.resolve("/home/vishnu/deployments/websiteTavistra/docs/products", slug, `${slug}.md`),
  ];
  for (const candidate of candidatePaths) {
    if (fs.existsSync(/*turbopackIgnore: true*/ candidate)) {
      return candidate;
    }
  }
  return null;
}

export function findDocsProductsDir(): string | null {
  const candidateDirs = [
    path.resolve(process.cwd(), "../../docs/products"),
    path.resolve(process.cwd(), "docs/products"),
    path.resolve(process.cwd(), "../docs/products"),
    path.resolve("/home/vishnu/deployments/websiteTavistra/docs/products"),
  ];
  for (const dir of candidateDirs) {
    if (fs.existsSync(/*turbopackIgnore: true*/ dir)) {
      return dir;
    }
  }
  return null;
}

/**
 * Checks if markdown file for a slug exists and is newer than DB record.
 * If newer or missing from DB, imports into PostgreSQL immediately.
 */
export async function syncProductMarkdownIfUpdated(slug: string, dbProductUpdatedAt?: Date) {
  try {
    const mdPath = findProductMarkdownPath(slug);
    if (!mdPath) return null;

    const stat = fs.statSync(/*turbopackIgnore: true*/ mdPath);
    const isNewer = !dbProductUpdatedAt || stat.mtimeMs > dbProductUpdatedAt.getTime();

    if (isNewer) {
      const content = fs.readFileSync(/*turbopackIgnore: true*/ mdPath, "utf-8");
      const parsed = parseProductMarkdown(content);

      // Copy images to uploads storage if present
      const folderPath = path.dirname(mdPath);
      const imagesFolder = path.join(folderPath, "images");
      if (fs.existsSync(/*turbopackIgnore: true*/ imagesFolder)) {
        try {
          const uploadsBase = getStorageUploadsDir();
          const productMediaDir = path.join(uploadsBase, "products", parsed.slug);
          fs.mkdirSync(productMediaDir, { recursive: true });

          const imageFiles = fs.readdirSync(/*turbopackIgnore: true*/ imagesFolder);
          for (const img of imageFiles) {
            fs.copyFileSync(path.join(imagesFolder, img), path.join(productMediaDir, img));
          }
        } catch {}
      }

      await importProductToDatabase(parsed, "Live Markdown Reader");
      return parsed;
    }
  } catch (err) {
    console.warn(`[catalogueService] Markdown sync check failed for ${slug}:`, err);
  }
  return null;
}

/**
 * Syncs any markdown product files that are newer than their DB records across all products.
 */
let lastGlobalSyncCheck = 0;
export async function syncAllProductsIfUpdated() {
  const now = typeof performance !== "undefined" ? performance.now() : 0;
  // Throttle check to at most once every 2 seconds
  if (lastGlobalSyncCheck && now - lastGlobalSyncCheck < 2000) return;
  lastGlobalSyncCheck = now;

  try {
    const docsDir = findDocsProductsDir();
    if (!docsDir) return;

    const entries = fs.readdirSync(/*turbopackIgnore: true*/ docsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const slug = entry.name;
      const mdPath = path.join(docsDir, slug, `${slug}.md`);
      if (fs.existsSync(/*turbopackIgnore: true*/ mdPath)) {
        const stat = fs.statSync(/*turbopackIgnore: true*/ mdPath);
        const existing = await prisma.product.findFirst({
          where: { slug },
          select: { updatedAt: true },
        });
        if (!existing || stat.mtimeMs > existing.updatedAt.getTime()) {
          const content = fs.readFileSync(/*turbopackIgnore: true*/ mdPath, "utf-8");
          const parsed = parseProductMarkdown(content);

          const imagesFolder = path.join(docsDir, slug, "images");
          if (fs.existsSync(/*turbopackIgnore: true*/ imagesFolder)) {
            try {
              const uploadsBase = getStorageUploadsDir();
              const productMediaDir = path.join(uploadsBase, "products", parsed.slug);
              fs.mkdirSync(productMediaDir, { recursive: true });

              const imageFiles = fs.readdirSync(/*turbopackIgnore: true*/ imagesFolder);
              for (const img of imageFiles) {
                fs.copyFileSync(path.join(imagesFolder, img), path.join(productMediaDir, img));
              }
            } catch {}
          }

          await importProductToDatabase(parsed, "Global Markdown Sync");
        }
      }
    }
  } catch (err) {
    console.warn("[catalogueService] Global sync failed:", err);
  }
}

export async function getPublishedProducts(): Promise<MockProduct[]> {
  try {
    await syncAllProductsIfUpdated();

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
        const subcategory = p.subcategory || p.category.name;

        const isReturnEligible =
          Boolean(p.isReturnable) && typeof p.returnWindowDays === "number" && p.returnWindowDays > 0;

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
              materialFinish: v.materialFinish || p.materialDescription,
              color: v.color,
              imageUrl: v.imageUrl,
              images: variantImages,
              pricePaise: Math.round(Number(v.taxInclusivePrice) * 100),
              stock: v.inventoryLedger?.availableStock ?? 0,
              description: v.description,
              dimensions: v.dimensions,
              weightGrams: v.weightGrams,
              lengthMm: v.lengthMm,
              widthMm: v.widthMm,
              heightMm: v.heightMm,
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
          returnPolicyText: isReturnEligible
            ? `${p.returnWindowDays}-Day Return Guarantee eligible`
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
    // 1. Check if markdown file on disk is newer and sync if needed
    const existing = await prisma.product.findFirst({
      where: { slug },
      select: { updatedAt: true },
    });
    await syncProductMarkdownIfUpdated(slug, existing?.updatedAt);

    // 2. Query freshly updated DB record
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

      // Extract highlights from markdown if file exists
      let markdownFeatures: string[] | undefined;
      const mdPath = findProductMarkdownPath(slug);
      if (mdPath) {
        try {
          const content = fs.readFileSync(/*turbopackIgnore: true*/ mdPath, "utf-8");
          const parsed = parseProductMarkdown(content);
          if (parsed.features && parsed.features.length > 0) {
            markdownFeatures = parsed.features;
          }
        } catch {}
      }

      const isReturnEligible =
        Boolean(p.isReturnable) && typeof p.returnWindowDays === "number" && p.returnWindowDays > 0;

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
            materialFinish: v.materialFinish || p.materialDescription,
            color: v.color,
            imageUrl: v.imageUrl,
            images: variantImages,
            pricePaise: Math.round(Number(v.taxInclusivePrice) * 100),
            stock: v.inventoryLedger?.availableStock ?? 0,
            description: v.description,
            dimensions: v.dimensions,
            weightGrams: v.weightGrams,
            lengthMm: v.lengthMm,
            widthMm: v.widthMm,
            heightMm: v.heightMm,
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
        returnPolicyText: isReturnEligible
          ? `${p.returnWindowDays}-Day Return Guarantee eligible`
          : "Crafted to Order / Non-returnable",
        features: markdownFeatures || [
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

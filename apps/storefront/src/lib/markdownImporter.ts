import fs from "fs";
import path from "path";
import * as yaml from "js-yaml";
import { prisma, PurchaseMode, Prisma } from "@tavistra/db";

export interface MarkdownVariantInput {
  sku: string;
  title: string;
  materialFinish?: string;
  color?: string;
  taxInclusivePrice: number;
  initialStock?: number;
  image?: string; // relative filename e.g. "images/smoked-oak.jpg" or "smoked-oak.jpg"
  images?: (string | MarkdownImageInput)[]; // gallery images specific to this variant
  description?: string;
  dimensions?: string;
  weightGrams?: number;
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  isPublished?: boolean;
}

export interface MarkdownImageInput {
  src: string; // relative filename e.g. "images/01-hero.jpg" or "01-hero.jpg"
  altText?: string;
  isPrimary?: boolean;
}

export interface ParsedMarkdownProduct {
  sku: string;
  slug: string;
  title: string;
  categorySlug: string;
  subcategory?: string;
  productType?: string;
  primaryMode: PurchaseMode;
  taxInclusivePrice: number;
  gstRate: number;
  weightGrams: number;
  dimensions: string;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  isReturnable: boolean;
  returnWindowDays: number | null;
  materialDescription: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  careInstructions?: string;
  isPublished: boolean;
  images: MarkdownImageInput[];
  variants: MarkdownVariantInput[];
}

/**
 * Returns the persistent storage directory on disk for media uploads.
 */
export function getStorageUploadsDir(): string {
  const custom = process.env.TAVISTRA_STORAGE_DIR;
  if (custom && custom.trim()) {
    return path.resolve(custom.trim(), "uploads");
  }

  // Check if deployed in standard Linux path
  const linuxPath = "/home/vishnu/deployments/websiteTavistra/storage/uploads";
  if (fs.existsSync(linuxPath)) {
    return linuxPath;
  }

  // Local repository path
  const localRepoPath = path.resolve(process.cwd(), "../../storage/uploads");
  if (fs.existsSync(path.dirname(localRepoPath))) {
    return localRepoPath;
  }

  const fallback = path.resolve(process.cwd(), "storage/uploads");
  fs.mkdirSync(fallback, { recursive: true });
  return fallback;
}

/**
 * Parses a master Markdown document with YAML frontmatter + markdown body sections.
 */
export function parseProductMarkdown(content: string): ParsedMarkdownProduct {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    throw new Error("Invalid product markdown: Document must begin with '---' YAML frontmatter headers.");
  }

  const rawFrontmatter = frontmatterMatch[1];
  const markdownBody = frontmatterMatch[2].trim();

  // Parse YAML with js-yaml
  let doc: Record<string, any>;
  try {
    doc = (yaml.load(rawFrontmatter) as Record<string, any>) || {};
  } catch (err) {
    throw new Error(`YAML syntax error in product frontmatter: ${(err as Error).message}`);
  }

  const sku = String(doc.sku || "").trim();
  const slug = String(doc.slug || "").trim();
  const title = String(doc.title || "").trim();
  const categorySlug = String(doc.category || doc.categorySlug || "").trim();

  if (!sku || !slug || !title || !categorySlug) {
    throw new Error(
      `Missing required frontmatter: 'sku', 'slug', 'title', and 'category' are required. Found: ${JSON.stringify({
        sku,
        slug,
        title,
        categorySlug,
      })}`
    );
  }

  // Parse markdown body sections
  const lines = markdownBody.split(/\r?\n/);
  let shortDescription = "";
  let fullDescription = "";
  let careInstructions = "";
  const features: string[] = [];

  let currentSection: "intro" | "full" | "highlights" | "care" = "intro";

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      continue;
    } else if (trimmed.toLowerCase().includes("## full description")) {
      currentSection = "full";
      continue;
    } else if (trimmed.toLowerCase().includes("## highlights")) {
      currentSection = "highlights";
      continue;
    } else if (trimmed.toLowerCase().includes("## care") || trimmed.toLowerCase().includes("## maintenance")) {
      currentSection = "care";
      continue;
    }

    if (currentSection === "intro" && trimmed) {
      shortDescription += (shortDescription ? " " : "") + trimmed;
    } else if (currentSection === "full" && trimmed) {
      fullDescription += (fullDescription ? "\n\n" : "") + trimmed;
    } else if (currentSection === "care" && trimmed) {
      careInstructions += (careInstructions ? "\n\n" : "") + trimmed;
    } else if (currentSection === "highlights" && trimmed.startsWith("- ")) {
      features.push(trimmed.slice(2).trim());
    }
  }

  if (!shortDescription && fullDescription) {
    shortDescription = fullDescription.slice(0, 160) + "...";
  }
  if (!fullDescription && shortDescription) {
    fullDescription = shortDescription;
  }

  const primaryModeStr = String(doc.primaryMode || "READY_STOCK").toUpperCase();
  const primaryMode: PurchaseMode =
    primaryModeStr === "MADE_TO_ORDER"
      ? PurchaseMode.MADE_TO_ORDER
      : primaryModeStr === "QUOTE_ONLY"
      ? PurchaseMode.QUOTE_ONLY
      : PurchaseMode.READY_STOCK;

  const basePrice = Number(doc.taxInclusivePrice || 0);

  // Normalize Images
  const rawImages = Array.isArray(doc.images) ? doc.images : [];
  const images: MarkdownImageInput[] = rawImages
    .map((img: any, idx: number) => {
      if (typeof img === "string") {
        return { src: img.trim(), isPrimary: idx === 0 };
      }
      return {
        src: String(img.src || img.url || "").trim(),
        altText: img.altText ? String(img.altText).trim() : undefined,
        isPrimary: Boolean(img.isPrimary || idx === 0),
      };
    })
    .filter((img: MarkdownImageInput) => img.src.length > 0);

  // Normalize Variants with inheritance & override support
  const rawVariants = Array.isArray(doc.variants) ? doc.variants : [];
  let variants: MarkdownVariantInput[] = rawVariants.map((v: any, idx: number) => {
    const vPrice =
      v.taxInclusivePrice !== undefined && v.taxInclusivePrice !== null && v.taxInclusivePrice !== ""
        ? Number(v.taxInclusivePrice)
        : basePrice;

    const vRawImages = Array.isArray(v.images)
      ? v.images
      : v.image
      ? [v.image]
      : [];
    const normalizedVariantImages = vRawImages
      .map((img: any) => {
        if (typeof img === "string") return img.trim();
        return String(img.src || img.url || "").trim();
      })
      .filter((s: string) => s.length > 0);

    return {
      sku: String(v.sku || `${sku}-${String(idx + 1).padStart(2, "0")}`).trim(),
      title: String(v.title || v.name || doc.variantTitle || "Standard Edition").trim(),
      materialFinish: v.materialFinish ? String(v.materialFinish).trim() : undefined,
      color: v.color ? String(v.color).trim() : undefined,
      taxInclusivePrice: vPrice,
      initialStock: Number(v.initialStock ?? v.stock ?? doc.initialStock ?? 0),
      image: normalizedVariantImages[0] || (v.image ? String(v.image).trim() : undefined),
      images: normalizedVariantImages.length > 0 ? normalizedVariantImages : undefined,
      description: v.description ? String(v.description).trim() : undefined,
      dimensions: v.dimensions ? String(v.dimensions).trim() : undefined,
      weightGrams:
        v.weightGrams !== undefined && v.weightGrams !== null && v.weightGrams !== ""
          ? Number(v.weightGrams)
          : undefined,
      lengthMm:
        v.lengthMm !== undefined && v.lengthMm !== null && v.lengthMm !== ""
          ? Number(v.lengthMm)
          : undefined,
      widthMm:
        v.widthMm !== undefined && v.widthMm !== null && v.widthMm !== ""
          ? Number(v.widthMm)
          : undefined,
      heightMm:
        v.heightMm !== undefined && v.heightMm !== null && v.heightMm !== ""
          ? Number(v.heightMm)
          : undefined,
      isPublished: v.isPublished !== false,
    };
  });

  // Fallback to single primary variant if none explicitly defined in frontmatter
  if (variants.length === 0) {
    variants = [
      {
        sku: `${sku}-01`,
        title: String(doc.variantTitle || "Standard Edition").trim(),
        materialFinish: doc.materialDescription ? String(doc.materialDescription).trim() : undefined,
        color: doc.color ? String(doc.color).trim() : undefined,
        taxInclusivePrice: basePrice,
        initialStock: Number(doc.initialStock || 0),
        image: images[0]?.src,
        isPublished: true,
      },
    ];
  }

  return {
    sku,
    slug,
    title,
    categorySlug,
    subcategory: doc.subcategory ? String(doc.subcategory).trim() : undefined,
    productType: doc.productType ? String(doc.productType).trim() : undefined,
    primaryMode,
    taxInclusivePrice: basePrice,
    gstRate: Number(doc.gstRate ?? 0.18),
    weightGrams: Number(doc.weightGrams ?? 1000),
    dimensions: String(doc.dimensions || "Dimensions specified in documentation"),
    lengthMm: Number(doc.lengthMm ?? 100),
    widthMm: Number(doc.widthMm ?? 100),
    heightMm: Number(doc.heightMm ?? 100),
    isReturnable: Boolean(doc.isReturnable),
    returnWindowDays: doc.returnWindowDays ? Number(doc.returnWindowDays) : null,
    materialDescription: String(doc.materialDescription || "Architectural materials"),
    shortDescription,
    fullDescription,
    features,
    careInstructions: careInstructions || undefined,
    isPublished: doc.isPublished !== false,
    images,
    variants,
  };
}

/**
 * Normalizes relative image references to public URLs.
 * e.g. "images/hero.jpg" -> "/uploads/products/<slug>/hero.jpg"
 */
function resolveImageUrl(rawSrc: string, slug: string): string {
  if (rawSrc.startsWith("http://") || rawSrc.startsWith("https://") || rawSrc.startsWith("/uploads/")) {
    return rawSrc;
  }
  const cleanBase = path.basename(rawSrc);
  return `/uploads/products/${slug}/${cleanBase}`;
}

/**
 * Upserts a parsed product into PostgreSQL along with its images, variants, and stock ledgers.
 */
export async function importProductToDatabase(parsed: ParsedMarkdownProduct, staffName: string = "Admin Staff") {
  // 1. Resolve or create Category
  let category = await prisma.category.findUnique({
    where: { slug: parsed.categorySlug },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        slug: parsed.categorySlug,
        name: parsed.categorySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        description: `Curated ${parsed.categorySlug} editions.`,
      },
    });
  }

  // 2. Upsert Product
  const product = await prisma.product.upsert({
    where: { slug: parsed.slug },
    update: {
      sku: parsed.sku,
      title: parsed.title,
      categoryId: category.id,
      subcategory: parsed.subcategory,
      productType: parsed.productType,
      primaryMode: parsed.primaryMode,
      taxInclusivePrice: new Prisma.Decimal(parsed.taxInclusivePrice),
      gstRate: new Prisma.Decimal(parsed.gstRate),
      weightGrams: parsed.weightGrams,
      dimensions: parsed.dimensions,
      lengthMm: parsed.lengthMm,
      widthMm: parsed.widthMm,
      heightMm: parsed.heightMm,
      isReturnable: parsed.isReturnable,
      returnWindowDays: parsed.returnWindowDays,
      shortDescription: parsed.shortDescription,
      fullDescription: parsed.fullDescription,
      materialDescription: parsed.materialDescription,
      isPublished: parsed.isPublished,
    },
    create: {
      sku: parsed.sku,
      slug: parsed.slug,
      title: parsed.title,
      categoryId: category.id,
      subcategory: parsed.subcategory,
      productType: parsed.productType,
      primaryMode: parsed.primaryMode,
      taxInclusivePrice: new Prisma.Decimal(parsed.taxInclusivePrice),
      gstRate: new Prisma.Decimal(parsed.gstRate),
      weightGrams: parsed.weightGrams,
      dimensions: parsed.dimensions,
      lengthMm: parsed.lengthMm,
      widthMm: parsed.widthMm,
      heightMm: parsed.heightMm,
      isReturnable: parsed.isReturnable,
      returnWindowDays: parsed.returnWindowDays,
      shortDescription: parsed.shortDescription,
      fullDescription: parsed.fullDescription,
      materialDescription: parsed.materialDescription,
      isPublished: parsed.isPublished,
    },
  });

  // 3. Upsert Gallery Images
  if (parsed.images.length > 0) {
    // Delete existing product images to cleanly replace gallery with the package specification
    await prisma.productImage.deleteMany({
      where: { productId: product.id },
    });

    for (let i = 0; i < parsed.images.length; i++) {
      const img = parsed.images[i];
      const publicUrl = resolveImageUrl(img.src, product.slug);
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: publicUrl,
          altText: img.altText || `${product.title} view ${i + 1}`,
          sortOrder: i,
          isPrimary: Boolean(img.isPrimary || i === 0),
        },
      });
    }
  }

  // 4. Upsert Variants & Stock Ledgers
  const upsertedVariants = [];
  for (const v of parsed.variants) {
    const rawVariantImgList = v.images && v.images.length > 0 ? v.images : v.image ? [v.image] : [];
    const resolvedVariantImages = rawVariantImgList.map((img) =>
      resolveImageUrl(typeof img === "string" ? img : img.src, product.slug)
    );
    const variantImageUrl = resolvedVariantImages[0] || (v.image ? resolveImageUrl(v.image, product.slug) : undefined);
    const variantImageUrlsJson = resolvedVariantImages.length > 0 ? JSON.stringify(resolvedVariantImages) : null;

    const variantData = {
      title: v.title,
      materialFinish: v.materialFinish || parsed.materialDescription,
      color: v.color,
      imageUrl: variantImageUrl,
      imageUrls: variantImageUrlsJson,
      taxInclusivePrice: new Prisma.Decimal(v.taxInclusivePrice),
      description: v.description || null,
      dimensions: v.dimensions || null,
      weightGrams: v.weightGrams ?? null,
      lengthMm: v.lengthMm ?? null,
      widthMm: v.widthMm ?? null,
      heightMm: v.heightMm ?? null,
      isPublished: v.isPublished !== false,
    };

    const variant = await prisma.productVariant.upsert({
      where: { sku: v.sku },
      update: variantData,
      create: {
        productId: product.id,
        sku: v.sku,
        ...variantData,
      },
    });

    // Initialize or update stock ledger
    if (v.initialStock !== undefined) {
      await prisma.inventoryLedger.upsert({
        where: { variantId: variant.id },
        update: {
          availableStock: v.initialStock,
        },
        create: {
          variantId: variant.id,
          availableStock: v.initialStock,
          reservedStock: 0,
          lowStockThreshold: 2,
        },
      });
    }

    upsertedVariants.push(variant);
  }

  // 4B. Deactivate or delete obsolete variants no longer in the markdown frontmatter
  const incomingSkus = parsed.variants.map((v) => v.sku);
  const obsoleteVariants = await prisma.productVariant.findMany({
    where: {
      productId: product.id,
      sku: { notIn: incomingSkus },
    },
    include: { orderItems: true },
  });

  for (const obs of obsoleteVariants) {
    if (obs.orderItems.length === 0) {
      await prisma.inventoryLedger.deleteMany({ where: { variantId: obs.id } });
      await prisma.productVariant.delete({ where: { id: obs.id } });
    } else {
      await prisma.productVariant.update({
        where: { id: obs.id },
        data: { isPublished: false },
      });
    }
  }

  // 5. Audit Log
  await prisma.auditLog.create({
    data: {
      action: "MARKDOWN_PRODUCT_IMPORT",
      entityType: "Product",
      entityId: product.slug,
      payloadJson: JSON.stringify({
        sku: parsed.sku,
        price: parsed.taxInclusivePrice,
        mode: parsed.primaryMode,
        variantCount: upsertedVariants.length,
        imageCount: parsed.images.length,
        staff: staffName,
      }),
    },
  });

  return { product, variants: upsertedVariants };
}

/**
 * Scans docs/products directory folders and imports all markdown editions.
 * Ignores loose root files; strictly processes isolated product folders:
 * docs/products/<slug>/<slug>.md + docs/products/<slug>/images/*
 */
export async function syncAllMarkdownEditionsFromDisk(staffName: string = "Admin Staff") {
  const docsDir = path.resolve(process.cwd(), "../../docs/products");
  const fallbackDir = path.resolve(process.cwd(), "docs/products");
  const targetDir = fs.existsSync(docsDir) ? docsDir : fallbackDir;

  if (!fs.existsSync(targetDir)) {
    return { count: 0, imported: [], error: `Directory not found: ${targetDir}` };
  }

  const items = fs.readdirSync(targetDir, { withFileTypes: true });
  const importedList = [];

  for (const item of items) {
    // Only process subdirectories (each product is an isolated master folder)
    if (!item.isDirectory()) {
      continue;
    }

    const folderPath = path.join(targetDir, item.name);
    const subFiles = fs.readdirSync(folderPath);
    const mdFile = subFiles.find((f) => f.endsWith(".md"));

    if (mdFile) {
      const content = fs.readFileSync(path.join(folderPath, mdFile), "utf-8");
      try {
        const parsed = parseProductMarkdown(content);

        // Copy images from folder's images/ subfolder to persistent storage if present
        const imagesFolder = path.join(folderPath, "images");
        if (fs.existsSync(imagesFolder)) {
          const uploadsBase = getStorageUploadsDir();
          const productMediaDir = path.join(uploadsBase, "products", parsed.slug);
          fs.mkdirSync(productMediaDir, { recursive: true });

          const imageFiles = fs.readdirSync(imagesFolder);
          for (const img of imageFiles) {
            fs.copyFileSync(path.join(imagesFolder, img), path.join(productMediaDir, img));
          }
        }

        const res = await importProductToDatabase(parsed, staffName);
        importedList.push({
          folder: item.name,
          file: mdFile,
          sku: parsed.sku,
          title: parsed.title,
          status: "SUCCESS",
          id: res.product.id,
          variantCount: res.variants.length,
        });
      } catch (err: unknown) {
        importedList.push({
          folder: item.name,
          file: mdFile,
          status: "ERROR",
          error: (err as Error).message,
        });
      }
    }
  }

  return { count: importedList.length, imported: importedList };
}

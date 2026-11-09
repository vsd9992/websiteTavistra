import fs from "fs";
import path from "path";
import { prisma, PurchaseMode, Prisma } from "@tavistra/db";

export interface ParsedMarkdownProduct {
  sku: string;
  slug: string;
  title: string;
  categorySlug: string;
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
  initialStock: number;
  materialDescription: string;
  variantTitle: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
}

/**
 * Robust YAML Frontmatter + Markdown Body Parser (zero runtime external dependencies)
 */
export function parseProductMarkdown(content: string): ParsedMarkdownProduct {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    throw new Error("Invalid format: Markdown file must contain '---' YAML frontmatter headers");
  }

  const rawFrontmatter = frontmatterMatch[1];
  const markdownBody = frontmatterMatch[2].trim();

  // Parse key-value frontmatter lines
  const meta: Record<string, string> = {};
  for (const line of rawFrontmatter.split(/\r?\n/)) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim().replace(/^['"](.*)['"]$/, "$1");
      meta[key] = val;
    }
  }

  // Mandatory fields check
  const sku = meta.sku;
  const slug = meta.slug;
  const title = meta.title;
  const categorySlug = meta.category;
  if (!sku || !slug || !title || !categorySlug) {
    throw new Error(`Missing mandatory frontmatter: sku, slug, title, and category are required. Got: ${JSON.stringify(meta)}`);
  }

  // Parse Body: Title, Short Description, Full Description, Highlights
  const lines = markdownBody.split(/\r?\n/);
  let shortDescription = "";
  let fullDescription = "";
  const features: string[] = [];

  let currentSection = "intro";
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      // Top heading
      continue;
    } else if (trimmed.toLowerCase().includes("## full description")) {
      currentSection = "full";
      continue;
    } else if (trimmed.toLowerCase().includes("## highlights")) {
      currentSection = "highlights";
      continue;
    }

    if (currentSection === "intro" && trimmed) {
      shortDescription += (shortDescription ? " " : "") + trimmed;
    } else if (currentSection === "full" && trimmed) {
      fullDescription += (fullDescription ? "\n\n" : "") + trimmed;
    } else if (currentSection === "highlights" && trimmed.startsWith("- ")) {
      features.push(trimmed.slice(2).trim());
    }
  }

  if (!shortDescription && fullDescription) {
    shortDescription = fullDescription.slice(0, 150) + "...";
  }
  if (!fullDescription && shortDescription) {
    fullDescription = shortDescription;
  }

  const primaryModeStr = (meta.primaryMode || "READY_STOCK").toUpperCase();
  const primaryMode: PurchaseMode =
    primaryModeStr === "MADE_TO_ORDER"
      ? PurchaseMode.MADE_TO_ORDER
      : primaryModeStr === "QUOTE_ONLY"
      ? PurchaseMode.QUOTE_ONLY
      : PurchaseMode.READY_STOCK;

  return {
    sku,
    slug,
    title,
    categorySlug,
    primaryMode,
    taxInclusivePrice: parseFloat(meta.taxInclusivePrice || "0"),
    gstRate: parseFloat(meta.gstRate || "0.18"),
    weightGrams: parseInt(meta.weightGrams || "1000", 10),
    dimensions: meta.dimensions || "Dimensions specified in documentation",
    lengthMm: parseInt(meta.lengthMm || "100", 10),
    widthMm: parseInt(meta.widthMm || "100", 10),
    heightMm: parseInt(meta.heightMm || "100", 10),
    isReturnable: meta.isReturnable === "true",
    returnWindowDays: meta.returnWindowDays ? parseInt(meta.returnWindowDays, 10) : null,
    initialStock: parseInt(meta.initialStock || "0", 10),
    materialDescription: meta.materialDescription || "Architectural materials",
    variantTitle: meta.variantTitle || "Standard Studio Edition",
    shortDescription,
    fullDescription,
    features,
  };
}

/**
 * Upserts a parsed product into PostgreSQL
 */
export async function importProductToDatabase(parsed: ParsedMarkdownProduct, staffName: string = "Admin Staff") {
  // 1. Resolve or create Category
  let category = await prisma.category.findUnique({
    where: { slug: parsed.categorySlug },
  });

  if (!category) {
    // Graceful creation if not seeded
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
      isPublished: true,
    },
    create: {
      sku: parsed.sku,
      slug: parsed.slug,
      title: parsed.title,
      categoryId: category.id,
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
      isPublished: true,
    },
  });

  // 3. Upsert Primary Variant & Inventory Ledger
  const variant = await prisma.productVariant.upsert({
    where: { sku: `${parsed.sku}-01` },
    update: {
      title: parsed.variantTitle,
      taxInclusivePrice: new Prisma.Decimal(parsed.taxInclusivePrice),
      materialFinish: parsed.materialDescription,
      isPublished: true,
    },
    create: {
      productId: product.id,
      sku: `${parsed.sku}-01`,
      title: parsed.variantTitle,
      taxInclusivePrice: new Prisma.Decimal(parsed.taxInclusivePrice),
      materialFinish: parsed.materialDescription,
      isPublished: true,
    },
  });

  await prisma.inventoryLedger.upsert({
    where: { variantId: variant.id },
    update: {
      availableStock: parsed.initialStock,
    },
    create: {
      variantId: variant.id,
      availableStock: parsed.initialStock,
      reservedStock: 0,
      lowStockThreshold: 2,
    },
  });

  // 4. Audit Log
  await prisma.auditLog.create({
    data: {
      action: "MARKDOWN_PRODUCT_IMPORT",
      entityType: "Product",
      entityId: product.slug,
      payloadJson: JSON.stringify({
        sku: parsed.sku,
        price: parsed.taxInclusivePrice,
        mode: parsed.primaryMode,
        staff: staffName,
      }),
    },
  });

  return { product, variant };
}

/**
 * Scans docs/products directory and imports all markdown editions
 */
export async function syncAllMarkdownEditionsFromDisk(staffName: string = "Admin Staff") {
  const docsDir = path.resolve(process.cwd(), "../../docs/products");
  const fallbackDir = path.resolve(process.cwd(), "docs/products");
  const targetDir = fs.existsSync(docsDir) ? docsDir : fallbackDir;

  if (!fs.existsSync(targetDir)) {
    return { count: 0, imported: [], error: `Directory not found: ${targetDir}` };
  }

  const files = fs.readdirSync(targetDir).filter((f) => f.endsWith(".md"));
  const importedList = [];

  for (const file of files) {
    const fullPath = path.join(targetDir, file);
    const content = fs.readFileSync(fullPath, "utf-8");
    try {
      const parsed = parseProductMarkdown(content);
      const res = await importProductToDatabase(parsed, staffName);
      importedList.push({
        file,
        sku: parsed.sku,
        title: parsed.title,
        status: "SUCCESS",
        id: res.product.id,
      });
    } catch (err: unknown) {
      importedList.push({
        file,
        status: "ERROR",
        error: (err as Error).message,
      });
    }
  }

  return { count: importedList.length, imported: importedList };
}


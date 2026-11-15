import { NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { APPROVED_CATEGORIES } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q || q.length < 2) {
      return NextResponse.json({
        query: q,
        categories: [],
        products: [],
        totalCount: 0,
      });
    }

    const queryLower = q.toLowerCase();

    // 1. Search taxonomy (Categories & Subcategories)
    const matchingTaxonomy: {
      name: string;
      slug: string;
      type: "category" | "subcategory";
      url: string;
    }[] = [];

    for (const cat of APPROVED_CATEGORIES) {
      if (cat.name.toLowerCase().includes(queryLower)) {
        matchingTaxonomy.push({
          name: cat.name,
          slug: cat.slug,
          type: "category",
          url: `/category/${cat.slug}`,
        });
      }
      for (const sub of cat.subcategories) {
        if (sub.toLowerCase().includes(queryLower)) {
          matchingTaxonomy.push({
            name: `${sub} (${cat.name})`,
            slug: cat.slug,
            type: "subcategory",
            url: `/category/${cat.slug}?sub=${encodeURIComponent(sub)}`,
          });
        }
      }
    }

    // Limit taxonomy matches to at most 2
    const categorySuggestions = matchingTaxonomy.slice(0, 2);

    // 2. Search published products in database
    const products = await prisma.product.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { shortDescription: { contains: q, mode: "insensitive" } },
          { fullDescription: { contains: q, mode: "insensitive" } },
          { materialDescription: { contains: q, mode: "insensitive" } },
          { productType: { contains: q, mode: "insensitive" } },
          { subcategory: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
          {
            category: {
              name: { contains: q, mode: "insensitive" },
            },
          },
        ],
      },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          where: { isPublished: true },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const totalCount = products.length;

    // Remaining slots for products (cap total suggestions at 6 as mandated by WEB-039)
    const maxProductSuggestions = Math.max(1, 6 - categorySuggestions.length);
    const suggestedProducts = products.slice(0, maxProductSuggestions).map((p) => {
      const variantPrices = p.variants.map((v) => Number(v.taxInclusivePrice));
      const minPrice =
        variantPrices.length > 0 ? Math.min(...variantPrices) : Number(p.taxInclusivePrice);
      const maxPrice =
        variantPrices.length > 0 ? Math.max(...variantPrices) : Number(p.taxInclusivePrice);
      const isVariablePrice = minPrice !== maxPrice;
      const primaryImage = p.images.find((img) => img.isPrimary) || p.images[0];

      let priceLabel = "";
      if (p.primaryMode === "QUOTE_ONLY") {
        priceLabel = "Price on request";
      } else if (isVariablePrice) {
        priceLabel = `From ₹${minPrice.toLocaleString("en-IN")}`;
      } else {
        priceLabel = `₹${Number(p.taxInclusivePrice).toLocaleString("en-IN")}`;
      }

      return {
        id: p.id,
        slug: p.slug,
        name: p.title,
        sku: p.sku,
        categoryName: p.category.name,
        categorySlug: p.category.slug,
        mode: p.primaryMode,
        priceLabel,
        primaryImageUrl: primaryImage ? primaryImage.url : null,
      };
    });

    return NextResponse.json({
      query: q,
      categories: categorySuggestions,
      products: suggestedProducts,
      totalCount,
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("[api/search] Error querying search catalogue:", error);
    return NextResponse.json(
      { error: "Failed to process search query", categories: [], products: [], totalCount: 0 },
      { status: 500 }
    );
  }
}

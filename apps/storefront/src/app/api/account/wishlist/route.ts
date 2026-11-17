import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * Strict authenticated Wishlist API (Tavistra Client Portal)
 * Allows registered clients to save and manage architectural editions & specific finish variants.
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required to access wishlist.", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const items = await prisma.wishlistItem.findMany({
      where: { userId: authUser.id },
      include: {
        product: {
          include: {
            variants: {
              where: { isPublished: true },
              orderBy: { taxInclusivePrice: "asc" },
            },
            images: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        variant: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      wishlist: items.map((item) => {
        const effectiveVariant =
          item.variant ||
          item.product.variants.find((v) => v.id === item.variantId) ||
          item.product.variants[0];

        const defaultImage =
          effectiveVariant?.imageUrl ||
          item.product.images[0]?.url ||
          "/comingSoon_1.webp";

        const pricePaise = effectiveVariant?.taxInclusivePrice
          ? Math.round(Number(effectiveVariant.taxInclusivePrice) * 100)
          : 0;

        return {
          id: item.id,
          productId: item.product.id,
          variantId: effectiveVariant?.id || null,
          variantTitle: effectiveVariant?.title || null,
          materialFinish: effectiveVariant?.materialFinish || null,
          slug: item.product.slug,
          sku: effectiveVariant?.sku || item.product.sku,
          title: item.product.title,
          pricePaise,
          imageUrl: defaultImage,
          mode: item.product.primaryMode,
          addedAt: item.createdAt,
        };
      }),
    });
  } catch (error) {
    console.error("GET /api/account/wishlist error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json(
        {
          error: "Sign in to save pieces to your client wishlist and access them across all your devices.",
          code: "AUTH_REQUIRED",
        },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { productId, slug, variantId, sku } = body as {
      productId?: string;
      slug?: string;
      variantId?: string;
      sku?: string;
    };

    if (!productId && !slug && !variantId && !sku) {
      return NextResponse.json(
        { error: "Product ID, slug, variant ID, or SKU is required to update wishlist." },
        { status: 400 }
      );
    }

    // Resolve variant first if specific variantId or sku provided
    let matchedVariant = null;
    if (variantId || sku) {
      matchedVariant = await prisma.productVariant.findFirst({
        where: {
          OR: [{ id: variantId || undefined }, { sku: sku || undefined }],
        },
      });
    }

    const effectiveProductId = matchedVariant?.productId || productId;

    // Resolve product with its variants
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: effectiveProductId || undefined }, { slug: slug || undefined }],
      },
      include: {
        variants: {
          where: { isPublished: true },
          orderBy: { taxInclusivePrice: "asc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Architectural edition not found." }, { status: 404 });
    }

    // Determine target variant (matched variant > variantId match > product first variant)
    const resolvedVariant =
      matchedVariant ||
      (variantId ? product.variants.find((v) => v.id === variantId) : null) ||
      product.variants[0] ||
      null;

    const targetVariantId = resolvedVariant?.id || null;

    // Toggle specific variant wishlist item
    const existing = await prisma.wishlistItem.findFirst({
      where: {
        userId: authUser.id,
        productId: product.id,
        variantId: targetVariantId,
      },
    });

    const displayTitle = resolvedVariant?.title
      ? `${product.title} (${resolvedVariant.title})`
      : product.title;

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      });

      return NextResponse.json({
        success: true,
        inWishlist: false,
        productId: product.id,
        variantId: targetVariantId,
        sku: resolvedVariant?.sku || product.sku,
        slug: product.slug,
        message: `${displayTitle} removed from your wishlist.`,
      });
    }

    const created = await prisma.wishlistItem.create({
      data: {
        userId: authUser.id,
        productId: product.id,
        variantId: targetVariantId,
      },
    });

    return NextResponse.json({
      success: true,
      inWishlist: true,
      wishlistItemId: created.id,
      productId: product.id,
      variantId: targetVariantId,
      sku: resolvedVariant?.sku || product.sku,
      slug: product.slug,
      message: `${displayTitle} saved to your Studio Wishlist.`,
    });
  } catch (error) {
    console.error("POST /api/account/wishlist error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * Strict authenticated Wishlist API (Tavistra Client Portal)
 * Allows registered clients to save and manage architectural editions.
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
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      wishlist: items.map((item) => {
        const defaultVariant = item.product.variants[0];
        const defaultImage = defaultVariant?.imageUrl || item.product.images[0]?.url || "/comingSoon_1.webp";
        const pricePaise = defaultVariant?.taxInclusivePrice
          ? Math.round(Number(defaultVariant.taxInclusivePrice) * 100)
          : 0;

        return {
          id: item.id,
          productId: item.product.id,
          slug: item.product.slug,
          sku: defaultVariant?.sku || item.product.sku,
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
    const { productId, slug } = body as { productId?: string; slug?: string };

    if (!productId && !slug) {
      return NextResponse.json(
        { error: "Product ID or slug is required to update wishlist." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: productId || undefined }, { slug: slug || undefined }],
      },
      select: { id: true, title: true, slug: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Architectural edition not found." }, { status: 404 });
    }

    // Toggle wishlist item
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: authUser.id,
          productId: product.id,
        },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      });

      return NextResponse.json({
        success: true,
        inWishlist: false,
        productId: product.id,
        slug: product.slug,
        message: `${product.title} removed from your wishlist.`,
      });
    }

    const created = await prisma.wishlistItem.create({
      data: {
        userId: authUser.id,
        productId: product.id,
      },
    });

    return NextResponse.json({
      success: true,
      inWishlist: true,
      wishlistItemId: created.id,
      productId: product.id,
      slug: product.slug,
      message: `${product.title} saved to your Studio Wishlist.`,
    });
  } catch (error) {
    console.error("POST /api/account/wishlist error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required to update wishlist.", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const { productId } = await params;
    const cleanId = (productId || "").trim();

    if (!cleanId) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    // Try finding by wishlistItem id OR by productId
    const item = await prisma.wishlistItem.findFirst({
      where: {
        userId: authUser.id,
        OR: [{ id: cleanId }, { productId: cleanId }],
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Wishlist item not found." }, { status: 404 });
    }

    await prisma.wishlistItem.delete({
      where: { id: item.id },
    });

    return NextResponse.json({
      success: true,
      message: "Piece removed from wishlist.",
    });
  } catch (error) {
    console.error("DELETE /api/account/wishlist/[productId] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

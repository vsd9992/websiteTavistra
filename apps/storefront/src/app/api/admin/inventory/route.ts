import { NextRequest, NextResponse } from "next/server";
import { prisma, StockMovementType } from "@tavistra/db";

export async function GET() {
  try {
    const variants = await prisma.productVariant.findMany({
      include: {
        product: {
          include: {
            category: true,
            images: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        inventoryLedger: {
          include: {
            movements: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
      orderBy: [
        { product: { createdAt: "asc" } },
        { sku: "asc" },
      ],
    });

    const items = [];
    const allMovements = [];

    for (const v of variants) {
      // Ensure inventory ledger exists for variant
      let ledger = v.inventoryLedger;
      if (!ledger) {
        ledger = await prisma.inventoryLedger.create({
          data: {
            variantId: v.id,
            availableStock: 0,
            reservedStock: 0,
            lowStockThreshold: 2,
            maxStockThreshold: 50,
            warehouseLocation: "Delhi Studio Hub — Unassigned Bay",
          },
          include: {
            movements: true,
          },
        });
      }

      let variantImageUrl = v.imageUrl;
      if (!variantImageUrl && v.imageUrls) {
        try {
          const parsed = JSON.parse(v.imageUrls);
          if (Array.isArray(parsed) && parsed.length > 0) {
            variantImageUrl = parsed[0];
          }
        } catch {}
      }
      if (!variantImageUrl && v.product.images.length > 0) {
        const primary = v.product.images.find((img) => img.isPrimary) || v.product.images[0];
        variantImageUrl = primary.url;
      }

      const onHand = ledger.availableStock + ledger.reservedStock;

      items.push({
        id: ledger.id,
        variantId: v.id,
        productId: v.product.id,
        productName: v.product.title,
        variantTitle: v.title,
        sku: v.sku,
        finishName: v.materialFinish || v.title,
        category: v.product.category?.name || "Home Décor & Objects",
        onHandStock: onHand,
        reservedStock: ledger.reservedStock,
        availableStock: ledger.availableStock,
        lowStockThreshold: ledger.lowStockThreshold ?? 2,
        maxStockThreshold: ledger.maxStockThreshold ?? 50,
        warehouseLocation: ledger.warehouseLocation || "Delhi Studio Hub — Unassigned Bay",
        priceRupees: Number(v.taxInclusivePrice),
        imageUrl: variantImageUrl || undefined,
        isPublished: v.product.isPublished && v.isPublished,
        isDraft: !v.product.isPublished,
        productIsPublished: v.product.isPublished,
        productMode: v.product.primaryMode,
      });

      if (ledger.movements && ledger.movements.length > 0) {
        for (const m of ledger.movements) {
          allMovements.push({
            id: m.id,
            inventoryId: ledger.id,
            sku: v.sku,
            productName: v.product.title,
            type: m.type,
            quantity: m.quantity,
            balanceAfter: onHand, // snapshot indicator
            referenceId: m.referenceId || "N/A",
            notes: m.notes || "Ledger adjustment",
            staffName: "Workshop Staff",
            timestamp: new Date(m.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }) + " IST",
            createdAt: m.createdAt,
          });
        }
      }
    }

    allMovements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      items,
      movements: allMovements,
      totalCount: items.length,
    });
  } catch (error) {
    console.error("Error fetching admin inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory from database" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, variantId, ledgerId } = body;

    // Locate ledger
    const ledger = await prisma.inventoryLedger.findFirst({
      where: variantId ? { variantId } : { id: ledgerId },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!ledger) {
      return NextResponse.json(
        { error: "Inventory ledger entry not found" },
        { status: 404 }
      );
    }

    if (action === "ADJUST_STOCK") {
      const { quantityDelta, type, referenceId, notes, staffName } = body;
      const delta = parseInt(quantityDelta, 10);
      if (isNaN(delta)) {
        return NextResponse.json({ error: "Invalid quantity delta" }, { status: 400 });
      }

      // Map frontend type to Prisma enum
      let movementType: StockMovementType = StockMovementType.MANUAL_ADJUSTMENT;
      let enrichedNotes = notes || "";

      if (type === "RESTOCK") {
        movementType = StockMovementType.RESTOCK;
      } else if (type === "FOUNDRY_RECEIPT") {
        movementType = StockMovementType.RESTOCK;
        enrichedNotes = enrichedNotes ? `[Foundry Receipt] ${enrichedNotes}` : "[Foundry Batch Receipt]";
      } else if (type === "RETURN_RESTOCK") {
        movementType = StockMovementType.RETURN_RESTOCK;
      } else if (type === "SCRAP_DISCREPANCY") {
        movementType = StockMovementType.MANUAL_ADJUSTMENT;
        enrichedNotes = enrichedNotes ? `[Scrap Discrepancy] ${enrichedNotes}` : "[Scrap / Melt Discrepancy]";
      } else if (type === "COMMITTED_RESERVE") {
        movementType = StockMovementType.PURCHASE_RESERVATION;
      } else if (type === "ORDER_FULFILLED") {
        movementType = StockMovementType.ORDER_FULFILLED;
      }

      if (staffName) {
        enrichedNotes = `${enrichedNotes} (Staff: ${staffName})`.trim();
      }

      const newAvailable = Math.max(0, ledger.availableStock + delta);

      const [updatedLedger, createdMovement] = await prisma.$transaction([
        prisma.inventoryLedger.update({
          where: { id: ledger.id },
          data: {
            availableStock: newAvailable,
          },
        }),
        prisma.stockMovement.create({
          data: {
            inventoryLedgerId: ledger.id,
            type: movementType,
            quantity: delta,
            referenceId: referenceId || "MANUAL-ADJ",
            notes: enrichedNotes,
          },
        }),
      ]);

      const onHand = updatedLedger.availableStock + updatedLedger.reservedStock;

      return NextResponse.json({
        success: true,
        ledger: {
          id: updatedLedger.id,
          variantId: ledger.variantId,
          sku: ledger.variant.sku,
          onHandStock: onHand,
          reservedStock: updatedLedger.reservedStock,
          availableStock: updatedLedger.availableStock,
          lowStockThreshold: updatedLedger.lowStockThreshold,
          maxStockThreshold: updatedLedger.maxStockThreshold,
          warehouseLocation: updatedLedger.warehouseLocation,
        },
        movement: {
          id: createdMovement.id,
          inventoryId: ledger.id,
          sku: ledger.variant.sku,
          productName: ledger.variant.product.title,
          type: type || createdMovement.type,
          quantity: createdMovement.quantity,
          balanceAfter: onHand,
          referenceId: createdMovement.referenceId,
          notes: createdMovement.notes,
          staffName: staffName || "Workshop Staff",
          timestamp: new Date(createdMovement.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }) + " IST",
        },
      });
    }

    if (action === "UPDATE_LOCATION") {
      const { warehouseLocation } = body;
      const updatedLedger = await prisma.inventoryLedger.update({
        where: { id: ledger.id },
        data: {
          warehouseLocation: typeof warehouseLocation === "string" ? warehouseLocation.trim() : "",
        },
      });

      return NextResponse.json({
        success: true,
        warehouseLocation: updatedLedger.warehouseLocation,
      });
    }

    if (action === "UPDATE_THRESHOLDS") {
      const { lowStockThreshold, maxStockThreshold } = body;
      const minVal = parseInt(lowStockThreshold, 10);
      const maxVal = parseInt(maxStockThreshold, 10);

      const updatedLedger = await prisma.inventoryLedger.update({
        where: { id: ledger.id },
        data: {
          lowStockThreshold: !isNaN(minVal) ? Math.max(0, minVal) : undefined,
          maxStockThreshold: !isNaN(maxVal) ? Math.max(1, maxVal) : undefined,
        },
      });

      return NextResponse.json({
        success: true,
        lowStockThreshold: updatedLedger.lowStockThreshold,
        maxStockThreshold: updatedLedger.maxStockThreshold,
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Supported: ADJUST_STOCK, UPDATE_LOCATION, UPDATE_THRESHOLDS" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating inventory ledger:", error);
    return NextResponse.json(
      { error: "Failed to update inventory ledger" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { ensureLogisticsSeeded, getConfiguredFeeSlabs } from "@/lib/logisticsEngine";

export async function GET() {
  try {
    await ensureLogisticsSeeded();

    const [feeSlabs, zones, rateMatrix, products, overrides] = await Promise.all([
      getConfiguredFeeSlabs(),
      prisma.shippingZone.findMany({ orderBy: { code: "asc" } }),
      prisma.deliveryRateRule.findMany({
        orderBy: [{ maxWeightGrams: "asc" }, { shippingZoneCode: "asc" }],
      }),
      prisma.product.findMany({
        select: {
          id: true,
          slug: true,
          sku: true,
          title: true,
          weightGrams: true,
          lengthMm: true,
          widthMm: true,
          heightMm: true,
          isPublished: true,
        },
        orderBy: { title: "asc" },
      }),
      prisma.productDeliveryOverride.findMany(),
    ]);

    return NextResponse.json({
      feeSlabs,
      zones: zones.map((z) => ({
        id: z.id,
        code: z.code,
        name: z.name,
        description: z.description,
        estimatedDaysMin: z.estimatedDaysMin,
        estimatedDaysMax: z.estimatedDaysMax,
      })),
      rateMatrix,
      products,
      productOverrides: overrides,
    });
  } catch (error) {
    console.error("GET /api/admin/logistics error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await ensureLogisticsSeeded();
    const body = await request.json();
    const { action, staffName = "Admin Staff" } = body;

    if (action === "UPDATE_SLABS") {
      const { slabs } = body as { slabs?: number[] };
      if (!Array.isArray(slabs) || slabs.length !== 12 || slabs.some((n) => isNaN(Number(n)) || Number(n) < 0)) {
        return NextResponse.json(
          { error: "Exactly 12 non-negative numeric slab values (INR) are required." },
          { status: 400 }
        );
      }

      const sorted = slabs.map((n) => Math.round(Number(n))).sort((a, b) => a - b);
      await prisma.systemSetting.upsert({
        where: { key: "DELIVERY_FEE_SLABS" },
        update: { value: JSON.stringify(sorted) },
        create: {
          key: "DELIVERY_FEE_SLABS",
          value: JSON.stringify(sorted),
          description: "Approved 12 customer-payable delivery fee slabs (INR, tax-inclusive).",
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "DELIVERY_SLABS_UPDATE",
          entityType: "SystemSetting",
          entityId: "DELIVERY_FEE_SLABS",
          payloadJson: JSON.stringify({ slabs: sorted, staff: staffName }),
        },
      });

      return NextResponse.json({ success: true, feeSlabs: sorted });
    }

    if (action === "UPDATE_ZONE") {
      const { code, name, description, estimatedDaysMin, estimatedDaysMax } = body;
      if (!code) {
        return NextResponse.json({ error: "Zone code is required" }, { status: 400 });
      }

      const updatedZone = await prisma.shippingZone.update({
        where: { code },
        data: {
          ...(name ? { name: String(name).trim() } : {}),
          ...(description ? { description: String(description).trim() } : {}),
          ...(estimatedDaysMin !== undefined ? { estimatedDaysMin: Number(estimatedDaysMin) } : {}),
          ...(estimatedDaysMax !== undefined ? { estimatedDaysMax: Number(estimatedDaysMax) } : {}),
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "SHIPPING_ZONE_UPDATE",
          entityType: "ShippingZone",
          entityId: code,
          payloadJson: JSON.stringify({
            code,
            name: updatedZone.name,
            days: `${updatedZone.estimatedDaysMin}-${updatedZone.estimatedDaysMax}`,
            staff: staffName,
          }),
        },
      });

      return NextResponse.json({ success: true, zone: updatedZone });
    }

    if (action === "UPDATE_RATE_RULE") {
      const { tierCode, shippingZoneCode, feeSlabRupees, carrierName } = body;
      if (!tierCode || !shippingZoneCode || feeSlabRupees === undefined) {
        return NextResponse.json(
          { error: "tierCode, shippingZoneCode, and feeSlabRupees are required" },
          { status: 400 }
        );
      }

      const slabVal = Math.round(Number(feeSlabRupees));
      const updatedRule = await prisma.deliveryRateRule.update({
        where: {
          tierCode_shippingZoneCode: {
            tierCode,
            shippingZoneCode,
          },
        },
        data: {
          feeSlabRupees: slabVal,
          ...(carrierName ? { carrierName: String(carrierName).trim() } : {}),
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "DELIVERY_MATRIX_RULE_UPDATE",
          entityType: "DeliveryRateRule",
          entityId: `${tierCode}:${shippingZoneCode}`,
          payloadJson: JSON.stringify({
            tierCode,
            shippingZoneCode,
            feeSlabRupees: slabVal,
            staff: staffName,
          }),
        },
      });

      return NextResponse.json({ success: true, rule: updatedRule });
    }

    if (action === "SET_PRODUCT_OVERRIDE") {
      const { productId, shippingZoneCode, feeSlabRupees } = body;
      if (!productId || !shippingZoneCode) {
        return NextResponse.json(
          { error: "productId and shippingZoneCode are required" },
          { status: 400 }
        );
      }

      if (feeSlabRupees === null || feeSlabRupees === "" || feeSlabRupees === undefined) {
        // Delete override -> revert to weight-tier matrix
        await prisma.productDeliveryOverride.deleteMany({
          where: { productId, shippingZoneCode },
        });
        await prisma.auditLog.create({
          data: {
            action: "PRODUCT_DELIVERY_OVERRIDE_CLEAR",
            entityType: "Product",
            entityId: productId,
            payloadJson: JSON.stringify({ productId, shippingZoneCode, staff: staffName }),
          },
        });
        return NextResponse.json({ success: true, cleared: true });
      }

      const slabVal = Math.round(Number(feeSlabRupees));
      const override = await prisma.productDeliveryOverride.upsert({
        where: {
          productId_shippingZoneCode: {
            productId,
            shippingZoneCode,
          },
        },
        update: { feeSlabRupees: slabVal },
        create: {
          productId,
          shippingZoneCode,
          feeSlabRupees: slabVal,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "PRODUCT_DELIVERY_OVERRIDE_SET",
          entityType: "Product",
          entityId: productId,
          payloadJson: JSON.stringify({
            productId,
            shippingZoneCode,
            feeSlabRupees: slabVal,
            staff: staffName,
          }),
        },
      });

      return NextResponse.json({ success: true, override });
    }

    return NextResponse.json({ error: `Unsupported logistics action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/admin/logistics error:", error);
    return NextResponse.json({ error: (error as Error).message || "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tavistra/db";
import { CANDIDATE_PINCODE_MAP, resolveShippingZone } from "@tavistra/shared";
import { ensureLogisticsSeeded } from "@/lib/logisticsEngine";

export async function GET() {
  try {
    await ensureLogisticsSeeded();

    const [ranges, zones] = await Promise.all([
      prisma.pincodeRange.findMany({
        include: {
          shippingZone: true,
        },
        orderBy: [{ pincodePrefix: "asc" }],
      }),
      prisma.shippingZone.findMany({
        orderBy: { code: "asc" },
      }),
    ]);

    const entries = ranges.map((r) => {
      const candidateMeta = r.pincodePrefix.length === 6 ? CANDIDATE_PINCODE_MAP[r.pincodePrefix] : undefined;
      const city = r.cityLabel || candidateMeta?.city || r.stateName;
      const specificity =
        r.pincodePrefix.length === 6
          ? "EXACT_6"
          : r.pincodePrefix.length === 4
          ? "PREFIX_4"
          : r.pincodePrefix.length === 3
          ? "PREFIX_3"
          : "PREFIX_2";

      return {
        id: r.id,
        pincode: r.pincodePrefix,
        city,
        locality: candidateMeta?.locality,
        state: r.stateName,
        zoneCode: r.shippingZone.code,
        zoneLabel: r.shippingZone.name,
        isServiceable: r.isServiceable,
        unserviceableReason: r.unserviceableReason || undefined,
        source: r.source,
        specificity,
        carrierAccepted: r.shippingZone.code !== "ZONE_E" || r.isServiceable,
        verifiedDate: r.updatedAt ? new Date(r.updatedAt).toISOString().split("T")[0] : "2026-11-12",
      };
    });

    return NextResponse.json({
      pincodes: entries,
      zones: zones.map((z) => ({
        id: z.id,
        code: z.code,
        name: z.name,
        description: z.description,
        estimatedDaysMin: z.estimatedDaysMin,
        estimatedDaysMax: z.estimatedDaysMax,
      })),
      urbanCandidateCount: Object.keys(CANDIDATE_PINCODE_MAP).length,
    });
  } catch (error) {
    console.error("GET /api/admin/pincodes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureLogisticsSeeded();
    const body = await request.json();
    const { action = "UPSERT_RULE", staffName = "Admin Staff" } = body;

    if (action === "IMPORT_URBAN_884") {
      const zones = await prisma.shippingZone.findMany();
      const zoneIdByCode = new Map(zones.map((z) => [z.code, z.id]));

      const existingPrefixes = new Set(
        (await prisma.pincodeRange.findMany({ select: { pincodePrefix: true } })).map((p) => p.pincodePrefix)
      );

      const toInsert: {
        shippingZoneId: string;
        stateName: string;
        cityLabel: string;
        pincodePrefix: string;
        isServiceable: boolean;
        source: string;
      }[] = [];

      for (const [pin, info] of Object.entries(CANDIDATE_PINCODE_MAP)) {
        if (existingPrefixes.has(pin)) continue;
        const zoneCode = resolveShippingZone(pin);
        const zoneId = zoneIdByCode.get(zoneCode) || zoneIdByCode.get("ZONE_D");
        if (!zoneId) continue;

        toInsert.push({
          shippingZoneId: zoneId,
          stateName: info.state,
          cityLabel: info.locality ? `${info.city} (${info.locality})` : info.city,
          pincodePrefix: pin,
          isServiceable: info.isServiceable,
          source: "URBAN_884",
        });
      }

      let insertedCount = 0;
      if (toInsert.length > 0) {
        const res = await prisma.pincodeRange.createMany({
          data: toInsert,
          skipDuplicates: true,
        });
        insertedCount = res.count;
      }

      await prisma.auditLog.create({
        data: {
          action: "PINCODE_URBAN_884_IMPORT",
          entityType: "PincodeRange",
          entityId: "BATCH_884",
          payloadJson: JSON.stringify({
            insertedCount,
            totalCandidates: Object.keys(CANDIDATE_PINCODE_MAP).length,
            staff: staffName,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        insertedCount,
        message: `Imported ${insertedCount} new urban PIN codes (${Object.keys(CANDIDATE_PINCODE_MAP).length - insertedCount} existing overrides preserved).`,
      });
    }

    if (action === "IMPORT_CSV") {
      const { rows } = body as {
        rows?: {
          pincode: string;
          city?: string;
          state: string;
          zoneCode?: string;
          isServiceable?: boolean;
          unserviceableReason?: string;
        }[];
      };

      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json({ error: "No CSV rows provided" }, { status: 400 });
      }

      const zones = await prisma.shippingZone.findMany();
      const zoneIdByCode = new Map(zones.map((z) => [z.code, z.id]));
      let upserted = 0;

      for (const row of rows) {
        const cleanPin = String(row.pincode || "").replace(/\D/g, "");
        if (cleanPin.length < 2 || cleanPin.length > 6) continue;

        const targetZoneCode = row.zoneCode || resolveShippingZone(cleanPin.padEnd(6, "0"));
        const zoneId = zoneIdByCode.get(targetZoneCode) || zoneIdByCode.get("ZONE_D");
        if (!zoneId) continue;

        await prisma.pincodeRange.upsert({
          where: { pincodePrefix: cleanPin },
          update: {
            shippingZoneId: zoneId,
            stateName: row.state || "India",
            cityLabel: row.city || row.state || cleanPin,
            isServiceable: row.isServiceable !== false,
            unserviceableReason: row.unserviceableReason || null,
            source: "ADMIN_OVERRIDE",
          },
          create: {
            shippingZoneId: zoneId,
            stateName: row.state || "India",
            cityLabel: row.city || row.state || cleanPin,
            pincodePrefix: cleanPin,
            isServiceable: row.isServiceable !== false,
            unserviceableReason: row.unserviceableReason || null,
            source: "ADMIN_OVERRIDE",
          },
        });
        upserted++;
      }

      await prisma.auditLog.create({
        data: {
          action: "PINCODE_CSV_IMPORT",
          entityType: "PincodeRange",
          entityId: "BATCH_CSV",
          payloadJson: JSON.stringify({ upserted, staff: staffName }),
        },
      });

      return NextResponse.json({ success: true, upserted });
    }

    // Default: UPSERT_RULE (Add or Edit single PIN or Region Prefix rule)
    const {
      pincodePrefix,
      cityLabel,
      stateName,
      zoneCode,
      isServiceable = true,
      unserviceableReason,
    } = body;

    const cleanPrefix = String(pincodePrefix || "").replace(/\D/g, "");
    if (!cleanPrefix || cleanPrefix.length < 2 || cleanPrefix.length > 6) {
      return NextResponse.json(
        { error: "PIN or prefix must be 2 to 6 digits (e.g. '11', '110', or '110062')." },
        { status: 400 }
      );
    }

    const targetZoneCode = zoneCode || resolveShippingZone(cleanPrefix.padEnd(6, "0"));
    const zone = await prisma.shippingZone.findUnique({ where: { code: targetZoneCode } });
    if (!zone) {
      return NextResponse.json({ error: `Invalid zoneCode: ${targetZoneCode}` }, { status: 400 });
    }

    const upsertedRule = await prisma.pincodeRange.upsert({
      where: { pincodePrefix: cleanPrefix },
      update: {
        shippingZoneId: zone.id,
        stateName: String(stateName || zone.name).trim(),
        cityLabel: cityLabel ? String(cityLabel).trim() : null,
        isServiceable: Boolean(isServiceable),
        unserviceableReason: unserviceableReason ? String(unserviceableReason).trim() : null,
        source: cleanPrefix.length === 6 ? "ADMIN_OVERRIDE" : "REGION_PREFIX",
      },
      create: {
        shippingZoneId: zone.id,
        stateName: String(stateName || zone.name).trim(),
        cityLabel: cityLabel ? String(cityLabel).trim() : null,
        pincodePrefix: cleanPrefix,
        isServiceable: Boolean(isServiceable),
        unserviceableReason: unserviceableReason ? String(unserviceableReason).trim() : null,
        source: cleanPrefix.length === 6 ? "ADMIN_OVERRIDE" : "REGION_PREFIX",
      },
      include: { shippingZone: true },
    });

    await prisma.auditLog.create({
      data: {
        action: "PINCODE_RULE_UPSERT",
        entityType: "PincodeRange",
        entityId: upsertedRule.pincodePrefix,
        payloadJson: JSON.stringify({
          prefix: upsertedRule.pincodePrefix,
          zoneCode: zone.code,
          isServiceable: upsertedRule.isServiceable,
          staff: staffName,
        }),
      },
    });

    return NextResponse.json({ success: true, rule: upsertedRule });
  } catch (error) {
    console.error("POST /api/admin/pincodes error:", error);
    return NextResponse.json({ error: (error as Error).message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await ensureLogisticsSeeded();
    const body = await request.json();
    const { id, isServiceable, zoneCode, cityLabel, stateName, unserviceableReason, staffName } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (typeof isServiceable === "boolean") updateData.isServiceable = isServiceable;
    if (cityLabel !== undefined) updateData.cityLabel = cityLabel || null;
    if (stateName !== undefined) updateData.stateName = stateName;
    if (unserviceableReason !== undefined) updateData.unserviceableReason = unserviceableReason || null;

    if (zoneCode) {
      const zone = await prisma.shippingZone.findUnique({ where: { code: zoneCode } });
      if (!zone) {
        return NextResponse.json({ error: `Zone not found: ${zoneCode}` }, { status: 400 });
      }
      updateData.shippingZoneId = zone.id;
    }

    const updated = await prisma.pincodeRange.update({
      where: { id },
      data: updateData,
      include: { shippingZone: true },
    });

    await prisma.auditLog.create({
      data: {
        action: "PINCODE_SERVICEABILITY_TOGGLE",
        entityType: "PincodeRange",
        entityId: updated.pincodePrefix,
        payloadJson: JSON.stringify({
          prefix: updated.pincodePrefix,
          isServiceable: updated.isServiceable,
          zoneCode: updated.shippingZone.code,
          staff: staffName || "Admin Staff",
        }),
      },
    });

    return NextResponse.json({ success: true, pincode: updated });
  } catch (error) {
    console.error("PATCH /api/admin/pincodes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id query param required" }, { status: 400 });
    }

    const existing = await prisma.pincodeRange.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "PIN rule not found" }, { status: 404 });
    }

    await prisma.pincodeRange.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "PINCODE_RULE_DELETE",
        entityType: "PincodeRange",
        entityId: existing.pincodePrefix,
        payloadJson: JSON.stringify({ prefix: existing.pincodePrefix }),
      },
    });

    return NextResponse.json({ success: true, deletedPrefix: existing.pincodePrefix });
  } catch (error) {
    console.error("DELETE /api/admin/pincodes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

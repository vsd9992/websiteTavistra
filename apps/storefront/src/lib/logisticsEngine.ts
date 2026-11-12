import { prisma } from "@tavistra/db";
import {
  DELIVERY_FEE_SLABS,
  lookupPincode,
  resolveShippingZone,
  ShippingZoneCode,
  SHIPPING_ZONES,
  calculateOrderDeliveryFee,
} from "@tavistra/shared";

export interface AuthoritativePincodeResult {
  pincode: string;
  isServiceable: boolean;
  city: string;
  state: string;
  locality?: string;
  zoneCode: ShippingZoneCode;
  zoneName: string;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  transitDaysEstimate: string;
  matchedRulePrefix: string | null;
  matchedRuleId: string | null;
  resolutionType:
    | "EXACT_6_DIGIT"
    | "PREFIX_ALLOW_ALL"
    | "PREFIX_BLOCKED"
    | "NOT_IN_WHITELIST"
    | "FALLBACK";
  unserviceableReason?: string;
}

export interface ShippingCalcItemInput {
  productId?: string;
  slug?: string;
  title?: string;
  quantity: number;
  priceRupees: number;
  weightGrams: number;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
}

export interface AuthoritativeShippingResult {
  pincodeResult: AuthoritativePincodeResult;
  totalDeliveryFeeRupees: number;
  gstIncludedRupees: number;
  actualWeightKg: number;
  volumetricWeightKg: number;
  billableWeightKg: number;
  carrierTier: string;
  carrierName: string;
  ruleSource: "PRODUCT_ZONE_OVERRIDE" | "WEIGHT_TIER_MATRIX" | "MIXED_HIGHEST_SLAB";
  itemBreakdown: {
    productId?: string;
    title?: string;
    billableWeightKg: number;
    tierCode: string;
    tierLabel: string;
    appliedSlabRupees: number;
    source: "PRODUCT_ZONE_OVERRIDE" | "WEIGHT_TIER_MATRIX";
  }[];
}

const DEFAULT_ZONES = [
  {
    code: "ZONE_A",
    name: "Zone A (Delhi NCR / Local)",
    description: "Delhi, Gurgaon, Noida, Faridabad, Ghaziabad",
    baseWeightGrams: 2000,
    baseRate: 250,
    perAdditionalKgRate: 50,
    estimatedDaysMin: 1,
    estimatedDaysMax: 2,
  },
  {
    code: "ZONE_B",
    name: "Zone B (North India <500 km)",
    description: "Haryana, Punjab, Chandigarh, Rajasthan, UP, Uttarakhand, Himachal",
    baseWeightGrams: 2000,
    baseRate: 500,
    perAdditionalKgRate: 80,
    estimatedDaysMin: 2,
    estimatedDaysMax: 3,
  },
  {
    code: "ZONE_C",
    name: "Zone C (Major Metros)",
    description: "Bengaluru, Mumbai, Pune, Hyderabad, Chennai, Kolkata, Ahmedabad",
    baseWeightGrams: 2000,
    baseRate: 1000,
    perAdditionalKgRate: 120,
    estimatedDaysMin: 3,
    estimatedDaysMax: 5,
  },
  {
    code: "ZONE_D",
    name: "Zone D (Rest of India)",
    description: "Tier 2 & Tier 3 cities across Central, Western & Southern India",
    baseWeightGrams: 2000,
    baseRate: 1500,
    perAdditionalKgRate: 150,
    estimatedDaysMin: 5,
    estimatedDaysMax: 7,
  },
  {
    code: "ZONE_E",
    name: "Zone E (Special & Remote Terrain)",
    description: "J&K, Ladakh, North-East states, Andaman & Nicobar, Lakshadweep",
    baseWeightGrams: 2000,
    baseRate: 2000,
    perAdditionalKgRate: 200,
    estimatedDaysMin: 7,
    estimatedDaysMax: 12,
  },
];

const DEFAULT_MATRIX_RULES: {
  tierCode: string;
  tierLabel: string;
  maxWeightGrams: number;
  carrierTier: string;
  carrierName: string;
  rates: Record<ShippingZoneCode, number>;
}[] = [
  {
    tierCode: "MINI",
    tierLabel: "Mini (<= 0.5 kg)",
    maxWeightGrams: 500,
    carrierTier: "DELHIVERY_AIR",
    carrierName: "Delhivery Express Air",
    rates: { ZONE_A: 250, ZONE_B: 250, ZONE_C: 250, ZONE_D: 250, ZONE_E: 500 },
  },
  {
    tierCode: "SMALL",
    tierLabel: "Small Fragile (<= 2 kg)",
    maxWeightGrams: 2000,
    carrierTier: "BLUEDART_SURFACE",
    carrierName: "Blue Dart Fragile Surface",
    rates: { ZONE_A: 250, ZONE_B: 500, ZONE_C: 500, ZONE_D: 750, ZONE_E: 1000 },
  },
  {
    tierCode: "MEDIUM",
    tierLabel: "Medium Fragile (<= 6 kg)",
    maxWeightGrams: 6000,
    carrierTier: "BLUEDART_SURFACE",
    carrierName: "Blue Dart Surfaceline",
    rates: { ZONE_A: 500, ZONE_B: 750, ZONE_C: 1000, ZONE_D: 1500, ZONE_E: 2000 },
  },
  {
    tierCode: "LARGE",
    tierLabel: "Large Fragile (<= 22 kg)",
    maxWeightGrams: 22000,
    carrierTier: "SAFEEXPRESS_PALLET",
    carrierName: "Safeexpress Palletized Caged Freight",
    rates: { ZONE_A: 1000, ZONE_B: 1500, ZONE_C: 2000, ZONE_D: 2500, ZONE_E: 4000 },
  },
  {
    tierCode: "HEAVY_CRATED",
    tierLabel: "Heavy Crated (> 22 kg)",
    maxWeightGrams: 55000,
    carrierTier: "SAFEEXPRESS_PALLET",
    carrierName: "Safeexpress / Gati B2B LTL Heavy",
    rates: { ZONE_A: 2000, ZONE_B: 2500, ZONE_C: 3000, ZONE_D: 4000, ZONE_E: 7500 },
  },
];

let bootstrapComplete = false;

/**
 * Ensures ShippingZones (A-E), DeliveryRateRules, and DELIVERY_FEE_SLABS exist in DB.
 */
export async function ensureLogisticsSeeded() {
  if (bootstrapComplete) return;

  try {
    // 1. Ensure Zones A-E exist
    const existingZones = await prisma.shippingZone.findMany();
    const existingCodes = new Set(existingZones.map((z) => z.code));
    for (const z of DEFAULT_ZONES) {
      if (!existingCodes.has(z.code)) {
        await prisma.shippingZone.create({ data: z });
      }
    }

    // 2. Ensure DELIVERY_FEE_SLABS setting exists
    const slabsSetting = await prisma.systemSetting.findUnique({
      where: { key: "DELIVERY_FEE_SLABS" },
    });
    if (!slabsSetting) {
      await prisma.systemSetting.create({
        data: {
          key: "DELIVERY_FEE_SLABS",
          value: JSON.stringify([...DELIVERY_FEE_SLABS]),
          description: "Approved 12 customer-payable delivery fee slabs (INR, tax-inclusive).",
        },
      });
    }

    // 3. Ensure DeliveryRateRule 5x5 matrix exists
    const ruleCount = await prisma.deliveryRateRule.count();
    if (ruleCount === 0) {
      for (const tier of DEFAULT_MATRIX_RULES) {
        for (const [zoneCode, feeSlabRupees] of Object.entries(tier.rates)) {
          await prisma.deliveryRateRule.upsert({
            where: {
              tierCode_shippingZoneCode: {
                tierCode: tier.tierCode,
                shippingZoneCode: zoneCode,
              },
            },
            update: {},
            create: {
              tierCode: tier.tierCode,
              tierLabel: tier.tierLabel,
              maxWeightGrams: tier.maxWeightGrams,
              carrierTier: tier.carrierTier,
              carrierName: tier.carrierName,
              shippingZoneCode: zoneCode,
              feeSlabRupees,
            },
          });
        }
      }
    }

    bootstrapComplete = true;
  } catch (err) {
    console.warn("[logisticsEngine] Seed check error:", err);
  }
}

export async function getConfiguredFeeSlabs(): Promise<number[]> {
  try {
    await ensureLogisticsSeeded();
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "DELIVERY_FEE_SLABS" },
    });
    if (setting?.value) {
      const parsed = JSON.parse(setting.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(Number).sort((a, b) => a - b);
      }
    }
  } catch {}
  return [...DELIVERY_FEE_SLABS];
}

/**
 * Resolves a 6-digit Indian PIN code using strict longest-prefix hierarchy against PostgreSQL:
 * Exact 6-digit > 4-digit prefix > 3-digit prefix > 2-digit prefix > Urban Candidate Fallback
 */
export async function resolvePincodeHierarchy(pincodeRaw: string): Promise<AuthoritativePincodeResult> {
  await ensureLogisticsSeeded();
  const cleanPin = pincodeRaw.replace(/\s+/g, "");
  const baseLookup = lookupPincode(cleanPin);

  if (!/^\d{6}$/.test(cleanPin)) {
    return {
      pincode: cleanPin,
      isServiceable: false,
      city: "",
      state: "",
      zoneCode: "ZONE_D",
      zoneName: SHIPPING_ZONES.ZONE_D.name,
      estimatedDaysMin: 5,
      estimatedDaysMax: 7,
      transitDaysEstimate: "5–7 business days",
      matchedRulePrefix: null,
      matchedRuleId: null,
      resolutionType: "FALLBACK",
      unserviceableReason: "Please enter a valid 6-digit Indian postal PIN code.",
    };
  }

  // Query DB for all matching prefixes: 6-digit, 4-digit, 3-digit, 2-digit
  const candidates = [cleanPin, cleanPin.slice(0, 4), cleanPin.slice(0, 3), cleanPin.slice(0, 2)];
  const matchedRules = await prisma.pincodeRange.findMany({
    where: {
      pincodePrefix: { in: candidates },
    },
    include: {
      shippingZone: true,
    },
  });

  // Pick longest prefix match (Exact 6-digit beats 4-digit beats 3-digit beats 2-digit)
  matchedRules.sort((a, b) => b.pincodePrefix.length - a.pincodePrefix.length);
  const exactRule = matchedRules.find((r) => r.pincodePrefix.length === 6) || null;
  const prefixRules = matchedRules.filter((r) => r.pincodePrefix.length < 6);
  const blockedPrefix = prefixRules.find((r) => !r.isServiceable) || null;
  const longestPrefix = prefixRules[0] || null;

  // 1. If any governing region/sub-prefix (e.g. 194 Leh or paused region 38) is disabled, block delivery
  if (blockedPrefix) {
    const zoneCode = (blockedPrefix.shippingZone.code as ShippingZoneCode) || baseLookup.zoneCode;
    const zoneMin = blockedPrefix.shippingZone.estimatedDaysMin;
    const zoneMax = blockedPrefix.shippingZone.estimatedDaysMax;
    const cityDisplay = baseLookup.city || blockedPrefix.cityLabel || blockedPrefix.stateName;
    const stateDisplay = baseLookup.state || blockedPrefix.stateName;

    return {
      pincode: cleanPin,
      isServiceable: false,
      city: cityDisplay,
      state: stateDisplay,
      locality: baseLookup.locality || blockedPrefix.cityLabel || undefined,
      zoneCode,
      zoneName: blockedPrefix.shippingZone.name,
      estimatedDaysMin: zoneMin,
      estimatedDaysMax: zoneMax,
      transitDaysEstimate: `${zoneMin}–${zoneMax} business days`,
      matchedRulePrefix: blockedPrefix.pincodePrefix,
      matchedRuleId: blockedPrefix.id,
      resolutionType: "PREFIX_BLOCKED",
      unserviceableReason:
        blockedPrefix.unserviceableReason ||
        `Deliveries to ${cityDisplay} (${blockedPrefix.pincodePrefix}xxxx) are currently suspended by Studio Logistics.`,
    };
  }

  // 2. Exact 6-digit rule in PostgreSQL (Strict Whitelist / Admin Override)
  if (exactRule) {
    const zoneCode = (exactRule.shippingZone.code as ShippingZoneCode) || baseLookup.zoneCode;
    const zoneMin = exactRule.shippingZone.estimatedDaysMin;
    const zoneMax = exactRule.shippingZone.estimatedDaysMax;
    const cityDisplay = baseLookup.city || exactRule.cityLabel || exactRule.stateName;
    const stateDisplay = baseLookup.state || exactRule.stateName;

    if (!exactRule.isServiceable) {
      return {
        pincode: cleanPin,
        isServiceable: false,
        city: cityDisplay,
        state: stateDisplay,
        locality: baseLookup.locality || exactRule.cityLabel || undefined,
        zoneCode,
        zoneName: exactRule.shippingZone.name,
        estimatedDaysMin: zoneMin,
        estimatedDaysMax: zoneMax,
        transitDaysEstimate: `${zoneMin}–${zoneMax} business days`,
        matchedRulePrefix: exactRule.pincodePrefix,
        matchedRuleId: exactRule.id,
        resolutionType: "EXACT_6_DIGIT",
        unserviceableReason:
          exactRule.unserviceableReason ||
          `Deliveries to PIN code ${cleanPin} (${cityDisplay}) are temporarily suspended by Studio Logistics.`,
      };
    }

    return {
      pincode: cleanPin,
      isServiceable: true,
      city: cityDisplay,
      state: stateDisplay,
      locality: baseLookup.locality || exactRule.cityLabel || undefined,
      zoneCode,
      zoneName: exactRule.shippingZone.name,
      estimatedDaysMin: zoneMin,
      estimatedDaysMax: zoneMax,
      transitDaysEstimate: `${zoneMin}–${zoneMax} business days`,
      matchedRulePrefix: exactRule.pincodePrefix,
      matchedRuleId: exactRule.id,
      resolutionType: "EXACT_6_DIGIT",
    };
  }

  // 3. No exact 6-digit PIN in DB (e.g. 380053): allow ONLY if Admin explicitly opted a governing prefix into ALLOW_ALL_IN_PREFIX
  const openPrefixRule = prefixRules.find((r) => r.coverageMode === "ALLOW_ALL_IN_PREFIX" && r.isServiceable);
  if (openPrefixRule) {
    const zoneCode = (openPrefixRule.shippingZone.code as ShippingZoneCode) || baseLookup.zoneCode;
    const zoneMin = openPrefixRule.shippingZone.estimatedDaysMin;
    const zoneMax = openPrefixRule.shippingZone.estimatedDaysMax;
    const cityDisplay = baseLookup.city || openPrefixRule.cityLabel || openPrefixRule.stateName;
    const stateDisplay = baseLookup.state || openPrefixRule.stateName;

    return {
      pincode: cleanPin,
      isServiceable: true,
      city: cityDisplay,
      state: stateDisplay,
      locality: baseLookup.locality || openPrefixRule.cityLabel || undefined,
      zoneCode,
      zoneName: openPrefixRule.shippingZone.name,
      estimatedDaysMin: zoneMin,
      estimatedDaysMax: zoneMax,
      transitDaysEstimate: `${zoneMin}–${zoneMax} business days`,
      matchedRulePrefix: openPrefixRule.pincodePrefix,
      matchedRuleId: openPrefixRule.id,
      resolutionType: "PREFIX_ALLOW_ALL",
    };
  }

  // 4. Default Strict 6-Digit Whitelist: Unlisted PINs (such as 380053) are NOT serviceable
  const fallbackZoneCode =
    (longestPrefix?.shippingZone.code as ShippingZoneCode) ||
    baseLookup.zoneCode ||
    resolveShippingZone(cleanPin);
  const dbZone =
    longestPrefix?.shippingZone ||
    (await prisma.shippingZone.findUnique({ where: { code: fallbackZoneCode } }));
  const zoneConfig = dbZone || SHIPPING_ZONES[fallbackZoneCode];
  const stateDisplay = longestPrefix?.stateName || baseLookup.state || "India";
  const cityDisplay = baseLookup.city || longestPrefix?.cityLabel || stateDisplay;

  return {
    pincode: cleanPin,
    isServiceable: false,
    city: cityDisplay,
    state: stateDisplay,
    locality: baseLookup.locality,
    zoneCode: fallbackZoneCode,
    zoneName: zoneConfig.name,
    estimatedDaysMin: zoneConfig.estimatedDaysMin,
    estimatedDaysMax: zoneConfig.estimatedDaysMax,
    transitDaysEstimate: `${zoneConfig.estimatedDaysMin}–${zoneConfig.estimatedDaysMax} business days`,
    matchedRulePrefix: longestPrefix?.pincodePrefix || null,
    matchedRuleId: longestPrefix?.id || null,
    resolutionType: "NOT_IN_WHITELIST",
    unserviceableReason: `PIN code ${cleanPin} (${stateDisplay}) is not currently in our verified delivery directory.`,
  };
}

/**
 * Authoritative DB-backed shipping calculation engine:
 * 1. Resolves destination PIN hierarchy and Zone.
 * 2. Checks ProductDeliveryOverride for each item's productId in that Zone.
 * 3. Falls back to DB DeliveryRateRule (Weight/Volumetric Tier x Zone) aligned to the 12-slab ladder.
 * 4. Enforces Multi-Item Highest Product Fee Rule (max of item slabs).
 */
export async function calculateAuthoritativeShipping(
  pincodeRaw: string,
  items: ShippingCalcItemInput[]
): Promise<AuthoritativeShippingResult> {
  const pincodeResult = await resolvePincodeHierarchy(pincodeRaw);
  const zoneCode = pincodeResult.zoneCode;

  const [rateRules, productOverrides] = await Promise.all([
    prisma.deliveryRateRule.findMany({
      where: { shippingZoneCode: zoneCode },
      orderBy: { maxWeightGrams: "asc" },
    }),
    prisma.productDeliveryOverride.findMany({
      where: {
        shippingZoneCode: zoneCode,
        productId: {
          in: items.map((i) => i.productId).filter(Boolean) as string[],
        },
      },
    }),
  ]);

  let totalActualWeightGrams = 0;
  let totalVolumetricWeightGrams = 0;
  const itemBreakdown: AuthoritativeShippingResult["itemBreakdown"] = [];

  let highestCarrierTier = "BLUEDART_SURFACE";
  let highestCarrierName = "Blue Dart Surfaceline";
  let highestProductFee = 0;

  for (const item of items) {
    const qty = Math.max(1, item.quantity || 1);
    const actualUnitGrams = item.weightGrams || 1000;
    // Fragile 2-inch (50mm) all-side cushioning allowance
    const lCm = ((item.lengthMm || 200) + 50) / 10;
    const wCm = ((item.widthMm || 200) + 50) / 10;
    const hCm = ((item.heightMm || 100) + 50) / 10;
    const volUnitGrams = Math.round(((lCm * wCm * hCm) / 5000) * 1000);

    totalActualWeightGrams += actualUnitGrams * qty;
    totalVolumetricWeightGrams += volUnitGrams * qty;

    const unitBillableGrams = Math.max(actualUnitGrams, volUnitGrams);
    const unitBillableKg = Number((unitBillableGrams / 1000).toFixed(2));

    // Check product-specific zone override first
    const override = item.productId
      ? productOverrides.find((ov) => ov.productId === item.productId)
      : undefined;

    // Match weight/volumetric tier rule from DB
    const matchedRule =
      rateRules.find((r) => unitBillableGrams <= r.maxWeightGrams) ||
      rateRules[rateRules.length - 1];

    const appliedSlabRupees = override
      ? override.feeSlabRupees
      : matchedRule
      ? matchedRule.feeSlabRupees
      : 500;

    if (appliedSlabRupees >= highestProductFee) {
      highestProductFee = appliedSlabRupees;
      if (matchedRule) {
        highestCarrierTier = matchedRule.carrierTier;
        highestCarrierName = matchedRule.carrierName;
      }
    }

    itemBreakdown.push({
      productId: item.productId,
      title: item.title,
      billableWeightKg: unitBillableKg,
      tierCode: matchedRule?.tierCode || "STANDARD",
      tierLabel: matchedRule?.tierLabel || "Standard",
      appliedSlabRupees,
      source: override ? "PRODUCT_ZONE_OVERRIDE" : "WEIGHT_TIER_MATRIX",
    });
  }

  const totalDeliveryFeeRupees =
    itemBreakdown.length > 0
      ? calculateOrderDeliveryFee(itemBreakdown.map((b) => b.appliedSlabRupees))
      : 0;

  // Embedded statutory GST (CGST s.15(2)(c))
  const gstIncludedRupees = Math.round(totalDeliveryFeeRupees * (18 / 118));

  const hasOverride = itemBreakdown.some((b) => b.source === "PRODUCT_ZONE_OVERRIDE");
  const hasMatrix = itemBreakdown.some((b) => b.source === "WEIGHT_TIER_MATRIX");
  const ruleSource =
    hasOverride && hasMatrix
      ? "MIXED_HIGHEST_SLAB"
      : hasOverride
      ? "PRODUCT_ZONE_OVERRIDE"
      : "WEIGHT_TIER_MATRIX";

  return {
    pincodeResult,
    totalDeliveryFeeRupees,
    gstIncludedRupees,
    actualWeightKg: Number((totalActualWeightGrams / 1000).toFixed(2)),
    volumetricWeightKg: Number((totalVolumetricWeightGrams / 1000).toFixed(2)),
    billableWeightKg: Number((Math.max(totalActualWeightGrams, totalVolumetricWeightGrams) / 1000).toFixed(2)),
    carrierTier: highestCarrierTier,
    carrierName: highestCarrierName,
    ruleSource,
    itemBreakdown,
  };
}


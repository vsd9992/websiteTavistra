import { z } from 'zod';

export const ShippingZoneCode = z.enum([
  'ZONE_A', // Local / Karnataka
  'ZONE_B', // Regional / South & West
  'ZONE_C', // National / Metro & North/East
  'ZONE_D', // Special / Remote / J&K / NE / Islands
]);
export type ShippingZoneCode = z.infer<typeof ShippingZoneCode>;

export interface ShippingZoneConfig {
  code: ShippingZoneCode;
  name: string;
  description: string;
  baseWeightGrams: number;
  baseRateRupees: number;
  perAdditionalKgRupees: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
}

export const SHIPPING_ZONES: Record<ShippingZoneCode, ShippingZoneConfig> = {
  ZONE_A: {
    code: 'ZONE_A',
    name: 'Zone A (Intra-State / Karnataka)',
    description: 'Local transit with specialized white-glove courier handling.',
    baseWeightGrams: 2000,
    baseRateRupees: 450,
    perAdditionalKgRupees: 80,
    estimatedDaysMin: 2,
    estimatedDaysMax: 3,
  },
  ZONE_B: {
    code: 'ZONE_B',
    name: 'Zone B (Regional / South & West)',
    description: 'Southern & Western states (TN, KL, AP, TS, GA, MH).',
    baseWeightGrams: 2000,
    baseRateRupees: 750,
    perAdditionalKgRupees: 120,
    estimatedDaysMin: 3,
    estimatedDaysMax: 5,
  },
  ZONE_C: {
    code: 'ZONE_C',
    name: 'Zone C (National / Metro & Rest of India)',
    description: 'Major metros, Northern, Central and Eastern states.',
    baseWeightGrams: 2000,
    baseRateRupees: 1100,
    perAdditionalKgRupees: 160,
    estimatedDaysMin: 5,
    estimatedDaysMax: 8,
  },
  ZONE_D: {
    code: 'ZONE_D',
    name: 'Zone D (Remote / Special Terrain)',
    description: 'J&K, Ladakh, North-East, and Island territories.',
    baseWeightGrams: 2000,
    baseRateRupees: 1650,
    perAdditionalKgRupees: 220,
    estimatedDaysMin: 7,
    estimatedDaysMax: 12,
  },
};

/**
 * Resolves the applicable shipping zone from a 6-digit Indian PIN code.
 */
export function resolveShippingZone(pincode: string): ShippingZoneCode {
  const cleanPin = pincode.replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleanPin)) {
    // Default to national if format is irregular during initial estimation
    return 'ZONE_C';
  }

  const prefix2 = cleanPin.substring(0, 2);
  const prefix3 = cleanPin.substring(0, 3);

  // Zone D: Special / Remote (J&K 18-19, NE 78-79, Islands 744, Ladakh 194)
  if (
    prefix2 === '18' ||
    prefix2 === '19' ||
    prefix2 === '79' ||
    prefix3 === '788' ||
    prefix3 === '789' ||
    prefix3 === '744'
  ) {
    return 'ZONE_D';
  }

  // Zone A: Karnataka (56, 57, 58, 59)
  if (['56', '57', '58', '59'].includes(prefix2)) {
    return 'ZONE_A';
  }

  // Zone B: Southern & Western neighbors
  // TN (60-64), KL (67-69), AP/TS (50-53), MH (40-44), Goa (403)
  const isSouthWest =
    ['50', '51', '52', '53', '60', '61', '62', '63', '64', '67', '68', '69', '40', '41', '42', '43', '44'].includes(prefix2);
  if (isSouthWest) {
    return 'ZONE_B';
  }

  // Zone C: National / All other Indian PIN codes
  return 'ZONE_C';
}

export interface PackageDimensions {
  weightGrams: number;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
}

/**
 * Calculates billable volumetric or actual weight and applies the distance-band freight formula.
 * Volumetric divisor: 5000 (air/surface courier standard: (L cm * W cm * H cm) / 5000 = kg).
 */
export function calculateDistanceBandShipping(
  zoneCode: ShippingZoneCode,
  items: PackageDimensions[]
): {
  zone: ShippingZoneConfig;
  actualWeightGrams: number;
  volumetricWeightGrams: number;
  billableWeightGrams: number;
  shippingChargeRupees: number;
} {
  const zone = SHIPPING_ZONES[zoneCode];

  let totalActualWeight = 0;
  let totalVolumetricWeight = 0;

  for (const item of items) {
    totalActualWeight += item.weightGrams;

    // Dimensions in cm
    const lCm = item.lengthMm / 10;
    const wCm = item.widthMm / 10;
    const hCm = item.heightMm / 10;

    // Volumetric kg * 1000 = grams
    const volGrams = Math.round(((lCm * wCm * hCm) / 5000) * 1000);
    totalVolumetricWeight += volGrams;
  }

  const billableWeightGrams = Math.max(totalActualWeight, totalVolumetricWeight);

  // Base charge covers up to baseWeightGrams (2000g)
  let charge = zone.baseRateRupees;
  if (billableWeightGrams > zone.baseWeightGrams) {
    const excessGrams = billableWeightGrams - zone.baseWeightGrams;
    const excessKg = Math.ceil(excessGrams / 1000);
    charge += excessKg * zone.perAdditionalKgRupees;
  }

  return {
    zone,
    actualWeightGrams: totalActualWeight,
    volumetricWeightGrams: totalVolumetricWeight,
    billableWeightGrams,
    shippingChargeRupees: charge,
  };
}

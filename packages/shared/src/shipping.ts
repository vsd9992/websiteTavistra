import { z } from 'zod';

export const ShippingZoneCode = z.enum([
  'ZONE_A', // Delhi NCR (Local)
  'ZONE_B', // North India (<500km: UP, HR, PB, RJ, UK, HP)
  'ZONE_C', // Major Metros (Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Ahmedabad)
  'ZONE_D', // Rest of India (Tier 2 & 3 Cities)
  'ZONE_E', // Special / Remote (J&K, Ladakh, North East, Andaman & Nicobar, Lakshadweep)
]);
export type ShippingZoneCode = z.infer<typeof ShippingZoneCode>;

export type CarrierTier = 'DELHIVERY_AIR' | 'BLUEDART_SURFACE' | 'SAFEEXPRESS_PALLET';

export interface ShippingZoneConfig {
  code: ShippingZoneCode;
  name: string;
  regionDescription: string;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
}

export const SHIPPING_ZONES: Record<ShippingZoneCode, ShippingZoneConfig> = {
  ZONE_A: {
    code: 'ZONE_A',
    name: 'Zone A (Delhi NCR / Local)',
    regionDescription: 'Delhi, Gurgaon, Noida, Faridabad, Ghaziabad',
    estimatedDaysMin: 1,
    estimatedDaysMax: 2,
  },
  ZONE_B: {
    code: 'ZONE_B',
    name: 'Zone B (North India <500 km)',
    regionDescription: 'Haryana, Punjab, Rajasthan, Uttar Pradesh, Uttarakhand, Himachal',
    estimatedDaysMin: 2,
    estimatedDaysMax: 3,
  },
  ZONE_C: {
    code: 'ZONE_C',
    name: 'Zone C (Major Metros)',
    regionDescription: 'Bengaluru, Mumbai, Pune, Hyderabad, Chennai, Kolkata, Ahmedabad',
    estimatedDaysMin: 3,
    estimatedDaysMax: 5,
  },
  ZONE_D: {
    code: 'ZONE_D',
    name: 'Zone D (Rest of India)',
    regionDescription: 'Tier 2 & Tier 3 cities across Central, Western & Southern India',
    estimatedDaysMin: 5,
    estimatedDaysMax: 7,
  },
  ZONE_E: {
    code: 'ZONE_E',
    name: 'Zone E (Special & Remote Terrain)',
    regionDescription: 'J&K, Ladakh, North-East states, Andaman & Nicobar, Lakshadweep',
    estimatedDaysMin: 7,
    estimatedDaysMax: 12,
  },
};

/**
 * Resolves the applicable shipping zone from a 6-digit Indian PIN code
 * (Ex-Delhi NCR logistics hub baseline from docs/deliveryFee.md).
 */
export function resolveShippingZone(pincode: string): ShippingZoneCode {
  const cleanPin = pincode.replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleanPin)) {
    return 'ZONE_D'; // Fallback default
  }

  const p2 = cleanPin.substring(0, 2);
  const p3 = cleanPin.substring(0, 3);

  // Zone E: Special / Remote (J&K 18-19, NE 78-79, Islands 744, Ladakh 194, interior HP)
  if (
    p2 === '18' ||
    p2 === '19' ||
    p2 === '79' ||
    p3 === '788' ||
    p3 === '789' ||
    p3 === '744' ||
    p3 === '172' ||
    p3 === '175' ||
    p3 === '176'
  ) {
    return 'ZONE_E';
  }

  // Zone A: Delhi NCR (11 Delhi, 122/121 Gurgaon/Faridabad, 201 Noida/Ghaziabad)
  if (p2 === '11' || p3 === '121' || p3 === '122' || p3 === '201') {
    return 'ZONE_A';
  }

  // Zone C: Major Metros
  // Mumbai/Pune (40, 41), Bengaluru (56), Hyderabad (50), Chennai (60), Kolkata (70), Ahmedabad (38)
  if (['40', '41', '56', '50', '60', '70', '38'].includes(p2)) {
    return 'ZONE_C';
  }

  // Zone B: North India (<500 km)
  // Haryana (12, 13), Punjab (14, 15), Himachal (17), UP (20-28), Rajasthan (30-34), UK (24-26)
  const isNorth =
    ['12', '13', '14', '15', '17', '20', '21', '22', '23', '24', '25', '26', '27', '28', '30', '31', '32', '33', '34'].includes(p2);
  if (isNorth) {
    return 'ZONE_B';
  }

  // Zone D: Rest of India
  return 'ZONE_D';
}

export interface ItemPhysicalSpec {
  productId?: string;
  priceRupees: number;
  weightGrams: number;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  isFragile?: boolean;
}

/**
 * Approved Configurable Fee Ladder (INR) per 2026-11-06 Owner Policy
 */
export const DELIVERY_FEE_SLABS = [
  0, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500,
] as const;
export type DeliveryFeeSlab = typeof DELIVERY_FEE_SLABS[number];

/**
 * Matches an estimated freight exposure to the nearest approved ladder slab.
 */
export function matchDeliveryFeeSlab(amountRupees: number): DeliveryFeeSlab {
  if (amountRupees <= 0) return 0;
  for (const slab of DELIVERY_FEE_SLABS) {
    if (slab >= amountRupees) return slab;
  }
  return 7500;
}

/**
 * Highest Product Fee Rule for Multi-Item Orders (2026-11-06 Owner Policy)
 * For a single destination order with multiple items, charge one delivery fee
 * equal to the highest applicable product delivery fee, not the sum.
 * Tavistra absorbs extra freight variance.
 */
export function calculateOrderDeliveryFee(productFees: number[]): number {
  if (!productFees || productFees.length === 0) return 0;
  return Math.max(0, ...productFees);
}

/**
 * Bulk Order Ceiling Validation (2026-11-06 Owner Policy)
 * Up to 10 units of any single product AND up to 10 distinct order line items.
 * Breaching either ceiling directs the customer to Bulk Order Enquiry.
 */
export interface BulkCeilingCheck {
  isBulkEnquiryRequired: boolean;
  reason?: 'EXCEEDS_MAX_UNITS_PER_PRODUCT' | 'EXCEEDS_MAX_DISTINCT_LINES';
  message?: string;
}

export function checkBulkOrderCeiling(
  items: { productId: string; quantity: number }[]
): BulkCeilingCheck {
  if (items.length > 10) {
    return {
      isBulkEnquiryRequired: true,
      reason: 'EXCEEDS_MAX_DISTINCT_LINES',
      message: 'Orders with more than 10 line items must be placed via Bulk Order Enquiry.',
    };
  }

  const productQtyMap = new Map<string, number>();
  for (const item of items) {
    const current = productQtyMap.get(item.productId) || 0;
    const total = current + item.quantity;
    if (total > 10) {
      return {
        isBulkEnquiryRequired: true,
        reason: 'EXCEEDS_MAX_UNITS_PER_PRODUCT',
        message: 'Orders exceeding 10 units of a single product must be placed via Bulk Order Enquiry.',
      };
    }
    productQtyMap.set(item.productId, total);
  }

  return { isBulkEnquiryRequired: false };
}

export interface ShippingCalculationResult {
  zone: ShippingZoneConfig;
  carrierTier: CarrierTier;
  carrierName: string;
  actualWeightKg: number;
  volumetricWeightKg: number;
  billableWeightKg: number;
  packagingTier: 'MINI' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'HEAVY_CRATED';
  packagingCostRupees: number;
  insuranceFovRupees: number;
  baseFreightRupees: number;
  gstAmountRupees: number;
  totalDeliveryFeeRupees: number;
  transitDaysEstimate: string;
}

/**
 * Master Rate Matrix from docs/deliveryFee.md
 * Table mapping Billable Weight Tier x Zone Code.
 */
interface RateBracket {
  maxWeightKg: number;
  packagingTier: 'MINI' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'HEAVY_CRATED';
  packagingCostRupees: number;
  carrierTier: CarrierTier;
  carrierName: string;
  baseRates: Record<ShippingZoneCode, number>;
}

const RATE_BRACKETS: RateBracket[] = [
  // 1. Mini (<= 0.5 kg) - e.g. Pocket talisman, key tags
  {
    maxWeightKg: 0.5,
    packagingTier: 'MINI',
    packagingCostRupees: 60,
    carrierTier: 'DELHIVERY_AIR',
    carrierName: 'Delhivery Express Air',
    baseRates: { ZONE_A: 50, ZONE_B: 60, ZONE_C: 75, ZONE_D: 85, ZONE_E: 115 },
  },
  // 2. Small Fragile (<= 2 kg) - e.g. Desk organisers, compact stone
  {
    maxWeightKg: 2.0,
    packagingTier: 'SMALL',
    packagingCostRupees: 130,
    carrierTier: 'BLUEDART_SURFACE',
    carrierName: 'Blue Dart Fragile Surface',
    baseRates: { ZONE_A: 190, ZONE_B: 250, ZONE_C: 360, ZONE_D: 420, ZONE_E: 580 },
  },
  // 3. Medium Fragile (<= 6 kg) - e.g. Wall clocks, articulated desk lamps
  {
    maxWeightKg: 6.0,
    packagingTier: 'MEDIUM',
    packagingCostRupees: 280,
    carrierTier: 'BLUEDART_SURFACE',
    carrierName: 'Blue Dart Surfaceline',
    baseRates: { ZONE_A: 350, ZONE_B: 440, ZONE_C: 620, ZONE_D: 740, ZONE_E: 1050 },
  },
  // 4. Large Fragile (<= 22 kg) - e.g. Solid brass wall mirrors in crate
  {
    maxWeightKg: 22.0,
    packagingTier: 'LARGE',
    packagingCostRupees: 650,
    carrierTier: 'SAFEEXPRESS_PALLET',
    carrierName: 'Safeexpress Palletized Caged Freight',
    baseRates: { ZONE_A: 750, ZONE_B: 950, ZONE_C: 1350, ZONE_D: 1650, ZONE_E: 2600 },
  },
  // 5. Heavy / Jumbo Crated (> 22 kg up to 55 kg) - e.g. Large kinetic sculptures, balcony consoles
  {
    maxWeightKg: 55.0,
    packagingTier: 'HEAVY_CRATED',
    packagingCostRupees: 1450,
    carrierTier: 'SAFEEXPRESS_PALLET',
    carrierName: 'Safeexpress / Gati B2B LTL Heavy',
    baseRates: { ZONE_A: 1350, ZONE_B: 1700, ZONE_C: 2450, ZONE_D: 3050, ZONE_E: 4900 },
  },
];

/**
 * Calculates delivery fee conforming strictly to the All-In Formula from docs/deliveryFee.md:
 * Total Delivery Fee = [Base Freight + Fragile Packaging + (2% FOV Insurance)] * 1.18 (GST)
 *
 * Enforces TAV-03 (Exactly two customer-facing price components: Product Price + Single Delivery Charge).
 */
export function calculateDeliveryFee(
  zoneCode: ShippingZoneCode,
  items: ItemPhysicalSpec[]
): ShippingCalculationResult {
  const zone = SHIPPING_ZONES[zoneCode];

  let totalActualWeightGrams = 0;
  let totalVolumetricWeightGrams = 0;
  let totalProductValueRupees = 0;

  for (const item of items) {
    totalActualWeightGrams += item.weightGrams;
    totalProductValueRupees += item.priceRupees;

    // Convert mm to cm with 2-inch (~5cm) fragile cushioning allowance on all sides
    // per docs/deliveryFee.md Step 1
    const lCm = (item.lengthMm + 50) / 10;
    const wCm = (item.widthMm + 50) / 10;
    const hCm = (item.heightMm + 50) / 10;

    // Standard surface volumetric formula: (L x W x H in cm) / 5000 = kg
    const volGrams = Math.round(((lCm * wCm * hCm) / 5000) * 1000);
    totalVolumetricWeightGrams += volGrams;
  }

  const actualWeightKg = Number((totalActualWeightGrams / 1000).toFixed(2));
  const volumetricWeightKg = Number((totalVolumetricWeightGrams / 1000).toFixed(2));
  const billableWeightKg = Math.max(actualWeightKg, volumetricWeightKg);

  // Find appropriate rate bracket
  const bracket =
    RATE_BRACKETS.find((b) => billableWeightKg <= b.maxWeightKg) ||
    RATE_BRACKETS[RATE_BRACKETS.length - 1];

  const baseFreight = bracket.baseRates[zoneCode];
  const packagingCost = bracket.packagingCostRupees;

  // Carrier's Risk (FOV Insurance): 2% of product value (Min ₹100 per deliveryFee.md)
  const insuranceFov = Math.max(100, Math.round(totalProductValueRupees * 0.02));

  // Pre-tax subtotal for freight benchmarking
  const preTaxFreightSubtotal = baseFreight + packagingCost + insuranceFov;

  // Snaps to approved 12-slab fee ladder (2026-11-06 Owner Policy)
  // Tax-inclusive final customer payable amount (TAV-03)
  const totalDeliveryFee = matchDeliveryFeeSlab(preTaxFreightSubtotal * 1.18);

  // Statutory GST @ 18% embedded within the tax-inclusive fee (CGST s.15(2)(c))
  const gstAmount = Math.round(totalDeliveryFee * (18 / 118));

  return {
    zone,
    carrierTier: bracket.carrierTier,
    carrierName: bracket.carrierName,
    actualWeightKg,
    volumetricWeightKg,
    billableWeightKg,
    packagingTier: bracket.packagingTier,
    packagingCostRupees: packagingCost,
    insuranceFovRupees: insuranceFov,
    baseFreightRupees: baseFreight,
    gstAmountRupees: gstAmount,
    totalDeliveryFeeRupees: totalDeliveryFee,
    transitDaysEstimate: `${zone.estimatedDaysMin}–${zone.estimatedDaysMax} business days`,
  };
}

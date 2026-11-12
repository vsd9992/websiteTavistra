import { z } from "zod";

export const QuoteLineItemSchema = z.object({
  name: z.string().trim().min(2, "Item name is required").max(200),
  finish: z.string().trim().max(120).optional().default(""),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(10000),
  unitPriceRupees: z.coerce.number().min(1, "Unit price must be positive").max(100000000),
});

export type QuoteLineItem = z.infer<typeof QuoteLineItemSchema>;

export interface QuoteTotals {
  itemsSubtotalRupees: number;
  deliveryChargeRupees: number;
  totalQuotedRupees: number;
  advanceRequiredRupees: number;
  balanceDueRupees: number;
}

/**
 * Authoritative two-component quote arithmetic (TAV-03 + TAV-07):
 * Items Subtotal + Custom Delivery/Crating Charge = Total Quoted Value.
 * Minimum 25% advance due on acceptance; 75% balance due post-QC before dispatch.
 */
export function computeQuoteTotals(
  lineItems: QuoteLineItem[],
  deliveryChargeRupees = 0
): QuoteTotals {
  const itemsSubtotalRupees = Math.round(
    lineItems.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPriceRupees), 0) * 100
  ) / 100;
  const cleanDelivery = Math.max(0, Math.round(Number(deliveryChargeRupees || 0) * 100) / 100);
  const totalQuotedRupees = Math.round((itemsSubtotalRupees + cleanDelivery) * 100) / 100;
  const advanceRequiredRupees = Math.round(totalQuotedRupees * 0.25 * 100) / 100;
  const balanceDueRupees = Math.round((totalQuotedRupees - advanceRequiredRupees) * 100) / 100;

  return {
    itemsSubtotalRupees,
    deliveryChargeRupees: cleanDelivery,
    totalQuotedRupees,
    advanceRequiredRupees,
    balanceDueRupees,
  };
}

/**
 * Formats line items + delivery + architectural brief into clean readable specifications.
 */
export function formatQuoteSpecificationsText(params: {
  lineItems: QuoteLineItem[];
  deliveryChargeRupees: number;
  notes?: string;
}): string {
  const totals = computeQuoteTotals(params.lineItems, params.deliveryChargeRupees);
  const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

  const itemLines = params.lineItems.map((item, idx) => {
    const lineTotal = item.quantity * item.unitPriceRupees;
    const finishText = item.finish?.trim() ? ` [${item.finish.trim()}]` : "";
    return `${idx + 1}. ${item.name.trim()}${finishText} × ${item.quantity} @ ${fmt(item.unitPriceRupees)} = ${fmt(lineTotal)}`;
  });

  const sections = [
    "ARCHITECTURAL LINE ITEMS:",
    ...itemLines,
    "",
    `Items Subtotal: ${fmt(totals.itemsSubtotalRupees)}`,
    `Custom Crating & Freight: ${totals.deliveryChargeRupees === 0 ? "Complimentary" : fmt(totals.deliveryChargeRupees)}`,
    `Total Quoted Commitment (Tax-Inclusive): ${fmt(totals.totalQuotedRupees)}`,
  ];

  if (params.notes?.trim()) {
    sections.push("", "PROJECT SCOPE & NOTES:", params.notes.trim());
  }

  return sections.join("\n");
}

/**
 * Safely parses stored lineItemsJson from QuoteVersion.
 */
export function parseQuoteLineItems(lineItemsJson?: string | null): QuoteLineItem[] {
  if (!lineItemsJson) return [];
  try {
    const parsed = JSON.parse(lineItemsJson);
    if (!Array.isArray(parsed)) return [];
    const result: QuoteLineItem[] = [];
    for (const row of parsed) {
      const validated = QuoteLineItemSchema.safeParse(row);
      if (validated.success) {
        result.push(validated.data);
      }
    }
    return result;
  } catch {
    return [];
  }
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function toIstDateKey(date: Date): string {
  return new Date(date.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/**
 * Computes exact IST Day 30 expiration timestamp (23:59:59.999 IST on issuance Day + 30).
 * Day 0 is the issuance IST calendar date; quote remains valid through 23:59:59 IST on Day 30.
 */
export function computeIstQuoteExpiry(issuedAt: Date = new Date()): Date {
  const istDayZeroStr = toIstDateKey(issuedAt);
  const [y, m, d] = istDayZeroStr.split("-").map(Number);
  const utcMidnightDayZero = Date.UTC(y, m - 1, d);
  const day30Str = new Date(utcMidnightDayZero + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  return new Date(`${day30Str}T23:59:59.999+05:30`);
}

/**
 * Evaluates authoritative expiry and IST calendar days remaining.
 */
export function getQuoteExpiryStatus(
  expiresAt: Date,
  status: string,
  now: Date = new Date()
): {
  isExpired: boolean;
  isAccepted: boolean;
  expiresToday: boolean;
  daysRemaining: number;
} {
  const isAccepted = status === "ACCEPTED";
  const deadline = new Date(expiresAt);
  const pastDeadline = now.getTime() > deadline.getTime();
  const isExpired = !isAccepted && (status === "EXPIRED" || pastDeadline);

  if (isExpired || isAccepted) {
    return {
      isExpired,
      isAccepted,
      expiresToday: false,
      daysRemaining: 0,
    };
  }

  const nowKey = toIstDateKey(now);
  const expKey = toIstDateKey(deadline);
  const nowUtcMid = Date.parse(`${nowKey}T00:00:00Z`);
  const expUtcMid = Date.parse(`${expKey}T00:00:00Z`);
  const daysRemaining = Math.max(0, Math.round((expUtcMid - nowUtcMid) / (24 * 60 * 60 * 1000)));

  return {
    isExpired: false,
    isAccepted: false,
    expiresToday: daysRemaining === 0,
    daysRemaining,
  };
}

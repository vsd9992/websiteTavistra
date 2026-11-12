import { OrderStatus, PurchaseMode } from "@tavistra/db";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface GraceWindowState {
  isGraceActive: boolean;
  graceDaysRemaining: number;
  daysElapsedIst: number;
  releaseEligibleDate: string | null;
}

/**
 * Computes Made-to-Order 7-calendar-day IST grace window.
 * Confirmation local IST date = Day 0; Day 7 ends 23:59:59 IST; Day 8 is earliest production start.
 */
export function computeGraceWindow(confirmedAt: Date | null): GraceWindowState {
  if (!confirmedAt) {
    return {
      isGraceActive: true,
      graceDaysRemaining: 7,
      daysElapsedIst: 0,
      releaseEligibleDate: null,
    };
  }

  const confirmedIstDay = Math.floor((new Date(confirmedAt).getTime() + IST_OFFSET_MS) / DAY_MS);
  const currentIstDay = Math.floor((Date.now() + IST_OFFSET_MS) / DAY_MS);
  const daysElapsedIst = Math.max(0, currentIstDay - confirmedIstDay);
  const isGraceActive = daysElapsedIst < 8;
  const graceDaysRemaining = isGraceActive ? Math.max(1, 8 - daysElapsedIst) : 0;

  // Compute Day 8 calendar date in IST for clear staff/customer display
  const day8IstMidnightUtc = (confirmedIstDay + 8) * DAY_MS - IST_OFFSET_MS;
  const releaseEligibleDate = new Date(day8IstMidnightUtc).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  return {
    isGraceActive,
    graceDaysRemaining,
    daysElapsedIst,
    releaseEligibleDate,
  };
}

export function safeParseQcImages(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((u): u is string => typeof u === "string" && u.trim().length > 0) : [];
  } catch {
    return [];
  }
}

export interface OrderPresentationInput {
  status: OrderStatus | string;
  purchaseMode: PurchaseMode | string;
  balanceAmount: number | { toNumber?: () => number } | string;
  amountPaid: number | { toNumber?: () => number } | string;
  carrierName?: string | null;
  trackingNumber?: string | null;
  confirmedAt?: Date | null;
}

export function deriveOrderStatusPresentation(order: OrderPresentationInput) {
  const balanceDue = Number(order.balanceAmount);
  const isFullyPaid = balanceDue <= 0;
  const isMto = order.purchaseMode === PurchaseMode.MADE_TO_ORDER || order.purchaseMode === "MADE_TO_ORDER";
  const grace = computeGraceWindow(order.confirmedAt ?? null);

  let paymentStatusLabel = "Pending Payment";
  if (order.status === "CANCELLED" || order.status === "REFUNDED") {
    paymentStatusLabel = "Cancelled & Refunded";
  } else if (isFullyPaid) {
    paymentStatusLabel = "100% Paid — Verified";
  } else if (Number(order.amountPaid) > 0) {
    paymentStatusLabel = "25% Advance Paid — Balance Due";
  }

  let statusLabel = "Order Confirmed";
  let statusDescription = "Consignment confirmed.";

  switch (order.status) {
    case "DELIVERED":
      statusLabel = "Delivered";
      statusDescription = `Consignment delivered cleanly by ${order.carrierName || "insured carrier"}${order.trackingNumber ? ` (AWB ${order.trackingNumber})` : ""}.`;
      break;
    case "DISPATCHED":
      statusLabel = "In Transit with Carrier";
      statusDescription = `Consignment handed over to ${order.carrierName || "carrier"} under AWB ${order.trackingNumber || ""}.`;
      break;
    case "AWAITING_DISPATCH":
      statusLabel = "100% Paid — Packing for Dispatch";
      statusDescription = "Cumulative 100% payment verified. Workshop packaging and insured carrier handover scheduling active.";
      break;
    case "PRODUCTION_COMPLETED":
      statusLabel = isFullyPaid
        ? "QC Verified — 100% Paid & Ready to Pack"
        : "Workshop Crafting Completed — QC Verified (Balance Due)";
      statusDescription = isFullyPaid
        ? "Quality control verified and full payment settled. Consignment moving to protective crating and carrier handover."
        : "Quality control verified and craftsman inspection photos published. Clear the remaining 75% balance to unlock courier dispatch.";
      break;
    case "IN_PRODUCTION":
      statusLabel = isFullyPaid
        ? "Machining in Progress (100% Paid)"
        : "Machining in Progress in Tavistra Workshop";
      statusDescription = isFullyPaid
        ? "Precision crafting and machining active in our studio workshop. Cumulative 100% payment already verified."
        : "Precision crafting and machining currently active in our studio workshop.";
      break;
    case "CANCELLED":
    case "REFUNDED":
      statusLabel = "Cancelled & Pre-Production Refunded";
      statusDescription = "Order cancelled cleanly prior to workshop dispatch with 100% full refund initiated.";
      break;
    case "CONFIRMED":
    default:
      if (isMto) {
        if (isFullyPaid) {
          statusLabel = grace.isGraceActive
            ? "100% Paid — 7-Day Grace Window Active"
            : "100% Paid — Ready for Workshop Release";
          statusDescription = grace.isGraceActive
            ? `Cumulative 100% payment verified (${grace.graceDaysRemaining} day(s) left in 7-day pre-production grace; crafting eligible ${grace.releaseEligibleDate || "Day 8"}).`
            : "Cumulative 100% payment verified and 7-day grace window elapsed. Ready for workshop release.";
        } else {
          statusLabel = grace.isGraceActive
            ? "25% Advance Paid — 7-Day Grace Window Active"
            : "25% Advance Paid — Ready for Workshop Release";
          statusDescription = grace.isGraceActive
            ? `25% advance verified. Physical workshop machining begins on Day 8 (${grace.releaseEligibleDate || "after 7-day grace"}). 100% refund cancellation permitted during grace.`
            : "7-day confirmation grace elapsed. Consignment eligible for workshop release.";
        }
      } else {
        statusLabel = "100% Paid — Crating for Dispatch";
        statusDescription = "100% upfront payment verified. Consignment crated and scheduled for courier handover.";
      }
      break;
  }

  return {
    isFullyPaid,
    paymentStatusLabel,
    statusLabel,
    statusDescription,
    graceDaysRemaining: grace.graceDaysRemaining,
    isGraceActive: grace.isGraceActive,
    releaseEligibleDate: grace.releaseEligibleDate,
  };
}

import { z } from 'zod';

export * from './shipping';
export * from './pincodes';
export * from './pincodeData';
export * from './validation';
export * from './quotes';

/**
 * Tavistra Purchase Modes (Independent lifecycles per TAV-04)
 */
export const PurchaseModeEnum = z.enum([
  'READY_STOCK',
  'MADE_TO_ORDER',
  'QUOTE_ONLY',
]);
export type PurchaseMode = z.infer<typeof PurchaseModeEnum>;

/**
 * Payment Policy Constants (Strictly matching TAV-03, TAV-06, TAV-07)
 */
export const PAYMENT_POLICY = {
  MTO_ADVANCE_MIN_PERCENT: 25,
  MTO_BALANCE_PERCENT: 75,
  QUOTE_ADVANCE_MIN_PERCENT: 25,
  QUOTE_BALANCE_PERCENT: 75,
  DISPATCH_REQUIRED_PERCENT: 100,
  QUOTE_VALIDITY_DAYS: 30,
  CONFIRMED_ORDER_GRACE_DAYS: 7,
} as const;

/**
 * Money calculation utilities (Two-component pricing: Price + Shipping)
 */
export function calculateOrderSummary(params: {
  itemPrices: number[];
  shippingCharge: number;
  mode: PurchaseMode;
}): {
  itemsSubtotal: number;
  shippingCharge: number;
  totalAmount: number;
  advanceDueNow: number;
  balanceDueBeforeDispatch: number;
} {
  const itemsSubtotal = params.itemPrices.reduce((acc, curr) => acc + curr, 0);
  const totalAmount = itemsSubtotal + params.shippingCharge;

  if (params.mode === 'MADE_TO_ORDER' || params.mode === 'QUOTE_ONLY') {
    // 25% minimum advance on total order commitment
    const advanceDueNow = Math.round(totalAmount * (PAYMENT_POLICY.MTO_ADVANCE_MIN_PERCENT / 100));
    const balanceDueBeforeDispatch = totalAmount - advanceDueNow;

    return {
      itemsSubtotal,
      shippingCharge: params.shippingCharge,
      totalAmount,
      advanceDueNow,
      balanceDueBeforeDispatch,
    };
  }

  // Ready Stock: 100% upfront
  return {
    itemsSubtotal,
    shippingCharge: params.shippingCharge,
    totalAmount,
    advanceDueNow: totalAmount,
    balanceDueBeforeDispatch: 0,
  };
}

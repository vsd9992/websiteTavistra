import { z } from 'zod';

/**
 * Tavistra Purchase Modes (Independent lifecycles)
 */
export const PurchaseModeEnum = z.enum([
  'READY_STOCK',
  'MADE_TO_ORDER',
  'QUOTE_ONLY',
]);
export type PurchaseMode = z.infer<typeof PurchaseModeEnum>;

/**
 * Payment Policy Constants
 */
export const PAYMENT_POLICY = {
  MTO_ADVANCE_MIN_PERCENT: 25,
  QUOTE_ADVANCE_MIN_PERCENT: 25,
  DISPATCH_REQUIRED_PERCENT: 100,
  QUOTE_VALIDITY_DAYS: 30,
  CONFIRMED_ORDER_GRACE_DAYS: 7,
} as const;

/**
 * Basic Money representation (integer minor units / paise for precision)
 */
export const MoneySchema = z.object({
  amountPaise: z.number().int().nonnegative(),
  currency: z.literal('INR').default('INR'),
});
export type Money = z.infer<typeof MoneySchema>;

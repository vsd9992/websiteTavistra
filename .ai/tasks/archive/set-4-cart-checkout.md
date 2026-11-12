# Task: Set 4 — Cart Governance, Delivery Engine & Ready Stock / MTO Checkout

**Status:** COMPLETED & VERIFIED ON DEVMACHINE (2026-11-12)  
**Created:** 2026-11-12  
**Completed:** 2026-11-12  
**Owner:** Antigravity / User  
**Package:** Isolated Set 4 (Cart & Checkout End-to-End Integrity)  
**Dependencies:** Set 3 (Customer Identity, Authentication, Addresses & Privacy Isolation — Completed & Verified)

## Implemented Changes
1. **Cumulative 10-Unit / 10-Line Bulk Boundary (`packages/shared/src/shipping.ts`)**:
   - Enforced cumulative `totalUnits <= 10` (`EXCEEDS_MAX_TOTAL_UNITS`) alongside per-product `<= 10` (`EXCEEDS_MAX_UNITS_PER_PRODUCT`) and `<= 10` distinct lines (`EXCEEDS_MAX_DISTINCT_LINES`).
2. **Variant-Isolated Cart & UI (`apps/storefront/src/context/CartContext.tsx`, `lib/products.ts`, `ProductInteractiveClient.tsx`, `ProductPurchaseAction.tsx`, `app/cart/page.tsx`)**:
   - Keyed cart lines by `variantId || sku || id` via `getCartLineKey()` so distinct variants of the same product remain distinct cart rows with thumbnails, variant titles, SKUs, line subtotals, and `availableStock` limits (Ready Stock `stock <= 0` blocks Add to Cart).
   - Consolidated Ready Stock / Made to Order views in `/cart` and invalidated stale shipping calculations on cart mutations.
3. **Zero Static PIN Fallback (`DeliveryEstimator.tsx`, `/cart/page.tsx`, `/checkout/page.tsx`)**:
   - Removed stale static `lookupPincode()` / `calculateDeliveryFee()` fallback across PDP, Cart, and Checkout; only DB-backed `POST /api/shipping/calculate` is authoritative.
4. **Authoritative Server Checkout & Atomic Stock (`apps/storefront/src/app/api/orders/route.ts`, `OrderContext.tsx`, `/checkout/page.tsx`)**:
   - Enforced `MAINTENANCE_MODE` `503` gate, strict contact/PIN/GSTIN validation, `MIXED_PURCHASE_MODE` `400` gate, `QUOTE_ONLY` `400` gate, cumulative `checkBulkOrderCeiling` `400` gate, DB catalog/variant price + 12-slab/override shipping recomputation (immune to client tampering), atomic `$transaction` `InventoryLedger` decrement (`409 INSUFFICIENT_STOCK`) + `StockMovement` (`ORDER_FULFILLED`), Ready Stock `100%` (`FULL_PAYMENT`) vs. Made to Order `25%` advance / `75%` balance (`ADVANCE_25` + `confirmedAt` grace clock), and `[Tavistra]` email confirmation.
   - `OrderContext.saveOrder` awaits server persistence and returns structured failures without clearing the cart or showing a fake receipt.

## Live Verification Summary (`devMachine` `192.168.1.100`)
- `pnpm --filter @tavistra/db test:set4`: **20/20 PASSED (0 FAILED)** (`packages/db/tests/verify-set4-cart-checkout.ts`)
- `pnpm --filter @tavistra/db test:set3`: **54/54 PASSED (0 FAILED)** (`packages/db/tests/verify-set3-customer-identity.ts` aligned to authoritative ₹15,500 order total)
- `pnpm --filter @tavistra/db test:set2`: **68/68 PASSED (0 FAILED)**

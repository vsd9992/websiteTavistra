# Task: Set 5 — Order Tracking, 7-Day Grace, QC Photos & 75% Balance Gate

**Status:** COMPLETED & VERIFIED ON DEVMACHINE (2026-11-12)  
**Created:** 2026-11-12  
**Completed:** 2026-11-12  
**Owner:** Antigravity / User  
**Package:** Isolated Set 5 (Post-Order Production, Fulfillment & Balance Lifecycle)  
**Dependencies:** Set 4 (Cart Governance, Delivery Engine & Ready Stock / MTO Checkout — Completed & Verified)

## Implemented Changes
1. **Shared Order Presentation & `ACC-04` Fix (`apps/storefront/src/lib/orderStatus.ts`, `/api/orders`, `/api/account/orders`, `/account/orders/page.tsx`)**:
   - Unified IST 7-day grace window calculation (`computeGraceWindow`), status labels/descriptions, and payment status badges (`100% Paid — Verified` vs. `25% Advance Paid — Balance Due`) in `orderStatus.ts`.
   - Fixed `/account/orders` to display accurate live balance-cleared badges, QC photo readiness pills, direct `Pay Balance` controls, and `no-store` fetches.
2. **Accurate Tracking Stepper & Direct `/orders/[id]` Privacy (`apps/storefront/src/app/track/page.tsx`, `/orders/[id]/page.tsx`, `not-found.tsx`)**:
   - Fixed Ready Stock pre-dispatch vs. `DISPATCHED` vs. `DELIVERED` stepper states and MTO grace countdown / `CANCELLED` callouts on `/track`.
   - Added `/orders/[id]` (`Suspense` + `connection()` for `cacheComponents`) with authenticated-owner/contact privacy and a clean Not Found UI (`SEC-03`).
3. **Server State Machine, Grace Cutoff, Real QC Photo Upload & 100% Dispatch Gate (`/api/orders/[id]`, `/pay-balance`, `/api/admin/orders/[id]/qc-upload`, `apps/admin/src/App.tsx`)**:
   - Enforced strict 7-day IST grace lockout on `RELEASE_TO_WORKSHOP` (`400 GRACE_WINDOW_ACTIVE`), minimum 25% advance gate, `409 ALREADY_RELEASED` duplicate guard, and transactional `AuditLog` entries.
   - Added real QC image file upload (`POST /api/admin/orders/[id]/qc-upload` -> `/uploads/qc/<orderNumber>/...`) + preview/remove UI in Admin Modal and inline `DISPATCH_BLOCKED` (`400`) + disabled AWB controls whenever `balanceAmount > 0`.
   - Upgraded Admin `ORDERS` (Status filters, details QC preview), `PRODUCTION` (`CONFIRMED` grace matching, PIN feasibility badge, fail-loud errors), and `DISPATCH` (`Copy Balance Link` using live storefront port/clipboard, `Mark Delivered`).
   - Added pre-production cancellation refund ledger (`PaymentType.REFUND`) and Ready Stock `InventoryLedger` (`RETURN_RESTOCK`) restoration.

## Live Verification Summary (`devMachine` `192.168.1.100`)
- `pnpm --filter @tavistra/db test:set5`: **21/21 PASSED (0 FAILED)** (`packages/db/tests/verify-set5-order-tracking.ts`)
- `pnpm --filter @tavistra/db test:set4`: **20/20 PASSED (0 FAILED)**
- `pnpm --filter @tavistra/db test:set3`: **54/54 PASSED (0 FAILED)**
- `pnpm --filter @tavistra/db test:set2`: **68/68 PASSED (0 FAILED)**

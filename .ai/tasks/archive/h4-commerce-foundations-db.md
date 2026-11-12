# Task: H4 Core Commerce Foundations & Database Schema

**Status:** COMPLETED  
**Created:** 2026-11-05  
**Completed:** 2026-11-06  
**Owner:** Antigravity / User  
**Package:** H4 (Commerce Foundations)

## Context & Objectives
Having completed the review-ready public storefront shell (H2), we now establish the authoritative backend commerce foundations in `packages/db` and `packages/shared` matching the locked 2026-11-04 handoff baseline (TAV-02, TAV-03, TAV-05, TAV-06, TAV-07, TAV-12, TAV-13).

## Key Deliverables
1. **Prisma Setup in `packages/db`**:
   - `package.json`, `tsconfig.json`, `prisma/schema.prisma`, Prisma Client generation script.
2. **Authoritative Data Schema**:
   - `User`, `StaffRole`, `AuditLog` (RBAC & immutable audit trail).
   - `Product`, `ProductVariant`, `Category`, `Collection` (Catalogue truth, specifications, materials, weight/dimensions).
   - `PurchaseMode` enum: `READY_STOCK`, `MADE_TO_ORDER`, `QUOTE_ONLY`.
   - `InventoryLedger` & `StockReservation` (Concurrently safe stock control, prevents overselling).
   - `Order`, `OrderItem`, `OrderStatus` (Mode-separated lifecycle, 25% advance vs 100% full balance tracking).
   - `PaymentLedger` (Payment records, gateway references, advance vs balance reconciliation).
   - `ShippingZone` & `PincodeDirectory` (Commercial distance bands, universal enabled-PIN serviceability).
   - `QuoteProposal` & `QuoteVersion` (30-day quote price lock, 7-day confirmation grace).
3. **Shipping & Commerce Engine (`packages/shared`)**:
   - Approved 12-slab fee ladder: `0, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500` INR.
   - Highest-product-fee calculation rule for multi-item checkout (TAV-03 compliant single combined fee).
   - Bulk order threshold check: enforces <= 10 units per SKU and <= 10 line items, redirecting excess to Bulk Order Enquiry.
4. **Catalogue & Zone Seeding**:
   - Seed script importing the 6 approved categories, initial products, and candidate PIN codes into the database.
5. **Monorepo Integration**:
   - Link `packages/db` and `packages/shared` to `apps/storefront` and `apps/admin`.


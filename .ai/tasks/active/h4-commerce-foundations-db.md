# Task: H4 Core Commerce Foundations & Database Schema

**Status:** IN PROGRESS  
**Created:** 2026-11-05  
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
   - `ShippingZone` & `PincodeRange` (Zones A, B, C, D distance bands).
   - `QuoteProposal` & `QuoteVersion` (30-day quote price lock, 7-day confirmation grace).
3. **Shipping Calculation Engine (`packages/shared`)**:
   - Distance band resolver mapping destination PIN code to Zone A/B/C/D.
   - Presumptive freight charge calculator based on product volumetric weight and zone.
4. **Catalogue & Zone Seeding**:
   - Seed script importing the 6 approved categories, initial products, and shipping matrix into the database.
5. **Monorepo Integration**:
   - Link `packages/db` and `packages/shared` to `apps/storefront` and `apps/admin`.

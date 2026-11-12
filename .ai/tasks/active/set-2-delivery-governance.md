# Task: Set 2 — Delivery PIN Governance, Zones, 12-Slab Engine, Studio Controls & Institutional Copy

**Status:** ACTIVE (Reopened for full Admin + Customer PIN Hierarchy & DB 12-Slab Management)  
**Created:** 2026-11-12  
**Owner:** Antigravity / User  
**Package:** Isolated Set 2 (Logistics Governance & Studio Operational Controls)  
**Dependencies:** Set 1 (Product Content & Multi-Variant Engine — Completed & Verified)

## Context & Audit Findings
Following owner review of Set 2, initial API endpoints existed but full operational governance from both **Admin** and **Customer** viewpoints was incomplete:
- Admin "Delivery PINs" only listed ~20 coarse prefixes with no UI to manage nested 6-digit PINs, add/edit/delete overrides, import the 884 urban hub PINs, or simulate hierarchical PIN resolution.
- The 12 delivery fee slabs (`0..7500`) and rate brackets were hardcoded in `packages/shared/src/shipping.ts` instead of living in PostgreSQL with Admin UI management, zone editing, and product-by-zone overrides.
- Customer PDP/Cart/Checkout calculated fees client-side using static TypeScript rates instead of querying live DB rates.

## Complete Deliverables (Admin & Customer Viewpoints)
1. **Hierarchical Delivery PIN Governance (DB + API + Admin UI)**:
   - Enhanced `PincodeRange` schema (`cityLabel`, `unserviceableReason`, `source`, unique `pincodePrefix`).
   - Strict longest-prefix-first lookup (`6-digit exact` -> `4-digit` -> `3-digit` -> `2-digit` -> urban fallback).
   - Admin PIN Management: Live 6-digit PIN simulator + 1-click nested override creation, "+ Add PIN / Prefix Rule" form, 884 Urban Hub PIN importer, Zone/Specificity/Status filters, search, pagination, inline toggle, and delete.
2. **DB-Backed 12-Slab Fee Ladder, Zone Configuration & Product Overrides**:
   - Schema additions: `DeliveryRateRule` (5 Weight/Volumetric Brackets × 5 Zones mapped to the 12 slabs) and `ProductDeliveryOverride` (optional product × zone slab assignment).
   - `SystemSetting` key `DELIVERY_FEE_SLABS` storing the configurable 12-slab ladder.
   - All 5 Shipping Zones (`ZONE_A`..`ZONE_E`) seeded and editable in Admin (name, region, transit days min/max).
   - Authoritative server endpoint `POST /api/shipping/calculate` (used by Customer PDP, Cart, Checkout, and Order creation) enforcing Product Override -> DB Tier Matrix -> 12-Slab Ladder -> Multi-Item Highest Product Fee Rule -> Two-Component Pricing.
3. **Studio Controls & Operating Modes**:
   - `MAINTENANCE_MODE`, `STUDIO_HIATUS`, `ANNOUNCEMENT_BANNER` management in Admin Settings & live enforcement on Storefront Header and Checkout.
4. **Institutional Copy & Brand Compliance**:
   - Strict **VDesign** entity nomenclature, prohibited term avoidance, and `/shipping` policy alignment.


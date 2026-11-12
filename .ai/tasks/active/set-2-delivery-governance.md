# Task: Set 2 — Delivery PIN Governance, Zones, Studio Controls & Institutional Copy

**Status:** ACTIVE  
**Created:** 2026-11-12  
**Owner:** Antigravity / User  
**Package:** Isolated Set 2 (Logistics Governance & Studio Operational Controls)  
**Dependencies:** Set 1 (Product Content & Multi-Variant Engine — Completed)

## Context & Objectives
Finalize and harden Set 2 as an isolated functional unit, ensuring postal code serviceability governance, the 12-slab delivery fee calculation engine, studio operating controls (maintenance and hiatus modes), and institutional policy compliance (brand entity "VDesign") are fully operational and verified live on `devMachine` (`192.168.1.100`).

## Core Deliverables
1. **Delivery PIN Governance & Logistics Engine**:
   - `PincodeRange` and `ShippingZone` database records and seeding.
   - Public PIN validation endpoint (`GET /api/pincodes/check?pincode=XXXXXX`) returning serviceability status, zone name, estimated transit days, and fee tier.
   - Admin Logistics & PIN Directory: Interface to search PIN codes, view delivery zones, and toggle serviceability (`ACTIVE` / `SUSPENDED`) with instant database reflection.
   - Verification of 12-slab delivery fee engine against distance zones (Local Studio, Regional, National, Remote).
2. **Studio Controls & Operating Modes**:
   - `SystemSetting` model management (`MAINTENANCE_MODE`, `STUDIO_HIATUS`, `ANNOUNCEMENT_BANNER`).
   - Admin Settings Tab: Real-time toggles with optimistic UI, persistence, and instant status updates.
   - Storefront Hiatus Bar: Header rendering luxury announcement banner when active.
   - Storefront Maintenance Blocker: Graceful checkout freezing and informative notice when maintenance mode is active.
3. **Institutional Copy & Brand Compliance**:
   - Verify strict brand entity nomenclature: **VDesign** (never "VDesign Studio", prohibited term: "Commission").
   - Review and align institutional policy pages: `/shipping-policy`, `/terms`, `/privacy`, `/refund-policy`, `/about`, `/contact`.


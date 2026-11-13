# Task: Set 8 — Staff Administration Portal, Role-Based Access Control (RBAC) & Final Pre-Live Runbook Sweep

**Status:** COMPLETED & ARCHIVED  
**Created:** 2026-11-13  
**Completed:** 2026-11-13  
**Owner:** Antigravity / User  
**Package:** Isolated Set 8 (Staff Admin Workbench, RBAC & Acceptance Sweep)  
**Dependencies:** Sets 0–7 Complete & Verified Live on `devMachine` (226/226 checks passed)  
**Verification Result:** 40/40 checks passed live (`pnpm test:set8`); Full Monorepo Regression Suite: 268/268 checks passing (100%).

---

## 1. Summary of Completed Deliverables

### A. Role-Based Access Control (RBAC) Engine (`apps/admin/src/rbac.ts`)
- Explicit 4-role permission mapping:
  - `SUPER_ADMIN` (Ar. Vikramaditya): 11/11 tabs permitted, 11/11 actions permitted.
  - `COMMERCE_ADMIN` (Pooja Mehta): 8 tabs permitted, 7 actions permitted (`DISPATCH_AWB`, `ORDER_REFUND_MANAGE`, `ORDER_CANCEL`, `PROPOSAL_CREATE_REVISE`, `CATALOGUE_MUTATE`, `PINCODES_MUTATE`, `AUDIT_VIEW`). Restricted from workshop release and root settings.
  - `PRODUCTION_STAFF` (Rajesh Sharma): 6 tabs permitted, 4 actions permitted (`WORKSHOP_RELEASE`, `QC_PHOTO_UPLOAD`, `DISPATCH_AWB`, `AUDIT_VIEW`). Restricted from tickets, quotes, PIN codes, catalogue mutations, and settings.
  - `SUPPORT_STAFF` (Kavita Rao): 6 tabs permitted, 2 actions permitted (`TICKET_MANAGE`, `ORDER_CANCEL`). Restricted from production release, QC photo upload, catalogue edit, logistics matrix, and settings.
- Enforced tab-level accessibility with visual lock indicators (`🔒`) and fallback routing.
- Granular action guards implemented across all administrative state transitions.
- Logistics tab (`LogisticsTab.tsx`) integrated with `staffRole` and `PINCODES_MUTATE` protection.

### B. Phase 7: Staff Administration Operations Runbook (ADM-01 to ADM-12)
- **ADM-01:** Orders worklist with dynamic status filters (All, Confirmed, In Production, QC, Dispatched, Cancelled).
- **ADM-02:** 7-Day grace period tracker with live countdown badges and release eligibility gates.
- **ADM-03:** Strict hard dispatch lockout banner and disabled courier AWB inputs whenever `balanceDue > 0`.
- **ADM-04:** One-click balance payment link copy resolving directly to `/track?orderId=...`.
- **ADM-05:** Dispatch & AWB unlocking immediately upon 100% balance clearance.
- **ADM-06:** Multi-image workshop QC photo upload and craftsman inspection publishing.
- **ADM-07:** Catalogue draft/publish toggle immediately reflected on storefront `/shop`.
- **ADM-08:** Markdown catalogue sync and individual file ingestion from `docs/products`.
- **ADM-09:** Delivery PIN code active/inactive toggle with instant storefront checkout enforcement.
- **ADM-10:** Studio Maintenance Mode toggle freezing storefront checkout with banner notice (HTTP 503).
- **ADM-11:** Studio Hiatus toggle and broadcast announcement banner across all storefront pages.
- **ADM-12:** Customer directory inspection with lifetime spend, order count, and verified addresses.

### C. Phase 8: Security, Integrity & Non-Functional Audit (SEC-01 to SEC-05)
- **SEC-01:** Standard responsive viewport meta tag configured across all public storefront routes.
- **SEC-02:** Zero secret exposure; public endpoints and client bundles clean of database credentials or keys.
- **SEC-03:** Direct URL tampering resilience; invalid order/quote IDs return elegant luxury 404 views without stack traces.
- **SEC-04:** Negative quantity and price tampering rejection on checkout API (HTTP 400).
- **SEC-05:** Concurrent state consistency between Admin updates and Storefront live tracking queries.

---

## 2. Automated Test Verification Results (Live on `devMachine`)

```
=======================================================
  SET 8 RESULTS: 40/40 PASSED (0 FAILED)
=======================================================

Total Monorepo Suite Pass Count:
- Set 2 (Delivery Governance): 68/68 passed
- Set 3 (Customer Identity): 54/54 passed
- Set 4 (Cart & Checkout): 20/20 passed
- Set 5 (Order Tracking): 23/23 passed
- Set 6 (Quotes & Inquiries): 25/25 passed
- Set 7 (Support Tickets): 38/38 passed
- Set 8 (Staff Admin & RBAC): 40/40 passed
TOTAL: 268 / 268 PASSED (100%)
```

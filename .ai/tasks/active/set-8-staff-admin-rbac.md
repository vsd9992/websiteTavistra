# Task: Set 8 — Staff Administration Portal, Role-Based Access Control (RBAC) & Final Pre-Live Runbook Sweep

**Status:** ACTIVE — In Progress  
**Created:** 2026-11-13  
**Owner:** Antigravity / User  
**Package:** Isolated Set 8 (Staff Admin Workbench, RBAC & Acceptance Sweep)  
**Dependencies:** Sets 0–7 Complete & Verified Live on `devMachine` (226/226 checks passed)

## Scope & Deliverables

1. **Role-Based Access Control (RBAC) Engine in Admin Portal (`apps/admin`):**
   - Explicit permissions matrix for all 4 staff roles:
     - `SUPER_ADMIN` (Ar. Vikramaditya): Unrestricted access to all 11 tabs, full operational, catalogue, logistics, financial, and settings authority.
     - `COMMERCE_ADMIN`: Full access to Catalogue, Proposals/Quotes, Inquiries, Delivery PINs & Logistics, Customers, and Orders. Restricted from root system maintenance overrides.
     - `PRODUCTION_STAFF` (Rajesh Sharma): Focused access to Orders, 7-Day Grace Countdown, Workshop Machining Release, and QC Photo Uploads. Restricted from customer desk tickets, proposal creation, PIN alterations, and system settings.
     - `SUPPORT_STAFF` (Kavita Rao): Focused access to Support Tickets Desk, Customer Inquiries, Customer Directory, and Orders tracking. Restricted from workshop production release, catalogue editing, logistics matrix, and system maintenance.
   - Interactive role switching with visual badges, tab locking, and granular action-level permission guards.

2. **Phase 7: Staff Administration Operations Runbook Verification (ADM-01 to ADM-12):**
   - **ADM-01:** Orders worklist with dynamic status filters (All, Confirmed, In Production, QC, Dispatched, Cancelled).
   - **ADM-02:** 7-Day grace period tracker with live countdown badges and release eligibility gates.
   - **ADM-03:** Strict hard dispatch lockout banner and disabled courier AWB inputs whenever `balanceDue > 0`.
   - **ADM-04:** One-click balance payment link copy.
   - **ADM-05:** Dispatch & AWB unlocking immediately upon 100% balance clearance.
   - **ADM-06:** Multi-image workshop QC photo upload and craftsman inspection publishing.
   - **ADM-07:** Catalogue draft/publish toggle immediately reflected on storefront `/shop`.
   - **ADM-08:** Markdown catalogue sync and individual file ingestion from `docs/products`.
   - **ADM-09:** Delivery PIN code active/inactive toggle with instant storefront checkout enforcement.
   - **ADM-10:** Studio Maintenance Mode toggle freezing storefront checkout with banner notice.
   - **ADM-11:** Studio Hiatus toggle and broadcast announcement banner across all storefront pages.
   - **ADM-12:** Customer directory inspection with lifetime spend, order count, and verified addresses.

3. **Phase 8: Security, Integrity & Non-Functional Audit Verification (SEC-01 to SEC-05):**
   - **SEC-01:** Responsive design and touch targets across viewports.
   - **SEC-02:** Zero secret exposure in client bundles or network responses.
   - **SEC-03:** Direct URL tampering resilience (graceful luxury 404 on `/orders/FAKE` and `/quote/FAKE`).
   - **SEC-04:** Negative quantity and price tampering rejection on cart and checkout APIs.
   - **SEC-05:** Concurrent state consistency between Admin updates and Storefront live queries.

4. **Automated Verification Suite:**
   - Author `packages/db/tests/verify-set8-staff-admin-rbac.ts` (`pnpm test:set8`) verifying ADM-01 through ADM-12, SEC-01 through SEC-05, and RBAC permissions.


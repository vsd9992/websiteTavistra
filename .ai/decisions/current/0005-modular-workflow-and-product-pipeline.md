# Decision 0005: Modular Workflow Phasing Strategy & Product Content Pipeline Architecture

**Status:** APPROVED (2026-11-13)  
modified: 2026-11-13  
**Context:** Following preliminary manual review of the pre-live acceptance runbook, full end-to-end UAT was split into isolated, strictly dependency-ordered functional sets (Sets 0 through 8) verified independently on `devMachine` (`192.168.1.100`).

## Decisions

### 1. Phasing & Status Model
- **Set 0 (Completed & Verified):** Runtime & Admin Proxy Connectivity (`stop-production.sh` / `start-production.sh` + Vite API proxy).
- **Set 1 (Completed & Verified):** Product Content, Markdown Specification, Folder Media Sync, Variant Overrides & Multi-Variant Engine.
- **Set 2 (Completed & Verified — 68/68):** Delivery PIN Governance (Strict 6-Digit Whitelist & 2-Level Region Drill-Down), 12-Slab Zones Matrix, Studio Controls & Institutional Copy.
- **Set 3 (Completed & Verified — 54/54):** Customer Identity, Hardened Email/Phone/Password/GSTIN Validation, Email & TOTP MFA, Password Change, Addresses, Privacy Isolation & Tavistra Branding.
- **Set 4 (Completed & Verified — 20/20):** Cart Governance (Cumulative 10-Unit/10-Line Bulk Boundary), Variant-Isolated Cart (`variantId || sku || id`), Zero-Fallback DB Shipping, Maintenance Gate, Server Pricing/Stock Atomic Checkout & Ready Stock (`100%`) / MTO (`25%/75%`).
- **Set 5 (Completed & Verified — 23/23):** Order Tracking & Account History Accuracy (`ACC-04`), 7-Day IST Grace Release Cutoff, Real QC Photo Upload (`/uploads/qc/...`), Hard 100% Dispatch Lockout, 75% Balance Gate, Delivery Completion, Site-Wide Order Cancellation & Refund Tracking (Customer Account, `/track`, Admin UTR/Gateway Ledger, Net Revenue & Refund Reporting) & `/orders/[id]` Guard (`SEC-03`).
- **Set 6 (Completed & Verified — 23/23):** 30-Day Architectural Quotes & Bulk Enquiry Lifecycle (Multi-Line Items, 25% Advance Calculation, N+1 Revisions with 30-Day Clock Preservation, Exact-Version MTO Acceptance, Bidirectional Inquiry ↔ Quote ↔ Order Linkage, Order Cancellation & 100% Pre-Production Statutory Refund Email Dispatch & Inquiry Status Synchronization).
- **Set 7 (Completed Locally — Pending Cloud Sync / devMachine Run):** Support Tickets, Threaded Messaging & Client Concierge Desk (TCK-01 to TCK-05). Dual-mode `/contact` form, `TCK-YYYY-NNNN` sequence, phone/email validation, priority auto-escalation, threaded messaging, outbound Mailpit emails, `/track?ticket=...` customer response & auto-reopen, admin multi-filter workbench (status/priority/category/search), one-click resolution, and bidirectional order cross-linking.
- **Set 8 (Next):** Staff Authentication, RBAC & Final Acceptance Runbook Sweep.

### 2. Product Content & Folder Structure (Set 1 Revised)
- Each product is authored as a normal folder under `docs/products/` (`.zip` archive upload/extraction removed per owner instruction):
  ```
  docs/products/<product-slug>/
    ├── <product-slug>.md   (Master Markdown + YAML frontmatter)
    └── images/             (Local media assets copied directly to storage)
  ```
- Ingestion & storage: Admin Catalogue `/api/admin/catalogue/import` syncs product folders directly from disk (`syncAllMarkdownEditionsFromDisk`) or imports single `.md` specifications into PostgreSQL and persistent host storage (`/uploads/products/<slug>/...`).
- Variant override & inheritance model:
  - Variants define individual `sku`, `title`, tax-inclusive price, stock, and per-variant `images[]`.
  - Variant attributes (`description`, dimensions, `weightGrams`, `returnWindowDays`, craft/care notes) override master values when provided and cleanly inherit omitted attributes from the master specification.
  - Storefront PDP displays capsule variant selectors with per-variant pricing, switches variant gallery images, binds live `.md` specs, and places the Delivery & Transit Estimator directly below Add to Cart.

### 3. Client Concierge Desk Architecture (Set 7)
- **Ticket Sequence & Storage:** `TCK-YYYY-NNNN` generated sequentially; stored in `SupportTicket` with relational `TicketMessage[]`.
- **Intake Categories:** `ORDER_INQUIRY`, `SPEC_ALTERATION`, `DELIVERY_SCHEDULE`, `DAMAGE_REPORT`, `CANCELLATION`, `GENERAL_ASSISTANCE`. `DAMAGE_REPORT` and `CANCELLATION` auto-escalate to `HIGH` priority.
- **Notification Pipeline:** Initial registration and staff replies dispatch luxury-branded Tavistra notification emails via Mailpit containing conversational excerpts and direct tracking links.
- **State Machine:** `OPEN` -> `IN_PROGRESS` (upon staff reply) -> `RESOLVED` (admin action) -> `IN_PROGRESS` (automatically re-opened if customer replies to a resolved ticket).
- **Bidirectional Cross-Linking:** Tickets link to order reference (`orderNumber`). Storefront order cards/tracking feature direct "Raise Support Ticket" shortcuts; Admin ticket workbench enables 1-click inspection of the linked order.

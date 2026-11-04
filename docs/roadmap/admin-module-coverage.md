# Tavistra — Administration module and use-case coverage audit

**Date:** 2026-10-28
**Phase:** 1 — complete website blueprint
**Status:** DRAFT module grouping, not approved admin navigation, exact screens, API, or implementation.
**Sources:** decision register, website requirements, architecture, WEB-042 lifecycle matrix.

## Locked scope and sequencing

WEB-006 LOCKED: manage catalogue, prices, stock, batches, orders, customers, shipping and roles. WEB-009 LOCKED: separate logical storefront and admin with shared backend. WEB-007/008 LOCKED: editorial Markdown/media separated from transactional commercial records. WEB-022 LOCKED: detailed storefront experience before detailed admin UI. OPS-001/002/003 LOCKED: logs, monitoring/recovery and support-case workflow. WEB-019 LOCKED: manual courier tracking. Other later decisions impose explicit delivery quote and production-release permissions and audit requirements. This is an **inventory of functions** only; it does not advance detailed admin UI ahead of the storefront.

## Draft functional modules and coverage

| Module | Primary use cases | Authority | Coverage / gaps |
|---|---|---|---|
| Admin entry and overview | Authenticate staff, route by permitted functions, see relevant work/health summary | WEB-009, WEB-006, OPS-001 | Auth/permissions required; dashboard depth DRAFT, not a mandatory analytics suite |
| Catalogue and editorial publishing | Manage products, variants, photos, Markdown metadata, preview/publish, collections, SEO and merchandising | WEB-006/007/008; WEB-020 publishing pipeline PROPOSED | Scope established; publishing validation and exact page split to be designed |
| Commercial price and tax | Maintain SKU/variant selling prices, tax basis, discounts and authoritative offers | WEB-006/008; WEB-040E/N | Two customer-facing price components LOCKED; coupon policy OPEN |
| Inventory and batches | Record stock, batches, reservations/adjustments, guard oversell and release reserved stock | WEB-006/008; WEB-040AG/AI/AJ | Mixed-order/manual-quote reservation rules partly LOCKED; full inventory UX DRAFT |
| Orders and payments | View/manage orders, payment reconciliation, failures, refund handling, order history | WEB-006/008; WEB-018 DEFERRED | Payment provider DEFERRED; refund policies and exact state actions not assumed |
| Production | Review Made to Order lines, attest irreversible readiness, release individual or all remaining lines after verified full payment | WEB-040AK–AZ; WEB-042 | Detailed release rules LOCKED; later physical production stages/queues not automatically specified |
| Custom enquiries and manual quotes | Triage custom enquiries; prepare delivery estimates; permission-gated manual quote approval and unpaid-order lifecycle | WEB-004; WEB-040AA–AJ | Distinguish custom product enquiry from missing-delivery-rate quote; Quote Only policy OPEN |
| Delivery rate administration | Maintain pincode/range presumptive kilometres, distance-band rates, predefined weight adjustments, applicable dimensional/fragility rules, delivery minimums | WEB-040K–Z as superseded by later LOCKED rows | Actual rates, thresholds, operational editing screens DRAFT; no courier price API |
| Shipment and tracking | Assign courier, enter tracking number/link, dispatch date and staff-supplied updates | WEB-019; requirements | No carrier API required; customer timeline must distinguish staff updates from verified carrier events |
| Customers and support | View customer/order context, handle support cases, statuses, messages and resolutions | WEB-006; OPS-003 | Support-case workflow required; exact case ownership/SLA and UI DRAFT |
| Roles and permissions | Grant/revoke explicit production release, production audit correction, delivery quote approval; protect admin read/write operations | WEB-006; WEB-040AB/AQ/BB/BE | Permission boundaries LOCKED; role templates and grant workflow DRAFT |
| Audit correction and review | Read release/rejected audit, append correction, independent review, flagged narrative, independent acceptance; inspect separate queues | WEB-040AW–EA; WEB-042 | Substantive event/queue rules LOCKED; UI microstates consolidated into tests |
| Operational reliability | Access diagnostics, monitor jobs/errors, backups, restore/rollback procedures, beta/live isolation | OPS-001/002/004/005 | Operational capabilities required; do not assume dashboard must directly perform restore/rollback |

## Actor/permission boundary

| Actor | Allowed baseline | Not implied |
|---|---|---|
| Anonymous customer | Public browsing, guest checkout, verified guest order recovery | Admin access |
| Registered customer | Own account/orders/support | Other customers' records |
| Authenticated Tavistra administrator | Administrative audit read and eligible independent correction review; other admin functions as separately authorized | Production Release, Production Audit Correct, delivery-quote approval merely by being admin |
| Staff with Production Release | Attest readiness and release production, subject to full payment/readiness gates | Audit correction authority |
| Staff with Production Audit Correct | Append factual audit corrections and flagged narrative follow-ups | Self-review or automatic flagged closure |
| Admin with delivery-quote approval permission | Approve prepared manual delivery quotes, triggering approved unpaid-order workflow | Production release permission |
| Independent authenticated administrator | Review correction if not author; assess flagged narrative if not its author | Ability to bypass separation of duties |

A single person can have multiple grants, but the specific same-author separation checks still apply. Exact role templates, account administration and least-privilege assignment process are implementation-design work.

## Functional coverage gaps, not fresh approvals

1. **Admin sitemap grouping:** which module destinations share a section or page remains DRAFT. No need to vote on menu labels now.
2. **Full operational order lifecycle:** refund, cancellation, payment race and shipment transition policies require a cross-module Phase 2 map; do not infer rules.
3. **Production after release:** factory/job-stage workflow is not fully described by the release matrix; treat as a gap, not automatic authorization to invent stages.
4. **Content publishing:** accepted file-based editorial vs transactional commercial boundary is clear; exact validation/preview/publish contract is not.
5. **Role grant governance:** explicit permissions are locked for sensitive actions; grant/revoke, access review and audit policy details need later functional architecture.
6. **Dashboard and operations:** monitor/recovery capabilities are required, but the exact admin UI and direct restore controls are not approved.
7. **Commercial policy gates:** Quote Only and coupons remain OPEN; WEB-038 cart interaction DEFERRED; two customer-facing price components unchanged.

## Next Phase 1 deliverable

Merge storefront, customer commerce and admin inventories into a **unified conceptual sitemap and use-case coverage matrix**. Distinguish public, customer, admin and shared system surfaces. Show existing approvals and genuine missing end-to-end journeys; do not introduce new navigation decisions without evidence.


## 2026-11-04 — Phase 1 admin simplicity interpretation

**OWNER-APPROVED GUIDANCE:** This Phase 1 module inventory is conceptual coverage, **not** a requirement for a separate dashboard, queue, approval workflow or microservice per admin function. Prefer a small number of role-aware staff surfaces, shared filters, existing order/quote/product/stock/customer records, concise notes and auditable manual decisions for exceptional work. Automate routine payment, stock, order, production and notification controls where necessary for reliable operations. Preserve every approved staff authority, execution block, statutory obligation and substantive customer outcome. Detailed screen decomposition, internal workflow mechanics, QA cases and launch tuning are implementation-stage matters. Phase 1 is CLOSED; dated Phase 2 approvals supersede historical OPEN flags here.

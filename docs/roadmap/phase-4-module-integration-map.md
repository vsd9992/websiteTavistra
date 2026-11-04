# Tavistra — Phase 4 module and integration dependency map

> **CURRENT INTEGRATION STATUS (2026-11-04):** Hostinger small VPS chosen for independent hosting; PhonePe target gateway selected pending approval/capability validation; earlier 'provider unselected' rows below are historical. Three separate purchase/order/fulfilment modes at launch with no forced cross-mode consolidated dispatch. Invoice/tax-document responsibility belongs with orders/offers/tax/payments; detailed execution/compliance in development. Consult [effective handoff](current-effective-handoff-baseline.md) and [current lifecycle](../decisions/current-production-payment-lifecycle.md).


**Date:** 2026-11-04  
**Status:** Developer-handoff planning, not implementation authorisation.  
**Owner planning assumption:** **Option A — AI-assisted development under owner supervision**. This is a resourcing/maintenance assumption, not a waiver of review, testing, security, statutory obligations or financial controls. Revisit if actual delivery capacity or support needs warrant.

**Authority:** [latest decision register](../decisions/decision-register.md), [requirements](../website/requirements.md), [Phase 3 customer UX](phase-3-customer-page-family-specification.md), [Phase 3 admin UX](phase-3-admin-ux-specification.md), [critical acceptance matrix](phase-4-requirements-acceptance-matrix.md), [architecture validation](phase-4-architecture-validation.md). Latest owner-approved rules prevail over older OPEN labels.

## Logical architecture

One Tavistra-owned repository; public storefront and private staff admin as logically separate web surfaces; a shared backend with explicit domain modules and **one authoritative PostgreSQL transactional database**. Modular monolith, not independent microservices. Engineering may consolidate processes and deployment if security and maintenance remain sound. No separate workflow/case engine for routine exceptions.

| Module | Owns / authoritative actions | Depends on | Consumers / integration |
|---|---|---|---|
| Identity and access | Guest sessions, optional customer accounts, verified email, historical guest-order linking, staff RBAC, revocation | Database, audit, email | Storefront, admin, orders, support |
| Catalogue and editorial | Products/variants, six-category taxonomy, collections, validated Markdown/media, approval/publication | Identity/roles, media, pricing/stock read models | Storefront discovery, SEO, admin |
| Offers, tax and delivery rules | Approved selling price, tax presentation, discounts, registered-pincode coverage, internal delivery charge | Catalogue, configuration, audit | Product page, carts, quotes, checkout |
| Inventory and reservations | Authoritative Ready Stock availability, reservations, movements/recounts and stock safeguards | Catalogue, orders, audit, database transactions | Checkout, admin, fulfilment |
| Cart and checkout | Purchase-mode separation, final validated payable terms, checkout initiation | Catalogue, offers/delivery, identity, stock, payments | Storefront, orders |
| Payments and refunds | Provider initiation, verified payment events, reconciliation, refund ledger, idempotency | Payment provider, orders, audit, durable jobs | Checkout, quotes, admin, support |
| Orders | Authoritative commitments, customer status, line items, linked payment/shipment/production records | Identity, pricing snapshot, payments, inventory | Storefront, admin, production, support |
| Quote Only | Enquiry, staff discussion, versioned quote, original 30-day expiry, exact acceptance, verified 25% advance | Identity, offers, orders, payments, email, audit | Customer quote journey, admin |
| Made to Order production | Approved specification, seven-day grace, actual-start cutoff, holds, readiness/release, production progress | Orders, payments, staff roles, audit | Admin, customer tracking, dispatch |
| Dispatch and fulfilment | Shipment records, approved combined dispatch where eligible, courier assignment/manual tracking, delivery evidence | Orders, stock/production, delivery rules, audit | Admin, tracking, returns |
| Support, changes and remedies | Customer requests, cancellation/change/return eligibility, staff resolution, statutory safeguards | Orders, production, delivery, refunds, identity | Customer support, admin |
| Notifications and audit | Required transactional notifications, immutable event/evidence history, operational exception visibility | All domain modules, email relay, durable jobs | Admin, customer messages, compliance |

**Module ownership rule:** one domain owns each authoritative state transition; other modules consume validated interfaces/events. Public pages and admin screens cannot directly mutate database state or bypass permissions. Avoid duplicate status engines or parallel monetary sources of truth.

## External integration boundaries

| External dependency | Initial-launch posture | Gate |
|---|---|---|
| Payment gateway | **Required; provider unselected** | India-relevant supported payment methods, webhook verification, refunds, reconciliation, failure/late-event handling, fees and settlement terms validated before contract/build commitment |
| Transactional email | **Required; provider unselected** | Domain authentication, verified sender, deliverability, secure templates, retry/failure visibility |
| Hosting and domain | Independent Tavistra deployment; provider/size unselected | Total operating cost, Indian latency, backups/restore, access, security patching, monitoring, rollback and owner-operable recovery |
| Media/object storage | Local or object storage with backups, final choice deferred | Image performance, durability, versioned publish, safe uploads, restore |
| Courier API | **Not required at launch** | Delivery price calculated internally; staff enter courier/tracking updates |
| Live maps/routes | **Not required** | Internal approved pincode/distance proxies govern delivery charges |
| CMS, search SaaS, analytics SaaS | Optional, not mandatory | Add only on demonstrated need, cost and privacy fit; approved Markdown editorial model remains baseline |

## Dependency-ordered developer handoff slices (future build, NOT current execution)

1. **Foundations:** repo conventions, environments, database migrations, roles/audit, backup/restore, secrets, test and deployment approach.
2. **Catalogue and pricing:** approved publishing workflow, product/variant and editorial metadata, tax/delivery/offer authority; public discovery can proceed alongside.
3. **Ready Stock transaction path:** mode-aware cart, authoritative stock reservation, payment verification, order, staff dispatch, customer tracking.
4. **Made to Order:** separate checkout, approved grace/production controls, staff production workflow and fulfilment.
5. **Quote Only:** staff-led enquiry/clarification, versioned 30-day quote, acceptance, verified 25% advance and linked production/order.
6. **Customer service and accounts:** guest/account access, historical linking at launch, customer requests, returns/refunds, secure staff actions.
7. **Release gate:** statutory policy content, catalogue data, security, mobile/accessibility, SEO, payment reconciliation, backup/restore, staff training and rollback.

**Launch-scope warning:** The slices describe dependency order, **not phased release**. All owner-approved initial-launch capabilities, including historical guest-order linking, remain in launch scope.

## 2026-11-04 — Effective billing and mode-fulfilment ownership

**Current mode split:** Ready Stock, Made to Order and Quote Only have **separate order and payment commitments, separately executable fulfilment**, and no forced shared dispatch at initial launch. The cart implementation may organize mode selection, but may not merge commitments. Quote Only's staff-issued quotation and exact-version acceptance remain distinct from ordinary checkout.

**Billing/tax document responsibility:** Offers/tax rules determine applicable tax treatments and customer-facing amounts; Orders/Billing issues legally required invoices/receipts and adjustments; Payments/Refunds reconcile captured/refunded amounts to statutory documents and evidence; Audit controls authorised revisions and retention. Exact GST categorisation, document numbering, credit/debit notes and legally required breakdowns belong to engineering plus qualified compliance review, **not a third customer charge component**.

**MTO and Quote Only:** >=25% verified advance to permit governed production; 100% verified before dispatch, independent of the original quote's 30-day validity and the confirmed-order seven-day IST grace. See [current lifecycle](../decisions/current-production-payment-lifecycle.md).

## AI-assisted development safeguards

- Small bounded changes with an explicit decision reference and acceptance test; owner approves substantive deviations before they are introduced.
- Keep database migrations, secrets, production credentials, financial operations and deployment changes under explicit human review.
- Test critical money/stock/production/privacy paths using negative, retry, concurrency and recovery scenarios; no claim of readiness based on generated code alone.
- Require repeatable setup, lint/type checks, automated tests, code review, deployment/rollback instructions and durable operational documentation.
- Prefer maintained mainstream libraries and simple architecture over clever custom infrastructure. Security-sensitive implementations should receive qualified independent review before launch.
- Separate planning, coding, staging validation and production deployment; none is authorised merely by this document.

## Open dependencies and owner decisions

**No immediate owner decision needed** to finish the developer handoff. Before provider selection/actual build commitment, obtain a hosting/operations budget range, realistic catalogue and traffic assumptions, payment provider terms, and clarity on who handles production incidents and routine maintenance. These are execution inputs, not grounds to reopen Phase 1–3.

**Next deliverable:** consolidate a developer-ready handoff package with repository/document authority, acceptance traceability, module boundaries, ordered work packages, unresolved procurement/operational gates and release checklist. Do not write or deploy website code here.

# Tavistra — Implementation-readiness blueprint and build plan

> **STATUS CORRECTION (2026-11-04):** Historical vertical-slice/sprint suggestions do not authorise building. Phase 1–4 planning is CLOSED; [current effective handoff](current-effective-handoff-baseline.md) and [current production/payment lifecycle](../decisions/current-production-payment-lifecycle.md) supersede older payment thresholds, combined dispatch assumptions and quotation/grace overlap. No code/deployment in this workstream.


**Created:** 2026-11-04
**Status:** EXECUTION PLANNING BASELINE — not approval of a specific technology vendor, finished design, code, test results or launch
**Authority:** [Master website blueprint](master-website-blueprint.md), [decision register](../decisions/decision-register.md), [approved Phase 1 sitemap](unified-website-sitemap.md), [architecture candidates](../website/architecture.md), [website requirements](../website/requirements.md).

## 1. Objective and scope discipline

Build the owner-approved Tavistra concept as one coherent, maintainable product. Phase 1 coverage and major Phase 2 business boundaries are frozen. Do not re-vote on settled decisions. Historical OPEN markers in older documents are superseded by later dated approvals. Reconcile contradictions against the latest explicitly approved substantive rule and flag only material unresolved conflicts. This document is an implementation plan, not a new business policy.

**Delivery rule:** Automate routine transaction execution, financial verification, inventory integrity, production gates, access security and essential notifications. Use authorised staff judgement, simple notes and existing records for exceptional reviews, customer clarification, disputes and discretionary outcomes. Avoid bespoke subsystems for each exception. Preserve explicitly approved separate cases/jobs, audit trails, separation of duties and statutory safeguards where required.

## 2. Technical architecture: recommended starting point, not a locked vendor choice

- **Shape:** one repository, modular-monolith backend, separate logical public storefront and private role-aware staff admin, shared transactional backend/API. Independent Tavistra infrastructure, not shared with VDesign. No microservices by default.
- **Candidate implementation:** TypeScript/React storefront with server-rendered public pages; React staff app; Node/TypeScript API; PostgreSQL for authoritative transactional data. Evaluate whether one framework can serve both web surfaces without compromising separation; prefer the simplest supported deployment. This is a recommendation to validate, not an owner-approved stack.
- **Modules:** identity/access; catalogue/editorial publication; offers/tax/delivery; stock/reservations; checkout/payment ledger; quotes; orders; production; fulfilment; support/returns/refunds; notifications; audit/operations. Modules share a database with explicit ownership boundaries and transactional consistency.
- **Content:** file/Markdown-driven approved product/editorial content and media pipeline, separated from transactional prices, stock, accounts, orders and permissions. Publish validated representations, not arbitrary uploaded code.
- **Reliability/security:** authoritative backend pricing and payment verification, idempotent payment/reservation operations where previously approved, concurrency guards, signed/expiring guest access, verified account email, least-privilege staff actions, immutable audit, backups, beta/live separation and monitoring.
- **Integration defaults:** managed payment provider selected after capability validation; email/SMTP transactional delivery; staff-entered courier/tracking updates; no mandatory courier pricing/tracking API. Provider-specific APIs, queue technology, hosting size and exact schema remain engineering decisions.

## 3. Dependency-ordered delivery slices

The numbering is dependency order, **not** a rigid waterfall. Design/content, admin and customer-facing work can run in parallel when their shared contracts are stable.

| Slice | Deliverable | Depends on | Done when |
|---|---|---|---|
| 0. Baseline and foundation | Decision acceptance matrix, architecture diagram, repository conventions, environments, CI, secret management, migrations, monitoring and backup approach | Frozen concept | Critical business constraints trace to testable acceptance scenarios; beta deploy and restore strategy demonstrated |
| 1. Identity and authoritative data | Guest/account auth, verified email and email changes, staff RBAC/audit, product/variant, offer/tax, inventory, quote/order/payment/shipment core records | 0 | Access isolation, immutable audit, inventory and money invariants tested |
| 2. Publishing and discovery | Product/media publishing pipeline, taxonomy, collections, home, Shop, search/results, product pages, SEO foundations | 1 for authoritative offers; parallel visual design | Customer can discover valid published products; cached pages never authorize stale offers |
| 3. Delivery and Ready Stock purchase | Configurable delivery rates/manual exceptions, mode-separated cart, Ready Stock checkout, reservation, payment initiation and authoritative verification, guest recovery | 1, payment integration, offers/stock | Paid/unpaid/failed/pending and stock-race scenarios reconcile without oversell or duplicate financial commitments |
| 4. Made to Order and Quote Only | Dedicated Made to Order checkout and production eligibility; staff-issued Quote Only quotes, 30-day fixed expiry, customer acceptance, verified 25% advance, remaining balance, seven-day grace, production gates | 1, payments, identity and staff roles | Each mode follows approved customer money/production rules; no combined Ready Stock/Made to Order checkout |
| 5. Production and fulfilment | Staff readiness/release, work/quality disposition, stock and shipment handling, manual courier tracking, eligible mixed-dispatch coordination | 3–4, staff roles | Production never bypasses release/payment/grace blocks; shipment/stock actions audited |
| 6. Service and accounts | Order tracking, optional registered accounts, historical guest-order linking at launch, order-linked requests, cancellation/return/refund/support, notifications | 3–5, identity/audit | Verified ownership and privacy controls; customer remedy, refund and case paths tested |
| 7. Release preparation | Legal/policy content, product catalog QA, accessibility/mobile/performance, SEO/AEO/GEO facts, end-to-end financial and fulfilment testing, security review, observability, backups/restore, staff training and rollback | All slices | Release gates evidenced; unresolved high-risk failures block launch |

## 4. Frozen acceptance matrix: critical examples

| ID | Acceptance contract | Verification focus |
|---|---|---|
| AC-01 | Public premium gallery-led storefront, six approved categories, search/collections and product-specific purchase modes; no Journal at launch | Responsive navigation, product publication and discovery |
| AC-02 | Exactly two customer-facing price components: discounted tax-inclusive product price and one applicable combined delivery charge | Product, cart, checkout, quote and order consistency |
| AC-03 | Ready Stock and Made to Order have separate launch checkouts; Quote Only follows its separate quote/acceptance/payment path; customer coupon entry deferred | Cross-mode selection never silently creates combined checkout or coupon redemption |
| AC-04 | Backend-authoritative stock, reservation and payment confirmation; pending/failed/retried payment cannot oversell or create unintended duplicate charges/orders | Concurrency, webhook retries, interrupted checkout and late payment |
| AC-05 | Quote Only original 30-calendar-day expiry not reset by revision; exact version acceptance and verified 25% advance required; expired/rejected unagreed advance refunded under approved rules | Quote version, time zone, expiry, payment and refund |
| AC-06 | Seven-day grace and actual production-start cutoff; approved pre-production change/cancellation/refund and staff review gates; statutory rights preserved | Deadline, production release, cancellation and refund |
| AC-07 | Production release/quality/stock/dispatch follow approved permission, evidence and audit gates | Unauthorised actions, concurrent release, exceptions |
| AC-08 | Ready Stock nonreturnable by default unless configured; explicit returnable products require approved published product-specific N-day window; statutory rights override | Publication validation and delivery-day-zero eligibility |
| AC-09 | Optional accounts and secure guest tracking; historical guest-order linking at launch requires verified account email and per-order staff ownership approval; email match alone never links | Account change, privacy, guest-link expiry and access revocation |
| AC-10 | Staff manually resolve exceptions on existing records where practical; mandatory audit, customer remedies and separate cases/jobs retained when approved | Staff usability, roles, immutable audit and statutory obligations |
| AC-11 | Manual courier assignment/tracking supported; no carrier API dependency | Shipment status, dispatch and customer communications |
| AC-12 | No launch without tested payment reconciliation, refunds, restore, privacy controls, published policies and mobile/accessibility baseline | End-to-end UAT, security and operational readiness |

This is a **compact index**, not a substitute for the complete locked rules in the canonical decision register. Engineering must link individual acceptance tests to the latest applicable decision sections.

## 5. Blockers, dependencies and risks

| Priority | Dependency / risk | Resolution owner | Practical next step |
|---|---|---|---|
| P0 | Payment provider suitability for India, advance/balance collection, refund and webhook/reconciliation requirements | Technical lead + business owner for vendor/fees | Compare providers against approved business capabilities and commercial terms before integration |
| P0 | Legacy specification volume and potentially stale OPEN labels | Technical lead | Build traceable latest-decision matrix; escalate only material conflicts |
| P0 | Transactional integrity of inventory, quotes, order and payment state | Backend lead | Define invariants and concurrency tests before checkout build |
| P0 | Customer/staff identity, privacy, historical linking and audit | Backend/security lead | Threat model and least-privilege acceptance tests |
| P1 | Product data, photos, brand/editorial content and legal policy copy | Content/operations owner | Prepare launch-ready catalogue and legally reviewed content in parallel |
| P1 | Staff workload from complex exception processes | Product/operations lead | Prototype shared admin worklists and manual evidence/notes, not multiple case engines |
| P1 | Delivery configuration, tax disclosure and statutory compliance | Operations/finance/legal | Validate real rates, tax configuration and product policy snapshots |
| P1 | Deployment reliability, email deliverability and backups | DevOps/technical lead | Demonstrate beta environment, email failures, recovery and restore before launch |

**Not blockers to website concept freeze:** exact framework, hosting tier, admin sidebar grouping, UI microstates, notification retry interval, individual test wording, analytics vendor and final SEO copy. Resolve these through engineering/design and release gates.

## 6. First execution sprint: prepare for build, do not prematurely code all modules

1. Extract latest locked business rules into a concise, versioned acceptance checklist, including the most consequential quote/payment/production/returns/privacy cases. Reference original decision IDs/sections.
2. Produce one-page architecture diagram and module/data-ownership map, choosing a default stack only after checking repository constraints and maintainability.
3. Run a short payment-provider capability/fee evaluation; do not commit to a provider until advances, refunds and reconciliation are supported.
4. Define core entities and transaction boundaries: product/variant, offer, stock reservation, quote/version, order/line, payment/refund, production job, shipment, customer/guest access, support and audit.
5. Sketch the customer paths and a **small** role-aware staff interface, reusing components and records.
6. Establish a beta deployment with CI, backups, monitoring and test fixtures. Build a narrow vertical slice: publish product → Ready Stock checkout → verified payment → staff dispatch → customer tracking.
7. Expand to Made to Order and Quote Only once core money and stock integrity is proven; implement approved production and after-sales obligations.
8. Require demonstrable acceptance and operational checks before declaring launch readiness.

## 7. Change-control and completion rule

The frozen concept is the baseline, not an excuse to ignore discovered contradictions. Engineering may choose implementation details independently. A new owner decision is needed only when a material proposed change affects pricing/payment/refunds, production commitments, customer rights, privacy/security, permissions, statutory obligations or launch scope. Record such a decision in **both canonical documents**. Maintain a short live blocker list and do not return to serial microdecision polling.

**Current next task:** baseline-to-acceptance traceability and architecture validation, followed by a thin end-to-end Ready Stock vertical slice. No further concept vote is pending.


## 2026-11-04 — Phase 4 planning-only handoff correction

Phase 3 was owner-approved and closed. The [Phase 4 critical requirements-to-acceptance baseline](phase-4-requirements-acceptance-matrix.md) is the current traceability index. Earlier references in this preliminary plan to starting an engineering sprint, beta deployment or Ready Stock vertical-slice build describe a **future developer execution sequence only**, not work authorised in this conversation. Current next task: validate architecture and external dependencies, then prepare the developer handoff; **no website code or deployment here**. Existing owner-locked business, security and statutory rules remain authoritative.

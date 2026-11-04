# Tavistra — Phase 4 requirements-to-acceptance baseline

> **APPROVED PHASE 4 HANDOFF, RECONCILED 2026-11-04:** Phase 4 was formally CLOSED. This original critical index is supplemented by [CURRENT effective cross-phase baseline](current-effective-handoff-baseline.md) and [current production/payment lifecycle](../decisions/current-production-payment-lifecycle.md). The latter govern mode separation, 25% production eligibility/100% dispatch for both Made to Order and Quote Only, independent 30-day quotation and seven-day confirmed-order clocks, and unpaid manual-delivery-quote stock reservation. Earlier 'immediate next step' below is historical. No code authorised.


**Date:** 2026-11-04  
**Status:** Phase 4 working handoff; no code authorised.  
**Authority:** Latest owner-approved [decision register](../decisions/decision-register.md), [website requirements](../website/requirements.md), [Phase 3 customer UX](phase-3-customer-page-family-specification.md), [Phase 3 admin UX](phase-3-admin-ux-specification.md), [implementation-readiness plan](implementation-readiness-plan.md). Later explicit owner approvals prevail over older OPEN/DRAFT entries.

This is a compact **critical acceptance index**, not a replacement for the full decision history or exhaustive test suite. Engineers must trace each implementation story to its latest authoritative decision and retain statutory safeguards.

| ID | Capability / locked outcome | Acceptance evidence / prohibited outcome | Dependencies |
|---|---|---|---|
| TAV-01 | Adaptive Gallery storefront; six approved Shop categories, curated collections, responsive header, search and approved filters/sort; no Journal at launch | Published products discoverable on desktop/mobile; no unapproved launch search facets or Journal | Approved content, catalogue, publication |
| TAV-02 | Authoritative catalogue, variants, prices, tax, availability, sale discounts and publication controls | Staff cannot publish invalid commercial data; storefront cannot use stale presentation as purchase authority | Catalogue, pricing, stock, roles |
| TAV-03 | Exactly two customer-facing price components: discounted tax-inclusive product price and one combined applicable delivery charge | Consistent product/cart/checkout/quote/order display; no surprise third customer-facing component | Tax, delivery, pricing |
| TAV-04 | Three independent Ready Stock, Made to Order and Quote Only order/payment/fulfilment modes. Ready Stock and Made to Order must use separate launch checkouts; Quote Only is staff-led, never ordinary checkout; no coupon entry. Detailed cart grouping/presentation is decided during development | Independent order and fulfilment commitments; no cross-mode order/payment/forced combined dispatch, combined checkout or coupon redemption | Cart, checkout, orders |
| TAV-05 | Ready Stock uses authoritative stock, reservations and verified payment before downstream fulfilment | Concurrent buyers, retries and delayed confirmations do not oversell or double-commit | Inventory, payment, order ledger |
| TAV-06 | Made to Order (including Quote Only production) requires >=25% of the effective total verified for authorised production eligibility and start, independent seven-day confirmed-order grace, actual-start cutoff, staff readiness/release, and 100% cumulative verified before dispatch | Unverified or <25% payment, active holds, grace, wrong permissions or duplicate release cannot start production; 25%-paid but not fully paid order cannot dispatch | Order, payment, production, audit |
| TAV-07 | Quote Only uses staff-led clarification, versioned terms, original 30-calendar-day *unconfirmed quotation* expiry, exact-version acceptance, verified 25% advance, linked order and separate seven-day confirmed-order grace | Revision never resets original unconfirmed quote expiry; original quote expiry never truncates confirmed-order seven-day rights; expired/rejected unagreed advance refunded per approved rules | Quote, communication, payment |
| TAV-08 | Pre-production changes/cancellation/refunds and post-production restrictions follow latest mode-specific locked rules, with statutory overrides | Staff and customer actions respect grace period, actual production commencement, protected review gates and legal remedies | Production, support, refunds |
| TAV-09 | Delivery serviceability, delivery charge, manual delivery exceptions, independent mode-specific dispatch and tracking follow approved rules; no forced combined dispatch across separately paid modes at launch | Staff assign courier/tracking manually; each order has independent custody, dispatch, charge and delivery commitments; no carrier-rate API dependency | Delivery rules, shipment, order |
| TAV-10 | Ready Stock defaults to non-returnable absent explicit approved eligibility; returnable items require published product-specific N-calendar-day window, measured from confirmed delivery day zero | Publication blocks explicitly returnable items lacking valid N; eligibility uses authoritative date and preserves statutory rights | Catalogue, delivery, support |
| TAV-11 | Guest checkout and optional account; secure guest access; initial-launch historical guest-order linking with verified account email and explicit per-order staff ownership approval | Email match alone never links orders; revoked/expired access stays blocked; staff investigations, privacy notice and assessment remain audited | Identity, staff roles, audit |
| TAV-12 | Private staff administration consolidates worklists and record details; staff-led discretionary exceptions; essential permissions and immutable audit | Forbidden financial/production/stock/privacy actions blocked server-side; no generic case engine added for routine exceptions | RBAC, records, audit |
| TAV-13 | Payment and refund verification/reconciliation is backend-authoritative; verified MTO/Quote Only 25%-to-produce/100%-to-dispatch gates and Ready Stock distinct payment rules; customer redirect alone proves nothing | Pending, failed, repeated, late, part-paid and refunded events reconcile correctly without duplicate charges, false success or premature production/dispatch | Payment provider, ledger, notifications |
| TAV-14 | Customer order history, tracking, support, cancellation/change/return and staff resolution reflect authoritative state | Customer sees permitted actions and clear next steps, never internal sensitive evidence | Identity, orders, support |
| TAV-15 | Approved accessibility/responsive baseline, content/legal/privacy/SEO foundations, legally applicable billing/invoice/tax/credit-note handling, monitoring, backup/restore and release checks | Launch blocked for unresolved critical financial, security, statutory, restore or operational failures | Content, infrastructure, QA |

## Cross-module handoff sequence

1. Publish approved catalogue and commercial terms; expose only valid purchasable or enquiry items.
2. Customer selects Ready Stock, Made to Order or Quote Only; route to its authoritative commitment path.
3. Apply mode-specific commitment gates: approved manual-delivery Ready Stock unpaid orders may reserve stock before payment; other stock/payment actions follow their locked mode rules. Verify appropriate advance/full payment before MTO production/dispatch or other prohibited state transitions.
4. Enforce eligibility, inventory and production gates; expose a simple customer status and staff action.
5. Dispatch and track using approved delivery process; support customer requests and lawful remedies.
6. Preserve financial, access, communication and audit history across every transition.

## Phase 4 architecture validation gates (not owner policy votes)

- Validate modular-monolith recommendation against transaction integrity, concurrency, deployment cost, maintainability and role isolation; vendor/stack remain **proposed**, not locked.
- Define module ownership for identity, catalogue, pricing/tax, inventory, carts/orders, quotes, payments/refunds, production, fulfilment, support and audit; specify integration boundaries, not detailed schemas here.
- Confirm payment-provider capabilities for India-facing payment capture, verification, refunds, reconciliation and operational failure recovery before commitment.
- Confirm infrastructure, backups/restore, transactional email, access security, product/media publishing and deployment ownership.
- Separate legally reviewed policies, final catalogue data and operational training from engineering design; all remain prelaunch dependencies.

## Open genuine dependencies

**P0 before build commitment:** payment-provider capability and commercial selection; architecture/hosting feasibility and responsible technical ownership; decision-history-to-acceptance reconciliation for financial, stock, production and privacy controls.

**P1 before release:** final approved policy/legal text, product data and media, tax/delivery configuration, email/domain setup, tested reconciliation, accessibility, backups/restore, security and staff operational readiness.

**Not open:** Phase 1–3 design/concept, purchase-mode separation, Quote Only policy, coupon launch scope, two price components, statutory protections, or the global simplicity-first principle.

## Immediate next step

Review architecture options against this acceptance baseline, recording only material tradeoffs and dependencies. Then produce a sequenced developer handoff. **No website code, deployment, technical sprint or implementation is authorised in this conversation.**


## 2026-11-04 — Reconciled acceptance cases (owner post-audit clarification)

- **TAV-04/09:** separately represent three checkout/quote, payment, order, delivery and fulfilment streams. No initial-launch cross-mode forced dispatch, merged payment or merged order; cart grouping and presentation are development choices within these bounds.
- **TAV-06/07/13:** MTO and Quote Only at least 25% verified of current agreed total allows otherwise authorised production release/start **after** independent seven-day IST no-start grace and cleared holds; verify 100% cumulative before dispatch. Ready Stock remains separate.
- **TAV-07/08:** original unconfirmed Quote Only 30-day IST clock and seven-day confirmed-order grace are independent. A quote confirmed on original quote day 29 has a full seven-day confirmed-order grace and governed change rights; original day-30 expiry cannot cancel or truncate them.
- **TAV-05/09:** authorized manual delivery estimate approval may create an unpaid Ready Stock order **with stock reservation**, before payment, subject to its existing expiry/stock safety guards.
- **TAV-03/15:** lawfully required tax invoices, receipts, statutory tax details, amendments/credit notes and refund reconciliation are developer/compliance acceptance requirements. Legally required invoice disclosure is compatible with two checkout-facing charge components, not a third fee.
- **Staged release:** public non-transacting PhonePe review-ready presence, isolated invited beta and paid commerce go-live are separate stages. Do not let a publicly reachable review site process unverified payments.

**This is an acceptance correction, not fresh owner approval of UI microstates, software implementation, financial or statutory readiness.**

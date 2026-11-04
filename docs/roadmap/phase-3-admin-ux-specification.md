# Tavistra — Phase 3 staff administration UX specification

> **OWNER SIGN-OFF (2026-11-04):** Phase 3 staff-admin UX concept accepted and CLOSED. Historical 'Draft' below is superseded as a status. No new roles/policies are invented. Latest [cross-phase baseline](current-effective-handoff-baseline.md) and [production/payment lifecycle](../decisions/current-production-payment-lifecycle.md) control staff order, payment, production and fulfilment actions; separate all three purchase modes.


**Date:** 2026-11-04  
**Status:** Draft for Phase 3 consolidated review. Not a new business-policy approval.

## Principles
Use one coherent private admin with role-based visibility, a small set of reusable worklists, record detail views and authorised actions. Preserve the frozen Phase 1 module inventory and later locked operational, payment, stock, production, audit, privacy and statutory decisions. Staff should make discretionary judgements on existing records with notes and audit; avoid creating a distinct workflow engine or screen for every exceptional case. This describes UX patterns, not database tables, pixel dimensions or technical implementation.

## Shared admin shell
- Secure sign-in, role-appropriate navigation, concise operational overview, global search/reference lookup where useful and clear access to pending work.
- Group navigation by staff jobs rather than every underlying state: **Catalogue & Content**, **Orders & Payments**, **Production & Stock**, **Delivery & Dispatch**, **Customers & Support**, **Settings & Audit**. These are **suggested navigation groups**, not newly locked menu labels or a restriction on permissions.
- Common pattern: worklist with useful filters/status and explicit refresh when needed → one authoritative record detail → permitted action with relevant context and recorded outcome. Use contextual related-record links rather than forcing staff through many independent queues.
- Clearly distinguish read-only historical events from actionable current work. Keep sensitive evidence restricted to authorised staff.

## Staff page families

| Family | Information and actions | UX boundary |
|---|---|---|
| Overview / worklists | Work needing attention, concise counts, priority, owner and direct links | No new notification engine or duplicate task tracking |
| Catalogue & editorial | Product/variant identity, taxonomy, media, descriptions, collections, publication status, preview and approval | Commercial price/stock stay authoritative outside editorial content |
| Pricing, delivery rules and offers | Tax-inclusive product prices, approved sale discounts, delivery bands and exceptions, publish controls | No launch coupon redemption interface; preserve two customer-facing price components |
| Inventory & reservations | Physical/available/reserved quantities, batches, recount/shortage context and linked orders | Preserve shortage safety gates and immutable evidence without proliferating exception screens |
| Orders & payments | Purchase-mode-specific order details, payment verification/reconciliation, outstanding balance, refunds, customer communications | Ready Stock and Made to Order separate checkouts; Quote Only separate acceptance and verified advance |
| Quote Only & manual delivery quotations | Customer request and conversation, staff revisions, version/expiry, approved quote, acceptance, payment link and order link | Original 30-day Quote Only expiry remains; staff discretion with audit; separate manual delivery rules preserved |
| Made to Order production | Eligible lines, readiness, permitted release, active production, quality, completion and relevant holds | No production before approved conditions; prevent unauthorized/duplicate releases |
| Dispatch & tracking | Eligible shipments, manual courier assignment, tracking references, dispatch updates, eligible combined dispatch | No courier API requirement; no automatic merger of separately paid orders |
| Customers & support | Customer/guest context, order-linked requests, clarifications, return/cancellation/refund resolution, historical guest linking | Verified identity and restricted evidence; staff decisions audited |
| Roles, settings & audit | Staff permissions, operational configuration, append-only audit/history, authorized corrections and review | Do not collapse legally/security-required separation of duties |

## Record detail pattern
One record header with reference, type, customer, status and next permitted action. Context sections or tabs for items/specification, money, delivery, production, communication, attachments/evidence and chronological audit. Show only applicable sections per record. Related quote, order, payment, shipment, support and stock records should link directly. Make clear which data is customer-visible versus internal.

## Staff exception handling
- Normal path: staff inspect the existing record, verify evidence, contact customer if necessary, choose permitted action and record the reason/outcome.
- Safety-critical conditions (payment verification, production gates, stock integrity, identity, permissions, statutory remedies) must block forbidden actions regardless of UI.
- Existing explicitly approved shortage, audit-correction or other protected review obligations remain intact. UX can consolidate entry points without eliminating required approvals or history.
- Avoid making staff learn multiple unrelated case engines for the same order. Prefer contextual requests and existing support records.

## Responsive and accessibility
Desktop is the primary work surface for dense admin tables and multi-record work. Smaller screens should still support critical lookup, reading, contact and safe actions; dense grids may become stacked records. Keyboard navigation, readable contrast, error prevention and clear permission feedback apply. Do not invent mobile-only staff workflows.

## Completion and sign-off
This draft covers the approved staff module families at design-concept level. It does not certify each historical operational microdecision or final permission matrix. Next step is a concise Phase 3 cross-surface review (customer-to-staff handoffs, gaps, contradictions and design sign-off). No implementation begins in this conversation; Phase 4 remains deferred until owner review.

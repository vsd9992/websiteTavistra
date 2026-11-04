# WEB-041 — Made to Order implementation-readiness audit (initial baseline)

**Date:** 2026-10-28  
**Status:** INITIAL AUDIT / PLANNING, NOT BUILD AUTHORIZATION  
**Source:** `docs/decisions/decision-register.md` on `main`, through WEB-041.  
**Scope:** Approved Made to Order production lifecycle, supporting audit/administrative controls, and launch-critical dependencies. This is a decision-register audit, not a codebase or end-to-end production test.

## Executive finding

The decision register contains extensive operational and accessible queue specifications. It is **not yet an executable implementation plan**. The immediate risk is not a shortage of button-state decisions; it is unclear sequencing of technical architecture, executable state transitions, persistence/audit guarantees, integration contracts and test evidence.

## Constraints that must not change

- **Quote Only** participation and treatment: **OPEN**. Do not silently include it in checkout, production release or priced cart flows.
- **Coupons:** details **OPEN**. Do not invent eligibility, stacking, allocation, refund or display policies.
- **WEB-040N:** exactly **two customer-facing price components**: discounted tax-inclusive product price (including packaging/handling) and one combined delivery charge if applicable. No extra packing, weight, fragility or handling lines.
- **WEB-038:** cart interaction **DEFERRED**; do not infer a mini-cart, cart page or drawer choice.
- Existing locked lifecycle, permission, audit, concurrency and customer communication decisions remain authoritative.

## Findings and disposition

| Priority | Finding | Evidence in register | Disposition |
|---|---|---|---|
| P0 | Technology and deployment baseline is not fully locked. | WEB-011 stack proposed; WEB-015 hosting deferred; WEB-008 transactional commercial data locked. | Prepare architecture decision record and proof-of-concept plan; do not assert a final stack. |
| P0 | Production lifecycle must be converted from prose into a verifiable state machine and API contracts. | Long WEB-040 production-release, correction, audit and queue decision chain. | Produce transition table with actor, guard, preconditions, idempotency, audit and rollback/compensation outcomes. Cross-check every transition against latest superseding decision. |
| P0 | Payment and order authorization integration is unresolved. | WEB-018 payment gateway deferred; production-release checks depend on authoritative commercial state. | Define provider-neutral payment/order contract; gate live payment implementation on provider selection and tested callbacks. |
| P0 | Quote Only and coupon commercial rules remain explicitly unresolved. | Owner-preserved OPEN constraints. | Isolate behind explicit eligibility/policy gates; avoid assumptions in checkout, totals, discounts and release. |
| P0 | Audit durability and concurrency require implementation proof, not more UX micro-decisions. | Production-release and audit correction chain; WEB-040DB reconciliation; WEB-040EA failure retention. | Specify transactional boundaries, append-only event storage, unique constraints, authorization and failure-injection tests. |
| P1 | Shipping rate rules are internal, but operational data and numerical rates require readiness checks. | WEB-040I/J/K/L; WEB-040N. | Define versioned admin rate-table data, effective dates, serviceability outcomes, validation and checkout repricing tests. |
| P1 | Accessibility decisions are over-granular relative to build readiness. | WEB-040CJ through WEB-040EA queue microstate sequence. | Consolidate into one admin-queue behavior spec and automated/manual accessibility acceptance suite; no new product decisions for routine UI states. |
| P1 | Launch gates remain a proposal rather than an accepted checklist. | OPS-004/005 locked; OPS-006 proposed. | Draft staged beta/live release checklist covering isolation, backup restore, rollback, permissions, payments and audit evidence. |
| P2 | Catalogue and initial product costing are intentionally deferred. | PD-004 deferred. | Use fixtures for lifecycle tests; do not fabricate production SKUs, BOMs or prices. |
| P2 | Cart interaction is deferred. | WEB-038. | Keep checkout/cart interface abstract; defer customer UI composition. |

## Prioritized implementation workstreams

1. **WS-01: Traceability and contradiction pass (P0).** Build a canonical decision index that resolves historical OPEN/SUPERSEDED rows to latest LOCKED status. Extract lifecycle states and transitions, actors, deadlines, failure handling and audit events. Flag only concrete conflicting requirements.
2. **WS-02: Domain and persistence contracts (P0).** Specify orders, order items, made-to-order jobs, production release, idempotency keys, append-only audit events, correction/review/flagged concern records and permission boundaries. Define transactional write guarantees.
3. **WS-03: Commercial integration boundaries (P0).** Define provider-neutral payment verification, tax-inclusive product totals and single delivery-charge contract. Represent Quote Only and coupon treatment as unresolved policy gates.
4. **WS-04: Executable vertical slice (P0 after WS-01–03).** Build a test-only, fixture-backed Made to Order order through authorized release, with duplicate-release rejection and durable audit evidence. No live payments or invented product policy.
5. **WS-05: Admin review and recovery (P1).** Implement independent audit correction review, flagged concerns, deadlines, reconciliation and queue behavior from consolidated acceptance criteria.
6. **WS-06: Operational readiness (P1).** Run concurrency/failure-injection, access control, audit immutability, restore, deployment isolation and staged beta tests.

## Definition of ready for implementation

- One canonical state-transition matrix cites the authoritative decision for each transition.
- API and persistence schemas describe authorization, idempotency, concurrency, audit guarantees and failure behavior.
- Open commercial policies are isolated and cannot accidentally be treated as approved defaults.
- An architecture baseline and deployment approach are selected explicitly before irreversible infrastructure work.
- Test plan includes duplicate requests, stale reads, permission denial, partial failures, audit persistence failure and recovery.
- An implementation backlog is ordered by dependency with measurable acceptance criteria.

## Next substantive approval

**WEB-042: sequencing the first build-ready deliverable.** Recommend **Option A: canonical lifecycle state-transition and invariant matrix**, then architecture and persistence contracts, rather than writing implementation code immediately. This is a sequencing choice, not a reopening of locked lifecycle behavior.

## Audit limits

This initial audit is based on the decision register and selected documented decision summaries. It does not establish that the current codebase implements these rules or that all historical decisions are internally consistent. A full traceability pass remains WS-01. No previously locked decision is superseded by this audit.

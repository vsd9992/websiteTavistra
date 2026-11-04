# WEB-042 — Canonical Made to Order lifecycle transition and invariant matrix

> **CRITICAL SUPERSESSION NOTICE (2026-11-04):** This historical v1 matrix contains a **WRONG CURRENT PAYMENT GATE**. All requirements/tests below requiring **100% payment before Made to Order production release are superseded**. Read [CURRENT production/payment lifecycle](current-production-payment-lifecycle.md) before any implementation: **>=25% verified for Made to Order and Quote Only production eligibility/release and actual physical start; 100% cumulative verified before dispatch; independent 7-day pre-production grace; separate purchase-mode orders/fulfilment**. Preserve all other release/audit/security guards. The v1 'canonical' label refers only to its historical 2026-10-28 baseline, NOT the effective payment/fulfilment contract. Never implement it standalone.


**Date:** 2026-10-28  
**Status:** IMPLEMENTATION SPECIFICATION / BASELINE v1  
**Authority:** WEB-042 and the latest LOCKED entries in `docs/decisions/decision-register.md`.  
**Scope:** Made to Order per-line readiness and production release, durable release audit, correction review and flagged-concern resolution.  
**Not authorized:** production code, payment gateway selection, final database schema, Quote Only or coupon policy, cart UX.

> **Read first:** This is a canonical **behavioral** model, not a claim that every upstream order or manufacturing state has already been approved. States labeled *derived* or *proposed* below are implementation conveniences; they must not become new business policy without approval. For any discrepancy, the latest explicit LOCKED decision in the decision register prevails.

## 1. Scope and immutable invariants

| ID | Invariant | Authority |
|---|---|---|
| INV-01 | Only an authenticated staff member with explicit **Production Release** permission may confirm per-line readiness or release production. Ordinary administrator access alone is insufficient. | WEB-040AQ |
| INV-02 | **Ready for Production** is a separate explicit, single attestation **per Made to Order line**; it is irreversible and cannot be withdrawn or reset. It is not production release. | WEB-040AP/AR/AS |
| INV-03 | A production release requires **fully verified payment**, valid readiness for every targeted unreleased line, and release permission, checked authoritatively at commit time. | WEB-040AQ/AO |
| INV-04 | Individual-line release is allowed; whole-order release atomically covers **all currently unreleased Made to Order lines**, or none. Previously released lines are unchanged. | WEB-040AN/AO/AV |
| INV-05 | Release is a **single-click action** with no extra confirmation dialog, typed phrase, required note or checklist. | WEB-040AU |
| INV-06 | A duplicate release request must return **Already Released**; it cannot create a second release or successful-release audit. A whole-order request with no unreleased lines also returns **Already Released**. | WEB-040AV/AW |
| INV-07 | Every successful release commits its production-release state and protected append-only **successful-release audit event atomically**. On audit persistence failure, no release commits and no production starts. | WEB-040AW/AY/AZ |
| INV-08 | Every rejected release attempt is a **distinct rejected-attempt audit event**, not a successful-release event; a failed rejected-attempt audit write is an operational error/alert and never authorizes release. | WEB-040AX/AZ |
| INV-09 | Original audit events are immutable. Factual correction, review, narrative follow-up and acceptance are **new linked append-only events**; none of them mutates production-release state. | WEB-040AY/BC/BD/BJ/BK |
| INV-10 | Audit correction requires **Production Audit Correct** permission. Independent review requires an authenticated administrator **different from the correction author**. | WEB-040BB/BE |
| INV-11 | A **Flagged** correction requires an authorized narrative follow-up and independent acceptance by an administrator **different from the follow-up author**. Only **Resolution Accepted** closes the flagged concern; **Further Action Required** keeps it open. | WEB-040BI/BJ/BK/BL |
| INV-12 | No fixed deadlines or automatic completion/closure are introduced for correction review, initial flagged narrative follow-up, or independent acceptance. | WEB-040BF/BN/BO |
| INV-13 | No formal pre-release operational hold or readiness reversal is available. Staff refrain from release when conditions have changed, until resolved. | WEB-040AT |
| INV-14 | Customer-facing pricing remains exactly **discounted tax-inclusive product price** plus **one combined delivery charge if applicable**; no additional customer-facing packing/handling/weight/fragility charge. | WEB-040N |
| INV-15 | **Quote Only treatment and coupon details remain OPEN**, and **WEB-038 cart interaction remains DEFERRED**. No lifecycle or API default may implicitly settle them. | Explicit project constraints, WEB-038/040N |

## 2. Canonical production state model

Do **not** conflate order payment state, readiness state, and release state. They are separate dimensions.

| Dimension | Values / semantics | Approval status |
|---|---|---|
| Order payment verification | `full_payment_verified = true/false`, sourced from authoritative payment/order ledger; never infer from a browser return, client-supplied flag or pending callback. | Full verified payment gate LOCKED (WEB-040AQ); exact provider/ledger model OPEN (WEB-018). |
| Made to Order line readiness | `not_ready` → `ready_attested` once; no reverse transition. | LOCKED (WEB-040AP/AR/AS); enum names illustrative. |
| Made to Order line release | `unreleased` → `released` once; no reverse transition or second successful release. | LOCKED (WEB-040AN/AO/AV); enum names illustrative. |
| Order-level release summary | **Derived** from unreleased/released Made to Order lines; do not introduce a separate authoritative mutable order-wide release flag. | Proposed implementation projection, not an independently approved order status. |
| Post-release manufacturing | No additional manufacturing progression, cancellation, return, rework, dispatch or completion transitions are defined by **this** matrix. | OUT OF SCOPE pending traceability to other approved decisions. |

A line may be **ready but unreleased**. A release operation must not attest readiness on behalf of the user. An order may have a mixture of released and unreleased Made to Order lines as a result of approved individual release actions. Whole-order release operates only on remaining unreleased lines.

## 3. Production transition matrix

| Transition | Actor / command | Authoritative preconditions | Atomic effects | Failure / duplicate | Decision refs |
|---|---|---|---|---|---|
| PR-01 Attest readiness | Authenticated staff with Production Release; target one Made to Order line | Line belongs to target order, is a Made to Order line, and has not already been attested; staff has permission; readiness review is explicit. | Record the irreversible ready attestation for that line, with reliable actor/time evidence as required by the eventual data model. **No release** and **no production start**. | Re-attestation must not produce a second valid attestation. Exact error code and audit policy for rejected readiness requests are not separately specified here. | WEB-040AP/AQ/AR/AS |
| PR-02 Release one line | Authenticated staff with Production Release; target one line | Made to Order line exists, is unreleased, is ready-attested; order has full verified payment; actor authorized; all guards rechecked server-side at commit. | Mark exactly that line released **and** append one durable successful-release audit event with actor, server time, order ID, line ID and `individual line` scope in same transaction. | If released: **Already Released**. Other failed guards reject with controlled reason; separately audit rejected attempt. Audit-write failure aborts release. | WEB-040AN/AQ/AU/AV/AW/AX/AY/AZ |
| PR-03 Release all remaining lines | Authenticated staff with Production Release; target order | There is at least one unreleased Made to Order line; **every** currently unreleased Made to Order line is ready-attested; full verified payment; actor authorized; server-side atomic validation. | Mark **all and only** currently unreleased Made to Order lines released and append **one** successful-release audit event listing exactly those line IDs and `whole order` scope, atomically. Already released lines remain unchanged. | Any unreleased line not ready or other guard failure: release **none** of target set. If none remain: **Already Released**. Rejected attempt separately audited; audit-write failure aborts release. | WEB-040AO/AQ/AU/AV/AW/AX/AZ |
| PR-04 Reject release | Any caller requesting individual/whole release but failing a guard | Missing/invalid authorization, unverified payment, not ready, Already Released, or other controlled invalid request. | No production-release state mutation, no production start, **no successful-release audit**. Append protected rejected-attempt audit with known actor or unknown, server time, requested scope, known order/line IDs and controlled reason. | If rejected-attempt audit fails, surface operational error/alert; do not treat request as successful. Exact response and alert route unresolved. | WEB-040AX/AY/AZ |
| PR-05 Reconcile concurrent release requests | Multiple authorized callers or retries | Evaluate current authoritative state inside serialization/locking or equivalent concurrency control. | At most one successful release per line, with audit and release committed together. | Loser sees **Already Released** when the target has already been released; other guard failures reject. Do not make a second successful audit. | WEB-040AV/AW/AZ |

**Atomicity boundary:** the database transaction covers the release-state update and durable successful-release audit event. Production execution or external side effects must not begin before commit. The specific post-commit delivery mechanism (e.g. transactional outbox) is a **proposed engineering choice**, not yet locked.

**Important nuance:** An idempotency key may prevent duplicate transport processing as an engineering safeguard, but it must **not** silently convert a repeated production-release request into a new successful-release response contrary to WEB-040AV's explicit **Already Released** rule.

## 4. Audit and independent correction workflow states

These are **derived workflow states** from linked append-only events, not editable statuses on original audit records.

### 4.1 Correction review

| Transition | Actor / permission | Preconditions | Event and derived outcome | Rejection / safeguard | Refs |
|---|---|---|---|---|---|
| AU-01 Append factual correction | Staff with **Production Audit Correct** | Existing original audit event; valid field, replacement value and mandatory explanation; authorized actor. | Append linked correction with original audit ID, field, replacement, reason, actor and server timestamp. Correction becomes **Pending Review**. | Never edit original event or alter release state. | WEB-040BB/BC/BD |
| AU-02 Acknowledge correction | Authenticated administrator **not the correction author** | Correction exists and is pending valid independent review. | Append linked **Acknowledged** review event with reviewer and server time; leave pending queue. | Self-review prohibited. No change to release state. | WEB-040BD/BE/BG |
| AU-03 Flag correction | Authenticated administrator **not the correction author** | Correction exists and is pending valid independent review. | Append linked **Flagged** review event; leave pending queue and create derived **open flagged concern**. | Self-review prohibited. No automatic notification, review deadline or production-state change. | WEB-040BD/BE/BG/BH/BM/BP |

Every correction must receive independent review, but **there is no fixed review deadline** and no automatic approval. The dedicated Pending Audit Correction Review queue is checked manually by administrators (WEB-040BF/BG/BH). All authenticated administrators may read release audits (WEB-040BA), but reading alone grants no mutation permission.

### 4.2 Flagged concern lifecycle

| Transition | Actor / permission | Preconditions | Event and derived outcome | Rejection / safeguard | Refs |
|---|---|---|---|---|---|
| FC-01 Await narrative | Derived after AU-03 | Valid Flagged review and no linked narrative follow-up | Open concern labeled **Awaiting Narrative Follow-up**. | No automatic notification or fixed initial narrative deadline. | WEB-040BI/BM/BN/BP/BQ |
| FC-02 Append narrative | Staff with **Production Audit Correct** | Existing flagged review and correction; mandatory free-text narrative; valid links. | Append protected narrative event referencing flagged review and correction, actor and server time. Derived label **Awaiting Independent Acceptance**. | Narrative alone never closes concern or changes release state. | WEB-040BI/BJ/BK/BQ |
| FC-03 Accept resolution | Authenticated administrator **different from narrative author** | Linked narrative exists; independent acceptance permitted; concern still open. | Append **Resolution Accepted** event linked to review, correction and narrative with actor and time; concern **closes** and leaves open queue. | No edit/delete of historical events; no release-state mutation. | WEB-040BK/BM |
| FC-04 Require further action | Authenticated administrator **different from narrative author** | Linked narrative exists; independent acceptance permitted; concern still open. | Append **Further Action Required** event; concern **remains open**, derived label **Further Action Required**. | No mandatory second narrative, formal re-approval loop or automatic owner assignment solely due to this outcome. | WEB-040BK/BL/BQ |
| FC-05 Voluntary subsequent narrative | Staff with **Production Audit Correct** | Concern still open after Further Action Required; valid linked voluntary narrative. | Append new linked narrative; derived label **Awaiting Independent Acceptance** for that newer narrative. | Do not impose a second *mandatory* follow-up. Independent author separation still applies to any subsequent acceptance. | WEB-040BL/BQ |
| FC-06 Later closure | Independent authenticated administrator | Valid open concern and qualifying linked narrative/acceptance context. | Only a valid linked **Resolution Accepted** event closes the concern. | The precise reassessment mechanics after Further Action Required require contract validation; do not invent automatic closure. | WEB-040BK/BL/BQ |

There are **no fixed deadlines** for initial correction review, initial flagged narrative, or independent acceptance (WEB-040BF/BN/BO). Administrators manually inspect the pending-review and open-flagged queues; automatic notifications or digests for these events are not approved (WEB-040BH/BP). The Open Flagged Concerns queue is distinct from the Pending Audit Correction Review queue (WEB-040BG/BM).

## 5. Command contracts: behavioral requirements, not final endpoint names

| Command | Required request context | Response/side-effect contract |
|---|---|---|
| `attestReady(lineId)` | Authenticated Production Release actor; line identity; explicit action | On success, irreversible readiness only. No production release. |
| `releaseLine(lineId)` | Authenticated Production Release actor; target line; server-side order/payment/readiness lookup | Success only after release + audit atomic commit. Already Released on duplicate. Rejected attempts audited. |
| `releaseRemainingOrder(orderId)` | Authenticated Production Release actor; target order; server-side snapshot of **all currently unreleased** Made to Order lines | All-or-nothing release of remaining eligible lines with one success audit listing affected IDs. |
| `appendAuditCorrection(eventId, field, replacement, reason)` | Production Audit Correct actor | Protected linked correction event; independent review pending. |
| `reviewCorrection(correctionId, outcome)` | Different authenticated admin from corrector; Acknowledged or Flagged | Protected linked review event; derive pending/open queue membership. |
| `appendFlaggedNarrative(flaggedReviewId, correctionId, narrative)` | Production Audit Correct actor | Protected linked narrative; no closure. |
| `assessNarrative(narrativeId, outcome)` | Different authenticated admin from narrative author; Resolution Accepted or Further Action Required | Protected linked assessment; close only on Resolution Accepted. |
| `listPendingReviews()` / `listOpenFlaggedConcerns()` | Authenticated administrator | Authoritative, permission-checked derived queue results; no write authority implied. |

The exact HTTP paths, request schema, concurrency tokens, event names, and persistence table structure remain **proposed engineering design** until the architecture/persistence contract is approved.

## 6. Persistence and concurrency acceptance criteria

| Test | Setup | Required outcome |
|---|---|---|
| T-01 Unauthorized readiness | Authenticated administrator without Production Release permission | No ready attestation; permission failure. |
| T-02 Readiness is irreversible | Ready-attested line; attempt reset | Reset rejected; readiness remains attested. |
| T-03 Release before readiness | Fully paid order; line not ready | Release rejected; no production start; rejected attempt audited. |
| T-04 Release before full verified payment | Ready line; payment not authoritatively verified | Release rejected; no production start; rejected attempt audited. |
| T-05 Individual release | Fully paid order; two ready unreleased lines; release one | Exactly one line released; other unreleased; one successful-release audit for one line. |
| T-06 Whole-order atomic failure | Two unreleased lines; one not ready | Neither line released; no successful-release audit; rejected attempt audited. |
| T-07 Whole-order remaining set | One already released, two ready unreleased; full verified payment | Release two remaining atomically; original released line untouched; one audit lists only two newly released lines. |
| T-08 Duplicate release | Line already released or whole order with no remaining unreleased lines | **Already Released**; no second release or successful-release audit. |
| T-09 Concurrent requests | Two simultaneous release requests targeting same line | At most one successful release/audit; competing request rejected as appropriate. |
| T-10 Successful-audit write failure | Inject failure inside release transaction | Transaction rolls back; line remains unreleased; no production starts or success response. |
| T-11 Rejected-attempt audit failure | Inject failure when logging a rejected release | No release; operational error/alert raised; never return success. |
| T-12 Audit immutability | Attempt to update/delete original audit | Denied; original event unchanged. |
| T-13 Correction authorization | Audit viewer without Production Audit Correct permission | Correction append denied. |
| T-14 Correction independence | Correction author tries to review own correction | Denied; remains Pending Review. |
| T-15 Flagged narrative | Authorized corrector submits required narrative | Append-only event created; concern remains open awaiting independent acceptance. |
| T-16 Acceptance independence | Narrative author tries to accept own narrative | Denied; concern stays open. |
| T-17 Further Action Required | Independent admin chooses Further Action Required | Concern remains open; no mandatory automatic second narrative. |
| T-18 Resolution Accepted | Independent admin accepts valid narrative | Concern closes and disappears from open queue; history retained. |
| T-19 No auto-timeout | Correction/flagged concern remains pending past arbitrary elapsed time | No automatic approval, expiry, closure or deadline escalation. |
| T-20 UI refresh conflict | Row action commits while older queue refresh returns | Keep server-confirmed action; reconcile authoritative row without regressing state (WEB-040DB onward). |
| T-21 Clear filters failure | Results fetch fails after clear-filters action | Restore previous filters and last successful results/count; persistent error + Retry; no success-only announcement (WEB-040EA). |
| T-22 Pricing contract | Render priced customer-facing order | Exactly product-price and one delivery-charge component (if applicable); no extra line-item surcharges. |
| T-23 Unresolved policy isolation | Quote Only/coupon fixtures without approved policies | No silent checkout/release eligibility or discount behavior invented. |

## 7. Traceability and explicit unresolved items

**Locked, incorporated:** WEB-040AN through WEB-040BP (line/whole release, readiness, audit, corrections, review, flagged concern rules); WEB-040BQ onward (queue presentation and refresh/reconciliation) are referenced as UI acceptance behavior, not new lifecycle state transitions. WEB-040EA covers filter-clear failure recovery. WEB-040N governs pricing. WEB-038 is deferred.

**Open or implementation-dependent:**
1. **Commercial eligibility:** Quote Only participation, coupon eligibility/stacking and allocation, actual product/checkout/payment rules. Keep policy gates explicit.
2. **Technical baseline:** WEB-011 stack proposed; WEB-015 hosting deferred; WEB-018 payment gateway deferred. Select provider-neutral contracts before live integration.
3. **Audit operations:** exact operational alert route and failure response for rejected-attempt audit-write failures (WEB-040AZ); retention/tamper evidence and deployment controls not settled by the append-only rule alone.
4. **Payment verification:** precise event source, refunds/chargebacks, payment-state changes after readiness/release, and reconciliation with orders require contract review; do not infer a release reversal.
5. **Readiness edge cases:** exact response to repeated readiness attestation and its audit trail are not expressly defined by the referenced locked decisions.
6. **Post-release execution:** production job scheduling, physical production stages, completion, cancellation, return, remake and fulfilment are not newly approved by this matrix. Trace to other approved specifications before adding transitions.
7. **Flagged concern reassessment:** the exact mechanics for later independent acceptance after Further Action Required must respect WEB-040BL/BK; avoid inventing a mandatory repeated cycle.
8. **Implementation architecture:** transaction isolation, locking, event schema, outbox and API route names are technical proposals requiring validation, not product decisions.

## 8. Proposed next build sequence

1. **Validate traceability** against latest superseding register entries and any existing lifecycle specifications. Resolve only actual contradictions.
2. **Write persistence/API contract** with explicit transactions, actor/permission checks, immutable event references, uniqueness constraints and rejected-attempt audit path.
3. **Build a fixture-backed vertical slice** for ready attestation, individual release, whole-order release, duplicate rejection and atomic success audit; no live gateway.
4. **Add independent audit correction and flagged-concern workflow**, then consolidate queue accessibility/reconciliation acceptance tests.
5. **Test failure injection and concurrency**, including audit-write failures, stale results, permission boundaries and manual recovery.
6. **Gate production deployment** on unresolved commercial policy, provider decisions and OPS release acceptance checks.

**Outcome:** WEB-042 supplies the first implementation-facing behavior contract. It is not a complete manufacturing ERP state machine and must not be interpreted as authorization to decide deferred business policies.

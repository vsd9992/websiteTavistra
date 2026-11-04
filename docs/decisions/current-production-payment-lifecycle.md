# Tavistra — CURRENT payment, quote, production and dispatch invariants

**Date:** 2026-11-04  
**Status:** Owner-approved effective behavioral replacement for incompatible money/gate assumptions in [WEB-042 v1](WEB-042-made-to-order-lifecycle-matrix.md), not a new schema or executable code. Authority: latest dated [decision register](decision-register.md), [requirements](../website/requirements.md), [effective handoff index](../roadmap/current-effective-handoff-baseline.md).

## Three independent commitment streams

| Purchase mode | Customer agreement / confirmation | Before production / stock handling | Before dispatch |
|---|---|---|---|
| Ready Stock | Separately completed Ready Stock checkout, authoritative payment verification and order confirmation according to applicable Ready Stock rules | Transaction-safe reservation/allocation; manual-delivery-approved unpaid orders can reserve stock *before payment* under the separate locked expiry/stock rules; no manufacturing commitment | Ready Stock approved allocation, payment and fulfilment/packing/dispatch-readiness gates, verified as required by its approved policy |
| Made to Order | Distinct Made to Order checkout and committed order, authoritative agreed total, verified **at least 25% advance** | Seven-day no-physical-start grace; actual production cannot begin before day eight; 25% verified, authorised ready attestation/release and any holds cleared, actual start explicitly audited | **100% cumulative verified** paid, completed production and QC, custody/fulfilment readiness, packing and separately authorised dispatch-readiness, recorded physical carrier handover |
| Quote Only | Enquiry, staff-issued versioned quote, exact-version customer acceptance and **timely verified 25%** before quote deadline; quote/order references separate | Same **25% verified eligibility** and seven-day no-start window, permissions, approved revisions/holds and audited actual start as other MTO; never ordinary checkout | **100% cumulative verified**, QC/completion and 75% balance notification/payment milestone as applicable, packing/approval and physical handover |

**Scope protection:** Quote Only may be manufactured as a Made to Order item, but retains its distinct customer quoting/acceptance/payment and fulfilment/order records. No cross-mode order, payment, status or forced consolidated shipment. Keep each order's charge/return/refund, fulfilment, evidence, and communication audit independent. Cart UX can be designed by development, not mixed-mode financial commitments.

## Effective MTO and Quote Only release / actual-start guards

| Transition | Payment guard | Other mandatory guards and outcomes |
|---|---|---|
| Confirm order | Verified agreed **25% minimum** received, plus exact-quote-version acceptance for Quote Only; Ready Stock follows its own rules | Write authoritative confirmation/advance evidence; confirmed order starts distinct seven-day IST grace |
| Attest ready | Preserve previously approved explicit staff permission/irreversible per-line attestation | Attestation is not release, physical start or customer consent |
| Release one / all remaining MTO lines | Revalidate **at least 25% verified** against current agreed total; never require full payment solely to release | Explicit Production Release authority, all targeted lines ready, any applicable protected holds and state guards, atomic state/success-audit write; duplicate returns Already Released; record rejected attempts |
| Record actual production start | Revalidate >=25% verified, not before day eight IST and not before valid release; no unresolved relevant changes/cancellation/outage/review holds; staff accountable | Separate auditable actual-start event; no automatic start on time expiry, readiness or release |
| Complete, QC and notify balance | Preserve independent work, quality, custody and customer communication requirements | 75% balance or adjusted authorised remainder can be requested after approved completion/QC milestone; completion itself does not authorize dispatch |
| Packing / dispatch-readiness | Preserve packing completion then separate authorised dispatch-readiness approval and all quality/stock/custody gates | Packing need not wait for final payment solely on this specification; **dispatch** does |
| Record carrier handover / dispatch | **100% cumulative payment verified** against authoritative effective total, plus all other mode-specific readiness gates | Record physical handover evidence; labels or courier scheduling are not dispatch |
| Record delivery | Preserve authoritative verified carrier proof or authorised documented delivery, and dispute protections | Delivery date drives applicable Ready Stock return window, not estimated arrival |

**Supersession test examples:** (a) MTO 25% verified, all other gates valid → production release may succeed; (b) 25% paid, day four → actual physical start must fail; (c) 25% paid, post-QC → dispatch must fail while balance outstanding; (d) 100% paid plus all gates → dispatch may proceed; (e) duplicate release → Already Released with no duplicate success audit; (f) missing/uncertain payment signal → do not count as verified; (g) change revised total → recalculate required 25% and remaining balance; (h) separate Ready Stock and MTO orders → no combined charge/order/dispatch dependency.

## Independent Quote Only issuance and confirmed-order timelines

- Original quote issuance date **day zero** in Asia/Kolkata; unconfirmed quote valid through **23:59:59 IST on day 30**. Subsequent quote versions never restart the clock.
- Exact current-version acceptance and verified advance before the deadline confirm an order, preserving already-approved late-verification reconciliation for *genuinely timely* payment.
- On successful order confirmation, **the original quote clock ceases to constrain confirmed-order grace, preproduction changes, cancellations or refund protections**. The separate confirmed-order seven-day IST clock starts with authoritative confirmed payment/order confirmation: local date = day zero, day seven ends 23:59:59, earliest physical production commencement day eight.
- Example: quote issued day 0, confirmed on original quote day 29. Its preproduction change/cancellation protections still run through confirmed-order day seven even though original quote day 30 occurs in the meantime. Staff handle changes against the confirmed order through approved amendment/acceptance, not by silently extending/reopening the original quote.
- Requests within the seven days remain protected until valid disposition. Outage evidence-based exception handling, independent holds, actual-start cutoff and consumer/statutory rights continue. Ordinary discretionary changes after actual physical start are prohibited.
- An *unconfirmed* quote still expires on day 30 when acceptance/payment conditions are unmet; do not create an order from stale terms, automatically waive payment, or retain funds contrary to approved refund rules.

## Invariants retained from WEB-042 v1

Preserve per-line irreversible readiness; explicit permission; individual/whole-target release, all-or-nothing operation on remaining lines, Already Released duplicate error; append-only success/rejected attempt audit, transaction-atomic successful release+audit; independent audit correction/review/flagged concern safeguards; separate protection against stale queue data. **Only supersede payment percentage, independent quote/grace clocks, mode/order/fulfilment boundaries and any directly incompatible older statement**. The WEB-042 v1 matrix is retained for historical low-level behavioral detail but not current payment-gate authority.

## Development acceptance extension, no new business vote

Developers must define order/payment/quote production transaction contracts and concurrency tests, with invoice/tax-document generation and settlement/refund reconciliation. Test non-standard paths including manually approved unpaid-delivery orders with stock reservations, payment confirmation arriving late, expired quotes, partial payments, cancellation/change holds, refund and chargeback evidence. Tax invoice/GST/credit-note handling follows applicable law and licensed review; its details do not add customer-facing checkout price components.

**No code/deployment/onboarding authorised.**

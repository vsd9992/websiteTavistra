# Tavistra — independent cross-phase repository audit (Phases 1–4)

**Audit date:** 2026-11-04  
**Snapshot:** `main` at `73138865c7f782caf0e5d604709abc6d1ee674dc` before this report.  
**Status:** FINDINGS OPEN for documentation reconciliation. This is a review, **not** a reopening of approved policies, an approval to code, or a codebase/test/legal certification.  
**Scope:** Reviewed the complete repository file inventory (36 Markdown files, no application code in the checked tree), cross-read relevant Phase 1–4 authorities and older implementation references, scanned historical decision content for superseded rules, and checked **183 local Markdown document links** for missing target paths (none found). This is a substantive cross-document audit, not a claim of exhaustive line-by-line formal verification of every historical paragraph.

## Executive verdict

**Conceptual coverage: strong. Handoff authority: NOT yet clean enough to give to an implementer without reconciliation.** Most customer/public/admin journeys are present; the main threats are (a) an actively misleading older production/payment matrix, (b) mixed-order dispatch rules written before separate-mode checkouts were chosen, (c) a potential collision between quote validity and grace-period rights, and (d) fragmented authority spread across historical append-only documents. The Phase 4 acceptance sign-off is a historical planning milestone; it does not certify that these conflicts were resolved.

**Rules that remain locked and must not change through this audit:** six-category Adaptive Gallery / no Journal, guest/optional account and historical linking safeguards, two customer-facing charge components, separate Ready Stock and Made to Order checkouts and Quote Only enquiry/quote, no customer coupon code at launch, 25%-verified Made to Order production eligibility / 100%-verified before dispatch, original Quote Only 30-day clock, mandatory seven-day pre-production grace and actual-start cutoff, return default, staff-authorised inventory/production/payment/refund controls, manual courier updates, legal/consumer protections, and the owner-supervised AI development direction with Hostinger VPS / PhonePe selected as intended providers.

## P0: reconcile before any engineering handoff

### AUD-01 — Older Made to Order implementation matrix mandates the wrong payment threshold (**CONFIRMED DIRECT CONFLICT**)

**Evidence:** [WEB-042 lifecycle matrix](../decisions/WEB-042-made-to-order-lifecycle-matrix.md) INV-03, payment dimension, PR-02/03 and T-04/T-07 still require **100% verified payment before production release**; [website requirements](../website/requirements.md) WEB-040AK–AV and [architecture](../website/architecture.md) repeat this historical gate; [search design proposal](../website/design-system-search-proposal.md) repeats it even in unrelated admin-queue continuity language. Later [owner-approved decision register](../decisions/decision-register.md), 2026-11-04 “Quote Only workflow and Made to Order 25%/75% payment milestones,” **explicitly supersedes WEB-040AK**: **verified >=25%** of total makes *all ordinary Made to Order* orders payment-eligible for authorised production release; **100% cumulative verified** required before dispatch. Other controls still apply, including the seven-day no-actual-start gate and audited holds.

**Risk:** Engineering implements a 100%-before-production checkout, contradicting the commercial promise and preventing approved 25%/75% milestone payments.

**Required correction:** Produce a superseding, **current effective** cross-mode lifecycle/payment matrix and tests. The release test checks verified >=25% (plus eligibility, staff permission, readiness/holds), not full payment. A separate dispatch test checks verified 100%. Distinguish production *release* from actual physical *start*. Mark WEB-042 v1 and every old full-payment quote as historical, never as a runnable contract. Strengthen TAV-06 and checkout/payment acceptance to name the 25%/75% rules for ordinary MTO, **not only Quote Only**. Do not rewrite the original historical text.

### AUD-02 — Mixed-mode fulfilment describes a single mixed order after separate checkouts were locked (**CONFIRMED CROSS-PHASE MODEL MISMATCH**)

**Evidence:** [decision register](../decisions/decision-register.md), 2026-11-04 “mixed Ready Stock / Made to Order consolidated dispatch,” mandates one dispatch group for a **single** mixed-mode customer order and delaying its Ready Stock lines. The **later** “Initial-launch cart and checkout purchase-mode separation (Option B)” locks **separate checkout/payment transactions and orders** for the two modes; its text expressly preserves **eligible combined physical dispatch across separately placed orders** when appropriate. The [Phase 4 matrix](phase-4-requirements-acceptance-matrix.md) and [module map](phase-4-module-integration-map.md) mention eligible combined dispatch but do not furnish a concise effective cross-order contract.

**Risk:** Implementation wrongly creates a single mixed order, couples payments or return/refund windows, or automatically delays independently committed Ready Stock purchases because a separate MTO order exists.

**Required correction:** Specify a **shipment/dispatch group that may reference distinct orders** without merging order identity, price, delivery charges, advance/outstanding balance, refund, customer authorization, history or statutory rights. Require eligibility, address/customer/custody checks and per-order dispatch/payment/quality gates. Treat the older **single-order** mixed dispatch premise as inapplicable to initial-launch separate checkouts; do not automatically force consolidation. Do not invent a cross-order delivery-charge refund or new price promise.

### AUD-03 — Original quote expiry and post-confirmation seven-day grace may collide (**MATERIAL UNRESOLVED EDGE CASE**)

**Evidence:** [decision register](../decisions/decision-register.md), “Original quote 30-day clock,” “Quote expiry day 30,” “Unpaid quotation expiry,” and “mandatory seven-day pre-production grace period.” Original Quote Only quotation issuance date is day zero, acceptance/payment may occur as late as 23:59:59 IST on day 30, and seven-day grace starts with verified order confirmation. Text also says the seven-day specification-change negotiation is *included in*, rather than appended to, the 30-day quotation period. That cannot always be true if payment/confirmation happens near day 30.

**Example:** Quote issued on day zero, exact-version acceptance and verified 25% payment on day 29. The order's seven-day grace extends past the original quote's day-30 expiry. A day-33 requested change is timely under the grace rule but after the quote-negotiation window. Should staff review it; which accepted terms stand; may its commercial proposal expire without cancelling the confirmed order?

**Required correction:** One explicit owner-approved **precedence/scenario rule**, protecting already confirmed orders, seven-day rights, staff-reviewed pre-production changes and refund/statutory safeguards, while retaining the original unconfirmed quote validity and preventing unlimited negotiation. Do not let code silently shorten the seven-day window or automatically cancel a fully agreed confirmed order.

## P1: material handoff and operating safeguards

### AUD-04 — Generic payment-before-stock sentence conflicts with unpaid manual-delivery quote stock reservation

**Evidence:** [Phase 4 acceptance matrix](phase-4-requirements-acceptance-matrix.md) “cross-module handoff sequence” step 3 says verify payment/advance before stock actions. But [requirements](../website/requirements.md) WEB-040AG/AI and [Phase 2 Ready Stock plan](phase-2-ready-stock-order-payment.md) explicitly require **Ready Stock reservation when staff-approved manual delivery quote creates an unpaid order**, with expiry cancellation/release and full-stock guard. This is **legitimate prepayment inventory holding**, not an error.

**Correction:** Differentiate stock **reservation/hold** versus paid fulfilment/inventory dispatch, and distinguish standard checkout from approved manual delivery quote flow. Correct the universal handoff wording and add a test of unpaid-order reservation/expiry/late-payment races.

### AUD-05 — GST-compliant invoicing, documents and credit/debit notes lack an explicit module-level acceptance path

**Evidence:** The source documents correctly lock tax-inclusive product display and authoritative tax calculation, but no explicit [Phase 4 module](phase-4-module-integration-map.md) owns statutory invoice/receipt/credit-note generation, document retention, downloadable customer access or refund-to-tax-document reconciliation. A customer-facing two-component price presentation **does not mean** any legally required invoice must omit tax breakdown. Official CBIC references include [tax invoice requirements](https://cbic-gst.gov.in/gst-invoice-rules.html) and [GST rules](https://cbic-gst.gov.in/pdf/24092021-CGST-Rules-2017-Part-A-Rules.pdf). Actual applicability and current details depend on Tavistra's registration and accountant/legal review.

**Correction:** Add a provider-neutral **billing/tax-document responsibility and acceptance gate** to offers/orders/payments, covering invoice or other legally applicable documents, numbering, taxes including delivery, amendments/credit notes for cancellation/returns, retention and secure access. Preserve exactly two **checkout charge components**; tax documents may disclose legally required detail without introducing extra charges. This is a pre-build data/operational contract and prelaunch compliance sign-off, not another storefront UX vote.

### AUD-06 — PhonePe public review site and locked private beta need a reconciled release-stage model

**Evidence:** [reliability/release](../website/reliability-and-release.md) OPS-004/005 lock **invited private beta in isolated, non-indexable staging, then gated public commercial go-live**. [Phase 4 handoff](phase-4-developer-handoff.md) and [engineering preparation](engineering-execution-preparation.md) now plan a **public review-ready informational/catalogue site before PhonePe production approval**. The new step is reasonable but should not be mistaken for an untested early commercial launch or for an indexable private beta.

**Correction:** Explicitly distinguish (1) non-transacting publicly reviewable presence, (2) private isolated commerce beta with test keys/data and crawl prevention, (3) PhonePe production approval/integration validation, (4) gated commercial go-live. Establish minimal safe QA, content/legal approvals and public status messaging for stage 1. **Confirm PhonePe's exact live-site/checkout review requirements with the provider**; that policy was reported by the owner and was not established from the repository. Do not represent payment as live until verified.

### AUD-07 — Current source-of-truth and approval status are too easy to misread

**Evidence:** [README](../../README.md) and [master blueprint](master-website-blueprint.md) still describe Phase 1/2 as active, despite Phases 1–4 being closed. [documentation policy](../governance/documentation-policy.md) and [open questions](open-questions.md) still call hosting, payment provider, Quote Only/coupons, palette and typography unresolved, while later decisions lock relevant scope. [Phase 3 customer/admin specifications](phase-3-customer-page-family-specification.md) and [admin UX](phase-3-admin-ux-specification.md) still say *Draft* in their headers despite explicit consolidated approval in both canonical documents. [Phase 4 acceptance matrix](phase-4-requirements-acceptance-matrix.md) still says “working handoff” and “immediate next step: review architecture”; [final readiness review](phase-4-final-readiness-review.md) says “subject to owner acceptance” after owner accepted it. [module/integration map](phase-4-module-integration-map.md) still says gateway/hosting “provider unselected” even after owner chose PhonePe/Hostinger; older Phase 1/2 references repeatedly claim WEB-018/038 still deferred and coupons OPEN.

**Correction:** Create a short **effective-decision index / authoritative developer entry point** pointing to the latest controlling clauses for purchase modes, MTO thresholds/deadlines, delivery, returns, customer identity, audit, brand/UX and release. Add dated status notices at top of superseded/inherited docs and revise README/open-questions navigator. Preserve historical paragraphs but prevent readers from treating them as current. Fix Phase 3/4 document headers to “approved by later owner sign-off; historical draft text preserved.” This is clerical reconciliation, **not policy change**.

### AUD-08 — Small-team staffing assumptions may conflict with required independent review

**Evidence:** [WEB-042](../decisions/WEB-042-made-to-order-lifecycle-matrix.md) and [admin coverage](admin-module-coverage.md) retain **independent correction review by an administrator other than the author**, and narrative acceptance by another person. [Phase 4 handoff](phase-4-developer-handoff.md) assumes owner-supervised AI development, but does not demonstrate Tavistra's operational staff can meet these separation requirements.

**Correction:** Before launch document role assignment, backup coverage, operator escalation and authorised independent reviewer availability. Do not weaken separation or silently self-review. AI development approach does not imply AI may serve as the legally/operationally accountable independent approver.

## P2: launch/configuration and packaging inputs, not reasons to reopen concept

1. **Official identity/assets:** [brand origin/identity exploration](../brand/name-origin-and-identity-exploration.md) explicitly labels logo and name-story copy as proposed/not approved. No final image/logo files are versioned in the checked repository. Gather actual owner-approved logos, wordmark, usage rules, brand/cultural story copy and licences/trademark checks before the public review site. Assets may exist outside this repo; do not invent an approval.
2. **Operational configuration:** initial real SKUs, safe SKU-specific category compliance, stock, return-eligible N-day values, production lead times, publishing media, tariffs/weight divisor/rate bands, domain, email relay, Hostinger resource plan, serviceability mapping and PhonePe account setup remain deliberate execution inputs, not missing Phase 1–4 concepts.
3. **Privacy/legal content:** privacy, terms, shipping, returns, customer complaints, refunds, consent/retention, invoice handling, warranty and factual product claims require business-specific review. Add final sign-off and storage/retention ownership; do not promise legal compliance merely because the sitemap contains a “Policies” link.
4. **Provider capability tests:** PhonePe must support the **actual** verified 25% deposit and later 75% collection, reliable webhook/reconciliation, independent mode-specific payments, refunds and clear settlement records. No substitute gateway or workaround without owner approval.
5. **Search-heavy historical proposal:** [design-system search proposal](../website/design-system-search-proposal.md) contains extensive historical audit-queue microdecisions and old full-payment continuity language; clearly mark it as a historical source, not the entry point for current commerce implementation.
6. **Technical acceptance needed later:** exact state transition/API/persistence schemas, data migrations, backup restore drills, monitoring, refund/chargeback responses, performance, accessibility, incident handling and threat analysis are legitimate future engineering artifacts. The Phase 4 package is a high-level handoff, not completed executable software design.

## What passed

- Whole-repository tree contains **36 Markdown files**, organized across brand, taxonomy, manufacturing, decisions, governance, roadmap and website; no current application implementation was found.
- **183** internal relative Markdown links tested against the tree: **zero missing target files**. External links/content were not comprehensively validated.
- Phase 1 major public/customer/staff surfaces are represented, including all six categories and curated collections; no Journal.
- Phase 2 covers extensive Ready Stock, Made to Order, Quote Only, delivery/stock, service/refunds, guest/account and protected audit flows. Many older OPEN labels have later explicit approvals rather than missing decisions.
- Phase 3 supplies approved page-family structures for customer and staff journeys, even though the draft headers need correction.
- Phase 4 supplies an architecture candidate, module map, acceptance index, Hostinger/PhonePe dependencies and owner-supervised AI implementation governance. No evidence of executed code, QA or launch certification.

## Proposed closure sequence (no website execution)

1. **Reconcile effective policy without re-voting:** update current MTO milestone/release matrix and cross-order fulfilment contract; correct manual-quote reservation acceptance.
2. **One material owner interpretation:** settle the day-30 original quotation expiry versus day-29/day-30 confirmation and full seven-day grace. Also clarify any material cross-order shipping promise if newly exposed; do not create generic UI votes.
3. **Complete missing operational contract:** document accounting/invoices/credit notes, role-separation feasibility and public review site/private beta stages at concept/acceptance level.
4. **Repair discoverability:** mark stale docs historical, update README/current-state navigator, and produce concise developer-facing effective-decisions index. Amend the Phase 4 acceptance matrix to trace new reconciliations.
5. **Re-audit and explicitly sign off clean handoff:** mark findings resolved only with evidence and latest controlling references. Original Phase 4 closure stays in history; a separate **handoff reconciliation acceptance** can affirm its corrected implementation baseline.

**Audit conclusion:** **Do not hand this historical document collection directly to an AI-assisted developer as if every linked file were equally current.** The *website concept is substantially complete*, but the **effective authoritative specification is not yet clean**. No website code, infrastructure or payment operations should be started on the basis of this review alone.


## 2026-11-04 — Owner global resolution and final disposition

**OWNER-APPROVED globally in both canonical docs:** The audit findings below have been resolved as policy, reconciled as documentation, or explicitly assigned to later development/compliance. Historical finding text remains preserved for transparency, **not** as still-open owner decisions. Effective sources: [current effective handoff baseline](current-effective-handoff-baseline.md), [current production/payment lifecycle](../decisions/current-production-payment-lifecycle.md), [updated critical acceptance](phase-4-requirements-acceptance-matrix.md), latest [decision register](../decisions/decision-register.md) and [requirements](../website/requirements.md).

| Audit ID | Final disposition | Authority / why no further concept vote |
|---|---|---|
| AUD-01 old 100% MTO production gate | **CLOSED, superseded** | ALL ordinary MTO and Quote Only require **>=25% verified** for eligible governed production; **100% verified before dispatch**. Historical WEB-042 v1/architecture/search references expressly marked non-current; new effective lifecycle published. |
| AUD-02 old mandatory mixed-order consolidation | **CLOSED, superseded** | **Three independent Ready Stock, MTO, Quote Only order/payment/fulfilment modes** at launch; no combined checkout/payment/order or forced cross-mode dispatch. Cart presentation is a developer choice respecting those boundaries. |
| AUD-03 30-day vs seven-day overlap | **CLOSED by owner** | Two **independent clocks**: original unconfirmed Quote Only 30-day issuance/acceptance deadline and confirmed MTO/Quote Only seven-day pre-production grace. Confirmed order not truncated on original quote expiry; timely submitted pre-production changes governed separately. |
| AUD-04 unpaid manual delivery stock reservation | **CLOSED, clarified** | Mode-specific exception explicitly added to TAV acceptance and current lifecycle: authorised manual delivery quote may create unpaid Ready Stock order with protected stock reservation, subject to expiry/reconciliation controls. |
| AUD-05 invoices, GST, credit notes | **HANDOFF REQUIREMENT, no concept vote** | Explicit billing/tax ownership and compliance/QA gates added to module map, handoff, current index and acceptance; lawful tax breakdowns do not violate the two checkout-charge-component rule. Details require actual applicability/qualified review during development. |
| AUD-06 PhonePe review-site vs private beta | **CLOSED, staged** | Three distinct milestones: safe non-transacting public merchant review presence (subject to PhonePe criteria), isolated invited beta, and later authorised commercial go-live. Stage/QA protections added to reliability and handoff docs. |
| AUD-07 stale authority and phase statuses | **CLOSED as doc navigation** | README, governance, roadmap, open questions, historical WEB-042/search/architecture and Phase 3/4 files now carry prominent latest-status/supersession notices; current effective index created. Historical paragraphs intentionally retained. |
| AUD-08 independent reviewer availability | **OPERATIONS READINESS / NOT CONCEPT** | Explicit staffing/role/access and independent-review coverage needed for live operations, with no weakening of authorisation or separation of duties. |
| P2 owner logo/media and operational SKU/rates/policies | **DEVELOPMENT CONTENT/CONFIGURATION** | User confirms logo/files available for developer supply. Actual SKUs, prices, rates, tax docs, legal copy, PhonePe credentials, Hostinger sizing and asset/licensing verification are later execution inputs. |

**Reconciled concept status:** No **remaining identified owner-level Phase 1–4 website concept decision**. This does **not** mean the website, integration or legal/QA readiness is complete. The repository maintains long dated historical sections with superseded prose; engineers must start at the current effective index and not treat every historical LOCKED label as simultaneously valid.

**Review limit:** This was a repository-wide document/consistency audit plus targeted corrective update, **not** exhaustive clause-by-clause formal verification, independent legal advice, current PhonePe policy verification, executable tests or a production-readiness certification. No website code, payments or VPS changes were performed. The owner has approved the new controlling business outcomes; remaining work is normal implementation and launch compliance.

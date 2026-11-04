# Tavistra — CURRENT effective cross-phase specification (handoff entry point)

**Date:** 2026-11-04  
**Status:** OWNER-APPROVED effective policy reconciliation after the full Phases 1–4 audit. Phases 1–4 remain concept/planning CLOSED. No code or deployment approved.

**Read in this order:** this current effective index → [latest dated decision register](../decisions/decision-register.md) and [requirements](../website/requirements.md) → [reconciled production/money matrix](../decisions/current-production-payment-lifecycle.md) → [Phase 4 critical acceptance](phase-4-requirements-acceptance-matrix.md) → [Phase 3 customer](phase-3-customer-page-family-specification.md)/[staff UX](phase-3-admin-ux-specification.md) → [module/integration map](phase-4-module-integration-map.md) → [developer handoff](phase-4-developer-handoff.md).

**Interpretation:** Later explicit owner-approved substantive decisions always override incompatible historical OPEN/LOCKED prose, even when stored in a document that still calls itself 'canonical'. Do not erase old records. Where a genuine material question remains, refer to the focused pending register below; do not guess policy or solicit incidental UI microdecisions.

## Effective locked baseline at launch

| Area | Controlling requirement | Consequence |
|---|---|---|
| Brand, discovery and design | Six-category Contemporary/Adaptive Gallery; approved Warm Mineral/typography; accessible public Shop/search/collections/product, customer and role-based staff page families; no Journal | Preserve Phases 1 and 3 owner-approved experience |
| Purchase-mode separation | **Ready Stock, Made to Order and Quote Only are independent order/payment/fulfilment modes** | Separate orders, mode-specific payment, timelines, status, refund and staff actions. No combined mode order/payment/dispatch requirement |
| Cart UX | Developer choice within locked mode boundaries | Group/separate selections clearly, guide to appropriate commitment. No mixed-mode checkout, merged orders or hidden extra charges |
| Ready Stock | Authoritative inventory, reservation, delivery pricing, verified applicable payment, dispatch and post-purchase rules | No MTO 25%/75% instalment assumed; obey manual-delivery-quote unpaid reservation exception |
| Made to Order | **At least 25% verified** of agreed total before authorised production payment eligibility/physical start; **100% cumulative verified before dispatch** | Separate staff readiness, permissioned release, grace period, actual production start, QC, packing, authorised dispatch readiness and physical carrier handover |
| Quote Only | Enquiry → staff clarification → versioned issued quote → exact-version customer acceptance and timely verified 25% advance → confirmed order → governed production → remaining balance → dispatch | Never ordinary checkout; same **25% before production / 100% before dispatch** principle, plus original quote deadline and distinct order/quote references |
| 30-day quote clock | Original Quote Only issue date is day zero; deadline day 30 23:59:59 Asia/Kolkata; revisions do not reset; original unconfirmed offer expires | Preserve timely payment-late-webhook reconciliation and approved refund/expiry handling |
| 7-day confirmed-order clock | Starts on confirmed MTO/Quote Only verified advance/order confirmation, local date day zero; ends day seven 23:59:59 Asia/Kolkata; no actual physical production before day eight | **Independent** of quote's 30-day clock. Confirmed-order change/cancellation rights and valid timely requests cannot be cut off by original quote expiry |
| Production cutoff | Actual physical start (auditable actor/event), not readiness/release/grace expiry, ends ordinary discretionary changes; holds and statutory remedies remain | Protect pending changes, outage exceptions and lawful pre-production refund rights |
| Fulfilment | Each mode/order progresses separately through its existing custody, quality, packing, dispatch-approval and delivery gates | **No forced cross-mode consolidated dispatch** at launch. Do not carry old one-mixed-order assumptions forward; preserve applicable safeguards |
| Customer pricing | Only discounted tax-inclusive product price and one combined delivery charge if applicable | No customer packing/weight/fragility line; lawful invoice tax details are *not* extra checkout charges |
| Promotions | Customer-entered coupons/stacking not offered at launch | Owner/staff configured discounts and offers subject to approved controls |
| Ready Stock returns | Standard non-returnable unless explicit product setting; returnable must have owner/Administrator-approved product-specific published N-day window; statutory overrides | Purchase-time policy snapshot and confirmed delivery day-zero window |
| Identity and service | Guest checkout, optional verified account, audited order-linked support and historical guest-order linking with evidence/staff approval | Do not infer ownership from matching email; protect privacy and remedies |
| Delivery price | Internal registered-pincode/distance-band/chargeable-weight/oversize rules; manual courier status | No live carrier-rate or route API requirement |
| Hosting/payment | Small independently hosted Hostinger VPS; PhonePe intended merchant gateway pending provider review, credentials and verified integration | Non-transacting public review presence ≠ private beta ≠ commercial go-live |
| Development owner | AI-assisted engineering under owner supervision | No code, VPS procurement/provisioning, onboarding, deployment or launch authorised in this documentation review |

## Historical conflicts explicitly not executable

- [WEB-042 v1](../decisions/WEB-042-made-to-order-lifecycle-matrix.md), [architecture](../website/architecture.md), [requirements older paragraphs](../website/requirements.md) and [historical search proposal](../website/design-system-search-proposal.md) stating *full payment before Made to Order release* are **superseded**. Full verified payment belongs to dispatch.
- The older **single mixed Ready Stock/Made to Order order with compulsory consolidated dispatch** cannot be used for initial launch now that all three modes are operationally separate.
- The old interpretation **seven-day grace included within the original thirty-day quote period** is superseded. The two windows are independent.
- The old **provider unselected** wording was superseded by Hostinger VPS and PhonePe choices, though actual technical credentials/capabilities are pending.
- Historical Phase 1/2 status claims and Phase 3 drafts are superseded by owner Phase 1–4 approvals.

## Closed as development/compliance deliverables, not concept questions

- Cart presentation, cross-page microinteractions, state-transition implementation, DB schema, notification templates/retry logic, UI dimensions and responsiveness verification.
- Tax/GST determination, lawful invoices/receipts, credit/debit notes, tax reconciliation and secure record availability as an **explicit engineering acceptance requirement**; actual applicability/compliance must be reviewed by qualified advisers. Two checkout charge components remain immutable.
- Initial products, actual costs, tariffs/divisor/return duration, brand logo/media supplied by owner, domain and editorial/legal policy copy approval.
- Exact Hostinger VPS size/backups, PhonePe merchant review requirements/API, payment webhooks/refunds/reconciliation, staffing roles and independent approval coverage.
- Public review-ready site, private beta and commercial release have separate safety and owner-approval gates.

## Pending *concept-level* owner decisions

**None identified after the 2026-11-04 post-audit clarifications.** Reopen only if a verified conflict changes customer payment commitment, order rights, mode-specific fulfilment, law or production safety. Implementation details above remain implementation readiness work, not fresh policy questions.

## Closure evidence

[Full cross-phase audit](full-repository-cross-phase-audit.md) lists findings and their later disposition; [current production-payment lifecycle](../decisions/current-production-payment-lifecycle.md) replaces stale payment assumptions without deleting the historical matrix. Handoff-cleanup approval/assessment documents should point to this page first. This is documentation readiness, **not** executed test evidence or launch signoff.

# Tavistra — Phase 4 developer handoff and integration gates

> **UPDATED EFFECTIVE HANDOFF (2026-11-04):** Owner's global post-audit decisions take precedence over older handoff descriptions. Follow [current effective cross-phase baseline](current-effective-handoff-baseline.md) and [current payment/production lifecycle](../decisions/current-production-payment-lifecycle.md): all three modes have distinct order/payment/fulfilment flows, with no forced combined dispatch; >=25% verified before MTO/Quote Only production and 100% before dispatch; independent quote 30-day and confirmed-order seven-day clocks. Cart UX and invoicing/tax mechanics are engineering acceptance, not new concept decisions. H0–H7 below remain preparatory, not authorised execution.


**Date:** 2026-11-04  
**Status:** Developer handoff planning; no website code or deployment authorised in this conversation.  
**Authority:** [decision register](../decisions/decision-register.md), [website requirements](../website/requirements.md), [Phase 3 customer UX](phase-3-customer-page-family-specification.md), [Phase 3 admin UX](phase-3-admin-ux-specification.md), [Phase 4 acceptance matrix](phase-4-requirements-acceptance-matrix.md), [architecture validation](phase-4-architecture-validation.md), [module map](phase-4-module-integration-map.md).

## Confirmed owner execution inputs

- **Development/maintenance:** AI-assisted under owner supervision. Use maintainable mainstream stack, narrow testable work packages and explicit owner-controlled credentials/deployments; independent checks for financial/security-critical functionality.
- **Hosting:** small **Hostinger VPS** selected as provider/direction for Tavistra's independent hosting. Exact VPS plan, RAM/CPU/storage, backup configuration and performance capacity are **not yet selected or verified**. Do not assume existing static hosting can run the backend.
- **Payment:** **PhonePe** selected as intended gateway. Owner reports PhonePe merchant onboarding/production API access requires a fresh live website for review and approval. Treat this as an **owner-reported external dependency**, not independently verified universal provider policy. Merchant approval, supported payment/refund/webhook capabilities, settlement/fees, sandbox availability and production credentials remain pending. Never fabricate API credentials or treat a redirect as verified payment.

## Resolve the website-before-gateway dependency

Prepare a **publicly accessible, honest, review-ready site** before payment activation: approved brand identity, working public navigation, genuine catalogue/product information where ready, contact/business identity, relevant shipping/returns/refunds/privacy/terms policies reviewed for accuracy, and truthful checkout/payment availability messaging. Do not simulate completed payments, claim checkout is operational when it is not, or accept unverified payment commitments.

A review-ready public site is **not** a full commercial launch and does not silently waive previously approved launch functionality or statutory protections. During pre-approval review, disable or clearly mark unavailable any purchase/payment action that cannot complete safely. Once PhonePe approval/credentials are available, validate backend-authoritative payment verification, webhook authentication, reconciliation, refund operations and failure/retry paths in staging before enabling live checkout.

**Gateway contingency:** If PhonePe review requires a functional checkout/payment demonstration rather than a publicly accessible informational/catalogue site, seek the provider's approved sandbox/demo or alternative review procedure. Do not improvise a live payment workaround or select a second gateway without an explicit owner decision.

## 2026-11-04 — Corrected integration/operating sequence

The approved owner clarification establishes **three mode-separated order, money and fulfilment paths**, no forced consolidated shipment at launch, and **25% verified** for MTO/Quote Only production gates with **100% verified** required before dispatch. The original Quote Only 30-day offer-expiry and confirmed-order seven-day grace run **independently**. Developers own cart display/interaction decisions that preserve separate payment/checkouts, as well as statutory invoices, GST/tax paperwork, adjustments/credit notes and reconciliation subject to applicable law. Brand/logo/media are supplied during content implementation.

**Release environments are distinct:** (1) honest, safe public review-ready **non-transacting** website for PhonePe merchant review, if provider confirms it suffices; (2) private invited payment/integration beta on isolated testing environment and test credentials; (3) public commercial launch only after verified gateway, recovery, legal, privacy and operational acceptance. PhonePe's actual onboarding criteria still require provider verification. None of these stages is authorised to execute in this conversation.

## Ordered future work packages

| Package | Scope | Gate |
|---|---|---|
| H0 Baseline | Freeze decision-to-acceptance references; document environment, secrets, domain, rollback and operator ownership | No contradictory old OPEN markers treated as current |
| H1 Infrastructure | Provision and secure Hostinger VPS, backup/restore, TLS, logging, deployment pipeline, staging isolation | Measured capacity and tested restore; no production secrets in source |
| H2 Public review-ready site | Implement approved Phase 3 storefront shell, content publishing, genuine catalogue/discovery, contact and accurate policy/legal pages | Public site accurately describes business and availability; no unsafe payment flow |
| H3 Merchant onboarding | Submit review-ready website to PhonePe; complete merchant/KYC and receive permitted integration materials | Provider acceptance and integration capabilities verified |
| H4 Commerce foundations | Identity/RBAC/audit, catalogue commercial truth, tax/internal delivery engine, inventory, orders, payments ledger, notifications | TAV-02/03/05/11/12/13 and negative/concurrency checks |
| H5 Purchase journeys | Separate Ready Stock/Made to Order checkout, Quote Only versioned acceptance/25% advance, verified payment integration | TAV-04/06/07/08; no coupon entry at launch |
| H6 Fulfilment and service | Production, staff worklists, manual courier/tracking, guest/account, linking, support, refunds/returns | TAV-09/10/11/14 and protected staff permissions |
| H7 Release | End-to-end financial reconciliation, legal/content signoff, accessibility/mobile/SEO, monitoring, recovery and staff training | TAV-15 and all owner-approved initial-launch scope; explicit go-live decision |

Work packages express **dependency priorities**, not a claim that all backend development must wait for merchant approval. Non-payment modules may be built and tested in parallel. Production payment activation and commercial launch must wait for verified integration.

## Critical acceptance and ownership

- Use [TAV-01 through TAV-15](phase-4-requirements-acceptance-matrix.md) as critical acceptance index, tracing implementation details to latest locked decisions.
- Public content must never authorize stale stock/price, and no client redirect alone confirms payment.
- No launch without required financial, production, stock, identity/privacy, statutory, backup/restore and support controls.
- Owner controls merchant onboarding, VPS subscription, domain/business details, credentials, policy approvals and final deployment approval; AI-assisted engineering produces auditable changes and verification evidence, not autonomous production claims.

## Remaining owner inputs, only when actionable

1. Confirm actual Hostinger VPS plan/limits and domain when infrastructure is being provisioned.
2. Provide PhonePe merchant requirements and available sandbox/API documents when onboarding advances; review any requirements that materially affect checkout.
3. Approve truthful public business/contact and legal-policy content for review-ready deployment.
4. Authorise any later code development, staging deployment and public release separately. **This Phase 4 planning document is not that authorisation.**

## Next Phase 4 step

Perform a concise final planning-readiness audit: confirm no concept gaps, validate H0–H7 against the acceptance matrix, classify external blockers vs non-blockers, and identify the minimum owner decisions needed before actual engineering. **No code or deployment here.**


## 2026-11-06 — Current delivery and bulk checkout acceptance override

**Effective source:** [current handoff baseline](current-effective-handoff-baseline.md), [approved product/delivery pricing](../website/delivery-fee-pricing-approved.md), [PIN launch policy](../website/delivery-pincode-launch-policy.md). This later owner decision overrides incompatible historical calculation and serviceability implementation assumptions above.

- At **ordinary order** validation, allow maximum **10 units per product across variants** and **10 distinct order lines**. Exceed either: direct to staff **bulk enquiry**, no ordinary order/payment; staff agree potential bulk discount and actual delivery charge before a subsequent mode-specific commitment. Quantity =10 is allowed. Do not combine distinct purchase modes as one order to enforce limits.
- Ordinary delivery charge = **one highest owner-configured product × destination commercial band slab**, with 12 allowed amounts (₹0 through ₹7,500), not a runtime distance-plus-weight surcharge formula. Packed volume/weight remain costing inputs only. Charge snapshots persist after acceptance.
- The selected **delivery fee is final customer-payable**; no GST increment or surprise transport fee at checkout. Tax liabilities where applicable are internally accounted for in that accepted amount, with lawful invoices/adjustments (CGST Act s.15(2)(c) makes presumed GST exemption unsafe).
- An approved PIN permits any normal product by default. Staff handle rare infeasibility; no launch SKU×PIN carrier restriction matrix. Missing pricing is **not** ₹0 and must not allow ordinary paid checkout; use existing authorised manual estimate flow.
- Made to Order/Quote Only: practically check shipping feasibility during independent seven-day confirmed-order no-start grace; unresolved critical infeasibility **blocks actual production start** even after grace expires. Verified payment and customer rights remain intact.
- Accepted order delivery fee is **not routinely repriced or partly refunded** after a partial item cancellation. Apply full seller-side nonfulfilment refund to a wholly cancelled order, and preserve applicable statutory or agreed adjustments.
- Add regression tests for 10 vs 11 units, 10 vs 11 lines, same product split across variants, bulk enquiry without payment, no tax added to accepted shipping amount, missing tariff no free checkout, unshippable MTO pre-start hold, seller refund with delivery fee, and partial cancellation preserving accepted delivery fee except legal remedy.

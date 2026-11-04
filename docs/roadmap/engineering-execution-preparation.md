# Tavistra — Engineering execution preparation (post Phase 4)

> **POST-AUDIT PLANNING CLARIFICATION (2026-11-04):** Execution remains unauthorised. This is an ordering proposal only. [Current effective handoff](current-effective-handoff-baseline.md) now controls independent Ready Stock/MTO/Quote Only orders and fulfilment, 25% production/100% dispatch gates for MTO and Quote Only, independent 30-day/7-day clocks, development-owned cart UX/invoicing and review-site/private-beta distinction.


**Date:** 2026-11-04  
**Status:** PREPARATION ONLY; separate owner authorisation required for any code, VPS provisioning, deployment, paid service, PhonePe onboarding action or launch.  
**Authority:** Latest [decision register](../decisions/decision-register.md), [requirements](../website/requirements.md), [Phase 4 acceptance matrix](phase-4-requirements-acceptance-matrix.md), [module map](phase-4-module-integration-map.md), [developer handoff](phase-4-developer-handoff.md) and [final readiness review](phase-4-final-readiness-review.md). Phases 1–4 closed.

## Execution approach

Owner-supervised AI-assisted engineering with narrow, independently verifiable work packages. Each package has a documented scope, locked decision references, acceptance evidence, rollback/recovery considerations and explicit human approval for high-risk operations. Prefer the recommended TypeScript modular-monolith/PostgreSQL architecture, subject to actual Hostinger VPS feasibility; no additional micro-votes.

## Proposed future execution sequence

| Order | Work package | Acceptance gate |
|---|---|---|
| E0 | Engineering kickoff: repo conventions, environment separation, secret policy, architecture diagram, exact hosting/operational ownership, acceptance-test mapping | Owner approves scope and access boundaries before execution |
| E1 | Hostinger VPS foundation: secure provisioning, DNS/TLS, CI/CD, monitoring, backups, restore, staging separation | Restore and access controls demonstrated; no live payment credentials in repo |
| E2 | Review-ready public website: approved visual shell, truthful brand/contact, product catalogue, shipping/return/privacy/terms, crawlable public pages, clear non-operational payment messaging | Owner approves content and deployment; no fake checkout or unverified payment |
| E3 | PhonePe merchant onboarding: submit site and documents, confirm gateway requirements, obtain sandbox/production access when authorised | Provider acceptance and integration contract confirmed; no bypass |
| E4 | Commerce core: identity/RBAC/audit, product/price/tax/internal delivery authority, stock/reservations, orders/payment/refund ledger | Critical integrity and concurrency checks pass |
| E5 | Mode-specific commerce: separate Ready Stock and Made to Order checkout, Quote Only versioned 30-day quote and verified 25% advance | Provider-verified payment, grace/production gates and no combined checkout |
| E6 | Operations: staff administration, production, dispatch/manual tracking, guest/account linking, support, returns/refunds | Customer/staff end-to-end and protected-action tests pass |
| E7 | Launch readiness: policy/legal review, catalogue/tax/delivery configuration, mobile/accessibility, SEO, security/privacy, reconciliations, backups/restore, staff training, rollback | All approved initial-launch requirements and explicit owner go-live approval |

**Dependency nuance:** E3 merchant approval may depend on E2 public site; E4–E6 non-payment work can proceed in parallel with onboarding. Public review-ready site does not equal commercial launch.

## 2026-11-04 — Reconciled build-plan boundaries

Apply [CURRENT cross-phase baseline](current-effective-handoff-baseline.md) and [current lifecycle](../decisions/current-production-payment-lifecycle.md) for every work package. **Ready Stock**, **Made to Order** and **Quote Only** have independent transaction and fulfilment contracts; no combined mode checkout/payment/order/required dispatch at launch. Cart UX is a development choice bounded by those constraints. Build MTO/Quote Only 25%-verified production and 100%-verified dispatch rules, and independent Quote Only 30-day issuance and seven-day confirmed-order grace. Include invoice/tax-document generation and refund/credit-note reconciliation in commerce core/QA as legally applicable. Owner-supplied logos/media and actual catalogue are content readiness, not new Phase 3 concept approvals.

## Minimum owner inputs before respective execution

- Before E1: exact Hostinger VPS plan, domain/DNS access, credentials handling, backup/incident owner and budget.
- Before E2 public deployment: approved business identity, contact details, product/media and legally reviewed policies, plus explicit authorisation to deploy.
- Before E3: PhonePe merchant/KYC details and provider's current review criteria; owner-controlled onboarding.
- Before live payments: approved provider account/API access, verified webhooks, refund/reconciliation checks and owner approval.
- Before commercial launch: evidence of complete scope, security/financial testing, operations readiness and explicit go-live approval.

## Non-negotiable controls

No generated code is self-certifying. Preserve backend-authoritative money/stock/order state, two customer-facing price components, mode-separated checkouts, original quote expiry, verified 25% advance, seven-day grace/production cutoff, statutory remedies, secure guest/account access, immutable audit, internally priced delivery with no courier-rate API, and all other latest locked decisions. Never expose production credentials or silently change customer obligations.

**Current action:** This document is the next-stage preparation package only. Await separate owner authorisation for E0/E1 or any other execution. Do not write or deploy website code as part of preparing it.

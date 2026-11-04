# Tavistra — Phase 4 architecture validation

**Date:** 2026-11-04  
**Status:** Recommended technical direction for developer handoff; **not** owner approval of a stack/vendor, procurement, code or deployment.  
**Sources:** [architecture candidates](../website/architecture.md), [implementation-readiness plan](implementation-readiness-plan.md), [critical acceptance matrix](phase-4-requirements-acceptance-matrix.md), latest [decision register](../decisions/decision-register.md), [website requirements](../website/requirements.md), and approved Phase 3 customer/admin specifications.

## Recommendation

**Use a TypeScript modular monolith with PostgreSQL, separate logical public storefront and private staff admin, and one shared authoritative commerce backend.** Prefer a monorepo and simple independently deployable web/admin/backend processes only where this improves isolation or operations; do not default to microservices or a separate service for each exception. This is an engineering recommendation pending validation, not a new locked owner decision.

| Architecture boundary | Recommended default | Why / validation condition |
|---|---|---|
| Public storefront | Next.js / React + TypeScript, server-rendered/indexable catalogue and editorial content | SEO, responsive performance, consistent page-family UX; cache must never authorize price/stock/order |
| Staff admin | React + TypeScript, authenticated, role-aware app; Vite viable | Dense worklists and record details; enforce authorization in backend, not just UI |
| Commerce API | Node.js + TypeScript, modular monolith with explicit module contracts | Shared transaction model and lower team/hosting burden; benchmark concurrent checkout and background jobs |
| Transactional database | PostgreSQL with transaction-safe reservation, payment/order ledgers and audited transitions | Prevent oversell and inconsistent money/production states; test races, retries, idempotency and restores |
| Content/media | Validated Markdown + media publishing pipeline for editorial product content; commercial truth stays in DB | Preserve existing accepted publishing preference; no executable uploads or file scans per request |
| Async work | Durable outbox/jobs for payment events, transactional email and required notifications; simple workers | Avoid dropped notifications and duplicate effects; no broad workflow engine |
| Deployment | Separate Tavistra environment; Linux VPS or managed equivalent evaluated by measured load, backups, Indian latency and operations | No premature provider or 4 GB commitment; operational ownership and recoverability matter |
| External services | Managed Indian-capable payment provider; SMTP relay; manual courier/tracking operations | Provider must support verified events, refunds and reconciliation; **no live courier rate/route API** |
| Security | Least privilege, session/guest link expiry, restricted staff evidence, immutable audit, secrets isolation and tested backup restore | Server-enforced protections, not merely UX controls |

## Alternatives and tradeoffs

1. **Modular monolith vs microservices:** monolith recommended for initial scale and transactional consistency. Revisit only if measured independent scaling, organizational ownership or reliability warrants decomposition. Microservices add operational and distributed-transaction burden.
2. **Separate admin frontend vs shared Next.js app:** prefer logical isolation; either separate React build or protected application boundary is viable if access controls, deployment and maintenance remain simple. Engineering can choose without owner vote.
3. **Self-hosted VPS vs managed hosting:** VPS may reduce nominal hosting fees but increases patching, monitoring, backups, disaster recovery and staff burden. Compare **total operating cost**, not just monthly server price. No cost figures asserted without quotes and workload assumptions.
4. **Markdown-driven product editorial vs all-in-one CMS:** preserve approved content model; provide controlled staff authoring/publishing workflow. A CMS is not a reason to move prices, stock or payments out of transactional authority.
5. **Node/TypeScript vs Rust/Axum:** Node/TypeScript preferred for full-stack team coherence and delivery speed; Rust remains possible only with demonstrable team capability and operational justification. Do not choose solely on theoretical performance.

## Critical architecture proof points for future engineering

- Concurrency: simultaneous Ready Stock checkout, stock reservations, expiry, late payment and cancellation never oversell.
- Money: verify server-side provider events, deduplicate retries, reconcile partial/pending/failed/refunded states; no redirect-as-success.
- Purchase boundaries: separate Ready Stock and Made to Order checkouts, distinct Quote Only acceptance and verified 25% advance, no launch coupon entry.
- Production: seven-day grace, actual production-start cutoff, staff permission and blocked-release constraints survive races and retries.
- Privacy: verified email, per-order staff ownership approval, guest access expiry/revocation and restricted investigation evidence.
- Fulfilment: internally configured delivery pricing by registered pincode, approved distance/weight/dimension rules, manual courier updates, no carrier-rate integration.
- Operations: audit, durable notifications, backups/restores, release rollback and monitoring work on the selected hosting shape.

## Document reconciliation warnings

- Older architecture notes include **historical OPEN labels** for shipping, coupons and WEB-038. They are not active launch-policy questions when later decisions resolve them. Follow the latest dated owner-approved register and Phase 4 acceptance matrix.
- The architecture draft's mention of optional courier APIs is **not** a launch integration requirement and must not override the later no-courier-API delivery-pricing policy.
- Earlier implementation plan's references to immediate beta deployment or vertical-slice build describe future developer work, not permission to code in this planning conversation.

## Decisions genuinely needed from owner

**None immediately.** The architecture shape can advance as a **recommended handoff baseline** without locking a vendor or spending money. Before procurement or implementation commitment, owner should confirm only material budget/operational tradeoffs: expected initial traffic and catalogue scale (if known), monthly hosting/operations budget ceiling, and whether Tavistra has a developer/team able to maintain the selected stack. These are inputs to vendor sizing and execution planning, not blockers to finishing this design handoff.

## Next Phase 4 deliverable

Prepare module/integration ownership and dependency mapping, then a concise developer handoff with acceptance traceability, pre-build procurement decisions and release gates. **No website code or deployment in this conversation.**


## 2026-11-04 — Owner-selected development resourcing assumption

**OWNER DIRECTION:** Option A, AI-assisted development under owner supervision, is the current Phase 4 planning assumption. Prioritise mainstream maintainable tools, bounded testable work packages, clear documentation and owner-controlled credentials/deployments. This does not imply AI-only operational reliability or remove independent security/financial verification and statutory obligations. The [module/integration dependency map](phase-4-module-integration-map.md) records ownership and external dependencies. Architecture vendors remain recommendations, not locked procurement choices; no code or deployment authorised.


## 2026-11-04 — Owner hosting and payment selection for handoff

**OWNER-SELECTED:** Hostinger small VPS for independent Tavistra hosting; actual plan and capacity to be validated. **OWNER-SELECTED TARGET:** PhonePe payment gateway, with merchant approval/production credentials pending review of a fresh live website according to the owner's onboarding understanding. Do not describe payment integration as approved or functional. Plan a truthful public review-ready site before payment activation, with unsafe checkout disabled, then integrate and verify PhonePe payment/refund/reconciliation before commercial launch. See [Phase 4 developer handoff](phase-4-developer-handoff.md). No website code/deployment authorised by this selection.

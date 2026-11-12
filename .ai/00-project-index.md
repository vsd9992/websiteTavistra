# Project Index

Project: Tavistra (`websiteTavistra`)
Phase: Phase 2 — Execution (Sets 0–3 Completed; Set 4 Next)
Milestone: Modular Hardening & Verification
Status: Sets 0, 1, 2 (68/68), and 3 (54/54, incl. MFA & sign-out fix) verified live on `devMachine`; ready for Set 4 on approval.

## Active Tasks
- [.ai/tasks/active/set-4-cart-checkout.md](tasks/active/set-4-cart-checkout.md) — Set 4: Cart Governance, Delivery Engine & Ready Stock / MTO Checkout (Pending approval)

## Document Map
- [AGENTS.md](../AGENTS.md) — Operating rules & memory policy
- [.ai/00-project-index.md](00-project-index.md) — Live orientation map
- [.ai/project/project-plan.md](project/project-plan.md) — High-level baseline (H0–H7)
- [.ai/project/roadmap.md](project/roadmap.md) — Phase & Set milestones
- [docs/roadmap/current-effective-handoff-baseline.md](../docs/roadmap/current-effective-handoff-baseline.md) — Canonical 2026-11-04 spec
- [docs/decisions/current-production-payment-lifecycle.md](../docs/decisions/current-production-payment-lifecycle.md) — Production & payment lifecycle
- [docs/roadmap/phase-4-developer-handoff.md](../docs/roadmap/phase-4-developer-handoff.md) — Developer handoff gates
- [docs/website/delivery-fee-pricing-approved.md](../docs/website/delivery-fee-pricing-approved.md) — 12-slab fee & bulk policy
- [docs/website/delivery-pincode-launch-policy.md](../docs/website/delivery-pincode-launch-policy.md) — PIN launch governance
- [docs/testing/pre-live-acceptance-runbook.md](../docs/testing/pre-live-acceptance-runbook.md) — Phase 3 UAT runbook

## Current Decisions
- [0001-dev-deployment-environment.md](decisions/current/0001-dev-deployment-environment.md) — Windows local + Debian `devMachine` (`192.168.1.100`)
- [0002-pnpm-monorepo-structure.md](decisions/current/0002-pnpm-monorepo-structure.md) — pnpm monorepo (`storefront`, `admin`, `db`, `shared`)
- [0003-dev-server-ports-and-runtime.md](decisions/current/0003-dev-server-ports-and-runtime.md) — Ports `3001` (storefront), `3002` (admin)
- [0004-delivery-fee-and-bulk-policy.md](decisions/current/0004-delivery-fee-and-bulk-policy.md) — 12-slab ladder, strict enabled PINs, 10-unit/10-line bulk boundary
- [0005-modular-workflow-and-product-pipeline.md](decisions/current/0005-modular-workflow-and-product-pipeline.md) — Sets 0–8 phasing & folder-based product pipeline

## Active Risks
- PhonePe merchant review requires a live review-ready public site before gateway keys are issued.
- Physical production & dispatch must enforce 25% advance / 100% dispatch payment gates.

## Historical Pointers
- Archived Tasks: [.ai/tasks/archive/](tasks/archive/) (`set-3-customer-identity.md`, `set-2-delivery-governance.md`, `set-1-product-markdown-pipeline.md`, `h4-commerce-foundations-db.md`, `h6-staff-admin-portal.md`)
- Concept docs imported into `docs/` and `CONCEPT_README.md`.

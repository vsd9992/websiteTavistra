# Project Index

Project: Tavistra (`websiteTavistra`)
Phase: Phase 2 — Execution (Modular Refinement: Sets 0 & 1 Completed, Set 2 Active — Full PIN Hierarchy & 12-Slab DB Engine)
Milestone: Baseline Adoption & Modular Hardening
Status: Set 0 & Set 1 verified live on devMachine; Set 2 active (building full Admin/Customer nested PIN governance & DB-backed 12-slab engine).

## Active Tasks
- [.ai/tasks/active/set-2-delivery-governance.md](tasks/active/set-2-delivery-governance.md) — Set 2: Hierarchical PIN Governance, DB 12-Slab Engine, Zone Controls & Admin Logistics UI
- [.ai/tasks/active/set-3-customer-identity.md](tasks/active/set-3-customer-identity.md) — Set 3 (Queued): Customer Identity, Authentication, Addresses & Privacy Isolation

## Document Map
- [AGENTS.md](../AGENTS.md) — Permanent repository operating rules & memory contract
- [.ai/00-project-index.md](00-project-index.md) — Live orientation and navigation (this file)
- [.ai/project/project-plan.md](project/project-plan.md) — High-level project baseline and work packages (H0–H7)
- [.ai/project/roadmap.md](project/roadmap.md) — Project milestones and phase tracking
- [docs/roadmap/current-effective-handoff-baseline.md](../docs/roadmap/current-effective-handoff-baseline.md) — Canonical 2026-11-04 Effective Cross-Phase Specification
- [docs/decisions/current-production-payment-lifecycle.md](../docs/decisions/current-production-payment-lifecycle.md) — Reconciled production & payment lifecycle
- [docs/roadmap/phase-4-developer-handoff.md](../docs/roadmap/phase-4-developer-handoff.md) — Developer handoff and integration gates
- [docs/website/delivery-fee-pricing-approved.md](../docs/website/delivery-fee-pricing-approved.md) — Approved 12-slab delivery fee & bulk order policy (2026-11-06)
- [docs/website/delivery-pincode-launch-policy.md](../docs/website/delivery-pincode-launch-policy.md) — Approved PIN code launch governance (2026-11-06)
- [docs/testing/pre-live-acceptance-runbook.md](../docs/testing/pre-live-acceptance-runbook.md) — Pre-Live Acceptance & Quality Assurance Runbook (Phase 3 UAT Checklist)

## Current Decisions
- [.ai/decisions/current/0001-dev-deployment-environment.md](decisions/current/0001-dev-deployment-environment.md) — Local Windows development with remote Debian dev/deployment server (`192.168.1.100`)
- [.ai/decisions/current/0002-pnpm-monorepo-structure.md](decisions/current/0002-pnpm-monorepo-structure.md) — pnpm monorepo modular monolith (`apps/storefront`, `apps/admin`, `packages/db`, `packages/shared`)
- [.ai/decisions/current/0003-dev-server-ports-and-runtime.md](decisions/current/0003-dev-server-ports-and-runtime.md) — Dev server runtime & port allocation (`http://192.168.1.100:3001` for storefront, `3002` for admin)
- [.ai/decisions/current/0004-delivery-fee-and-bulk-policy.md](decisions/current/0004-delivery-fee-and-bulk-policy.md) — 12-slab delivery fee ladder, highest-product-fee rule, universal PIN serviceability, and 10-unit/10-line bulk boundary
- [.ai/decisions/current/0005-modular-workflow-and-product-pipeline.md](decisions/current/0005-modular-workflow-and-product-pipeline.md) — Modular workflow phasing strategy (Sets 0–8) and isolated product folder/zip pipeline architecture

## Active Risks
- PhonePe merchant review requirement requires a live, review-ready public site before gateway API access and production keys are granted.
- Physical production and fulfilment operations must strictly enforce the 25% advance / 100% dispatch payment gates.

## Historical Pointers
- Archived Tasks: [.ai/tasks/archive/](tasks/archive/) (`set-1-product-markdown-pipeline.md`, `h4-commerce-foundations-db.md`, `h6-staff-admin-portal.md`)
- Concept repository: `https://github.com/vsd9992/Tavistra.git` (downloaded to `docs/` and `CONCEPT_README.md`)

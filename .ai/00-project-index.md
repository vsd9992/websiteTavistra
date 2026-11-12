# Project Index

Project: Tavistra (`websiteTavistra`)
Phase: Phase 2 — Execution (Modular Refinement: Set 0 Completed, Set 1 Active)
Milestone: Baseline Adoption & H1/H2 Execution Readiness
Status: Set 0 verified live on devMachine; Set 1 (Product Markdown, Media, Multi-Variant Engine) active.

## Active Tasks
- [.ai/tasks/active/set-1-product-markdown-pipeline.md](tasks/active/set-1-product-markdown-pipeline.md) — Set 1: Master Folder (.zip + .md + images), Multi-Variant Engine, Media Storage & PDP Presentation
- [.ai/tasks/active/h6-staff-admin-portal.md](tasks/active/h6-staff-admin-portal.md) — Centralized Commerce & Staff Admin Synchronization (Database, 75% Balance Flow, QC Transparency, Hard Dispatch Gate)

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
- [.ai/decisions/current/0003-dev-server-ports-and-runtime.md](decisions/current/0003-dev-server-ports-and-runtime.md) — Dev server runtime & port allocation (`http://192.168.1.100:3001` for storefront)
- [.ai/decisions/current/0004-delivery-fee-and-bulk-policy.md](decisions/current/0004-delivery-fee-and-bulk-policy.md) — 12-slab delivery fee ladder, highest-product-fee rule, universal PIN serviceability, and 10-unit/10-line bulk boundary
- [.ai/decisions/current/0005-modular-workflow-and-product-pipeline.md](decisions/current/0005-modular-workflow-and-product-pipeline.md) — Modular workflow phasing strategy (Sets 0–8) and isolated product folder/zip pipeline architecture

## Active Risks
- PhonePe merchant review requirement requires a live, review-ready public site before gateway API access and production keys are granted.
- Physical production and fulfilment operations must strictly enforce the 25% advance / 100% dispatch payment gates.

## Historical Pointers
- Concept repository: `https://github.com/vsd9992/Tavistra.git` (downloaded to `docs/` and `CONCEPT_README.md`)

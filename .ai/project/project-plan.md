# Project Plan

modified: 2026-11-06

## Objective
Deliver Tavistra (`websiteTavistra`) — a premium design-led lifestyle and décor website and commerce platform (VDesign sub-brand). Phases 1–4 concept/planning specification is completed and locked as the authoritative blueprint. The current focus is technical implementation readiness and execution according to the Phase 4 Developer Handoff roadmap.

## Authority & Master Blueprint
- **Canonical Concept Specification**: Imported into `docs/` from the concept repository (`vsd9992/Tavistra`).
- **Controlling Handoff Baseline**: `docs/roadmap/current-effective-handoff-baseline.md`, `docs/decisions/current-production-payment-lifecycle.md`, and `docs/website/delivery-fee-pricing-approved.md` (supersedes all older historical OPEN/LOCKED conflicts).
- **Core Principles**:
  - Three independent purchasing/fulfilment modes: **Ready Stock**, **Made to Order (MTO)**, and **Quote Only**.
  - No mixed-mode checkouts or forced consolidated dispatch at launch.
  - Payment gates: >= 25% verified advance before MTO/Quote Only physical production start; 100% cumulative verified payment before dispatch.
  - Independent clocks: Quote Only 30-day offer clock and 7-day post-confirmation grace period are completely independent.
  - Transparent pricing (TAV-03): Tax-inclusive product price + single combined delivery fee. No hidden customer packing, fuel surcharge, or fragility fees at checkout.
  - Delivery fee schedule (2026-11-06): Owner-configured product-specific delivery fee from an approved 12-slab ladder (`0, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500` INR).
  - Multi-item single delivery charge: Highest applicable product delivery fee applies across multi-item orders; excess freight variance absorbed.
  - Bulk order governance: Standard checkout allows up to 10 units of any single product and up to 10 distinct lines. Exceeding either ceiling triggers a Bulk Order Enquiry workflow.
  - Universal enabled-PIN serviceability: Enabled PINs are presumed serviceable for standard catalogue items; 7-day grace period allows courier feasibility verification for MTO/bespoke pieces.
  - Hostinger small VPS target & PhonePe gateway (requires public review-ready website before merchant activation).

## Git & Project Repositories
- **Implementation Repository**: `https://github.com/vsd9992/websiteTavistra.git` connected as `origin` on branch `main`.
- **Concept & Documentation Master Source**: `https://github.com/vsd9992/Tavistra.git` (files preserved locally in `docs/` and `CONCEPT_README.md`; repo itself remains unattached to working git remote).

## Environment & Infrastructure Baseline
- **Local Development**: Windows host (`d:\_devProjects\Tavistra`).
- **Deployment / Remote Dev Target**: Debian Linux server (`vishnu@192.168.1.100`, hostname: `devMachine`) accessed via SSH using key `~/.ssh/krama_dev_server`.
- **Production Target (Future)**: Small Hostinger Linux VPS.

## Scope & Work Packages (H0–H7)
- **H0 Baseline & Environment Setup**: Repository setup, baseline verification, memory integration.
- **H1 Infrastructure & Dev Server**: Target environment configuration, runtime setup on Debian dev server.
- **H2 Public Review-Ready Site**: Phase 3 storefront shell, editorial catalogue, brand foundation, legal/policy copy (non-transacting public face for PhonePe review).
- **H3 Merchant Onboarding**: PhonePe KYC/review submission.
- **H4 Commerce Foundations**: Auth/RBAC, transactional DB schema, inventory ledger, internal shipping engine, notifications.
- **H5 Purchase Journeys**: Separated mode checkouts, payment gateway integration.
- **H6 Fulfilment & Operations**: Production status tracking, manual courier integration, order lifecycle.
- **H7 Final Release & Go-Live**: End-to-end reconciliation, security/audit checks, commercial launch.

## Success Criteria
- Strict conformance to the 2026-11-04 effective handoff baseline.
- Production readiness meeting TAV-01 through TAV-15 acceptance requirements.

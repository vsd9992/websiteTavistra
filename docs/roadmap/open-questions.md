# Open questions and phase boundaries

> **STATUS UPDATE (2026-11-04):** This is a historical backlog, not the active list of open concept decisions. Phases 1–4 are CLOSED. The latest [effective handoff baseline](current-effective-handoff-baseline.md) records resolved Quote Only, coupons at launch, mode separation, Hostinger and PhonePe directions and independent 30-day/7-day timing. Remaining items below generally concern development, actual product content, provider onboarding or launch configuration. No concept-level owner decision remains identified by the post-audit reconciliation.


**ACTIVE ROADMAP (2026-10-28):** [Master Website Blueprint and Delivery Roadmap](master-website-blueprint.md). Phase 1 sitemap/module inventory → Phase 2 functional architecture → Phase 3 page-level design → Phase 4 implementation planning. WEB-041/042 are supporting, parked until blueprint readiness. The historical lists below are context, not the current task queue.

## Current priorities
- Physical product design/prototype and first batch are under owner-led development; product concept evaluation paused.
- Website next: information architecture, mobile-first contemporary-gallery navigation, routes, product page, cart, guest/account flows, ready-stock/MTO/enquiry journeys, admin workflows; then data model and actual implementation stack.

## DEFERRED
- Domain and naming of staging/admin/API endpoints.
- Exact React framework and API language; database schema/ORM/auth/queue libraries.
- Linode vs Hostinger VPS, exact resources, deployment tooling, media hosting and SMTP relay.
- Razorpay vs PhonePe, gateway account/live testing, fee/settlement specifics.
- Specific couriers/aggregators and API integration.
- Pricing, GST/tax implementation details, refund policy, shipping rates, supported delivery regions, returns and legal copy.
- First SKUs, material-specific Group 1/2 allocation, BOM/costing, batches, product photography.
- Detailed visual palette, typography, design tokens, accessibility targets, homepage/navigation designs.
- Collection landing pages, personalisation scope, wishlists, dashboards/analytics enhancements.
- Compliance per SKU (particularly electrical, food contact, child safety/outdoor installation).
- Optional import/validation of previously prepared Tavistra catalogue spreadsheet, to ensure exact design-direction coverage.

## REJECTED/NOT BASELINE
- Traditional CMS (WordPress or hosted CMS dependency): owner prefers lean control, Markdown authoring, and bespoke admin; cost/limits/bloat concern.
- Browser-only CSR product content: avoid fragile discovery/indexing.
- One live markdown store for prices/orders/stock: transactions require durable authoritative state.
- Making courier API mandatory: multi-courier manual updates sufficient at start.
- PHPMailer as a forced dependency: not needed with native SMTP in chosen backend.
- Shared hosting with VDesign: explicitly ruled out.
- Pre-launch testing *alone* as reliability plan: outages and payment failures require operational recovery.
- Standalone microservices at initial scale: operational complexity disproportionate.
- Shopping experience reduced to static portfolio or generic marketplace layout: brand selected Editorial + Commerce / Contemporary Gallery.
- Journal page in initial launch: explicitly removed (can be reconsidered later).

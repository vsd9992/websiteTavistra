# Tavistra — Master Project Record

> **CURRENT PROJECT STATUS (2026-11-04):** Phases **1–4 are closed**. The 2026-11-04 owner-approved post-audit reconciliation is the effective handoff authority: [CURRENT effective cross-phase baseline](docs/roadmap/current-effective-handoff-baseline.md) and [current production/payment lifecycle](docs/decisions/current-production-payment-lifecycle.md). Older status and 'OPEN/DEFERRED' descriptions below are **historical**, not instructions to reopen resolved purchase/quote/payment/fulfilment decisions. Hostinger small VPS selected as hosting direction; PhonePe intended gateway pending integration approval; AI-assisted owner-supervised development. **No execution authorised in this discussion.**


Tavistra is a premium design-led lifestyle and décor sub-brand of **VDesign**. This private repository is the **master record** for product strategy, catalogue taxonomy, decisions, rejected alternatives, website planning, architecture, and future implementation.

**Current phase (updated 2026-10-28):** **Phase 1 — complete website blueprint**, beginning with the master sitemap and functional module inventory. Then functional architecture, page-level design, and only then technical implementation planning. Physical product concepts/batches continue separately.  
**Baseline date:** 2026-10-22.  
**Status discipline:** LOCKED = explicitly accepted; PROPOSED = recommendation only; DEFERRED = decide later; REJECTED = do not pursue without re-opening decision; CONDITIONAL = subject to feasibility/compliance.

**ACTIVE NORTH STAR:** [Master Website Blueprint and Delivery Roadmap](docs/roadmap/master-website-blueprint.md). Read this **before** continuing website planning; WEB-041 and WEB-042 are supporting/parked technical references, not the active work queue. Avoid deep implementation micro-decisions until full website coverage is mapped.

## Start here
- [Decision register](docs/decisions/decision-register.md): Accepted, rejected, conditional and deferred choices, including rationale.
- [Brand and operating boundaries](docs/brand/brand-foundation.md).
- [Catalogue taxonomy](docs/catalogue/taxonomy.md): 6 categories, 19 subcategories, 43 primary product types.
- [Approved product directions](docs/catalogue/product-directions.md): the concept directions preserved from planning.
- [Manufacturing strategy](docs/product-development/manufacturing-groups.md).
- [Website requirements](docs/website/requirements.md).
- [Architecture and publishing](docs/website/architecture.md).
- [Security, operations and rollout](docs/website/reliability-and-release.md).
- [Open decisions / next work](docs/roadmap/open-questions.md).
- [Documentation rules](docs/governance/documentation-policy.md).

## Record-keeping rules
1. Do not silently rewrite historical decisions. Record superseding decisions with date and rationale.
2. Keep **approved facts**, **recommendations**, **open questions**, and **rejected ideas** visibly distinct.
3. Source-code implementation truth, once code exists, is in source/config/schema/tests. Documents describe intent and decisions, not unverifiable claims about implemented behavior.
4. One product/SKU has a canonical product record, with intentional cross-listing as needed.
5. No actual product SKUs, prices, infrastructure vendors, payment provider, or framework choices are production-approved merely by appearing in these plans.
6. Never commit credentials, customer data, payment secrets, or live operational logs.

This record is a structured synthesis of planning discussions, not a verbatim conversation transcript. Where a prior spreadsheet captured more granular catalogue data, it remains a reference artifact until imported and verified against the canonical docs.

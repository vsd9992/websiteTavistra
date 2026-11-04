# Phase 3 — UX coverage and genuine design gaps

**Date:** 2026-11-04  
**Status:** Gap audit completed; Phase 3 page-family specification ACTIVE. Not a new approval of existing choices.

## Source and interpretation
Cross-checked approved Phase 1 [unified sitemap](unified-website-sitemap.md), [admin module inventory](admin-module-coverage.md), [website experience requirements](../website/requirements.md) and latest owner-approved [decision register](../decisions/decision-register.md). Older 'OPEN' or 'PROPOSED' markers must be read against later locked decisions (including separate checkouts, Quote Only, and no launch coupon entry). This is a **targeted design-coverage audit**, not a line-by-line technical conformance certification.

## Already decided: do not ask again
- **Visual system:** Hybrid Editorial + Commerce (WEB-001), Contemporary/Adaptive Gallery (WEB-002/021), Warm Mineral palette with exact approved tokens (WEB-024/026), WCAG target (WEB-025), Instrument Serif + Manrope and approved type baseline (WEB-027/028/029), Balanced Gallery and curated editorial masonry plus functional commerce grids (WEB-030/031).
- **Navigation/discovery:** adaptive sticky header (WEB-033), desktop six-category curated Shop mega-menu (WEB-035), mobile progressive drill-down (WEB-036), compact search overlay (WEB-037), restrained live suggestions (WEB-039), launch search filters Category and Purchase Mode (WEB-040A), approved sort options and priced-first handling (WEB-040B/C), approved variable-price/tax/delivery disclosures where later locked.
- **Scope and flows:** Phase 1 public/customer/admin page families; no Journal; guest checkout and optional accounts; Ready Stock and Made to Order separate launch checkouts; Quote Only staff quote and acceptance; coupon code entry deferred; secure tracking and support; staff-led exception handling. These are not fresh UX decisions.
- **Not a design blocker:** exact numeric grid tokens WEB-032, component spacing, animation timings, copy for rare states, menu pixel measurements and other implementation-level specifications.

## Coverage matrix and remaining Phase 3 work

| Page family / journey | Existing design/functional coverage | Phase 3 output still needed | Material owner decision? |
|---|---|---|---|
| Global visual language, header, search, navigation | **LOCKED** core visual/navigation patterns | Apply consistently; concise footer and accessibility conventions | No |
| Home and brand storytelling | **PARTIAL** page purpose, editorial direction and content destinations | Homepage section hierarchy, editorial-to-shop transitions, mobile priority | Only if major competing home experience models emerge |
| Shop, six category pages, subcategories, collections | **PARTIAL** taxonomy, grid, discovery/filter principles | Reusable listing and category/collection page briefs, merchandising slots and empty-state intent | No initially |
| Search/results | **SUBSTANTIALLY LOCKED** search entry, suggestions, filters, sorting | Results page composition and links to product pages | No |
| Product detail, purchase modes | **PARTIAL** price, stock, delivery, purchase-mode and enquiry rules | Content hierarchy, image/specification/care modules, mode-specific primary action and mobile presentation | Possibly, only if a major action hierarchy conflict emerges |
| Cart, separate checkouts, payment result | **FUNCTIONALLY LOCKED**, page design not complete | Separate mode-aware cart/review and checkout briefs; payment recovery and clear customer commitments | No initially |
| Quote Only enquiry/quotation | **FUNCTIONALLY LOCKED** staff-led quotation, expiry and advance | Customer-facing enquiry, quote review/acceptance and payment communication layout | No initially |
| Guest, account, tracking, order history | **FUNCTIONALLY LOCKED**, interface not complete | Consistent account/guest access and tracking page-family briefs; verified linking and status visibility | No initially |
| Contact, FAQ, care, legal and support | **SCOPE LOCKED** | Content grouping, help entry points and support request/follow-up page briefs | No |
| Staff administration | **MODULE/PERMISSION COVERAGE LOCKED** | Simple shared admin shell, worklists, detail screens, staff quote/production/dispatch/support patterns; avoid case-engine proliferation | Only for a significant staff workflow tradeoff |
| Cross-device behaviour | **PARTIAL** mobile navigation and accessibility targets | Responsive principles for editorial blocks, grids, PDP, forms, tracking and staff worklists | No initially |

## Actual finding
**No missing major website page family or brand-direction decision was identified in this targeted audit.** The principal Phase 3 gap is **page-level experience specification**, not a new concept vote. Some earlier technical proposals remain unapproved, but those are not reasons to reopen the approved design strategy.

## Next Phase 3 delivery
Draft one concise, consolidated **customer-facing page-family UX specification**, covering purpose, content order, primary actions, navigation transitions and responsive patterns for Home → Shop/Collection → Product → mode-specific Cart/Checkout → Confirmation/Tracking/Support. Reuse locked visual, search, pricing, delivery and purchase-mode decisions. Then draft a similarly compact staff admin UX specification. Escalate only genuine material customer/staff experience tradeoffs, and request owner Phase 3 sign-off once these deliverables are reviewed. Phase 4 remains on hold and no website code is being developed here.

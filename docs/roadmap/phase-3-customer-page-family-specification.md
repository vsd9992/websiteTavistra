# Tavistra — Phase 3 customer-facing page-family UX specification

> **OWNER SIGN-OFF (2026-11-04):** Phase 3 page-family concept accepted and CLOSED in both canonical documents. Historical 'Draft' wording below describes the original working status, not present approval status. Read [current cross-phase baseline](current-effective-handoff-baseline.md) for independent Ready Stock, Made to Order and Quote Only fulfilment/payment, >=25%-before-production / 100%-before-dispatch for the latter two, and separate original 30-day quote and confirmed-order seven-day clocks. Exact cart interaction belongs to development within separate purchase-mode checkouts.


**Date:** 2026-11-04  
**Status:** Draft for Phase 3 consolidated design review, not a new owner-approved policy.  
**Scope:** Experience hierarchy and responsive behaviour, not visual mockups, pixel dimensions, code, technical schemas or individual UI microstates.

## Authoritative design constraints
Apply the already-locked Hybrid Editorial + Commerce / Adaptive Gallery system: Warm Mineral palette, approved typography, Balanced Gallery editorial masonry with functional commerce grids, adaptive sticky header, desktop curated six-category Shop mega-menu, progressive mobile Shop drawer, compact search overlay with restrained suggestions. Accessibility target and mobile usability apply throughout. Preserve the latest approved purchase, price, delivery, return, cancellation, account, privacy and statutory rules. Do not reinterpret old OPEN references as live approvals.

## Global page shell and movement
- Shared public header: Tavistra identity, Shop and Collections discovery, brand/about access, search, account access and mode-aware shopping access. Adaptive compact state while scrolling; avoid covering primary content.
- Shared footer: brand connection, contact/help, care, shipping, returns, privacy/terms and other required legal links. Avoid duplicating the entire Shop mega-menu.
- Editorial surfaces may use dark immersive sections; transaction-heavy surfaces stay legible and primarily light. Imagery is purposeful, not an obstacle to finding product price, eligibility, delivery or the primary action.
- Responsive rule: editorial mosaics simplify into readable ordered stacks on small screens; functional grids reduce columns; product and checkout actions stay easy to reach; no hover-only path to essential navigation.
- Page-to-page continuity: editorial discovery → category/collection/listing → product → appropriate mode-specific cart/quote → payment or quote acceptance → order detail/tracking → support.

## 1. Home
**Purpose:** Introduce Tavistra's design-led identity and lead visitors quickly to real purchasable objects.  
**Suggested information hierarchy:** curated visual hero and concise brand proposition → featured collections/categories → selectively highlighted products/design stories → craftsmanship/materials proof → Shop and support/footer. No compulsory carousel or auto-playing content.  
**Primary actions:** Explore Shop, open a curated collection, open a featured product; secondary Our Story.  
**Mobile:** prioritize one clear hero message/action, maintain sensible editorial reading order, and show shopping entry early rather than forcing a long gallery scroll.  
**Content ownership:** staff-curated sections and approved media, without a new general-purpose CMS.

## 2. Shop / category / subcategory / collection
**Purpose:** Enable predictable product discovery, with editorial context where useful.  
**Hierarchy:** clear title and short category/collection context → available product grid → relevant filters/sort and result count → navigation to related subcategories/collections. Category destinations use the approved taxonomy; collections are curated, not extra top-level categories.  
**Primary actions:** open product, navigate category, apply available filters/sort, return to Shop. Use existing approved search filters/sort; do not silently introduce launch facets not approved.  
**Mobile:** straightforward listing cards, accessible filter/sort controls, no essential content dependent on masonry. Editorial feature mosaics may precede functional grids, not replace them.

## 3. Search results
**Purpose:** Convert search intent into product discovery.  
**Hierarchy:** query and result count → approved Category/Purchase Mode filters and sorting → functional product grid; distinguish no matching products from an unavailable search.  
**Primary actions:** open product, refine query, remove filters. Respect approved priced-first treatment of unpriced/Quote Only items and variable-price disclosures.  
**Mobile:** retain clear search entry and compact, operable filter/sort controls.

## 4. Product detail
**Purpose:** Present design and material credibility while making availability, purchase mode and customer commitments unambiguous.  
**Hierarchy:** primary imagery → product title, purchase-mode/availability, tax-inclusive product price or honest Quote Only pricing treatment → variant/specification selection where applicable → delivery serviceability/estimate as approved → primary purchase or enquiry action → dimensions/materials/care/story and relevant shipping/returns policy → related discovery.  
**Primary actions:** Ready Stock: add to its own cart; Made to Order: start its own eligible purchase journey; Quote Only: submit enquiry/seek staff quote. Do not show a false immediate-purchase action for Quote Only.  
**Mobile:** strong image presentation with the commercial essentials and action reachable without excessive editorial scrolling. Never obscure material delivery/return restrictions.

## 5. Cart and mode-specific checkout
**Purpose:** Let customers review and commit to the correct purchase terms without mixing incompatible modes.  
**Hierarchy:** clearly identified Ready Stock or Made to Order order review → items and options → contact/guest-or-account path → delivery/address and any approved manual-delivery exception path → two customer-facing price components → payment and confirmation of relevant terms.  
**Primary actions:** update/remove items as eligible, continue to checkout, recover from pending/failed payments, return to shopping. Mixed-mode selections must direct the customer to **separate** Ready Stock and Made to Order checkouts; Quote Only never enters these checkouts. No customer-entered coupon field at launch.  
**Mobile:** compact progressive sections, clear order summary and primary continuation action; no account creation requirement.

## 6. Quote Only enquiry and quotation review
**Purpose:** Support a staff-led conversation and a bounded customer decision.  
**Hierarchy:** product/customization enquiry → staff contact/clarification → quotation version, full commercial terms, initial 30-day expiry and payment instructions → customer acceptance or rejection/expiry → verified 25% advance and linked confirmed order where applicable.  
**Primary actions:** submit enquiry, communicate with staff through approved channels, accept/reject exact quotation version and pay through quote payment link when applicable. No indefinite quote extension by revision; preserve refund rules for unagreed/expired quote advances.  
**Mobile:** readable quote and terms, visible expiry, unambiguous next action; staff can manually resolve clarification and exceptions.

## 7. Payment outcome, confirmation and order tracking
**Purpose:** Explain what is verified, what happens next and how to get help.  
**Hierarchy:** authoritative payment/order status, purchase-mode commitments and order reference → items, two-component price presentation, delivery/production progress → tracking/courier information when available → support and permitted order-linked requests.  
**Primary actions:** resume/retry safely where appropriate, open secure order detail, contact support, initiate eligible cancellation/change/return requests. Never claim success merely from a redirect.  
**Mobile:** status and next action first, timelines compact and readable.

## 8. Guest access and customer account
**Purpose:** Offer optional account convenience without making checkout dependent on registration.  
**Hierarchy:** sign-in/register and verified email → profile/addresses → current and historical eligible orders → tracking/support requests → staff-verified historical guest-order linking where approved.  
**Primary actions:** securely access guest order, manage profile, request linking with evidence, see linking status, contact support. Never reveal orders by matching email alone; account email changes follow locked verification rules.  
**Mobile:** simple account navigation and privacy-safe order summaries.

## 9. Contact, help, policies and editorial
**Purpose:** Build trust, explain the brand and make service straightforward.  
**Hierarchy:** Our Story and craftsmanship/materials pages tell authentic product/brand stories with relevant Shop links; help/FAQ, care, shipping, returns, privacy/terms pages present scannable, authoritative information. Contact/support provides a clear route to human assistance and order-linked cases.  
**Primary actions:** explore relevant product, find policy, submit/follow up on a support request.  
**Mobile:** readable typography, clear section navigation and accessible forms.

## Design handoff and unresolved scope
This specification is a **draft synthesis** of existing decisions with recommended page hierarchies, not a claim that wireframes or visual comps have been approved. No genuinely new material owner design tradeoff has been identified by this pass. Confirm page-family coherence against the complete latest decision register and actual content before Phase 3 sign-off. Next draft: consolidated **staff administration UX patterns** (shared shell, worklists, record details, approvals, audit and exception handling). Phase 4 remains on hold.

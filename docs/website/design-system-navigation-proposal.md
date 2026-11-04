# Tavistra storefront — responsive navigation design v1

**Date:** 2026-10-23. **Status:** Adaptive Sticky Header **LOCKED** (WEB-033); desktop Shop Curated Mega-Menu **LOCKED** (WEB-035). Mobile hierarchy and remaining interaction details **PROPOSED** (WEB-034/036). Context: Adaptive Gallery, Warm Mineral palette, Selective Editorial Serif, Balanced Gallery + Curated Masonry/Functional Grid.

## Locked decision: Adaptive Sticky Header
- The header begins in a fuller state and transitions to a compact sticky state as the user scrolls.
- Keep critical shopping access available, especially search and cart.
- The transition must be stable, accessible, and avoid distracting jitter or large layout shifts.
- Support reduced-motion preferences and keyboard use.
- This locks the **behavioural direction**, not precise height, trigger, transparency or link visibility.

## Proposed desktop information architecture
- Wordmark on left (visual wordmark remains separate brand decision).
- Primary navigation: Shop, Collections, Our Story; consider Contact in footer/help rather than crowded top navigation.
- Right utility area: search, account, cart with count when nonzero.
- **LOCKED (WEB-035):** Shop opens a **Curated Mega-Menu** containing the six approved category links plus exactly one curated featured visual (image + meaningful destination). Keep the presentation restrained, not a giant multi-level taxonomy wall.
- Collections should reflect curated themes rather than duplicate product taxonomy.
- Search should be reachable via an obvious control; product/category/collection result grouping and empty/error states to be specified.
- Product category names/contents must be driven by current approved catalogue taxonomy, not invented in UI mockups.

## Proposed mobile information architecture
- Compact row: menu, centered brand, search, cart.
- Full-height or near-full-height accessible navigation drawer with Shop, Collections, Our Story, Contact/Help, Account.
- Shop expands into category/subcategory navigation; allow back navigation and clear current level.
- Drawer closes on Escape, provides visible close control, traps focus only while modal, restores focus to opener, prevents inaccessible background interaction and respects reduced motion.
- All touch controls aim for at least 44x44 CSS px comfortable target while WCAG minimums are independently checked.
- Cart icon opens cart page or mini-cart only after separate interaction decision; checkout remains direct and predictable.

## Proposed sticky states
1. Initial: full header with clear wordmark and navigation.
2. Scrolled: compact solid Warm Mineral surface; preserve search and cart; no jump in document layout.
3. Editorial hero: optional transparent/overlay initial treatment only where contrast and photo content are controlled; on scroll return to opaque surface.
4. Search/drawer open: header stays stable and does not collapse under an overlay.
5. Keyboard navigation or focus within header: avoid scroll-triggered focus loss.

## Accessibility and performance requirements (proposal)
- WCAG 2.2 AA baseline; visible keyboard focus and readable text against each header surface.
- Semantic navigation landmarks, clear accessible names, `aria-expanded` for expandable menus, `aria-current` for current page.
- Do not rely on hover alone; support pointer, touch and keyboard.
- Ensure menu panels are not clipped by scroll containers or sticky stacking contexts.
- Avoid excessive scroll listeners: use efficient scroll state updates or CSS-based approaches as appropriate, and test mobile performance.
- Announce search results/changes accessibly; avoid an obstructive or flashing autocomplete.
- Preserve browser back behaviour and deep links for shop categories, filters and searches.

## Decisions to make one at a time
1. **DECIDED (WEB-035):** Curated Mega-Menu, with approved category list and one featured visual. Interaction details (click/hover, focus/close behavior, dimensions) remain subject to accessibility review.
2. Mobile menu hierarchy and whether to show category previews.
3. Search experience: expandable search field vs full-screen search overlay; autocomplete policy.
4. Cart: direct cart navigation vs mini-cart drawer.
5. Exact responsive header dimensions, breakpoints, scroll trigger and editorial overlay behaviour.
6. Accessibility validation and device testing.

**Note:** Numerical layout spacing tokens in `design-system-layout-proposal.md` remain PROPOSED (WEB-032) and are not silently approved by this header decision.

## 2026-10-23 — Desktop Shop mega-menu approved

**LOCKED (WEB-035):** A curated desktop Shop mega-menu, with a list of the six catalogue categories and exactly one featured editorial visual/link. The visual is a merchandising slot, not an extra category or a mandatory product image. A prominent Shop All entry should remain discoverable (exact placement proposed). Categories come from `docs/catalogue/taxonomy.md`:
1. Personal Accessories
2. Home Décor & Objects
3. Desk & Workspace
4. Lighting & Ambience
5. Outdoor & Balcony
6. Art & Collectibles

**Implementation guardrails (proposed, not separately locked):**
- Use a genuine button or clearly operable navigation trigger; opening must work with click/touch/keyboard, never hover-only. Support Escape, visible focus, logical tab order, and sensible dismissal when focus leaves.
- The featured visual must be editorially curated, have meaningful alternative text where informative, and must not conceal the category list or cause menu layout shift.
- No deep nesting inside the desktop mega-menu by default; categories lead to their landing pages, where subcategories can be browsed.
- If the mega-menu is open, sticky-header compaction must not cause lost focus or accidental closing.
- Menu dimensions, hover enhancement, animation, image aspect ratio, trigger semantics, and overlay treatment require component tests.

### Next: mobile navigation hierarchy (WEB-036, OPEN)
Three candidates for review:
- **A: Progressive drill-down drawer (recommended)**. Main menu shows Shop, Collections, Our Story, Help/Contact and Account; Shop opens a second view with Shop All and six categories; categories link to pages (subcategories on page). One clear back action. Avoid unnecessary depth.
- **B: Inline accordion drawer**. Shop expands six category links in the same scrollable drawer; other primary links remain below. Fewer view transitions but can create a long menu.
- **C: Category-first drawer**. All six categories are visible immediately on first opening; secondary navigation follows. Fast for frequent shoppers but more crowded.

**Not decided:** mobile drawer pattern, whether category submenus appear within the drawer, search UX, cart UX, exact header dimensions and responsive thresholds. Numeric layout tokens remain PROPOSED (WEB-032).

## 2026-10-23 — Mobile progressive drill-down approved (WEB-036)

**LOCKED:** The mobile navigation uses a progressive two-level drawer. The first level contains Shop, Collections, Our Story, Help/Contact and Account (exact labels/order may be refined); entering Shop shows a second level containing Shop All and the six approved categories from `docs/catalogue/taxonomy.md`. A clearly labeled Back action returns to the main menu. Category selection navigates to its category page; subcategories are browsed on the page, **not in a third drawer level**. The exact drawer dimensions, animation, mobile header arrangement and label order remain implementation proposals.

### Accessibility and interaction baseline for implementation
- Open from a real menu button with a clear accessible name. Reflect state with `aria-expanded` and `aria-controls` as appropriate.
- Drawer has an accessible name (e.g. "Site menu"), visible Close control and predictable Escape dismissal. If implemented as a modal, manage focus within it, make background inert, and restore focus to the opener on close.
- On opening, move focus to the drawer heading or first meaningful control. On Shop drill-down, announce the changed view/heading and place focus on the Back control or Shop heading. Back restores a sensible focus target.
- Keep DOM, reading and keyboard order aligned with visual order. Do not merely translate an offscreen interactive panel while leaving its controls focusable.
- Prevent background scrolling while modal, but keep drawer content independently scrollable on short screens and at 200% zoom. Account for safe-area insets.
- Buttons and links must be distinguishable: Shop drills into categories; category names navigate. A separate Shop All link navigates to the full listing.
- Minimum comfortable target goal 44x44 CSS px; visible keyboard focus, WCAG 2.2 AA target, reduced-motion alternative, and no hover-only actions.
- Maintain navigation state predictably on rotation/resizing and avoid conflicts with the adaptive sticky header; when drawer is open, suspend disruptive header transitions.
- Avoid unnecessary images in mobile menu. Product/category data and routes must derive from approved taxonomy, not hard-coded fake inventory.

**Implementation test gate:** keyboard-only, touch, screen-reader labels and state changes, Escape/back/close focus restoration, browser back, 320px viewport, 200% zoom, landscape and slow devices. The interaction requirements above are approved as a design baseline, but technical compliance must be tested.

### Next decision: Search experience (WEB-037, OPEN)
- **A: Compact search overlay (recommended):** same search icon on desktop/mobile opens a focused, accessible search panel, responsive as a dialog or full-height mobile sheet. Search field auto-focus when appropriate; optional restrained suggestions; results lead to dedicated searchable/filterable listing. Overlay is dismissed with Escape/Close and focus returns to trigger.
- **B: Expandable inline desktop search + full-screen mobile search:** desktop header expands to a field, mobile opens full-screen. Fewer desktop overlay layers, but the expanding header must avoid layout shifts and collisions with navigation.
- **C: Dedicated search page:** icon routes directly to a search page. Simplest semantics, fewer instant suggestions, extra navigation for quick lookup.

**Not yet approved:** which search interaction, suggestions/autocomplete behaviour, ranking, no-results design, recent searches, exact search trigger/overlay dimensions. **Cart behaviour remains deferred** and is not part of WEB-037 approval. Header sizing and layout tokens remain separately proposed.

## 2026-10-23 — Search overlay approved (WEB-037)
- **LOCKED:** Compact Search Overlay, opened from desktop/mobile header search control; compact desktop dialog/panel, mobile-adapted larger sheet; submit to dedicated search results page. Does not replace the adaptive sticky header or dictate cart interaction.
- **PROPOSED (WEB-039):** empty-state discovery, live suggestions vs no suggestions, ranking, result states, filters and keyboard semantics. See `docs/website/design-system-search-proposal.md`.
- **DEFERRED (WEB-038):** cart interaction; no approval implied.
- The prior section describing WEB-037 as OPEN is historical and superseded by this approval.

## 2026-10-24 — Search suggestion decision
- **LOCKED (WEB-039):** Restrained Live Suggestions inside the Compact Search Overlay: short grouped category/type and published-product shortcuts while typing; Enter leads to full results page. Avoid image-heavy previews and invented availability/popularity.
- **PROPOSED (WEB-040):** Search results page, filtering, sorting/ranking and empty/error handling in `docs/website/design-system-search-proposal.md`. Filter scope is next independent decision.
- **DEFERRED (WEB-038):** cart interaction remains outside search work.

## 2026-10-24 — Minimal search filters approved
- **LOCKED (WEB-040A):** Search results launch filters are **Category + Purchase Mode** only. Product Type, Price, Material and Collection filters are not included at launch without later approval.
- **PROPOSED (WEB-040):** Sorting policy, relevance ranking and result-state details; see `docs/website/design-system-search-proposal.md`.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-24 — Search sorting policy approved
- **LOCKED (WEB-040B):** Relevance (default), Newest First, Price Low-to-High and Price High-to-Low.
- **OPEN (WEB-040C):** handling of quote-only/unpriced and variable-price products within price sorts.
- **PROPOSED (WEB-040):** relevance weighting and results-state specifications in `docs/website/design-system-search-proposal.md`.
- **DEFERRED (WEB-038):** cart interaction.

## 2026-10-24 — Price sort grouping approved
- **LOCKED (WEB-040C):** priced products sort first in the selected ascending/descending direction; unpriced and quote-only products remain visible afterward in a clearly identified group. Missing price never equals zero. Sort globally before pagination.
- **OPEN (WEB-040D):** variable-price product sort basis (starting-at, default variant, or unpriced grouping); see `docs/website/design-system-search-proposal.md`.
- **PROPOSED (WEB-040):** relevance weighting and result-state details remain subject to review.
- **DEFERRED (WEB-038):** cart interaction.

## 2026-10-24 — Variable-price starting-at rule approved
- **LOCKED (WEB-040D):** use the lowest currently purchasable published variant's comparable price for price sorts and show **From ₹X** for genuinely variable-priced products. Exclude draft, unavailable and quote-only variants from an artificial entry price.
- **PROPOSED (WEB-040E):** tax-inclusive vs tax-exclusive price display, promotions, ranges and disclosure rules; see `docs/website/design-system-search-proposal.md`.
- **PROPOSED (WEB-040):** refined price/result states and relevance rules remain open.
- **DEFERRED (WEB-038):** cart interaction remains separate.

## 2026-10-24 — Tax-inclusive product pricing approved
- **LOCKED (WEB-040E):** India-facing storefront product prices, including valid starting-at prices, include applicable product taxes; price sorting uses the same customer-facing basis. Checkout/invoices provide appropriate tax breakdowns subject to accounting and GST validation.
- **OPEN (WEB-040F):** delivery-charge disclosure timing and estimation, without presupposing a cart interaction design.
- **PROPOSED (WEB-040):** price/error/empty states and detailed price display remain subject to review in `docs/website/design-system-search-proposal.md`.
- **DEFERRED (WEB-038):** cart interaction remains separate.

## 2026-10-24 — Early delivery estimate and final checkout charge approved
- **LOCKED (WEB-040F):** disclose delivery separately when destination is unknown; show grounded early estimates where supported and verify the final charge and payable total before order confirmation. No invented free delivery, unsupported rates or delivery guarantees.
- **OPEN (WEB-040G):** optional product-detail pincode entry vs known destination only vs sitewide destination selector. No automatic precise-location inference or UI approval implied.
- **PROPOSED (WEB-040):** search and delivery failure states and detailed microcopy; see `docs/website/design-system-search-proposal.md`.
- **DEFERRED (WEB-038):** cart interaction.

## 2026-10-28 — Optional PDP pincode approved
- **LOCKED (WEB-040G):** optional pincode entry on product detail pages for early delivery estimates; never require it for browsing, and verify the final delivery charge at checkout. No device geolocation or sitewide location state implied.
- **OPEN (WEB-040H):** whether estimation requires a Check button, automatically runs after valid input or uses a hybrid; see `docs/website/design-system-search-proposal.md`.
- **PROPOSED (WEB-040):** serviceability and estimate failure states; search remains independent of delivery API health.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 — Explicit Check trigger approved
- **LOCKED (WEB-040H):** an explicit Check button (and form submission via Enter) initiates the optional product-page pincode estimate. No automatic lookup on typing, blur or page load.
- **OPEN (WEB-040I):** single backend serviceability-and-rate request vs frontend two-stage lookup vs manual-review-first.
- **PROPOSED (WEB-040):** input validation, rate statuses and delivery/search feedback in `docs/website/design-system-search-proposal.md`.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 — Single backend estimate request approved
- **LOCKED (WEB-040I):** product-page Check sends one request to Tavistra backend, which owns serviceability and rate coordination and returns a structured outcome. The storefront does not make separate sequential courier calls.
- **OPEN (WEB-040J):** automatic eligible-provider fallback vs primary-only vs manual fallback; no provider or rate-selection policy approved.
- **PROPOSED (WEB-040):** structured response statuses, provider failures, quote reliability and feedback states in `docs/website/design-system-search-proposal.md`.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 — Shipping architecture correction (supersedes WEB-040J provider proposals)
- **LOCKED:** delivery estimates use Tavistra-administered internal shipping rate rules, not courier APIs. The courier is chosen independently during fulfilment from multiple options.
- **LOCKED (WEB-040I clarified):** one storefront-to-Tavistra backend request computes from internal tables/rules; no live provider lookup.
- **WITHDRAWN (WEB-040J):** courier provider fallback options are not applicable.
- **OPEN (WEB-040K):** zone matrix vs maintained distance bands vs hybrid destination-rate basis.
- **DEFERRED (WEB-038):** cart interaction unchanged. Details in `docs/website/design-system-search-proposal.md`.

## 2026-10-28 — Pincode/range presumptive kilometres approved
- **LOCKED (WEB-040K):** admin assigns presumptive pricing kilometres to exact pincodes or inclusive pincode ranges; no mapping/geocoding/courier APIs. These are pricing references, not verified route distances.
- **OPEN (WEB-040L):** distance-band vs per-km vs hybrid charge formula; detailed mapping precedence remains proposed.
- **DEFERRED (WEB-038):** cart interaction unchanged. See `docs/website/design-system-search-proposal.md`.

## 2026-10-28 — Distance-band delivery pricing approved
- **LOCKED (WEB-040L):** internally assigned presumptive kilometres select an admin-maintained distance band with a base charge. Exact band limits and rates remain open; no continuous per-km or hybrid pricing approved.
- **PROPOSED:** weight, packed dimensions, fragility and minimum-charge calculation refinements in `docs/website/design-system-search-proposal.md`.
- **OPEN (WEB-040M):** actual vs volumetric vs product-class chargeable-weight basis.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 — Two-component customer pricing clarified
- **LOCKED (WEB-040N):** display only tax-inclusive all-in product price (packaging/handling included) plus one delivery charge if applicable; no separate packaging, chargeable-weight, fragility or handling fees.
- **OPEN (WEB-040O):** whether internal delivery pricing uses only distance bands or incorporates shipment factors/manual exceptions. Do not infer internal factors are forbidden merely because they are not itemized.
- **DEFERRED (WEB-038):** cart interaction unchanged. See `docs/website/design-system-search-proposal.md`.

## 2026-10-28 — Distance bands with internal shipment adjustments approved
- **LOCKED (WEB-040O):** distance-band base charge plus internal transport-related adjustments for applicable packed weight, dimensions and fragility, resulting in one customer-facing delivery charge. Packaging/ordinary product handling remain in the all-inclusive product price; no separate customer-facing fee lines or double charging.
- **OPEN (WEB-040P):** fixed/bracketed adjustments vs percentage multipliers vs full band × shipment-class rate matrix.
- **PROPOSED:** thresholds, minimum-charge floor, missing-data states and rule precedence in `docs/website/design-system-search-proposal.md`.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 — Fixed / bracketed shipment adjustments approved
- **LOCKED (WEB-040P):** fixed-amount, bracketed internal transport adjustments applied to the distance-band base for applicable weight, packed dimensions and fragility. Percentage multipliers and full band × shipment-class matrix are not the approved default.
- **LOCKED (WEB-040N):** only all-inclusive product price plus one combined delivery charge if applicable; never itemize internal surcharges or double charge packaging/ordinary handling.
- **PROPOSED:** weight brackets, oversize thresholds, fragility classes, minimum floor, exceptions and calculation precedence in `docs/website/design-system-search-proposal.md`.
- **OPEN (WEB-040M):** internal chargeable-weight basis; numerical rates and thresholds unapproved.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 — Chargeable-weight basis approved
- **LOCKED (WEB-040M):** calculate packed actual and packed-dimension volumetric weight using an admin-configurable divisor, then use the greater value for the internal fixed/bracketed transport adjustment. No numeric divisor or weight tariffs approved.
- **OPEN (WEB-040Q):** one matching fixed bracket vs cumulative thresholds vs shipment-class schedules; packed-size/fragility/minimum/exception details remain proposed.
- **LOCKED (WEB-040N):** all-inclusive product price plus one combined delivery charge if applicable, without weight/packaging fee itemization or double recovery.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 — Single fixed weight bracket approved
- **LOCKED (WEB-040Q):** one matching chargeable-weight range supplies one fixed internal transport adjustment, not cumulative threshold increments or mandatory class-specific bracket tables.
- **OPEN (WEB-040R):** how weight thresholds are configured (admin-defined ranges vs predefined bands vs manual-review ceiling). Exact thresholds and ₹ amounts remain open.
- **PROPOSED:** distinct oversized transport thresholds, fragile classes, minimum delivery floor, exceptions and auditability in `docs/website/design-system-search-proposal.md`.
- **LOCKED (WEB-040N):** all-inclusive product price plus one delivery charge if applicable, without separate weight/packaging/fragility fees.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 — Predefined weight brackets approved
- **LOCKED (WEB-040R):** weight bracket boundaries are predefined by the application; Tavistra admin edits the **fixed rupee adjustment** for each bracket, not the kg boundaries. Actual number/boundaries/rates remain OPEN.
- **OPEN (WEB-040S):** dimensional transport adjustment policy: longest-side threshold vs longer-dimensional/girth rules vs manual-review for exceptional sizes.
- **PROPOSED:** boundary precision, schedule versioning, missing rate handling, dimensional thresholds, fragility, minimum floor and exceptions in `docs/website/design-system-search-proposal.md`.
- **LOCKED (WEB-040N):** all-inclusive product price plus one combined delivery charge if applicable; no separately itemized internal adjustments.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 — Longest packed side adjustment approved
- **LOCKED (WEB-040S):** `max(packed L, W, H)` exceeding a configured longest-side threshold triggers a fixed internal dimensional **transport** adjustment. Threshold and ₹ amount remain OPEN; no duplicate charge for volumetric weight.
- **OPEN (WEB-040T):** fragility adjustment policy: three transport classes vs binary flag vs manual-review-only.
- **PROPOSED:** missing-dimension/manual-review cases, minimum delivery floor, exceptions and auditability in `docs/website/design-system-search-proposal.md`.
- **LOCKED (WEB-040N):** all-inclusive product price plus one combined delivery charge if applicable; no separately itemized internal adjustments.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 — Fragility included in product price
- **LOCKED (WEB-040T):** all Tavistra products are treated as fragile; ordinary protective packaging and fragile handling costs are already included in all-inclusive product price. No automatic fragility adjustment or routine fragile handling classes in delivery calculation.
- Exceptional distinct transport restrictions may follow WEB-040S or future explicitly approved manual-review policy, not an assumed fragile surcharge.
- **OPEN (WEB-040U):** global minimum delivery floor vs distance-band-specific floor vs no minimum; rates, waivers and tax sequence still open.
- **LOCKED (WEB-040N):** all-inclusive product price plus one combined delivery charge if applicable, never separate packing/fragility/weight line items.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 — Distance-band minimums approved
- **LOCKED (WEB-040U):** each distance band has its own admin-configurable ₹ minimum delivery charge. For ordinary eligible calculations, floor is `max(base + fixed weight adjustment + applicable distinct longest-side adjustment, matching band minimum)`. No global floor; amounts remain OPEN.
- **OPEN (WEB-040V):** whether explicit free-delivery waivers override the floor, never override it, or are band-specific; waiver eligibility and tax sequence unapproved.
- **PROPOSED:** distinguish missing rates, manual review, explicit unsupported destinations and errors in `docs/website/design-system-search-proposal.md`; no silent ₹0.
- **LOCKED (WEB-040N):** all-inclusive product price plus one combined delivery charge if applicable. All products fragile by default with standard handling in product price, no fragility surcharge.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 — Waivers and coupons approved
- **LOCKED (WEB-040V):** valid explicit free-delivery waivers override distance-band minimums; missing delivery rates are never free delivery.
- **LOCKED (WEB-040W):** free-delivery coupons and product-discount coupons supported. Exact coupon rules and stacking remain OPEN.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable; no extra fee components.
- **OPEN (WEB-040X):** missing-rate handling and manual-review pathway.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 — Missing-rate response approved
- **LOCKED (WEB-040X):** missing/incomplete internal delivery pricing inputs produce "Delivery estimate unavailable", with manual review possible but not automatically initiated on every failure. Missing data is neither free delivery nor proof of unsupported destination.
- **OPEN (WEB-040Y):** explicit unsupported-destination configuration: exact pincode and range exclusions vs exact only vs no exclusions initially.
- **PROPOSED:** separate estimate-unavailable, explicit unsupported, exceptional manual review and calculation-error states; final delivery charge must be resolved before order confirmation. See `docs/website/design-system-search-proposal.md`.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable; no additional customer-facing cost components.
- **OPEN:** coupon details; **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 — Registered-pincode delivery allowlist approved
- **LOCKED (WEB-040Y):** registered pincodes are serviceable; unregistered pincodes are not serviceable. Registered with missing price returns "Delivery estimate unavailable" (WEB-040X), not "Delivery not available". No separate exclusion blacklist.
- **PROPOSED:** exact-pincode/range registration may coexist with separately incomplete rate mappings; membership precedence, range administration and data model not yet approved.
- **OPEN (WEB-040Z):** exceptional-shipment manual-review trigger policy.
- **LOCKED (WEB-040N):** discounted all-inclusive product price plus one delivery charge if applicable. Coupon details OPEN. **WEB-038 DEFERRED.**

## 2026-10-28 — No separate exceptional-shipment review
- **LOCKED (WEB-040Z):** no automatic manual-review hold for size/weight and no special product/variant review flag. When complete rates exist, normal internal calculator applies, including longest-side transport adjustment.
- **LOCKED (WEB-040X/Y):** registered pincode with missing rate -> estimate unavailable, review possible; unregistered pincode -> delivery unavailable.
- **OPEN (WEB-040AA):** how a missing-rate manual review is initiated: customer request, admin-only case or automatic case at checkout attempt.
- **LOCKED (WEB-040N):** discounted all-inclusive product price plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 — Customer-initiated delivery review approved
- **LOCKED (WEB-040AA):** registered pincode with unavailable internal rate offers explicit "Request delivery estimate". Only customer submission creates a case; no automatic request from lookup or checkout attempt. Unregistered pincodes cannot use this delivery-review path.
- **OPEN (WEB-040AB):** who may approve and publish a manually resolved delivery amount: restricted permission vs any admin vs owner-only.
- **PROPOSED:** request form fields, staff audit, notifications, quote validity and checkout resumption remain unapproved.
- **LOCKED (WEB-040N):** discounted all-inclusive product price plus one delivery charge if applicable. Coupon details OPEN. **WEB-038 DEFERRED**.

## 2026-10-28 — Authorised admin manual quote approval
- **LOCKED (WEB-040AB):** staff may prepare manual delivery quotes, but only an authenticated admin explicitly assigned delivery-quote approval permission may approve/release a quote. Ordinary admin status alone is insufficient; owner-only restriction not adopted.
- **OPEN (WEB-040AC):** how customer resumes checkout and accepts the approved quote.
- **PROPOSED:** server-side permission checks, audit trail, quote expiry, notification and quote revalidation; implementation details not yet approved.
- **LOCKED (WEB-040N):** discounted all-inclusive product price plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 — Approved quote creates unpaid order
- **LOCKED (WEB-040AC):** approval by an authorised delivery-quote admin automatically creates a customer-associated **unpaid order** with approved single delivery charge. Customer later reviews and pays; no automatic payment, paid status or fulfilment.
- **OPEN (WEB-040AD):** quote validity: configurable fixed window vs until paid/cancelled vs approver-selected expiry.
- **PROPOSED:** prevent duplicate orders on approval retry; secure customer access, notification and payment verification. Exact controls not yet approved.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon specifics OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 — Configurable manual quote validity
- **LOCKED (WEB-040AD):** one centrally admin-configurable validity period determines expiry of each approved manual delivery quote. After expiry, revalidate approved delivery amount before payment; duration and expiry lifecycle remain OPEN.
- **OPEN (WEB-040AE):** customer notification channel after quote approval and automatic unpaid-order creation.
- **LOCKED (WEB-040AC):** authorised approval creates unpaid order, not automatic payment or fulfilment. Expiry does not itself mean automatic order deletion.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 — Approved quote notification via SMTP email
- **LOCKED (WEB-040AE):** after authorised manual quote approval and unpaid-order creation, send transactional email via Tavistra SMTP with order reference, approved total, validity deadline and secure customer-specific order/payment link.
- No launch SMS/WhatsApp integration; email failure must not create duplicate orders or imply payment success. Link security/retry mechanics OPEN.
- **OPEN (WEB-040AF):** expired manual quote/unpaid-order handling; payment must be blocked until delivery amount revalidated.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 — Cancel unpaid manual-quote order at expiry
- **LOCKED (WEB-040AF):** when the centrally configured manual quote deadline passes, automatically cancel the linked order **if still unpaid**. Old payment access cannot be used; customer must submit a new request for a new approved quote and unpaid order.
- Already successfully paid orders must not be cancelled by expiry; exact in-flight payment reconciliation and cancellation notification rules OPEN. Retain cancelled order/quote history.
- **OPEN (WEB-040AG):** inventory reservation policy for unpaid manual-quote orders.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 — Ready-stock hold for unpaid manual quote order
- **LOCKED (WEB-040AG):** on authorised manual quote approval and unpaid-order creation, reserve available ready-stock units until quote expiry; release on automatic cancellation for nonpayment. Once successfully paid, preserve stock allocation for fulfilment, including after original quote deadline.
- Made-to-order/quote-only items, insufficient stock, partial availability, other cancellation cases and payment races remain OPEN.
- **OPEN (WEB-040AH):** whether to email customer when unpaid order is automatically cancelled at quote expiry.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 — Automatic email on unpaid order expiry cancellation
- **LOCKED (WEB-040AH):** automatically send Tavistra SMTP cancellation email after WEB-040AF expiry cancellation, with order reference, reason, ready-stock release and need for a new delivery-estimate request. No active cancelled-order payment link.
- Cancellation/stock release independent of email success; retries must not duplicate cancellations, stock releases or orders. Exact email delivery/retry rules OPEN.
- **OPEN (WEB-040AI):** what to do if required ready stock is insufficient at quote approval/order creation.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 — Require full ready stock before manual quote approval
- **LOCKED (WEB-040AI):** approval and unpaid-order creation are blocked if any required ready-stock item/variant lacks full available quantity. Leave request pending for staff follow-up; no partial reserve, backorder or staff exception. Once available, authorised approval reserves eligible stock per WEB-040AG.
- **OPEN (WEB-040AJ):** handling made-to-order items in manual-delivery unpaid orders; quote-only treatment separate OPEN.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 — Made to Order in manual delivery unpaid orders
- **LOCKED (WEB-040AJ):** eligible Made to Order lines may be included in manual delivery quote approval and automatic unpaid-order creation without reserving nonexistent finished goods. In mixed orders, full availability and reservation apply to Ready Stock lines only.
- Approval/unpaid-order creation does not automatically initiate production or promise lead time. Quote Only participation remains OPEN.
- **OPEN (WEB-040AK):** production-start eligibility trigger for Made to Order.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 — Full verified payment required for Made to Order production
- **LOCKED (WEB-040AK):** Made to Order production becomes eligible **only after verified successful full order payment** via trusted server-side payment verification. Quote approval, unpaid order, pending/partial/deposit payment and staff prepayment approval do not qualify.
- Eligibility is not automatic production start. Scheduling/release, capacity, lead times and refunds OPEN. Quote Only treatment OPEN.
- **OPEN (WEB-040AL):** how production is released after verified full payment.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 — Manual production release after verified full payment
- **LOCKED (WEB-040AL):** after trusted server-side verified full payment, Made to Order lines enter **Awaiting Production Release**; authorised staff explicitly releases them after checking readiness/capacity. Payment alone does not auto-release or begin manufacturing; owner-only release not required.
- Staff authorisation/permissions and production scheduling details OPEN; Quote Only treatment OPEN.
- **OPEN (WEB-040AM):** permission model for authorised production-release staff.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 — Permission-gated Made to Order production release
- **LOCKED (WEB-040AM):** only authenticated staff/admin explicitly granted **Production Release** permission may release fully paid Made to Order items. Ordinary admin access alone insufficient; not owner-only. Backend enforces permission and verified full payment.
- Permission assignment/revocation administration, audit details and release granularity OPEN.
- **OPEN (WEB-040AN):** release Made to Order items individually vs entire order vs both.
- Quote Only and coupon details OPEN. **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. **WEB-038 DEFERRED**.

## 2026-10-28 — Individual and whole-order production release
- **LOCKED (WEB-040AN):** authorised staff may release a fully paid Made to Order line independently or invoke whole-order release for eligible Made to Order lines. Track release state per line; individual release does not release other lines. All actions remain subject to verified full payment, permission and readiness review.
- Mixed readiness, already-released lines and bulk-release atomicity remain OPEN.
- **OPEN (WEB-040AO):** whole-order action when some lines are not ready.
- Quote Only and coupon details OPEN. **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. **WEB-038 DEFERRED**.

## 2026-10-28 — All-or-nothing bulk Made to Order release
- **LOCKED (WEB-040AO):** Release Whole Order requires every currently unreleased Made to Order line to be ready; if any is not ready, release none and leave all unreleased lines unchanged. Previously released lines remain unchanged. Staff may release ready lines individually per WEB-040AN.
- Verify full payment and explicit Production Release permission server-side; bulk release is atomic for target lines.
- **OPEN (WEB-040AP):** how line readiness is confirmed before release. Quote Only and coupon details OPEN.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. **WEB-038 DEFERRED**.

## 2026-10-28 — Explicit per-line production readiness
- **LOCKED (WEB-040AP):** staff explicitly confirms Ready for Production for each Made to Order order line after reviewing specifications, materials and capacity. Confirmation is separate from release and never starts manufacturing.
- **LOCKED (WEB-040AO):** whole-order release remains all-or-nothing across unreleased lines; individual release remains available.
- **OPEN (WEB-040AQ):** who may confirm readiness. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — Shared permission for readiness and production release
- **LOCKED (WEB-040AQ):** explicitly assigned **Production Release** permission authorises both per-line readiness confirmation and subsequent manual release. Backend checks permission for each action; ordinary admin access insufficient. Readiness and release remain separate actions; full verified payment is mandatory for release.
- **OPEN (WEB-040AR):** readiness checklist structure. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — Single readiness attestation
- **LOCKED (WEB-040AR):** permitted staff marks each Made to Order line Ready for Production with one explicit attestation; no mandatory checklist or separate specifications/materials/capacity confirmation fields. Staff remains responsible for assessing readiness. Attestation does not release production.
- Release still requires verified full payment, Production Release permission, and readiness; whole-order release remains all-or-nothing.
- **OPEN (WEB-040AS):** whether/how readiness can be withdrawn before release. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — Irreversible production readiness
- **LOCKED (WEB-040AS):** once explicitly attested Ready for Production, a Made to Order line cannot revert to Not Ready, even before release. Readiness and release remain separate; payment and Production Release permission still required for release.
- **OPEN (WEB-040AT):** separate operational hold before release if readiness becomes stale. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — No formal pre-release operational hold
- **LOCKED (WEB-040AT):** no separate pre-release hold/unhold state or order-wide hold. If conditions change after irreversible readiness, staff must refrain from releasing until resolved; readiness remains unchanged. No machine-enforced operational hold is implied.
- **OPEN (WEB-040AU):** final release confirmation interaction. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — Single-click production release
- **LOCKED (WEB-040AU):** eligible individual-line and whole-order Made to Order release actions execute on a single click with no extra confirmation dialog, typed phrase, mandatory reason or checklist. Scope must be clear before clicking. Backend payment, permission and readiness checks remain mandatory.
- **OPEN (WEB-040AV):** duplicate-click/retry handling. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — Reject duplicate production release
- **LOCKED (WEB-040AV):** repeated release of an already-released Made to Order line returns **Already Released** error without another release. Applies to retries and concurrent requests; first valid release stays unchanged.
- Whole-order release targets only currently unreleased lines. Already released lines are untouched; if none remain, return Already Released. Remaining targets still require all-or-nothing readiness and payment/permission checks.
- **OPEN (WEB-040AW):** successful release audit record. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

# Website product and experience requirements

## Confirmed experience
- **Hybrid Editorial + Commerce**: gallery-led premium storytelling combined with easy shopping.
- **Contemporary Gallery** aesthetic: art-forward photography, considered typography, dramatic compositions; *must remain usable and responsive on any device*. Don't force all pages to be dark.
- **No Journal at initial launch**; no traditional CMS (e.g. WordPress/hosted headless CMS).
- Custom React development preferred, leveraging self-hostable/open-source libraries and avoiding paid licenses, hosted service lock-in and feature/usage restrictions wherever practical.
- Independent Tavistra infrastructure; VDesign and Tavistra will **not** share hosting.
- **Purchasing models**: ready-stock, made-to-order and custom enquiries; per-product eligibility and separate workflows.
- Support **guest checkout** securely alongside customer accounts.

## Storefront scope
Home, Shop, categories/subcategories, collections, product details, product search/filters, Our Story, craftsmanship/materials as appropriate, Cart, Checkout, customer registration/login/profile/addresses/history, Order Tracking, Contact/Support, policies/FAQ/returns/care. Wishlist and advanced personalization may be phased. Admin editorial controls can manage hero, collection placements and static pages without a full CMS.

## Public navigation direction (PROPOSED)
Shop | Collections | Our Story | Contact (Journal excluded). Six main categories can appear within Shop. Exact routes, menu and wireframes **not locked**.

## Customer service and recovery
- Order failure and payment interruption must have a recoverable status and independently verifiable backend payment state.
- Customer contact/issue-report path from product, checkout, orders and footer.
- Lightweight support-case module: reference, category, linked order if applicable, messages/status/resolution.
- Independent support mailbox so site outage does not eliminate the ability to contact Tavistra.
- Secure guest order retrieval with expiring links or verified contact; never trust merely knowing an order number and email as proof of ownership.
- No mandatory customer login to purchase.

## Fulfilment
Manual courier assignment supported without carrier API: provider name, tracking number/link, dispatch date, customer notes, state timeline. Separate order, payment, production and shipment states. Distinguish staff-entered shipment updates from carrier-verified events. Courier APIs optional future integrations.

## Admin requirements
Separate/private React-oriented admin for catalogue publishing and media; variants, price/tax controls, inventory by SKU and small production batch, reservations and adjustments, order/payment/refunds, customers, quotes/enquiries, shipment management, support cases, roles/permissions, SEO metadata, audit records and operational health. Dashboard/reporting depth can grow later.

## Pricing/payment
Razorpay vs PhonePe explicitly deferred until sign-up/test. Validate provider webhooks, amount and signature server-side; idempotency, duplicate/out-of-order events, reconciliation and controlled refund flows. No gateway-specific state model as the application's core.

## Accessibility/performance
Mobile-first responsive interactions, keyboard/screen-reader accessibility, fast product imagery and commerce. Design should not sacrifice navigation clarity or checkout ergonomics for the gallery aesthetic.

## 2026-10-23 design progression
- **LOCKED:** Adaptive Gallery global visual direction. Use intentional light commerce surfaces and dark editorial/feature surfaces; not automatic system light/dark mode.
- **LOCKED:** Complete storefront experience page-by-page before detailed admin UI design, while noting backend requirements as needed.
- **PROPOSED ONLY:** warm neutral background, charcoal editorial surface, muted accent, and exact visual tokens. Decide colour system, then typography, spacing/layout, responsive header/navigation, controls and footer in sequence. No hex colours or page mockups are approved yet.

## 2026-10-23 palette update
- **LOCKED:** Warm Mineral palette direction for Adaptive Gallery (WEB-024). The visual foundation uses warm neutral commerce surfaces, charcoal editorial sections and a restrained bronze accent. Not a mandate for an entirely dark site.
- **PROPOSED:** exact token values and component colour pairings in `docs/website/design-system-colour-proposal.md`; user review required before locking hex values. Typography remains the next separate design decision.

## 2026-10-23 exact colour approval
- **LOCKED (WEB-026):** exact Warm Mineral palette values and roles as recorded in `docs/website/design-system-colour-tokens.md`.
- **LOCKED (WEB-025):** WCAG 2.2 AA accessibility targets and colour-use requirements. Component and full-site conformance still subject to testing.
- **OPEN (WEB-027):** typography; proceed one decision at a time. Earlier statements marking colour values as proposed are historical and superseded by this dated approval.

## 2026-10-23 typography direction
- **LOCKED (WEB-027):** Instrument Serif for selective editorial typography; Manrope for primary commerce and interface text.
- **PROPOSED (WEB-028):** detailed fluid type scale, weights, line heights, tracking, semantic usage and self-hosted font-loading approach in `docs/website/design-system-typography-proposal.md`.
- Do not assume final brand wordmark or precise typography values are approved.

## 2026-10-23 typography baseline approval and layout proposal
- **LOCKED (WEB-029):** Selective Editorial Serif heading hierarchy; Manrope for functional headings, products and commerce controls.
- **LOCKED, test-gated (WEB-028):** exact typography baseline, responsive scale, weights, spacing and self-hosted font delivery in `docs/website/design-system-typography-tokens.md`. Prior typography proposal is historical.
- **PROPOSED (WEB-030):** spacing and responsive grid system in `docs/website/design-system-layout-proposal.md`. Not yet approved.

## 2026-10-23 layout strategy approval
- **LOCKED (WEB-030):** Balanced Gallery overall spacing/density direction.
- **LOCKED (WEB-031):** Curated Masonry + Functional Grid. Mixed-size curated mosaic/masonry for editorial discovery; structured product/search/transaction grids for practical browsing.
- **PROPOSED (WEB-032):** exact responsive container, spacing, gutter, grid-column and card proportions in `docs/website/design-system-layout-proposal.md` v2 section.
- **OPEN (WEB-033):** responsive header/navigation; review next without treating proposed navigation patterns as approved.

## 2026-10-23 header decision
- **LOCKED (WEB-033):** Adaptive Sticky Header: full initial state and compact sticky state on scroll; retain shopping utilities and avoid inaccessible or jittery transitions.
- **PROPOSED (WEB-034):** responsive desktop/mobile information architecture, Shop discovery, search, account, cart, drawer interactions and detailed accessibility rules in `docs/website/design-system-navigation-proposal.md`.
- **Still PROPOSED (WEB-032):** exact responsive spacing/layout tokens; header selection does not implicitly approve them.

## 2026-10-23 desktop Shop navigation approval
- **LOCKED (WEB-035):** Desktop Shop Curated Mega-Menu with links to six approved catalogue categories and one featured visual/link. Do not invent category labels; source taxonomy from `docs/catalogue/taxonomy.md`.
- **OPEN (WEB-036):** Mobile navigation hierarchy; compare drill-down, accordion and category-first drawer approaches next.
- **STILL PROPOSED (WEB-034):** search and cart interactions, exact menu mechanics and header measurements. Layout numeric tokens WEB-032 also remain proposed.

## 2026-10-23 mobile navigation approval
- **LOCKED (WEB-036):** Progressive two-level mobile drill-down drawer: main menu → Shop All and six canonical category links, with a Back action; subcategories belong on category pages.
- Accessibility implementation baseline: meaningful focus management and restoration, Escape and visible Close, modal background inertness, accessible names/states, independent scrolling at zoom, 44px comfortable touch targets and reduced-motion support; verify in browser and assistive technology.
- **OPEN (WEB-037):** search interaction pattern and later autocomplete/suggestions.
- **DEFERRED (WEB-038):** cart interaction. No decision implied.

## 2026-10-23 search experience approval
- **LOCKED (WEB-037):** Compact Search Overlay opened from desktop/mobile header, responsive to viewport, with full search results page on submission.
- **PROPOSED (WEB-039):** live suggestion strategy, search empty state, query handling, result ranking/filtering, no-result and error states, and accessibility/performance acceptance criteria. See `docs/website/design-system-search-proposal.md`.
- **DEFERRED (WEB-038):** cart interaction remains a later decision.

## 2026-10-24 search suggestion approval and results proposal
- **LOCKED (WEB-039):** Restrained Live Suggestions, using published searchable catalogue entries; grouped category/type and product shortcuts, with Enter submitting to the full results page.
- **PROPOSED (WEB-040):** Functional Grid search results page, structured filters, relevance-first ranking, deep links and separate no-results, filtered-empty and network-error states. See `docs/website/design-system-search-proposal.md`.
- **OPEN (WEB-040A):** exact launch filter scope.
- **DEFERRED (WEB-038):** cart interaction, unchanged.

## 2026-10-24 minimal search filter approval
- **LOCKED (WEB-040A):** launch search filters are Category and Purchase Mode only, with truthful published catalogue facets and removable applied filters. Product Type/Price/Material/Collection are not launch filters.
- **OPEN (WEB-040B):** sorting scope. Relevance ranking details, pagination and result-state UX remain PROPOSED under WEB-040.
- **DEFERRED (WEB-038):** cart interaction, unchanged.

## 2026-10-24 search sorting approval
- **LOCKED (WEB-040B):** sorting options are Relevance (default), Newest First, Price Low-to-High and Price High-to-Low. This is separate from the locked Category + Purchase Mode filters (WEB-040A).
- **OPEN (WEB-040C):** precise treatment of unpriced/quote-only products when price sorting, including variable-price products; do not assume missing prices are zero.
- **PROPOSED (WEB-040):** relevance ranking rules, result states, tie-breaks and implementation details, documented in `docs/website/design-system-search-proposal.md`.
- **DEFERRED (WEB-038):** cart interaction remains for a later decision.

## 2026-10-24 priced-first search sorting approval
- **LOCKED (WEB-040C):** in either price sort direction, comparable priced products precede a clearly labelled unpriced/quote-only group. Include both in total counts and global pagination; never substitute zero for missing price.
- **OPEN (WEB-040D):** price basis for variable-price variants; do not silently choose minimum or default variant.
- **PROPOSED (WEB-040):** detailed relevance ranking, result-state copy, paging and price/tax treatment; see `docs/website/design-system-search-proposal.md`.
- **DEFERRED (WEB-038):** cart interaction remains unchanged.

## 2026-10-24 variable-price starting-at approval
- **LOCKED (WEB-040D):** for genuinely variable-price products, use the lowest currently purchasable published variant as the price sort key and label the card **From ₹X**; no unavailable/draft/quote-only variant may set a misleading minimum. No eligible price means placement in the unpriced group per WEB-040C.
- **OPEN (WEB-040E):** consistent customer-facing tax-inclusive/exclusive display basis and treatment of promotions, shipping, ranges and mandatory configuration charges, pending approval and compliance review.
- **PROPOSED (WEB-040):** search result state details and relevance weighting remain unapproved; see `docs/website/design-system-search-proposal.md`.
- **DEFERRED (WEB-038):** cart interaction remains for later.

## 2026-10-24 tax-inclusive pricing approval
- **LOCKED (WEB-040E):** show customer-facing tax-inclusive product prices in India-facing search/cards/PDP, including Starting-at prices; price sorting uses the same tax-inclusive basis. Reconcile checkout/invoice tax breakdowns to inclusive totals, subject to validated GST classification, rates, place of supply and invoicing.
- **OPEN (WEB-040F):** delivery-charge estimate and disclosure timing; do not assume free shipping or pre-approve a delivery estimator.
- **PROPOSED (WEB-040):** price, zero-result, filtered-zero, loading and error-state copy/behaviour; see `docs/website/design-system-search-proposal.md`.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-24 early delivery estimate approval
- **LOCKED (WEB-040F):** early delivery estimate where reliable destination and rates are available, and a verified final charge disclosed before order confirmation; when location is unknown, disclose that delivery is calculated separately. Do not invent zero/free shipping, serviceability or delivery times.
- **OPEN (WEB-040G):** destination acquisition method for early estimate. No pincode input, automatic geolocation, shared destination setting or retention is approved yet.
- **PROPOSED (WEB-040):** search/delivery estimate states, rate errors, serviceability, revised totals and exact display copy; see `docs/website/design-system-search-proposal.md`.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 optional PDP pincode approval
- **LOCKED (WEB-040G):** optional customer-entered Indian delivery pincode on product detail pages for early estimates. A valid six-digit format alone does not confirm serviceability. Product browsing does not depend on destination or courier availability; full-address checkout calculation is authoritative.
- **OPEN (WEB-040H):** estimate request trigger and exact input mechanics; provider, rate caching and retention remain undecided.
- **PROPOSED (WEB-040):** distinguish invalid format, confirmed unsupported destination, rate unavailable, API failure, stale estimate and search error/empty states; see `docs/website/design-system-search-proposal.md`.
- **DEFERRED (WEB-038):** cart interaction remains unchanged.

## 2026-10-28 explicit Check button approval
- **LOCKED (WEB-040H):** customer activates an explicit Check button (or submits the form with Enter) to request the optional PDP pincode estimate; six-digit entry alone must not trigger lookup. No courier API calls on typing, blur or page load.
- **OPEN (WEB-040I):** frontend/backend sequence for serviceability and rate lookup.
- **PROPOSED (WEB-040):** validate pincode as a six-digit string, preserve leading zeros, distinguish serviceable-with-rate, no-rate, unsupported, provider failure and stale responses. Checkout revalidates final charge.
- **DEFERRED (WEB-038):** cart interaction remains unchanged.

## 2026-10-28 single backend estimate request approval
- **LOCKED (WEB-040I):** optional product-page pincode Check invokes one Tavistra backend estimate request. Backend coordinates eligibility, serviceability, rate sources and structured response; storefront must not chain separate courier checks.
- **OPEN (WEB-040J):** eligible-provider fallback policy. Actual courier integration, rate selection and caching remain undecided.
- **PROPOSED (WEB-040):** distinguish estimated, invalid, confirmed unsupported, serviceable-but-no-rate, manual-review and transient-error outcomes. Backend validates inputs and checkout recalculates final charge; search stays independent of delivery API availability.
- **DEFERRED (WEB-038):** cart interaction remains unchanged.

## 2026-10-28 authoritative shipping correction
- **LOCKED:** no courier API connection for Tavistra's shipping estimate. Admin-managed internal delivery rates based on destination/distance, size, weight, fragility and other configurable shipment characteristics; specific rate formulas and zone/distance mapping remain OPEN.
- **LOCKED (WEB-040I clarified):** optional PDP Check sends one Tavistra backend request to evaluate internal coverage and rate rules. Couriers are selected independently for fulfilment; actual courier cost may differ from customer delivery charge.
- **WITHDRAWN (WEB-040J):** courier provider fallback, live provider serviceability and live courier-rate lookup proposals are not part of the design.
- **OPEN (WEB-040K):** choose internal destination/distance basis. Distinguish missing internal rate rule, outside-coverage destination and internal calculation failure; checkout recalculates final charge.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 presumptive kilometre mapping approved
- **LOCKED (WEB-040K):** Tavistra admin can assign presumptive kilometres to an individual Indian pincode or an inclusive range of pincodes. Values are internal shipping-pricing references, not guaranteed road distances. No maps or courier API needed.
- **PROPOSED:** exact pincode overrides broader ranges; prevent ambiguous overlaps; preserve leading zeros; distinguish missing configuration from explicitly unsupported destination; support future origin-aware mapping.
- **OPEN (WEB-040L):** formula for converting presumptive kilometres into shipping charge; weight, dimensions and fragility adjustments remain to be designed.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 distance bands approved
- **LOCKED (WEB-040L):** admin-assigned presumptive kilometres for destination pincode/range select an internally maintained distance band and its base delivery charge. Exact thresholds and rupee rates are not approved.
- **PROPOSED:** chargeable packed weight, dimensional/volumetric handling, fragile/special handling surcharge and minimum delivery charge, with no fabricated zero rates and no double-counting the same volume factor.
- **OPEN (WEB-040M):** actual vs volumetric vs product-class-specific chargeable weight policy.
- **DEFERRED (WEB-038):** cart interaction unchanged; multiple-item shipment aggregation not yet decided.

## 2026-10-28 two-component pricing clarification
- **LOCKED (WEB-040N):** customer sees only an all-inclusive tax-inclusive product price, with packaging and product handling costs already included, plus one delivery charge where applicable. No separate packaging, weight, size, fragility or minimum-charge fees on product page, cart or checkout.
- Delivery rate calculation may still internally use shipment characteristics if later approved, but all such costs must be consolidated into the single delivery charge and avoid double charging.
- **OPEN (WEB-040O):** distance bands alone vs internal shipment adjustments vs manual exceptions; previous WEB-040M chargeable-weight options are not customer-facing pricing decisions.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 internal shipment adjustments approved
- **LOCKED (WEB-040O):** delivery amount is the internal distance-band base charge plus applicable transport-related weight, packed-dimension/oversize and fragility adjustments. Show **only one all-inclusive product price plus one delivery charge if applicable**; no separately billed packing, weight or handling line items.
- Packaging and ordinary product handling are included in the product price and must not be charged again in delivery. Courier selection remains independent, with no courier API.
- **PROPOSED:** internal adjustment thresholds, weight basis, minimum-charge floor, exceptions and versioned audit records; no fabricated zero when rules are missing.
- **OPEN (WEB-040P):** adjustment formula/structure; WEB-040M actual-vs-volumetric remains internal-only and open.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 fixed / bracketed shipping adjustments approved
- **LOCKED (WEB-040P):** distance-band base plus admin-configured fixed/bracketed **internal transport** adjustments for weight, packed dimensions and fragility where applicable. No default percentage multiplier or complete distance × shipment-class matrix. Exact thresholds and amounts remain OPEN.
- **LOCKED (WEB-040N):** customer sees only all-inclusive product price plus one combined delivery charge if applicable. Packaging and ordinary product handling already included in product price; do not bill them again or itemize adjustments.
- **PROPOSED:** one weight bracket per shipment, distinct oversize handling, fragility class adjustments, minimum floor with explicit free-delivery exception, missing-configuration/manual-review states, versioned audit records and checkout recalculation.
- **OPEN (WEB-040M):** internal chargeable-weight basis; minimum-charge precedence, tax treatment and multi-item packing also unapproved.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 greater-of-actual-and-volumetric weight approved
- **LOCKED (WEB-040M):** internal chargeable weight is `max(actual_packed_weight_kg, (packed_length_cm * packed_width_cm * packed_height_cm) / admin_configured_divisor)`. Divisor value and rounding policy remain open.
- Chargeable weight selects fixed/bracketed transport adjustment (WEB-040P). Do not separately display it; preserve all-inclusive product price plus one delivery charge if applicable (WEB-040N).
- **PROPOSED:** non-overlapping weight brackets, documented precision/boundaries, distinct oversize transport conditions, fragility classes, minimum floor, missing-data/manual-review states and multi-item shipment rules.
- **OPEN (WEB-040Q):** one matching weight bracket vs cumulative vs class-specific bracket schedule.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 single fixed weight bracket approved
- **LOCKED (WEB-040Q):** compute chargeable weight as greater of packed actual and volumetric weight, select exactly one matching bracket, and apply that bracket's fixed transport adjustment to the distance-band base. No cumulative crossed-threshold charges.
- **PROPOSED:** admin-maintained non-overlapping kg ranges with explicit boundary convention; separate dimensional/oversize adjustment only for distinct transport constraints; fixed fragility classes, minimum floor/waiver and missing-data/manual-review states.
- **OPEN (WEB-040R):** weight threshold configuration approach; no numeric limits, rupee charges, divisor or tax sequence approved.
- **LOCKED (WEB-040N):** customer sees all-inclusive product price plus one delivery charge if applicable, never individual adjustment lines.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 predefined weight ranges approved
- **LOCKED (WEB-040R):** application-defined weight-bracket boundaries; admin may change each bracket's fixed ₹ internal transport adjustment but not its kg limits through ordinary admin settings. Exact brackets, thresholds and amounts remain unapproved.
- **LOCKED:** one matching bracket from greater of actual and volumetric packed weight (WEB-040M/Q). Only all-inclusive product price plus one delivery charge if applicable (WEB-040N).
- **PROPOSED:** versioned bracket configuration, overlap/boundary checks, explicit zero adjustment vs missing rate, separate oversize transport restrictions, fragile class rules, minimum floor and exceptions.
- **OPEN (WEB-040S):** dimensional surcharge approach; fragility, minimum floor and exception details to be decided one at a time.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 longest packed side threshold approved
- **LOCKED (WEB-040S):** use longest **packed** side `max(L,W,H)` and apply a fixed internal dimensional transport adjustment when it exceeds a configured threshold. Exact cm and ₹ values remain OPEN.
- The dimensional adjustment must represent a distinct long-parcel transport restriction, not duplicate the volumetric-weight bracket. Packaging/ordinary handling are already in the all-inclusive product price.
- **PROPOSED:** validate packed dimensions and boundaries, handle missing data/manual-review, audit versions and recompute at checkout.
- **OPEN (WEB-040T):** fragility adjustment policy; then minimum delivery charge and exceptions one decision at a time.
- **LOCKED (WEB-040N):** all-inclusive product price plus one combined delivery charge if applicable.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 universal fragility included in product price
- **LOCKED (WEB-040T):** all Tavistra products are fragile by default; normal protective packaging and fragile handling are part of the all-inclusive product price. No automatic fragility surcharge or routine fragile handling class in internal delivery pricing.
- **LOCKED:** delivery calculator uses distance-band base + one matching fixed weight-bracket adjustment + applicable distinct longest-packed-side transport adjustment, subject to future minimum/exception/tax decisions. No duplicate cost recovery.
- **OPEN (WEB-040U):** minimum delivery floor approach; actual ₹ floor, exceptions/waivers, numeric thresholds and shipping tax still open.
- **LOCKED (WEB-040N):** customer sees only all-inclusive product price plus one delivery charge if applicable.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 distance-band-specific delivery minimum approved
- **LOCKED (WEB-040U):** each distance band has an admin-editable minimum ₹ delivery amount. For ordinary eligible shipments apply a floor after distance-band base plus one fixed weight bracket and applicable distinct longest-side adjustment. Actual amounts not approved.
- **OPEN (WEB-040V):** explicit free-delivery waiver precedence over floor; delivery tax/discount sequencing remains open.
- **PROPOSED:** missing band/floor/rates/packed measurements must not silently be free or unsupported; manual-review, destination-exclusion and calculation-error states remain to be decided.
- **LOCKED (WEB-040N/T):** customer sees all-inclusive product price plus one delivery charge if applicable; all products fragile with standard packing/handling included in product price and no automatic fragility fee.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 — Free delivery waiver and coupon types approved
- **LOCKED (WEB-040V):** a valid explicitly configured free-delivery waiver, including a qualifying delivery coupon, overrides the distance-band minimum and may set the single delivery charge to ₹0. Missing rates, missing coverage or invalid coupons never imply free delivery.
- **LOCKED (WEB-040W):** support both delivery-waiver coupons and product-price discount coupons; coupon formats, stacking, eligibility, caps, expiry, redemption and tax treatment remain OPEN.
- **LOCKED (WEB-040N):** customer sees discounted all-inclusive product price and one delivery charge if applicable; savings explanations are not additional charge components.
- **PROPOSED:** server-authoritative coupon validation, destination/serviceability checks, manual-review restrictions, revalidation at checkout and auditability.
- **OPEN (WEB-040X):** missing-rate/unconfigured destination response; explicit non-serviceable and manual-review rules to follow separately.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 missing delivery rate handling approved
- **LOCKED (WEB-040X):** missing rate, destination mapping, band minimum, weight charge or required packed measurements return "Delivery estimate unavailable" with a possible manual-review request path. Do not infer unsupported destination, automatically waive delivery or automatically start a manual quote on every missing rate.
- **OPEN (WEB-040Y):** how administrators explicitly exclude destinations, separately from incomplete pricing configuration.
- **PROPOSED:** internal reason codes, explicit unsupported/manual-review/calculation-error states, checkout hold/resume, final total resolved before order confirmation.
- **LOCKED (WEB-040N):** discounted all-inclusive product price plus one delivery charge if applicable. Coupon details remain OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 registered-pincode serviceability approved
- **LOCKED (WEB-040Y):** delivery is offered only to pincodes registered in Tavistra's internal coverage system. Registered but unpriced -> "Delivery estimate unavailable" (WEB-040X), manual review possible. Unregistered -> "Delivery not available to this pincode". No separate exclusion list.
- Coverage registration must be distinguishable from price/rate completeness; no silent interpretation of missing tariff as non-serviceability. Free-delivery coupons do not override unregistered coverage.
- **PROPOSED:** explicit exact/range registration with validated membership, separate pricing records and audit; schema and range mechanics remain OPEN.
- **OPEN (WEB-040Z):** exceptional shipment manual-review trigger.
- **LOCKED (WEB-040N):** discounted all-inclusive product price plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 exceptional shipment review decision
- **LOCKED (WEB-040Z):** do not require separate automatic manual review or admin exception flags solely due to parcel size, weight or fragility. Complete valid rates use normal distance-band, fixed weight and distinct longest-side pricing.
- **LOCKED (WEB-040X/Y):** registered but unpriced -> estimate unavailable, review possible; unregistered -> delivery not available. Final charge and total must be confirmed before order placement.
- **OPEN (WEB-040AA):** manual-review request initiation and subsequent approval/resumption workflow.
- **LOCKED (WEB-040N):** discounted all-inclusive product price plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 customer-initiated manual delivery request
- **LOCKED (WEB-040AA):** for a registered pincode with missing delivery rate, show "Delivery estimate unavailable" and offer explicit "Request delivery estimate"; only submitted customer request creates a case. No automatic request on pincode check or checkout attempt.
- **LOCKED (WEB-040Y):** unregistered pincode -> delivery not available, not eligible for this request workflow.
- **OPEN (WEB-040AB):** approval authority for manual delivery quote; form fields, notifications, quote lifecycle and checkout resumption separately OPEN.
- Final combined delivery charge and payable total must be resolved before order confirmation.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 manual delivery approval authority
- **LOCKED (WEB-040AB):** staff may prepare a manual delivery amount, but only an admin with explicit delivery-quote approval permission may approve/release it. Ordinary admin role alone is not enough; owner-only approval is not required.
- **PROPOSED:** backend permission enforcement, audit fields, quote expiry and notification remain implementation details to approve.
- **OPEN (WEB-040AC):** checkout resumption and explicit customer acceptance after approval.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon specifics OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 approved delivery quote creates unpaid order
- **LOCKED (WEB-040AC):** authorised approval of a customer-initiated manual delivery quote automatically creates an unpaid order associated with that customer/request. Customer reviews and pays later; no automatic payment or fulfilment.
- **OPEN (WEB-040AD):** manual quote validity duration/policy, unpaid order expiry/cancellation, notifications and inventory reservation.
- **PROPOSED:** idempotent order creation, approval/order audit link and secure customer payment access.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one approved delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 approved manual delivery quote validity
- **LOCKED (WEB-040AD):** one centrally admin-configurable validity period sets each approved quote's expiry. After expiry, revalidate the approved delivery amount before allowing payment. Exact duration and expiry/cancellation workflow remain OPEN.
- **LOCKED (WEB-040AC):** authorised quote approval creates an unpaid order; quote expiry does not automatically imply order cancellation/deletion.
- **OPEN (WEB-040AE):** customer notification channel for approved quote and unpaid order.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 transactional email after manual quote approval
- **LOCKED (WEB-040AE):** send SMTP transactional email after authorised quote approval and unpaid-order creation, containing order reference, approved total, quote validity deadline and secure customer-specific order/payment link.
- No SMS/WhatsApp connection. Failed email does not imply paid order or create a second order. Exact retries, sender, access tokens and guest recovery remain OPEN.
- **OPEN (WEB-040AF):** expired quote handling on unpaid order; no payment with stale delivery amount before revalidation.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 automatic expiry cancellation
- **LOCKED (WEB-040AF):** automatically cancel unpaid order when approved manual delivery quote expires; prevent payment via stale link. New delivery request and new approved quote/order required. Do not cancel already successfully paid orders.
- Preserve cancelled order/quote history. Payment races, cancellation notice, refund/verification details remain OPEN.
- **OPEN (WEB-040AG):** ready-stock inventory reservation policy for unpaid manual-quote orders.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 reserve ready stock during unpaid quote window
- **LOCKED (WEB-040AG):** reserve available ready-stock units when authorised quote approval creates an unpaid order. Release reservation if the unpaid order automatically cancels at quote expiry; retain stock allocation after payment.
- Made-to-order/quote-only stock, insufficient stock, mixed orders, manual cancellation and payment races OPEN. Avoid double allocation or release; technical enforcement PROPOSED.
- **OPEN (WEB-040AH):** customer cancellation notification policy on expiry.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 cancellation email for expired unpaid manual orders
- **LOCKED (WEB-040AH):** automatically send SMTP cancellation notice after expired unpaid order is cancelled; include order reference, expiry reason, ready-stock release and new request instruction. Never provide a working payment link for cancelled order.
- Email failure cannot undo cancellation or trigger duplicate stock release. Template/retry/monitoring specifics OPEN.
- **OPEN (WEB-040AI):** insufficient ready-stock handling at manual quote approval.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 full ready-stock gate on manual quote approval
- **LOCKED (WEB-040AI):** check all ready-stock items/variants for full available quantities before approval. If short, block approval and unpaid-order creation, retain request pending; no partial holds, backorders or staff exception. When stock available, approval may proceed and reserve eligible units.
- **OPEN (WEB-040AJ):** made-to-order eligibility and treatment; quote-only separately OPEN.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 Made to Order in manual quote unpaid-order workflow
- **LOCKED (WEB-040AJ):** eligible Made to Order items can be included without finished-stock reservation. In mixed orders, WEB-040AI full-stock approval gate and WEB-040AG reservation apply only to Ready Stock lines.
- No automatic manufacturing from delivery approval or unpaid-order creation. Production start/capacity/lead time OPEN; Quote Only eligibility OPEN.
- **OPEN (WEB-040AK):** production-start trigger.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 Made to Order production only after verified full payment
- **LOCKED (WEB-040AK):** do not permit Made to Order production eligibility before trusted server-side verification of successful full order payment. Quote approval, unpaid order, pending/partial/deposit payment or staff prepayment approval do not qualify.
- Full payment does not automatically start production. Production release/scheduling, capacity and lead times OPEN. Quote Only treatment OPEN.
- **OPEN (WEB-040AL):** production release policy after verified full payment.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 authorised staff production release
- **LOCKED (WEB-040AL):** after verified full order payment, Made to Order products enter Awaiting Production Release. Authorised staff explicitly releases after readiness/capacity review; no automatic production release and no owner-only requirement.
- **OPEN (WEB-040AM):** which staff/admin accounts have release authority. Exact readiness checklist and production scheduling OPEN. Quote Only treatment OPEN.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 explicit permission for production release
- **LOCKED (WEB-040AM):** authenticated staff/admin must hold explicitly assigned Production Release permission to release fully paid Made to Order items; admin role alone insufficient, owner-only not required. Verify payment and permission server-side.
- **OPEN (WEB-040AN):** per-line vs whole-order release; grant/revoke roles and exact audit details OPEN. Quote Only participation OPEN.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 Made to Order line and whole-order production release
- **LOCKED (WEB-040AN):** both individual-line and whole-order manual release are supported for verified fully paid Made to Order lines by explicitly permitted staff, subject to readiness review. Maintain per-line release state; individual release leaves other lines unchanged.
- **OPEN (WEB-040AO):** behaviour of whole-order release when some lines are not ready; Quote Only treatment OPEN.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040AO all-or-nothing production release
- **LOCKED:** Release Whole Order succeeds only if every currently unreleased Made to Order line passes readiness checks. If one fails, no target line is released. Previously released lines stay unchanged. Individual release remains supported.
- Full verified payment and explicit Production Release permission remain mandatory; bulk transition is all-or-nothing.
- **OPEN WEB-040AP:** readiness confirmation mechanism. Quote Only treatment and coupon details OPEN. Two customer-facing price components unchanged. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040AP per-line readiness confirmation
- **LOCKED:** staff explicitly records Ready for Production on each Made to Order line after reviewing specifications, materials and production capacity; readiness and production release are separate steps. Readiness alone does not start production.
- **LOCKED:** all unreleased lines must be ready for all-or-nothing whole-order release (WEB-040AO); individual line release remains available (WEB-040AN).
- **OPEN WEB-040AQ:** readiness-confirmation authority. Exact checklist OPEN. Quote Only and coupon details OPEN. WEB-040N two price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040AQ shared production permission
- **LOCKED:** authenticated staff explicitly granted Production Release permission may both mark Made to Order lines Ready for Production and release eligible lines. Backend enforces permission on both distinct actions. Ordinary admin access alone insufficient.
- Readiness does not itself release or start production. Release still requires verified full order payment and existing WEB-040AO all-or-nothing bulk conditions.
- **OPEN WEB-040AR:** readiness checklist structure. Quote Only and coupon details OPEN. WEB-040N two price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040AR no mandatory readiness checklist
- **LOCKED:** authorised staff holding Production Release permission records Ready for Production per Made to Order line with a single explicit attestation. No mandatory checklist, individual specifications/materials/capacity checkboxes or supporting readiness fields. Staff still evaluates readiness.
- Readiness confirmation remains separate from manual release; release requires full verified payment and explicit permission, with WEB-040AO all-or-nothing whole-order rule.
- **OPEN WEB-040AS:** withdrawal of readiness before release. Quote Only and coupon details OPEN. WEB-040N two price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040AS irreversible readiness
- **LOCKED:** Made to Order Ready for Production attestation is irreversible once confirmed by permitted staff. No return to Not Ready; no mandatory checklist. Confirmation remains distinct from production release, which requires verified full payment and explicit Production Release permission.
- **OPEN WEB-040AT:** operational hold mechanism for changed conditions before release; no implied readiness reset. Quote Only and coupon details OPEN. WEB-040N two price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040AT no formal operational hold
- **LOCKED:** do not implement a separate pre-release operational hold state/action for Made to Order. Staff must refrain from releasing lines if materials, specifications or capacity no longer support production, even though readiness remains irreversibly Ready.
- Existing manual release, verified full payment, explicit permission, and all-or-nothing bulk readiness rules remain. No hidden hold gate.
- **OPEN WEB-040AU:** confirmation before production release. Quote Only and coupon details OPEN. WEB-040N two price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040AU single-click release
- **LOCKED:** staff holding Production Release permission may release eligible Made to Order lines individually or by whole-order action in one click, without confirmation modal, typed phrase, mandatory reason or checklist. Clearly label release scope beforehand.
- Preserve verified full payment, permission, per-line readiness, irreversible readiness, no formal hold, and all-or-nothing whole-order checks.
- **OPEN WEB-040AV:** duplicate click/retry semantics. Quote Only and coupon details OPEN. WEB-040N two price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040AV reject duplicate release
- **LOCKED:** already-released Made to Order line release requests return **Already Released** and never trigger production again. Enforce this for retries, double-clicks and concurrent requests.
- Whole-order release targets only unreleased lines; existing released lines remain unchanged. If no unreleased targets remain, Already Released. For remaining targets, WEB-040AO atomic all-or-nothing readiness and verified payment/permission gates still apply.
- **OPEN WEB-040AW:** release audit policy. Quote Only and coupon details OPEN. WEB-040N two price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040AW minimal successful-release audit
- **LOCKED:** automatically persist a successful Made to Order production release audit with releasing staff identity, server timestamp, order ID, affected released line IDs and individual-versus-whole-order action scope. No mandatory staff note or second confirmation.
- **LOCKED:** whole-order audit lists only lines actually transitioned by the successful release. Already Released/rejected requests never create a second successful-release audit. Exact audit storage/retention and failed-attempt logging remain OPEN.
- **OPEN WEB-040AX:** whether to audit all rejected release attempts, only permission/payment rejections, or none separately. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040AX audit rejected production release attempts
- **LOCKED:** automatically record **every rejected** Made to Order production-release attempt as a separate failure event, including Already Released, permission, full-payment and readiness rejections. Include server timestamp, known actor (or unknown/unauthenticated), requested line/whole-order scope, known order/line IDs and controlled rejection reason.
- **LOCKED:** failed attempts do not trigger production, change release state or create a successful-release audit (WEB-040AW); existing WEB-040AV Already Released response remains. No mandatory note or confirmation.
- **OPEN WEB-040AY:** protected append-only audit events vs editable records with revision history vs ordinary application logs. Exact retention, storage and failure handling OPEN. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040AY append-only production release audit
- **LOCKED:** successful-release and rejected-attempt Made to Order production-release audits are separate, durable, protected **append-only** records (WEB-040AW/AX). Ordinary staff and administrators cannot edit or delete existing audit events.
- **LOCKED:** factual corrections require a new audit event linked to the original, without overwriting history. Do not substitute editable records with revision history or ordinary application logs as the authoritative audit.
- **OPEN WEB-040AZ:** audit-write failure handling for successful release and rejected attempts. Retention, viewing/correction permissions, controlled disposition and tamper-evidence mechanism OPEN. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040AZ atomic release and audit persistence
- **LOCKED:** successful Made to Order production-release state transition and its durable append-only success-audit event must commit **atomically**. If the audit write fails, do not commit release, start production or return a successful-release result. Preserve whole-order all-or-nothing behaviour.
- **LOCKED:** rejected requests remain rejected; failure-audit write errors must surface an operational error/alert without changing release state or treating rejection as success. Exact alert delivery, response codes and retry/recovery remain OPEN.
- **OPEN WEB-040BA:** dedicated Production Audit View permission vs reuse Production Release permission vs all admins for audit reading. Retention, correction authority and tamper-evidence remain OPEN. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040BA administrator audit viewing
- **LOCKED:** all authenticated Tavistra administrators can **read** successful-release, rejected-attempt and linked correction audit records for Made to Order production release. No separate Audit Viewer permission or Production Release permission is required to view. Enforce admin authentication and access server-side.
- **LOCKED:** viewing does not grant Production Release authority, the right to append corrections, or the ability to edit/delete protected append-only records. Exact audit UI/API and scoped visibility remain OPEN.
- **OPEN WEB-040BB:** who may append linked factual-correction events: dedicated Production Audit Correct permission, any administrator, or designated system owner only. Retention and operational alert handling OPEN. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040BB dedicated audit correction permission
- **LOCKED:** only authenticated staff explicitly granted **Production Audit Correct** permission may append linked factual-correction events to Made to Order production-release audit history. Enforce this permission server-side. General admin access, audit viewing and Production Release permission alone are insufficient.
- **LOCKED:** corrections are new protected append-only records linked to the original audit; they never edit/delete existing events, modify release status or initiate production. The permission does not automatically grant audit-view access.
- **OPEN WEB-040BC:** structured correction with mandatory reason vs mandatory narrative-only correction vs minimal correction with optional reason. Exact correction review, retention and audit presentation OPEN. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040BC structured audit corrections
- **LOCKED:** each Made to Order production-release audit correction is a new linked append-only event containing the original audit event reference, specific field being corrected, replacement value and **mandatory reason**. Automatically record authenticated correcting staff identity and server timestamp.
- **LOCKED:** enforce Production Audit Correct permission and required structured correction fields server-side. Preserve the original audit record/value; a correction does not alter actual production-release state, payment or readiness and cannot start production.
- **OPEN WEB-040BD:** direct append without second approval vs two-person pre-approval vs append followed by review. Exact field allowlist, retention and audit presentation remain OPEN. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040BD immediate corrections with subsequent review
- **LOCKED:** authorised staff with Production Audit Correct permission can append a valid structured, reasoned audit correction **immediately**, without waiting for a second person's pre-approval.
- **LOCKED:** every appended correction must subsequently receive review by **someone other than its author**. Record **Acknowledged** or **Flagged** as a new linked, protected append-only review event with reviewer identity and server timestamp. Review never edits/deletes the original audit or correction and never changes actual production-release state.
- **OPEN WEB-040BE:** dedicated Production Audit Review permission vs any other administrator vs another Production Audit Correct holder for the independent reviewer. Review deadline, notifications and flagged-case escalation OPEN. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040BE independent review by another administrator
- **LOCKED:** any authenticated Tavistra administrator may review a Made to Order production-release audit correction, but **not their own correction**. Enforce administrator access and distinct reviewer/corrector identities server-side. No dedicated Production Audit Review or Production Audit Correct permission is required for review.
- **LOCKED:** review records **Acknowledged** or **Flagged** as a new linked protected append-only event with reviewer identity and server timestamp; it cannot change historical events or production-release state. Creating a correction still requires Production Audit Correct permission.
- **OPEN WEB-040BF:** independent correction review deadline: 72 calendar hours, seven calendar days or no fixed deadline. Overdue alerts and flagged-case escalation remain OPEN. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040BF no fixed correction review deadline
- **LOCKED:** independent administrative review of a Made to Order production-release audit correction is mandatory but has **no fixed deadline**. A correction stays **Pending Review** until a different authenticated administrator records **Acknowledged** or **Flagged** in a linked protected append-only review event.
- **LOCKED:** no time-based automatic approval, expiry, review completion or change to production-release state. Preserve correction-authorisation, structured correction data and immutable audit history.
- **OPEN WEB-040BG:** dedicated pending-review queue vs audit-history pending filter vs correction-detail-only visibility. Reminders and flagged-case escalation remain OPEN. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040BG dedicated pending-review queue
- **LOCKED:** provide authenticated administrators a **dedicated Pending Audit Correction Review queue** listing corrections without a valid independent Acknowledged/Flagged review event. Include original audit reference/link, correcting staff identity, timestamp and structured correction details, with access to review.
- **LOCKED:** the correction's author can see their own pending correction but cannot review it; enforce separation server-side. A valid independent review removes the item from the pending queue without editing/deleting the original, correction or review event. No fixed review deadline or automatic escalation.
- **OPEN WEB-040BH:** immediate in-app notification vs daily pending-review digest vs queue-only without notifications. Flagged-case handling, audit retention and precise UI/API remain OPEN. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040BH queue-only pending review discovery
- **LOCKED:** administrators manually check the dedicated Pending Audit Correction Review queue for corrections awaiting mandatory independent review. No automatic pending-review in-app notifications, daily digests or automated pending-review reminders.
- **LOCKED:** pending status persists until a different authenticated administrator appends a linked protected Acknowledged or Flagged review event; no fixed deadline, auto-approval or auto-escalation. WEB-040AZ's operational alert for failure to persist a rejected-attempt audit remains unaffected.
- **OPEN WEB-040BI:** flagged-correction follow-up: mandatory linked resolution by Production Audit Correct staff vs informational flag only vs second independent administrator review. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040BI mandatory flagged-correction follow-up
- **LOCKED:** every independent administrator's **Flagged** review of a Made to Order production-release audit correction requires documented follow-up. Only authenticated staff with **Production Audit Correct** permission may append the required **separate linked protected resolution/corrective-action event**; enforce authorisation server-side.
- **LOCKED:** preserve the original release audit, structured correction and Flagged review as immutable append-only events. Follow-up does not edit history, change actual release/payment/readiness state, start production or automatically reclassify the Flagged outcome.
- **OPEN WEB-040BJ:** structured corrective action with mandatory explanation vs mandatory narrative-only follow-up vs minimal linked resolution marker. Exact closure, timing, retention and presentation remain OPEN. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040BJ mandatory narrative flagged-correction follow-up
- **LOCKED:** the mandatory follow-up to a Flagged Made to Order production-release audit correction is a **separate protected append-only event** linked to both the Flagged review and correction, with a **required free-text narrative** of action/follow-up taken. Automatically record authorised staff identity and server timestamp; no structured corrective-action category is required.
- **LOCKED:** enforce Production Audit Correct permission, valid linked references and nonempty narrative server-side. Preserve all historical audit, correction and review events unchanged; the follow-up does not alter release/payment/readiness state or initiate production.
- **OPEN WEB-040BK:** formal closure after narrative follow-up: independent administrator acceptance vs closure on valid follow-up vs no separate closed status. Follow-up timing, audit retention and presentation OPEN. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040BK independent acceptance for flagged-correction closure
- **LOCKED:** after a Production Audit Correct-authorised staff member appends the mandatory narrative follow-up to a Flagged Made to Order production-release audit correction, a **different authenticated administrator** must independently accept or reject its sufficiency before the concern may be formally closed.
- **LOCKED:** append a separate protected event linked to the Flagged review, correction and narrative follow-up, recording **Resolution Accepted** or **Further Action Required**, administrator identity and server timestamp. Enforce admin authority, valid links and separation from the narrative follow-up author server-side. Only **Resolution Accepted** closes the concern; Further Action Required leaves it open. Original audit, correction, Flagged review and follow-up remain immutable, with no release-state change.
- **OPEN WEB-040BL:** repeat narrative follow-up and independent acceptance vs discretionary open-case follow-up vs designated-owner disposition after Further Action Required. Timing, flagged-case presentation and retention OPEN. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040BL discretionary follow-up after Further Action Required
- **LOCKED:** when an independent administrator records **Further Action Required** on a flagged audit-correction narrative follow-up, the concern stays **open**. Subsequent staff action is **discretionary**; there is no mandatory repeat narrative follow-up, repeated formal acceptance cycle or automatic assignment to a designated owner.
- **LOCKED:** only a valid independent administrator **Resolution Accepted** event may formally close the flagged concern (WEB-040BK). Further Action Required and all earlier audit, correction, Flagged review, narrative and acceptance events remain protected append-only; voluntary later records obey existing permission, linkage and separation rules. No production-release state change.
- **OPEN WEB-040BM:** dedicated open-flagged-concerns queue vs open-flagged audit-history filter vs individual-detail-only status. Later reassessment mechanics, timing, retention and presentation remain OPEN. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040BM dedicated open flagged concerns queue
- **LOCKED:** provide authenticated Tavistra administrators a **dedicated Open Flagged Concerns queue**, separate from WEB-040BG's Pending Audit Correction Review queue. Include every Flagged audit-correction concern without a valid independent **Resolution Accepted** event, including cases awaiting initial narrative follow-up, independent acceptance or further discretionary action after **Further Action Required**.
- **LOCKED:** link each open concern to its original audit/correction, Flagged review, linked narrative follow-ups and acceptance decisions. A valid Resolution Accepted event removes it from the open queue without editing immutable history; Further Action Required or a narrative follow-up alone does not close it. Queue visibility confers no correction or acceptance authority and does not change release state.
- **OPEN WEB-040BN:** initial mandatory flagged-correction narrative follow-up deadline: 72 calendar hours vs seven calendar days vs no fixed deadline. Independent acceptance timing and flagged-case notifications remain separate. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040BN no fixed initial flagged-correction narrative follow-up deadline
- **LOCKED:** the initial mandatory narrative follow-up after a Made to Order production-release audit correction is independently **Flagged** has **no fixed deadline**. The authorised **Production Audit Correct** staff follow-up remains mandatory, with a separate protected linked narrative event, required explanation, actor and server timestamp. No time-based automatic fulfilment, expiry, closure or overdue escalation is introduced.
- **LOCKED:** the flagged concern remains in the dedicated **Open Flagged Concerns queue** until a different authenticated administrator appends a valid **Resolution Accepted** event; the narrative alone does not close it. Preserve immutable audit history, separate review permissions and WEB-040AZ operational audit-write failure alert. No production-release state change.
- **OPEN WEB-040BO:** independent administrator's acceptance decision deadline after a valid narrative follow-up: 72 calendar hours vs seven calendar days vs no fixed deadline. Flagged-case notification and reassessment details remain OPEN. Quote Only and coupon details OPEN. WEB-040N exactly two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040BO no fixed independent flagged-follow-up acceptance deadline
- **LOCKED:** an independent authenticated administrator's **Resolution Accepted** or **Further Action Required** decision after the mandatory flagged-correction narrative follow-up has **no fixed deadline**. A different administrator from the narrative author must still append the protected linked decision with identity and server timestamp; enforce independent authority and valid event links server-side. No time-based auto-acceptance, expiry, closure or overdue escalation.
- **LOCKED:** keep the concern in the **Open Flagged Concerns queue** until a valid **Resolution Accepted** event closes it. Further Action Required leaves it open with discretionary additional action. All audit, correction, Flagged review, narrative and acceptance events remain immutable; no change to production-release state. Initial correction review and initial flagged narrative follow-up also retain their separately locked no-fixed-deadline rules.
- **OPEN WEB-040BP:** immediate in-app notifications vs daily open-flagged digest vs queue-only manual discovery for **newly Flagged concerns**. Distinct from WEB-040BH's no-automatic-notification policy for pending initial correction reviews. Quote Only and coupon details OPEN. WEB-040N exactly two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040BP queue-only flagged-concern discovery
- **LOCKED:** authenticated administrators **manually check** the dedicated **Open Flagged Concerns queue** for newly Flagged and still-open Made to Order production-release audit correction concerns. Do **not** automatically send in-app alerts, daily digests or reminders merely due to a Flagged event or a concern remaining open. WEB-040BH's separate queue-only rule for **pending initial independent correction reviews** remains unchanged.
- **LOCKED:** narrative follow-up by Production Audit Correct staff and independent administrator acceptance remain mandatory; only **Resolution Accepted** formally closes a flagged concern. No fixed initial-review, narrative-follow-up or independent-acceptance deadline; no automatic expiry or release-state change. Keep immutable audit events and WEB-040AZ operational audit-write failure alerts intact. Distinct event-triggered notifications, if any, remain OPEN.
- **OPEN WEB-040BQ:** open-flagged queue status display: distinct derived workflow-stage labels vs Open plus latest-event summary vs Open only. Sorting, later reassessment mechanics and retention remain OPEN. Quote Only and coupon details OPEN. WEB-040N exactly two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040BQ distinct open flagged concern workflow-stage labels
- **LOCKED:** the dedicated authenticated-administrator **Open Flagged Concerns queue** must show distinct derived statuses: **Awaiting Narrative Follow-up** when no linked narrative exists; **Awaiting Independent Acceptance** when a narrative exists without a valid independent decision on that narrative; and **Further Action Required** when the latest applicable independent acceptance decision requests further action.
- **LOCKED:** a subsequent voluntary authorised narrative after Further Action Required returns the derived display to **Awaiting Independent Acceptance**, without imposing a mandatory repeat cycle. Only a valid independent **Resolution Accepted** event formally closes/removes the concern. Derive labels from protected append-only events; do not mutate original audit/correction/Flagged review/follow-up/acceptance history or production-release state. Preserve no-fixed-deadline and queue-only notification decisions.
- **OPEN WEB-040BR:** default queue ordering: oldest flagged first vs newest flagged first vs workflow-stage groups with oldest first within each group. Filtering, retention and reassessment mechanics remain OPEN. Quote Only and coupon details OPEN. WEB-040N exactly two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040BR oldest flagged first default queue ordering
- **LOCKED:** the authenticated-administrator **Open Flagged Concerns queue** defaults to **oldest unresolved flagged correction first**, ordered by the server timestamp of the original independent **Flagged** review, across **all three derived workflow stages**. Newer narrative follow-ups and independent decisions do not reset the original flagged timestamp or default queue order.
- **LOCKED:** only a valid independent **Resolution Accepted** closes/removes a concern; retain all protected append-only linked audit events. Sorting adds no deadline, automatic escalation, notifications, new permissions or production-release state changes. Optional filtering, manual sort overrides and timestamp tie-breaks remain OPEN.
- **OPEN WEB-040BS:** stage filter with All Open default vs stage-plus-age filters vs no filters. Quote Only and coupon details OPEN. WEB-040N exactly two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040BS workflow-stage and flagged-age filters
- **LOCKED:** the authenticated-administrator **Open Flagged Concerns queue** supports optional **workflow-stage** and **flagged-age/date-range** filters, combinable. Stage choices: **All Open**, **Awaiting Narrative Follow-up**, **Awaiting Independent Acceptance**, **Further Action Required**. Age/date filtering is based on the server timestamp of the **original independent Flagged review**.
- **LOCKED:** default to **all stages and all flagged ages**, ordered **oldest original Flagged review first** within the visible set (WEB-040BR). Filtering changes only the displayed subset, never the canonical concern status, append-only audit history, permissions or production-release state. Preserve no-fixed-deadline and queue-only notification policies.
- **OPEN WEB-040BT:** manual sorting override: oldest/newest flagged toggle vs expanded sort modes including latest linked activity vs no override. Date-range control details and tie-breaking remain OPEN. Quote Only and coupon details OPEN. WEB-040N exactly two customer-facing price components unchanged. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040BT oldest/newest flagged manual sort toggle
- **LOCKED (Option A):** In the Open Flagged Concerns queue, administrators can toggle between **Oldest Flagged First** (default) and **Newest Flagged First**, using the original Flagged review server timestamp. The selected order applies within the workflow-stage and flagged-age filters (WEB-040BS).
- **LOCKED:** sorting affects display only, never event history, workflow status, permissions or release state. Existing no-deadline and queue-only notification policies remain unchanged.
- **OPEN WEB-040BU:** choose age-filter controls: preset 7/30/90-day windows, custom start/end dates, or both. Quote Only and coupon details remain OPEN; WEB-040N preserves two customer-facing price components; WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BU preset-only flagged-age filters
- **LOCKED (Option A):** The administrator **Open Flagged Concerns queue** offers **All Ages** (default), **Last 7 Days**, **Last 30 Days** and **Last 90 Days** as its only flagged-age controls. No custom start/end dates. Presets filter on the original independent **Flagged review server timestamp**, not subsequent linked activity.
- **LOCKED:** Combine these presets with the existing workflow-stage filter and oldest/newest flagged sort toggle, retaining oldest-first default. Filtering changes only the visible list, not immutable audit events, open/closed status, permissions or production release. Existing no-deadline and queue-only notification policies remain unchanged.
- **OPEN WEB-040BV:** decide whether Last N Days means rolling N×24-hour periods, UTC calendar days or Tavistra business-time-zone calendar days. Quote Only and coupon details remain OPEN; WEB-040N preserves exactly two customer-facing price components; WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BV business-local calendar-day flagged-age windows
- **LOCKED (Option C):** interpret **Last 7/30/90 Days** as **business-local calendar-day windows** in Tavistra's configured business time zone. Include the current business-local date plus the preceding 6/29/89 dates, respectively, beginning at local midnight on the earliest included date; do not use rolling 24-hour durations or UTC calendar-day windows. Filter using the original independent **Flagged review server timestamp**, converted to its business-local date, not later linked activity.
- **LOCKED:** retain **All Ages** default and preset-only age controls, combined workflow-stage filtering and the oldest/newest original Flagged review toggle with oldest-first default. Filter display only; preserve protected append-only audit history, open/closed status, authorisation, no-fixed-deadline and queue-only notification policies, and actual production-release state.
- **OPEN WEB-040BW:** choose the business time-zone source: canonical centrally configured Tavistra business time zone, dedicated audit-queue time zone, or fixed Asia/Kolkata. Quote Only and coupon details remain OPEN; WEB-040N preserves exactly two customer-facing price components; WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BW fixed Asia/Kolkata flagged-age time zone
- **LOCKED (Option C):** the **Open Flagged Concerns queue** uses the fixed IANA time zone **Asia/Kolkata (IST, UTC+05:30)** for Last 7/30/90 Days flagged-age filters, regardless of other business time-zone settings, administrator browser locale or server-local time zone. Include the current Asia/Kolkata calendar date plus the preceding 6/29/89 dates, respectively, starting at 00:00 IST on the earliest included date, using the original independent Flagged review's server timestamp.
- **LOCKED:** keep All Ages default, preset-only age controls, combined workflow-stage filtering and oldest/newest Flagged review sorting with oldest-first default. Filtering affects display only and never changes protected append-only events, concern closure, permissions, notification or no-fixed-deadline policies, or actual production-release state.
- **OPEN WEB-040BX:** determine stable tie-breaking when original Flagged review timestamps match: original Flagged review event ID ascending, original correction event ID ascending, or no explicit tie-break. Quote Only and coupon details remain OPEN; WEB-040N preserves exactly two customer-facing price components; WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BX deterministic Flagged review event ID tie-breaking
- **LOCKED (Option A):** for Open Flagged Concerns with identical original independent **Flagged review server timestamps**, sort ties by **immutable unique original Flagged review event ID ascending**, in both oldest-first and newest-first modes. Only the primary timestamp direction reverses when newest-first is selected. Apply within combined stage and Asia/Kolkata calendar-day age-preset filters. This produces repeatable ordering for unchanged result sets across refreshes and pages.
- **LOCKED:** secondary sorting is presentation-only. It must not modify protected append-only audit events, concern status, permissions, deadlines, notification policies or production-release state. Preserve All Open, All Ages and Oldest Flagged First defaults.
- **OPEN WEB-040BY:** decide persistence of stage, age-preset and sort selections: reset each queue visit, retain for authenticated session, or save per administrator across sessions. Quote Only and coupon details remain OPEN; WEB-040N preserves exactly two customer-facing price components; WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BY reset queue view selections on every visit
- **LOCKED (Option A):** every new visit to the authenticated-administrator **Open Flagged Concerns queue** resets workflow stage to **All Open**, flagged-age preset to **All Ages**, and sort to **Oldest Flagged First**. Administrators can change selections only for the current queue view. Do not retain selections when the queue is reopened in the same session or save per-administrator preferences.
- **LOCKED:** resetting filters and sorting affects presentation only. Preserve original Flagged review timestamp sorting, ascending immutable Flagged review event ID tie-break, Asia/Kolkata calendar-day age presets, protected append-only history, derived concern stages, closure rules, permissions, no-fixed-deadline and queue-only notification policies, and production-release state.
- **OPEN WEB-040BZ:** queue navigation: numbered pages with Previous/Next, explicit Load More batches, or automatic infinite scroll. Page/batch size and concurrent-update behaviour remain OPEN. Quote Only and coupon details remain OPEN; WEB-040N preserves exactly two customer-facing price components; WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BZ numbered-page Open Flagged Concerns navigation
- **LOCKED (Option A):** the authenticated-administrator **Open Flagged Concerns queue** uses **numbered pages with Previous/Next controls**, allowing direct selection of a displayed page number. Apply navigation to the currently filtered and sorted open-concern results. Do not substitute Load More-only batches or automatic infinite scrolling.
- **LOCKED:** preserve combinable workflow-stage and Asia/Kolkata calendar-day flagged-age presets, oldest/newest original Flagged timestamp sorting with ascending immutable Flagged review event ID tie-breaking, and reset-to-default stage/age/sort on each new queue visit. Pagination affects display only; protected append-only history, open/closed status, permissions, deadlines, notification policy and production-release state are unchanged.
- **OPEN WEB-040CA:** choose numbered-page size: fixed 25 rows, fixed 50 rows or administrator-selectable 25/50/100 rows (default 25). Concurrent queue updates and page-reset behaviour remain OPEN. Quote Only and coupon details remain OPEN; WEB-040N preserves exactly two customer-facing price components; WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CA selectable Open Flagged Concerns page size
- **LOCKED (Option C):** in the authenticated-administrator **Open Flagged Concerns queue**, provide a **25/50/100 concerns-per-page selector**, **default 25**, for the existing numbered pages with Previous/Next navigation (WEB-040BZ). The selected size applies to the currently stage-filtered, age-filtered and deterministically sorted open-concern result set.
- **LOCKED:** page-size selection changes display only; preserve protected append-only audit history, derived stages, open/closed status, permissions, no-fixed-deadline and queue-only notification policies, and production-release state. WEB-040BY's reset-on-visit stage/age/sort rule is unchanged; page-size persistence remains OPEN.
- **OPEN WEB-040CB:** decide which numbered page to show after a stage/age/sort/page-size change: reset to page 1, preserve current page number where valid, or preserve the first visible concern where possible. Concurrent-update pagination remains OPEN. Quote Only and coupon details remain OPEN; WEB-040N preserves exactly two customer-facing price components; WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CB page-one reset on queue control changes
- **LOCKED (Option A):** whenever an administrator changes the Open Flagged Concerns queue's **workflow-stage filter**, **flagged-age preset**, **oldest/newest sort direction** or **25/50/100 page-size selection**, show **page 1** of the updated filtered and sorted results. Do not preserve the prior page number or anchor the previously first visible concern. Empty results must not display an invalid numbered page.
- **LOCKED:** preserve numbered pages with Previous/Next, 25/50/100 selectable page size (default 25), reset-on-visit stage/age/sort defaults, Asia/Kolkata flagged-age windows, deterministic original Flagged review timestamp and event-ID ordering, and all append-only audit, closure, permission, deadline, notification and production-release invariants. Navigation is display-only.
- **OPEN WEB-040CC:** choose whether page size resets to 25 on every new queue visit, persists only for the authenticated session, or is saved per administrator across sessions. Concurrent-update pagination consistency remains OPEN. Quote Only and coupon details remain OPEN; WEB-040N preserves exactly two customer-facing price components; WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CC reset page size to 25 on every queue visit
- **LOCKED (Option A):** every new visit to the authenticated-administrator **Open Flagged Concerns queue** resets the page-size selector to **25 concerns per page**. Administrators may select **50 or 100** within the current view, but the selection is not retained across queue visits, within the same session or in saved administrator preferences.
- **LOCKED:** combined new-visit defaults are **All Open**, **All Ages**, **Oldest Flagged First** and **25 concerns per page**. Preserve numbered pages with Previous/Next, reset to page 1 when stage/age/sort/page size changes, Asia/Kolkata calendar-day flagged-age windows, deterministic original Flagged review timestamp/event-ID ordering, and all append-only audit, closure, permission, deadline, notification and production-release invariants.
- **OPEN WEB-040CD:** decide concurrent-update pagination behaviour: live re-query on each page navigation, fixed view snapshot until refresh/control change, or automatic refresh and page-one reset on queue changes. Quote Only and coupon details remain OPEN; WEB-040N preserves exactly two customer-facing price components; WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CD live page-navigation re-query
- **LOCKED (Option A):** on each Open Flagged Concerns **Previous**, **Next** or numbered-page selection, re-query the **current authorised, stage/age-filtered and deterministically sorted** open-concern records using the selected **25/50/100 page size**. Recalculate the available page count; if the requested page is no longer valid, show the last valid page or an empty-result state when no concerns match. Concurrent changes may move records between successive pages; no fixed multi-page snapshot is guaranteed.
- **LOCKED:** preserve new-visit defaults **All Open / All Ages / Oldest Flagged First / 25 per page**, page-one reset on explicit control changes, original Flagged review timestamp with Asia/Kolkata age presets and ascending event-ID tie-break, protected append-only history, closure rules, permissions, deadlines, notification policy and production-release state. Navigation re-query is display-only.
- **OPEN WEB-040CE:** choose in-view freshness while remaining on a numbered page: explicit Refresh only, automatic periodic refresh, or live push-based updates. Page-navigation live re-query remains locked. Quote Only and coupon details remain OPEN; WEB-040N preserves exactly two customer-facing price components; WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CE manual in-view queue refresh
- **LOCKED (Option A):** the authenticated-administrator **Open Flagged Concerns queue** provides a visible **Refresh** control to re-query current authorised, filtered and deterministically sorted concerns while remaining on a numbered page. Do **not** automatically poll or push live in-view updates. Preserve WEB-040CD live re-query on Previous/Next/numbered-page navigation.
- **LOCKED:** Refresh retains current stage, age, sort, page-size and page-number selections where valid; if the requested page no longer exists, show the last valid page or an empty-result state. Explicit stage/age/sort/page-size changes still reset to page 1 (WEB-040CB); new queue visits still reset to All Open / All Ages / Oldest Flagged First / 25 per page (WEB-040BY/CC). Refresh is read-only and does not change protected append-only history, concern status, permissions, deadlines, notification policy or production-release state.
- **OPEN WEB-040CF:** decide result-count display: visible current-page row range plus matching total, matching total only, or no separate matching-record count beyond numbered pagination. Quote Only and coupon details remain OPEN; WEB-040N preserves exactly two customer-facing price components; WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CF row range and matching total
- **LOCKED (Option A):** show the **exact current-page row range and matching open-concern total**, for example **Showing 26–50 of 83 matching concerns**, on numbered Open Flagged Concerns pages. Derive both values from the most recently fetched authorised, stage/age-filtered, deterministically sorted result set and the current 25/50/100 page size. With no matching concerns, show an empty-result state and **0 matching concerns** without an invalid row range.
- **LOCKED:** recalculate displayed range and total on initial load, explicit Refresh, Previous/Next/numbered-page navigation, and stage/age/sort/page-size changes. No background updating of counts is implied. Preserve reset-on-visit defaults, page-one reset on control changes, live navigation re-query, manual-only in-view Refresh, original Flagged review timestamp/event-ID ordering, Asia/Kolkata age windows, protected append-only history, closure rules, permissions, deadlines, notification policy and production-release state.
- **OPEN WEB-040CG:** decide whether to display the latest successful queue fetch as an absolute Asia/Kolkata time, a relative elapsed-time label, or no last-updated indicator. Quote Only and coupon details remain OPEN; WEB-040N preserves exactly two customer-facing price components; WEB-038 cart interaction DEFERRED.


## 2026-11-04 — Phase 3 consolidated UX/design acceptance (Owner-approved Option A)

**OWNER-APPROVED / LOCKED:** Phase 3 concept-level website UX/design specification is accepted and CLOSED. The approved baseline comprises the [Phase 3 UX coverage audit](../roadmap/phase-3-ux-coverage-audit.md), [customer-facing page-family specification](../roadmap/phase-3-customer-page-family-specification.md), and [staff administration UX specification](../roadmap/phase-3-admin-ux-specification.md), interpreted alongside the latest owner-approved Phase 1 sitemap, Phase 2 business rules, and established visual/navigation decisions. This is acceptance of page purposes, information hierarchy, primary actions, responsive principles and cross-surface customer/staff handoffs, **not** approval of pixel-perfect comps, final copy, engineering architecture, vendor choices, QA or launch.

**Cross-surface acceptance:** Preserve distinct Ready Stock and Made to Order checkout paths even when both modes are selected; Quote Only remains a separate staff-led enquiry, versioned quote, acceptance and verified-advance journey. Staff operational views use shared worklists, contextual records, authorised actions and immutable audit; customer views show only appropriate status, commitments and next actions. No new major UX boundary was found requiring another owner vote. Previously locked payment, price presentation, delivery, tax, stock, production, seven-day grace, cancellation/refund, return, guest/account, security/privacy and statutory obligations remain unchanged. Later locked decisions supersede older OPEN/DRAFT wording; this approval does not silently reverse any protected outcome.

**ACTIVE NEXT PHASE:** Phase 4 — technical architecture validation and developer-ready implementation handoff/planning, **without writing or deploying website code in this conversation**. Use [existing implementation-readiness blueprint](../roadmap/implementation-readiness-plan.md) as a preliminary, non-binding reference. Next deliverable: concise decision-to-acceptance traceability, architecture/dependency review and a prioritized developer handoff including unresolved genuine pre-build dependencies (not UI micro-votes). Phase 1, Phase 2 and Phase 3 remain closed unless a material conflict is evidenced and explicitly approved for revision.


## 2026-11-04 — Phase 4 developer-handoff planning formally accepted and CLOSED (Owner Option A)

**OWNER-APPROVED / LOCKED:** Phase 4 planning is COMPLETE and CLOSED. The owner accepts the [critical requirements-to-acceptance matrix](../roadmap/phase-4-requirements-acceptance-matrix.md), [architecture validation](../roadmap/phase-4-architecture-validation.md), [module/integration dependency map](../roadmap/phase-4-module-integration-map.md), [developer handoff](../roadmap/phase-4-developer-handoff.md) and [final planning-readiness review](../roadmap/phase-4-final-readiness-review.md) as the planning baseline for future engineering. This approval does **not** lock unselected frameworks/vendors or certify deployed systems, financial integration, testing, regulatory compliance or launch readiness. Latest substantive owner-approved decisions remain authoritative; older historical OPEN/DRAFT markers do not reopen resolved matters.

**CONFIRMED EXECUTION ASSUMPTIONS:** AI-assisted development under owner supervision; independently hosted Tavistra site on a small Hostinger VPS (exact plan/capacity pending); PhonePe intended payment gateway (merchant review, credentials and verified integration pending). Owner-reported PhonePe onboarding requires a reviewable live website; prepare a truthful public review-ready presence with unsafe checkout disabled before activating payments, subject to confirmation of PhonePe's exact criteria. A review-ready site is not a commercial launch or waiver of approved initial-launch scope.

**NEXT STAGE — ENGINEERING EXECUTION PREPARATION ONLY:** Establish a bounded engineering kickoff/implementation work-package sequence, acceptance and verification checkpoints, security/credential/deployment ownership, and infrastructure/PhonePe onboarding prerequisites. **No website code, infrastructure provisioning, staging deployment, public deployment, gateway onboarding action, purchase or commercial launch is authorised by this approval or in this conversation.** Obtain separate explicit owner authorisation before any such execution. Preserve every locked Phase 1–4 business, UX, financial, inventory, production, privacy/security and statutory outcome; escalate only material changes.


## 2026-11-04 — Post-audit global commerce and timeline reconciliation (owner-approved)

**AUTHORITY: FINAL CONTROLLING DECISION; supersedes incompatible older text across ALL Phase 1–4 documents, including WEB-040AK, WEB-042 v1, previous mixed-order consolidation assumptions and the former rule treating the seven-day window as part of the quote's 30 days.** This reconciliation applies globally, not merely as a Phase 4 engineering suggestion.

1. **Three independent purchase/order/fulfilment modes:** **Ready Stock**, **Made to Order**, and **Quote Only** remain distinct in checkout commitment, payment accounting, order lifecycle, production/stock rules and fulfilment. Quote Only starts as staff-led enquiry, versioned quotation and exact-version acceptance, and is never ordinary checkout. Ready Stock and Made to Order must not be processed as one payment or order. **No cross-mode consolidated fulfilment or forced shared dispatch is required at initial launch**; older single mixed-order consolidated-dispatch rules do **not** apply to initial-launch separate orders. Fulfil each separately under its applicable rules, with independent statuses, delivery commitments, charges, remedies and audit. Any later cross-order dispatch optimization is **outside the launch baseline** and requires explicit scope approval, not silent implementation. **Cart interaction/presentation is delegated to development** within these firm business boundaries; developers must not combine modes into a single checkout/order/payment or weaken disclosure. Reuse shared UI where sensible.
2. **Made to Order AND Quote Only advances:** both require **at least 25% of the authoritative agreed total verified received before actual production commencement**; verified 25% is the payment eligibility threshold for authorised readiness/release, **not** automatic production start. **100% cumulative payment verified before dispatch eligibility**, preserving physical quality/custody, staff fulfilment approval and carrier handover gates. A remaining 75% is collected according to approved completion/QC and communication milestones; any approved order changes require correct balance reconciliation. Ready Stock retains its own approved payment and stock/allocation rules, not the MTO deposit workflow.
3. **Original Quote Only 30-day validity versus confirmed-order seven-day grace: independent clocks.** The original quote's 30-calendar-day IST deadline starts on original quotation issuance (original date = day zero; valid through 23:59:59 IST on day 30); revisions do not reset it. Exact-version acceptance AND verified timely 25% advance are necessary for order confirmation, subject to approved delayed confirmation/reinstatement logic. **After order confirmation**, that quotation acceptance clock no longer limits the confirmed order's seven-calendar-day grace or eligible pre-production change/cancellation rights. The seven-day IST clock starts at the verified confirmation timestamp (confirmation local date = day zero; day seven ends 23:59:59 IST). Its protections remain valid **even if quote day 30 passes during the grace period**. An unresolved pre-production specification-change request submitted within that seven-day window remains subject to approved staff review, customer acceptance of any revised terms, production blocks and applicable refund/cancellation rules; the old quote's expiry cannot automatically reject the request, cancel a fully confirmed order or retain the advance. Staff should handle revised confirmed-order terms as versioned order changes, **not** as renewal of the expired unconfirmed quotation. Ordinary discretionary changes remain barred after actual physical production starts; statutory/quality/fraud/error remedies survive. No indefinite unconfirmed quotation: expired/rejected/unpaid quotations close under existing rules and verified unagreed funds are refunded as approved.
4. **Statutory invoices, GST/tax paperwork, credit/debit notes and corresponding refunds/reconciliation** are **development and compliance implementation requirements**, not a new owner UX/business-policy vote. Assign responsibility to order/billing/payment/tax modules, verify applicable Indian law with qualified advisers and provide legally correct documents where required. The locked **two customer-facing price components** remain product price (discounted, applicable tax inclusive) and one applicable delivery charge; legally mandated tax breakups on statutory documents do not create a third checkout fee.
5. **Brand files/logo and final commercial/legal configuration** are development-stage content inputs furnished by owner, not gaps requiring re-approval of the website concept. Hostinger small VPS is the hosting direction; PhonePe the intended gateway pending review and usable integration; AI-assisted implementation remains owner-supervised. Public non-transactional merchant-review site, private beta and commercial launch are distinct stages; do not enable unverified payments or skip required QA.
6. **Documentation governance:** historical text remains as audit trail but is **SUPERSEDED TO THE EXTENT OF CONTRADICTION**. The current effective cross-phase specification/index and reconciled acceptance criteria are the development handoff authority. Never implement older 100%-before-MTO-production gates, mixed-order/dispatch dependencies, or a seven-days-within-thirty limit. Phase 1–4 remain closed as planning phases; this is the post-audit clean-up, not new website execution.

**No website code, VPS provisioning, payment onboarding or deployment is authorised by this record.**


## 2026-11-04 — Full Phases 1–4 cross-phase audit reconciliation FINALISED

**OWNER-DIRECTED CLOSURE:** After an in-depth review, the owner explicitly reconfirmed the global 25%-verified-production / 100%-verified-dispatch rule for both Made to Order and Quote Only, three separate mode-specific order/payment/fulfilment paths with cart interaction assigned to development, and **independent** Quote Only 30-day original quotation and MTO/Quote Only seven-day confirmed-order grace periods. The [cross-phase audit](../roadmap/full-repository-cross-phase-audit.md) has been dispositioned, a [single effective handoff entry point](../roadmap/current-effective-handoff-baseline.md) published and the [effective production-payment lifecycle](../decisions/current-production-payment-lifecycle.md) created to override stale WEB-042/full-payment wording. The [Phase 4 acceptance](../roadmap/phase-4-requirements-acceptance-matrix.md), module/integration map, developer handoff, README, historical status pointers and release staging notes were updated accordingly.

**NO UNRESOLVED MAJOR CONCEPT DECISION IDENTIFIED:** Final cart UI, statutory invoicing/GST mechanics and lawful documents, logo/brand asset import, actual product data, tariffs and policy copy, VPS sizing, PhonePe approval/integration, automated tests, operational staff separation of duties and public review/private beta/commercial release evidence belong to **development, content, provider onboarding or compliance execution**; they must respect approved customer and financial rights. The four planning phases stay CLOSED. Treat older conflicting prose as historical, not live policy. **This approves document reconciliation only, not implementation, regulatory certification, payment onboarding, server deployment or launch.**

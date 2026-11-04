# Tavistra storefront — Search experience proposal

> **HISTORICAL PROPOSAL — NOT CURRENT POLICY (2026-11-04):** This large chronological file also contains past production/audit-queue details and superseded 'WEB-040AK full payment before release', Quote Only/coupon OPEN and mixed-cart status wording. Read [current effective handoff](../roadmap/current-effective-handoff-baseline.md) and [current production/payment lifecycle](../decisions/current-production-payment-lifecycle.md) for the present rules. Preserve original design decisions as dated history; do not extract financial gates from old continuity paragraphs. No execution authorised.


**Updated:** 2026-10-24
**Current decision status:** **LOCKED (WEB-037): Compact Search Overlay**. **LOCKED (WEB-039): Restrained Live Suggestions**. **PROPOSED (WEB-040):** search results layout, filters, ranking, zero/error states. **DEFERRED (WEB-038):** cart interaction. Historical proposals below are retained as context; the latest decisions supersede them.

## Approved interaction pattern
- Search icon in desktop and mobile header opens a **Compact Search Overlay**, rather than expanding the header inline or immediately navigating to a search page.
- Desktop uses a restrained, accessible search dialog/panel; mobile adapts to a larger, potentially near-full-height sheet to preserve comfortable input and result viewing.
- A full search results page exists as the destination when a search is submitted. Exact visual sizing and placement are not locked.
- Preserve the Adaptive Sticky Header design; search opening should not shift or destabilize the underlying page.

## Suggested first-release design (PROPOSED; requires owner approval)
### Search empty state
- Search input, visible Close control, optional 3–5 curated discovery links **only if real published catalogue content exists**.
- Avoid fabricated “popular searches,” fake products or unsupported popularity claims. Curated links are editorial, not claimed analytics.
- Placeholder example: “Search objects, materials, styles” but don't promise attributes that have not been indexed.

### As the user types
- **Recommended: restrained live suggestions** with a small maximum (candidate 5–6), drawn only from published searchable content; categories/product types and products can be separated and clearly labeled.
- Search on Enter always leads to a dedicated results page; suggestions are optional shortcuts, not the only route to results.
- No image-heavy suggestions by default; thumbnails only if measured helpful and performant.
- Debounce network lookups, cancel/ignore stale responses, enforce minimum input threshold, and show loading/error states without freezing the field.
- Don't show suggestions that imply stock/availability unless backed by current backend state.
- No recent-search history by default; persistence requires a separate privacy/product decision.

### Results page
- Query is reflected in page title and editable search field, with visible result count when known.
- Functional, consistent product grid (WEB-031), not masonry; filters/sort as supported by actual indexed attributes and approved catalogue taxonomy.
- Candidate relevance order: exact title/type match, then category/material/tags and descriptive text. No invented ranking signals; tie-breaking, synonyms, typo handling, language and stemming require testing.
- Distinguish published in-stock, made-to-order, and quote-only modes without implying all products can be purchased instantly.
- Zero results: clearly state no matches, preserve query, offer edit/retry and genuine category links; avoid fictitious recommendations.
- Network failure: separate from zero results, show retry. Prevent stale results after query changes.
- Deep-linkable search query and filters, browser back/forward support, server-safe query validation and no unescaped HTML injection.

### Accessibility / performance acceptance criteria
- Search opener is a labeled button; dialog has accessible name, Close button and predictable Escape dismissal.
- Modal overlay traps focus while open, background is inert, and focus returns to search opener on close (unless navigation changed route).
- Focus input on opening where appropriate, without causing unwanted mobile keyboard jumps; verify mobile behaviour.
- Suggestions should follow a well-tested combobox/listbox interaction if arrow-key selection is implemented. Do not assign `role=combobox` without implementing expected keyboard semantics.
- Enter submits query, Escape dismisses suggestions first where appropriate and then overlay; keyboard users can reach every suggestion and submit.
- Announce status/result changes in a non-disruptive way; do not repeatedly announce on every keystroke.
- 44x44 CSS px comfortable target goal; WCAG 2.2 AA design target, visible focus, 200% zoom and narrow-viewport reflow.
- Use semantic, cache-aware backend search with limits, rate limiting and monitoring; test slow networks and keyboard/screen readers.

## Next one-at-a-time decision (WEB-039)
A. **Restrained live suggestions (recommended):** grouped category/type and product shortcuts while typing; Enter to full results.
B. **Curated empty-state links only:** no live suggestions, Enter to full results; simpler launch and lower complexity.
C. **Richer live preview:** images and multi-section suggestions, higher visual/engineering cost.

No option in WEB-039 is locked yet. Cart interaction (WEB-038) stays deferred.

## 2026-10-24 — Restrained Live Suggestions approved (WEB-039)

**LOCKED product direction:** While typing in the compact search overlay, show a short, restrained list of live suggestions from the **published searchable catalogue**, grouped by relevant categories/product types and product matches where available. Search submission by Enter always leads to the full results page. Suggestions are optional shortcuts, not a substitute for full search. Avoid rich image-heavy preview by default.

**Refined implementation baseline (test-gated, not an approval of precise limits):**
- Suggested cap **5–6 total rows**, not 5–6 per group. Group headings only when a group has results; no empty headings.
- Only expose published product records, valid active routes and truthful commerce states. Taxonomy labels may be suggested as navigation only if their destination is real and useful; never imply that a taxonomy type is an in-stock SKU.
- For a term such as "desk", canonical taxonomy entries can include **Desk Organisers**, **Desk Lamps** and **Desk Nameplates & Signs**; these are taxonomy examples, not guaranteed live inventory.
- Submit/search remains available during slow or failed suggestion fetches. Do not treat suggestions failure as full-search failure.
- Candidate fetch behaviour: after 2 characters, debounce around 200–300 ms, cancel/ignore outdated responses, apply short response timeouts and server-side rate limiting. Exact thresholds need performance testing.
- Use text-only rows at launch; avoid fake popularity/trending indicators, recent-query persistence or inferred stock.
- Implement semantic accessible combobox/listbox only if all required keyboard semantics are supported, including arrows, Enter, Escape, active descendant and announcements. Otherwise prefer simpler accessible links and standard text-input semantics.
- Closing the overlay restores focus unless navigating. Escape may first close an active suggestion list and then the overlay. Respect 200% zoom, reduced motion and mobile keyboard viewport.

## 2026-10-24 — Search results page refinement (WEB-040: PROPOSED)

### Page anatomy
1. Heading: `Results for “{query}”`, editable search input, accurate result count when available.
2. Filtering and sorting controls above the **Functional Grid** (WEB-031). On mobile, filters can open a clearly labeled accessible panel; selected filters should be visible as removable chips with a Clear All control.
3. Product cards with stable image frames, title, price **only where appropriate**, and truthful commerce mode: ready stock, made-to-order or quote-only. No editorial masonry on results.
4. Pagination or Load More: choose after testing performance and accessibility; don't commit to infinite scrolling by default.
5. Preserve query, filters and sort in a deep-linkable URL and browser back/forward history; avoid private customer data in URLs.

### Proposed launch filters
- **Category:** the six approved catalogue categories; only offer filter choices meaningful for current indexed products.
- **Product type:** derived from canonical taxonomy and filtered by category when applicable; do not expose all 43 types as a giant static menu.
- **Price range:** only if actual numeric prices are available and comparable; quote-only products must not silently disappear without an explicit handling rule.
- **Availability / purchase mode:** ready stock, made-to-order, quote-only; label these as purchase modes rather than claiming real-time inventory if not verified.
- **Material:** only if material attributes are consistently structured and populated; don't index guessed materials from marketing copy as authoritative facets.
- **Collection:** optional later if collection tagging is maintained and useful; not a mandatory launch filter.
- **Colour, dimensions, style:** defer until catalog data quality and shopper needs justify them.
- Never display zero-value filters as functional choices without an intentional disabled-state explanation.

### Proposed sorting
- **Default: Relevance**, with exact/strong title and product-type matches above weaker category/tags/description matches. Test with real product data and queries.
- **Price low/high:** only for products with comparable numeric selling prices; define a transparent policy for quote-only and variable-price products first.
- **Newest:** only if a trustworthy publication timestamp exists.
- Do not invent popularity, best-selling or review-score ranking without sufficient real data.
- Exact weighting, synonyms, misspellings, plural/singular handling and transliteration are test decisions, not approved algorithm requirements.

### Empty, loading and failure states
| State | Required user-facing handling (proposed) |
|---|---|
| Blank query | Keep search overlay discovery links; don't present a fake “0 results” page. |
| Loading | Keep query and controls stable; reserve card space to prevent layout shift. |
| Matches | Accurate count where available, matching products, active filters and sorting. |
| No matches | Say no matching products; preserve query; allow clear filters, edit query and visit genuine category pages. |
| Filtered to zero | Distinguish “no matches for these filters” from no matches for the query; show Clear Filters. |
| Suggestion fetch fails | Keep text input and Enter-to-search usable; avoid false “no matches”. |
| Search request fails | Explain that results couldn't load, offer Retry, preserve query and filters; do not show a false zero count. |
| Unavailable or unpublished product | Do not expose unpublished listings; for published temporarily unavailable items, display accurate status if intentionally included. |

### Acceptance tests before release
- Query escaping/encoding, injection resistance, authorization for unpublished products, URL state, stable pagination, race conditions, result count accuracy.
- Keyboard-only, mobile/touch, screen reader, 320px width, 200% zoom, 400% text zoom/reflow as applicable, visible focus and non-colour-only filter states.
- Real catalogue queries and common misspellings, response time on slow network, graceful backend failure.
- No promise of comprehensive fuzzy search or semantic AI search at launch.

### Next decision to make individually
**WEB-040A — Initial filter scope:** (A) Essential: Category + Product Type + Purchase Mode, with Price added only for priced results; (B) Minimal: Category + Purchase Mode; (C) Expanded: also Material/Collection from day one where structured. The results layout and ranking proposals remain open until reviewed.

**Cart interaction (WEB-038) stays DEFERRED.**

## 2026-10-24 — Minimal launch filters approved (WEB-040A)

**LOCKED:** The launch search results filter scope is **Category + Purchase Mode only**. This supersedes the earlier WEB-040A options and the wider filter list in the historical proposal above. Do **not** introduce Product Type, Price Range, Material, Collection, Colour, Style or Dimensions as launch filter controls without a later explicit decision. Product types can still be searchable, suggested and represented in product data; they are simply not a launch **filter**.

- **Category**: use the six canonical categories from `docs/catalogue/taxonomy.md`, and show only meaningful published-product choices; avoid zero-result or misleading facets.
- **Purchase Mode**: use truthful distinctions **Ready Stock**, **Made to Order**, **Quote Only**. These are commerce workflows, not stock guarantees; Ready Stock must use current inventory checks and quote-only must not masquerade as purchasable stock.
- Filtering is optional and can be combined; preserve query and filters in the URL. Make active filters removable, with Clear Filters.
- If a filter is unavailable due to missing catalogue data, do not infer or fabricate its value.
- Desktop can use a restrained control row; mobile may use an accessible filter sheet/drawer. Exact control style and filter counts remain to be tested.
- Do not confuse the chosen **filter scope** with the separate **sorting policy** decision.

### Refined results and sorting proposals (WEB-040: NOT YET LOCKED)
- **Results structure**: query heading, editable search, accurate count when available, two filters (Category and Purchase Mode), a clearly labeled sort control if more than one sort is supported, Functional Grid, stable pagination/load-more strategy, and meaningful product purchase-state labels.
- **Ranking default proposal**: Relevance, starting with exact/strong product title and canonical product-type matches, then category, tags and description; evaluate real queries and prevent repeated keywords from gaming relevance. A published product should appear only once even if it belongs to secondary discovery categories.
- **Sorting candidates**:
  - **A: Relevance only (leanest)**. Best default when the catalogue is small and products have mixed pricing models.
  - **B: Relevance + Newest (recommended conditionally)**. Newest only if publication timestamps are reliable; maintain relevance as default.
  - **C: Relevance + Newest + Price ascending/descending**. Price sorts need explicit handling for quote-only and variable-price products, otherwise the control misleads.
- **Avoid** popularity, top-rated, best-selling or trending ranking without reliable source data.
- **Blank query**: show real curated discovery links in overlay; no misleading empty search results count.
- **True no-match**: retain query, suggest editing it or visiting actual categories; do not fabricate product suggestions.
- **Filtered-empty**: retain query and display “No results with these filters”; show Clear Filters.
- **Suggestion service unavailable**: input and Enter-to-search still work.
- **Full search failure**: show Retry and preserve query/filter state; never say “0 results” for an error.
- **Loading**: reserve layout space, keep controls stable, avoid flicker; suppress stale responses.
- **No published catalogue matches**: distinguish a genuinely empty catalogue from a broken search index; provide legitimate category exploration without implying stock.
- **Testing**: keyboard/screen reader, mobile reflow/zoom, filter labels, route encoding, published-only access, URL back/forward, slow network, no results and network failure.

**Next independent decision:** choose sorting scope A/B/C. Detailed relevance weights, result pagination and final empty-state copy remain PROPOSED. **WEB-038 cart interaction remains DEFERRED.**

## 2026-10-24 — Sorting policy approved (WEB-040B)

**LOCKED:** Search results support four sort modes: **Relevance (default)**, **Newest First**, **Price: Low to High**, and **Price: High to Low**. Supersedes the earlier A/B/C sorting options. Price sorting is **not** a Price Range filter: WEB-040A remains **Category + Purchase Mode only**.

**Required safeguards, subject to implementation validation:**
- Newest uses a trustworthy published-at timestamp, not product creation/edit time; ensure deterministic ties and sensible behavior for backdated or unpublished records.
- Price sorting uses authoritative, customer-facing comparable amounts in the same currency and price basis. Do not rank by a fabricated zero, quote placeholder, arbitrary SKU variant, crossed-out MRP, or an unrelated deposit.
- Mixed fixed-price, variable-price, made-to-order and quote-only products require an explicit product rule before shipping price sorts. The user has approved the presence of price sorting, **not** the handling of unpriced products.
- Apply the selected sort consistently across the entire result set **before pagination**. Avoid sorting only currently loaded cards.
- Keep sort and the two filters in the URL so refresh and back/forward navigation preserve state. The sort control is separate from filtering.
- Avoid popularity/reviews/best-selling sorting without verified data.

### Proposed relevance ranking (WEB-040, not locked)
1. Published, searchable records only; deduplicate each product across category/cross-listing paths.
2. Normalize query and searchable fields safely (case, whitespace, punctuation, basic singular/plural where reliable).
3. Prioritize exact product-title match and exact canonical product-type match; then strong title phrase/token matches; then category and curated tags; then weaker description matches.
4. Keep published-product results distinct from category/type navigation suggestions. Do not boost a product because it appears in multiple discovery categories.
5. Avoid keyword-stuffing effects, random tie ordering or paid/promotional ranking disguised as relevance. Deterministic ties can use stable publication date then ID.
6. Test real queries, synonyms, typos, language variations and false positives before choosing numeric field weights. No semantic/AI search obligation at launch.

### Proposed result states (WEB-040, not locked)
- **Blank query:** show curated discovery inside search overlay, no fabricated 0-results page.
- **Loading:** preserve query, active filters and sort; reserve product-card space, ignore stale responses.
- **Matches:** show accurate count if available, Functional Grid and truthful purchase-mode labels; maintain sort across pages.
- **No matches:** clearly say no published matches for the query, preserve it and offer legitimate category exploration.
- **Filtered to zero:** distinguish from query with zero matches; provide Clear Filters while preserving query and sort.
- **No comparable prices:** do not present a misleading price ranking or zero price; offer a clear message or disabled state where appropriate (specific treatment awaits approval).
- **Search service failure:** error + Retry, preserve query/filters/sort; never present failure as zero matches.
- **Suggestions service failure:** keep Enter-to-search available, independent of live suggestions.
- **Outdated product status:** only display stock/price/purchase mode confirmed by backend; never infer inventory from taxonomy.

### Next decision: WEB-040C — Price sort treatment for unpriced products (OPEN)
A. **Priced first, unpriced afterward (recommended):** Price Low/High sorts comparable published prices in requested order; unpriced/quote-only remain visible in a clearly labeled separate section after priced results. For both directions, unpriced stay after. Product count and filters include both.
B. **Price sorts only priced products:** explicitly show an exclusion notice and link/control to see unpriced results; avoid silently hiding quote-only products.
C. **Disable price sorts in mixed-result searches:** only enable when all returned products have comparable prices; safest mathematically but inconsistent customer experience.

**Unresolved even after WEB-040C:** how to represent variable-price variants and “starting at” prices, price/tax basis, pagination approach, exact relevance weights and final result-state copy. **WEB-038 cart interaction stays DEFERRED.**

## 2026-10-24 — Price sorting: priced first, unpriced afterward (WEB-040C)

**LOCKED:** For both Price: Low to High and Price: High to Low, products with a valid, comparable published selling price are sorted in the selected direction **first**. Unpriced and quote-only products remain visible **after** priced products, clearly distinguished as a separate unpriced/price-on-request group. This applies to the entire matching result set before pagination, not just the visible page. Neither missing prices nor quotes may be treated as ₹0. All matching published products count toward the result total. Category and Purchase Mode filters remain unchanged.

**Design/implementation guardrails:**
- Maintain a truthful group label such as **Price on request**; the exact copy is proposed, not yet approved.
- A mixed-price result set must not quietly exclude quote-only products. For both ascending and descending price sort, the unpriced group stays last.
- If all matches are unpriced, display them normally with a clear explanation that no comparable numeric prices exist; don't manufacture an ascending/descending order.
- Use stable deterministic ordering within the unpriced group (proposed: relevance, then stable product ID); do not invent a price.
- Preserve selected sort, query, Category and Purchase Mode in URL and browser history; preserve global sort ordering across pagination.
- Ensure result counts and any screen-reader status message include both groups without implying all have prices.
- A quote-only product with a displayed indicative estimate is **not automatically** a comparable selling-price item. Eligibility requires an explicit, reliable price-basis rule.

### Next independent decision: WEB-040D — Variable-price product basis (OPEN)
A. **Starting-at price (recommended, with strict conditions):** use the minimum currently purchasable published variant's customer-facing price, labelled **From ₹X**. The cheapest variant must genuinely be available for the selected purchase mode; quote-only and unpriced products remain in the unpriced group. Consider taxes and currency consistency before implementation. Advantages: shoppers can compare entry prices. Caveat: low-end variants can distort perceived cost.
B. **Default-variant price:** sort using a clearly defined purchasable default variant and show its exact price or **From** only if appropriate. Advantages: consistent with initial PDP selection. Caveat: default may not be cheapest, and choosing defaults becomes merchandising-sensitive.
C. **Exclude variable-price products from priced group:** keep them in the unpriced/variable-price section unless they have a single exact published price. Advantages: least misleading. Caveat: products with valid price ranges lose useful price ranking.

**Not yet locked:** variable-price sort basis, whether to show ranges, tax-inclusive/exclusive basis, handling promotional prices and currency conversion, numeric relevance weights, exact no-results copy and pagination mode. Price sorting itself and priced-first grouping are locked. **WEB-038 cart interaction remains DEFERRED.**

### Search result state refinement (WEB-040: PROPOSED)
| State | Proposed display and recovery |
|---|---|
| Mixed price sorting | Clearly separate priced and unpriced results; same global sort across pages; truthful total count. |
| All results unpriced | Show matching products and an explanation; don't claim a numeric ranking. |
| No query matches | Preserve query, show no matches, genuine category exploration, edit search. |
| Filters eliminate matches | Keep query/sort; show clear-filters action; do not report search engine failure. |
| Request failure | Show Retry while retaining query, filters and sort; never present a false zero count. |
| Loading or stale response | Keep structure stable, ignore superseded requests and avoid stale counts. |
| Published item loses price eligibility | Recompute grouping and order on the backend; don't keep stale price sort keys. |

**Relevance ranking remains proposed:** exact title/type matches before strong title phrases, then category/tags, then description, with stable deduplication and tie-breaks. Validate using published catalogue queries before selecting numeric weights.

## 2026-10-24 — Starting-at Price approved (WEB-040D)

**LOCKED:** For products with multiple priced variants, the customer-facing search card and price sort use **the lowest currently purchasable published variant's comparable price**, presented as **“From ₹X”** (or equivalent localized currency). The sort key and the visible starting price must derive from the **same eligible variant and pricing basis**. Supersedes WEB-040D OPEN and alternative default-variant/unpriced-only options.

**Eligibility and integrity requirements:**
- Include only published, active, customer-selectable variants that can genuinely be purchased through the applicable selling mode at the displayed base configuration. Do not use discontinued, disabled, draft, quote-only, non-purchasable, or unavailable variants to manufacture an attractive entry price.
- Required configuration charges must be included in the comparable starting price; optional upgrades may be excluded if clearly optional. No hidden mandatory charge should invalidate the entry price.
- If there is only one eligible price, show the exact price rather than misleading “From” unless a valid additional price variation exists. If no eligible numeric price exists, put the product in the **unpriced/price-on-request group** under WEB-040C.
- For price ascending and descending, compare the same normalized amount for each product, across the full matching result set before pagination; unpriced products follow both directions.
- Backend is authoritative for price, variant eligibility, stock/purchase mode and currency. Recalculate on changes; do not cache stale minimums as immutable product fields. Validate price/availability again at product selection and checkout.
- Quote-only products with estimates remain unpriced for sort purposes unless a separately approved rule makes the price a binding comparable offer.
- Never imply the “From” variant is currently available if it is not. If stock/fulfilment rules change, update the minimum or fall back to the unpriced group. The exact treatment of backorderable variants must be specified separately.

### Price display refinement (WEB-040E: PROPOSED, NOT LOCKED)
- Search cards: fixed-price item **₹X**; genuine variable-price item **From ₹X**; quote-only **Request Quote** or **Price on request**. Do not display a fake ₹0 or “From” for quote-only.
- Product detail page should disclose actual selectable variants, corresponding prices and any required configuration charges before purchase; optionally show a **₹X–₹Y** range where helpful, but range vs “From” on cards remains unapproved.
- Promotions: a discounted minimum may be used only if the discount is actually available to that shopper for the eligible variant, effective at the current time and not dependent on undisclosed conditions. Prefer excluding coupon-dependent/member-only prices from general public search sort until policy is approved.
- Price basis must be consistent between search cards, sorting, product pages and checkout; do not mix tax-inclusive and tax-exclusive amounts or different currencies in a single sortable set.
- For India-facing consumer shopping, **recommended for consideration**: customer-facing tax-inclusive displayed selling price with tax breakup where appropriate in checkout/invoice. This is a **proposal**, not an approved tax/legal position; validate against applicable GST, product-specific and invoicing rules before release. Shipping, customization and location-dependent charges need separate disclosure and consistent calculation.
- “From ₹X” means a real purchasable entry configuration, not a marketing anchor.

### Refined search result states (WEB-040: PROPOSED, NOT LOCKED)
| Situation | Proposed UX |
|---|---|
| Fixed and variable priced products | Display ₹X or From ₹X truthfully; sort using comparable eligible price and keep labels in sync. |
| Mixed priced and unpriced | Priced products first, quote-only/unpriced after, clearly labeled; include all in total count. |
| Lowest-priced variant becomes unavailable | Recompute to next eligible variant; if none, move to unpriced group; avoid stale price cards. |
| All results unpriced | Show products with Price on request labels and an explanation; never imply numeric price order. |
| No matches before filtering | Show no matches for the query; preserve input, provide genuine category navigation. |
| Filters yield zero | Distinguish from no-query-match; preserve query/sort, show Clear Filters. |
| Search backend error | Retain query, filters, sort; show Retry, not zero results. |
| Suggestion service error | Enter-to-search continues working; avoid false “no suggestions means no products.” |
| Loading or superseded requests | Keep card geometry stable; cancel/ignore stale responses and counts. |
| Currency or tax basis cannot be compared | Avoid a misleading numeric order; report or segregate appropriately pending explicit basis rules. |

**Next one-at-a-time decision: WEB-040E — Customer-facing price/tax display basis.**
A. **Tax-inclusive display (recommended for India-facing consumer storefront, subject to compliance review):** card price and “From” include applicable product taxes, with checkout/invoice breakup and shipping disclosed separately.
B. **Tax-exclusive display with explicit label:** show “₹X + applicable taxes” throughout cards/results/PDP; calculate taxes clearly before order confirmation, subject to legal review.
C. **Tax basis by product/market:** different displays depending on market/product, only with strict visible labeling and normalized sorting; highest risk of inconsistent comparisons.

Do not interpret choosing the starting-at variant basis as approval of tax inclusion, shipping treatment, promotion rules, price ranges, or rounding. **WEB-038 cart interaction remains DEFERRED.**

## 2026-10-24 — Tax-inclusive customer-facing prices approved (WEB-040E)

**LOCKED:** Tavistra's India-facing consumer storefront presents product selling prices **inclusive of applicable product taxes** on search results, product cards and product detail pages. The approved **Starting-at Price** (WEB-040D) uses the lowest currently purchasable published variant's **tax-inclusive customer-facing price**. Search price sorting must compare the same consistent tax-inclusive price basis that customers see. This supersedes the previous WEB-040E OPEN alternatives; does not approve any specific GST rate or tax classification.

**Scope and safeguards:**
- **Fixed price:** show the tax-inclusive selling price, e.g., `₹X`. **Variable priced:** show `From ₹X` based on an eligible, actually purchasable variant, including its applicable product taxes and unavoidable configuration charges. **Quote-only:** show `Request Quote` or `Price on request`, without fabricating a numeric amount.
- Clearly communicate the inclusive-tax basis, e.g., `Inclusive of applicable taxes` in the relevant price context. Exact copy, repetition frequency and typography remain PROPOSED.
- On checkout/order review and invoice, disclose a compliant breakdown of taxable product value and applicable tax components/rates where required. The breakdown must reconcile mathematically with the already displayed tax-inclusive product price, subject to the final address, transaction and applicable rules.
- Tax calculation requires validated SKU/product classification, place of supply, GST treatment, rounding and invoicing rules. **No GST percentage, HSN classification or CGST/SGST/IGST split is locked by this design decision.** Compliance and accounting review are required before production.
- Show delivery separately from the product price unless an explicitly approved product offer includes delivery. Do not label delivery free until verified for the actual order. Never add product GST twice at checkout.
- Ensure shipping charges and any tax treatment on delivery are calculated and disclosed before order confirmation; tax-inclusive **product** price alone is not necessarily the full payable order total.
- Any mandatory personalization/finishing/configuration charge that is unavoidable for the lowest eligible variant must be included in its starting price. Optional extras can be itemized separately with clear selection.
- For promotional pricing, market-specific taxes, destination-dependent charges and currencies, ensure the displayed starting price and sort key remain aligned. If a reliable comparable amount cannot be calculated, do not invent one or sort using a contradictory basis. Promotions and multi-market rules need later decisions.
- For price sorts, priced products precede unpriced products for both directions (WEB-040C). No hidden price-filter expansion: Category and Purchase Mode remain the only launch filters (WEB-040A).

### Refined price-breakdown proposal (WEB-040F: PROPOSED)
- **Product card / search:** primary `₹X` or `From ₹X`; short tax-inclusive clarification near the price or in an accessible price information pattern. Quote-only uses an honest quote label.
- **Product detail:** price of selected variant including product tax; required configuration charges already reflected; selected optional extras and delivery treatment clearly distinguishable. Never silently change the base price after selection.
- **Order summary:** product(s) at inclusive price, optional customization, discounts, delivery and any applicable taxes on delivery; itemize or break out included product taxes without adding them again; show **final payable total** before payment authorization.
- **Invoice:** correct tax breakdown, product identifiers, rates and supply treatment as applicable; use accounting-approved rounding, not browser floating-point arithmetic.
- **Delivery estimate:** only show free shipping when eligibility is verified; otherwise use `Delivery calculated at checkout` or a grounded estimate. Avoid surprise mandatory shipping charges after the final review.

### Search result state refinement (WEB-040: PROPOSED)
| State | Proposed UX and system rule |
|---|---|
| Fixed or starting-at price | Render inclusive price from authoritative pricing response, use the same normalized amount for price sorting. |
| Tax or price calculation pending | Preserve card layout; do not render a misleading stale or pre-tax numeric price as final. Retry or clearly indicate that pricing is temporarily unavailable. |
| Address affects final order tax/fees | Recalculate in checkout, explain any legitimate change before order confirmation; don't silently alter accepted totals. |
| Variant becomes unavailable | Recompute lowest eligible tax-inclusive price; if no comparable price remains, move to the unpriced group. |
| Mixed priced and quote-only | Keep priced-first/unpriced-after grouping and accurate total counts for both sort directions. |
| All matches unpriced | Show matching products and quote labels without pretending numerical price order. |
| Query has no matches | Preserve query, offer search edit and genuine category links. |
| Filters yield zero | Distinguish from query zero; preserve query/sort, offer Clear Filters. |
| Search or pricing backend failure | Preserve query, filters, sort; show a clear retry path, never substitute ₹0 or zero results. |
| Loading and stale responses | Reserve card geometry, ignore superseded requests and prevent price/count flicker. |

### Next one-at-a-time decision: WEB-040F — Delivery-charge disclosure timing (OPEN)
A. **Early estimate + final checkout calculation (recommended):** Product/search surfaces say `Delivery calculated at checkout` when location is unknown; once a supported destination is available, show a grounded estimate on PDP/cart, with a verified final delivery charge before order confirmation. Never claim free shipping without eligibility.
B. **Checkout-only delivery disclosure:** Clearly label that delivery is extra/unknown on product surfaces; calculate and show the charge only after delivery address is provided in checkout, before payment.
C. **Pre-checkout delivery estimator required:** Provide destination/pincode estimation on the product detail page before add-to-cart, with final verification at checkout. Greater transparency but added UX and service complexity.

**Not approved yet:** delivery estimator interaction and timing, shipping tax breakdown implementation, exact tax-inclusive microcopy, final result-state wording, pagination and numerical relevance weights. **WEB-038 cart interaction remains DEFERRED.**

## 2026-10-24 — Early delivery estimate + final checkout calculation approved (WEB-040F)

**LOCKED:** Tavistra uses **Early Estimate + Final Checkout Calculation** for delivery-charge disclosure. If a trustworthy supported destination is not available, customer-facing product/search surfaces disclose that delivery is calculated separately (candidate copy: `Delivery calculated at checkout`). Once a supported destination is available, the experience **may show an evidence-based delivery estimate before checkout** on relevant product/detail surfaces. A **verified final delivery charge must be shown before order confirmation/payment authorization**, using the complete delivery address, basket, fulfilment method and applicable rules. An estimate is not a guaranteed final charge. Supersedes the earlier WEB-040F OPEN alternatives. **No specific pincode-entry widget, automatic geolocation, shipping-rate provider or cart interaction is approved.**

### Estimate and final-quote guardrails
- Estimate only from supported inputs: destination (e.g. user-provided pincode or confirmed address), eligible products/variants, quantities, package weight/dimensions if known, shipping origin/serviceability, courier/rate rules and any verified shipping promotions. Do not invent a number when inputs are missing.
- When the estimate is shown, label it **Estimated delivery charge** and distinguish it from delivery **time** estimates. If no trustworthy rate is available, state that the amount will be calculated later rather than displaying ₹0, `Free` or a fabricated range.
- Never imply an estimated charge is binding. Recalculate after full address and order details are known; present the final charge and **final payable order total** before the customer confirms the order.
- If a quote changes because of destination, quantity, packaging, selected service, tax or eligibility, explain the change before payment. An estimate must never be silently promoted into the final charge.
- Free shipping requires a verified offer/eligibility for the current order and destination; never infer it from an empty rate or failed API call.
- If serviceability cannot be confirmed, do not imply delivery is available. Provide a clear unsupported-destination or manual-quote state rather than proceeding with a fictitious charge.
- Large, fragile, handmade, custom or made-to-order objects may need packaging and fulfilment review; do not promise a courier rate or delivery timeline until verified.
- Product prices remain **tax-inclusive** (WEB-040E), while delivery is a separately disclosed charge unless an approved offer includes it. The applicable tax treatment of delivery, invoicing and rounding requires compliance validation; do not double-charge taxes.
- Recompute delivery if address, quantities, variants, promotions or shipping method change; expire stale quotes and ensure backend authorization for the final charge.
- Keep delivery estimation non-blocking for search results and do not request precise location without an explicit UX/privacy decision. Search result ordering remains based on tax-inclusive **product price**, not product-plus-delivery, unless separately approved.
- No delivery estimator interaction, checkout layout or cart drawer/page design is implied by this approval. **WEB-038 stays DEFERRED.**

### Proposed display breakdown and disclosure (not locked)
| Surface | Candidate behaviour |
|---|---|
| Search product card | Show product tax-inclusive ₹X / From ₹X; a restrained `Delivery calculated separately` note only where useful, not a fake per-product shipping price. |
| Product detail, no supported destination | `Delivery calculated at checkout`; no invented cost or ETA. |
| Product detail, supported destination | `Estimated delivery: ₹X to [destination]` if rate confidence is sufficient; otherwise a clear unavailable/quote-required message. Label monetary delivery cost separately from delivery date. |
| Checkout review | Product inclusive totals, eligible options/customization, discounts, verified delivery charge and any applicable delivery tax, with one final payable amount. Disclose applicable included product taxes without adding them again. |
| Rate change | Explain revised delivery charge and refresh final total before order confirmation. |
| Rate/serviceability failure | Retry or manual review where supported; never show ₹0 or proceed on an unverified rate. |

### Search result state refinements (WEB-040: PROPOSED)
- Search results must work even when shipping destination is unknown or estimation is unavailable; avoid delivery API calls per search card as a launch dependency.
- Product pricing/search sorting continue to use eligible tax-inclusive product prices, with priced products first and unpriced/quote-only afterward; do not fold speculative delivery charges into sort keys.
- If a delivery estimate is pending, show a non-blocking pending state on the relevant product/detail surface; preserve product information and navigation.
- If a delivery estimate fails, show `Delivery estimate unavailable` and a supported retry/manual alternative; do not turn the product into a no-results state.
- If a destination is unsupported, distinguish `Delivery not available to this destination` from a transient network failure; only claim non-serviceability on confirmed evidence.
- On address/variant changes, invalidate outdated estimates and prevent stale response races; announce updated cost accessibly where appropriate.
- Search blank/no-match/filtered-zero/loading/backend-failure states remain distinct, with query/filter/sort persistence and honest counts. Exact copy and ranking weights remain proposed.

### Next one-at-a-time decision: WEB-040G — How to obtain destination for early estimate (OPEN)
A. **Optional pincode entry on product detail (recommended):** allow the customer to enter a destination pincode when they want an estimate; never block product browsing or checkout progression solely to get an early estimate. Revalidate against the full address at checkout.
B. **Known destination only:** show early estimates only when a destination was already voluntarily provided through an existing session/account/checkout flow; otherwise disclose checkout calculation. Do not assume or silently infer precise location.
C. **Optional sitewide delivery-location selector:** allow a shared destination setting reused across relevant product pages, with explicit editing and privacy/retention rules; greater implementation complexity.

Not yet approved: pincode UI/location collection, estimate rate-source/provider, caching/expiry duration, delivery tax mechanics, exact microcopy, search pagination, relevance weights or final result-state design. **WEB-038 cart interaction remains DEFERRED.**

## 2026-10-28 — Optional product-detail pincode entry approved (WEB-040G)

**LOCKED:** Tavistra product detail pages provide an **optional customer-entered delivery pincode** to request an early delivery-charge estimate. Customers may browse product details without providing a pincode. A supported, verified delivery quote remains an estimate until the **final checkout calculation** using the full delivery address (WEB-040F). This supersedes the earlier WEB-040G OPEN alternatives (known destination only or sitewide location selector). It does **not** authorize precise-device geolocation, an automatic sitewide location setting, retention of entered pincodes, or a specific estimate trigger.

### Estimation interaction refinement (PROPOSED; WEB-040H OPEN)
- Present a clearly labelled six-digit Indian pincode field on eligible product detail pages, with numeric-friendly mobile keyboard, text input semantics (leading zeroes preserved), appropriate autocomplete if applicable and a descriptive accessible name. A six-digit format is a syntactic check, **not proof of serviceability**.
- Keep the field optional and non-blocking. The exact trigger (explicit Check button vs automatic after a valid pincode) is unapproved.
- Once a request is made, include product/eligible variant, quantity where applicable, destination pincode, known package characteristics, fulfilment origin and service rules; backend must validate all inputs. Do not request a courier rate on every search card.
- Present cost as **Estimated delivery charge: ₹X** only when the source provides a valid, applicable quote. Show estimated delivery date/time only when independently supported and clearly distinguish it from cost.
- The user can edit the pincode and request a new estimate. Invalidate previous quotes when pincode, variant, quantity, packaging, origin or rate eligibility changes; discard stale/out-of-order responses.
- Reconfirm serviceability and calculate the **final** delivery amount at checkout with full address, actual parcel/order composition and tax treatment. If estimate and final charge differ, explain the change before order confirmation.
- Do not claim `Free delivery` from a missing, failed or zero-default response. A genuine ₹0 charge is displayable only when a verified applicable offer/rate confirms it.
- Do not silently persist a customer-entered pincode across pages or sessions without a later explicit privacy and retention decision.

### Serviceability and failure-state matrix (PROPOSED)
| State | Proposed presentation / action |
|---|---|
| No pincode supplied | `Enter pincode to check delivery` plus separate delivery-charge disclosure; browsing unaffected. |
| Incomplete/invalid format | Inline validation explaining six digits; no serviceability request. |
| Valid format, checking | Non-blocking checking state; prevent accidental duplicate requests, retain product information. |
| Confirmed serviceable + valid rate | Show estimated charge and destination pincode, clarify final checkout recalculation. |
| Confirmed serviceable but no rate | Explain rate is not currently available; retry or supported manual quote, **not** free delivery. |
| Confirmed not serviceable | Explicit unavailable-to-pincode message; permit changing pincode; no unsupported order promise. |
| Courier/rate API timeout or error | Explain temporary estimate failure, offer Retry, do **not** label destination unserviceable. |
| Manual review needed | Say estimate requires confirmation; no fabricated charge or arrival date. |
| Product/variant/pincode changes | Mark old estimate invalid immediately, ignore stale responses and re-check if requested. |
| Checkout address differs from pincode | Recompute serviceability, final delivery and payable total before confirmation. |
| Search results unrelated to delivery | Search still works without pincode/rate API; preserve query, filters, sort and genuine result/error states. |

### Next single decision: WEB-040H — Estimate request trigger (OPEN)
A. **Explicit Check button (recommended):** submit a complete six-digit pincode deliberately; avoids premature courier calls and gives a clear keyboard/touch action.
B. **Automatic lookup after valid six digits:** debounce and estimate when the input is complete; fewer taps but more API calls and stale-response handling.
C. **Hybrid:** automatic when a previously validated pincode is edited/known, explicit Check for first entry; more complexity and ambiguous state.

**Still unapproved:** trigger mechanics, provider/source, quote TTL/caching, pincode persistence, exact messages, delivery tax mechanics, search pagination and numeric relevance scoring. **WEB-038 cart interaction remains DEFERRED.**

## 2026-10-28 — Explicit Check button approved (WEB-040H)

**LOCKED:** The optional product-detail pincode estimator uses an **explicit Check button** as its estimate-request trigger. Entering a complete six-digit pincode does **not** automatically call the rate/serviceability backend. The customer intentionally activates Check (or submits the associated form using Enter), and the estimator remains optional for browsing. Supersedes prior WEB-040H OPEN automatic/hybrid alternatives. **WEB-038 cart interaction remains DEFERRED.**

### Input validation and accessible interaction (PROPOSED, not separately approved)
- Treat Indian pincodes as **strings**, retaining leading zeros. Accept six ASCII digits after trimming incidental surrounding whitespace; do not treat valid length as proof of an actual or serviceable pincode.
- Field label: `Delivery pincode`; example helper: `Enter a 6-digit pincode`. Use `inputmode=numeric` with appropriate length/validation semantics and a visible `Check` action. Do not use a number input that strips leading zeroes.
- Keep Check disabled or prevent submission when empty/incomplete; show a specific inline message on attempted invalid submission, associated with the field for assistive technology. Do not show an error merely because the optional field is untouched.
- Keyboard Enter submits the same explicit request; focus indicators, screen-reader status announcements, touch targets and 200% zoom require testing. Do not make blur, typing or product page load invoke shipping APIs.
- While checking, indicate progress and prevent duplicate identical submissions; let the user edit the pincode, invalidating any pending/outdated result. Request IDs or cancellation must suppress stale/out-of-order responses.
- Backend independently validates pincode and rate inputs. Apply reasonable request throttling and avoid exposing courier credentials or pricing formulas in the browser. No automatic device geolocation or silent pincode persistence is approved.

### Rate lookup refinement (PROPOSED)
1. On Check, validate six-digit syntax locally and server-side. Then verify that product/selected variant, quantity, destination and fulfilment data support estimation.
2. Distinguish **serviceability** (delivery possible) from **rate availability** (a reliable cost returned). A serviceable pincode can still lack a current rate.
3. Rate may depend on dispatch origin, packaged weight/dimensions, fragile/custom handling, fulfilment mode, courier eligibility and shipping promotions. Do not promise cost or date without those inputs.
4. If a reliable quote is returned, display `Estimated delivery charge: ₹X` with the checked pincode, and a short reminder that the final delivery charge is confirmed at checkout.
5. Do not convert missing/error values to ₹0, claim free delivery, or mark a pincode unsupported merely because a provider timed out.
6. Revalidate serviceability, final address, order composition and applicable taxes at checkout; the verified final charge must be presented before confirmation.
7. Quote cache/TTL, rate provider selection, courier fallback and persistence remain open. The UI must work with manual or API-supported fulfilment without fabricating live data.

### Delivery feedback states (PROPOSED)
| State | Suggested feedback | Behaviour |
|---|---|---|
| Untouched | `Enter your pincode to check delivery` | Optional; no API call. |
| Incomplete or invalid | `Enter a valid 6-digit pincode` | Inline validation, no lookup. |
| Submitted | `Checking delivery for [pincode]…` | Non-blocking progress; prevent duplicate request. |
| Serviceable and priced | `Estimated delivery charge: ₹X` | Label estimate; final checkout recalculation. |
| Serviceable but rate missing | `Delivery is available, but an estimate cannot be calculated right now` | Retry/manual alternative only if supported; no zero cost. |
| Confirmed unsupported | `Delivery is not available to this pincode` | Permit correction; do not infer from API failure. |
| Rate/provider failure | `Delivery estimate temporarily unavailable` | Retry; don't claim non-serviceability. |
| Manual confirmation required | `Delivery charges require confirmation` | No fictional price/date; do not falsely promise fulfilment. |
| Input or variant changed | Clear old estimate or mark it outdated | Never display previous price as current. |
| Final checkout amount differs | Explain updated delivery charge before confirmation | Show verified payable total; no silent changes. |

### Search-results isolation (WEB-040: PROPOSED)
- No pincode or courier lookup required to display search results, product counts or tax-inclusive price sorts. Do not perform per-card courier calls.
- Search blank, no-match, filtered-zero, loading, product-price-unavailable and backend-failure states remain distinct. Preserve query, Category/Purchase Mode filters and sort across retries.
- An estimator error must never be rendered as a search failure or product unavailability.

### Next independent decision: WEB-040I — Serviceability/rate lookup sequence (OPEN)
A. **Single backend estimate request (recommended):** one `Check` request returns structured serviceability + rate status together, even if the backend internally consults multiple couriers or a rate table. Simplifies the storefront and error states; backend remains responsible for distinguishing unsupported from rate-unavailable.
B. **Two-stage frontend lookup:** frontend calls serviceability first, then rate when supported. More explicit progress, but adds network calls and state/race complexity.
C. **Manual-review-first:** Check records a destination and presents a request-for-confirmation workflow rather than an instant estimate. Appropriate for bespoke objects but weak as the default for small shippable items.

**Still unapproved:** lookup sequence, provider, quote caching/TTL, exact microcopy, persistence, shipping tax calculations, search pagination and numerical relevance scoring. **WEB-038 cart interaction remains DEFERRED.**

## 2026-10-28 — Single backend estimate request approved (WEB-040I)

**LOCKED:** The optional PDP pincode **Check** action makes **one storefront-to-Tavistra-backend estimate request** that returns a structured serviceability and rate outcome. The backend owns pincode validation, product/variant/quantity eligibility, shipping origin and package inputs, provider/rate-table coordination, outcome classification and safe error handling. It may perform multiple internal lookups, but the storefront must not independently chain courier serviceability and rate calls. This supersedes WEB-040I OPEN alternatives (two-stage frontend lookup and manual-review-first as the default). The approved request architecture does not select a courier, guarantee instant rates, or authorize a fallback policy. **WEB-038 cart interaction remains DEFERRED.**

### Backend contract refinement (PROPOSED, not locked)
- Example endpoint: `POST /api/storefront/delivery/estimate` (illustrative only). Input includes pincode **string**, product ID, selected variant/configuration, quantity, and optional supported package/fulfilment context. Server derives authoritative product, origin, packaging, selling mode and provider credentials; never trust client-supplied rates.
- Return a **discriminated status**, not an ambiguous nullable price: `estimated`, `serviceable_rate_unavailable`, `not_serviceable`, `manual_review_required`, `invalid_input`, or `temporarily_unavailable`. Exact API enum naming remains proposed.
- `estimated` requires a nonnegative validated money amount, currency, destination pincode, quote reference/expiry or generated timestamp, source/fulfilment context and explicit **estimate-not-final** status. ₹0 is valid only with an independently verified zero-cost rate/offer, not a default.
- `not_serviceable` requires affirmative trustworthy evidence that the relevant order cannot be delivered to the destination. A provider timeout, empty response, unconfigured courier or missing package data must **never** be interpreted as unsupported destination.
- `serviceable_rate_unavailable` means delivery eligibility is supported but no trustworthy rate can be quoted; `manual_review_required` means eligibility/cost needs human confirmation; `temporarily_unavailable` means a transient technical or provider issue.
- Validation failures should be field-addressable, accessible and not generate courier requests. Internal provider diagnostics stay in server logs, not customer-facing messages.
- Use server-side timeouts, bounded retries, rate limiting, request correlation, safe logging and stale-request protection. Never leak courier API keys, raw provider payloads or customer details.
- Confirm that each quote applies to the requested pincode, selected product/variant, quantity, packaging/fulfilment assumptions and relevant shipping tax treatment. Do not imply an early estimate is the final checkout price.
- Checkout must revalidate the full address, actual order and shipping options and display the verified final delivery charge and payable total before confirmation.

### Proposed frontend feedback mapped to backend outcomes
| Backend outcome | Candidate customer message | Recovery |
|---|---|---|
| `estimated` | `Estimated delivery charge: ₹X to [pincode]` | Explain final checkout calculation; edit pincode |
| `invalid_input` | `Enter a valid 6-digit pincode` | Correct and Check again |
| `not_serviceable` | `Delivery is not available to this pincode` | Edit destination |
| `serviceable_rate_unavailable` | `Delivery may be available, but we cannot calculate the charge now` | Retry or supported manual alternative |
| `manual_review_required` | `Delivery charges require confirmation` | Show genuine contact/quote path only if available |
| `temporarily_unavailable` | `Delivery estimate temporarily unavailable` | Retry; do not claim destination unsupported |
| Request pending | `Checking delivery…` | Prevent duplicate submissions; browsing remains usable |
| Stale after pincode/variant/quantity change | No old amount presented as current | Explicit Check to refresh |

### Provider fallback and reliability refinement (PROPOSED)
- Abstract courier/rate providers behind backend adapters; use structured outcomes and do not conflate a provider failure with universal non-serviceability.
- Before any provider fallback, define eligibility rules for package size/fragility, origin, serviceable destination, price/tax inclusion, COD/prepaid restrictions if applicable and fulfilment commitments.
- Compare only trustworthy, equivalent rates; preserve provider/source and timestamp for audit, and never silently select a rate that cannot actually be booked.
- If all providers fail or return no valid rate, return an honest rate-unavailable/temporary-failure/manual-review status; never fabricate a rate, serviceability or arrival date.
- Monitor error and timeout rates, response latency, quote-to-checkout discrepancies and confirmed non-serviceability false positives. Quote expiry/cache duration and fallback order remain undecided.
- Search results and product-price sorts must not depend on courier APIs or pincode presence.

### Next one-at-a-time decision: WEB-040J — Provider fallback policy (OPEN)
A. **Automatic eligible-provider fallback (recommended):** backend may try another *configured, eligible* courier or verified rate source when the preferred one cannot return a trustworthy estimate. Show a price only when a valid applicable quote exists. This does not approve a particular courier or cheapest-rate selection.
B. **Primary provider only, then clear unavailable state:** simplest and predictable, but a temporary provider issue prevents estimates even if another supported option exists.
C. **Manual fallback after primary provider failure:** do not try another provider automatically; show a supported manual delivery-quote path when a rate cannot be obtained. Adds operational burden.

**Still unapproved:** provider fallback policy, actual courier selection, exact API schema, quote TTL/cache, rate-selection algorithm, persistence, shipping tax implementation, exact UI copy, search pagination and relevance weights. **WEB-038 cart interaction remains DEFERRED.**

## 2026-10-28 — CORRECTION: internal delivery-rate engine; no courier integrations (WEB-040J superseded)

**LOCKED USER CLARIFICATION (authoritative over prior provider-fallback proposals):**
- Tavistra's delivery estimate is calculated **entirely from shipping rates and rules maintained inside Tavistra's application**. There is **no courier provider API connection** and **no live courier rate or serviceability lookup** in the website's shipping-estimate architecture.
- The owner/admin will maintain rates and applicability using factors such as **distance/destination, product or package size, weight, fragility and other fulfilment characteristics**. Exact calculation formulas, zone mapping, minimum charges, surcharges and administrative editing are **not yet approved**.
- The courier is selected **independently during order fulfilment**, potentially from multiple couriers. Customer-facing delivery charges are computed from Tavistra's own policy and **must not be described as a live courier quote**. Actual courier expense can differ from the customer delivery charge.
- **WEB-040I remains LOCKED:** optional PDP pincode + explicit Check triggers **one request to Tavistra backend**, which evaluates internal delivery eligibility and the internal rate table/rules and returns a structured result. The single request is **not** a courier API call.
- **WEB-040F remains LOCKED:** early estimate, then final calculation using the complete checkout address and order; display final delivery charge and payable total before confirmation. Tax-inclusive product pricing (WEB-040E) and priced-first search sorting remain unchanged.
- **WEB-040J provider fallback question is WITHDRAWN / NOT APPLICABLE.** Earlier proposed provider adapters, courier API failures/timeouts, carrier-selection algorithms, provider fallback chains and live courier quote TTL are **superseded** and **must not be implemented**.
- Search results and product price sorts never depend on shipping estimates. **WEB-038 cart interaction remains DEFERRED.**

### Internal shipping engine refinement (PROPOSED)
1. Admin-configured, versioned rules should express destination coverage (pincode or shipping zone), dispatch origin/region, product/package dimensions or volumetric class, weight, fragility/handling class, quantity, and optional minimum/oversize/remote-area charges. **Exact parameters and weights remain open.**
2. A pincode is a **destination key**, not a distance by itself. Any distance-based calculation requires a maintained pincode-to-zone or distance mapping, or another explicitly approved internal data source; do not silently infer road distance from the six digits.
3. Determine eligibility from **Tavistra's own fulfilment policy/coverage rules**, not from whether an individual courier happens to be available. Distinguish unsupported destinations from missing rate configuration.
4. Example response outcomes (proposed): `estimated`, `invalid_pincode`, `destination_not_covered`, `rate_rule_missing`, `manual_review_required`, `calculation_error`. Do not use `courier_timeout` or `provider_unavailable`.
5. Estimate result should include a customer-facing amount/currency, checked pincode, relevant configuration context and internal rate-rule version/identifier for traceability. Show `Estimated delivery charge` only when a complete applicable rule produces a valid amount.
6. Never treat a missing rule as ₹0/free delivery. Zero delivery cost requires an explicit, applicable free-shipping rule.
7. Editing pincode, variant, quantity, packaging or fulfilment attributes invalidates the earlier estimate. Checkout recalculates using the full address, actual basket, current internal rules and any applicable shipping-tax treatment; differences are disclosed before confirmation.
8. Rate-table changes should be auditable, testable with representative destinations and products, and isolated from existing confirmed orders. Admin edit controls and price-change policy need later approval.

### Revised customer feedback states (PROPOSED)
| State | Candidate feedback |
|---|---|
| Empty or malformed pincode | Prompt for a valid six-digit pincode; do not call backend until Check |
| Internal rate found | `Estimated delivery charge: ₹X`; explain checkout finalization |
| Destination outside Tavistra's coverage | `Delivery is not available to this pincode` (only when coverage rules explicitly confirm) |
| Covered destination but no matching rate rule | `Delivery estimate is unavailable for this item and pincode`; request manual review or admin attention where supported |
| Special/oversize/fragile case requires manual handling | `Delivery charges require confirmation` |
| Internal calculation failure | `Unable to calculate delivery right now`; Retry; do not claim destination unsupported |
| Product, pincode or quantity changed | Clear outdated amount; user presses Check again |
| Checkout address differs | Recalculate and show verified final amount before order confirmation |

### Next independent decision (OPEN): WEB-040K — Destination/distance rate basis
A. **Pincode-to-shipping-zone rate matrix (recommended):** admin maps destination pincodes/ranges to zones and combines zone with size, weight and fragility; straightforward to operate without external APIs.
B. **Admin-maintained distance bands:** internally maintained origin-to-destination distance lookup/bands combined with package factors; more granular, greater data-maintenance burden.
C. **Hybrid zones + special distance surcharges:** zone matrix as baseline, with explicitly configured exceptional/remote distance adjustments; more flexible but more complex.

Do not assume any of these distance methods is approved. **WEB-038 cart interaction remains DEFERRED.**

## 2026-10-28 — Admin-assigned presumptive kilometres by pincode/range (WEB-040K)

**LOCKED:** The destination/distance reference for Tavistra's internally managed shipping calculator is an **administrator-maintained presumptive kilometres value mapped to an individual six-digit Indian pincode or a pincode range**. These are **pricing-reference kilometres**, not verified route/road kilometres. There is no live geocoding, distance API or courier integration. The owner maintains the mappings in Tavistra. This supersedes the earlier WEB-040K OPEN zone-vs-distance alternatives.

**LOCKED CONTINUITY:** WEB-040G optional PDP pincode; WEB-040H explicit Check; WEB-040I single Tavistra-backend request evaluating internal data; WEB-040F final delivery charge recalculated and disclosed at checkout; courier chosen independently during fulfilment. **WEB-038 cart interaction DEFERRED.**

### Distance-map implementation refinements (PROPOSED)
- Suggested fields: `origin_id` (future-compatible), `pincode_start`, `pincode_end` (equal for exact pincode), `presumptive_km` (nonnegative numeric), `coverage_status` (covered/unsupported/manual review), `active`, `effective_from`, `effective_to`, `rule_version`, `updated_by`, `updated_at`. Exact schema not approved.
- Preserve six-digit pincodes as strings, including leading zeroes. Range matching is inclusive and based on six-digit values; **numeric proximity of pincodes does not imply geographic proximity**. Admin must explicitly verify and curate range assignments.
- Proposed deterministic resolution: exact pincode overrides a broader range; among applicable ranges, the most specific wins, with equally specific overlaps rejected at save/publish time. Never silently select an arbitrary overlapping rule.
- Consider origin-dependent distances because 500 presumptive km from one dispatch location may not equal 500 km from another. Multi-origin behaviour is unapproved.
- A missing mapping means **not configured**, not **delivery unavailable**. Confirmed unsupported destinations require an explicit coverage rule.
- Admin bulk import/export, range validation, preview/test pincode and audit history are proposed to keep the data maintainable.
- At Check, Tavistra backend resolves pincode to presumptive km, then applies internal pricing rules using applicable weight, dimensions/volumetric measures, fragility and handling characteristics. **No per-km charge formula or rate thresholds are approved yet.**
- Keep the matched distance rule/version in calculation records; checkout recalculates from actual order and address, disclosing any change before confirmation.
- Customer-facing UI should show **estimated delivery charge**, not a purported exact route distance. Showing presumptive kilometres to customers is not approved.

### Next independent decision: WEB-040L — Distance component of delivery charge (OPEN)
A. **Distance bands (recommended):** admin assigns a charge to ranges of presumptive km (e.g. 0–50, 51–200, 201–500); package factors are additional configurable components. Easier to audit and less sensitive to approximate distances.
B. **Base charge plus per-kilometre:** admin sets base fee and ₹/km (possibly thresholds), with weight/size/fragility adjustments. More granular, but approximate km can create arbitrary differences.
C. **Hybrid band + extra-km surcharge:** base charge per band, extra-km only beyond a defined threshold; more control but greater complexity.

**OPEN:** exact kilometre-to-price formula, bands/thresholds, handling/weight surcharges, overlap resolution policy, dispatch origins, tax treatment and final UI copy. **WEB-038 cart interaction DEFERRED.**

## 2026-10-28 — Distance bands approved (WEB-040L)

**LOCKED:** Tavistra converts admin-assigned presumptive kilometres (WEB-040K, exact pincode or pincode range) into a delivery-pricing **distance band**, with an administrator-maintained base charge for each applicable band. The distance component is **not** a continuous ₹/km formula or a hybrid extra-km surcharge. Exact kilometre thresholds and rupee charges are **not approved**. The customer-facing price is Tavistra's internal delivery charge, not a live courier quotation. WEB-040F/G/H/I remain locked; no courier/map APIs; independent courier assignment at fulfilment. **WEB-038 cart interaction remains DEFERRED.**

### Proposed rate-calculation pipeline (not locked)
1. Resolve destination pincode to internal presumptive km mapping. If no mapping exists, report **missing configuration**, not unsupported destination; only explicit coverage rules can establish non-serviceability.
2. Select one applicable **non-overlapping distance band** with a configured base delivery charge. Admin validation should prevent gaps, overlaps, reversed boundaries and negative prices; whether all distances must be covered is open.
3. Obtain product-specific **packed** weight and dimensions, not bare product dimensions when packaging materially changes shipping size. Calculate actual weight and optionally volumetric weight using an **admin-configurable divisor** (not fixed or courier-dependent).
4. Compute chargeable-weight adjustment using an approved future policy: actual weight only, greater of actual/volumetric, or a category-based alternative. Avoid double-charging the same volume factor through both volumetric weight and an oversized surcharge; only apply extra size fees for separately justified handling constraints.
5. Apply optional product/packaging handling class such as normal, fragile, oversized or special handling. Fragility surcharge may be fixed, percentage or bracketed only after approval; never assume all decor is fragile.
6. Apply an administrator-defined **minimum delivery charge floor** to the relevant pre-tax or tax-inclusive amount only after its tax basis and sequencing are defined. Distinguish a deliberate verified free-shipping rule from missing data; do not silently override explicit eligible promotions.
7. Validate all required rate inputs and return a structured estimated/uncovered/missing-rule/manual-review/calculation-error outcome. Final checkout recalculates with complete address and actual order; show final amount before confirmation.

### Rate factors and edge cases (PROPOSED)
| Component | Candidate administrative settings | Unresolved design |
|---|---|---|
| Distance bands | Inclusive lower/upper presumptive km, base charge, active dates/version | Thresholds and prices |
| Weight | Packed weight in kg, brackets or incremental adjustment | Actual vs volumetric chargeable weight |
| Dimensions | Packed L/W/H in cm, volumetric divisor, oversize limits | Surcharge basis, package-level vs item-level |
| Fragility | Normal/fragile/special class, fixed or percentage surcharge | Classes, stacking, packaging and amount |
| Minimum charge | Configurable floor, scope and exceptions | Pre-/post-tax basis and promotion precedence |
| Missing packed measurements | No invented estimate; manual-review or unavailable status | Default/required data policy |
| Multiple items | Potential consolidated package or separate packages | Aggregation rules and cart interaction explicitly deferred |
| Manual/quote-only goods | May require delivery quote rather than instant charge | Eligibility and final handling |

**Example only, not a tariff:** 0–50 km, 51–200 km, 201–500 km could each have an independently configured base price. Actual band limits, prices and surcharges remain open.

### Next independent decision: WEB-040M — Chargeable weight basis (OPEN)
A. **Greater of actual and volumetric packed weight (recommended):** calculate both and use the larger, with configurable volumetric divisor; appropriate for lightweight bulky objects but requires reliable package measurements.
B. **Actual packed weight only:** simplest, but may underprice bulky low-density objects; separate oversized rules would be needed.
C. **Product-class-specific basis:** some classes use actual weight and others max(actual, volumetric), with extra admin complexity.

**OPEN:** chargeable-weight policy, exact band thresholds/tariffs, dimensional divisor, fragility and minimum charge formulas, order aggregation, tax treatment and UI microcopy. **WEB-038 cart interaction remains DEFERRED.**

## 2026-10-28 — Customer-facing two-component price presentation clarified

**LOCKED (WEB-040N):** Tavistra's customer-facing pricing shows only **(1) an all-inclusive product price** and **(2) a delivery charge, if applicable**. Product price already absorbs product packaging and handling costs and applicable product taxes (consistent with WEB-040E). Do **not** expose separate packing, chargeable-weight, dimensional, fragility, handling or minimum-charge line items. Such internal pricing factors, if eventually used to compute delivery, must be incorporated into the single delivery-charge amount rather than billed as extra visible fees. Show the final total payable before checkout confirmation and avoid double recovery of costs already included in the product price. Delivery-related tax treatment remains subject to verification and must be reflected accurately in the disclosed delivery charge and invoice; this is not an approval of a specific GST method.

**Clarification on WEB-040M:** the prior actual-vs-volumetric-weight question is **not a customer-facing price-component decision** and must not be forced into checkout UI. Whether weight, dimensions or fragility influence the *internal delivery charge* remains **OPEN**; user has confirmed they are not separately displayed, but has not yet explicitly ruled out their internal use. Existing WEB-040L distance bands remain LOCKED. No courier APIs. **WEB-038 cart interaction DEFERRED.**

### Next one-at-a-time decision: WEB-040O — Internal delivery-charge factors (OPEN)
A. **Distance bands only:** one delivery charge from pincode's presumptive-km band; weight/dimensions/fragility remain part of product pricing and operational fulfilment, not delivery-rate calculation.
B. **Distance bands with internal shipment adjustments:** use band base charge plus internal weight/dimensions/fragility adjustments where appropriate, then show **one combined delivery charge**; no separately itemized add-ons.
C. **Distance bands with manual exceptions:** standard band charge, but exceptional oversized/fragile shipments require a manually confirmed single delivery charge.

Do not assume which model is approved. No customer-facing packaging or weight fee. **WEB-038 DEFERRED.**

## 2026-10-28 — Distance bands with internal shipment adjustments approved (WEB-040O)

**LOCKED:** Delivery is priced from the administrator-configured distance-band base charge (WEB-040K/L) **plus applicable internal shipment adjustments** for factors such as packed weight, packed dimensions/oversize and fragile/special transport handling. The result is **one customer-facing delivery charge**, if applicable, alongside **one all-inclusive product price** (WEB-040N). Packaging and ordinary product handling are already in the product price; do not itemize separate weight, packing, dimensional or fragility fees to the customer, and do not recover the same cost twice. This supersedes the WEB-040O OPEN alternatives (distance-only and manual-exceptions-only as the default). No courier API or live rates; actual courier assignment remains independent. **WEB-038 cart interaction DEFERRED.**

### Proposed internal calculation order and guardrails (NOT locked)
1. Validate the customer-entered six-digit pincode as a string; on explicit Check, Tavistra backend resolves the admin-maintained presumptive kilometres for that pincode/range and selects a single active distance band.
2. Obtain authoritative product/variant shipping metadata: packed weight, packed dimensions, shipping/fragility class, quantity and dispatch origin if relevant. Admin-entered product packaging costs are **already included in the product price** and are not charged again.
3. Compute **distance-band base charge + applicable shipping-only adjustments**. These adjustments represent incremental transport cost/exposure due to heavy, bulky, or special-care shipments; they must not be a second charge for the physical packaging or ordinary product handling.
4. Candidate weight adjustment: admin-configured brackets or incremental rates above a base included allowance; actual vs volumetric weight remains an internal policy choice (WEB-040M OPEN). Candidate dimensional adjustment: oversize threshold only where it represents distinct transport constraints, avoiding double-counting volumetric weight. Candidate fragility adjustment: special transport/insurance exposure, not ordinary protective packaging.
5. Candidate minimum delivery charge: `max(calculated_delivery, configured_minimum)` subject to explicit eligible free-shipping/waiver rules, pricing/tax treatment and rounding. No floor, value or sequencing is yet approved.
6. Produce a single delivery amount with internal breakdown, rule IDs/versions, applicable destination/product/quantity context, and a clear outcome (`estimated`, `rate_rule_missing`, `manual_review_required`, `destination_not_covered`, `calculation_error`). Internal breakdown is **not** customer-facing itemization.
7. Recalculate final delivery charge for actual order and full address at checkout; show final product total, delivery charge and payable total before confirmation. Ensure applicable delivery tax is included/reconciled correctly, without asserting a tax rate or legal classification prematurely.

### Boundary and exceptional cases (PROPOSED)
- Missing distance mapping, missing band, missing packed measurements or unconfigured adjustment: do not silently set to ₹0 or label destination unsupported; offer a supported manual-review/unavailable estimate state.
- Confirmed unsupported destination requires explicit Tavistra coverage rules, not absence of a rate.
- Quote-only, oversized, custom or special handling products may need a manual confirmation path without changing the two customer-facing price categories.
- Multiple items may ship together or separately; packing/aggregation and quantity-based adjustment remain OPEN, independent of deferred cart interaction design.
- Any free-delivery offer must be explicitly configured and eligible; zero is not the fallback for missing rules.
- Shipping rules should be versioned and auditable, with test cases for band boundaries, dimensional thresholds, fragile handling and checkout re-pricing.
- Search results remain independent of shipping rate calculation; courier selection and tracking are independent fulfilment operations.

### Next one-at-a-time decision: WEB-040P — Internal adjustment structure (OPEN)
A. **Configurable fixed/bracketed surcharges (recommended):** admin sets weight brackets, oversized thresholds and fragile-handling classes, each with explicit fixed shipping adjustments. Easy to audit and test; avoids arbitrary percentages on product price.
B. **Percentage/multiplier of distance-band charge:** weight/size/fragility classes multiply or percentage-adjust the base delivery rate. Scales with distance but can overcharge long-distance special-care shipments.
C. **Full distance-band × shipment-class matrix:** admin enters one total shipping rate for each distance band and package class combination. Precise control, but more combinations and maintenance.

**OPEN:** adjustment structure, weight basis (WEB-040M), exact thresholds/rates, whether adjustments stack or are capped, minimum-charge policy, multi-item aggregation, delivery-tax handling and exact microcopy. **WEB-038 cart interaction DEFERRED.**

## 2026-10-28 — Fixed / bracketed internal shipment adjustments approved (WEB-040P)

**LOCKED:** Tavistra's delivery engine starts with the administrator-maintained **distance-band base charge** (WEB-040K/L) and applies **configurable fixed-amount / bracketed shipment adjustments** for applicable transport-related weight, packed-size and fragility conditions (WEB-040O). Do **not** use percentage/multiplier surcharges as the default adjustment model or require a complete distance-band × shipment-class price matrix. This supersedes the previous WEB-040P OPEN alternatives. Actual amounts, thresholds, stacking and exceptions are **not approved**.

**LOCKED customer presentation (WEB-040N):** one all-inclusive, tax-inclusive product price (ordinary packaging and product handling already absorbed) **plus one combined delivery charge if applicable**. Do not expose weight, packing, dimensional, fragility, minimum-floor or other adjustment line items to customers. Internal adjustments must represent additional **transport-related** cost only, without double recovery of product-included costs. No courier APIs; courier selection remains an independent fulfilment step. **WEB-038 cart interaction remains DEFERRED.**

### Refined internal rule model (PROPOSED, not approved thresholds/tariffs)

| Factor | Proposed admin configuration | Rule behaviour / guardrail |
|---|---|---|
| Distance base | Non-overlapping presumptive-km bands, each with fixed base ₹ amount | Exactly one matching active band; never treat missing band as free delivery |
| Weight adjustment | Non-overlapping chargeable-weight brackets in kg with fixed ₹ adjustment, including an explicit zero-adjustment bracket if applicable | Define whether each bracket yields **one fixed adjustment** rather than cumulative per-kg increments; exact chargeable-weight basis remains WEB-040M OPEN |
| Packed dimensions / oversize | Packed L/W/H, longest-side or girth/volume thresholds, with fixed ₹ transport adjustment | Only for separately justified bulky/oversize transport; avoid charging the same volume exposure twice if volumetric weight is used |
| Fragility / special transport | Explicit shipping-handling classes (e.g. standard, fragile, special handling) with fixed ₹ adjustment | Charge only for extra transport risk/care, **not** ordinary protective packaging already included in product price; classes and stacking open |
| Minimum delivery charge | Admin-configured fixed ₹ floor by relevant scope, with explicit waiver/free-delivery eligibility | Proposed application after internal adjustments; tax-inclusive vs pre-tax basis, promotion precedence and minimum amount remain OPEN |
| Exceptional cases | Explicit destination coverage, rate-configuration completeness and manual-review flags | Missing rate/metadata != unsupported destination; special handling can require manual confirmation |
| Auditability | Rule ID/version, effective dates, matching band/bracket/class, internal calculation breakdown | Admin can preview representative pincode/product outcomes; historic confirmed orders should not be silently repriced |

### Candidate calculation and precedence (PROPOSED)
1. Validate pincode string; match its admin-assigned presumptive kilometres and exactly one distance band.
2. Resolve selected product/variant, quantity and packed-shipment attributes from authoritative server-side data. Do not accept client-submitted rate amounts or trust customer-entered weight.
3. Find **at most one** applicable weight bracket and **at most one** applicable rule per distinct dimensional or handling adjustment type. Reject overlapping equally applicable active rules in admin validation.
4. Compute provisional delivery = distance base + applicable fixed transport adjustments. Do not automatically stack duplicate volumetric/oversize charges for the same reason; define combination and cap policy before launch.
5. Apply any approved minimum/waiver policy and required shipping tax treatment. Zero delivery requires an explicitly applicable rule. Never default missing configuration to ₹0.
6. Return **one estimated delivery charge** on the PDP; at checkout recalculate using full address and actual order and show the verified final delivery amount before order confirmation.
7. If no distance mapping, matching bracket, required package data or supported rule exists, return a clear missing-configuration/manual-review result. Only explicit coverage rules may declare a destination unsupported. Calculation failure should not masquerade as non-serviceability.

### Edge cases to test (PROPOSED)
- Values exactly at weight/distance/dimension thresholds, six-digit pincodes with leading zeroes, and exact-pincode overrides of ranges.
- Very light but bulky objects; heavy compact objects; fragile objects with already-included protective packaging; items meeting multiple size thresholds.
- Multiple quantities, combined vs separate parcels, made-to-order packaging, zero-weight or missing dimensions, and out-of-coverage destinations.
- Explicit free delivery, minimum charge floor, promotions, tax rounding, rate-table edits between estimate and checkout, and audit/history.
- Keep quote-only/special shipments eligible for honest manual-review state; do not imply automatic serviceability from a numeric pincode.

### Next independent decision: WEB-040M — Internal chargeable-weight basis (OPEN)
A. **Greater of packed actual and volumetric weight (recommended):** compute both internally and use the higher to choose the fixed weight bracket. Volumetric divisor is admin-configurable; packed dimensions must be available. Any oversize adjustment must cover a **distinct** transport constraint.
B. **Packed actual weight only:** use actual packed kg for weight brackets; use separately approved oversize rules to account for bulky lightweight shipments.
C. **Product-class-specific basis:** admin chooses actual-only or max(actual, volumetric) by product shipping class; flexible but more maintenance.

**Still OPEN:** WEB-040M weight basis; exact weight thresholds, dimensional thresholds, fragile class amounts, minimum-charge scope/precedence, combined-shipment calculation, shipping tax handling and precise copy. **WEB-038 DEFERRED.**

## 2026-10-28 — Greater of actual and volumetric weight approved (WEB-040M)

**LOCKED:** For Tavistra's **internal delivery calculation**, calculate both (1) actual **packed** shipment weight and (2) volumetric weight derived from **packed** dimensions, and use the **greater** value as chargeable weight to select an applicable fixed/bracketed transport weight adjustment (WEB-040P). Use consistent units, e.g. packed centimetres and kilograms: `volumetric_weight_kg = (length_cm × width_cm × height_cm) / volumetric_divisor`; `chargeable_weight_kg = max(actual_packed_weight_kg, volumetric_weight_kg)`. The volumetric divisor is **admin-configurable**; no numeric divisor is approved. This supersedes earlier WEB-040M OPEN options for actual-only or class-specific weight basis.

**LOCKED CONTINUITY:** Distance-band base from admin-assigned presumptive km (WEB-040K/L), fixed/bracketed shipment adjustments (WEB-040O/P), and **only two customer-facing price components** (WEB-040N): all-inclusive product price including ordinary packaging/handling and applicable product taxes, plus **one combined delivery charge if applicable**. Weight and dimensional adjustments are internal and **must not be separately itemized**. Prevent double recovery of packaging costs and duplicate volumetric/oversize transport exposure. No live courier/map APIs. Independent courier assignment at fulfilment. **WEB-038 cart interaction DEFERRED.**

### Refined weight-bracket implementation (PROPOSED)
- Each active weight bracket has a lower/upper **chargeable-weight** boundary (kg), a fixed transport adjustment amount and applicability metadata. Exact brackets, currency amounts and boundary convention are not approved.
- Prefer a single matching non-overlapping bracket per calculated shipment, with an explicit zero-adjustment bracket where justified; admin validates gaps, overlaps and invalid values. Whether adjustments are one-bracket or cumulative is **OPEN**.
- Do not use bare product dimensions where packaging affects transport measurements. Record packed length, width, height and actual packed weight at appropriate product/variant or shipment level; missing required values must not silently produce ₹0 or unsupported-destination status.
- Round and compare weight consistently using documented precision and boundary handling; rounding policy remains open. Do not let tiny floating-point errors change brackets unexpectedly.
- A separate oversize adjustment may apply only for **distinct transport restrictions** (longest edge, non-stackability, special handling, etc.), not simply because volumetric weight is already high.
- Fragility class may contribute a fixed transport-related surcharge, not a second fee for normal protective packaging already included in product price. Classes, thresholds and stacking remain OPEN.
- Minimum delivery charge floor, explicit eligible free-delivery/waiver rules, missing-data/manual-review cases, rate versioning and checkout revalidation remain proposed, not approved.
- For multiple units, determine actual packed parcels and aggregation later; do not assume multiplying single-item volumetric weight equals a combined shipment calculation.

### Next independent decision: WEB-040Q — How weight brackets apply (OPEN)
A. **One matching fixed adjustment bracket (recommended):** choose exactly one weight range for the final chargeable weight and add its configured fixed ₹ adjustment to the distance-band base. Straightforward, predictable, easy to audit.
B. **Cumulative threshold adjustments:** stack fixed ₹ increments each time chargeable weight crosses a defined threshold. May be useful for heavy freight, but requires careful threshold design and can overcharge.
C. **One bracket by shipment class:** choose a separate weight-bracket schedule for standard, bulky and special-handling shipments. More granular but higher maintenance; distinct from the approved max(actual, volumetric) basis.

**OPEN:** WEB-040Q bracket application; numeric weight boundaries and amounts, divisor value, packed-size/oversize thresholds, fragility rules, minimum floor/waivers, exception states, multi-item packaging, delivery-tax treatment. **WEB-038 DEFERRED.**

## 2026-10-28 — One matching fixed weight bracket approved (WEB-040Q)

**LOCKED:** After calculating chargeable shipment weight as `max(actual packed weight, volumetric packed weight)` (WEB-040M), Tavistra selects **exactly one applicable weight bracket** and adds that bracket's **single configured fixed transport adjustment** to the distance-band base charge. Do **not** cumulatively stack crossed weight thresholds and do **not** require separate weight-bracket schedules by shipment class as the approved default. This supersedes earlier WEB-040Q OPEN alternatives. The bracket's amount may explicitly be ₹0 where configured and applicable, but a missing bracket/rate is **not** zero.

**LOCKED CONTINUITY:** WEB-040K/L presumptive km and distance bands; WEB-040O/P internal fixed/bracketed shipment adjustments; WEB-040N **two customer-facing price components only**, namely all-inclusive product price (including ordinary packaging, handling and applicable product taxes) plus **one combined delivery charge if applicable**. Internal weight, dimensions, fragility and minimum-charge components are never separately itemized; avoid double charging packaging and duplicated volumetric/oversize exposure. No courier or map APIs; independent courier selection at fulfilment. **WEB-038 cart interaction DEFERRED.**

### Refinement proposals (not approved numerical rules)

**Weight thresholds**
- Maintain administrator-editable chargeable-weight ranges in kg with a fixed ₹ transport adjustment for each range. Require exactly one active matching bracket per eligible shipment, with explicit no-adjustment bracket if intended.
- Proposed boundary convention: `lower_kg <= chargeable_weight_kg < upper_kg` and an optional open-ended final bracket; nonnegative boundaries, ordered ranges, no overlaps or unintended gaps. Precision/rounding and handling of exactly-on-boundary weights require explicit specification.
- Reject or flag overlapping active brackets; never silently select an arbitrary rule. No default divisor, numeric weight thresholds, rates or maximum shipment weight approved.

**Dimensions and oversized transport**
- Use packed length/width/height for volumetric weight (WEB-040M); separate fixed oversize transport adjustment only for an independently justified condition, such as a longest-side, girth, non-stackable or special vehicle constraint. Merely being volumetrically heavy is **not** enough to charge twice.
- Thresholds, rule precedence, whether multiple distinct dimension adjustments may stack and manual-review triggers remain OPEN.

**Fragility**
- Candidate admin-assigned transport classes: standard, fragile, special handling. Add a fixed transport-related amount only for exceptional care/risk in shipping; ordinary packaging/protective material is already included in the product price.
- Class labels, charges, stacking and cases requiring manual confirmation remain OPEN.

**Minimum delivery charge**
- Candidate admin-configurable floor applied after eligible internal adjustments, with explicit eligibility for free delivery/waivers. Whether the floor is global, distance-specific or shipping-class-specific, and tax/discount sequencing, remain OPEN.
- No fabricated ₹0 for missing rate data; missing mapping, missing bracket, unsupported destination and calculation error must be distinguished.

**Exceptions and operations**
- If packed dimensions/weight are unavailable or rate mapping is incomplete, return estimate-unavailable/manual-review, not a false serviceability verdict.
- Quote-only, special/oversize products and multiple-parcel orders may need manual shipping confirmation. Combined shipment vs separate-parcel aggregation remains OPEN.
- Keep rule versions and an internal calculation trace; checkout recalculates against actual order/address and discloses final delivery charge and total before confirmation.
- No specific tax rate or shipping GST treatment is approved.

### Next independent decision (OPEN): WEB-040R — Weight bracket threshold configuration
A. **Admin-configurable contiguous weight ranges (recommended):** Tavistra admin enters kg lower/upper limits and one fixed ₹ adjustment per range; no hardcoded default numeric bands. Validate continuity, boundaries and overlap.
B. **Predefined weight ranges with editable amounts:** application ships fixed kg thresholds; admin can change charges only. Easier to operate, less adaptable.
C. **Admin-configurable ranges with an open-ended manual-review ceiling:** editable brackets for ordinary shipping; above configured maximum, return manual-review instead of automatic price. Useful for unusually heavy items but requires an explicit exception workflow.

**OPEN:** WEB-040R, actual weight thresholds and amounts, volumetric divisor, dimensional thresholds, fragility amounts, minimum floor and exceptions, multi-item aggregation and shipping tax. **WEB-038 DEFERRED.**

## 2026-10-28 — Predefined weight ranges approved (WEB-040R)

**LOCKED:** Tavistra's application uses a **predefined set of chargeable-weight brackets**, with bracket boundaries controlled by the application configuration/release rather than editable through the ordinary admin interface. The Tavistra administrator **can edit the fixed rupee transport adjustment for each predefined bracket**, including an explicitly configured zero adjustment where valid. This supersedes the earlier WEB-040R OPEN alternatives for fully admin-configurable kg boundaries and admin-configured manual-review ceiling. **The actual number of brackets, kg boundaries and rupee values remain OPEN** and must not be invented or treated as approved defaults.

**LOCKED CONTINUITY:** WEB-040M uses `max(actual_packed_weight_kg, volumetric_packed_weight_kg)` with an admin-configurable volumetric divisor (value OPEN). WEB-040Q chooses **one matching bracket** and adds **one fixed weight adjustment**, never cumulative weight thresholds. WEB-040K/L use admin-assigned presumptive km by pincode/range and a fixed distance-band base. WEB-040O/P permit fixed/bracketed **internal transport-only** weight, packed-dimension and fragility adjustments. WEB-040N requires **only two customer-facing price components:** all-inclusive product price (including packaging, ordinary handling and applicable product taxes) plus **one combined delivery charge if applicable**. No separate packaging/weight/fragility charges or double recovery. No courier API; courier selection independent at fulfilment. **WEB-038 cart interaction DEFERRED.**

### Predefined bracket implementation refinements (PROPOSED)
- Ship a **versioned bracket schedule** with code/configuration, using kg lower/upper bounds and one stable bracket ID; admin sets only the amount associated with each ID. A future change to boundaries requires a controlled application/configuration release, migration review, tests and an audit record.
- Prefer contiguous, non-overlapping brackets covering intended automated shipping weights, with documented boundary inclusion and an explicit policy for values outside the supported range. Do not assume a fixed maximum or manual-review ceiling has been approved.
- Candidate convention: lower inclusive / upper exclusive, optional open-ended last bracket. Define rounding precision before matching; do not round unpredictably across a boundary.
- Validate nonnegative adjustment amounts, missing admin price entries, duplicate bracket IDs and unsupported weights. Missing rate is **not** zero; an explicit zero adjustment is valid only if configured.
- Preserve the matched schedule version and admin charge revision in internal calculation trace. Recalculate at checkout; preserve already confirmed order amounts according to a later order-price policy.
- Product/variant packed dimensions and actual packed weight remain server-authoritative; missing measurements should result in estimate-unavailable/manual-review, not a fabricated charge.
- Multiple quantities/parcels, combined shipping and dispatch-origin context remain OPEN.

### Dimensional adjustment design alternatives — next independent decision WEB-040S (OPEN)
A. **Longest packed side threshold (recommended for simplicity):** a fixed transport adjustment applies when the packed parcel's longest dimension exceeds a configured limit. This is a separate **physical handling restriction**, not a second volumetric-weight charge. Exact threshold and amount OPEN.
B. **Longest side + girth/total dimensions:** apply a fixed adjustment based on defined oversize measures such as longest side and length-plus-girth; more representative of transport constraints, but more rules and possible overlap.
C. **No automatic dimensional surcharge; manual-review for exceptional size:** volumetric weight already affects the weight bracket, and unusually large/non-stackable parcels trigger manual delivery confirmation rather than an additional automatic amount.

**Further OPEN decisions, separately:** WEB-040S dimensional policy, dimensional thresholds/charges, fragility classes and amounts, minimum delivery charge floor and waivers, missing-rate/unsupported/exception handling, actual weight brackets and rates, volumetric divisor value, multiple-parcel aggregation, shipping tax. Do not treat any of these as approved. **WEB-038 DEFERRED.**

## 2026-10-28 — Longest packed side dimensional adjustment approved (WEB-040S)

**LOCKED:** For the internal delivery calculation, measure the parcel's **longest packed side** as `max(packed_length_cm, packed_width_cm, packed_height_cm)`. When it **exceeds a configured longest-side threshold**, apply the applicable **fixed transport-related dimensional adjustment** on top of the distance-band base and one weight-bracket adjustment. This supersedes WEB-040S alternatives for girth-based automatic adjustment or no automatic dimensional adjustment as the default. **The threshold in cm, rupee adjustment and exceptional-size handling are OPEN**. Do not invent values or presume that all large-volume parcels merit the extra fee.

**Avoid double charging:** WEB-040M already uses volumetric packed weight to select a weight bracket. The longest-side adjustment must represent a **distinct physical transport restriction** (e.g. long-parcel handling) rather than charging for the same volumetric size twice. Ordinary packing/handling is in the product price.

**LOCKED CONTINUITY:** WEB-040K/L presumptive-km distance bands; WEB-040O/P fixed/bracketed internal shipment adjustments; WEB-040M max(actual packed, volumetric packed) weight; WEB-040Q one fixed matching weight bracket; WEB-040R predefined bracket boundaries with admin-editable ₹ adjustments; WEB-040N **only two customer-facing price components**, all-inclusive product price plus **one combined delivery charge if applicable**. No separately displayed dimensional, packing, weight, fragile-handling or minimum-charge line items. No courier APIs; courier chosen independently at fulfilment. **WEB-038 cart interaction DEFERRED.**

### Dimensional rule refinements (PROPOSED, not approved numerical settings)
- Store packed length, width, height in consistent units on authoritative product/variant/shipment data. Do not use unpacked product dimensions as a substitute.
- Admin-configurable longest-side threshold in centimetres and fixed rupee transport adjustment; whether threshold and amount are global or class-specific remains OPEN.
- Trigger only when `longest_side_cm > threshold_cm`, not when equal, unless separately revised; document boundary precision and reject invalid/negative settings.
- Only one matching longest-side adjustment by default; no girth multiplier or cumulative side-based charges. Whether additional distinct special-handling rules can stack is OPEN.
- Missing packed measurements, unsupported oversized items or missing active rates should produce unavailable estimate or manual review rather than an invented zero charge or false destination-not-covered verdict.
- Test exact-threshold values, rounding, heavy compact vs long lightweight parcels, multi-parcel orders, fragile long parcels, and changed packaging before checkout.
- Keep admin audit/versioning and recompute final checkout delivery amount before order confirmation.

### Next independent decision: WEB-040T — Fragility transport adjustment policy (OPEN)
A. **Three shipping-handling classes (recommended):** `standard`, `fragile`, `special_handling`; each maps to a configurable fixed *transport-only* adjustment (possibly explicitly ₹0 for standard). The classes are assigned to products/shipments by Tavistra; not all decor is fragile. Exact amounts and special handling eligibility remain OPEN.
B. **Binary fragile flag:** `standard` or `fragile` with a single configured fixed transport adjustment. Simpler but no distinction for unusually delicate shipments.
C. **Fragility manual-review only:** no automatic fragility adjustment; shipments marked fragile/special require manual confirmation of one combined delivery charge. Higher operational workload.

**OPEN:** WEB-040T, longest-side threshold and rupee adjustment, fragility classes/charges, minimum delivery floor/waivers, missing-rate and exceptional handling, volumetric divisor value, numeric weight brackets, multi-parcel aggregation and delivery tax treatment. **WEB-038 DEFERRED.**

## 2026-10-28 — All products fragile; fragility costs included in product price (WEB-040T)

**LOCKED (WEB-040T):** Treat **all Tavistra products as fragile** for normal packing and handling. Their standard protective packaging and fragile handling costs are **already included in the all-inclusive product price**. **Do not add an automatic internal fragility adjustment** to the delivery calculator, do not apply a separate fragility surcharge, and do not require a standard/fragile/special-handling class system for routine delivery pricing. This supersedes the earlier WEB-040T OPEN three-class, binary and fragility-only-manual-review alternatives. Do not assume a special transport fee merely because a product is fragile; the product's default fragility is universal.

**Scope clarification:** Exceptional logistics beyond routine fragile packing/handling (for example an unusual length, restricted transport method or shipment requiring bespoke freight) can be evaluated under the separately approved longest-packed-side rule (WEB-040S) **when its distinct transport constraint is met**, or under a **future explicit exception/manual-review policy**. This does not authorize a generic fragile fee or a new unapproved special-handling class. Avoid recovering costs already in product price twice.

**LOCKED CONTINUITY:** WEB-040K/L admin presumptive-km distance bands; WEB-040M greater of actual and volumetric packed weight; WEB-040P fixed/bracketed internal adjustments; WEB-040Q one matching fixed weight bracket; WEB-040R predefined kg boundaries with admin-editable fixed ₹ amounts; WEB-040S longest packed side dimensional adjustment; WEB-040N customer-facing **all-inclusive product price plus one combined delivery charge if applicable**. The internal calculator is now **distance-band base + one weight-bracket adjustment + applicable distinct longest-side transport adjustment**, subject to minimum/waiver/exception/tax rules yet to be approved. No fragility component. No courier APIs; courier chosen independently at fulfilment. **WEB-038 cart interaction DEFERRED.**

### Refined minimum delivery charge policy (PROPOSED; not approved)
- A minimum delivery charge is an **internal floor on the one combined delivery amount**, never a separate customer-visible fee.
- Any floor must be configured as a nonnegative amount with clear scope (global, by distance band or by shipping class) and explicit handling of zero/free delivery, tax and promotions.
- Candidate order: validate serviceability and complete rates → distance-band base + one fixed weight adjustment + any distinct longest-side adjustment → apply approved minimum floor unless an explicit free-delivery/waiver rule applies → calculate legally correct tax/rounding → show **one delivery charge** and total before checkout confirmation. Exact precedence/tax treatment OPEN.
- Missing distance mapping, weight bracket amount, packed dimensions or minimum policy must not silently become ₹0. Differentiate unavailable estimate, manual review, explicitly unsupported destination and calculation error.
- Keep rule versions, checkout revalidation and historic order pricing auditable.

### Next independent decision: WEB-040U — Minimum delivery charge approach (OPEN)
A. **One global minimum delivery charge (recommended):** a single admin-configurable ₹ floor for eligible shipments after base and fixed adjustments, with explicit free-delivery exception. Simple to audit and operate; value OPEN.
B. **Distance-band-specific minimums:** each distance band has its own configurable minimum ₹ charge, allowing more geographic control but more maintenance. Values OPEN.
C. **No minimum delivery charge:** charge only the calculated distance-band base plus approved fixed adjustments, with explicit rules for free shipping and missing rates. Simplest, but small calculated amounts are not floored.

**OPEN:** WEB-040U minimum-charge approach and actual amount; exceptions/waivers, dimensional threshold and ₹ amount, predefined kg boundaries and ₹ amounts, volumetric divisor, multi-parcel aggregation, delivery tax/rounding and unsupported/manual-review rules. **WEB-038 DEFERRED.**

## 2026-10-28 — Distance-band-specific minimum delivery charges approved (WEB-040U)

**LOCKED:** Each configured distance band has its **own admin-editable minimum delivery charge** (₹) for eligible shipments, rather than one global minimum or no floor. Once the valid base and fixed transport adjustments are calculated, the **band-specific floor** applies: `floor_result = max(distance_band_base + one_fixed_weight_bracket_adjustment + applicable_distinct_longest_side_adjustment, matched_distance_band.minimum_delivery_charge)`. This is a minimum on the **one combined delivery amount**, never a separate line item. This supersedes the previous WEB-040U OPEN alternatives. No numeric floor amounts or band thresholds are approved.

**IMPORTANT OPEN precedence:** Whether and how an explicit free-delivery/waiver rule overrides the floor, discounts, shipping GST basis, rounding, exceptional manual-review orders and multi-parcel aggregation remain **OPEN**. The formula above describes the ordinary eligible case before these unapproved exceptions and tax sequencing. A missing floor, distance band or adjustment must not silently become ₹0 or "free shipping". An explicitly configured zero minimum is not itself a free-delivery promotion: it only means the band imposes no positive floor.

**LOCKED CONTINUITY:** WEB-040K/L admin presumptive-km distance bands; WEB-040M greater of packed actual/volumetric weight; WEB-040P fixed/bracketed internal adjustments; WEB-040Q one matching fixed weight bracket; WEB-040R predefined kg brackets with admin-editable fixed ₹ amounts; WEB-040S longest packed side fixed transport adjustment; WEB-040T universal fragile packing/handling already in product price with **no automatic fragility surcharge**; WEB-040N customer sees **all-inclusive product price plus one delivery charge if applicable**. No external courier/map APIs; independent manual courier selection. **WEB-038 cart interaction DEFERRED.**

### Delivery exceptions, waivers and missing-rate refinements (PROPOSED; not yet approved)
- **Waivers/free delivery:** An explicit eligible promotion or product/order rule may reduce the **single** delivery charge, potentially to zero; whether the rule overrides the band minimum, when it is applied, stacking and coupon eligibility must be approved. No automatic free delivery just because a configuration value is missing.
- **Incomplete configuration:** Distinguish unmapped pincode/presumptive km, missing band, missing band minimum, missing weight bracket amount, missing volumetric divisor, missing packed weight/dimensions and unavailable tax treatment. Do not assume these mean a destination is unsupported.
- **Manual review:** Exceptional oversized/long shipments, unusual packaging, multiple parcels or quote-only cases may require manual delivery confirmation. Criteria, who can override, customer copy and expiry of a manual quote remain OPEN.
- **Explicit unsupported destination:** Mark as unavailable for shipping only where Tavistra has deliberately configured an exclusion/coverage rule, not merely because a rate is absent.
- **Backend response states (candidate):** `estimated`, `manual_review_required`, `rate_rule_missing`, `destination_not_covered`, `calculation_error`. No silent zero or misleading serviceability claims.
- **Validation/audit:** Each band minimum nonnegative, versioned and effective-dated; rule/price trace retained internally. Product-page estimate is nonbinding; checkout must calculate final single delivery charge and payable total before confirmation.

### Next independent decision WEB-040V — Explicit free-delivery waiver precedence (OPEN)
A. **Explicit waiver overrides the band minimum (recommended):** only a valid, administrator-configured free-delivery rule can make delivery ₹0 even if a band has a positive minimum; validate rates/coverage and waiver eligibility before treating shipping as free.
B. **Band minimum always applies:** free-delivery offers cannot reduce the charge below the band's configured floor; avoids subsidies but makes "free delivery" promises impossible in floored bands.
C. **Waiver eligibility configured separately per distance band:** each band determines whether a qualifying free-delivery offer may override its floor; more control, greater complexity.

**Still OPEN:** WEB-040V waiver precedence and eligibility, incomplete-rate/manual-review decision policy, exact band minimum amounts, numeric weight and dimension thresholds/charges, divisor, parcel aggregation, tax/rounding and exception override authority. **WEB-038 DEFERRED.**

## 2026-10-28 — Explicit free-delivery waiver overrides band minimum; coupon types approved (WEB-040V / WEB-040W)

**LOCKED (WEB-040V):** A valid, explicitly configured **free-delivery waiver** overrides the selected distance band's minimum delivery charge and may set the **single delivery charge to ₹0**. The band minimum still applies to ordinary non-waived delivery calculations (WEB-040U). This supersedes WEB-040V OPEN alternatives that disallowed waivers or required per-band waiver permission. A missing rate, unmapped destination, calculation failure or unconfirmed eligibility **must not** be interpreted as a waiver or free shipping.

**LOCKED (WEB-040W, coupon capabilities):** Tavistra supports both **free-delivery coupons** (qualifying waiver of delivery charge, including band minimum) and **product-price discount coupons** (reduce eligible product price or subtotal). These are distinct discount targets, and their existence is approved; **not** yet approved: fixed vs percentage product discount formats, limits/caps, coupon stacking, combining product and delivery coupons, eligibility by product/order/customer/region, expiry, redemption limits, minimum order value, discount/tax allocation, guest checkout redemption and detailed UX. Do not invent these rules.

**LOCKED customer presentation (WEB-040N):** preserve **two charge components only**: the tax-inclusive, all-inclusive **product amount after eligible product discounts**, and **one combined delivery charge if applicable** (which may be ₹0 under valid waiver). A discount/savings annotation or coupon status is informational, **not** an extra cost component. Product packaging and normal fragile handling already included in price (WEB-040T); no duplicate delivery recovery. Show final payable total and valid discounts before order confirmation.

### Proposed waiver and coupon calculation precedence (NOT YET LOCKED)
1. Validate actual destination/coverage, shipment attributes and applicable distance-band/base/weight/dimensional rate configuration; evaluate any manual-review restrictions.
2. Calculate provisional internal delivery and apply the matched distance band's minimum floor for an ordinary eligible order.
3. Independently validate coupon existence, validity, scope, eligibility, usage constraints and conflict rules against authoritative backend data.
4. If a **valid applicable free-delivery waiver** exists, set the one combined delivery charge to ₹0, overriding the floor. Do not bypass unresolved serviceability or an exceptional shipment needing manual review merely because a coupon exists.
5. Apply valid product-discount coupon to eligible merchandise according to later-approved discount and tax treatment. Keep product and delivery discounts separately auditable internally, but do not create additional customer-facing charge categories.
6. Revalidate coupons and delivery at checkout, and show the final product amount, delivery amount and payable total before confirmation. Do not persist stale discounts or assume coupon success until validated.

### Next independent decision WEB-040X — Missing-rate / unconfigured destination response (OPEN)
A. **Estimate unavailable; manual review possible (recommended):** for missing pincode-to-km mapping, band, minimum, weight bracket, packed measurements or divisor, show a clear nonnumeric 'Delivery estimate unavailable' state with an optional request-for-review path; do not label the destination unsupported.
B. **Block checkout until rates configured:** show an explicit unavailable-estimate message and require admin to complete the missing configuration before order can proceed. Operationally strict, may lose orders.
C. **Request manual delivery quote immediately:** any missing rate automatically enters a manual-quote workflow before checkout; more flexible, requires staff availability and approval controls.

**Separate explicit destination exclusions:** only a deliberate admin-configured non-serviceable coverage rule can return `destination_not_covered`. Missing mapping/rate is not exclusion. Exceptional heavy/long/multi-parcel shipments and coupon eligibility remain independently OPEN.

**Still OPEN:** WEB-040X missing-rate response, manual-review workflow, explicit unsupported destination handling, coupon stacking/format/limits/tax and promotion precedence, numeric thresholds and tariffs, multi-parcel aggregation, shipping tax/rounding. **WEB-038 cart interaction DEFERRED.**

## 2026-10-28 — Missing-rate response approved (WEB-040X)

**LOCKED:** If the Tavistra internal delivery calculator cannot derive a trustworthy delivery estimate due to missing or incomplete required rate/configuration/shipment data, return **"Delivery estimate unavailable"** (a nonnumeric state) and **allow a possible manual-review/request path**. This is not a statement that the destination is unsupported, not an automatic manual quote for every failure, not a fabricated ₹0/free-delivery rate, and not permission to confirm an order with an unresolved payable delivery amount. This supersedes WEB-040X OPEN alternatives to categorically block until rates are configured or automatically initiate a quote on every missing rate.

**Typical triggers (PROPOSED classification):** missing pincode-to-presumptive-km mapping, distance band or band minimum, configured weight-bracket ₹ amount, packed dimensions/actual weight, volumetric divisor or other required calculation input. Preserve an internal reason code; customer copy should avoid leaking technical details. A coupon/free-delivery waiver does not silently repair missing coverage, serviceability or required shipping validation. Final delivery and total must be known and presented before order confirmation; the precise manual-review and checkout hold/resume workflow remains OPEN.

**Explicit non-serviceability is separate:** a destination may be shown as "Delivery not available to this pincode" **only** when Tavistra has deliberately configured that exclusion under a later-approved coverage policy, not merely because an estimate cannot be computed.

**LOCKED CONTINUITY:** WEB-040K/L admin presumptive-km distance bands; WEB-040M/Q/R max(actual,volumetric) and one predefined weight bracket with admin-editable fixed ₹ amount; WEB-040S distinct longest-packed-side adjustment; WEB-040T all products fragile, protective packaging and routine handling included in product price, no fragility fee; WEB-040U per-band minimum; WEB-040V valid free-delivery waiver overrides band minimum; WEB-040W delivery-waiver and product-discount coupon capabilities (specific coupon rules OPEN); WEB-040N two customer-facing **charge** components: all-inclusive product price after eligible discounts plus one combined delivery charge if applicable. No courier APIs; independent courier assignment at fulfilment. **WEB-038 cart interaction DEFERRED.**

### Next independent decision: WEB-040Y — Explicit unsupported-destination configuration (OPEN)
A. **Admin-managed pincode and pincode-range exclusions (recommended):** Tavistra admin can deliberately mark exact six-digit pincodes or inclusive ranges as non-serviceable. Explicit exclusions yield "Delivery not available" even if a rate mapping exists; missing rate alone yields "Estimate unavailable". Range conflict/precedence validation required; specific rules remain OPEN.
B. **Exact-pincode exclusions only:** admin explicitly blocks individual six-digit pincodes. Simple but laborious for larger excluded areas.
C. **No explicit destination exclusions initially:** no pincode/range blacklist at launch; unknown mapping remains "Estimate unavailable" pending review. Less operational control.

**PROPOSED safety:** preserve distinct statuses `estimate_unavailable`, `destination_not_covered` (only explicit exclusion), `manual_review_required` (exceptional shipment, criteria OPEN), `estimated` and `calculation_error`. No automatic courier/map lookup, no rate-as-zero fallback. Admin audit, versioned effective dates, clear customer copy, checkout recalculation and manually resolved total before order confirmation.

**STILL OPEN:** WEB-040Y unsupported destination configuration, manual-review workflow/authority and triggers, free-delivery coupon details/stacking, numeric bands and adjustments, divisor, multi-parcel rules, tax/rounding and pricing precedence. **WEB-038 DEFERRED.**

## 2026-10-28 — Registered-pincode delivery coverage allowlist approved (WEB-040Y)

**LOCKED (WEB-040Y):** Tavistra provides delivery **only to pincodes registered in its internal coverage system**. This is a **positive serviceability allowlist**, not a separate exclusion/blacklist system. A registered pincode is **serviceable even if its rate is missing**. A pincode **not registered** in Tavistra is **not serviceable**, regardless of whether a courier might theoretically deliver there.

| Coverage registration | Price calculation | Customer outcome |
|---|---|---|
| Registered | Complete, valid rates | Delivery available; show one estimated delivery charge |
| Registered | Missing/incomplete rates or measurements | Delivery available in principle; show **"Delivery estimate unavailable"** with manual review possible (WEB-040X) |
| Not registered | Any | **"Delivery not available to this pincode"**; do not offer checkout delivery there |

**Priority:** Check coverage registration first, then attempt the internal pricing calculation for registered pincodes. **Do not equate an absent rate or absent presumptive-km value with an unregistered pincode.** The internal model must be able to register coverage independently from rate completeness. A valid free-delivery coupon (WEB-040V/W) may waive an eligible charge for a registered, validated shipment but **cannot authorize delivery to an unregistered pincode** or bypass unresolved shipment/serviceability checks. No external courier or geocoding API.

**Compatibility with WEB-040K (PROPOSED implementation):** retain exact six-digit pincode records and optionally administrator-maintained inclusive pincode-range registrations, with clear membership/overlap precedence and six-digit string validation. A pincode is "registered" only if it is included in an explicit active coverage record, not because it is numerically near another pincode. Presumptive-km/rate tables may be separate and incomplete. The exact UI/data schema for registration, ranges, deactivation and import remains OPEN; the allowlist behavior is LOCKED. The earlier WEB-040Y OPEN alternatives proposing a separate exclusion list are superseded.

**LOCKED CONTINUITY:** WEB-040X missing-rate -> estimate unavailable, manual review possible; WEB-040U per-band minimum; WEB-040V explicit waiver overrides minimum; WEB-040W delivery and product coupons supported with details OPEN; WEB-040N customer-facing two charge components only, discounted all-inclusive product amount plus one combined delivery charge if applicable. All Tavistra products fragile, routine protective packing/handling included in product price (WEB-040T). Courier chosen independently at manual fulfilment. **WEB-038 cart interaction DEFERRED.**

### Next independent decision WEB-040Z — Exceptional shipment manual-review trigger (OPEN)
A. **Automatic hold for defined exceptions (recommended):** when a registered destination's shipment exceeds an explicitly configured handling limit (e.g. beyond supported packed side, weight or multi-parcel handling constraints), mark **"Manual delivery review required"** and do not automatically finalize delivery pricing; precise triggers and thresholds remain OPEN. Ordinary missing rates remain WEB-040X estimate unavailable, with optional review.
B. **Admin product/variant manual-review flag only:** manual review is required only for products/variants explicitly marked by admin, rather than automatic threshold-based exceptional shipment checks. Simpler but relies on correct tagging.
C. **No separate exceptional-shipment hold initially:** use normal distance/weight/longest-side calculation when complete, and WEB-040X only for missing rates; less control for difficult freight.

**Still OPEN:** WEB-040Z exceptional shipment triggers and human review workflow, coverage range mechanics, numeric rates and thresholds, coupon formats/stacking/eligibility/tax, multi-parcel aggregation and delivery tax/rounding. **WEB-038 DEFERRED.**

## 2026-10-28 — No separate exceptional-shipment review approved (WEB-040Z)

**LOCKED (WEB-040Z):** Do **not** impose a separate automatic manual-review hold or dedicated product/variant exceptional-shipment flag simply because a parcel is large, long, heavy, fragile or multi-parcel. For registered destinations with complete valid pricing inputs, use the normal Tavistra internal calculator (distance band, one fixed weight bracket, applicable distinct longest-packed-side adjustment, per-band minimum and valid waiver). The previously proposed automatic threshold-based exception hold and admin-only exception flag are **not adopted**. The longest-side **pricing adjustment** under WEB-040S remains approved; it is **not** itself a manual-review trigger. This does not approve any numeric thresholds or guarantee that every conceivable parcel can be fulfilled: incomplete/invalid rate inputs remain WEB-040X and genuinely unsupported configurations must not be fabricated.

**LOCKED CONTINUITY:** WEB-040Y positive registered-pincode allowlist; unregistered destination -> delivery not available. Registered but unpriced/incomplete -> **"Delivery estimate unavailable"**, manual review possible under WEB-040X; no automatic manual quote required. WEB-040T routine fragile packaging/handling included in all-inclusive product price, no fragility fee. WEB-040U distance-band-specific minimum; WEB-040V explicit valid free-delivery waiver may override minimum; WEB-040W delivery and product coupon capabilities locked but detailed rules OPEN. WEB-040N only two customer-facing **charge** components: discounted all-inclusive product amount plus one combined delivery charge if applicable. No courier APIs; manual independent fulfilment. **WEB-038 cart interaction DEFERRED.**

### Next independent decision WEB-040AA — Manual review request initiation (OPEN)
A. **Customer-initiated request, admin resolves (recommended):** on "Delivery estimate unavailable" for a **registered** pincode, present an optional "Request delivery estimate" action; a deliberate customer submission creates a review request for staff. No automatic request just from pincode lookup. Checkout cannot finalize without a confirmed final delivery amount. The exact customer contact fields, notification and approval authority remain OPEN.
B. **Admin-initiated only:** customer sees estimate unavailable and contacts support through existing channels; staff creates the review case manually in admin. No dedicated request action.
C. **Automatic case on checkout attempt:** no case on product-page pincode check, but if a customer tries to proceed to checkout with unavailable delivery pricing, the system creates a review case. Exact hold/resume and notification rules OPEN.

**PROPOSED approval controls (not yet locked):** staff enters an explicit single combined delivery charge after confirming registration and shipment details; record actor/time/reason and quote expiry; customer must see and accept final total before order confirmation; free-delivery coupon does not override unregistered coverage; no silent ₹0 for missing rates. Customer contact and notifications should avoid exposing internal tariffs.

**STILL OPEN:** WEB-040AA initiation, review staff authority/override and checkout resumption, numeric rates/thresholds/divisor, multi-parcel aggregation, coupon formats/stacking/eligibility/tax and delivery tax/rounding. **WEB-038 DEFERRED.**

## 2026-10-28 — Customer-initiated manual delivery review approved (WEB-040AA)

**LOCKED (WEB-040AA):** When a customer checks a **registered** Tavistra pincode and the internal delivery calculator cannot produce a valid rate, show **"Delivery estimate unavailable"** and offer an explicit **"Request delivery estimate"** action. A manual-review request is created **only after the customer intentionally submits that request**, not automatically on pincode lookup, typing, page load, or checkout attempt. This supersedes the WEB-040AA OPEN admin-only initiation and automatic-case-on-checkout alternatives. The customer-facing request is an inquiry, not a confirmed order, paid checkout or promised price.

**LOCKED coverage distinctions:** registered + complete rates -> ordinary delivery estimate (WEB-040Y); registered + incomplete rates -> unavailable estimate and customer-initiated review possible (WEB-040X/AA); unregistered -> **"Delivery not available to this pincode"**, without this delivery-review action. A valid free-delivery coupon cannot extend coverage to unregistered pincodes or silently substitute for missing shipment validation. No courier APIs or automatic courier quotations.

**Not yet approved:** whether a request may be sent from PDP only or also checkout, guest contact fields and consent, duplicate suppression, notification channels, request ownership/SLAs, staff approval role, quote override amount/expiry, review status transitions, checkout hold/resume and customer acceptance. Do not assume the request initiates a reservation, order or automatic payment. Final combined delivery amount and payable total must be presented before order confirmation.

**LOCKED continuity:** WEB-040Z no separate exceptional-shipment hold; WEB-040T all products fragile with routine packing/handling included in all-inclusive product price, no fragility surcharge; WEB-040U per-band minimum; WEB-040V valid explicit free-delivery waiver may override floor; WEB-040W both delivery and product coupons supported with details OPEN; WEB-040N **only two customer-facing charge components**, discounted all-inclusive product amount plus one delivery charge if applicable. **WEB-038 cart interaction DEFERRED.**

### Next independent decision WEB-040AB — Manual delivery quote approval authority (OPEN)
A. **Restricted authorised admin approval (recommended):** staff may prepare a proposed delivery amount, but only administrators with explicit delivery-quote approval permission may approve and publish a final quote. Staff identity and audit log are required. Exact roles/permissions OPEN.
B. **Any admin user can approve:** every authenticated Tavistra admin user may set and approve a manual delivery amount. Simpler but broad authority.
C. **Owner-only approval:** only a designated owner/super-admin can approve a manual delivery quote. Tight control, potential bottleneck.

**PROPOSED, not approved:** preserve reviewer identity, reason, approved amount, date, source request, optional validity period and status; quote should only apply to the validated destination/shipment; customer sees one final delivery charge, not internal breakdown; customer must accept final total before placing order. Approval role and checkout resumption to be decided separately.

**STILL OPEN:** WEB-040AB approval authority, manual review request form/notifications, quote lifecycle, checkout resumption, coupon specifics, numeric tariffs and thresholds, divisor, parcel aggregation and tax/rounding. **WEB-038 DEFERRED.**

## 2026-10-28 — Permission-gated manual delivery quote approval (WEB-040AB)

**LOCKED (WEB-040AB):** Tavistra uses **Authorised Admin Approval** for customer-initiated manual delivery estimates. Staff may prepare a proposed manual delivery amount, but **only an authenticated admin user explicitly granted the delivery-quote approval permission** may approve and release that amount to the customer. Being an ordinary admin or the request preparer does **not** automatically confer approval permission. Approval is not exclusively owner-only. This supersedes the prior WEB-040AB OPEN alternatives (any-admin approval or owner-only approval).

**Operational distinction:** quote preparation is not approval, publication or order confirmation. A proposed amount cannot be treated as final before permission-gated approval. Approval must be enforced on the Tavistra backend, not solely by hiding frontend buttons. Exact staff role names, permission assignment interface, audit fields, approval delegation/revocation, amendment rules, expiration and notification mechanisms remain **OPEN/PROPOSED**. A registered destination with missing rate follows WEB-040X/AA; unregistered pincodes remain non-serviceable under WEB-040Y. No separate exceptional-shipment review under WEB-040Z.

**LOCKED continuity:** WEB-040U distance-band-specific minimums; WEB-040V valid explicit free-delivery waivers override band minimum; WEB-040W delivery and product coupons supported, detailed eligibility/stacking/limits/tax OPEN; WEB-040N **only two customer-facing charge components**: discounted all-inclusive product price plus one combined delivery charge if applicable. Standard fragile packaging/handling included in product price, no fragility fee (WEB-040T). No courier APIs. **WEB-038 cart interaction DEFERRED.**

### Next independent decision WEB-040AC — Checkout resumption after approved manual quote (OPEN)
A. **Customer resumes checkout and explicitly accepts final total (recommended):** notify or otherwise make approved quote available to customer; customer reopens checkout, sees final discounted product amount, one approved delivery charge and final payable total, and explicitly proceeds before an order/payment is created. No automatic order or payment on approval. Quote validity, authentication/recovery and notification channels remain OPEN.
B. **Approved quote automatically creates pending order:** on approval, Tavistra creates an unpaid order for the customer to pay or accept later; higher operational risk, may create unwanted orders. Customer acceptance and payment still required.
C. **Staff completes order manually after customer confirmation:** admin coordinates acceptance with customer and enters order manually; less self-service and more staff work.

**PROPOSED, not locked:** quote linked to original request, validated pincode and shipment snapshot; approval actor/time/reason, immutable quoted amount and expiry; checkout revalidation for changed products/address/coupons; clear stale/expired quote handling; final customer-visible total before order placement. Do not infer these detailed controls are already approved.

**STILL OPEN:** WEB-040AC checkout resumption and acceptance, staff permission management/audit specifics, request contact fields and notifications, quote expiry and revalidation, coupon rules, numeric rates/thresholds, divisor, parcel aggregation, shipping tax/rounding. **WEB-038 DEFERRED.**

## 2026-10-28 — Approved manual quote automatically creates unpaid order (WEB-040AC)

**LOCKED (WEB-040AC):** When an explicitly authorised admin approves a customer-initiated manual delivery quote (WEB-040AA/AB), Tavistra **automatically creates an unpaid order** for the associated customer/request, using the approved **one combined delivery charge**. The customer can subsequently view the order and choose to complete payment; they are **not required to restart checkout or manually place a new order**. This supersedes the prior WEB-040AC OPEN alternatives of resuming checkout to create an order or staff manually creating it.

**Important boundaries:** quote approval/order creation is **not** payment authorisation, payment capture, payment success, or a commitment to begin fulfilment. Do not automatically charge the customer or mark the order paid/ready for dispatch. The original customer-initiated request is not itself an order; **the order is created only after permission-gated approval**. The unpaid order must present the final product amount and approved delivery charge before payment. Product discount coupons and free-delivery coupons are supported in principle (WEB-040W/V), but their validation, precedence and applicability to manually approved quotes remain **OPEN**. Do not assume an unpaid order reserves inventory, expires automatically, or can be edited without reapproval: those rules are OPEN.

**LOCKED continuity:** WEB-040Y only registered pincodes serviceable; WEB-040X registered but unpriced -> estimate unavailable, manual review possible; WEB-040Z no separate exceptional shipment review. WEB-040U band-specific minimum, WEB-040V valid explicit free-delivery waiver can override floor; WEB-040T standard fragile handling and packaging included in all-inclusive product price, no fragility surcharge; WEB-040N **two customer-facing charge components**: discounted all-inclusive product price and **one** delivery charge if applicable. No courier APIs; manual independent courier fulfilment. **WEB-038 cart interaction DEFERRED.**

**PROPOSED technical safeguards (not yet locked):** approval and unpaid-order creation should be atomic/idempotent to avoid duplicate orders on retries; retain request, approved quote, approver and calculated total; issue a secure customer-specific order/payment access path; ensure payment gateway success is server-verified; do not send payment requests for invalidated orders. Exact implementation and audit details remain OPEN.

### Next independent decision WEB-040AD — Manual delivery quote validity policy (OPEN)
A. **Fixed admin-configurable validity window (recommended):** approved quote/unpaid order has an explicit configurable deadline for payment at approved delivery amount. After deadline, quote/order needs revalidation or revised approval before payment. Duration, cancellation and customer notice rules remain OPEN.
B. **Valid until order is paid or manually cancelled:** approved delivery amount remains payable indefinitely unless authorised staff cancels/revises the order. Simpler but exposes Tavistra to outdated delivery costs.
C. **Validity tied to explicit manual expiry per quote:** approver sets an expiry date/time for each quote. Flexible but adds staff effort and inconsistent expiry risk.

**STILL OPEN:** WEB-040AD quote validity, customer notification channels and timing, unpaid-order expiry/cancellation, inventory reservation, approved-order changes, coupon formats/stacking/eligibility/tax, numeric tariffs/thresholds, volumetric divisor, parcel aggregation and delivery tax/rounding. **WEB-038 DEFERRED.**

## 2026-10-28 — Admin-configurable manual delivery quote validity approved (WEB-040AD)

**LOCKED (WEB-040AD):** Tavistra has **one centrally admin-configurable validity period** for approved manual delivery quotes. On approval, each quote receives a validity deadline determined by the configured period; the approved delivery amount remains payable only within its validity window. After that deadline, **the approved delivery amount must be revalidated before payment**. The exact duration, permitted admin role for changing it, time unit, timezone/time boundary, and effect of configuration changes on previously approved quotes remain **OPEN**. This supersedes prior WEB-040AD OPEN alternatives of indefinite validity and approver-chosen individual expiry.

**LOCKED continuity:** Under WEB-040AA/AB/AC, customer deliberately requests review for a registered pincode with unavailable rates, authorised admin approves, and Tavistra automatically creates an **unpaid order** linked to that approved delivery amount. Approval does **not** collect payment or mark the order paid. An expired quote must not silently allow payment using the stale delivery amount. **Expiry does not itself mean the unpaid order is automatically cancelled or deleted**; expiry/revalidation/cancellation states and operational process remain OPEN.

**LOCKED pricing and coverage:** WEB-040Y registered-pincode allowlist; WEB-040X missing rate -> estimate unavailable, customer review possible; WEB-040Z no separate exceptional-shipment review; WEB-040U per-distance-band minimum; WEB-040V valid free-delivery waiver overrides minimum; WEB-040W free-delivery and product-discount coupons supported with eligibility, stacking and tax specifics OPEN; WEB-040N customer sees only **discounted all-inclusive product amount plus one combined delivery charge if applicable**. Standard fragile packing/handling included in product price; no courier APIs. **WEB-038 cart interaction DEFERRED.**

### Next independent decision WEB-040AE — Customer notification channel after approval (OPEN)
A. **Transactional email with secure order/payment link (recommended):** when quote is approved and unpaid order created, send an email containing order reference, amount, validity deadline and secure way to view/pay. Use Tavistra's own SMTP setup; exact email identity and delivery/retry rules OPEN.
B. **Email plus optional SMS/WhatsApp later:** launch with email and design optional additional notifications for future connection. Do not imply SMS/WhatsApp integration is already approved or connected.
C. **Account/order-page status only:** show approved quote and unpaid order in customer order access; no outbound notification. Reduces dependencies but customers must check manually.

**PROPOSED, not locked:** a secure order-access link rather than raw guessable IDs, customer-visible validity deadline, server-side expiry check before payment, email send retry and event audit, guest-checkout-safe recovery, no duplicate orders or notifications on retry. Customer contact fields, precise notification timing and template wording OPEN.

**STILL OPEN:** WEB-040AE notification channel, numeric validity period, expiry revalidation and unpaid-order cancellation lifecycle, coupon details, manual review request fields, numeric delivery rates/thresholds, volumetric divisor, parcel aggregation, delivery tax/rounding. **WEB-038 DEFERRED.**

## 2026-10-28 — Transactional SMTP email with secure order/payment link (WEB-040AE)

**LOCKED (WEB-040AE):** Following authorised approval of a customer-initiated manual delivery quote and creation of the linked unpaid order (WEB-040AA/AB/AC), Tavistra sends the customer a **transactional email through Tavistra's own SMTP service**. It contains the **order reference, approved payable total, quote validity deadline, and a secure customer-specific link to view the order and complete payment**. This supersedes the WEB-040AE OPEN alternatives of account/order-page-only status and any launch requirement for SMS/WhatsApp. **No SMS/WhatsApp integration or courier API is required.**

**Security and state boundaries:** the link must not expose another customer's order or bypass authorisation, quote expiry or payment verification. Email delivery does not mean payment succeeded; an SMTP failure must not mark the order paid, trigger fulfilment or duplicate order creation. Exact link token/session design, guest recovery, retries, delivery status, sender identity, template content, contact consent, and resend policies remain **OPEN/PROPOSED**; the SMTP email channel and minimum information are LOCKED.

**LOCKED continuity:** WEB-040AD centrally admin-configured quote validity, with revalidation required after expiry before payment; exact duration and unpaid-order handling OPEN. WEB-040Y registered-pincode allowlist, WEB-040X unavailable estimate with review possible, WEB-040Z no separate exceptional-shipment hold. WEB-040U per-band minimum and WEB-040V explicit valid free-delivery waiver; WEB-040W delivery/product coupons supported with details OPEN. WEB-040N **two customer-facing charge components** only: discounted all-inclusive product amount plus one delivery charge if applicable. No courier APIs; independent manual fulfilment. **WEB-038 cart interaction DEFERRED.**

### Next independent decision WEB-040AF — What happens when the manual delivery quote expires? (OPEN)
A. **Keep unpaid order; block payment until reapproval (recommended):** mark quote expired, keep order in a payment-blocked awaiting-revalidation state; authorised staff updates/reapproves delivery charge on the existing unpaid order, then customer gets an updated payment opportunity. Whether reapproval is customer- or staff-initiated, notification cadence and cancellation deadlines remain OPEN.
B. **Cancel unpaid order automatically; require a new request:** when quote expires, cancel the unpaid order and require a fresh customer delivery estimate request, new approval and new order. Simpler immutable orders but more friction and risk of stranded customers.
C. **Keep unpaid order; staff manually decides renewal or cancellation:** after expiry, block payment and let staff decide whether to reapprove on the same order or cancel it. Flexible but less deterministic.

**PROPOSED safeguards, not locked:** server-side expiry gate on payment, preserve audit history, don't charge expired amount, recheck destination and shipment snapshot on reapproval, don't double-create orders, and issue new secure customer payment access after update. Precise quote expiry time, stock reservation, payment races, coupons and order edits remain OPEN.

**STILL OPEN:** WEB-040AF expired quote/unpaid-order lifecycle, exact validity duration, customer notification retries and recovery, quote reapproval permissions, coupon details, tax/rounding and delivery rates. **WEB-038 DEFERRED.**

## 2026-10-28 — Automatically cancel unpaid order on manual quote expiry (WEB-040AF)

**LOCKED (WEB-040AF):** When an approved manual delivery quote reaches its admin-configured validity deadline (WEB-040AD), Tavistra **automatically cancels its associated unpaid order if payment has not succeeded**. The expired quote and cancelled order cannot be paid using the old secure link or stale delivery amount. To purchase after expiry, the customer must **submit a new delivery-estimate request**, obtain a new permission-gated approval (WEB-040AA/AB), and receive a **new unpaid order** (WEB-040AC) and transactional SMTP notification (WEB-040AE). This supersedes the prior WEB-040AF OPEN alternatives of retaining the order for reapproval or staff-selectable renewal/cancellation. No automatic renewal of the old order.

**Important payment boundary:** an already successfully paid order must **not** be cancelled by quote expiry. Payment initiation/completion races near the deadline must be handled safely so that an in-flight or verified successful payment is not misclassified as unpaid; precise cut-off, gateway reconciliation, idempotency, refund and conflict-resolution policy remain OPEN. Expired payment access must not permit a new payment against the cancelled order. Preserve cancelled order and quote records for traceability; do not permanently delete records on expiry. Whether to send a cancellation email and exact customer-facing status copy remain OPEN.

**LOCKED continuity:** registered pincodes only (WEB-040Y); registered with missing rate -> estimate unavailable and optional customer-submitted request (WEB-040X/AA); no separate exceptional shipment review (WEB-040Z); authorised admin approval (WEB-040AB); approval creates unpaid order, not payment (WEB-040AC); centrally configured quote validity (WEB-040AD); SMTP email with order reference, approved total, validity deadline and secure order/payment link (WEB-040AE). WEB-040U per-band minimum and WEB-040V valid explicit free-delivery waiver; WEB-040W delivery/product coupons supported, details OPEN; WEB-040N **two customer-facing charge components** only: discounted all-inclusive product amount plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED.**

### Next independent decision WEB-040AG — Inventory reservation for automatically created unpaid manual-quote orders (OPEN)
A. **Reserve stock until quote expiry (recommended):** for ready-stock items, reserve available units when the unpaid order is created; release reservation if order is automatically cancelled at quote expiry. Requires stock availability check, concurrency protection and an agreed treatment for made-to-order/quote-only items; exact mechanics OPEN.
B. **Reserve stock only after successful payment:** unpaid orders do not hold inventory; at payment time recheck availability and block/resolve if sold out. Less stock tied up but risks a customer receiving an approved quote for an item no longer available.
C. **No automatic reservation; admin discretion:** staff decides whether to reserve stock for each unpaid manual-quote order. Flexible but inconsistent and adds workload.

**PROPOSED, not locked:** reserve only eligible ready-stock inventory; avoid negative stock, hold duplication or inventory release for already paid orders. Exact stock-allocation timing, treatment of variants/made-to-order items, payment races and reservation persistence remain OPEN.

**STILL OPEN:** WEB-040AG stock reservation, precise quote validity duration, payment-race reconciliation, cancellation notices, request/contact fields, coupon rules, delivery rates/thresholds/divisor, multi-parcel calculation and tax/rounding. **WEB-038 DEFERRED.**

## 2026-10-28 — Reserve ready stock until manual quote expiry (WEB-040AG)

**LOCKED (WEB-040AG):** When an authorised admin approves a customer-initiated manual delivery quote and Tavistra automatically creates its **unpaid order** (WEB-040AB/AC), **reserve the order's available ready-stock units** until the quote's centrally configured validity deadline (WEB-040AD). While the unpaid order is valid, reserved units are not available to other purchasers. If the quote expires while the order remains unpaid, WEB-040AF **automatically cancels the order and releases its ready-stock reservation**. If payment succeeds before the valid deadline, preserve the stock allocation for the paid order and do **not** release it merely because the original quote deadline subsequently passes. Staff-by-staff reservation discretion and reserve-only-after-payment are not adopted.

**Important boundaries:** this policy concerns **eligible ready-stock units** only. The inventory treatment of made-to-order and quote-only items, insufficient stock at approval, mixed-mode orders, partial fulfilment, manual cancellation before expiry, reservation release on other failure states, and payment/expiry concurrency remain **OPEN**. Do not allow a reservation to allocate more units than available or to be released twice; precise transactional/locking mechanics are **PROPOSED**, not separately approved.

**LOCKED continuity:** registered pincode only (WEB-040Y); customer-initiated request only when estimate unavailable (WEB-040X/AA); no separate exceptional shipment review (WEB-040Z); authorised approval (WEB-040AB); unpaid order created automatically (WEB-040AC); admin-configurable quote validity (WEB-040AD); transactional SMTP email with secure order/payment link (WEB-040AE); auto-cancel unpaid order at quote expiry, new request required (WEB-040AF). WEB-040U distance-band minimum, WEB-040V valid free-delivery waiver, WEB-040W product/free-delivery coupons supported but detailed rules OPEN. WEB-040N **only two customer-facing charge components**: discounted all-inclusive product amount plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED.**

### Next independent decision WEB-040AH — Notify customer when unpaid order expires and is cancelled (OPEN)
A. **Send transactional cancellation email (recommended):** after automatic cancellation, send a separate SMTP email with order reference, cancellation reason and a way to submit a fresh delivery-estimate request; do not include a working payment link for the cancelled order.
B. **No cancellation email; show status on order page:** cancellation appears when customer views the secure order page, but no separate email is sent.
C. **Admin-triggered cancellation email:** cancellation is automatic, but staff decides whether to send an email; adds manual work and may leave customers unaware.

**PROPOSED, not locked:** cancellation email should be sent independently from cancellation processing, avoid duplicates on retries, and provide a secure order-status view. Exact email template, retry policy and notification delivery monitoring remain OPEN.

**STILL OPEN:** WEB-040AH cancellation notification, numeric quote validity, made-to-order and insufficient-stock handling, payment/expiry races, manual cancellation and refunds, coupon details, numeric shipping tariffs/thresholds/divisor, parcel aggregation, tax/rounding. **WEB-038 DEFERRED.**

## 2026-10-28 — Automatic SMTP cancellation email on manual quote expiry (WEB-040AH)

**LOCKED (WEB-040AH):** When an approved manual delivery quote expires and Tavistra automatically cancels its **still-unpaid order** (WEB-040AF), send a **transactional cancellation email via Tavistra's own SMTP service**. The notice identifies the original order reference, explains cancellation because the quote/payment deadline passed, states that eligible ready-stock reservations were released (WEB-040AG), and tells the customer to **submit a new delivery-estimate request** to purchase. Do **not** include a usable payment link for the cancelled order. This supersedes the WEB-040AH alternatives of order-page-only status and staff-triggered cancellation emails.

**State boundaries:** expiry cancellation and stock release must not depend on successful email delivery. Failed email does not undo cancellation, release stock again, create another order, or imply payment success. Already-paid orders are not cancelled solely due to expiry and must not receive an unpaid-expiry cancellation notice. Exact notification template, SMTP retry/backoff, delivery tracking, bounce handling, suppression of duplicate sends and customer access to historical order status remain **OPEN/PROPOSED**.

**LOCKED continuity:** WEB-040AA customer-submitted review only for registered pincode with unavailable rates; WEB-040AB permission-gated quote approval; WEB-040AC automatically creates unpaid order; WEB-040AD centrally configurable validity period; WEB-040AE SMTP approval email with secure order/payment link; WEB-040AF automatic expiry cancellation; WEB-040AG ready-stock hold and release. WEB-040N customer sees **discounted all-inclusive product amount plus one combined delivery charge if applicable**, not additional fee lines. WEB-040W supports product and free-delivery coupons but details OPEN. No courier APIs. **WEB-038 cart interaction DEFERRED.**

### Next independent decision WEB-040AI — Insufficient ready stock when approving a manual delivery quote (OPEN)
A. **Block approval/order creation until full ready-stock quantity is available (recommended):** staff can retain the request for follow-up, but approval must not create an unpaid order or promise reserved units if any required ready-stock quantity cannot be reserved. No partial allocation or automatic backorder.
B. **Allow partial reservation with a backorder:** approve/create unpaid order with available units reserved and missing units backordered; requires customer-facing lead-time and fulfilment commitments not yet designed.
C. **Allow approval with a stock exception for staff:** create unpaid order despite shortfall and require staff to resolve it before fulfilment; risk of taking payment without secured ready stock.

**PROPOSED, not locked:** check all required ready-stock variants atomically at approval, prevent overselling, show staff a precise shortfall, and keep request pending without generating an unpaid order. Exact partial-cart and made-to-order rules remain OPEN.

**STILL OPEN:** WEB-040AI insufficient-stock approval policy, made-to-order/quote-only treatment, numeric validity duration, payment expiry races, manual cancellations/refunds, email retries, coupon details, shipping rates and tax/rounding. **WEB-038 DEFERRED.**

## 2026-10-28 — Block manual quote approval if any required ready stock is insufficient (WEB-040AI)

**LOCKED (WEB-040AI):** Before an authorised admin may approve a customer-initiated manual delivery quote and trigger automatic unpaid-order creation (WEB-040AB/AC), Tavistra must confirm **full available quantity for every required ready-stock item/variant** in the request. If any required ready-stock quantity is insufficient, **block quote approval and do not create an unpaid order**. Keep the delivery review request pending for staff follow-up; do not silently reduce quantities, create partial stock reservations, backorder the shortfall or permit a staff override that approves despite shortage. Once full stock becomes available, an authorised admin may approve and the eligible ready-stock units are reserved under WEB-040AG.

**Important boundaries:** this rule applies to **ready-stock** requirements. Made-to-order and quote-only eligibility and any production-capacity checks remain OPEN; do not invent physical stock reservation for made-to-order items. Exact UI shortfall messaging, customer contact, restock timing and concurrency/transaction mechanism remain **OPEN/PROPOSED**. Stock availability verification and reservation must not permit overselling or duplicate holds.

**LOCKED continuity:** WEB-040AA customer-submitted review only for registered pincode with unavailable rates; WEB-040AB authorised admin approval; WEB-040AC automatic unpaid order on approval; WEB-040AD admin-configurable validity; WEB-040AE SMTP approved quote notice; WEB-040AF cancel unpaid order on quote expiry; WEB-040AG reserve ready stock until expiry, release on cancellation, retain allocation after payment; WEB-040AH automatic SMTP cancellation notice. WEB-040W product and delivery coupons supported but detailed rules OPEN. WEB-040N **two customer-facing charge components**: discounted all-inclusive product amount plus one combined delivery charge if applicable. No courier APIs. **WEB-038 cart interaction DEFERRED.**

### Next independent decision WEB-040AJ — Made-to-order items in approved manual-delivery unpaid orders (OPEN)
A. **Include made-to-order items without stock reservation (recommended):** allow eligible made-to-order products in a manual delivery review/unpaid order; do not reserve finished goods that do not yet exist. Production lead-time promises, capacity checks and commencement after payment remain separately OPEN.
B. **Require staff production-capacity confirmation before quote approval:** for any made-to-order item, approval/order creation waits for a separate explicit internal production feasibility confirmation. No finished-stock reservation.
C. **Exclude made-to-order items from this manual delivery workflow:** require a separate order/quote process for made-to-order products even when destination pincode is registered but delivery rates unavailable.

**PROPOSED, not locked:** distinguish stock-managed ready-stock line items from made-to-order lines and never manufacture an artificial inventory hold. Quote-only products remain a separate OPEN question.

**STILL OPEN:** WEB-040AJ made-to-order treatment; quote-only treatment; numeric quote validity period; payment/expiry races; cancellation and refund mechanics; notification retries; coupon rules; shipping rates and tax/rounding. **WEB-038 DEFERRED.**

## 2026-10-28 — Include made-to-order items without finished-stock reservation (WEB-040AJ)

**LOCKED (WEB-040AJ):** Eligible **Made to Order** product lines may participate in the customer-initiated manual delivery quote and subsequent automatically created unpaid order (WEB-040AA/AC) **without requiring or reserving finished-goods inventory**. In a mixed Ready Stock + Made to Order order, apply WEB-040AI full-stock approval gate and WEB-040AG reservation/expiry release **only to Ready Stock line quantities**; Made to Order lines must not consume fictitious finished-stock availability. A made-to-order line does not itself block manual delivery approval merely because no finished unit exists. This supersedes the prior WEB-040AJ OPEN alternatives of mandatory separate production-feasibility approval and excluding Made to Order from this workflow.

**Not implied:** approval of the manual delivery quote, unpaid-order creation or ready-stock reservation does **not** automatically start manufacturing or promise production capacity, lead time or delivery date. Production-start trigger, scheduling/feasibility, materials allocation, lead-time display, customisation, cancellation and refund policy remain OPEN. **Quote Only** product participation remains a separate OPEN decision, not included by implication.

**LOCKED continuity:** WEB-040AB authorised quote approval; WEB-040AC unpaid order on approval; WEB-040AD centrally configured quote validity; WEB-040AE SMTP approved-quote email; WEB-040AF auto-cancel expired unpaid order; WEB-040AG hold ready stock until expiry and release on cancellation; WEB-040AH SMTP cancellation email; WEB-040AI block approval if full Ready Stock quantities unavailable. WEB-040N **two customer-facing charge components**: discounted tax-inclusive merchandise amount plus one combined delivery charge if applicable. WEB-040W coupon capabilities LOCKED but detailed rules OPEN. No courier APIs, independent manual fulfilment. **WEB-038 cart interaction DEFERRED.**

### Next independent decision WEB-040AK — When can production start for Made to Order items? (OPEN)
A. **Only after verified successful payment (recommended):** no production begins from delivery quote approval or unpaid-order creation; production becomes eligible once the payment gateway/server verifies successful payment. Staff scheduling and capacity remain separate OPEN decisions.
B. **After authorised staff approval, even if unpaid:** allow production before payment after explicit internal approval, accepting nonpayment and cancellation exposure.
C. **After a customer deposit is successfully paid:** allow production after verified deposit rather than full payment; requires separate deposit/balance payment model not yet approved and may affect existing checkout assumptions.

**PROPOSED, not locked:** server-side payment verification before production eligibility, distinguish eligible-to-produce from automatically starting work, preserve cancellation and payment race handling. Deposit, production milestone and refund rules OPEN.

**STILL OPEN:** WEB-040AK production-start trigger; Quote Only participation; numeric quote validity; payment/expiry race handling; cancellation/refunds; made-to-order capacity/lead times; SMTP retries; coupon rules; rates/tax/rounding. **WEB-038 DEFERRED.**

## 2026-10-28 — Made to Order production eligibility only after verified full payment (WEB-040AK)

**LOCKED (WEB-040AK):** For eligible **Made to Order** lines in Tavistra's manual-delivery approved unpaid orders, production may become **eligible only after the full payable order amount has been successfully paid and verified through Tavistra's trusted server-side payment process**. A delivery quote approval, creation of an unpaid order, customer's payment attempt, pending gateway state, browser return/success message, partial payment/deposit, or staff approval while unpaid **must not** make production eligible. This supersedes prior WEB-040AK alternatives permitting production based on prepayment staff authorisation or deposit.

**Eligibility is not commencement:** verified full payment removes the payment-related prohibition; it does **not** automatically schedule or begin manufacturing, promise capacity or establish a lead time. Production scheduling/release, feasibility, materials, cancellation/refunds and milestones remain **OPEN**. WEB-040AF cancellation of an expired **unpaid** order must not cancel a verified fully paid order merely because its old quote deadline passes. Precise payment-gateway verification, asynchronous race/reconciliation and refund handling remain OPEN for implementation.

**LOCKED continuity:** WEB-040AJ Made to Order included without finished-stock reservation; WEB-040AI full Ready Stock gate; WEB-040AG Ready Stock held until quote expiry, then released if cancelled; WEB-040AD configured validity; WEB-040AE SMTP approved quote notice; WEB-040AF unpaid expiry cancellation; WEB-040AH SMTP cancellation notice; WEB-040AB/AC permission-gated quote approval and unpaid order creation. **Quote Only** participation remains OPEN. WEB-040W coupon capabilities supported, detailed rules OPEN. WEB-040N **two customer-facing price components**: discounted all-inclusive merchandise amount plus one combined delivery charge if applicable. No courier APIs. **WEB-038 cart interaction DEFERRED.**

### Next independent decision WEB-040AL — Production release after verified full payment (OPEN)
A. **Authorised staff manually releases production (recommended):** after verified full payment, Made to Order lines move to an internal **Awaiting Production Release** state. Only an authorised staff member can explicitly release them to production after checking readiness/capacity. This is not permission to start while unpaid.
B. **Automatically release to production queue:** on verified full payment, Made to Order lines enter an active production queue automatically; staff handles scheduling within that queue. No additional approval gate.
C. **Owner-only manual release:** after verified full payment, only the owner can explicitly release production. Adds a strict gate but a single-person bottleneck.

**PROPOSED, not locked:** separate payment state, production eligibility and production release; audit release actor/time, prevent double release and enforce full-payment condition on the server. Exact roles, production stages and timing remain OPEN.

**STILL OPEN:** WEB-040AL production release after payment; Quote Only participation; numeric validity period; payment/expiry races; production lead times/capacity; cancellation/refunds; email retry; coupon details; delivery rates/tax/rounding. **WEB-038 DEFERRED.**

## 2026-10-28 — Authorised staff manually releases paid Made to Order production (WEB-040AL)

**LOCKED (WEB-040AL):** Once Tavistra has verified **successful full order payment** server-side (WEB-040AK), eligible Made to Order line(s) enter an internal **Awaiting Production Release** state. **Authorised staff must explicitly release** those line(s) for manufacturing after reviewing readiness and capacity. Payment verification alone must **not automatically release or start production**. This supersedes the previous WEB-040AL alternatives of automatic production-queue release and owner-only release. A staff action cannot bypass the verified-full-payment prerequisite.

**Scope and remaining questions:** the permission model for who counts as authorised staff, exact production readiness checklist, scheduling/lead-time commitments, line-vs-order release granularity, state names beyond the proposed waiting state, cancellation/refund handling, and audit details remain OPEN. A release enables production workflow; it is not a guarantee of instantaneous manufacturing or delivery. No stock reservation for unmade finished goods (WEB-040AJ); Ready Stock availability/holds remain separately governed by WEB-040AI/AG.

**LOCKED continuity:** WEB-040AB permission-gated manual delivery quote approval; WEB-040AC creates unpaid order; WEB-040AD admin-configured validity; WEB-040AE SMTP approval notice; WEB-040AF cancels expired unpaid order; WEB-040AG reserves Ready Stock until expiry, releases on unpaid cancellation and retains after payment; WEB-040AH SMTP cancellation notice; WEB-040AI full Ready Stock approval gate; WEB-040AJ Made to Order inclusion without finished-stock reservation; WEB-040AK verified full-payment prerequisite. **Quote Only** workflow remains OPEN. WEB-040W coupon capability supported, details OPEN. WEB-040N **two customer-facing price components only**: discounted all-inclusive product amount and one combined delivery charge if applicable. No courier APIs. **WEB-038 cart interaction DEFERRED.**

### Next independent decision WEB-040AM — Who may manually release production? (OPEN)
A. **Explicit production-release permission (recommended):** any authenticated staff/admin user must be specifically granted production-release permission to release fully paid Made to Order items. Ordinary admin access alone is insufficient. Not owner-only.
B. **Any authenticated admin:** any admin user can release production after full payment; simpler administration but broader authority.
C. **Named production-manager role:** only accounts assigned a fixed Production Manager role can release, without a separately assignable permission; simpler role design but less granular.

**PROPOSED, not locked:** enforce the release permission and verified-full-payment gate on the backend, log actor/time, avoid duplicate release, and support future permission revocation. Exact role names and permission administration remain OPEN.

**STILL OPEN:** WEB-040AM release authority; Quote Only participation; numeric quote validity period; payment/expiry races; production readiness and lead times; cancellations/refunds; SMTP retry; coupon details; delivery rates/tax/rounding. **WEB-038 DEFERRED.**

## 2026-10-28 — Explicit permission required for manual production release (WEB-040AM)

**LOCKED (WEB-040AM):** Only an **authenticated staff/admin user explicitly granted the Production Release permission** may manually release fully paid Made to Order products from **Awaiting Production Release** to the manufacturing workflow. **Ordinary administrator access alone does not grant release authority**, and production release is **not owner-only**; authority may be delegated to specifically permitted staff. The server must enforce this permission **and** the independently locked verified-successful-full-payment prerequisite (WEB-040AK) on each release attempt. This supersedes the prior WEB-040AM alternatives of all-admin release and a fixed Production Manager role as the sole gate.

**Still OPEN:** who may grant/revoke this permission, role/permission administration, naming of permission keys, delegation scope, audit fields, readiness checklist, production scheduling and per-line vs whole-order release granularity. **PROPOSED implementation safeguards (not separately locked):** record actor and timestamp, enforce revocation on subsequent actions, make release idempotent, and reject release if payment is not verified.

**LOCKED continuity:** WEB-040AL explicit manual release after payment, WEB-040AJ Made to Order without finished-stock reservation, WEB-040AI full Ready Stock gate, WEB-040AG Ready Stock reservation, WEB-040AF unpaid-order cancellation on quote expiry, WEB-040AH automatic SMTP cancellation notice, WEB-040AE approval SMTP email, WEB-040AD admin-configured validity, WEB-040AC unpaid order on authorised approval (WEB-040AB). **Quote Only** participation remains OPEN. WEB-040W product/free-delivery coupon capabilities LOCKED but detailed coupon rules OPEN. WEB-040N **two customer-facing price components** only: discounted tax-inclusive product amount plus one combined delivery charge if applicable. No courier APIs; independent manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED.**

### Next independent decision WEB-040AN — Production release granularity for orders with multiple Made to Order items (OPEN)
A. **Release per order line (recommended):** authorised staff may independently release each fully paid Made to Order line after checking its readiness, while other lines remain Awaiting Production Release. Does not imply split delivery or split payment.
B. **Release all Made to Order lines together:** one release action applies to every Made to Order line in the paid order, after all lines are ready.
C. **Both, with staff choice:** authorised staff may release individual lines or the whole order; more flexible, but requires safeguards against mixed release states.

**PROPOSED, not locked:** track production status per eligible line and prevent duplicate releases. Separate partial shipment, customer-facing status and delivery scheduling remain OPEN.

**STILL OPEN:** WEB-040AN production release granularity, Quote Only treatment, exact quote validity duration, payment/expiry races, production lead time/capacity, cancellation/refunds, SMTP retries, coupon details, delivery rates/tax/rounding. **WEB-038 DEFERRED.**

## 2026-10-28 — Individual and whole-order Made to Order production release (WEB-040AN)

**LOCKED (WEB-040AN):** For fully paid Made to Order products, Tavistra supports **both individual order-line production release and whole-order production release**. An authenticated staff member with explicit Production Release permission (WEB-040AM) may choose to release a particular eligible Made to Order line independently, leaving other unreleased lines awaiting production release, or invoke a whole-order release action for eligible Made to Order lines. Both operations must respect verified successful **full order payment** (WEB-040AK), authorised manual release (WEB-040AL) and readiness/capacity review. This supersedes the former WEB-040AN OPEN alternatives restricting release to only one granularity.

**State boundaries:** maintain independently observable release state per Made to Order order line; an individual-line release does not automatically release other lines. Whole-order action is not permission to override payment, authorisation or readiness. Exact behaviour when some lines are already released or not ready, whether bulk action is atomic or releases only ready lines, partial shipment/delivery and customer-facing production status remain OPEN. No automatic production release on payment. No finished-goods inventory reservation for Made to Order (WEB-040AJ). Ready Stock continues under WEB-040AI/AG.

**LOCKED continuity:** WEB-040AB permission-gated manual delivery quote approval; WEB-040AC automatically created unpaid order; WEB-040AD configured validity; WEB-040AE SMTP approval email; WEB-040AF unpaid expiry cancellation; WEB-040AG Ready Stock reservation/release; WEB-040AH SMTP expiry-cancellation email; WEB-040AI full Ready Stock gate; WEB-040AJ Made to Order without finished-stock reservation; WEB-040AK full verified payment; WEB-040AL manual production release; WEB-040AM explicit Production Release permission. **Quote Only** treatment OPEN. WEB-040W coupon capabilities supported but details OPEN. WEB-040N **two customer-facing price components**: discounted tax-inclusive product amount plus one combined delivery charge if applicable. No courier APIs. **WEB-038 cart interaction DEFERRED.**

### Next independent decision WEB-040AO — Whole-order release when some Made to Order lines are not ready (OPEN)
A. **All-or-nothing bulk release (recommended):** if any unreleased Made to Order line fails readiness/capacity review, block the whole-order action and leave all unreleased lines unchanged. Staff can still release individually ready lines using WEB-040AN.
B. **Release only ready lines:** whole-order action releases all ready unreleased Made to Order lines, skipping not-ready ones, and shows a result summary.
C. **Require staff to select lines for bulk release:** whole-order action opens a selection interface; staff chooses which ready lines to release. More flexible, but overlaps individual-line release.

**PROPOSED, not locked:** transactional bulk release with per-line checks, clear staff feedback and idempotency. Exact readiness criteria and production status details OPEN.

**STILL OPEN:** WEB-040AO bulk release semantics, Quote Only participation, numeric quote validity, payment/expiry races, production capacity/lead times, cancellations/refunds, SMTP retries, coupon details, delivery tariffs/tax/rounding. **WEB-038 DEFERRED.**

## 2026-10-28 — All-or-nothing whole-order Made to Order release (WEB-040AO)

**LOCKED (WEB-040AO):** The **Release Whole Order** action is **all-or-nothing for every currently unreleased Made to Order line** in a verified fully paid order. An authenticated staff member with explicit Production Release permission (WEB-040AM) may execute the bulk action only after **every unreleased Made to Order line** passes readiness/capacity checks. If **any** such line is not ready, block the whole-order release and **leave all unreleased lines unchanged**. No silent partial bulk release, no skipping unready lines and no override. Already released lines retain their existing status and are not released a second time. Staff can instead release individually ready lines using WEB-040AN. This supersedes the previous WEB-040AO alternatives of releasing only ready lines or selecting a subset during the whole-order action.

**Operational boundary:** validate server-verified full payment (WEB-040AK), explicit permission (WEB-040AM), and readiness for every target line at execution. The whole-order transition must have **atomic success or no change** for its target unreleased lines; concurrency/idempotency implementation details and audit event format remain OPEN. No automatic production start on payment (WEB-040AL), no finished-stock reservation for Made to Order (WEB-040AJ), and no implied partial delivery or added shipping fees.

**LOCKED continuity:** WEB-040AB/AC permission-gated manual quote approval and unpaid-order creation; WEB-040AD/AE validity and SMTP approval notice; WEB-040AF/AG/AH unpaid expiry cancellation, Ready Stock hold/release, SMTP cancellation notice; WEB-040AI Ready Stock full availability gate; WEB-040AJ Made to Order inclusion; WEB-040AK verified full payment; WEB-040AL manual release; WEB-040AM explicit release permission; WEB-040AN individual and whole-order release. **Quote Only** treatment OPEN; WEB-040W coupon capabilities supported but details OPEN; WEB-040N **two customer-facing components only**, discounted tax-inclusive merchandise plus one combined delivery charge if applicable; no courier APIs; **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040AP — How staff confirms Made to Order readiness before release (OPEN)
A. **Explicit readiness confirmation per line (recommended):** authorised staff records each line as Ready for Production after checking capacity/materials/specifications; release checks this state. The detailed checklist remains separately OPEN.
B. **Confirmation during release only:** staff confirms readiness in the release action itself without a separately stored Ready state; bulk release requires confirmation for every unreleased line.
C. **Automatic readiness from operational data:** the application marks lines ready based on configured data/rules, then authorised staff performs release. Requires reliable capacity/material tracking not yet defined.

**PROPOSED, not locked:** audit readiness confirmation and prevent release when readiness is revoked. Exact permissions for marking readiness, checklist, state transitions and capacity integrations remain OPEN.

**STILL OPEN:** WEB-040AP readiness confirmation; Quote Only participation; numeric validity duration; payment/expiry races; production lead times/capacity; cancellations/refunds; SMTP retries; coupon details; rates/tax/rounding. **WEB-038 DEFERRED.**

## 2026-10-28 — Explicit readiness confirmation per Made to Order line (WEB-040AP)

**LOCKED (WEB-040AP):** Each Made to Order order line must have its own explicitly confirmed **Ready for Production** status, recorded by staff after checking specifications, materials and production capacity. Readiness confirmation is **separate from** manual production release: marking a line ready does not release or begin production. The exact checklist, readiness-confirmation permission, readiness revocation, and audit details remain OPEN. No automatic readiness inference or confirmation solely within the release action replaces this explicit per-line step.

**LOCKED continuity:** WEB-040AK verified successful full payment before production eligibility; WEB-040AL manual release; WEB-040AM explicit Production Release permission; WEB-040AN individual and whole-order release; WEB-040AO all-or-nothing bulk release only if **every currently unreleased Made to Order line** is ready. Previously released lines are unchanged; ready lines can be released individually. WEB-040AJ excludes unmade finished-goods reservation; Ready Stock WEB-040AI/AG unaffected. Quote Only participation OPEN; coupon details OPEN under WEB-040W. WEB-040N retains **two customer-facing price components**: discounted tax-inclusive products and one combined delivery charge if applicable. No courier APIs. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040AQ — Who can confirm line readiness? (OPEN)
A. **Separate explicit Production Readiness permission (recommended):** authenticated staff must be granted readiness-confirmation permission independently of Production Release; a user may hold one or both.
B. **Reuse Production Release permission:** only staff permitted to release production may also mark lines ready; simpler but combines preparation and authorisation.
C. **Any authenticated admin:** any admin can mark a line ready, but only users with explicit Production Release permission can release it; broader readiness authority.

**PROPOSED, not locked:** server-side permission checks, audit of who marked each line ready, and safeguards against stale readiness. Exact role/permission management OPEN.

**STILL OPEN:** WEB-040AQ readiness authority, readiness checklist, Quote Only participation, coupon details, quote validity duration, payment/expiry races, production lead times/capacity, cancellations/refunds, SMTP retries and tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Reuse Production Release permission for readiness (WEB-040AQ)

**LOCKED (WEB-040AQ):** Tavistra uses the **existing explicit Production Release permission (WEB-040AM)** for **both** (1) confirming each Made to Order order line **Ready for Production** (WEB-040AP) and (2) manually releasing eligible production (WEB-040AL). No separate readiness permission or any-admin fallback. Both actions require an authenticated staff/admin user with that explicit permission, checked by the backend. Ordinary admin role alone is insufficient. **Readiness confirmation and production release remain distinct actions/states**; marking ready must not release or start production. Production release still requires server-verified successful **full order payment** (WEB-040AK). This decision does not independently require payment before recording readiness; that sequencing is not newly locked.

**LOCKED continuity:** WEB-040AN individual and whole-order release, WEB-040AO all-or-nothing bulk release when every currently unreleased Made to Order line is ready; WEB-040AJ no finished-stock reservation for Made to Order, Ready Stock WEB-040AI/AG unaffected. Quote Only treatment OPEN; coupon capabilities WEB-040W supported but details OPEN. WEB-040N **two customer-facing price components** only: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040AR — Production readiness checklist structure (OPEN)
A. **Fixed minimum checklist (recommended):** before marking a line ready, authorised staff confirms specifications/design, material availability and production capacity; all three required. Exact fields and evidence rules remain OPEN.
B. **Admin-configurable checklist:** admin can define/change required readiness checks; more flexible, with added configuration and versioning complexity.
C. **Single readiness attestation:** authorised staff marks the line ready with one confirmation, without mandatory individual checklist checks; simplest, less structured control.

**PROPOSED, not locked:** record readiness actor/time and a concise note, and revisit readiness if product specifications change. Exact checklist, evidence, permission delegation and readiness revocation remain OPEN.

**STILL OPEN:** WEB-040AR checklist structure; Quote Only participation; coupon details; numeric quote validity; payment/expiry races; lead times/capacity; cancellations/refunds; SMTP retries; tax and rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Single readiness attestation without mandatory checklist (WEB-040AR)

**LOCKED (WEB-040AR):** An authenticated staff/admin user with the existing explicit **Production Release** permission (WEB-040AQ/AM) marks an individual Made to Order order line **Ready for Production** through **one explicit readiness attestation**. **No mandatory multi-item checklist, individual specifications/materials/capacity checkboxes, or required supporting readiness fields** may be imposed as a prerequisite to recording this confirmation. Staff is still responsible for evaluating practical readiness; the application does not infer readiness automatically. This supersedes the earlier WEB-040AR proposed fixed and configurable mandatory checklists and clarifies earlier references to staff reviewing specifications/materials/capacity as professional judgement, not required form fields.

**Separate states and safeguards remain LOCKED:** readiness confirmation alone does not release or start manufacturing (WEB-040AP/AL). Actual production release still requires separately recorded readiness, trusted server-side verified **full order payment** (WEB-040AK), explicit Production Release permission (WEB-040AM/AQ), and manual action. Both individual and whole-order release are supported (WEB-040AN); whole-order release is all-or-nothing if any currently unreleased Made to Order line is not ready (WEB-040AO). No finished-stock reservation for unmade products (WEB-040AJ). Readiness attestation need not wait for payment unless separately decided; payment remains required before release.

**OPEN:** readiness revocation and handling changed specifications/capacity, actor/time audit details, optional notes, production lead times, cancellation/refunds and operational state machine. **Quote Only** treatment OPEN. Coupon capability WEB-040W remains supported with details OPEN. WEB-040N retains **two customer-facing price components** only: discounted tax-inclusive product amount plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040AS — Can staff withdraw Ready for Production before release? (OPEN)
A. **Allow explicit withdrawal before release (recommended):** authorised staff can change a not-yet-released line from Ready for Production back to Not Ready, e.g. if specifications, materials or capacity change. A subsequent release requires fresh readiness confirmation. Already released lines follow a separate production-change/cancellation policy.
B. **Readiness confirmation irreversible:** once marked Ready, the line cannot return to Not Ready; staff must resolve changes outside this readiness status before releasing. Simpler but risks stale readiness.
C. **Withdrawal only with mandatory reason:** permitted staff can withdraw readiness before release, but must enter a reason. More traceability, additional required interaction only for withdrawal.

**PROPOSED, not locked:** audit each readiness transition and re-check readiness at release. Exact audit data and post-release change rules OPEN.

**STILL OPEN:** WEB-040AS readiness withdrawal, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, production capacity/lead times, cancellations/refunds, SMTP retries, delivery rates/tax/rounding. **WEB-038 DEFERRED.**

## 2026-10-28 — Irreversible Made to Order readiness confirmation (WEB-040AS)

**LOCKED (WEB-040AS):** Once a Made to Order order line is explicitly marked **Ready for Production** by authenticated staff holding the Production Release permission (WEB-040AQ), the readiness attestation is **irreversible**: it cannot be withdrawn, reset or changed back to Not Ready, including before production release. This supersedes the earlier WEB-040AS options to permit withdrawal with or without a mandatory reason. Preserve readiness as a historical confirmation, not a guarantee that later operational conditions cannot change.

**LOCKED continuity:** WEB-040AR single readiness attestation without mandatory checklist; WEB-040AP separate readiness and release actions; WEB-040AK full verified payment before production eligibility; WEB-040AL manual release; WEB-040AM/AQ shared explicit Production Release permission; WEB-040AN individual and whole-order release; WEB-040AO all-or-nothing bulk release when every currently unreleased line is ready. No automatic production start or override of payment/permissions. WEB-040AJ Made to Order requires no finished-stock reservation; WEB-040AI/AG Ready Stock rules unchanged. Quote Only treatment OPEN; coupon capabilities supported but details OPEN; WEB-040N **two customer-facing price components only**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; **WEB-038 cart interaction DEFERRED**.

**Risk left OPEN:** readiness may become stale if materials, specifications or capacity change after attestation. Irreversibility does not itself authorise production under known unsafe/unworkable conditions. A separate pre-release operational hold mechanism, if any, needs an independent decision; do not silently implement readiness withdrawal.

### Next independent decision WEB-040AT — Operational hold after irreversible readiness, before production release (OPEN)
A. **Separate pre-release hold (recommended):** authorised staff can place a distinct operational hold on an already-ready, not-yet-released Made to Order line. Readiness remains permanently Ready; the hold independently blocks individual and whole-order release until resolved. Hold permissions, reason and clearance policy are later decisions.
B. **No formal hold; staff simply refrain from release:** retain irreversible Ready state and rely on staff to avoid releasing lines with operational problems. Fewer states, weaker safeguard against accidental release.
C. **Order-wide operational hold only:** staff can block release for every Made to Order line in an order, not individual lines; simpler but delays unrelated ready lines.

**PROPOSED, not locked:** separate hold state from readiness, enforce hold checks server-side and ensure a whole-order release fails atomically if any target line is held. Exact hold authority and clearing rules OPEN.

**STILL OPEN:** WEB-040AT pre-release hold, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, production lead times/capacity, cancellations/refunds, SMTP retries, rates/tax/rounding. **WEB-038 DEFERRED.**

## 2026-10-28 — No formal pre-release operational hold (WEB-040AT)

**LOCKED (WEB-040AT):** Tavistra will **not** implement a distinct pre-release operational hold state, hold/unhold action, hold reason field, or order-wide hold solely to address changes after Made to Order readiness confirmation. This supersedes the earlier WEB-040AT proposals for per-line and order-wide operational holds. When materials, specifications or capacity change after an irreversible Ready for Production attestation (WEB-040AS), staff must **refrain from manually releasing** the affected line until the problem is resolved. The readiness attestation stays Ready and cannot be reversed; absence of a hold must not be described as proof that conditions remain favourable.

**LOCKED continuity:** WEB-040AR single readiness attestation without mandatory checklist; WEB-040AQ existing explicit Production Release permission for readiness and release; WEB-040AP separate readiness/release actions; WEB-040AK verified full payment before release; WEB-040AL manual production release; WEB-040AN individual and whole-order release; WEB-040AO whole-order release is all-or-nothing if any currently unreleased Made to Order line is not Ready. The whole-order readiness gate checks the recorded readiness state, not unstored operational issues; authorised staff must use judgement and refrain from invoking it if known conditions prevent production. Do not add a hidden operational-hold gate. WEB-040AJ no reservation of nonexistent Made to Order finished stock; WEB-040AI/AG Ready Stock rules unchanged.

**Trade-off:** stale readiness can persist, and there is no formal machine-enforced block for later operational issues; responsibility remains with permitted staff at release. Post-release changes/cancellations and any audit requirements remain OPEN. **Quote Only** treatment OPEN; coupon capabilities WEB-040W supported with details OPEN; WEB-040N **two customer-facing price components only**, discounted tax-inclusive product amount plus one combined delivery charge if applicable. No courier APIs, manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040AU — Confirmation before the final production-release action (OPEN)
A. **Explicit final confirmation dialog (recommended):** before executing an individual or whole-order release, show a confirmation identifying target lines and warning that production is being authorised; staff confirms. No new checklist or hold.
B. **Single-click production release:** authorised staff clicks Release and it executes immediately once existing backend gates pass; fastest, more accidental-release risk.
C. **Mandatory typed confirmation:** require staff to type a phrase or order reference before release; strongest friction, slower daily work.

**PROPOSED, not locked:** display exact target lines, make whole-order action unmistakable, preserve backend payment/permission/readiness checks. Exact confirmation UI and audit events remain OPEN.

**STILL OPEN:** WEB-040AU release confirmation interaction, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Single-click production release without extra confirmation (WEB-040AU)

**LOCKED (WEB-040AU):** Authenticated staff with explicit Production Release permission can invoke **Release for Production** for an individual eligible Made to Order line or **Release Whole Order** directly with a **single click**. If existing server-side gates pass, the action executes without an additional confirmation dialog, typed phrase, mandatory reason, or checklist. This supersedes WEB-040AU proposals for confirmation dialog and typed confirmation. The UI must clearly label the target line or whole-order scope **before** the click; the button is not a bypass for permission or payment rules.

**LOCKED continuity:** WEB-040AK server-verified full order payment before release, WEB-040AM/AQ explicit shared Production Release permission, WEB-040AP/AR one explicit per-line readiness attestation without checklist, WEB-040AS irreversible readiness, WEB-040AT no formal pre-release hold, WEB-040AL manual release distinct from readiness, WEB-040AN individual/whole-order release, WEB-040AO all-or-nothing whole-order release if every currently unreleased line is ready. Whole-order action changes none of its target unreleased lines if the gate fails. Staff must refrain from release when known operational conditions are unsuitable; no hidden hold is introduced. WEB-040AJ no reservation of nonexistent Made to Order finished stock; Ready Stock WEB-040AI/AG unaffected.

**OPEN:** duplicate-click/concurrent retry behaviour and exact production-release audit events; do not assume confirmation or undo mechanisms. Quote Only treatment OPEN; coupon capabilities WEB-040W supported, details OPEN. WEB-040N **two customer-facing price components**: discounted tax-inclusive merchandise plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040AV — Duplicate production-release attempts (OPEN)
A. **Idempotent release (recommended):** repeated click/retry for a line already released must not trigger another production release or duplicate work; return existing released status. For whole-order release, operate only on still-unreleased lines.
B. **Block repeat with error:** repeated click/retry returns an Already Released error without re-releasing anything; explicit error rather than successful status.
C. **Require manual review of repeats:** repeated requests create an admin review event and do not automatically re-release; more operations burden.

**PROPOSED, not locked:** disable buttons during in-flight requests and keep a durable release audit. Exact retry response and audit semantics OPEN.

**STILL OPEN:** WEB-040AV duplicate release handling, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Reject duplicate production release with Already Released error (WEB-040AV)

**LOCKED (WEB-040AV):** An attempt to release a Made to Order line that has **already been released** must be rejected with an explicit **Already Released** error and must **never** initiate a second production release. This applies to double-clicks, concurrent requests and retries after slow or lost responses. Do **not** return a successful idempotent release result and do not create a manual duplicate-review workflow; these superseded WEB-040AV alternatives are NOT approved. The original successful release remains recorded and unchanged.

For **whole-order release**, only **currently unreleased Made to Order lines** are targets (WEB-040AN/AO). Previously released lines are not re-released and do not by themselves block a valid bulk release of remaining lines. If **none** remain unreleased, return **Already Released** without changes. If unreleased target lines exist, require every target to be Ready for Production and execute the whole-order release all-or-nothing (WEB-040AO). In races, enforce uniqueness/conditional transitions atomically so concurrent requests cannot both trigger release; the losing duplicate request receives Already Released and must not partially mutate the target set. The precise API status code and UI copy beyond the named error remain OPEN.

**LOCKED continuity:** WEB-040AU single-click release without confirmation, WEB-040AR single readiness attestation without mandatory checklist, WEB-040AS irreversible readiness, WEB-040AT no formal pre-release hold, WEB-040AQ/AM explicit Production Release permission for readiness and release, WEB-040AK verified full payment before release, WEB-040AL manual release. No automatic release on payment. Quote Only treatment OPEN; WEB-040W coupon details OPEN; WEB-040N **two customer-facing price components only**: discounted tax-inclusive product amount plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040AW — Production release audit record (OPEN)
A. **Automatic minimal audit record (recommended):** on each successful release, persist staff identity, timestamp, order and line identifiers, and individual-versus-whole-order action. No staff note required. Duplicate errors do not create another successful-release record.
B. **Detailed audit with mandatory note:** require staff to enter a release reason/note before executing the release, plus actor, timestamp and affected lines. Adds friction to the locked single-click action and would require revisiting that rule.
C. **Status and timestamp only:** store Released status and time, without separately identifying who initiated it; simplest but weak accountability.

**PROPOSED, not locked:** audit integrity, retention and treatment of failed attempts. Exact release audit fields remain OPEN until WEB-040AW approval.

**STILL OPEN:** WEB-040AW release audit, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Automatic minimal production release audit (WEB-040AW)

**LOCKED (WEB-040AW):** For **every successful** manual Made to Order production release, automatically record (1) the authenticated releasing staff identity, (2) a server-generated release timestamp, (3) the order identifier, (4) the specific Made to Order order-line identifiers actually released, and (5) whether the action was an **individual-line** or **whole-order** release. No mandatory staff reason/note, additional confirmation, or separate audit-entry interaction. This approves option A and rejects the mandatory-note and status/time-only alternatives.

For **Release Whole Order**, audit only the currently unreleased lines that the successful atomic operation actually transitions; already released lines are not newly released or counted as new release events (WEB-040AO/AV). A duplicate/rejected **Already Released** request must **not** produce a second successful-release audit record. Preserve the relationship between each successful transition and its audit record; exact storage transaction, audit immutability/retention and treatment of rejected attempts are not yet separately approved. Do not confuse a failed-attempt event (if later approved) with a successful-release audit.

**LOCKED continuity:** WEB-040AU direct single-click release without additional confirmation; WEB-040AV reject duplicate release with Already Released; WEB-040AK server-verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR separately recorded per-line readiness with no mandatory checklist; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual and whole-order actions; WEB-040AO all-or-nothing whole-order release. Quote Only treatment OPEN; WEB-040W coupon details OPEN; WEB-040N **two customer-facing price components only**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040AX — Audit of rejected production release attempts (OPEN)
A. **Log every rejected attempt (recommended):** record staff identity (when known), timestamp, target scope and order/line IDs, and a controlled failure reason for rejected release requests, including Already Released, permission, payment and readiness failures. Keep these clearly separate from successful-release audit events. More traceability, with additional log volume.
B. **Log only security/payment gate failures:** retain audit of permission and verified-payment rejections, but do not separately audit Already Released or readiness failures. Less noise, weaker retry/operations diagnosis.
C. **No separate failed-attempt audit:** rely on returned errors and successful-release audit alone. Simplest storage, weakest investigation trail.

**PROPOSED, not locked:** avoid secrets and customer personal data in events, apply access control and sensible retention, and protect against repeated-click event floods. Exact retention, integrity, event fields and audit of readiness attestations remain OPEN.

**STILL OPEN:** WEB-040AX rejected-attempt audit, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Audit every rejected production-release attempt (WEB-040AX)

**LOCKED (WEB-040AX, Option A):** Tavistra must create a distinct **rejected production-release attempt** audit event for **every rejected Made to Order release request**, including duplicate/**Already Released** requests, failed explicit Production Release permission checks, missing/unverified successful full-order payment, and failed readiness checks. The record contains server timestamp, authenticated staff identity where known (otherwise an unauthenticated/unknown marker), the requested **individual-line** or **whole-order** action, known order and target line identifiers, and a controlled rejection reason. If a rejected request lacks valid identifiers, record only the identifiers actually known; do not fabricate them.

**Separation of outcomes:** A rejected attempt is **not** a successful release and must never generate a second successful-release audit (WEB-040AW), start production, alter per-line release state or partially mutate whole-order targets (WEB-040AO/AV). Preserve the explicit **Already Released** error behaviour and the single-click release interaction (WEB-040AU). The rejected-attempt audit is automatic; staff must not enter a note or perform an extra confirmation. Avoid payment secrets, access tokens and unnecessary customer personal data in event payloads; precise storage, durability on logging failures, integrity, access control, retention and flood protection remain OPEN.

**LOCKED continuity:** WEB-040AW minimal actor/time/order/line/scope audit for successful releases; WEB-040AV duplicate release rejection; WEB-040AK trusted full-payment gate; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no pre-release hold; WEB-040AN individual/whole-order actions; WEB-040AO atomic whole-order release. Quote Only treatment OPEN; WEB-040W coupon details OPEN; WEB-040N **two customer-facing price components only**: discounted tax-inclusive product amount plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040AY — Production-release audit integrity model (OPEN)
A. **Protected append-only audit records (recommended):** store successful-release and rejected-attempt audit events as separate, durable, append-only records. Do not allow ordinary staff/admin edits or deletions; use a subsequent linked correction event if a factual correction is required. Access, retention and storage-failure handling to be decided separately.
B. **Editable audit records with revision history:** privileged admins can correct an existing event while keeping old versions. Easier to amend but greater mutation and access-control risk.
C. **Ordinary application logs only:** rely on operational logging rather than a dedicated append-only audit record. Less structured, weaker long-term traceability.

**PROPOSED, not locked:** exact persistence schema, tamper-evidence method, retention duration, permission to view audit events, behaviour on audit-write failure and log-volume controls.

**STILL OPEN:** WEB-040AY audit integrity, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Protected append-only production release audit (WEB-040AY)

**LOCKED (WEB-040AY, Option A):** Both successful Made to Order production-release events (WEB-040AW) and rejected production-release attempt events (WEB-040AX) must be stored as **separate, durable, protected append-only audit records**. Ordinary staff and administrators must not edit or delete historical audit events, including actors, timestamps, targets, scopes or outcomes. If a factual correction is needed, **append a new correction event linked to the original event**, preserving the original event and an understandable correction trail. Do not implement editable-with-revision-history records or rely solely on ordinary application logs as the authoritative release audit.

**Scope boundary:** Append-only governs the integrity of events while retained. It does **not** imply indefinite retention or grant any staff member permission to view the audit. Exact retention period and controlled disposition, read permissions, correction authorisation, tamper-evidence mechanism, schema, and audit-write failure handling remain OPEN. No cryptographic guarantees or immutability technology are silently mandated. Audit integrity does not change the existing single-click release, server-side gates, all-or-nothing bulk release, duplicate Already Released response, or the separation between successful-release and rejected-attempt audit events.

**LOCKED continuity:** WEB-040AW automatic success audit (staff, server time, order/affected lines, individual/whole-order scope); WEB-040AX every rejected attempt logged separately with controlled reason; WEB-040AV no duplicate release; WEB-040AU single-click release; WEB-040AK full verified payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness without checklist; WEB-040AS irreversible readiness; WEB-040AT no pre-release hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only treatment OPEN; WEB-040W coupon details OPEN; WEB-040N **two customer-facing price components only**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040AZ — Audit persistence failure during production release (OPEN)
A. **Atomic release and successful-release audit (recommended):** a successful production-release state transition and its append-only success-audit event must commit together; if the audit cannot be durably written, do not release or start production. Rejected requests remain rejected; if their failure-audit write fails, surface an operational error/alert without converting the rejection to success. Exact alert/fallback mechanism remains OPEN.
B. **Transactional outbox:** atomically commit release and a durable outbox record; asynchronously materialise the append-only success-audit event, retrying failures. Release can succeed before the final audit event exists, but not without a durable outbox record.
C. **Best-effort audit:** commit release even if success-audit persistence fails, and attempt later logging/alerting. Least blocking but risks gaps in the required audit history.

**PROPOSED, not locked:** the success-audit write-failure behaviour, whether a durable outbox is permitted, rejected-attempt logging failure handling, operational alert delivery, and retry/reconciliation semantics. Retention and access remain OPEN.

**STILL OPEN:** WEB-040AZ audit persistence failures, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Atomic production release and successful audit (WEB-040AZ)

**LOCKED (WEB-040AZ, Option A):** Every successful manual Made to Order production release must **atomically commit** the authorised state transition of its eligible order-line target(s) **together with** the corresponding durable, protected, append-only successful-release audit record (WEB-040AW/AY). A successful release must not be reported, production must not start, and no release state may persist unless the audit record is durably written in the same atomic commit. If the audit write fails, the release is rolled back/not committed; surface a failure rather than a successful release. Do not implement the superseded asynchronous outbox-as-final-audit or best-effort audit alternatives as the approved policy. For whole-order release, retain WEB-040AO all-or-nothing semantics across all currently unreleased target lines and their success-audit record.

**Rejected requests:** A failed gate or **Already Released** request stays rejected, without production or successful-release audit. Every rejected attempt is still subject to WEB-040AX's separate append-only failure-audit requirement. If the failure-audit record itself cannot be persisted, **surface an operational error/alert** without converting the rejected attempt into a success or altering release state. Exact operational alert delivery, error prioritisation/response code, retry/recovery, durability on infrastructure outage and alert-flood handling remain OPEN; do not silently treat an audit failure as success.

**LOCKED continuity:** WEB-040AY append-only protected audits and linked corrections; WEB-040AW success-audit fields; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR single per-line readiness attestation; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual and whole-order release; WEB-040AO atomic whole-order release. Quote Only treatment OPEN; WEB-040W coupon details OPEN; WEB-040N **two customer-facing price components only**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BA — Production release audit viewing permission (OPEN)
A. **Dedicated Audit Viewer permission (recommended):** only authenticated staff explicitly granted a separate **Production Audit View** permission may read successful-release, rejected-attempt and linked correction events. Production Release permission alone and general admin access do not implicitly grant audit viewing. Assignment rules and correction authority remain separate.
B. **Reuse Production Release permission:** any staff member authorised to confirm readiness/release production may also read the full release audit, without an additional grant. Simpler but broadens access to failed-attempt/security records.
C. **All administrators:** all authenticated administrative users may view release audits without a special permission. Easiest access, least restrictive.

**PROPOSED, not locked:** permission naming, exact UI/API surfaces, scoped vs global audit visibility, correction-authorisation rights, retention and operational alert routing. Audit viewing does not imply editing or deleting append-only events.

**STILL OPEN:** WEB-040BA audit viewing access, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — All administrators may view production release audit (WEB-040BA)

**LOCKED (WEB-040BA, Option C):** All **authenticated Tavistra administrative users** can **view** the Made to Order production-release audit history, including successful-release events (WEB-040AW), rejected release attempts (WEB-040AX), and linked factual-correction events (WEB-040AY), **without** a separate Production Audit View grant. Production Release permission is **not** required for audit viewing, and audit viewing does **not** grant Production Release permission. Enforce the administrative-access check on the backend, not solely by hiding the UI. This supersedes WEB-040BA options requiring a dedicated audit-view permission or reusing Production Release permission for reading.

**Read-only boundary:** Audit viewing must not allow editing or deleting append-only audit events (WEB-040AY), appending correction events, bypassing WEB-040AZ atomic audit requirements, or initiating release. Correction-event authority, audit listing/detail API design, visibility scopes, sensitive-field presentation, retention and access-event auditing remain OPEN. Do not silently introduce public/customer audit access.

**LOCKED continuity:** WEB-040AZ atomic successful-release/audit commit and operational error on failed rejection logging; WEB-040AY protected append-only history; WEB-040AW success audit; WEB-040AX all rejection attempts audited; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission for readiness/release; WEB-040AP/AR single readiness attestation; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only treatment OPEN; WEB-040W coupon details OPEN; WEB-040N **two customer-facing price components only**: discounted tax-inclusive product amount plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BB — Authority to append audit correction events (OPEN)
A. **Dedicated Audit Correction permission (recommended):** only authenticated staff explicitly granted a separate **Production Audit Correct** permission may append a linked factual-correction event. General admin/audit-view access and Production Release permission alone are insufficient. Original audit records remain unchanged.
B. **Any administrator:** all authenticated administrators who can view audit history may also append linked correction events. Simpler but gives broad authority to create corrections.
C. **Designated system owner only:** restrict human-initiated correction events to the named system owner account/process. Tightest human access, but creates an operational bottleneck and requires owner availability.

**PROPOSED, not locked:** exact correction event payload, reason requirements, authorisation and review workflow. All options retain append-only linked corrections rather than modifying the original event.

**STILL OPEN:** WEB-040BB correction-event authority, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Dedicated audit correction permission (WEB-040BB)

**LOCKED (WEB-040BB, Option A):** Appending a linked factual-correction event to a Made to Order production-release audit requires an authenticated staff identity with the separately granted **Production Audit Correct** permission. Backend authorisation must enforce this rule for every correction-event write. **Ordinary administrative access** (including WEB-040BA's all-administrator read permission), **Production Release** permission and general audit viewing alone **do not** grant correction authority. This approves a dedicated correction permission and rejects correction rights for all administrators or a designated-owner-only restriction.

**Protected history:** A permitted correction creates a **new, linked append-only event** that references the original successful-release, rejected-attempt or earlier correction record as appropriate. It must not edit or delete the original audit event (WEB-040AY), change actual production-release state, bypass payment/readiness/permission gates, or initiate production. The exact correction-event payload, mandatory reason, review/approval workflow, correction visibility for non-admin staff and audit access presentation remain OPEN; no blanket read privilege is implied by correction permission.

**LOCKED continuity:** WEB-040BA all authenticated administrators may view release audit records; WEB-040AZ successful release and audit commit atomically; WEB-040AY protected append-only history; WEB-040AW successful-release audit fields; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness attestation; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only treatment OPEN; WEB-040W coupon details OPEN; WEB-040N **two customer-facing price components only**: discounted tax-inclusive product amount plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BC — Content of linked audit correction events (OPEN)
A. **Structured correction with mandatory reason (recommended):** require a reference to the original audit event, the field being corrected, the replacement value, and a mandatory explanation. Automatically record the correcting actor and server timestamp. Preserve the original value in the unchanged source event and link the correction to it; never rewrite historical events.
B. **Mandatory free-text explanation only:** link to the original event and record actor/time plus a required narrative correction, without a structured field or replacement value. Flexible but harder to validate or report on.
C. **Minimal correction with optional reason:** link to the original event and store the corrected information with actor/time, but do not require an explanation. Least friction, weaker accountability.

**PROPOSED, not locked:** exact correction fields, validation and mandatory explanation; correction review/approval, audit retention, access presentation and operational alert delivery remain separate OPEN matters.

**STILL OPEN:** WEB-040BC correction event content, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Structured audit correction with mandatory reason (WEB-040BC)

**LOCKED (WEB-040BC, Option A):** A factual correction to a Made to Order production-release audit record is represented only by a **new protected append-only correction event**. The correction must include (1) a reference to the original audit event, (2) an identified field being corrected, (3) its replacement value, and (4) a **mandatory explanation** describing why the correction is needed. Automatically persist the authenticated correcting staff identity and a server-generated timestamp. Validate the referenced event and field server-side; do not accept a correction without the required structured information or reason. This supersedes narrative-only and optional-reason correction alternatives.

**Integrity and authority:** WEB-040BB requires explicit **Production Audit Correct** permission for any human correction-event append. The source event, including its original field value, remains unchanged; readers can see the correction linked to the source rather than a silent overwrite (WEB-040AY). A correction is an audit annotation and must not alter actual payment, readiness, release state or production activity. Do not reinterpret a rejected attempt as a successful release or change the historical outcome. The precise field allowlist, sensitive-data validation, correction chain presentation, second-person review and approval process remain OPEN.

**LOCKED continuity:** WEB-040BA all authenticated administrators can view release audit history, but viewing does not grant correction authority; WEB-040AZ atomic successful-release/audit commit; WEB-040AY append-only audit; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only treatment OPEN; WEB-040W coupon details OPEN; WEB-040N **two customer-facing price components only**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BD — Audit correction review workflow (OPEN)
A. **Direct append by authorised corrector (recommended):** staff with Production Audit Correct permission may append a validated, fully explained linked correction immediately, with no separate approval. The original and correction remain visible in the append-only trail.
B. **Two-person pre-approval:** a second authorised reviewer must approve the proposed correction before the correction event is appended. Adds oversight but delays correction and requires a pending-review workflow.
C. **Immediate append with subsequent review:** a permitted corrector appends immediately, then a separate reviewer acknowledges or flags it afterward through additional append-only review events. Adds follow-up operations without blocking initial correction.

**PROPOSED, not locked:** the correction review/approval policy, reviewer permission, review event structure and exact correction-field validation. Audit retention, access presentation and operational alert delivery remain OPEN.

**STILL OPEN:** WEB-040BD correction review workflow, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Immediate audit correction with subsequent independent review (WEB-040BD)

**LOCKED (WEB-040BD, Option C):** Authenticated staff with explicit **Production Audit Correct** permission (WEB-040BB) may append a valid, structured, reasoned correction event (WEB-040BC) **immediately without a pre-approval gate**. Each such correction **must subsequently be reviewed by a different person**. The reviewer records one of two outcomes, **Acknowledged** or **Flagged**, as a **new linked, protected append-only review event** referring to the correction. The reviewer cannot be the person who submitted that correction. The correction remains appended while review is pending and after review; review cannot erase, overwrite, or silently reverse the original or correction event. Flagging identifies a concern for follow-up, not an automatic change to production-release state or a deletion of the correction.

**Review separation:** A review event must be distinguishable from the original production-release success/rejection and the correction event. Automatically capture reviewer identity and server timestamp when a review is submitted; the review must be linked to the correction it evaluates. The exact reviewer authorisation, deadline, pending-review presentation, notification/escalation and handling of flagged corrections remain OPEN. Do not imply that ordinary administrative audit viewing (WEB-040BA) grants review authority without a separate decision. WEB-040AZ's atomic successful-release/audit guarantee is unchanged.

**LOCKED continuity:** WEB-040BB dedicated Production Audit Correct permission; WEB-040BC correction reference/field/replacement/mandatory reason plus actor/time; WEB-040BA all administrators may read release audits; WEB-040AY append-only protected audit history; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AZ atomic successful-release/audit commit; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only treatment OPEN; WEB-040W coupon details OPEN; WEB-040N **two customer-facing price components only**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BE — Authority for independent audit correction review (OPEN)
A. **Dedicated Production Audit Review permission (recommended):** only authenticated staff explicitly granted **Production Audit Review** permission can acknowledge or flag a correction, and the reviewer must be different from the correcting actor. General admin/audit-view, Production Release and Production Audit Correct permissions alone do not confer review authority. Distinct grant supports independent oversight.
B. **Any administrator except the corrector:** any authenticated administrative user may review a correction they did not create. No extra permission, but a broader review pool.
C. **Any other Production Audit Correct holder:** a different staff member with Production Audit Correct permission may review. Reuses a permission, but correction and review authority are not separated.

**PROPOSED, not locked:** reviewer permission, exact review event fields, review timing, pending-review alerts, and flagged-correction escalation. All options preserve the different-person requirement and append-only outcome records.

**STILL OPEN:** WEB-040BE reviewer authority, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Any other administrator may review audit corrections (WEB-040BE)

**LOCKED (WEB-040BE, Option B):** Any **authenticated Tavistra administrative user** may review a Made to Order production-release audit correction that **they did not create**. Enforce both current administrative status and a strict **reviewer identity differs from correcting actor** rule on the backend for every review event. No dedicated Production Audit Review permission is required, and reviewers need not hold Production Audit Correct or Production Release permission. This chooses the broad administrative review pool rather than a dedicated reviewer grant or correction-permission-only reviewers.

**Append-only review outcome:** The reviewer must select **Acknowledged** or **Flagged**; record the review as a **new linked protected append-only event** referring to the correction, with authenticated reviewer identity and server timestamp (WEB-040BD). The review cannot edit/delete the original audit event, the correction, or earlier reviews, cannot change production-release state, and does not grant permission to create a correction. Creating corrections remains restricted to **Production Audit Correct** (WEB-040BB), with the original-event reference, field, replacement value and mandatory explanation (WEB-040BC). The correction may be appended immediately and remains recorded while review is pending. Exact review deadline, notifications, overdue handling, multiple-review policy and flagged-correction escalation remain OPEN.

**LOCKED continuity:** WEB-040BA all administrators may view audit history; WEB-040AZ atomic successful-release/audit commit; WEB-040AY protected append-only audit; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only treatment OPEN; WEB-040W coupon details OPEN; WEB-040N **two customer-facing price components only**: discounted tax-inclusive product amount plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BF — Deadline for independent audit correction review (OPEN)
A. **Within 72 calendar hours (recommended):** require a different administrator to record Acknowledged or Flagged within 72 hours after the correction event's server timestamp. Keeps corrections from lingering unreviewed; precise reminders and overdue escalation to be decided separately.
B. **Within seven calendar days:** require independent review within seven days after correction creation. More staffing flexibility, longer unreviewed period.
C. **No fixed deadline:** review remains mandatory but has no time limit. Least scheduling pressure, highest risk of indefinitely pending reviews.

**PROPOSED, not locked:** the review deadline, overdue notifications/escalation and exceptions. The reviewer identity separation and append-only review event are already LOCKED.

**STILL OPEN:** WEB-040BF correction review timing, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — No fixed deadline for independent audit correction review (WEB-040BF)

**LOCKED (WEB-040BF, Option C):** There is **no fixed deadline** for the subsequent independent administrative review of a Made to Order production-release audit correction. Review remains **mandatory** under WEB-040BD and WEB-040BE: a different authenticated administrator must eventually record **Acknowledged** or **Flagged** through a new, linked, protected append-only review event. A correction with no valid independent review remains **Pending Review**, regardless of age. Do not automatically acknowledge, flag, expire, close, or mark the correction approved merely because time has passed; do not implement a 72-hour or seven-day compliance deadline.

**Integrity and separation:** WEB-040BB permits only staff with **Production Audit Correct** permission to append the original structured correction, with original-event reference, corrected field, replacement value and mandatory reason (WEB-040BC). Any other authenticated administrator may review it, but the author may not self-review (WEB-040BE). A correction and its later review are separate append-only records and neither alters the original release audit or actual production-release state (WEB-040AY/AZ). No fixed review deadline does not waive the need to make pending work discoverable; the UI/queue, optional reminders, flagged-case follow-up, and multiple-review handling remain OPEN.

**LOCKED continuity:** WEB-040BA all administrators can read release audits; WEB-040AZ atomic release/success-audit commit; WEB-040AY protected append-only records; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only treatment OPEN; WEB-040W coupon details OPEN; WEB-040N **two customer-facing price components only**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BG — Visibility of audit corrections pending independent review (OPEN)
A. **Dedicated pending-review queue (recommended):** provide authenticated administrators a dedicated view listing corrections without a valid independent review, with source-event link, correcting actor, timestamp and review action. Exclude the author from reviewing their own correction. No fixed deadline or automatic escalation is implied.
B. **Pending filter in the audit history:** expose pending corrections through a filter in the existing admin audit history, with review actions from the filtered results. Fewer screens, but pending work is less prominent.
C. **Correction-detail-only visibility:** show Pending Review on each correction's detail page, with no aggregate pending list or filter. Simplest UI, but easy to overlook mandatory reviews.

**PROPOSED, not locked:** pending-review discovery UI, notification/reminder rules, and flagged-correction escalation. No fixed review deadline is already LOCKED.

**STILL OPEN:** WEB-040BG pending-review visibility, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Dedicated pending audit correction review queue (WEB-040BG)

**LOCKED (WEB-040BG, Option A):** Provide a **dedicated Pending Audit Correction Review queue** available to authenticated Tavistra administrators. It lists every Made to Order production-release audit correction **without a valid independent Acknowledged or Flagged review event**, including the original audit event reference/link, correcting actor, correction timestamp and structured correction details (WEB-040BC). Offer a path to open the correction and record an independent review. An administrator may see their own pending correction but must **not** be allowed to acknowledge or flag it; enforce the different-reviewer check server-side (WEB-040BE). Do not count the correction author's own action, a missing review, or elapsed time as review completion.

**Queue state and audit integrity:** A correction stays in the pending queue until a different authenticated administrator appends a valid **Acknowledged** or **Flagged** review event (WEB-040BD/BE), after which it no longer appears as pending. The original audit event, correction and review event remain protected and append-only (WEB-040AY); queue state is a derived view and must not mutate historical events or actual production-release state. The **no-fixed-deadline** policy (WEB-040BF) remains in force. No reminder, alert, escalation, flagged-case resolution workflow, queue ordering or detailed UI design is approved by this decision.

**LOCKED continuity:** WEB-040BB dedicated Production Audit Correct permission; WEB-040BC original-event reference, corrected field, replacement value and mandatory explanation plus actor/time; WEB-040BA all administrators may read audit history; WEB-040AZ atomic successful-release/audit commit; WEB-040AY protected append-only history; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only treatment OPEN; WEB-040W coupon details OPEN; WEB-040N **two customer-facing price components only**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BH — Notification of pending independent audit correction reviews (OPEN)
A. **Immediate in-app notification (recommended):** when a correction is appended, notify authenticated administrators other than the correcting actor through the admin interface that independent review is pending, linking to the dedicated queue. No fixed completion deadline or automatic escalation is implied.
B. **Daily pending-review digest:** send a consolidated in-app daily summary of still-pending corrections to administrators other than their authors. Less interruption, but review requests are surfaced later.
C. **Queue only, no automatic notifications:** rely on administrators opening the dedicated queue. Least notification noise, but requires manual checking to discover new work.

**PROPOSED, not locked:** notification policy, precise delivery and acknowledgement mechanics, retry/failure behaviour and flagged-correction escalation. The queue, distinct reviewer and no fixed deadline are already LOCKED.

**STILL OPEN:** WEB-040BH pending-review notifications, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Queue-only discovery for pending audit correction review (WEB-040BH)

**LOCKED (WEB-040BH, Option C):** Use **only the dedicated administrative Pending Audit Correction Review queue** (WEB-040BG) to discover Made to Order production-release audit corrections awaiting independent review. Administrators must manually visit the queue. **Do not automatically notify administrators when a correction is appended, send daily pending-review digests, or issue automated reminders about corrections still pending review.** This selects queue-only discovery instead of immediate in-app notifications or a daily digest.

**Review and integrity continuity:** Each correction remains **Pending Review** until an authenticated administrator other than its author records a protected linked **Acknowledged** or **Flagged** review event (WEB-040BD/BE). There is **no fixed review deadline** (WEB-040BF), no time-based auto-acknowledgement, and no automatic escalation for pending review. The original audit, correction and review events remain protected append-only records (WEB-040AY), and none of these audit activities change actual production-release state. This notification choice does **not** suppress the separately locked operational error/alert for failed rejected-attempt audit persistence under WEB-040AZ; handling a **Flagged** review is still OPEN.

**LOCKED continuity:** WEB-040BB dedicated Production Audit Correct permission; WEB-040BC structured correction with mandatory reason and actor/time; WEB-040BA all administrators can read audit history; WEB-040AZ atomic successful-release/audit commit; WEB-040AW success audit; WEB-040AX all rejected attempts audited; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only treatment OPEN; WEB-040W coupon details OPEN; WEB-040N **two customer-facing price components only**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BI — Follow-up for a Flagged audit correction review (OPEN)
A. **Mandatory linked resolution by an authorised corrector (recommended):** when an independent administrator flags a correction, require subsequent documented follow-up by staff with **Production Audit Correct** permission, appended as a separate linked resolution/corrective event. The Flagged review and all earlier events remain immutable. Exact resolution payload, visibility and deadline remain separate.
B. **Informational flag only:** the Flagged review remains in the immutable audit history, but no additional formal follow-up event is required. Administrators may address concerns informally.
C. **Second independent administrative review:** a Flagged correction requires another distinct administrator to append a further linked review outcome before it is considered resolved. Adds oversight, but may not directly correct the underlying concern.

**PROPOSED, not locked:** Flagged-review follow-up policy, resolution workflow and event fields, timing and any dedicated flagged-items view. Queue-only pending-review discovery and no fixed review deadline are already LOCKED.

**STILL OPEN:** WEB-040BI flagged-correction follow-up, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Mandatory linked follow-up for flagged audit corrections (WEB-040BI)

**LOCKED (WEB-040BI, Option A):** Whenever an authenticated independent administrator records **Flagged** on a Made to Order production-release audit correction (WEB-040BD/BE), a **documented follow-up is mandatory**. Only authenticated staff explicitly holding **Production Audit Correct** permission (WEB-040BB) may append the required **separate, protected, linked resolution/corrective-action event**, referencing the Flagged review and associated correction. Enforce this authority on the server; administrative audit-view or review authority alone is not sufficient to write a resolution event. This rejects an informational-only flag and a second-administrator-review-only substitute for corrective follow-up.

**Append-only integrity:** The original successful-release/rejected-attempt audit, structured correction (WEB-040BC), Flagged review, and subsequent follow-up remain separate immutable linked records (WEB-040AY). Follow-up cannot edit, delete, silently replace or reclassify those historical events; it cannot change actual payment, readiness or production-release state or initiate production. A follow-up does not itself retroactively turn a Flagged review into Acknowledged. If factual audit data requires another correction, the existing correction and independent-review controls still apply. The required resolution-event fields, what counts as sufficient resolution/closure, follow-up timing, flag visibility and escalation remain OPEN.

**LOCKED continuity:** WEB-040BG dedicated Pending Audit Correction Review queue; WEB-040BH manual queue-only discovery with no automatic pending-review notifications/digests; WEB-040BF no fixed independent review deadline; WEB-040BA all authenticated administrators can read audit history; WEB-040AZ atomic release/success-audit commit; WEB-040AW success audit; WEB-040AX all rejected attempts audited; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only treatment OPEN; WEB-040W coupon details OPEN; WEB-040N **two customer-facing price components only**: discounted tax-inclusive product amount plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BJ — Required contents of a flagged-correction follow-up event (OPEN)
A. **Structured corrective action with mandatory explanation (recommended):** require a reference to the Flagged review and correction, a structured action-taken category, details of the corrective action, and a mandatory explanation of how the concern was addressed. Automatically capture the authorised actor and server timestamp. Whether another administrator must approve closure remains separate.
B. **Mandatory narrative-only follow-up:** link to the Flagged review and correction, automatically capture actor/time, and require a free-text account of the follow-up, without a structured action category. More flexible, harder to report on.
C. **Minimal linked resolution marker:** link to the Flagged review and correction, automatically capture actor/time and a resolution marker; do not require substantive action details or explanation. Lowest effort, weakest accountability.

**PROPOSED, not locked:** flagged follow-up event payload, validation, closure acceptance, any independent resolution review and timing. WEB-040BI mandatory linked follow-up is already LOCKED.

**STILL OPEN:** WEB-040BJ flagged-follow-up payload, resolution closure/timing, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Mandatory narrative-only flagged-correction follow-up (WEB-040BJ)

**LOCKED (WEB-040BJ, Option B):** When a different authenticated administrator has **Flagged** a Made to Order production-release audit correction, the mandatory follow-up (WEB-040BI) is a **new protected append-only narrative event** that links to **both the Flagged review and its associated correction**. Require a **nonempty free-text explanation of the follow-up/action taken**; automatically capture the authenticated follow-up staff identity and a **server-generated timestamp**. Validate the referenced review/correction relationship and required narrative server-side. **Do not require a structured action-taken category** or treat a bare resolution marker as sufficient. This chooses narrative-only follow-up over structured categories and minimal markers.

**Authority and historical integrity:** Only staff with explicit **Production Audit Correct** permission (WEB-040BB) may append the follow-up event; an administrator's audit-view or review authority alone does not confer this permission. The source production-release audit, structured correction (WEB-040BC), Flagged review (WEB-040BD/BE) and narrative follow-up remain individually protected and append-only (WEB-040AY). Follow-up cannot silently change a Flagged review into Acknowledged, edit historical data, alter actual payment/readiness/release state or start production. **Whether the flagged concern closes upon submission, requires independent acceptance, or remains visibly flagged without a closed status is OPEN**; timing, visibility and additional follow-up handling remain OPEN.

**LOCKED continuity:** WEB-040BG dedicated Pending Audit Correction Review queue; WEB-040BH queue-only discovery without automatic pending-review notifications/digests; WEB-040BF no fixed independent review deadline; WEB-040BA all administrators may view release audits; WEB-040AZ atomic release/success-audit commit; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only treatment OPEN; WEB-040W coupon details OPEN; WEB-040N **two customer-facing price components only**: discounted tax-inclusive product amount plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BK — Formal closure of flagged audit correction concerns (OPEN)
A. **Independent administrator acceptance (recommended):** after the authorised corrector appends the mandatory narrative follow-up, a different authenticated administrator must append a separate linked **Resolution Accepted** or **Further Action Required** decision before the flagged concern can be treated as closed. Keep all historical events unchanged. Exact reviewer eligibility, deadline and presentation remain separate.
B. **Close upon valid narrative follow-up:** a valid linked narrative event from Production Audit Correct staff is sufficient to consider the flagged concern resolved, without a second administrator's acceptance. Derive closure from the event; do not edit the original Flagged review.
C. **No separate formal closure status:** keep the Flagged review permanently visible as Flagged with linked narrative follow-up, without marking the concern closed. Preserves history but makes unresolved-versus-addressed reporting harder.

**PROPOSED, not locked:** formal resolution closure and acceptance workflow, deadlines and any separate flagged-follow-up queue. WEB-040BJ mandatory narrative payload is already LOCKED.

**STILL OPEN:** WEB-040BK flagged-correction closure, flagged follow-up timing, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Independent administrator acceptance for flagged-correction closure (WEB-040BK)

**LOCKED (WEB-040BK, Option A):** A **Flagged** Made to Order production-release audit correction is **not formally closed** merely because staff with **Production Audit Correct** permission have submitted the required narrative follow-up (WEB-040BI/BJ). An **authenticated Tavistra administrator other than the narrative follow-up's author** must independently assess the follow-up and append a **separate protected, linked acceptance event** with one of two outcomes: **Resolution Accepted** or **Further Action Required**. Link the acceptance event to the Flagged review, associated correction and specific narrative follow-up; automatically record the authenticated administrator and server timestamp. Enforce admin authority, referenced-event integrity and reviewer/follow-up-author separation server-side.

**Closure semantics and integrity:** **Resolution Accepted** establishes formal closure of that flagged concern as a derived status; **Further Action Required** leaves it open. Neither result edits or overwrites the original release audit, correction, Flagged review, narrative follow-up or prior acceptance event. The Flagged review remains historically Flagged even when the concern is subsequently closed. No acceptance event may alter payment, readiness, actual production-release state or trigger production. Exact acceptance event fields beyond references/outcome/actor/time, further-action handling, acceptance timing, any additional reviewer-eligibility restrictions, and UI/queue for open flagged concerns remain OPEN. This decision does not add a fixed deadline or automated pending-review notifications contrary to WEB-040BF/BH.

**LOCKED continuity:** WEB-040BB explicit Production Audit Correct permission for correction and narrative follow-up; WEB-040BC structured correction with mandatory reason; WEB-040BD/BE independent administrative correction review; WEB-040BG dedicated Pending Audit Correction Review queue; WEB-040BH manual queue-only discovery without automatic pending-review notifications/digests; WEB-040BF no fixed correction review deadline; WEB-040BA all administrators may view release audits; WEB-040AY protected append-only audit history; WEB-040AZ atomic release/success-audit commit; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only treatment OPEN; WEB-040W coupon details OPEN; WEB-040N **two customer-facing price components only**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BL — Handling Further Action Required on a flagged correction (OPEN)
A. **Repeat documented follow-up and independent acceptance (recommended):** when an administrator records Further Action Required, the concern remains open; staff with Production Audit Correct permission must append a new linked narrative follow-up, and a different authenticated administrator must assess that new follow-up with another linked Resolution Accepted or Further Action Required event. Repeat until accepted. No fixed deadline is implied.
B. **Open concern with discretionary follow-up:** retain Further Action Required as an open outcome, but do not mandate another formal narrative event or acceptance cycle. Staff decide next steps outside a required workflow.
C. **Refer to a designated owner:** Further Action Required sends the open concern to a separately designated responsible owner for disposition. Exact owner authority and formal resolution method would need later decisions.

**PROPOSED, not locked:** Further Action Required workflow, event fields beyond the locked minimum, review timing, any separate flagged-concern queue and escalation. WEB-040BK independent acceptance before closure is already LOCKED.

**STILL OPEN:** WEB-040BL further-action handling, flagged follow-up timing, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Discretionary action after Further Action Required (WEB-040BL)

**LOCKED (WEB-040BL, Option B):** When an independent authenticated administrator appends **Further Action Required** to a flagged-correction narrative follow-up (WEB-040BK), the flagged concern **remains open**. Any additional investigation or corrective work is at staff discretion; **do not require a second narrative follow-up, an automatically repeated formal acceptance cycle, or assignment to a designated owner** merely because Further Action Required was selected. The initial mandatory narrative follow-up to a Flagged review (WEB-040BI/BJ) and the initial independent acceptance decision (WEB-040BK) remain mandatory.

**Closure and audit integrity:** **Further Action Required** never closes the concern, deletes its prior narrative, or changes the historical **Flagged** outcome. **Only a valid independent administrator's Resolution Accepted decision may formally close** the concern (WEB-040BK). If staff voluntarily add further documented follow-up or acceptance records, enforce the existing **Production Audit Correct** permission for narrative follow-up, administrator authority and separation from the follow-up author for acceptance, correct event linkage, and protected append-only storage. No record may modify actual payment, readiness or production-release state or initiate production. The precise mechanism for later reassessment/closure after a Further Action Required decision, deadlines, any reminders and the view for open flagged concerns remain OPEN. WEB-040BH's ban on automatic pending-review notifications and WEB-040BF's no-fixed-review-deadline decision remain unchanged.

**LOCKED continuity:** WEB-040BG dedicated Pending Audit Correction Review queue for corrections awaiting their first independent Acknowledged/Flagged review; WEB-040BA all administrators can read release audit history; WEB-040AY protected append-only audit history; WEB-040AZ atomic successful-release/audit commit; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only treatment OPEN; WEB-040W coupon details OPEN; WEB-040N **two customer-facing price components only**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BM — Visibility of unresolved flagged audit correction concerns (OPEN)
A. **Dedicated open-flagged-concerns queue (recommended):** provide authenticated administrators a separate view listing flagged corrections not yet formally closed by Resolution Accepted, including links to their flagged reviews, narrative follow-ups and latest acceptance decisions. Keep this separate from WEB-040BG's pending-initial-review queue.
B. **Open-flagged filter in audit history:** let administrators filter the existing audit history to flagged concerns without Resolution Accepted. No separate queue, but outstanding concerns are less prominent.
C. **Individual correction detail only:** show an open/closed flagged-concern status only on each correction's detail page, without a consolidated view or filter. Least UI complexity, highest risk of overlooked open concerns.

**PROPOSED, not locked:** flagged-concern discovery UI, detailed later reassessment mechanics, any optional notifications and flagged-follow-up timing. WEB-040BL discretionary further action is already LOCKED.

**STILL OPEN:** WEB-040BM open flagged-concern visibility, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Dedicated open flagged correction concerns queue (WEB-040BM)

**LOCKED (WEB-040BM, Option A):** Provide a separate **Open Flagged Concerns queue** accessible to all authenticated Tavistra administrators. The queue lists **Flagged** Made to Order production-release audit correction concerns **without a valid Resolution Accepted event** (WEB-040BK). Include cases with no initial mandatory narrative follow-up yet, cases with narrative follow-up awaiting independent acceptance, and cases left open after **Further Action Required** (WEB-040BL). Each entry links to the original audit/correction, the independent **Flagged** review, all linked narrative follow-up events and linked **Resolution Accepted / Further Action Required** decisions. Show the current derived open status without overwriting historical records.

**Distinct queues and integrity:** Keep this view separate from the **Pending Audit Correction Review queue** (WEB-040BG), which only lists corrections awaiting their initial independent Acknowledged/Flagged review. A Flagged correction exits the pending-initial-review queue once the independent Flagged review is validly recorded, but remains in the new Open Flagged Concerns queue until a valid independent **Resolution Accepted** decision closes it. **Further Action Required** does not remove the concern; a narrative follow-up alone does not close it. All underlying events remain protected append-only (WEB-040AY). All authenticated administrators may read the queue (WEB-040BA), but queue visibility grants no **Production Audit Correct** permission (WEB-040BB) or permission to accept one's own follow-up (WEB-040BK). No automatic pending-review notifications or digests (WEB-040BH), deadline, automatic owner assignment or change to production-release state is introduced by this queue decision.

**LOCKED continuity:** WEB-040BC structured corrections with mandatory reason; WEB-040BD/BE mandatory independent administrator review; WEB-040BF no fixed initial correction review deadline; WEB-040BI mandatory linked follow-up for Flagged review; WEB-040BJ narrative-only follow-up with mandatory explanation and actor/time; WEB-040BK independent acceptance before formal closure; WEB-040BL discretionary action after Further Action Required; WEB-040AZ atomic successful-release/audit commit; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only treatment OPEN; WEB-040W coupon details OPEN; WEB-040N **two customer-facing price components only**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BN — Initial mandatory flagged-correction narrative follow-up deadline (OPEN)
A. **Within 72 calendar hours:** require staff holding Production Audit Correct permission to append the initial linked narrative follow-up within 72 hours of the Flagged review's server timestamp. Faster response, but tighter operational burden. Deadline-breach consequences remain separate.
B. **Within seven calendar days (recommended):** require the initial linked narrative follow-up within seven calendar days of the Flagged review's server timestamp. Balances accountability with staff availability. Deadline-breach consequences remain separate.
C. **No fixed deadline:** initial narrative follow-up remains mandatory, and the concern stays visible in the Open Flagged Concerns queue until independently closed, but no time-based deadline or automatic expiry is imposed.

**PROPOSED, not locked:** the initial mandatory narrative follow-up deadline, any overdue handling, independent acceptance timing, queue sorting and additional flagged-case notifications. WEB-040BF's no-fixed-deadline policy applies to the **initial correction review**, not automatically to the subsequent flagged-concern follow-up.

**STILL OPEN:** WEB-040BN initial flagged narrative follow-up timing, independent acceptance timing, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — No fixed initial flagged-correction narrative follow-up deadline (WEB-040BN)

**LOCKED (WEB-040BN, Option C):** The **initial mandatory narrative follow-up** after an authenticated independent administrator records **Flagged** on a Made to Order production-release audit correction has **no fixed time deadline**. This rejects both a 72-calendar-hour deadline and a seven-calendar-day deadline. The follow-up itself remains mandatory under WEB-040BI/BJ: only staff holding **Production Audit Correct** permission may append a separate protected linked event referencing the Flagged review and correction, with a required nonempty free-text account of action taken and server-recorded actor/time. No time-based automatic fulfilment, expiry, closure or overdue escalation is introduced for this follow-up.

**Open-concern continuity:** The Flagged concern remains in the separate administrative **Open Flagged Concerns queue** (WEB-040BM) while it lacks a valid independent **Resolution Accepted** event. Appending the narrative alone does not close the concern: a different authenticated administrator must still append **Resolution Accepted** or **Further Action Required** (WEB-040BK), and only Resolution Accepted closes it. A Further Action Required outcome leaves the concern open with subsequent action discretionary (WEB-040BL). WEB-040BF's independent initial correction review also has no fixed deadline, but the **timing for independent acceptance of a submitted narrative follow-up is still OPEN**. The WEB-040BH queue-only policy forbids automatic notifications/digests for pending *initial correction review*; any separate flagged-case notification policy remains undecided. WEB-040AZ's operational alert on rejected-attempt audit persistence failure remains intact. All audit, correction, review, narrative and acceptance events are protected append-only and never change actual production-release state.

**LOCKED continuity:** WEB-040BG Pending Audit Correction Review queue for corrections awaiting their initial independent review; WEB-040BA all authenticated administrators may read release audits; WEB-040BB Production Audit Correct permission for correction and follow-up; WEB-040BC structured correction with mandatory reason; WEB-040BD/BE independent administrative correction review; WEB-040AY append-only audit history; WEB-040AZ atomic successful-release/audit commit; WEB-040AW success audit; WEB-040AX all rejected attempts audited; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only treatment OPEN; WEB-040W coupon details OPEN; WEB-040N **exactly two customer-facing price components**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BO — Independent flagged-follow-up acceptance deadline (OPEN)
A. **Within 72 calendar hours:** after a valid mandatory narrative follow-up is appended, require an independent administrator to append Resolution Accepted or Further Action Required within 72 hours. Deadline-breach response is a separate decision.
B. **Within seven calendar days:** require the independent administrator's acceptance decision within seven calendar days after the narrative follow-up. Deadline-breach response is a separate decision.
C. **No fixed deadline (recommended for consistency):** the independent administrator's acceptance decision remains mandatory, but no time limit, automatic acceptance or time-based closure applies. The flagged concern stays visible in the Open Flagged Concerns queue until formally accepted.

**PROPOSED, not locked:** independent acceptance timing, later reassessment mechanics, flagged-case notifications and queue sorting. WEB-040BN no-fixed-deadline policy for the **initial narrative follow-up** is already LOCKED.

**STILL OPEN:** WEB-040BO independent acceptance timing, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — No fixed independent flagged-follow-up acceptance deadline (WEB-040BO)

**LOCKED (WEB-040BO, Option C):** After staff with **Production Audit Correct** permission append the mandatory linked narrative follow-up to a **Flagged** Made to Order production-release audit correction, the subsequent **independent administrator acceptance decision has no fixed deadline**. This rejects both 72-calendar-hour and seven-calendar-day limits. A different authenticated administrator must still assess the specific follow-up and append a separate protected linked **Resolution Accepted** or **Further Action Required** decision with their identity and a server-generated timestamp (WEB-040BK). Enforce reviewer/follow-up-author separation and linked event integrity server-side. Do not auto-accept, expire, close or time-escalate the concern merely because time has passed.

**Open-concern and historical integrity:** Keep the flagged concern in the dedicated **Open Flagged Concerns queue** (WEB-040BM) until a valid **Resolution Accepted** event formally closes it. **Further Action Required** leaves it open and any subsequent corrective action is discretionary rather than a mandatory repeat narrative/acceptance cycle (WEB-040BL). Neither a narrative follow-up nor elapsed time changes the historical **Flagged** review. All original release audit, correction, review, narrative and acceptance events remain protected append-only (WEB-040AY); no event may alter payment, readiness, actual production-release state or initiate production. The initial independent correction review has no fixed deadline (WEB-040BF), and the initial mandatory narrative follow-up has no fixed deadline (WEB-040BN). The existing no-automatic-notification policy (WEB-040BH) applies to **corrections awaiting initial independent review**, not automatically to separately flagged concerns; flagged-case notifications remain OPEN. Preserve WEB-040AZ operational alerts for rejected-attempt audit persistence failures.

**LOCKED continuity:** WEB-040BA all authenticated administrators can view release audit history; WEB-040BB Production Audit Correct permission for corrections and narrative follow-ups; WEB-040BC structured correction with mandatory reason; WEB-040BD/BE independent initial correction review; WEB-040BG Pending Audit Correction Review queue; WEB-040BI mandatory flagged-case linked follow-up; WEB-040BJ mandatory narrative-only follow-up with actor/time; WEB-040BK independent acceptance before closure; WEB-040BL discretionary further action after Further Action Required; WEB-040BM dedicated Open Flagged Concerns queue; WEB-040AZ atomic successful-release/audit commit; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only participation OPEN; WEB-040W coupon details OPEN; WEB-040N **exactly two customer-facing price components**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BP — Notifications for newly flagged correction concerns (OPEN)
A. **Immediate in-app notification:** notify administrators in-app when a correction is independently **Flagged**, directing them to the dedicated Open Flagged Concerns queue. Notification recipients, read state and delivery failure details remain separate.
B. **Daily open-flagged digest:** send administrators a daily summary of concerns still open in the Open Flagged Concerns queue, rather than immediate notifications. Exact delivery channel and time remain separate.
C. **Queue-only, no automatic flagged-concern notifications (recommended for consistency):** administrators manually check the dedicated Open Flagged Concerns queue. No immediate in-app notification or daily flagged-concern digest is generated by the Flagged outcome or continuing open status.

**PROPOSED, not locked:** notifications for flagged concerns, subsequent acceptance-ready notifications, later reassessment mechanics, audit retention and UI/API specifics. WEB-040BO's no-fixed-deadline acceptance timing and WEB-040BH's queue-only pending-initial-review discovery are already LOCKED.

**STILL OPEN:** WEB-040BP flagged-concern notification policy, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Queue-only discovery of flagged audit-correction concerns (WEB-040BP)

**LOCKED (WEB-040BP, Option C):** Authenticated Tavistra administrators discover **newly Flagged** Made to Order production-release audit correction concerns and concerns that remain open by **manually checking the dedicated Open Flagged Concerns queue** (WEB-040BM). Do **not** send automatic in-app notifications when a correction is Flagged, daily open-flagged digests or other automatic reminders based solely on the Flagged event or continuing open status. This rejects both immediate in-app notification and daily flagged-concern digest alternatives. WEB-040BH separately already locks **queue-only, no automatic notifications** for corrections awaiting their **initial independent Acknowledged/Flagged review** in the Pending Audit Correction Review queue (WEB-040BG). Do not conflate these two queues or their workflow stages.

**Mandatory controls unchanged:** The original Flagged review remains immutable; a **Production Audit Correct** staff member must still append the protected linked narrative follow-up (WEB-040BI/BJ), and a different authenticated administrator must independently append **Resolution Accepted** or **Further Action Required** (WEB-040BK). Only Resolution Accepted closes the concern and removes it from the open queue; Further Action Required leaves it open, with additional action discretionary (WEB-040BL). No fixed deadline applies to initial independent correction review, initial narrative follow-up or independent acceptance (WEB-040BF/BN/BO). Queue-only discovery does not imply time-based automatic completion, escalation, or a change to payment/readiness/release state. Preserve WEB-040AZ's separate operational alert when a rejected-attempt audit cannot be persisted. Any notifications tied to a **distinct event**, such as a narrative follow-up becoming ready for independent acceptance, and detailed queue status presentation remain separate OPEN decisions.

**LOCKED continuity:** WEB-040BA all authenticated administrators can view release audit history; WEB-040BB explicit Production Audit Correct permission for correction and narrative follow-up; WEB-040BC structured correction with mandatory reason; WEB-040BD/BE independent initial correction review; WEB-040AY protected append-only audit history; WEB-040AZ atomic successful-release/audit commit; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only participation OPEN; WEB-040W coupon details OPEN; WEB-040N **exactly two customer-facing price components**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BQ — Status detail in the Open Flagged Concerns queue (OPEN)
A. **Distinct workflow-stage labels (recommended):** show a derived status for each open concern: **Awaiting Narrative Follow-up** when none is linked, **Awaiting Independent Acceptance** when a narrative is available without a decision on that narrative, or **Further Action Required** when the latest independent decision requires further action. A subsequent voluntary narrative may move the display back to Awaiting Independent Acceptance without imposing a mandatory repeat cycle. Do not rewrite underlying events.
B. **Open plus latest-event summary:** show a single **Open** status for every unresolved concern alongside the latest linked event type and timestamp, without dedicated workflow-stage labels.
C. **Open only:** show a single **Open** label and event links for each unresolved concern, without a stage label or latest-event summary. Minimal UI, less useful for manual queue triage.

**PROPOSED, not locked:** the queue's workflow-stage presentation, sorting/filtering, distinct event-triggered acceptance-ready notifications, later reassessment mechanics and audit retention. WEB-040BP queue-only newly Flagged/open-concern discovery is already LOCKED.

**STILL OPEN:** WEB-040BQ open-flagged queue status detail, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Distinct workflow-stage labels for open flagged concerns (WEB-040BQ)

**LOCKED (WEB-040BQ, Option A):** In the dedicated **Open Flagged Concerns queue** (WEB-040BM), show a distinct, **derived workflow-stage label** for every unresolved **Flagged** Made to Order production-release audit correction concern:
- **Awaiting Narrative Follow-up:** the Flagged review has no valid linked narrative follow-up yet. The initial narrative remains mandatory under WEB-040BI/BJ, without a fixed deadline (WEB-040BN).
- **Awaiting Independent Acceptance:** a valid linked narrative follow-up exists, but no valid independent **Resolution Accepted** or **Further Action Required** decision has been recorded **for that narrative**. Independent administrator assessment remains mandatory under WEB-040BK, without a fixed deadline (WEB-040BO).
- **Further Action Required:** the latest applicable independent acceptance decision is **Further Action Required**. The concern remains open, with additional action discretionary under WEB-040BL. If authorised staff voluntarily append a newer linked narrative follow-up, derive **Awaiting Independent Acceptance** for that newer narrative, without imposing a repeat narrative/acceptance cycle merely because the earlier decision was Further Action Required.

**Derivation and integrity:** A valid **Resolution Accepted** event closes the concern and removes it from the open queue, while retaining the immutable **Flagged** review and full linked audit history. Evaluate the stage using the linked correction, Flagged review, follow-up narratives and their independent acceptance decisions, including event order; do not rewrite original events or store a mutable historical review outcome. Enforce existing authorisation and separation of follow-up author from accepting administrator. The queue remains accessible to authenticated administrators for manual checking only (WEB-040BP); it confers no additional correction or review rights. Do not introduce automatic notifications, digests, reminders, deadlines, time-based escalation, automatic acceptance or changes to payment/readiness/release state.

**LOCKED continuity:** WEB-040BG separate Pending Audit Correction Review queue; WEB-040BH queue-only discovery for pending initial independent reviews; WEB-040BF no fixed initial review deadline; WEB-040BA all authenticated administrators may view release audits; WEB-040BB Production Audit Correct permission for corrections and narrative follow-ups; WEB-040BC structured correction with mandatory reason; WEB-040BD/BE independent initial correction review; WEB-040AY protected append-only audit history; WEB-040AZ atomic successful-release/audit commit; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only participation OPEN; WEB-040W coupon details OPEN; WEB-040N **exactly two customer-facing price components**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BR — Default sorting of the Open Flagged Concerns queue (OPEN)
A. **Oldest flagged first (recommended):** order open concerns by the server timestamp of the original Flagged review, oldest first, regardless of current workflow stage. Makes longstanding unresolved concerns visible first without imposing deadlines.
B. **Newest flagged first:** order by the Flagged review's server timestamp, newest first. Highlights recent issues, but older concerns may be buried.
C. **Workflow-stage groups, then oldest first:** group Awaiting Narrative Follow-up, Awaiting Independent Acceptance and Further Action Required in that display order, sorting oldest Flagged review first within each group. Prioritises work type over overall concern age.

**PROPOSED, not locked:** default queue ordering, optional filtering and manual sorting, later reassessment mechanics, distinct acceptance-ready event notifications, audit retention and UI/API specifics. WEB-040BQ derived workflow-stage labels are already LOCKED.

**STILL OPEN:** WEB-040BR open flagged concern queue sorting, optional filters, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Oldest flagged first default queue ordering (WEB-040BR)

**LOCKED (WEB-040BR, Option A):** Sort the dedicated administrator **Open Flagged Concerns queue** (WEB-040BM) by the **server timestamp of the original independent Flagged review**, **oldest first**, as the default order. Apply this ordering across all open concerns, regardless of their derived stage under WEB-040BQ: **Awaiting Narrative Follow-up**, **Awaiting Independent Acceptance**, or **Further Action Required**. Do not group by stage or sort by newest Flagged review by default. Subsequent narrative follow-ups, Further Action Required decisions or other voluntary actions must not reset the original flagged timestamp or move an older concern behind a newer one solely because of activity.

**Integrity and operations:** Only a valid independent **Resolution Accepted** event formally closes the concern and removes it from the open queue (WEB-040BK); preserve the original Flagged review, correction, follow-ups and acceptance decisions as immutable linked append-only history (WEB-040AY). The queue is manually checked by authenticated administrators (WEB-040BP); the default sort does not introduce notifications, digests, reminders, fixed deadlines, automated escalation or additional authority. The independent initial correction review, mandatory initial flagged narrative follow-up and independent acceptance remain mandatory where already locked, with no fixed deadlines under WEB-040BF/BN/BO. Sorting ties, optional filtering and manual sorting overrides remain OPEN. WEB-040AZ operational alerts for rejected-attempt audit persistence failure are unaffected.

**LOCKED continuity:** WEB-040BG separate Pending Audit Correction Review queue; WEB-040BH queue-only discovery for pending initial independent reviews; WEB-040BA all authenticated administrators can view release audits; WEB-040BB explicit Production Audit Correct permission for correction and narrative follow-up; WEB-040BC structured correction with mandatory reason; WEB-040BD/BE independent initial correction review; WEB-040BI mandatory flagged narrative follow-up; WEB-040BJ narrative-only event with actor/time; WEB-040BK independent acceptance before closure; WEB-040BL discretionary action after Further Action Required; WEB-040BM dedicated Open Flagged Concerns queue; WEB-040BQ derived workflow-stage labels; WEB-040AZ atomic successful-release/audit commit; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only participation OPEN; WEB-040W coupon details OPEN; WEB-040N **exactly two customer-facing price components**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BS — Filtering the Open Flagged Concerns queue by workflow stage (OPEN)
A. **Optional workflow-stage filter, All Open by default (recommended):** administrators may select All Open, Awaiting Narrative Follow-up, Awaiting Independent Acceptance or Further Action Required. Start with All Open; retain WEB-040BR oldest-flagged-first ordering within the chosen set. Filtering changes only the displayed subset, not the underlying events or concern status.
B. **Workflow-stage and flagged-age filters:** allow the same workflow-stage selection plus an optional age/date-range filter on the original Flagged review timestamp. Start with all stages and ages, preserving oldest-first ordering within results. More flexibility with additional UI complexity.
C. **No filters:** show all unresolved concerns in a single oldest-first list with their stage labels; administrators locate stages by scrolling or searching linked records.

**PROPOSED, not locked:** optional workflow-stage and age filtering, manual sorting overrides, timestamp tie-breaking, later reassessment mechanics, distinct event-triggered notifications, audit retention and UI/API specifics. WEB-040BR oldest-flagged-first default sorting is already LOCKED.

**STILL OPEN:** WEB-040BS queue filtering, manual sorting overrides, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Workflow-stage and flagged-age filters (WEB-040BS)

**LOCKED (WEB-040BS, Option B):** The authenticated-administrator **Open Flagged Concerns queue** (WEB-040BM) supports **both** (1) an optional **workflow-stage filter** and (2) an optional **flagged-age/date-range filter**. Stage choices are **All Open**, **Awaiting Narrative Follow-up**, **Awaiting Independent Acceptance**, and **Further Action Required**, using the protected-event-derived stage definitions already locked by WEB-040BQ. The flagged-age filter uses the **server timestamp of the original independent Flagged review**, not the latest narrative, acceptance decision, correction edit or last activity. Administrators may combine the stage and flagged-age filters.

**Defaults and invariants:** Initially show **all open stages and all flagged ages** with no narrowing filter. Within any filtered subset, keep WEB-040BR's **oldest original Flagged review first** default ordering across stages. Filtering only narrows the visible list; it must not modify the underlying concern's open/closed status, remove it from the canonical open queue, edit any protected append-only audit/correction/review/narrative/acceptance event, or trigger production. A valid independent **Resolution Accepted** alone closes/removes a concern (WEB-040BK); **Further Action Required** leaves it open with discretionary additional action (WEB-040BL). Queue access for all authenticated administrators does not grant Production Audit Correct permission or acceptance of one's own narrative. No fixed deadlines (WEB-040BF/BN/BO) or automatic flagged-concern notifications/digests/reminders (WEB-040BP) are introduced. Date-range control details, sorting overrides, equal-timestamp tie-breaking and pagination remain OPEN.

**LOCKED continuity:** WEB-040BG separate Pending Audit Correction Review queue; WEB-040BH queue-only discovery for pending initial independent reviews; WEB-040BA all authenticated administrators can view release audits; WEB-040BB explicit Production Audit Correct permission for correction and narrative follow-up; WEB-040BC structured correction with mandatory reason; WEB-040BD/BE independent initial correction review; WEB-040BI mandatory flagged narrative follow-up; WEB-040BJ narrative-only event with actor/time; WEB-040BK independent acceptance before closure; WEB-040BL discretionary action after Further Action Required; WEB-040BM dedicated Open Flagged Concerns queue; WEB-040BQ derived workflow-stage labels; WEB-040BR oldest-first default; WEB-040AY protected append-only audit history; WEB-040AZ atomic successful-release/audit commit; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only participation OPEN; WEB-040W coupon details OPEN; WEB-040N **exactly two customer-facing price components**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BT — Manual sorting overrides for Open Flagged Concerns (OPEN)
A. **Oldest/newest flagged toggle (recommended):** keep oldest-original-Flagged-review-first as the default, but let an administrator temporarily switch to newest-original-Flagged-review-first within any selected stage and age filters. Does not change saved workflow or audit state.
B. **Expanded sort choices:** offer oldest/newest original Flagged review and most/least recent linked audit activity as optional display sorts, still defaulting to oldest original Flagged review first. More flexible, but latest activity can move longstanding concerns down the list.
C. **No manual sort override:** always display oldest-original-Flagged-review-first within the chosen filters. Simpler and keeps longstanding concerns prominent.

**PROPOSED, not locked:** manual sort overrides, equal-timestamp tie-breaking, exact date-range UI, later reassessment mechanics, distinct event-triggered acceptance-ready notifications, audit retention and UI/API specifics. WEB-040BS stage-plus-age filters are already LOCKED.

**STILL OPEN:** WEB-040BT queue sorting overrides, date-range UI, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Oldest/newest flagged manual sort toggle (WEB-040BT)

**LOCKED (WEB-040BT, Option A):** The authenticated-administrator **Open Flagged Concerns queue** (WEB-040BM) offers a **manual sort toggle** with exactly two modes: **Oldest Flagged First** and **Newest Flagged First**. Both modes sort by the **server timestamp of the original independent Flagged review**, not the latest linked narrative, correction, acceptance decision or other audit activity. **Oldest Flagged First remains the default** under WEB-040BR. Administrators may temporarily switch to **Newest Flagged First** while viewing the queue; the toggle applies to the visible subset after any selected **workflow-stage** and **flagged-age/date-range** filters (WEB-040BS). This does not approve expanded latest-activity sorting or persistent personal sort preferences.

**Presentation and integrity:** Display the selected mode clearly. Keep the three derived workflow-stage labels from WEB-040BQ and the all-stages/all-ages filter defaults from WEB-040BS. Manual sorting changes presentation only; it must not change the original Flagged review timestamp, append-only audit/correction/review/narrative/acceptance records, open/closed status, queue membership, administrator permissions or payment/readiness/production-release state. A valid independent **Resolution Accepted** remains the only formal closure event (WEB-040BK). No fixed initial correction-review, narrative-follow-up or independent-acceptance deadlines (WEB-040BF/BN/BO); no automatic newly flagged/open-concern notifications or digests (WEB-040BP). Exact age/date-range UI, equal-timestamp tie-breaking, sort preference persistence, pagination and later reassessment details remain OPEN.

**LOCKED continuity:** WEB-040BG separate Pending Audit Correction Review queue; WEB-040BH queue-only discovery for pending initial independent reviews; WEB-040BA all authenticated administrators can view release audits; WEB-040BB explicit Production Audit Correct permission for correction and narrative follow-up; WEB-040BC structured correction with mandatory reason; WEB-040BD/BE independent initial correction review; WEB-040BI mandatory flagged narrative follow-up; WEB-040BJ narrative-only event with actor/time; WEB-040BK independent acceptance before closure; WEB-040BL discretionary action after Further Action Required; WEB-040BM dedicated Open Flagged Concerns queue; WEB-040BQ derived workflow-stage labels; WEB-040BR oldest-first default; WEB-040BS stage-plus-age filters; WEB-040AY protected append-only audit history; WEB-040AZ atomic successful-release/audit commit; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only participation OPEN; WEB-040W coupon details OPEN; WEB-040N **exactly two customer-facing price components**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BU — Flagged-age/date-range filter controls (OPEN)
A. **Preset age windows only:** offer **All Ages**, **Last 7 Days**, **Last 30 Days** and **Last 90 Days**, based on the original Flagged review timestamp. Faster selection but no arbitrary historical range.
B. **Custom date range only:** offer **All Ages** plus optional start/end calendar dates for the original Flagged review timestamp. Precise selection but more input for common ranges.
C. **Both presets and custom date range (recommended):** offer **All Ages**, 7/30/90-day preset windows and optional custom start/end calendar dates. Preserve the stage filter and oldest/newest toggle; date boundary and time-zone semantics remain separate.

**PROPOSED, not locked:** age/date-range control type, exact date-boundary/time-zone semantics, equal-timestamp tie-breaking, personal sort preference persistence, later reassessment mechanics, distinct event-triggered notifications, audit retention and UI/API specifics. WEB-040BT oldest/newest manual sorting is already LOCKED.

**STILL OPEN:** WEB-040BU age/date-range filter controls, date boundary semantics, equal-timestamp tie-breaking, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Preset-only flagged-age filters (WEB-040BU)

**LOCKED (WEB-040BU, Option A):** For the dedicated administrator **Open Flagged Concerns queue** (WEB-040BM), offer exactly these **flagged-age filter controls**: **All Ages**, **Last 7 Days**, **Last 30 Days**, and **Last 90 Days**. **All Ages** is selected by default. Do **not** provide arbitrary custom start/end calendar-date controls. The age basis is the **server timestamp of the original independent Flagged review**, not later narrative follow-up, independent acceptance, correction or other activity. This narrows WEB-040BS's previously approved optional age/date filtering to **preset-only** controls, without changing its separately locked workflow-stage filtering.

**Combined queue behaviour:** Administrators can select any preset together with **All Open**, **Awaiting Narrative Follow-up**, **Awaiting Independent Acceptance** or **Further Action Required** (WEB-040BQ/BS). Within the visible filtered subset, **Oldest Flagged First** remains the default and administrators may temporarily toggle to **Newest Flagged First** (WEB-040BR/BT). All filtering and sorting are presentation-only; they do not mutate protected append-only audit/correction/Flagged review/narrative/acceptance records, derived stage, canonical queue membership, administrator permissions or actual production-release state. Only a valid independent **Resolution Accepted** event closes a concern (WEB-040BK). WEB-040BP's queue-only discovery and WEB-040BF/BN/BO's no-fixed-deadline rules remain intact. No notification, digest, reminder, expiry or escalation is introduced. The exact meaning of **Last N Days**, including rolling-hour versus calendar-day and time-zone boundaries, remains OPEN.

**LOCKED continuity:** WEB-040BG separate Pending Audit Correction Review queue; WEB-040BH queue-only discovery for pending initial independent reviews; WEB-040BA all authenticated administrators can view release audits; WEB-040BB explicit Production Audit Correct permission for correction and narrative follow-up; WEB-040BC structured correction with mandatory reason; WEB-040BD/BE independent initial correction review; WEB-040BI mandatory flagged narrative follow-up; WEB-040BJ narrative-only event with actor/time; WEB-040BK independent acceptance before closure; WEB-040BL discretionary action after Further Action Required; WEB-040BM dedicated Open Flagged Concerns queue; WEB-040BQ derived workflow-stage labels; WEB-040BR oldest-first default; WEB-040BS stage and age filtering; WEB-040BT manual oldest/newest toggle; WEB-040AY protected append-only audit history; WEB-040AZ atomic successful-release/audit commit; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only participation OPEN; WEB-040W coupon details OPEN; WEB-040N **exactly two customer-facing price components**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BV — Interpretation of Last N Days flagged-age presets (OPEN)
A. **Rolling N×24-hour duration (recommended):** Last 7/30/90 Days means the immediately preceding 7×24, 30×24 or 90×24 hours from the server's evaluation time, comparing exact original Flagged review timestamps. Consistent across administrator time zones.
B. **UTC calendar-day windows:** include the current UTC calendar date plus the preceding N−1 complete UTC dates, starting at 00:00 UTC on the earliest included day. A "Last 7 Days" selection may include less than or more than exactly 168 hours of events.
C. **Tavistra business-time-zone calendar-day windows:** include the current business-local calendar date plus the preceding N−1 business-local dates, starting at midnight in Tavistra's configured business time zone. Business-time-zone configuration remains a separate implementation detail.

**PROPOSED, not locked:** rolling-hour versus calendar-day semantics for presets, boundary inclusivity, equal-timestamp sort tie-breaking, saved personal sort preferences, later reassessment mechanics, distinct acceptance-ready event notifications, audit retention and UI/API specifics. WEB-040BU preset-only controls are already LOCKED.

**STILL OPEN:** WEB-040BV age-preset time-window semantics, equal-timestamp tie-breaking, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Business-local calendar-day flagged-age windows (WEB-040BV)

**LOCKED (WEB-040BV, Option C):** Interpret the **Last 7 Days**, **Last 30 Days** and **Last 90 Days** flagged-age presets in the authenticated-administrator **Open Flagged Concerns queue** as **calendar days in Tavistra's configured business time zone**, not rolling 168/720/2,160-hour durations or UTC calendar dates. For an N-day preset, include the **current business-local calendar date** and the **preceding N−1 business-local calendar dates**, beginning at **00:00 business-local time on the earliest included date**. Thus Last 7 Days includes today plus the prior 6 business-local dates; Last 30 Days includes today plus the prior 29; Last 90 Days includes today plus the prior 89. Compare the **original independent Flagged review's server-generated timestamp** using the business-local calendar date derived from that timestamp. Later narrative follow-ups, acceptance decisions or audit activity do not restart the window. This policy uses calendar dates rather than a fixed count of hours, including where a business time zone observes daylight-saving changes.

**Queue behaviour and integrity:** Keep **All Ages** as the default and **no custom start/end date control** (WEB-040BU). Allow the existing **workflow-stage filter** to combine with the selected age preset (WEB-040BS/BQ), and preserve **Oldest Flagged First** as the default with a temporary **Newest Flagged First** toggle (WEB-040BR/BT). Filtering affects only the visible subset, never the protected append-only original release audit, correction, Flagged review, linked narrative or independent acceptance events, derived workflow stage, queue membership, permissions or actual production-release state. Only a valid independent **Resolution Accepted** formally closes the concern (WEB-040BK); **Further Action Required** leaves it open (WEB-040BL). Preserve the no-fixed-deadline rules (WEB-040BF/BN/BO), queue-only discovery without automatic flagged-concern notifications/digests (WEB-040BP), and WEB-040AZ operational alerts for audit-write failures. **Which configuration supplies Tavistra's business time zone** remains OPEN; do not silently substitute an administrator's browser time zone, server-local time zone or UTC.

**LOCKED continuity:** WEB-040BG separate Pending Audit Correction Review queue; WEB-040BH queue-only discovery for pending initial independent reviews; WEB-040BA all authenticated administrators can view release audits; WEB-040BB explicit Production Audit Correct permission for correction and narrative follow-up; WEB-040BC structured correction with mandatory reason; WEB-040BD/BE independent initial correction review; WEB-040BI mandatory flagged narrative follow-up; WEB-040BJ narrative-only event with actor/time; WEB-040BK independent acceptance before closure; WEB-040BL discretionary action after Further Action Required; WEB-040BM dedicated Open Flagged Concerns queue; WEB-040BQ derived workflow-stage labels; WEB-040BR oldest-first default; WEB-040BS stage and age filtering; WEB-040BT manual oldest/newest toggle; WEB-040BU preset-only age filters; WEB-040AY protected append-only audit history; WEB-040AZ atomic successful-release/audit commit; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only participation OPEN; WEB-040W coupon details OPEN; WEB-040N **exactly two customer-facing price components**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BW — Source of the business time zone for flagged-age filters (OPEN)
A. **Canonical Tavistra business time zone (recommended):** use a single, centrally configured Tavistra business time zone expressed as an IANA zone identifier, shared with other business-local calendar operations where applicable. If no such setting exists yet, its provision is an implementation requirement. Do not assume its current value.
B. **Dedicated audit-queue business time zone:** maintain a separately configurable IANA time zone for the Open Flagged Concerns queue's calendar-day filters, independent of other Tavistra business-calendar settings.
C. **Fixed Asia/Kolkata time zone:** use Asia/Kolkata for flagged-age calendar windows regardless of any other Tavistra time-zone configuration. This is a proposed fixed policy, not a claim about Tavistra's current setting.

**PROPOSED, not locked:** source and administration of the business time zone, handling configuration changes, exact boundary evaluation implementation, equal-timestamp sort tie-breaking, personal sort preference persistence, later reassessment mechanics, distinct event-triggered notifications, audit retention and UI/API specifics. WEB-040BV business-local calendar-day windows are already LOCKED.

**STILL OPEN:** WEB-040BW business time-zone source, equal-timestamp tie-breaking, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Fixed Asia/Kolkata flagged-age time zone (WEB-040BW)

**LOCKED (WEB-040BW, Option C):** For the dedicated authenticated-administrator **Open Flagged Concerns queue** (WEB-040BM), use the fixed **IANA time zone Asia/Kolkata (IST, UTC+05:30)** for **Last 7 Days**, **Last 30 Days** and **Last 90 Days** flagged-age calendar windows. This is a deliberate fixed queue policy, not a claim about the application's current general business-time-zone configuration. Do **not** derive the filter's time zone from the current administrator's device/browser, server-local environment, UTC date or any separately configured Tavistra business time zone. The previously approved business-local-calendar-day policy (WEB-040BV) is thus concretely anchored to **Asia/Kolkata** for this queue.

**Window calculation:** Evaluate the **current Asia/Kolkata calendar date** at query time. For an N-day preset, include the current local date and **N−1 preceding Asia/Kolkata calendar dates**, beginning at **00:00 IST on the earliest included date** and ending at the current evaluation time. Last 7 Days includes today plus the prior 6 dates; Last 30 Days includes today plus the prior 29; Last 90 Days includes today plus the prior 89. Convert the **original independent Flagged review's immutable server timestamp** to the corresponding Asia/Kolkata local date/time for inclusion; later follow-ups or independent acceptance decisions must not reset the flagged-age basis. Treat the lower bound as included; no future-dated audit event is made eligible merely because its local date matches the current date. All Ages remains the default and only the approved 7/30/90-day presets are available (WEB-040BU). This choice does not establish a site-wide business time zone.

**Combined controls and audit integrity:** Keep stage choices **All Open**, **Awaiting Narrative Follow-up**, **Awaiting Independent Acceptance**, **Further Action Required** (WEB-040BQ/BS). Maintain **Oldest Flagged First** default with a temporary **Newest Flagged First** toggle, based on the original Flagged review server timestamp (WEB-040BR/BT), within the filtered subset. All filters and sorts are presentation-only: never rewrite protected append-only original release audits, correction events, Flagged reviews, narrative follow-ups or independent decisions, and never alter canonical open/closed status, queue membership, permissions, payment/readiness/production-release state, or WEB-040AZ operational audit-write failure alerts. Only independent **Resolution Accepted** closes a flagged concern (WEB-040BK); Further Action Required remains open with discretionary additional action (WEB-040BL). No fixed initial correction-review, narrative-follow-up or acceptance deadline (WEB-040BF/BN/BO), and no automatic newly flagged/open-concern notification, digest or reminder (WEB-040BP).

**LOCKED continuity:** WEB-040BG separate Pending Audit Correction Review queue; WEB-040BH queue-only discovery for pending initial independent reviews; WEB-040BA all authenticated administrators can view release audits; WEB-040BB explicit Production Audit Correct permission for correction and narrative follow-up; WEB-040BC structured correction with mandatory reason; WEB-040BD/BE independent initial correction review; WEB-040BI mandatory flagged narrative follow-up; WEB-040BJ narrative-only event with actor/time; WEB-040BK independent acceptance before closure; WEB-040BL discretionary action after Further Action Required; WEB-040BM dedicated Open Flagged Concerns queue; WEB-040BQ derived workflow-stage labels; WEB-040BR oldest-first default; WEB-040BS stage and age filtering; WEB-040BT manual oldest/newest toggle; WEB-040BU preset-only age filters; WEB-040BV calendar-day windows; WEB-040AY protected append-only audit history; WEB-040AZ atomic successful-release/audit commit; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only participation OPEN; WEB-040W coupon details OPEN; WEB-040N **exactly two customer-facing price components**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BX — Tie-breaking for equal Flagged review timestamps (OPEN)
A. **Original Flagged review event ID ascending (recommended):** when two open concerns have exactly the same original Flagged review server timestamp, use their immutable, unique Flagged review event IDs in ascending order as a stable secondary sort in both oldest-first and newest-first modes. Prevents rows shifting unpredictably between refreshes.
B. **Original correction event ID ascending:** use the immutable, unique original correction event ID in ascending order as the secondary sort, keeping related audit identifiers central to ordering.
C. **No specified tie-break:** sort only by original Flagged review server timestamp and allow the database or implementation to determine order for exact timestamp ties. Simpler, but the order may change between views or pages.

**PROPOSED, not locked:** equal-timestamp tie-breaking, saved personal sort preferences, pagination, later reassessment mechanics, distinct event-triggered acceptance-ready notifications, audit retention and UI/API specifics. WEB-040BW fixed Asia/Kolkata flagged-age time zone is already LOCKED.

**STILL OPEN:** WEB-040BX equal-timestamp queue ordering, personal sort preference persistence, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Deterministic Flagged review event ID tie-breaking (WEB-040BX)

**LOCKED (WEB-040BX, Option A):** The authenticated-administrator **Open Flagged Concerns queue** (WEB-040BM) must have **deterministic ordering** when original independent **Flagged** reviews have identical server timestamps. The primary sort key remains the **original Flagged review server timestamp**. For exact timestamp ties, use the **immutable, unique original Flagged review event ID ascending** as the secondary key. Apply the same ascending ID tie-break under **Oldest Flagged First** and **Newest Flagged First**; only the direction of the primary timestamp key changes. Do not use the original correction event ID or rely on unspecified database ordering for ties.

**Display and integrity:** Apply this ordering after the existing **workflow-stage** and **flagged-age** filters (WEB-040BS/BU), with **All Open**, **All Ages**, and **Oldest Flagged First** as the defaults (WEB-040BR/BT). The Last 7/30/90 Days presets continue to use **Asia/Kolkata calendar days** (WEB-040BV/BW). The deterministic secondary key should keep rows in a repeatable relative order across refreshes and pagination when the result set is unchanged; it does not imply a locked pagination strategy or freeze a live queue while events are appended. Sorting is display-only and does not alter the protected append-only original audit, correction, Flagged review, narrative or acceptance events, derived workflow stages, open/closed status, queue membership, permissions or production-release state. Only independent **Resolution Accepted** closes a concern (WEB-040BK); **Further Action Required** leaves it open with discretionary additional action (WEB-040BL). Preserve no-fixed-deadline policies (WEB-040BF/BN/BO), queue-only discovery without automatic flagged-concern notifications (WEB-040BP), and WEB-040AZ operational audit-write failure alerts.

**LOCKED continuity:** WEB-040BG separate Pending Audit Correction Review queue; WEB-040BH queue-only discovery for pending initial independent reviews; WEB-040BA all authenticated administrators can view release audits; WEB-040BB explicit Production Audit Correct permission for correction and narrative follow-up; WEB-040BC structured correction with mandatory reason; WEB-040BD/BE independent initial correction review; WEB-040BI mandatory flagged narrative follow-up; WEB-040BJ narrative-only event with actor/time; WEB-040BK independent acceptance before closure; WEB-040BL discretionary action after Further Action Required; WEB-040BM dedicated Open Flagged Concerns queue; WEB-040BQ derived workflow-stage labels; WEB-040BR oldest-first default; WEB-040BS stage and age filtering; WEB-040BT manual oldest/newest toggle; WEB-040BU preset-only age filters; WEB-040BV calendar-day windows; WEB-040BW fixed Asia/Kolkata; WEB-040AY protected append-only audit history; WEB-040AZ atomic successful-release/audit commit; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only participation OPEN; WEB-040W coupon details OPEN; WEB-040N **exactly two customer-facing price components**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BY — Persistence of queue view selections (OPEN)
A. **Reset on every queue visit (recommended):** on opening the queue anew, reset to **All Open**, **All Ages** and **Oldest Flagged First**. Stage, age and sort changes apply only to the current queue view. No administrator preference storage.
B. **Remember within the authenticated session:** retain the administrator's stage, age preset and oldest/newest sort selections while their current authenticated session lasts, including reopening the queue; reset to defaults on a new session.
C. **Save per administrator across sessions:** persist each administrator's most recent stage, age preset and sort selections across sessions, with a clear Reset to Defaults control. Defaults apply for administrators with no saved preferences; adds preference storage and management.

**PROPOSED, not locked:** queue view selection persistence, pagination approach, later reassessment mechanics, distinct event-triggered notifications, audit retention and UI/API specifics. WEB-040BX stable Flagged review event ID tie-breaking is already LOCKED.

**STILL OPEN:** WEB-040BY queue view selection persistence, pagination, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Reset queue view selections on every visit (WEB-040BY)

**LOCKED (WEB-040BY, Option A):** Every **new visit** to the authenticated-administrator **Open Flagged Concerns queue** (WEB-040BM) begins with **All Open** workflow stages, **All Ages** flagged-age preset and **Oldest Flagged First** sorting. Administrators may temporarily select one of the three derived stages (WEB-040BQ/BS), **Last 7/30/90 Days** (WEB-040BU/BV/BW) or **Newest Flagged First** (WEB-040BT), but those selections apply only while the current queue view remains open. Leaving and reopening the queue resets all three to the defaults, **even within the same authenticated session**. Do not persist selections as per-administrator preferences or carry them into a later queue visit. This decision does not impose a particular mechanism for page refresh or in-view navigation; those UI details remain OPEN.

**Display-only integrity:** Keep the original independent Flagged review server timestamp as the age and primary sorting basis, with **Asia/Kolkata calendar-day windows** and **immutable original Flagged review event ID ascending** for exact timestamp ties in both sort modes (WEB-040BV/BW/BX). A filter/sort change or reset does not rewrite protected append-only audit/correction/review/narrative/acceptance history, alter derived workflow stages, close/reopen concerns, modify canonical queue membership or release state, or grant additional rights. Only valid independent **Resolution Accepted** closes a concern (WEB-040BK); **Further Action Required** leaves it open with discretionary additional action (WEB-040BL). No fixed initial review, narrative-follow-up or acceptance deadlines (WEB-040BF/BN/BO), and no automatic newly flagged/open-concern notifications or digests (WEB-040BP); preserve WEB-040AZ operational audit-write failure alerts.

**LOCKED continuity:** WEB-040BG separate Pending Audit Correction Review queue; WEB-040BH queue-only discovery for pending initial independent reviews; WEB-040BA all authenticated administrators can view release audits; WEB-040BB explicit Production Audit Correct permission for correction and narrative follow-up; WEB-040BC structured correction with mandatory reason; WEB-040BD/BE independent initial correction review; WEB-040BI mandatory flagged narrative follow-up; WEB-040BJ narrative-only event with actor/time; WEB-040BK independent acceptance before closure; WEB-040BL discretionary action after Further Action Required; WEB-040BM dedicated Open Flagged Concerns queue; WEB-040BQ derived workflow-stage labels; WEB-040BR oldest-first default; WEB-040BS stage and age filtering; WEB-040BT manual oldest/newest toggle; WEB-040BU preset-only age filters; WEB-040BV calendar-day windows; WEB-040BW fixed Asia/Kolkata; WEB-040BX deterministic original Flagged review ID tie-break; WEB-040AY protected append-only audit history; WEB-040AZ atomic successful-release/audit commit; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only participation OPEN; WEB-040W coupon details OPEN; WEB-040N **exactly two customer-facing price components**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040BZ — Queue navigation/pagination (OPEN)
A. **Numbered pages with Previous/Next (recommended):** show an explicit, accessible page navigator for the filtered and sorted Open Flagged Concerns queue. Administrators can move backward or forward and select a numbered page. Page size and consistency during live queue updates remain separate.
B. **Explicit Load More batches:** initially show a batch of results and append the next batch when the administrator selects Load More. Avoid page numbers; batch size and handling of live updates remain separate.
C. **Automatic infinite scroll:** load additional ordered results automatically as the administrator scrolls toward the end. Reduces clicks but makes position and navigation less explicit; batch size and live-update behaviour remain separate.

**PROPOSED, not locked:** navigation/pagination style, page/batch size, consistency under concurrent queue changes, later reassessment mechanics, distinct event-triggered notifications, audit retention and UI/API specifics. WEB-040BY reset-on-visit behaviour is already LOCKED.

**STILL OPEN:** WEB-040BZ queue navigation/pagination, page size, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Numbered-page Open Flagged Concerns navigation (WEB-040BZ)

**LOCKED (WEB-040BZ, Option A):** The authenticated-administrator **Open Flagged Concerns queue** (WEB-040BM) uses **numbered pages with explicit Previous and Next controls**, including direct selection of a displayed page number. Do not use Load More-only navigation or automatic infinite scroll as the primary pagination interaction. The navigator must operate on the currently filtered and sorted open-concern result set and provide a clear current-page indication. Exact page-number display range, accessibility details, page size, total-count presentation and concurrent-update handling remain implementation/decision details, not new locked policy.

**Existing filters, sorting and integrity:** Pagination applies after the combinable **workflow-stage filter** (All Open, Awaiting Narrative Follow-up, Awaiting Independent Acceptance, Further Action Required; WEB-040BQ/BS) and **flagged-age preset** (All Ages, Last 7/30/90 Days; WEB-040BU). Age windows use the **original independent Flagged review server timestamp** and **Asia/Kolkata calendar days** (WEB-040BV/BW). Default sorting is **Oldest Flagged First**, with optional **Newest Flagged First** (WEB-040BR/BT), and exact timestamp ties are broken by **immutable original Flagged review event ID ascending in both modes** (WEB-040BX). On each new visit, stage/age/sort selections reset to **All Open / All Ages / Oldest Flagged First** (WEB-040BY). Numbered navigation is presentation-only; it must not change protected append-only release audits, corrections, Flagged reviews, narrative follow-ups or acceptance decisions, derived stages, canonical open queue membership, permission checks or production-release state. Only valid independent **Resolution Accepted** closes a concern (WEB-040BK); Further Action Required remains open (WEB-040BL). Preserve no-fixed-deadline policies (WEB-040BF/BN/BO), queue-only flagged-concern discovery without automatic notifications/digests (WEB-040BP), and WEB-040AZ audit-write failure operational alerts.

**LOCKED continuity:** WEB-040BG separate Pending Audit Correction Review queue; WEB-040BH queue-only discovery for pending initial independent reviews; WEB-040BA all authenticated administrators can view release audits; WEB-040BB explicit Production Audit Correct permission for correction and narrative follow-up; WEB-040BC structured correction with mandatory reason; WEB-040BD/BE independent initial correction review; WEB-040BI mandatory flagged narrative follow-up; WEB-040BJ narrative-only event with actor/time; WEB-040BK independent acceptance before closure; WEB-040BL discretionary action after Further Action Required; WEB-040BM dedicated Open Flagged Concerns queue; WEB-040BQ derived workflow-stage labels; WEB-040BR oldest-first default; WEB-040BS stage and age filtering; WEB-040BT manual oldest/newest toggle; WEB-040BU preset-only age filters; WEB-040BV calendar-day windows; WEB-040BW fixed Asia/Kolkata; WEB-040BX deterministic original Flagged review ID tie-break; WEB-040BY reset-on-visit defaults; WEB-040AY protected append-only audit history; WEB-040AZ atomic successful-release/audit commit; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only participation OPEN; WEB-040W coupon details OPEN; WEB-040N **exactly two customer-facing price components**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040CA — Numbered-page size for Open Flagged Concerns (OPEN)
A. **Fixed 25 concerns per page (recommended):** always display up to 25 open concerns per numbered page. Predictable page lengths and manageable review density without a page-size control.
B. **Fixed 50 concerns per page:** always display up to 50 open concerns per numbered page. Fewer page transitions but denser screens.
C. **Administrator-selectable 25/50/100 (default 25):** provide a page-size selector within the current queue view. More flexibility and UI complexity; persistence of the page-size selection and its effect on the current page remain separate decisions.

**PROPOSED, not locked:** page size, resetting page number after filter/sort changes, consistency during concurrent queue changes, page-number presentation details, later reassessment mechanics, distinct event-triggered notifications, audit retention and UI/API specifics. WEB-040BZ numbered pagination is already LOCKED.

**STILL OPEN:** WEB-040CA page size, pagination consistency and filter-change navigation, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Selectable Open Flagged Concerns page size (WEB-040CA)

**LOCKED (WEB-040CA, Option C):** The authenticated-administrator **Open Flagged Concerns queue** (WEB-040BM) provides a **page-size selector** with exactly **25, 50 and 100 concerns per numbered page**, and **25 as the default**. The chosen size controls how many filtered and sorted open concerns appear on each numbered page, including when navigating using **Previous**, **Next** or a displayed page number (WEB-040BZ). Unlike the fixed 25- or 50-row alternatives, this is an explicit administrator choice. No custom numeric page-size entry or additional preset is approved.

**Combined behaviour and integrity:** The page-size selector operates alongside the workflow-stage filter (WEB-040BQ/BS), All Ages / Last 7/30/90 Days presets based on the original independent Flagged review timestamp and Asia/Kolkata calendar dates (WEB-040BU/BV/BW), and Oldest Flagged First / Newest Flagged First sort with immutable original Flagged review event ID ascending for exact timestamp ties (WEB-040BR/BT/BX). On every new queue visit, **stage, age and sort** reset to **All Open / All Ages / Oldest Flagged First** (WEB-040BY); **page-size persistence between visits remains a separate open decision**. Changing the page size only changes presentation and cannot mutate protected append-only release audits, corrections, Flagged reviews, narrative follow-ups or acceptance events, derived stages, open/closed status, permissions, payment/readiness/production-release state, or the WEB-040AZ audit-write-failure alert policy. Only independent **Resolution Accepted** closes a concern (WEB-040BK); Further Action Required remains open with discretionary additional action (WEB-040BL). Preserve no-fixed-deadline rules (WEB-040BF/BN/BO) and queue-only discovery without automatic flagged-concern notifications (WEB-040BP).

**LOCKED continuity:** WEB-040BG separate Pending Audit Correction Review queue; WEB-040BH queue-only discovery for pending initial independent reviews; WEB-040BA all authenticated administrators can view release audits; WEB-040BB explicit Production Audit Correct permission for correction and narrative follow-up; WEB-040BC structured correction with mandatory reason; WEB-040BD/BE independent initial correction review; WEB-040BI mandatory flagged narrative follow-up; WEB-040BJ narrative-only event with actor/time; WEB-040BK independent acceptance before closure; WEB-040BL discretionary action after Further Action Required; WEB-040BM dedicated Open Flagged Concerns queue; WEB-040BQ derived workflow-stage labels; WEB-040BR oldest-first default; WEB-040BS stage and age filtering; WEB-040BT manual oldest/newest toggle; WEB-040BU preset-only age filters; WEB-040BV calendar-day windows; WEB-040BW fixed Asia/Kolkata; WEB-040BX deterministic original Flagged review ID tie-break; WEB-040BY reset-on-visit stage/age/sort; WEB-040BZ numbered pages; WEB-040AY protected append-only audit history; WEB-040AZ atomic successful-release/audit commit; WEB-040AW success audit; WEB-040AX all rejected attempts logged; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ explicit Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN individual/whole-order release; WEB-040AO atomic whole-order release. Quote Only participation OPEN; WEB-040W coupon details OPEN; WEB-040N **exactly two customer-facing price components**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040CB — Current page after queue control changes (OPEN)
A. **Reset to page 1 (recommended):** when an administrator changes workflow-stage filter, flagged-age preset, oldest/newest sort or page size, return to the first numbered page of the newly filtered and sorted results. Simple and predictable; avoids out-of-range pages.
B. **Preserve current page number where valid:** keep the current numbered page after the change if it still exists; otherwise show the new last page. Less navigation but may land on a different group of concerns.
C. **Preserve the current first visible concern where possible:** after the change, navigate to the page containing the previously first visible concern if it remains in the result set; otherwise return to page 1. More continuity but more complex and sometimes surprising.

**PROPOSED, not locked:** page reset/preservation after filter, sort or page-size changes; page-size persistence across queue visits; consistency during concurrent queue changes; page-number presentation details; later reassessment mechanics; distinct event-triggered notifications; audit retention and UI/API specifics. WEB-040CA selectable 25/50/100 page sizes with default 25 are already LOCKED.

**STILL OPEN:** WEB-040CB page position after control changes, page-size persistence, pagination consistency, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Page-one reset after queue control changes (WEB-040CB)

**LOCKED (WEB-040CB, Option A):** Within the authenticated-administrator **Open Flagged Concerns queue**, changing any of the following controls must immediately show **page 1** of the updated result set: the **workflow-stage filter** (WEB-040BQ/BS), **All Ages / Last 7/30/90 Days flagged-age preset** (WEB-040BU/BV/BW), **Oldest Flagged First / Newest Flagged First** sort (WEB-040BR/BT/BX), or **25/50/100 concerns-per-page selector** (WEB-040CA). Do not keep the old page number or search for the previously first visible concern. If the updated result set is empty, show the queue's empty-result state rather than an invalid page. Preserve **numbered pages with Previous/Next** (WEB-040BZ). This rule applies to control changes within the current queue view, not a new persistence policy.

**Existing queue semantics:** Each new visit already resets **stage to All Open, age to All Ages and sorting to Oldest Flagged First** (WEB-040BY). The page-size selector still has **25 as its default**, but whether a changed size is retained across queue visits remains **OPEN**. Filter age against the **original independent Flagged review server timestamp** using **Asia/Kolkata calendar days** (WEB-040BV/BW); sort by that original timestamp with the **immutable original Flagged review event ID ascending** for exact timestamp ties in both directions (WEB-040BX). Page resets and navigation are presentation-only and must never mutate protected append-only release/correction/Flagged/narrative/acceptance events, derived workflow stages, open/closed concern status, permissions, or actual production-release state. Only valid independent **Resolution Accepted** closes a concern (WEB-040BK); Further Action Required remains open (WEB-040BL). Preserve no-fixed-deadline policies (WEB-040BF/BN/BO), queue-only flagged-concern discovery without automatic notifications/digests (WEB-040BP), and WEB-040AZ audit-write failure operational alerts.

**LOCKED continuity:** WEB-040BG separate Pending Audit Correction Review queue; WEB-040BH queue-only discovery for pending initial independent reviews; WEB-040BA authenticated administrators may view release audits; WEB-040BB Production Audit Correct permission required for correction and narrative follow-up; WEB-040BC structured correction with mandatory reason; WEB-040BD/BE independent initial correction review; WEB-040BI/BJ mandatory narrative-only flagged follow-up; WEB-040BK/BL independent acceptance and Further Action Required handling; WEB-040BM dedicated Open Flagged Concerns queue; WEB-040BQ derived stages; WEB-040BR/BT oldest/newest sorting; WEB-040BS/BU/BV/BW stage and age presets; WEB-040BX deterministic tie-break; WEB-040BY reset-on-visit stage/age/sort; WEB-040BZ numbered pages; WEB-040CA selectable page size; WEB-040AY protected append-only audit history; WEB-040AZ atomic release/success-audit commit; WEB-040AW/AX successful and rejected attempt audits; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN/AO individual/atomic whole-order release. Quote Only participation OPEN; WEB-040W coupon details OPEN; WEB-040N **exactly two customer-facing price components**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040CC — Persistence of page-size selection (OPEN)
A. **Reset to 25 on every queue visit (recommended):** the page-size selector always starts at 25 when an administrator opens the queue anew. Changes to 50 or 100 last only in the current queue view; no saved page-size preferences.
B. **Remember within the authenticated session:** retain the most recently selected 25/50/100 size when the same administrator reopens the queue in the current session, but reset to 25 in a new session. Stage/age/sort still reset on every visit.
C. **Save per administrator across sessions:** persist each administrator's selected page size across visits and sessions; use 25 for administrators without a saved size. Stage/age/sort still reset on every visit.

**PROPOSED, not locked:** page-size persistence, pagination consistency under concurrent queue changes, page-number presentation details, later reassessment mechanics, audit retention and UI/API specifics. WEB-040CB reset to page 1 after control changes is already LOCKED.

**STILL OPEN:** WEB-040CC page-size persistence, concurrent-update pagination consistency, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Reset page size to 25 on every queue visit (WEB-040CC)

**LOCKED (WEB-040CC, Option A):** Every **new visit** to the authenticated-administrator **Open Flagged Concerns queue** begins with the **25 concerns-per-page** setting. The administrator can select **50 or 100** (WEB-040CA), but that change applies **only within the current queue view**. Leaving and reopening the queue resets page size to **25**, including when the authenticated session remains active. Do not save per-administrator page-size preferences or retain the choice within a session after a new queue visit. This aligns with WEB-040BY: every new visit starts with **All Open** workflow stages, **All Ages** flagged-age preset, **Oldest Flagged First** sort and now **25 concerns per page**. This does not establish a particular browser-refresh or navigation lifecycle beyond the new-visit rule.

**Pagination and protected state:** Keep **numbered pages with Previous/Next** (WEB-040BZ). Within the current queue view, a change to **stage, age preset, sort direction or page size** resets the page number to **1** (WEB-040CB). Stage filters derive from existing concern workflow (WEB-040BQ/BS); age presets use the **original independent Flagged review timestamp** and **Asia/Kolkata calendar dates** (WEB-040BU/BV/BW); sorting uses the original timestamp and **immutable original Flagged review event ID ascending** for exact ties in both directions (WEB-040BR/BT/BX). All controls remain presentation-only. Do not rewrite append-only release/correction/Flagged/narrative/acceptance events, derived stages, concern closure, queue membership, permissions, deadlines, notifications or production-release state. Only valid independent **Resolution Accepted** closes a concern (WEB-040BK); Further Action Required remains open (WEB-040BL). Keep no-fixed-deadline policies (WEB-040BF/BN/BO), queue-only flagged-concern discovery without automatic notifications/digests (WEB-040BP), and WEB-040AZ audit-write failure operational alerts.

**LOCKED continuity:** WEB-040BG separate Pending Audit Correction Review queue; WEB-040BH queue-only discovery for pending initial independent reviews; WEB-040BA all authenticated administrators can view release audits; WEB-040BB Production Audit Correct permission required for correction and narrative follow-up; WEB-040BC structured correction with mandatory reason; WEB-040BD/BE independent initial correction review; WEB-040BI/BJ mandatory narrative-only flagged follow-up; WEB-040BK/BL independent acceptance and Further Action Required handling; WEB-040BM dedicated Open Flagged Concerns queue; WEB-040BQ derived stages; WEB-040BR/BT oldest/newest sorting; WEB-040BS/BU/BV/BW stage and age presets; WEB-040BX deterministic tie-break; WEB-040BY reset-on-visit stage/age/sort; WEB-040BZ numbered pages; WEB-040CA selectable page size; WEB-040CB reset page 1 on control changes; WEB-040AY protected append-only audit history; WEB-040AZ atomic release/success-audit commit; WEB-040AW/AX successful and rejected attempt audits; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN/AO individual/atomic whole-order release. Quote Only participation OPEN; WEB-040W coupon details OPEN; WEB-040N **exactly two customer-facing price components**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040CD — Pagination during concurrent queue updates (OPEN)
A. **Live re-query on each page navigation (recommended):** retrieve the current authorised, filtered and deterministically sorted open-concern result set whenever the administrator opens a numbered page or uses Previous/Next. Recalculate available page numbers; if a requested page no longer exists, show the last valid page (or empty state). Concurrent changes can shift rows between page visits, but the queue reflects current records. Do not infer a new automatic notification policy.
B. **Fixed view snapshot until refresh or control change:** keep the list of concern IDs and their initial ordering stable for pagination during the current view, refreshing it only when the administrator explicitly refreshes or changes a queue control. Revalidate live permissions and action eligibility independently; snapshot rows may become stale.
C. **Automatic refresh and return to page 1 on underlying changes:** detect a change to queue membership/order while the view is open, automatically reload current results and reset to page 1. Fresh results but potentially disruptive to an administrator navigating later pages; no email or external alert implied.

**PROPOSED, not locked:** concurrent-update pagination consistency, refresh triggers, count presentation, page-number display range, later reassessment mechanics, audit retention and UI/API specifics. WEB-040CC page-size reset to 25 on each new queue visit is already LOCKED.

**STILL OPEN:** WEB-040CD concurrent-update pagination consistency, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Live re-query on numbered-page navigation (WEB-040CD)

**LOCKED (WEB-040CD, Option A):** In the authenticated-administrator **Open Flagged Concerns queue** (WEB-040BM), every **numbered-page selection**, **Previous** action and **Next** action must query the **current authorised open-concern result set**. Apply the currently selected workflow-stage filter (WEB-040BQ/BS), All Ages / Last 7/30/90 Days flagged-age preset using **Asia/Kolkata calendar dates** from the original independent Flagged review timestamp (WEB-040BU/BV/BW), and Oldest Flagged First / Newest Flagged First sorting by that original timestamp with **immutable original Flagged review event ID ascending** for exact ties in both directions (WEB-040BR/BT/BX). Respect the selected **25/50/100 page size** (WEB-040CA) and recompute available page numbers for the live results. If a requested page no longer exists after records are added or concerns close, show the **last valid page**; if no records match, show the **empty-result state** instead of an invalid page. Because data is re-queried on each navigation, rows can move between pages over time. Do not claim a fixed multi-page snapshot or a guarantee that an administrator will see each concern exactly once while the queue changes.

**Existing navigation and audit integrity:** Keep **numbered pages with Previous/Next** (WEB-040BZ). Explicit changes to stage, age preset, sort direction or page size still return to **page 1** (WEB-040CB); each new visit still resets to **All Open / All Ages / Oldest Flagged First / 25 concerns per page** (WEB-040BY/CC). Re-querying is a display/read operation only and must not modify protected append-only release audits, corrections, Flagged reviews, narrative follow-ups or acceptance decisions, derived workflow stages, canonical concern open/closed status, permissions, deadlines, notification policy, or production-release state. Only a valid independent **Resolution Accepted** decision closes a concern (WEB-040BK); Further Action Required remains open (WEB-040BL). Keep no-fixed-deadline policies (WEB-040BF/BN/BO), queue-only flagged-concern discovery without automatic notifications/digests (WEB-040BP), and WEB-040AZ audit-write failure operational alerts. This decision **does not** choose automatic polling, push updates, or manual refresh behaviour while the administrator remains on a page.

**LOCKED continuity:** WEB-040BG separate Pending Audit Correction Review queue; WEB-040BH queue-only discovery for pending initial independent reviews; WEB-040BA authenticated administrators may view release audits; WEB-040BB Production Audit Correct permission required for correction and narrative follow-up; WEB-040BC structured correction with mandatory reason; WEB-040BD/BE independent initial correction review; WEB-040BI/BJ mandatory narrative-only flagged follow-up; WEB-040BK/BL independent acceptance and Further Action Required handling; WEB-040BM dedicated Open Flagged Concerns queue; WEB-040BQ derived stages; WEB-040BR/BT oldest/newest sorting; WEB-040BS/BU/BV/BW stage and age presets; WEB-040BX deterministic tie-break; WEB-040BY reset-on-visit stage/age/sort; WEB-040BZ numbered pages; WEB-040CA selectable page size; WEB-040CB page-one reset on control changes; WEB-040CC page-size reset on visit; WEB-040AY protected append-only audit history; WEB-040AZ atomic release/success-audit commit; WEB-040AW/AX successful and rejected attempt audits; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN/AO individual/atomic whole-order release. Quote Only participation OPEN; WEB-040W coupon details OPEN; WEB-040N **exactly two customer-facing price components**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040CE — In-view queue freshness while remaining on a page (OPEN)
A. **Explicit Refresh control only (recommended):** show a visible Refresh action to re-query the currently displayed page on demand, in addition to the already mandatory live re-query on Previous/Next/page-number navigation. Do not automatically poll or push changes while the administrator remains on the page. Handle an invalidated current page by displaying the last valid page or empty state.
B. **Automatic periodic refresh:** while the administrator remains on a page, re-query the current page every 60 seconds, as well as on navigation. Keep the current page where valid and fall back to the last valid page or empty state. May shift rows during review.
C. **Live push-based updates:** update the currently displayed page as underlying queue membership or ordering changes, in addition to re-querying on navigation. Keep the current page where valid and fall back to the last valid page or empty state. Requires live update infrastructure and may disrupt review.

**PROPOSED, not locked:** in-view freshness/refresh method, UI presentation of last-refresh time and counts, page-number display range, later reassessment mechanics, audit retention and UI/API specifics. WEB-040CD live re-query on every page navigation is already LOCKED. An in-view refresh is not an automatic email, digest or external notification.

**STILL OPEN:** WEB-040CE in-view queue freshness, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Manual in-view queue refresh (WEB-040CE)

**LOCKED (WEB-040CE, Option A):** In the authenticated-administrator **Open Flagged Concerns queue** (WEB-040BM), provide a clearly visible **Refresh** action that re-queries the currently displayed numbered page against **current authorised, filtered and deterministically sorted** open concerns. Do **not** automatically poll every 60 seconds or provide live push-based in-view updates while an administrator remains on the same page. This is distinct from and preserves WEB-040CD's mandatory **live re-query whenever the administrator selects a page number or uses Previous/Next**. Manual Refresh must use the current stage, age, sort and page-size selections; preserve the current numbered page if it still exists, otherwise show the **last valid page**, or the **empty-result state** if nothing matches. This refresh does not itself change filters, sort or page size and therefore does not trigger WEB-040CB's page-1 reset, which applies when those controls change.

**Existing queue semantics and protected state:** Every new visit starts with **All Open**, **All Ages**, **Oldest Flagged First** and **25 concerns per page** (WEB-040BY/CC); the current view permits derived workflow-stage filtering (WEB-040BQ/BS), Last 7/30/90 Days age presets using the original independent Flagged review timestamp and **Asia/Kolkata calendar dates** (WEB-040BU/BV/BW), Oldest/Newest timestamp sorting with **immutable original Flagged review event ID ascending** for exact ties (WEB-040BR/BT/BX), and 25/50/100 page sizes (WEB-040CA). Keep numbered pages with Previous/Next (WEB-040BZ). Refresh/navigation are read-only: do not rewrite protected append-only release/correction/Flagged/narrative/acceptance history, derived workflow stages, canonical concern status, permissions, payment/readiness/production-release state, or WEB-040AZ audit-write failure operational alerts. Only a valid independent **Resolution Accepted** closes a concern (WEB-040BK); Further Action Required stays open (WEB-040BL). Preserve no-fixed-deadline rules (WEB-040BF/BN/BO) and queue-only flagged-concern discovery without automatic notifications/digests (WEB-040BP). The Refresh button is not a new automatic notification channel.

**LOCKED continuity:** WEB-040BG separate Pending Audit Correction Review queue; WEB-040BH queue-only discovery for pending initial independent reviews; WEB-040BA authenticated administrators may view release audits; WEB-040BB Production Audit Correct permission required for correction and narrative follow-up; WEB-040BC structured correction with mandatory reason; WEB-040BD/BE independent initial correction review; WEB-040BI/BJ mandatory narrative-only flagged follow-up; WEB-040BK/BL independent acceptance and Further Action Required handling; WEB-040BM dedicated Open Flagged Concerns queue; WEB-040BQ derived stages; WEB-040BR/BT oldest/newest sorting; WEB-040BS/BU/BV/BW stage and age presets; WEB-040BX deterministic tie-break; WEB-040BY reset-on-visit stage/age/sort; WEB-040BZ numbered pages; WEB-040CA selectable page size; WEB-040CB page-one reset on control changes; WEB-040CC page-size reset on visit; WEB-040CD live page-navigation re-query; WEB-040AY protected append-only audit history; WEB-040AZ atomic release/success-audit commit; WEB-040AW/AX successful and rejected attempt audits; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN/AO individual/atomic whole-order release. Quote Only participation OPEN; WEB-040W coupon details OPEN; WEB-040N **exactly two customer-facing price components**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040CF — Result-count presentation on numbered pages (OPEN)
A. **Visible row range and matching total (recommended):** show a label such as **Showing 26–50 of 83 matching concerns** using the currently fetched filtered result set. Update the range and total on Refresh, navigation or control changes. With zero matches, show an empty-result state and a zero count.
B. **Visible matching total only:** show a label such as **83 matching concerns** alongside numbered pagination, without a current-page row range.
C. **No separate matching count:** show numbered pagination and its current page, but no additional exact matching-record count or row range.

**PROPOSED, not locked:** result-count presentation, display of last-refresh timestamp, page-number range, later reassessment mechanics, audit retention and UI/API specifics. WEB-040CE manual Refresh without background polling or push updates is already LOCKED.

**STILL OPEN:** WEB-040CF result-count presentation, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

## 2026-10-28 — Row range and matching total for Open Flagged Concerns (WEB-040CF)

**LOCKED (WEB-040CF, Option A):** On each numbered page of the authenticated-administrator **Open Flagged Concerns queue** (WEB-040BM/BZ), display the **one-based range of rows shown on the current page and the exact matching total** from the **latest successful authorised query**, for example **Showing 26–50 of 83 matching concerns**. With 25 rows per page, page 1 of 83 matches reads **Showing 1–25 of 83 matching concerns**; the final page reads **Showing 76–83 of 83 matching concerns**. Derive both figures from the same currently fetched, stage-filtered, age-filtered and deterministically sorted open-concern result set and the current **25/50/100** page-size selection (WEB-040CA). For no matches, display the empty-result state with **0 matching concerns** and no misleading nonzero range or invalid page number. Recalculate the range and total after a new queue visit, an explicit **Refresh** (WEB-040CE), any **Previous/Next/page-number navigation** (WEB-040CD), and stage, age, sort or page-size changes (WEB-040CB). Counts describe the most recently fetched result set; WEB-040CE prohibits automatic polling or live push updates while remaining on a page, so do not claim counts are continuously current.

**Preserved queue rules and audit integrity:** Each new visit resets to **All Open**, **All Ages**, **Oldest Flagged First**, **25 concerns per page** (WEB-040BY/CC). Within the view, stage and age filters remain combinable (WEB-040BQ/BS/BU); flagged-age windows use the original independent Flagged review server timestamp and **Asia/Kolkata calendar dates** (WEB-040BV/BW); oldest/newest sorting uses that original timestamp with **immutable original Flagged review event ID ascending** for exact ties in either direction (WEB-040BR/BT/BX). Explicit control changes reset to page 1 (WEB-040CB); manual Refresh retains the current page if valid, otherwise falls back to the last valid page or empty state (WEB-040CE). All counts and navigation are display-only. Do not modify protected append-only release/correction/Flagged/narrative/acceptance history, derived stages, canonical concern closure, administrator permissions, deadlines, notifications or production-release state. Only valid independent **Resolution Accepted** closes a concern (WEB-040BK); Further Action Required remains open (WEB-040BL). Preserve no-fixed-deadline policies (WEB-040BF/BN/BO), queue-only discovery without automatic notifications/digests (WEB-040BP), and WEB-040AZ audit-write failure operational alerts.

**LOCKED continuity:** WEB-040BG separate Pending Audit Correction Review queue; WEB-040BH queue-only discovery for pending initial independent reviews; WEB-040BA authenticated administrators may view release audits; WEB-040BB Production Audit Correct permission required for correction and narrative follow-up; WEB-040BC structured correction with mandatory reason; WEB-040BD/BE independent initial correction review; WEB-040BI/BJ mandatory narrative-only flagged follow-up; WEB-040BK/BL independent acceptance and Further Action Required handling; WEB-040BM dedicated Open Flagged Concerns queue; WEB-040BQ derived stages; WEB-040BR/BT oldest/newest sorting; WEB-040BS/BU/BV/BW stage and age presets; WEB-040BX deterministic tie-break; WEB-040BY reset-on-visit stage/age/sort; WEB-040BZ numbered pages; WEB-040CA selectable page size; WEB-040CB page-one reset on control changes; WEB-040CC page-size reset on visit; WEB-040CD live page-navigation re-query; WEB-040CE explicit Refresh only; WEB-040AY protected append-only audit history; WEB-040AZ atomic release/success-audit commit; WEB-040AW/AX successful and rejected attempt audits; WEB-040AV Already Released duplicate rejection; WEB-040AU single-click release; WEB-040AK verified full payment; WEB-040AM/AQ Production Release permission; WEB-040AP/AR per-line readiness; WEB-040AS irreversible readiness; WEB-040AT no formal hold; WEB-040AN/AO individual/atomic whole-order release. Quote Only participation OPEN; WEB-040W coupon details OPEN; WEB-040N **exactly two customer-facing price components**: discounted tax-inclusive products plus one combined delivery charge if applicable. No courier APIs; manual multi-courier fulfilment. **WEB-038 cart interaction DEFERRED**.

### Next independent decision WEB-040CG — Last-updated indicator for queue data (OPEN)
A. **Absolute last-fetched time in Asia/Kolkata (recommended):** display a label such as **Last updated: 14:35 IST** based on the time of the latest successful queue fetch (initial load, manual Refresh, page navigation or control change). Do not advance the timestamp on failed fetches. The timestamp reports data freshness, not when a concern was originally Flagged.
B. **Relative time since last successful fetch:** display **Updated just now / Updated 5 minutes ago**, with the label's elapsed time progressing while the page remains open, but without re-fetching data or introducing automatic queue updates. Do not advance the underlying successful-fetch timestamp on failures.
C. **No last-updated indicator:** show the row range, matching total and Refresh action without a separate time label; avoid additional UI but give no explicit indication of how old the displayed data is.

**PROPOSED, not locked:** last-updated indicator, page-number display range, later reassessment mechanics, audit retention and UI/API specifics. WEB-040CF visible row range and matching total are already LOCKED.

**STILL OPEN:** WEB-040CG last-updated indicator, later reassessment mechanics, audit retention, audit UI/API and scoped visibility, operational alert delivery, Quote Only participation, coupon details, numeric quote validity, payment/expiry races, lead times/capacity, cancellations/refunds, SMTP retries, tax/rate specifics. **WEB-038 DEFERRED.**

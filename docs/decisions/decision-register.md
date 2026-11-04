# Tavistra decision register

**Read statuses carefully.** This is a curated historical synthesis current as of 2026-10-22. Proposed technical recommendations are not automatically decisions. IDs are stable; when an item changes, record the supersession and rationale rather than erasing history.

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| BR-001 | Brand | LOCKED | Brand **Tavistra**, lifestyle/decor sub-brand of **VDesign** | Separate premium design positioning; furniture/site-integrated work stays VDesign |
| BR-002 | Brand | LOCKED | Design-led standalone/straightforward-mounted objects; low installation | Distinct from built-in furniture/site projects |
| BR-003 | Brand | LOCKED | Small limited batches (planning baseline up to ~10 units per design/variant/batch); scalable later | Allows testing and handmade/limited production |
| BR-004 | Brand | LOCKED | Own designs, curated/vendor-made and private-label possible | Retains sourcing flexibility; Tavistra responsible for service/warranty |
| BR-005 | Brand | CONDITIONAL | Lighting/electrical and other regulated objects | Require SKU-level safety, legal/certification and supplier review; vendor certification isn't automatic final product compliance |
| BR-006 | Brand | REJECTED | Traditional jewellery, apparel, stationery, standard travel/everyday carry category | Outside design-led décor scope/desired boundaries |
| BR-007 | Brand | LOCKED | Gifting, festive, reclaimed, experimental, cultural as overlapping collections/tags | Not separate main taxonomy categories |
| CAT-001 | Taxonomy | LOCKED | 6 core categories, 19 subcategories | Strong category separation; deliberate subcategory overlaps allowed |
| CAT-002 | Taxonomy | LOCKED | 43 canonical primary product types, not 46 | Desk Clocks merge; Desk Display cross-list; sculptural clocks reclassified |
| CAT-003 | Taxonomy | LOCKED | Four layers: Product Type, Development Concept, Design Language, Product Attributes | Avoid exploding style words into product types |
| CAT-004 | Taxonomy | LOCKED | Preserve all approved design ideas; one master SKU and deliberate cross-listing | Retain creativity without record duplication |
| CAT-005 | Taxonomy | LOCKED | Internal 'Others' fallbacks, not primary storefront navigation | Accommodate edge cases without clutter |
| CAT-006 | Taxonomy | DEFERRED | Functional Art and Garden & Balcony Décor scope refinement | Broad families: test eligibility when selecting actual products |
| CAT-007 | Taxonomy | REJECTED | Table & Vanity Mirrors under Tavistra | Owner assigned such objects to VDesign |
| CAT-008 | Taxonomy | REJECTED | Sculptural Phone/Tablet Device Stands as approved direction | Explicitly removed from shortlisted directions by owner |
| CAT-009 | Taxonomy | REJECTED | Digital display frames, food-serving trays as standard included directions | Scope/technology/food-contact boundaries |
| CAT-010 | Taxonomy | REJECTED | Separate Vertical Garden Planters direction; Outdoor Decorative Screens direction | Fold vertical arrangement into modular; outdoor screens risk architectural installation |
| CAT-011 | Taxonomy | PROVISIONAL | Five Desk Display Object concepts | Raised during sequential review but not explicitly locked; preserve provisionally |
| CAT-012 | Taxonomy | RECLASSIFIED | Decorative & Sculptural Clocks | Abstract, kinetic, mechanical, conceptual retained as wall/table clock design directions |
| CAT-013 | Taxonomy | MERGED | Desk Clocks development family | Table Clock family is canonical; desk-specific discovery remains |
| CAT-014 | Taxonomy | CROSS-LIST | Desk Display Objects | Discovery context populated from Sculptures/Art Objects |
| PD-001 | Product development | LOCKED | Two manufacturing groups: VDesign-compatible versus design-compatible but process/material-different | Prioritise current resources without limiting creative concepts |
| PD-002 | Product development | LOCKED | Assign groups per actual material/process concept, not per taxonomy type | Wooden and ceramic versions can require different production routes |
| PD-003 | Product development | PROPOSED | Prioritise Group 1 prototypes and partner-source Group 2 | Natural low-capex starting point; first batch not decided |
| PD-004 | Product development | DEFERRED | Initial assortment/BOM/cost/prices and prototype execution | Owner working on designs and physical batch before further catalogue work |
| WEB-001 | Web experience | LOCKED | Hybrid Editorial + Commerce | Premium showcase plus practical product discovery and purchasing |
| WEB-002 | Visual | LOCKED | Contemporary Gallery direction, responsive and easy to browse on any device | Strong art/design identity without sacrificing UX |
| WEB-003 | Visual | REJECTED | Journal at initial launch | Explicitly removed; can be reconsidered later |
| WEB-004 | Commerce | LOCKED | Ready-stock + made-to-order + custom enquiries | Separate sales and production flows; per-product modes |
| WEB-005 | Commerce | LOCKED | Guest checkout, with secure guest order recovery | Avoid login friction without exposing orders |
| WEB-006 | Admin | LOCKED | Manage catalogue, prices, stock, batches, orders, customers, shipping and roles | Operational system as important as customer storefront |
| WEB-007 | Architecture | LOCKED | File-based Markdown/media for product-heavy editorial content **only** | Reuses proven content workflow, no heavy CMS |
| WEB-008 | Architecture | LOCKED | Commercial data outside Markdown | Live pricing, inventory, orders/payments/customers must be transactional |
| WEB-009 | Architecture | LOCKED | Separate logical storefront and admin with shared business backend; unified deployment allowed | Separation of UX and security without needlessly multiplying hosting |
| WEB-010 | Architecture | REJECTED | Traditional CMS as central publishing dependency | Owner values speed, control, freedom from paid/restrictive services |
| WEB-011 | Architecture | PROPOSED | Next.js storefront, React/Vite admin, Node TS backend, PostgreSQL | Good candidates; not yet stack-locked, Rust/Axum viable |
| WEB-012 | Architecture | PROPOSED | SSR/SSG/ISR public, CSR for admin/interactions | Support search crawlability, speed and app-like UX |
| WEB-013 | Discovery | LOCKED PRINCIPLE | SEO, GEO, AEO designed into content pipeline | Factual discoverability and semantic data, no magic AI-indexing promises |
| WEB-014 | Infrastructure | LOCKED | Tavistra does not share hosting with VDesign | Isolation of brands/infrastructure |
| WEB-015 | Infrastructure | DEFERRED | Linode versus Hostinger VPS, resources, deployment layout | Compare full cost/operations and benchmark |
| WEB-016 | Dependencies | LOCKED | Prefer maintainable open-source/self-hostable libraries, avoid paid/restrictive dependency | Portability and control; external payment provider unavoidable |
| WEB-017 | Email | SUPERSEDED | PHPMailer specifically | Prior example, not hard constraint; language-native SMTP suitable |
| WEB-018 | Payment | DEFERRED | PhonePe or Razorpay | Select and test later; gateway abstraction recommended |
| WEB-019 | Shipping | LOCKED | Manual multi-courier entry with customer-facing tracking; optional APIs | No dependency on courier integration to launch |
| WEB-020 | Content | PROPOSED | Validated Markdown upload -> preview -> publish -> generated metadata and schema | Avoid arbitrary file execution, inconsistent SEO and runtime folder rescans |
| OPS-001 | Reliability | LOCKED | Structured application/security/audit/business logging | Diagnose errors and trace money/stock/user-impacting actions |
| OPS-002 | Reliability | LOCKED | Monitoring, backups, tested restore, rollback and controls | Testing alone cannot eliminate failures |
| OPS-003 | Support | LOCKED | Customer issue-report channel, independent support email and admin case workflow | Recover payment/order failures and remain contactable during outage |
| OPS-004 | Release | LOCKED | ~one-week invited beta on test domain, then gated public launch | Catch workflow/UX issues before real exposure |
| OPS-005 | Release | LOCKED PRINCIPLE | Isolate beta and live environments/data/keys; no automatic launch based only on time elapsed | Prevent test transactions and indexing from contaminating production |
| OPS-006 | Release | PROPOSED | Formal launch acceptance gates and controlled live payment smoke test | Verify readiness, not merely passage of seven days |

## Explicitly discussed technical alternatives
- **Static-only/react CSR storefront:** not chosen for full commerce because SEO needs initial indexable product HTML and server-side order authority; static assets still valuable.
- **WordPress or hosted headless CMS:** rejected for Tavistra baseline due to bloat/constraints/cost-control preferences; *custom administration remains essential*.
- **Hosted commerce platform:** not selected; would impose supplier dependence and reduce control. Do not misstate this as fully evaluated cost benchmark.
- **Microservices:** not recommended initially; modular monolith simpler.
- **Entire website dark mode:** not locked; contemporary gallery can have dark/light product surfaces for visual clarity.
- **Mail API vendor:** not required; SMTP with language-appropriate library and queue recommended.
- **Courier API mandatory:** rejected; manual tracking first and provider adapter later.
- **Global 'no testing needed' or 'testing sufficient':** rejected; test + operational resilience together.
- **One VPS vs physically separate deployments:** logical app separation preferred, actual deployment topology not finalized.

## Future updates
Append dated entries and refer back to IDs. Rejected status means rejected *for the relevant scope and time*, not impossible forever. Where acceptance is only inferred from discussion rather than explicitly confirmed, mark PROPOSED/CONDITIONAL and request review before treating it as locked.

## 2026-10-23 — Storefront design-system progression

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-021 | Visual system | LOCKED | **Adaptive Gallery** as Tavistra's global visual direction | Deliberately mix light, practical commerce surfaces with selected dark editorial/gallery surfaces; maintain coherent branding and usability across both. Does **not** imply an automatic OS/browser dark-mode toggle. |
| WEB-022 | Design process | LOCKED | Design storefront customer experience **page by page** before admin interface workflows | Establish consistent customer journeys and component needs before implementing management features. Admin architecture remains documented, but its detailed UI is deferred. |
| WEB-023 | Visual palette | PROPOSED | Warm neutral/light commerce surfaces with deep charcoal editorial surfaces | Palette values, accent colour, typography and navigation patterns require separate review and approval; examples are not final design tokens. |

## 2026-10-23 — Palette direction approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-024 | Visual palette | LOCKED | **Warm Mineral** as the colour direction for Adaptive Gallery | Warm light commerce foundation, charcoal editorial sections, restrained mineral/bronze accent; should work across wood, metal, glass and other materials without looking exclusively rustic. Exact hex values remain **PROPOSED**, not locked. Supersedes WEB-023's undecided palette direction but not its unapproved exact tokens. |
| WEB-025 | Accessibility | PROPOSED | WCAG 2.2 AA contrast goals, semantic foreground/surface pairs and visible focus indicators | Proposed measurable design-system acceptance criteria; validate in components, including disabled/hover/focus states. |

## 2026-10-23 — Exact palette and accessibility approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-026 | Design tokens | LOCKED | Approve **exact Warm Mineral palette and roles** in `docs/website/design-system-colour-tokens.md` | Baseline hex values, light/dark semantic uses, restrained bronze, and contrast-checked text/control pairs are now authoritative. Supersedes the provisional token status of WEB-023 and WEB-024; historical proposal retained. |
| WEB-025 | Accessibility | LOCKED | WCAG 2.2 AA accessibility **design target and colour-use requirements** | Normal text >=4.5:1; large text and relevant UI indicators >=3:1; visible focus; no colour-only state. Actual implementation still requires validation and testing. Supersedes WEB-025's earlier PROPOSED status. |
| WEB-027 | Typography | OPEN | Font pairing, type scale, weights, responsive rules and loading strategy | To be assessed in Step 01B; no font is approved by the palette decision. |

## 2026-10-23 — Typography direction approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-027 | Typography | LOCKED (direction only) | **Instrument Serif + Manrope** pairing for Tavistra storefront | Instrument Serif supplies selective editorial/gallery expression; Manrope supplies practical commerce/UI readability. Supersedes WEB-027 OPEN state. Exact weights, scale, tracking, italic usage and font-loading details remain **PROPOSED** in `docs/website/design-system-typography-proposal.md`. |
| WEB-028 | Typography tokens | PROPOSED | Fluid responsive type scale, line heights, weights, tracking, hierarchy and performance rules | Await detailed review; avoid mistaking proposed font-size tokens for approved implementation. |

## 2026-10-23 — Selective editorial hierarchy and typography baseline finalized

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-029 | Heading hierarchy | LOCKED | **Selective Editorial Serif** | Instrument Serif only in selected hero/story/collection headings; Manrope for functional headings and all commerce controls. Broad serif use rejected for launch due to reduced practical readability. |
| WEB-028 | Typography tokens | LOCKED (conditional on tests) | Finalize responsive type scale, weights, line heights, letter spacing and self-hosted performance baseline in `docs/website/design-system-typography-tokens.md` | Supersedes WEB-028's earlier PROPOSED status. Verify font assets, licence, glyphs, zoom/reflow, CLS/LCP and accessibility before release; document any test-driven changes. |
| WEB-030 | Layout and spacing | PROPOSED | Balanced Gallery vs Immersive Gallery vs Compact Commerce | Review proposed spacing and grid system in `docs/website/design-system-layout-proposal.md` before locking. |

## 2026-10-23 — Balanced Gallery with masonry preference

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-030 | Layout direction | SELECTED (tokens open) | **Balanced Gallery** | Owner accepts overall layout direction but requests asymmetrical, mixed-size cards rather than a uniformly symmetrical storefront. Exact responsive spacing and grid tokens still proposed. |
| WEB-031 | Grid composition | PROPOSED | **Editorial mosaic / selective masonry**, not universal masonry | Mixed large/small curated cards for homepage/collections; predictable grids for search/comparison/transactions to preserve usability, accessibility and reading order. Scope of masonry on category pages awaits approval. |

## 2026-10-23 — Grid strategy approved; spacing refinement proposed

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-030 | Layout direction | LOCKED (direction) | **Balanced Gallery** | Retain breathing room for editorial content and efficient commerce surfaces; numeric tokens remain open. Supersedes earlier PROPOSED/SELECTED statuses. |
| WEB-031 | Grid strategy | LOCKED | **Curated Masonry + Functional Grid** | Homepage and collection storytelling use deliberate mixed-size tiles and selective masonry; search, core product listing, checkout and other comparison/transaction surfaces use consistent grids. Supersedes earlier PROPOSED status. |
| WEB-032 | Layout tokens | PROPOSED | Refined spacing scale, 1280px container, responsive gutters, 2/3/4-column listing grid, editorial mosaic rules | See v2 section of `docs/website/design-system-layout-proposal.md`; exact values and breakpoints await explicit approval/testing. |
| WEB-033 | Navigation | OPEN | Responsive header, mobile menu, search, account, cart and sticky behaviour | Next independent design decision; no header pattern yet locked. |

## 2026-10-23 — Adaptive Sticky Header approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-033 | Header behaviour | LOCKED | **Adaptive Sticky Header** | Full header initially; compact sticky state on scroll, maintaining access to core shopping utilities. Transition must avoid jitter/layout shift and respect accessibility/reduced motion. Supersedes earlier OPEN navigation entry only as to sticky behaviour; precise dimensions and navigation architecture remain open. |
| WEB-034 | Navigation detail | PROPOSED | Desktop Shop/Collections/Story navigation, mobile drawer, persistent search/cart access and accessible interactions | See `docs/website/design-system-navigation-proposal.md`. Menu type, search interaction, cart interaction, responsive thresholds and exact visual states await separate approval. |

## 2026-10-23 — Desktop Shop mega-menu approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-035 | Desktop Shop navigation | LOCKED | **Curated Mega-Menu**: six approved catalogue categories plus one featured editorial visual/link | Clear category discovery while maintaining Tavistra's gallery identity; supersedes WEB-034's open Shop menu type only. Exact trigger/dismissal mechanics and styling still subject to accessibility testing. |
| WEB-036 | Mobile navigation hierarchy | OPEN | Drill-down drawer vs inline accordion vs category-first drawer | Next one-at-a-time choice. Search and cart behaviour remain deferred under WEB-034. |

## 2026-10-23 — Mobile drill-down approved; search next

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-036 | Mobile navigation hierarchy | LOCKED | **Progressive Drill-Down** with two levels: main menu → Shop All and six categories; Back returns to main menu | Clear, shallow hierarchy. Category subcategories live on their pages, not in further menu levels. Supersedes earlier WEB-036 OPEN entry. Accessibility/focus/reflow tests required. |
| WEB-037 | Search experience | OPEN | Compact search overlay vs expandable inline desktop search + mobile full-screen vs dedicated search page | Next decision. Autocomplete/suggestions and result behaviour require separate review. |
| WEB-038 | Cart interaction | DEFERRED | Cart page vs mini-cart drawer | Do not decide as part of mobile menu or search design. |

## 2026-10-23 — Compact Search Overlay approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-037 | Search interaction | LOCKED | **Compact Search Overlay**, responsive desktop dialog/mobile sheet, with submission to a dedicated results page | Preserve gallery-style header and offer fast search entry on all devices. Supersedes earlier WEB-037 OPEN status; exact overlay dimensions remain proposed. |
| WEB-039 | Search suggestions and results | PROPOSED | Restrained live suggestions vs curated empty-state links only vs rich preview; results states, ranking and accessibility baseline | Review `docs/website/design-system-search-proposal.md` and approve one option at a time. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Remains separate; search approval does not decide cart UX. |

## 2026-10-24 — Search suggestions approved; results refinement proposed

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-039 | Search suggestions | LOCKED | **Restrained Live Suggestions** grouped into relevant category/product-type and published-product shortcuts; Enter always opens full results | Avoid a heavy visual preview, maintain fast discovery and accessible keyboard support. Supersedes prior WEB-039 PROPOSED status; precise limits and timing are test-gated. |
| WEB-040 | Search results experience | PROPOSED | Functional Grid, filter controls, relevance-first sorting, deep-linkable URL, truthful commerce mode and distinct zero/error states | Refined in `docs/website/design-system-search-proposal.md`. No exact filters or ranking algorithm locked yet. |
| WEB-040A | Launch filter scope | OPEN | Essential vs Minimal vs Expanded filters | Next one-at-a-time choice before locking filter taxonomy and rules. |
| WEB-038 | Cart interaction | DEFERRED | Cart page vs mini-cart | Explicitly remains separate from search. |

## 2026-10-24 — Minimal launch filters approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040A | Search launch filter scope | LOCKED | **Minimal Filters: Category + Purchase Mode** only | Keep launch search clear and manageable for a small, mixed-commerce catalogue. Supersedes prior WEB-040A OPEN; product type remains searchable but is not a filter. |
| WEB-040B | Search sorting policy | OPEN | Relevance only vs Relevance + Newest vs Relevance + Newest + Price | Next decision; avoid price sorting before quote-only/variable-price handling is settled. |
| WEB-040 | Search results detail | PROPOSED | Relevance-first ranking, Functional Grid, distinct no-match/filtered-empty/loading/error states and deep links | Refined in `docs/website/design-system-search-proposal.md`. Filter scope is locked separately; detailed ranking and result states still proposed. |
| WEB-038 | Cart interaction | DEFERRED | Cart page vs mini-cart | No change. |

## 2026-10-24 — Sorting policy approved; mixed-price handling open

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040B | Search sorting policy | LOCKED | **Relevance (default) + Newest First + Price Low-to-High + Price High-to-Low** | Supersedes earlier OPEN sorting decision; does not add a Price filter. Newest requires trustworthy publication timestamps and price sorting requires comparable customer-facing amounts. |
| WEB-040C | Unpriced product treatment in price sorts | OPEN | Priced-first/unpriced-later vs priced-only with disclosure vs disable mixed price sorts | Next independent approval; no invented zero-price ranking or silent disappearance of quote-only items. |
| WEB-040 | Search results detail | PROPOSED | Relevance match precedence, deterministic tie-breaks, deduplication, and distinct blank/loading/no-match/filtered-empty/error states | Refined in `docs/website/design-system-search-proposal.md`; detailed scoring, variable-price policy and final copy not locked. |
| WEB-038 | Cart interaction | DEFERRED | Cart page vs mini-cart | Unchanged. |

## 2026-10-24 — Priced-first sorting approved; variable-price policy next

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040C | Price sorting with unpriced products | LOCKED | **Priced First, Unpriced Afterward** for both ascending and descending price sorts | Keep quote-only/unpriced products discoverable without assigning fictional prices; sort globally before pagination. Supersedes earlier WEB-040C OPEN state. |
| WEB-040D | Variable-price sorting basis | OPEN | Starting-at lowest purchasable variant vs default-variant price vs separate unpriced grouping | Next one-at-a-time decision; price/tax basis and range display still require validation. |
| WEB-040 | Search relevance and result states | PROPOSED | Title/type-first relevance, deduplication, accurate counts and distinct mixed-price, zero, filtered-zero and failure states | Updated in `docs/website/design-system-search-proposal.md`; precise scoring and final copy remain open. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | No decision implied. |

## 2026-10-24 — Starting-at variable-price rule approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040D | Variable-price sorting basis | LOCKED | **Starting-at Price**: lowest currently purchasable published variant, shown as **From ₹X** and used as the price-sort key | Avoid fictional teaser prices, align card display and sort order; supersedes prior WEB-040D OPEN. Exclude ineligible/quote-only variants. |
| WEB-040E | Customer-facing tax/price basis | OPEN | Tax-inclusive vs explicitly tax-exclusive vs market/product-specific price display | Next decision; must reconcile card/PDP/checkout and applicable Indian GST/compliance. |
| WEB-040 | Search results behaviour | PROPOSED | Price changes, no eligible variants, mixed/unpriced groups, empty/filter-empty, failures and loading states | Refined in `docs/website/design-system-search-proposal.md`; exact copy and pagination still open. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-24 — Tax-inclusive pricing approved; shipping disclosure next

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040E | Customer-facing price and tax basis | LOCKED | **Tax-Inclusive Prices** on India-facing product/search/PDP surfaces, including Starting-at prices, with the same comparable tax-inclusive sort basis | Supersedes earlier WEB-040E OPEN. Applicable GST rates, classification and invoice calculations require validation; shipping remains separate unless explicitly included in an offer. |
| WEB-040F | Delivery-charge disclosure timing | OPEN | Early estimate + checkout finalization vs checkout-only disclosure vs required PDP delivery estimator | Next one-at-a-time decision; do not implicitly select cart UX. |
| WEB-040 | Search results and price states | PROPOSED | Recompute eligible tax-inclusive prices, distinguish unavailable pricing from zero, preserve filters/sort across errors and truthful zero-result states | Detailed in `docs/website/design-system-search-proposal.md`; final copy, ranking weights and pagination still open. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-24 — Early delivery estimate approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040F | Delivery-charge disclosure | LOCKED | **Early Estimate + Final Checkout Calculation**: separate delivery disclosure without destination; supported early estimate where destination/rates known; verified final delivery charge before order confirmation | Supersedes earlier WEB-040F OPEN. Never invent a rate or claim free shipping without verified eligibility; keep shipping distinct from tax-inclusive product prices. |
| WEB-040G | Destination collection for estimate | OPEN | Optional PDP pincode vs previously known destination only vs sitewide selector | Next one-at-a-time decision; no specific UI, provider, precise geolocation or persistence approved. |
| WEB-040 | Search and delivery states | PROPOSED | Delivery estimate unavailable, unsupported destination, stale estimate, revised charge, and search no-results/error states | Refined in `docs/website/design-system-search-proposal.md`; exact microcopy and result pagination remain open. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | No change. |

## 2026-10-28 — Product-page pincode approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040G | Early estimate destination entry | LOCKED | **Optional Pincode Entry on Product Pages** | Customer voluntarily enters pincode to request estimate, without blocking browsing or preselecting a sitewide destination. Final checkout delivery remains authoritative. Supersedes prior WEB-040G OPEN. |
| WEB-040H | Pincode estimate trigger | OPEN | Explicit Check button vs automatic after six digits vs hybrid | Next independent choice; no API call pattern or interaction locked yet. |
| WEB-040 | Serviceability and search states | PROPOSED | Distinguish invalid pincode, serviceable-with-rate, no-rate, unsupported, timeout, stale estimate and genuine search failures | Refined in `docs/website/design-system-search-proposal.md`; final messages, ranking and pagination remain open. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Explicit pincode Check trigger approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040H | Product-page estimate request trigger | LOCKED | **Explicit Check Button**, with equivalent Enter/form submission; no automatic lookup during typing | Deliberate user action, predictable API usage and accessible keyboard interaction. Supersedes prior WEB-040H OPEN. |
| WEB-040I | Serviceability and rate lookup sequence | OPEN | Single backend estimate request vs frontend two-stage vs manual-review-first | Next independent choice; distinguish confirmed unsupported from serviceable-but-rate-unavailable. |
| WEB-040 | Input validation and feedback states | PROPOSED | Six-digit string validation, loading, unsupported, rate missing, API failure, stale response and final recalculation | Refined in `docs/website/design-system-search-proposal.md`; exact messages and lookup implementation still open. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Single backend delivery estimate request approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040I | Serviceability and rate lookup architecture | LOCKED | **Single Backend Estimate Request** from product-page Check; backend coordinates serviceability and shipping rates, returns structured outcome | Supersedes prior WEB-040I OPEN. Avoid frontend courier chaining and preserve distinct unsupported, no-rate and temporary-failure states. |
| WEB-040J | Shipping provider fallback policy | OPEN | Automatic eligible-provider fallback vs primary-only vs manual fallback | Next independent decision; no courier choice or cheapest-rate algorithm implied. |
| WEB-040 | Estimate contract and reliability | PROPOSED | Typed outcome statuses, no invented ₹0, safe provider errors, quote timestamps, retries and checkout revalidation | Refined in `docs/website/design-system-search-proposal.md`; exact API fields and final UI messages unapproved. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Correction: application-managed delivery rates, independent couriers

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040J | Courier provider fallback | WITHDRAWN / NOT APPLICABLE | **No courier API integrations** in Tavistra's delivery-estimate architecture | Supersedes prior WEB-040J OPEN and courier-provider fallback proposals. Owner maintains rate rules in Tavistra; courier chosen independently during fulfilment. |
| WEB-040I | Delivery estimate request architecture | LOCKED, CLARIFIED | **Single Tavistra backend request using internal shipping rate tables/rules**, not a courier lookup | Preserve approved pincode Check interaction and structured response, while removing invented external provider dependency. |
| WEB-040K | Destination/distance rate basis | OPEN | Pincode-to-zone matrix vs maintained distance bands vs hybrid | Next independent decision; size, weight, fragility are inputs, but exact rate formula not approved. |
| WEB-040 | Internal rate feedback | PROPOSED | Rate found, destination uncovered, missing rule, special manual review, calculation failure, stale estimate | See `docs/website/design-system-search-proposal.md`. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Presumptive kilometres by pincode/range approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040K | Internal destination/distance mapping | LOCKED | **Admin-maintained presumptive kilometres assigned to individual pincodes or pincode ranges** | Supersedes prior WEB-040K OPEN zone-vs-distance options. Values are pricing references, not verified route distance; no external APIs. |
| WEB-040L | Distance-based delivery charge formula | OPEN | Distance bands vs base + per-km vs hybrid | Next one-at-a-time decision; exact prices, weight, size and fragility modifiers unapproved. |
| WEB-040 | Mapping and feedback details | PROPOSED | Exact-match precedence, overlap validation, dispatch-origin context, missing mapping vs unsupported destination | See `docs/website/design-system-search-proposal.md`. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Distance bands approved for delivery charges

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040L | Internal distance pricing | LOCKED | **Distance Bands**: presumptive kilometres select an admin-defined base delivery charge by distance bracket | Supersedes prior WEB-040L OPEN. No per-km or hybrid surcharge model; numeric thresholds and prices unapproved. |
| WEB-040M | Chargeable weight calculation | OPEN | Greater of actual/volumetric packed weight vs actual only vs class-specific | Next single decision; avoid undercharging bulky lightweight items. |
| WEB-040 | Shipping rate factors | PROPOSED | Packed weight/dimensions, volumetric divisor, fragile/oversize handling, minimum charge floor and missing-data states | Detailed in `docs/website/design-system-search-proposal.md`; actual formulas, amounts and tax order unapproved. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — All-inclusive product price plus delivery charge

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040N | Customer-facing price components | LOCKED | **Only product price (including packaging/handling and applicable product tax) + delivery charge if applicable** | No separate packing, weight, dimensions, fragility, handling or minimum-charge line items; prevent double charging. |
| WEB-040M | Chargeable-weight formula | OPEN, REFRAMED | Internal delivery calculation only, if shipment adjustments are chosen | Prior proposal must not imply a customer-facing weight/packaging charge. |
| WEB-040O | Internal delivery rate factors | OPEN | Distance bands only vs distance plus internal shipment adjustments vs manual exceptions | Next independent choice; no new customer-facing fee components. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Distance bands with shipment adjustments approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040O | Internal delivery pricing factors | LOCKED | **Distance Bands with Internal Shipment Adjustments**: distance base plus applicable weight, packed-size and fragility transport adjustments | Supersedes WEB-040O OPEN. One combined customer-facing delivery charge, with all-inclusive product price; avoid double recovery of packaging/ordinary handling. |
| WEB-040P | Internal adjustment structure | OPEN | Fixed/bracketed surcharges vs percentage multipliers vs distance-band × shipment-class matrix | Next independent decision; thresholds and actual rates not yet approved. |
| WEB-040M | Chargeable-weight basis | OPEN, INTERNAL ONLY | Actual vs volumetric vs class-specific if used by weight adjustment | No customer-facing chargeable-weight fee. |
| WEB-040 | Minimum charge and exceptional states | PROPOSED | Minimum delivery floor, explicit free-shipping exceptions, missing mapping/rule, manual review and tax reconciliation | See `docs/website/design-system-search-proposal.md`. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Fixed / bracketed internal shipment adjustments approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040P | Internal shipment adjustment structure | LOCKED | **Fixed / Bracketed Shipment Adjustments** on top of distance-band base; applicable weight, packed-size and fragile transport factors use configured fixed amounts/brackets | Supersedes prior WEB-040P OPEN. Not percentage multipliers or full band × class rate matrix; exact thresholds/amounts and stacking not locked. |
| WEB-040M | Internal chargeable-weight basis | OPEN | Max(actual, volumetric) vs actual packed weight vs class-specific | Next independent decision; not a separate customer-facing fee. |
| WEB-040 | Shipping threshold and exception refinements | PROPOSED | Non-overlapping weight brackets, distinct oversize adjustments, transport-only fragility classes, minimum floor/waivers, missing-data/manual-review states | See `docs/website/design-system-search-proposal.md`; no numeric rates, GST method or aggregation policy approved. |
| WEB-040N | Customer-facing price composition | LOCKED, REAFFIRMED | All-inclusive product price plus **one** delivery charge if applicable | Packaging/ordinary handling in product price; no internal surcharge itemization or duplicate recovery. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Chargeable-weight policy approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040M | Internal chargeable-weight basis | LOCKED | **Greater of Actual and Volumetric Packed Weight**, using an admin-configurable divisor | Supersedes earlier WEB-040M OPEN. Used internally for fixed/bracketed transport adjustment; no separately displayed fee. |
| WEB-040Q | Weight bracket application | OPEN | One matching fixed bracket vs cumulative thresholds vs shipment-class-specific brackets | Next independent choice; exact weight limits and charges not approved. |
| WEB-040 | Dimension, fragility, minimum and exception rules | PROPOSED | Distinct oversize handling without duplicate volumetric charge, transport-only fragility, minimum floor/waivers, missing-data/manual-review | Details in `docs/website/design-system-search-proposal.md`; no thresholds, rates or tax treatment approved. |
| WEB-040N | Customer-facing price presentation | LOCKED, REAFFIRMED | All-inclusive product price plus one combined delivery charge if applicable | Packaging and ordinary handling included in product; never itemize internal shipment adjustments. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — One matching fixed weight bracket approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040Q | Weight bracket application | LOCKED | **One Matching Fixed Weight Bracket** selected from greater of actual and volumetric packed weight | Supersedes prior OPEN. Exactly one fixed internal weight adjustment, no cumulative threshold stacking; missing bracket is not zero. |
| WEB-040R | Weight bracket configuration | OPEN | Admin-configurable ranges vs predefined ranges vs configurable ranges with manual-review ceiling | Next independent choice; no numeric thresholds or rates approved. |
| WEB-040 | Dimensions, fragility, minimum and exceptions | PROPOSED | Separate oversized transport only for distinct costs, fixed fragility class adjustment, configurable floor/waiver, missing-data/manual-review | See `docs/website/design-system-search-proposal.md`; actual thresholds, charges and tax treatment remain open. |
| WEB-040N | Customer-facing price presentation | LOCKED, REAFFIRMED | All-inclusive product price plus one combined delivery charge if applicable | Never itemize internal shipping adjustments or duplicate packaging/ordinary handling costs. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Predefined weight ranges approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040R | Weight bracket configuration | LOCKED | **Predefined Weight Ranges** in application, with admin-editable **fixed ₹ adjustment per bracket** | Supersedes WEB-040R OPEN. Admin cannot edit kg boundaries through normal UI; number of brackets, limits and amounts not yet approved. |
| WEB-040S | Dimensional transport adjustment policy | OPEN | Longest packed side threshold vs longest side plus girth vs exceptional-size manual review | Next independent decision; avoid duplicate charge for volumetric weight. |
| WEB-040 | Fragility, minimum charge and exceptions | PROPOSED | Fixed transport-only fragility class adjustments, minimum floor/explicit waivers, missing-rate/manual-review and unsupported-destination distinctions | Exact values, rule precedence, parcel aggregation and tax treatment remain OPEN. |
| WEB-040N | Customer-facing price components | LOCKED, REAFFIRMED | All-inclusive product price plus **one** delivery charge if applicable | Packaging and ordinary handling included in product; no extra visible weight/dimensional/fragility line items. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Longest packed side threshold approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040S | Dimensional transport adjustment | LOCKED | **Longest Packed Side Threshold**: fixed transport adjustment when longest packed side exceeds configured cm threshold | Supersedes prior WEB-040S OPEN. Must address distinct long-parcel transport restriction, not duplicate volumetric weight. Exact threshold/₹ amount OPEN. |
| WEB-040T | Fragility adjustment policy | OPEN | Three handling classes vs binary fragile flag vs manual review only | Next independent decision; charges and class details not yet approved. |
| WEB-040 | Minimum delivery and exception refinements | PROPOSED | Configurable minimum/waivers, missing measurements, unsupported oversized goods, missing rates, manual review and versioning | Numeric settings, precedence and delivery tax remain OPEN. |
| WEB-040N | Customer-facing price components | LOCKED, REAFFIRMED | All-inclusive product price plus **one** combined delivery charge if applicable | No separate weight/dimension/fragility/packing fees or double recovery. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Universal fragile handling included; no fragility surcharge

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040T | Fragility adjustment policy | LOCKED | **All products fragile; standard protective packing/fragile handling included in product price. No internal automatic fragility surcharge or routine handling classes.** | Supersedes WEB-040T OPEN alternatives; prevents double recovery. Exceptional distinct freight restrictions handled only by separately approved dimension/exception policy. |
| WEB-040U | Minimum delivery charge approach | OPEN | Global minimum floor vs band-specific minimums vs no minimum | Next independent choice; no ₹ amount, tax sequencing or waiver rules approved. |
| WEB-040 | Exceptions and numeric thresholds | PROPOSED | Explicit waiver/free delivery, missing mapping/rate/measurements, manual review, oversize constraints, rate versioning | Exact rules, rates, tax and parcel aggregation remain OPEN. |
| WEB-040N | Customer-facing price components | LOCKED, REAFFIRMED | All-inclusive product price plus **one** delivery charge if applicable | Standard fragile handling/packaging in product price; never itemize internal shipping adjustments. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Distance-band-specific minimum delivery charges approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040U | Minimum delivery charge policy | LOCKED | **Distance-Band-Specific Minimum Delivery Charges**, admin-configurable per band | Supersedes prior WEB-040U OPEN. For ordinary eligible orders apply max(calculated base+fixed adjustments, matching band's minimum); actual amounts and waiver/tax precedence OPEN. |
| WEB-040V | Free-delivery waiver precedence | OPEN | Explicit waiver overrides band floor vs floor always applies vs waiver permission per band | Next independent decision; do not infer missing rates mean free delivery. |
| WEB-040 | Missing-rate/manual-review exceptions | PROPOSED | Distinguish unmapped pincode, missing band/floor/bracket/dimensions, deliberate destination exclusion, exceptional manual review and calculation error | Exact handling, approval workflow, numeric thresholds and delivery-tax rules remain OPEN. |
| WEB-040N | Customer-facing pricing | LOCKED, REAFFIRMED | All-inclusive product price plus **one** combined delivery charge if applicable | Minimum/weight/size adjustments never separate line items; standard fragile handling already in product price. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Explicit delivery waivers and two coupon targets approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040V | Free-delivery waiver precedence | LOCKED | **Explicit valid free-delivery waiver overrides the distance-band minimum** | Supersedes prior OPEN. Eligible free delivery coupon may set delivery to ₹0; missing rate/coverage is never free shipping. |
| WEB-040W | Coupon capabilities | LOCKED | **Free-delivery coupons and product-price discount coupons** both supported | Distinct discount targets; exact types, caps, stacking, eligibility, expiry and tax handling OPEN. |
| WEB-040X | Missing-rate response | OPEN | Estimate unavailable with manual review possible vs block until configured vs automatic manual quote | Next independent decision; missing rate is not unsupported destination. |
| WEB-040N | Customer-facing price components | LOCKED, REAFFIRMED | Discounted all-inclusive product amount plus **one** delivery charge if applicable | Coupon savings may be explained but are not an extra cost line; no packing/weight/fragility fee lines. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Missing-rate response approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040X | Missing-rate response | LOCKED | **Estimate Unavailable, Manual Review Possible** | Supersedes prior OPEN. Missing rate/config/packed data gives nonnumeric unavailable estimate; not free, not automatically unsupported, and not mandatory auto-created manual quote. |
| WEB-040Y | Unsupported destination configuration | OPEN | Explicit exact-pincode and range exclusions vs exact-only exclusions vs no exclusions initially | Next independent choice; missing mapping alone is never a deliberate exclusion. |
| WEB-040 | Exceptional shipment manual review | PROPOSED | Distinct exceptional shipment status and human-approved final delivery amount | Triggers, authority, checkout hold/resume, tax and audit rules OPEN. |
| WEB-040W | Coupon details | OPEN (capability LOCKED) | Formats, limits, stacking, eligibility, tax and redemption | Free-delivery and product-discount coupon types remain approved; specifics deferred. |
| WEB-040N | Customer-facing price components | LOCKED, REAFFIRMED | Discounted all-inclusive product amount plus **one** delivery charge if applicable | No extra packaging/weight/dimensional/fragility fee lines. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Registered-pincode coverage allowlist approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040Y | Delivery coverage policy | LOCKED | **Registered-pincode allowlist**: registered = delivery offered, even if pricing incomplete; unregistered = delivery not offered | Supersedes WEB-040Y OPEN exclusion-list alternatives. Registration separate from rate availability; missing rate yields WEB-040X estimate unavailable. |
| WEB-040Z | Exceptional shipment manual review trigger | OPEN | Automatic hold for configured exceptions vs admin product/variant flag only vs no exceptional hold initially | Next independent choice; triggers/limits and approval workflow unapproved. |
| WEB-040W | Coupon details | OPEN (capability LOCKED) | Discount format, stacking, eligibility, limits, tax and redemption | Free-delivery coupons do not extend coverage to unregistered pincodes. |
| WEB-040N | Customer-facing price components | LOCKED, REAFFIRMED | Discounted all-inclusive product amount plus **one** delivery charge if applicable | No separate packaging, weight, size, fragile handling or minimum-fee charge lines. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Exceptional shipment review removed

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040Z | Exceptional shipment manual-review trigger | LOCKED | **No Separate Exceptional-Shipment Review** | Supersedes prior OPEN options. Complete valid internal pricing uses normal distance, weight and longest-side rules; size/weight alone do not force review or require a special product flag. |
| WEB-040AA | Missing-rate manual-review initiation | OPEN | Customer-initiated request vs admin-initiated only vs automatic case at checkout attempt | Next independent decision. WEB-040X allows manual review for registered but unpriced destinations; no final order until total confirmed. |
| WEB-040W | Coupon details | OPEN (capabilities LOCKED) | Formats, limits, eligibility, stacking, tax | Free delivery/product discount coupons supported; no invented details. |
| WEB-040N | Customer-facing pricing | LOCKED, REAFFIRMED | Discounted all-inclusive product amount plus **one** delivery charge if applicable | No new exceptional handling or separate packing/fragility/weight/dimension fees. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Customer-initiated manual delivery request approved

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040AA | Manual delivery review initiation | LOCKED | **Customer-Initiated Manual Delivery Review Request** for registered pincodes with unavailable pricing | Supersedes prior OPEN. Explicit request submission only; no automatic case from lookup/checkout. Not an order or price confirmation. |
| WEB-040AB | Manual delivery quote approval authority | OPEN | Restricted authorised admin vs any admin vs owner-only | Next independent decision; approval workflow and checkout resumption not yet locked. |
| WEB-040W | Coupon details | OPEN (capabilities LOCKED) | Formats, eligibility, limits, stacking and tax | Free delivery/product coupons remain supported; specifics unapproved. |
| WEB-040N | Customer-facing pricing | LOCKED, REAFFIRMED | Discounted all-inclusive product amount plus **one** delivery charge if applicable | Manual quote resolves one delivery amount; no additional fee lines. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Authorised admin delivery quote approval

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040AB | Manual delivery quote approval authority | LOCKED | **Authorised Admin Approval**: staff can prepare; only admin with explicit delivery-quote approval permission may approve/release | Supersedes prior OPEN. Ordinary admin access alone is not approval authority; owner-only approval not required. |
| WEB-040AC | Checkout resumption and customer acceptance | OPEN | Customer resumes checkout and explicitly accepts total vs auto-create unpaid order vs staff-created order | Next independent decision. No order/payment created merely from customer request. |
| WEB-040W | Coupon details | OPEN (capabilities LOCKED) | Formats, limits, eligibility, stacking and tax | Both delivery-waiver and product-discount coupon capabilities retained. |
| WEB-040N | Customer-facing price components | LOCKED, REAFFIRMED | Discounted all-inclusive product amount plus **one** delivery charge if applicable | Approved manual delivery amount remains a single charge. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Manual quote approval creates unpaid order

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040AC | Post-approval order creation | LOCKED | **Automatically Create an Unpaid Order After Quote Approval** | Supersedes prior OPEN. Authorised approval creates unpaid order; no automatic payment, paid status or fulfilment; customer pays later. |
| WEB-040AD | Approved manual quote validity | OPEN | Configurable fixed validity window vs valid until paid/cancelled vs per-quote manual expiry | Next independent choice. Exact expiry and order cancellation/revalidation rules OPEN. |
| WEB-040W | Coupon details | OPEN (capabilities LOCKED) | Formats, limits, stacking, tax, and interaction with approved quotes | Free-delivery and product discount coupons supported; no invented discount precedence. |
| WEB-040N | Customer-facing price components | LOCKED, REAFFIRMED | Discounted all-inclusive product amount plus **one** approved delivery charge if applicable | No new fees or internal breakdown lines. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Centrally configured manual quote validity

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040AD | Approved manual quote validity | LOCKED | **Admin-Configurable Validity Period** applied to approved quotes | Supersedes prior OPEN. After validity deadline, delivery amount must be revalidated before payment; exact duration and expiry/order lifecycle remain OPEN. |
| WEB-040AE | Customer notification after approval | OPEN | Transactional SMTP email vs email with future optional channels vs order-page-only status | Next independent decision. No SMS/WhatsApp connection assumed. |
| WEB-040W | Coupon details | OPEN (capabilities LOCKED) | Formats, limits, stacking, tax, applicability to manual quotes | Both coupon targets remain supported; details unapproved. |
| WEB-040N | Customer-facing pricing | LOCKED, REAFFIRMED | Discounted all-inclusive product amount plus **one** approved delivery charge if applicable | No new fee components. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Approved manual quote email notification

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040AE | Customer notification after approved quote | LOCKED | **Transactional SMTP Email with Secure Order/Payment Link**, order reference, approved total and validity deadline | Supersedes prior OPEN. No SMS/WhatsApp required. Email is not payment confirmation; access must be secure. |
| WEB-040AF | Expired quote/unpaid-order lifecycle | OPEN | Retain unpaid order and reapprove vs auto-cancel/re-request vs staff choice | Next independent decision. Expired quote cannot be paid without revalidation. |
| WEB-040W | Coupon details | OPEN (capabilities LOCKED) | Formats, eligibility, stacking, tax and manual-order applicability | Both coupon targets remain supported; specifics unapproved. |
| WEB-040N | Customer-facing price components | LOCKED, REAFFIRMED | Discounted all-inclusive product amount plus **one** delivery charge if applicable | No extra fees. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Automatic unpaid order cancellation on manual quote expiry

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040AF | Expired manual quote/unpaid-order lifecycle | LOCKED | **Automatically Cancel Unpaid Order on Quote Expiry** | Supersedes prior OPEN. Expired unpaid order cannot be paid or renewed; new customer request, approval and unpaid order required. Already paid orders are not cancelled; payment races OPEN. |
| WEB-040AG | Inventory reservation for unpaid manual-quote orders | OPEN | Reserve eligible ready-stock until expiry vs reserve after payment vs staff discretion | Next independent decision; stock and payment concurrency details unapproved. |
| WEB-040W | Coupon details | OPEN (capabilities LOCKED) | Formats, eligibility, limits, stacking, tax | Free-delivery and product-discount coupons supported; specifics unapproved. |
| WEB-040N | Customer-facing price components | LOCKED, REAFFIRMED | Discounted all-inclusive product amount plus **one** delivery charge if applicable | No additional fees. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Ready-stock reservation and expiry release

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040AG | Inventory reservation for unpaid manual-quote orders | LOCKED | **Reserve Ready Stock Until Quote Expiry** | On approved quote/unpaid-order creation, reserve eligible available ready stock; release on expiry cancellation if unpaid, retain allocation after successful payment. Made-to-order and insufficient-stock handling OPEN. |
| WEB-040AH | Expiry cancellation customer notice | OPEN | Automatic transactional cancellation email vs order-status-only vs staff-triggered email | Next independent decision; no cancellation notification policy yet locked. |
| WEB-040W | Coupon details | OPEN (capabilities LOCKED) | Formats, eligibility, limits, stacking and tax | Free-delivery and product-discount coupons supported; specifics unapproved. |
| WEB-040N | Customer-facing price components | LOCKED, REAFFIRMED | Discounted all-inclusive product amount plus **one** delivery charge if applicable | No additional fees. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Automatic email on expired unpaid manual order

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040AH | Expiry cancellation customer notice | LOCKED | **Automatic Transactional Cancellation Email on Quote Expiry** via Tavistra SMTP | Supersedes OPEN. Order reference, expiry reason, stock release and new-request instruction; no active payment link. Email failure does not reverse cancellation. |
| WEB-040AI | Insufficient ready stock at manual quote approval | OPEN | Block approval until fully available vs partial reserve/backorder vs staff exception | Next independent decision. No overselling or backorder policy approved. |
| WEB-040W | Coupon details | OPEN (capabilities LOCKED) | Formats, eligibility, limits, stacking and tax | Both product-discount and delivery-waiver coupon capabilities remain. |
| WEB-040N | Customer-facing pricing | LOCKED, REAFFIRMED | Discounted all-inclusive product amount plus **one** delivery charge if applicable | No extra fee lines. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Ready-stock shortfall blocks manual quote approval

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040AI | Insufficient ready stock at manual quote approval | LOCKED | **Block Approval Until Full Ready Stock Is Available** | No unpaid order, partial reservation, automatic backorder or staff override if any required ready-stock quantity is missing. Request remains pending. |
| WEB-040AJ | Made-to-order items in manual delivery unpaid orders | OPEN | Include without finished-stock reservation vs production feasibility confirmation vs separate workflow | Next independent decision. Quote-only eligibility remains separate OPEN. |
| WEB-040W | Coupon details | OPEN (capabilities LOCKED) | Formats, eligibility, limits, stacking and tax | Both product-discount and free-delivery coupon capabilities remain. |
| WEB-040N | Customer-facing price components | LOCKED, REAFFIRMED | Discounted all-inclusive product amount plus **one** delivery charge if applicable | No extra fee lines. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Made-to-order lines without finished-stock reservation

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040AJ | Made to Order in manual-delivery unpaid orders | LOCKED | **Include Made-to-Order Items Without Finished-Stock Reservation** | Mixed orders reserve only fully available Ready Stock quantities; Made to Order lines need no finished inventory. Production start and lead time not implied. |
| WEB-040AK | Made-to-order production-start trigger | OPEN | Verified full payment vs authorised prepayment staff approval vs verified deposit | Next independent decision. No production commencement rule yet locked. |
| Quote Only | Participation in manual-delivery unpaid orders | OPEN | Separate decision required | WEB-040AJ does not authorise Quote Only products. |
| WEB-040W | Coupon details | OPEN (capabilities LOCKED) | Formats, eligibility, limits, stacking and tax | Product-discount and delivery-waiver coupons supported; specifics unapproved. |
| WEB-040N | Customer-facing price components | LOCKED, REAFFIRMED | Discounted all-inclusive product amount plus **one** delivery charge if applicable | No additional fee lines. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Full-payment prerequisite for Made to Order production

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040AK | Made to Order production eligibility | LOCKED | **Only After Verified Successful Full Payment** | Server-verified full order payment required; quote approval, unpaid order, pending payment, deposit or staff prepayment approval insufficient. Eligibility does not start production automatically. |
| WEB-040AL | Production release after verified payment | OPEN | Authorised staff manual release vs automatic production queue vs owner-only manual release | Next independent decision. Exact scheduling and capacity rules not approved. |
| Quote Only | Participation in manual-delivery unpaid orders | OPEN | Separate decision required | No implied Quote Only approval. |
| WEB-040W | Coupon details | OPEN (capabilities LOCKED) | Formats, eligibility, limits, stacking and tax | Product and free-delivery coupons supported; specifics unapproved. |
| WEB-040N | Customer-facing pricing | LOCKED, REAFFIRMED | Discounted all-inclusive product amount plus **one** delivery charge if applicable | No extra fee lines. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Manual release of fully paid Made to Order production

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040AL | Production release after verified full payment | LOCKED | **Authorised Staff Manual Production Release** | Verified fully paid Made to Order items await explicit staff release after readiness/capacity review; no automatic release or owner-only bottleneck. |
| WEB-040AM | Authorisation for manual production release | OPEN | Explicit assignable release permission vs any admin vs named production-manager role | Next independent decision; no specific permission model yet locked. |
| Quote Only | Participation in manual-delivery unpaid orders | OPEN | Separate decision required | No implied Quote Only approval. |
| WEB-040W | Coupon details | OPEN (capabilities LOCKED) | Formats, eligibility, limits, stacking and tax | Product and free-delivery coupons supported; specifics unapproved. |
| WEB-040N | Customer-facing price components | LOCKED, REAFFIRMED | Discounted all-inclusive product amount plus **one** delivery charge if applicable | No additional fee lines. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Explicit production-release permission

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040AM | Authorisation for manual Made to Order production release | LOCKED | **Explicit Production-Release Permission for Authorised Staff** | Backend checks authenticated user's explicit release permission and verified full payment; ordinary admin access alone insufficient, not owner-only. |
| WEB-040AN | Production release granularity | OPEN | Per Made to Order line vs all lines together vs both | Next independent decision. Partial shipping not implied. |
| Quote Only | Participation in manual-delivery unpaid orders | OPEN | Separate decision required | No implied Quote Only approval. |
| WEB-040W | Coupon details | OPEN (capabilities LOCKED) | Formats, eligibility, limits, stacking and tax | Product and free-delivery coupons supported; specifics unapproved. |
| WEB-040N | Customer-facing price components | LOCKED, REAFFIRMED | Discounted all-inclusive product amount plus **one** delivery charge if applicable | No additional fee lines. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — Both individual and whole-order Made to Order release

| ID | Domain | State | Decision or alternative | Rationale / consequence |
|---|---|---|---|---|
| WEB-040AN | Made to Order production release granularity | LOCKED | **Both Individual and Whole-Order Production Release** | Permitted staff can release individual eligible lines or invoke a whole-order action after verified full payment. Maintain line-level state; no implied partial shipment. |
| WEB-040AO | Whole-order release with mixed readiness | OPEN | All-or-nothing vs release ready lines vs staff-selected ready lines | Next independent decision; no mixed-readiness bulk semantics yet approved. |
| Quote Only | Manual-delivery unpaid-order participation | OPEN | Separate decision required | No implied Quote Only approval. |
| WEB-040W | Coupon details | OPEN (capabilities LOCKED) | Formats, eligibility, limits, stacking and tax | Product and free-delivery coupons supported; specifics unapproved. |
| WEB-040N | Customer-facing price components | LOCKED, REAFFIRMED | Discounted all-inclusive product amount plus **one** delivery charge if applicable | No extra fee lines. |
| WEB-038 | Cart interaction | DEFERRED | Direct cart vs mini-cart | Unchanged. |

## 2026-10-28 — WEB-040AO production bulk release

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040AO | LOCKED | All-or-nothing whole-order release: all currently unreleased Made to Order lines must be ready, otherwise release none. Previously released lines unchanged. Individual release remains available under WEB-040AN. |
| WEB-040AP | OPEN | Next: readiness confirmation per line versus confirmation at release versus automatic readiness. |

Verified full payment (WEB-040AK) and explicit Production Release permission (WEB-040AM) remain mandatory. Quote Only treatment and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040AP explicit per-line readiness

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040AP | LOCKED | Staff must explicitly confirm Ready for Production separately for each Made to Order order line after reviewing specifications, materials and capacity. This does not itself release or start production. |
| WEB-040AQ | OPEN | Next: readiness authority via separate permission, Production Release permission, or any authenticated admin. |

WEB-040AK/AL/AM/AN/AO payment, manual release, explicit release permission, dual release granularity and all-or-nothing bulk requirements remain LOCKED. Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040AQ readiness authorisation

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040AQ | LOCKED | Reuse explicit Production Release permission for both per-line Ready for Production confirmation and manual release. Ordinary admin role insufficient; readiness and release remain distinct actions. Full verified payment remains required for release. |
| WEB-040AR | OPEN | Next: fixed minimum readiness checklist vs admin-configurable checklist vs single attestation. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040AR single readiness attestation

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040AR | LOCKED | Single explicit Ready for Production attestation per Made to Order line by staff holding Production Release permission. No mandatory readiness checklist or separate required fields; readiness and release remain separate. |
| WEB-040AS | OPEN | Next: withdrawal of readiness before release: allowed, irreversible, or allowed with mandatory reason. |

Existing WEB-040AK/AO/AQ verified full payment, all-or-nothing whole-order release and shared permission remain LOCKED. Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040AS irreversible readiness

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040AS | LOCKED | Irreversible Production Readiness Confirmation: once Ready for Production is attested per Made to Order line, it cannot be withdrawn or reset to Not Ready. Release remains separate and requires full verified payment and explicit permission. |
| WEB-040AT | OPEN | Next: separate per-line operational hold vs no formal hold vs order-wide hold if conditions change after readiness. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040AT no formal pre-release hold

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040AT | LOCKED | No formal pre-release operational hold for Made to Order lines or whole orders. If conditions change after irreversible readiness, authorised staff refrain from manual release until resolved; no readiness reversal or hold/unhold status. |
| WEB-040AU | OPEN | Next: release confirmation dialog vs single-click release vs mandatory typed confirmation. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040AU single-click release

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040AU | LOCKED | Single-click individual and whole-order Production Release without additional confirmation dialog, typed phrase, reason or checklist. Existing verified-payment, explicit-permission, readiness and atomic whole-order gates still apply. |
| WEB-040AV | OPEN | Next: duplicate release attempts: idempotent status, explicit Already Released error, or manual review. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040AV duplicate production release

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040AV | LOCKED | Reject duplicate Made to Order production release with **Already Released** error, never a second release. Whole-order action ignores previously released lines, processes eligible unreleased lines all-or-nothing; if no unreleased lines remain, Already Released. |
| WEB-040AW | OPEN | Next: successful production release audit: minimal actor/time/targets/action record, mandatory note, or status/time only. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040AW automatic minimal production release audit

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040AW | LOCKED | Automatically persist an audit record for each **successful** Made to Order production release: authenticated releasing staff identity, server timestamp, order ID, affected order-line IDs, and action scope (**individual line** or **whole order**). No mandatory staff note or extra confirmation. For whole-order release, record only lines actually released by that successful action. Duplicate/rejected attempts (including **Already Released**) must not create another **successful-release** audit record. |
| WEB-040AX | OPEN | Next: rejected production-release attempt audit scope: log all rejected attempts, log only permission/payment failures, or do not create separate failure audit events. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040AX audit all rejected production release attempts

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040AX | LOCKED | **Option A: audit every rejected Made to Order production-release attempt** separately from successful-release events. Record known actor identity (or unauthenticated/unknown), server timestamp, requested action scope, known order and target line IDs, and a controlled rejection reason, including **Already Released**, missing Production Release permission, unverified full payment and failed readiness. Rejected attempts never trigger production, mutate release state or create a successful-release audit record. No extra staff confirmation or note is required. |
| WEB-040AY | OPEN | Next: production-release audit integrity model: append-only protected audit events, editable audit records with revision history, or ordinary application logs without a dedicated durable audit record. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040AY protected append-only release audit

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040AY | LOCKED | **Option A:** persist successful Made to Order production-release audit events (WEB-040AW) and rejected-attempt audit events (WEB-040AX) as distinct, durable, **protected append-only** records. Ordinary staff and administrators cannot edit or delete an existing audit event. If a factual correction is required, append a **new linked correction event** that references the original without altering it. This does not itself set a retention duration, audit-view permission, cryptographic tamper-evidence scheme or audit-write failure policy. |
| WEB-040AZ | OPEN | Next: audit persistence failure policy for production release: fail closed on success-audit write failure, transactional outbox, or best-effort audit. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040AZ atomic production release and audit

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040AZ | LOCKED | **Option A:** a successful Made to Order production-release state transition and its **durable, append-only successful-release audit record** must commit **atomically**. If the audit record cannot be persisted, the release does not commit, production does not start, and no successful-release response is returned. Whole-order all-or-nothing release remains intact. Rejected attempts remain rejected; if a rejected-attempt audit write fails, surface an operational error/alert without treating the attempt as successful. Exact alert routing, retry/recovery and failure response details remain OPEN. |
| WEB-040BA | OPEN | Next: who may read production-release audit records: a separately assigned Audit Viewer permission, anyone holding Production Release permission, or all administrative users. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BA all administrators can view release audits

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BA | LOCKED | **Option C:** all **authenticated Tavistra administrative users** may **read** successful Made to Order production-release audit records, rejected-attempt audit records and linked correction events **without a dedicated Production Audit View permission** and without needing Production Release permission. Enforce administrative authentication/authorisation server-side. Read access does **not** confer permission to release production, edit/delete protected append-only events or append correction events. Exact audit UI/API, visibility scope and correction authority remain OPEN. |
| WEB-040BB | OPEN | Next: who may append linked factual-correction events to the production-release audit: dedicated Audit Correction permission, all administrators, or designated system owner only. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BB dedicated audit correction permission

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BB | LOCKED | **Option A:** only authenticated staff explicitly granted **Production Audit Correct** permission may append linked factual-correction events to the Made to Order production-release audit. General administrative access, WEB-040BA audit viewing and **Production Release** permission alone do not confer correction authority. Check permission server-side. Original successful-release, rejected-attempt and correction events remain protected, append-only and immutable (WEB-040AY); correction does not modify release state or re-release production. Exact correction payload, reason requirement and review workflow remain OPEN. |
| WEB-040BC | OPEN | Next: audit correction event content: structured field-level correction with mandatory reason, mandatory free-text explanation only, or minimal linked correction with optional reason. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BC structured correction with mandatory reason

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BC | LOCKED | **Option A:** each Made to Order production-release audit correction must be a **new linked append-only event** with (1) the original audit event identifier, (2) the specific field being corrected, (3) the replacement value, and (4) a **mandatory explanation/reason**. Automatically record the authenticated correcting actor and server timestamp. Enforce WEB-040BB **Production Audit Correct** permission server-side. Preserve the original event and original field value unchanged; correction never changes production-release state or triggers production. Correction review/approval remains OPEN. |
| WEB-040BD | OPEN | Next: audit correction review workflow: direct append by authorised staff, two-person pre-approval, or immediate append followed by review. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BD immediate correction with subsequent review

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BD | LOCKED | **Option C:** staff holding **Production Audit Correct** permission may append a valid, fully explained structured correction **immediately**, without waiting for prior approval. **Every correction requires subsequent review by a different person** who records **Acknowledged** or **Flagged** through a new, linked, protected append-only review event. Review does not edit/delete the original audit event or correction, alter production-release state, or retroactively block the correction's append. Reviewer authority, deadline, notification and escalation remain OPEN. |
| WEB-040BE | OPEN | Next: who may perform the mandatory independent review: dedicated Production Audit Review permission, any administrator other than the corrector, or any other holder of Production Audit Correct permission. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BE any other administrator may review corrections

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BE | LOCKED | **Option B:** any **authenticated Tavistra administrator** may perform the required subsequent review of a Made to Order production-release audit correction **provided the reviewer is not the correction's author**. Check admin status and distinct reviewer identity server-side; no dedicated Production Audit Review or Production Audit Correct permission is required to review. Review outcome is **Acknowledged** or **Flagged**, persisted as a new linked protected append-only review event with reviewer identity and server timestamp (WEB-040BD). Review cannot modify original audit/correction records or production-release state. Correction creation still requires **Production Audit Correct** (WEB-040BB). |
| WEB-040BF | OPEN | Next: deadline for independent audit correction review: within 72 calendar hours, within seven calendar days, or no fixed deadline. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BF no fixed correction review deadline

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BF | LOCKED | **Option C:** the required independent review of each Made to Order production-release audit correction has **no fixed time deadline**. Every correction still requires a different authenticated administrator to append an **Acknowledged** or **Flagged** linked protected review event (WEB-040BD/BE). Until that event exists, the correction remains **Pending Review**, with no automatic approval, expiry, or time-based completion. The original audit and correction remain append-only and do not change production-release state. Reminder, discovery and flagged-correction handling remain OPEN. |
| WEB-040BG | OPEN | Next: how administrators find corrections pending mandatory independent review: dedicated pending-review queue, filter in existing audit history, or correction-detail-only visibility. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BG dedicated pending audit correction review queue

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BG | LOCKED | **Option A:** provide a **dedicated administrative Pending Audit Correction Review queue** listing Made to Order production-release audit corrections that have no valid independent **Acknowledged** or **Flagged** review event. Show each correction's linked original audit reference, correcting actor, server timestamp and correction details, with a route to review. Authenticated administrators may view the queue; enforce that the correction's author **cannot review their own correction** (WEB-040BE). When a valid independent review is appended, the correction leaves the pending queue while all original, correction and review events remain append-only. No fixed review deadline or automatic escalation is introduced (WEB-040BF). |
| WEB-040BH | OPEN | Next: whether and how to notify administrators about corrections awaiting independent review: immediate in-app notification, daily pending-review digest, or queue-only with no automatic notification. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BH queue-only correction review discovery

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BH | LOCKED | **Option C:** administrators discover Made to Order production-release audit corrections awaiting mandatory independent review by **manually checking the dedicated Pending Audit Correction Review queue** (WEB-040BG). **Do not send automatic in-app notifications, daily pending-review digests or other automatic pending-review reminders** when a correction is created or remains pending. The correction remains Pending Review until a different authenticated administrator appends an Acknowledged or Flagged protected linked review event (WEB-040BD/BE), with **no fixed review deadline** (WEB-040BF). This choice does not decide how Flagged reviews are followed up or override operational alerts for audit-write failures under WEB-040AZ. |
| WEB-040BI | OPEN | Next: what follow-up is required when an independent administrator flags an audit correction: mandatory linked resolution by a permitted corrector, informational flag only, or a second independent administrative review. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BI mandatory linked follow-up for flagged corrections

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BI | LOCKED | **Option A:** every **Flagged** independent review of a Made to Order production-release audit correction requires **documented follow-up by staff with explicit Production Audit Correct permission**. Append the follow-up as a **separate protected, linked resolution/corrective-action event** referencing the flagged review and correction. Enforce correction permission server-side. Preserve the original release audit, correction and Flagged review as immutable append-only records; follow-up cannot rewrite historical events, alter actual release state or start production. The exact follow-up payload, resolution/closure criteria, timing and presentation remain OPEN. |
| WEB-040BJ | OPEN | Next: required contents of the flagged-correction resolution event: structured corrective action with mandatory explanation, narrative-only follow-up, or minimal linked resolution marker. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BJ mandatory narrative flagged-correction follow-up

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BJ | LOCKED | **Option B:** the required follow-up for a **Flagged** Made to Order production-release audit correction (WEB-040BI) must be a **new protected append-only event** linked to **both the Flagged review and the associated correction**, with a **mandatory free-text narrative** describing the follow-up/action taken. Automatically capture the authenticated follow-up actor and server timestamp. Only staff with **Production Audit Correct** permission may append it; validate links and required narrative server-side. **No structured corrective-action category is required.** The original audit, correction and Flagged review remain immutable; follow-up cannot alter actual release state or initiate production. Whether/how the flagged concern is formally closed, follow-up timing and presentation remain OPEN. |
| WEB-040BK | OPEN | Next: when a flagged correction is considered formally resolved after its mandatory narrative follow-up: independent administrator acceptance, automatic closure upon valid follow-up, or no separate closed status. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BK independent acceptance for flagged-correction closure

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BK | LOCKED | **Option A:** after authorised staff with **Production Audit Correct** permission append the mandatory linked narrative follow-up for a **Flagged** Made to Order production-release audit correction (WEB-040BI/BJ), a **different authenticated administrator** must independently assess that follow-up before the flagged concern may be formally closed. Append a **separate protected, linked, append-only acceptance decision** referencing the flagged review, correction and narrative follow-up, recording **Resolution Accepted** or **Further Action Required**, with administrator identity and server timestamp. **Only Resolution Accepted** marks the concern closed; Further Action Required leaves it open. Enforce separation from the follow-up author server-side. The original audit, correction, Flagged review and follow-up remain immutable; neither decision changes actual production-release state. Further-action handling, acceptance event details, timing and presentation remain OPEN. |
| WEB-040BL | OPEN | Next: handling a **Further Action Required** acceptance decision: require another narrative follow-up and fresh independent acceptance, leave open with informal discretionary action, or route to a designated owner for disposition. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BL discretionary follow-up after Further Action Required

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BL | LOCKED | **Option B:** when an independent administrator records **Further Action Required** on the mandatory narrative follow-up to a **Flagged** Made to Order production-release audit correction, the flagged concern **remains open**. Staff determine any additional action **discretionarily**; **no second mandatory narrative follow-up, repeated formal acceptance cycle or automatic owner assignment** is imposed solely by that outcome. The Further Action Required event remains protected and append-only. **Only a valid independent administrator's Resolution Accepted event can formally close** the concern under WEB-040BK; no automatic closure or alteration of original audit, correction, review or narrative events occurs. Any later voluntary records must obey existing permissions, linkage and immutability rules. Detailed reopening/reassessment mechanics, timing and visibility remain OPEN. |
| WEB-040BM | OPEN | Next: how administrators discover **flagged correction concerns that remain open**, distinct from corrections pending their initial independent review: dedicated open-flagged queue, audit-history filter, or detail-only visibility. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BM dedicated open flagged concerns queue

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BM | LOCKED | **Option A:** provide authenticated Tavistra administrators a **dedicated Open Flagged Concerns queue**, distinct from the **Pending Audit Correction Review queue** (WEB-040BG). List **Flagged** Made to Order production-release audit correction concerns that lack a valid independent **Resolution Accepted** closure event (WEB-040BK), including those awaiting their first mandatory narrative follow-up, awaiting acceptance, or left open after **Further Action Required**. Provide links to the associated correction, Flagged review, linked narrative follow-up events and acceptance decisions. Remove a concern from this open queue only upon valid formal **Resolution Accepted**; retain its complete protected append-only audit history. Viewing the queue does not grant correction or acceptance authority. This choice adds no automatic notifications, follow-up deadlines, ownership assignments or production-release state changes. |
| WEB-040BN | OPEN | Next: deadline, if any, for the **initial mandatory narrative follow-up** after an independent administrator flags a correction: within 72 calendar hours, within seven calendar days, or no fixed deadline. Independent acceptance timing remains a separate decision. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BN no fixed initial flagged-correction follow-up deadline

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BN | LOCKED | **Option C:** the **initial mandatory narrative follow-up** after an independent administrator records **Flagged** on a Made to Order production-release audit correction has **no fixed deadline**. Staff with **Production Audit Correct** permission must still append the linked, protected, append-only narrative event with required explanation, actor and server timestamp (WEB-040BI/BJ). No time-based auto-completion, expiry, or deadline-triggered overdue escalation is introduced. The concern remains in the **Open Flagged Concerns queue** (WEB-040BM) until a different authenticated administrator records a valid **Resolution Accepted** decision under WEB-040BK; a narrative follow-up alone does not close it. This timing choice does not decide the deadline, if any, for the administrator's **independent acceptance decision**, or override operational alerts for audit-write failures (WEB-040AZ). |
| WEB-040BO | OPEN | Next: timing for an independent administrator to record **Resolution Accepted** or **Further Action Required** after the mandatory flagged-correction narrative follow-up: within 72 calendar hours, within seven calendar days, or no fixed deadline. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BO no fixed independent flagged-follow-up acceptance deadline

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BO | LOCKED | **Option C:** after an authorised staff member appends the mandatory narrative follow-up to a **Flagged** Made to Order production-release audit correction, the **independent administrator's acceptance decision** has **no fixed deadline**. A different authenticated administrator must still append a separate, protected, linked **Resolution Accepted** or **Further Action Required** event with administrator identity and server timestamp (WEB-040BK). No time-based auto-acceptance, expiry, closure or deadline-triggered escalation is introduced. The concern remains in the dedicated **Open Flagged Concerns queue** (WEB-040BM) until a valid **Resolution Accepted** event formally closes it; **Further Action Required** leaves it open with discretionary additional action (WEB-040BL). The original audit, correction, Flagged review, narrative follow-up and acceptance decisions remain immutable and do not change actual production-release state. WEB-040BF and WEB-040BN separately retain no fixed deadlines for initial correction review and initial flagged narrative follow-up. |
| WEB-040BP | OPEN | Next: notification policy for **newly Flagged correction concerns**: immediate in-app notification, daily digest of open flagged concerns, or queue-only discovery without automatic flagged-concern notifications. This is distinct from WEB-040BH pending-initial-review notifications. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BP queue-only flagged-concern discovery

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BP | LOCKED | **Option C:** administrators discover **newly Flagged and still-open** Made to Order production-release audit correction concerns by **manually checking the dedicated Open Flagged Concerns queue** (WEB-040BM). **Do not generate automatic in-app notifications, daily digests or automatic reminders** merely because a correction is Flagged or its flagged concern remains open. This extends the queue-only operational approach of WEB-040BH, which separately governs corrections awaiting their **initial independent review**. It does **not** remove mandatory narrative follow-up (WEB-040BI/BJ), independent Resolution Accepted/Further Action Required assessment (WEB-040BK), or append-only audit protections; no fixed review/follow-up/acceptance deadlines are introduced (WEB-040BF/BN/BO). WEB-040AZ's operational audit-write failure alert remains unaffected. Notification handling for distinct later events such as a narrative becoming ready for acceptance, if any, remains OPEN. |
| WEB-040BQ | OPEN | Next: what **status detail** should the Open Flagged Concerns queue display: distinct workflow-stage labels, a basic Open label plus latest-event summary, or an Open label only. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BQ distinct open flagged concern workflow-stage labels

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BQ | LOCKED | **Option A:** the authenticated-administrator **Open Flagged Concerns queue** (WEB-040BM) must display **distinct, derived workflow-stage labels** for each still-open Made to Order production-release audit correction concern: **Awaiting Narrative Follow-up** when no linked narrative follow-up exists; **Awaiting Independent Acceptance** when a linked narrative follow-up has been submitted but no valid independent decision has been recorded for that follow-up; and **Further Action Required** when the latest applicable independent acceptance decision requires further action. If staff later append a voluntary linked narrative after Further Action Required, derive **Awaiting Independent Acceptance** for that newer narrative without imposing a mandatory repeat cycle (WEB-040BL). Only a valid independent **Resolution Accepted** closes/removes the concern from the open queue (WEB-040BK). Derive labels from protected append-only records, not by modifying earlier audits, corrections, Flagged reviews, narratives or acceptance events. This decision does not introduce notifications, deadlines, automatic closure or production-release state changes. |
| WEB-040BR | OPEN | Next: **default sorting** of the Open Flagged Concerns queue: oldest flagged concerns first, newest flagged concerns first, or group by workflow stage then oldest within each stage. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BR oldest flagged first default queue ordering

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BR | LOCKED | **Option A:** the dedicated authenticated-administrator **Open Flagged Concerns queue** (WEB-040BM) displays **oldest unresolved flagged correction concerns first** by default, sorted in ascending order by the **server timestamp of the original independent Flagged review**. Apply this default **across all three derived workflow stages** (WEB-040BQ), rather than grouping by stage or prioritising newer flags. Subsequent narrative follow-ups and independent acceptance decisions do not reset the original flagged timestamp or the concern's default ordering. A valid **Resolution Accepted** removes the concern from the open queue, with its protected append-only history retained. This display rule creates no deadline, automatic escalation, notification, permission change or production-release state change. Optional stage filters, manual sorting overrides and tie-breaking rules remain OPEN. |
| WEB-040BS | OPEN | Next: **workflow-stage filtering** for the Open Flagged Concerns queue: optional stage filter with All Open as default, stage-plus-age filtering, or no filters (oldest-first list only). |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BS workflow-stage and flagged-age filters

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BS | LOCKED | **Option B:** authenticated administrators can filter the dedicated **Open Flagged Concerns queue** (WEB-040BM) by **workflow stage** and by an **optional flagged-age/date range** based on the **server timestamp of the original independent Flagged review**. Stage choices are **All Open**, **Awaiting Narrative Follow-up**, **Awaiting Independent Acceptance**, and **Further Action Required** (WEB-040BQ). **Default to all stages and all flagged ages**; apply WEB-040BR's **oldest original Flagged review first** ordering within the resulting set. Stage and date filters may be combined, and filtering affects only which open concerns are displayed, not their derived statuses, underlying protected append-only events, queue membership or production-release state. This does not introduce notifications, deadlines, automatic escalation or new permissions. Exact date-range UI, manual sorting overrides and timestamp tie-breaking remain OPEN. |
| WEB-040BT | OPEN | Next: **manual sorting overrides** for the Open Flagged Concerns queue: permit oldest/newest flagged toggle, offer expanded sort choices including latest activity, or retain fixed oldest-first order without manual override. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BT oldest/newest flagged manual sort toggle

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BT | LOCKED | **Option A:** the authenticated-administrator **Open Flagged Concerns queue** (WEB-040BM) provides a **manual Oldest Flagged First / Newest Flagged First toggle** using the **server timestamp of the original independent Flagged review**. **Oldest Flagged First remains the default** (WEB-040BR). An administrator may temporarily choose **Newest Flagged First** for the current queue view, including within any selected **workflow-stage and flagged-age/date-range filters** (WEB-040BS). Sorting must not use latest linked activity or change the original flagged timestamp, derived stage (WEB-040BQ), open/closed status, protected append-only events, permissions, or actual production-release state. This introduces no deadline, notification or automatic escalation. Equal-timestamp tie-breaking, exact flagged-age filter controls, and any persistent personal sort preferences remain OPEN. |
| WEB-040BU | OPEN | Next: **flagged-age/date-range filter controls** in the Open Flagged Concerns queue: preset age windows only, custom start/end date range only, or both preset age windows and custom date range. All ages remains the default; filtering uses the original Flagged review timestamp. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BU preset-only flagged-age filters

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BU | LOCKED | **Option A:** the authenticated-administrator **Open Flagged Concerns queue** (WEB-040BM) provides **preset flagged-age filters only**: **All Ages** (default), **Last 7 Days**, **Last 30 Days**, and **Last 90 Days**. No custom start/end date input is provided. Evaluate each preset against the **server timestamp of the original independent Flagged review**, not later follow-up or acceptance events. Administrators may combine a preset with the derived **workflow-stage filter** (WEB-040BS/BQ) and the temporary **Oldest Flagged First / Newest Flagged First** toggle (WEB-040BT), with oldest-first as the default (WEB-040BR). The precise meaning of "Last N Days" (rolling duration versus calendar days and time-zone boundaries) remains OPEN. Filtering affects display only, not audit history, concern closure, permissions, notification policy or actual production-release state. |
| WEB-040BV | OPEN | Next: **time-window interpretation** for the Last 7/30/90 Days presets: rolling N×24-hour durations, UTC calendar-day windows, or Tavistra business-time-zone calendar-day windows. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BV business-local calendar-day flagged-age windows

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BV | LOCKED | **Option C:** interpret **Last 7 Days**, **Last 30 Days** and **Last 90 Days** in the authenticated-administrator **Open Flagged Concerns queue** as **Tavistra business-time-zone calendar-day windows**, not rolling N×24-hour durations or UTC calendar-day windows. Each preset includes the **current calendar date in Tavistra's configured business time zone** plus the **preceding N−1 business-local calendar dates** (respectively 6, 29 or 89), beginning at business-local midnight on the earliest included date. Compare the **original independent Flagged review's server timestamp** converted to that business-local calendar date; do not reset the age basis after a narrative, Further Action Required decision or other linked activity. Keep **All Ages** as default and **no custom date range** (WEB-040BU); preserve combinable workflow-stage filtering (WEB-040BS) and manual oldest/newest Flagged sort toggle with oldest-first default (WEB-040BR/BT). The **source and configuration of Tavistra's business time zone** remain OPEN. Filtering is presentation-only and does not alter immutable audits, concern closure, deadlines, notifications, permissions or production-release state. |
| WEB-040BW | OPEN | Next: **source of the business time zone** used for flagged-age calendar windows: Tavistra's canonical site-wide configurable business time zone, a dedicated configurable audit-queue time zone, or a fixed Asia/Kolkata business time zone. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BW fixed Asia/Kolkata flagged-age time zone

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BW | LOCKED | **Option C:** calculate **Last 7 Days**, **Last 30 Days** and **Last 90 Days** flagged-age presets for the authenticated-administrator **Open Flagged Concerns queue** using the fixed **Asia/Kolkata IANA time zone (IST, UTC+05:30)**, regardless of any other Tavistra business time-zone setting or the administrator's browser/server locale. Under WEB-040BV, each N-day preset includes **today in Asia/Kolkata and the preceding N−1 Asia/Kolkata calendar dates**, from 00:00 IST at the start of the earliest included date through the current time; determine inclusion from the **original independent Flagged review's server timestamp**. This fixes the time-zone source without changing the existing **All Ages** default, 7/30/90-day preset-only controls (WEB-040BU), stage filters (WEB-040BS/BQ), or oldest-first default and manual oldest/newest sorting toggle (WEB-040BR/BT). Do not introduce custom date inputs, mutable audit history, deadline/escalation rules, automatic flagged-concern notifications, new permissions or production-release state changes. |
| WEB-040BX | OPEN | Next: **deterministic tie-breaking** when two open flagged concerns have the same original Flagged review server timestamp: original Flagged review event ID ascending, original correction event ID ascending, or no specified secondary ordering. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BX deterministic Flagged review event ID tie-breaking

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BX | LOCKED | **Option A:** in the authenticated-administrator **Open Flagged Concerns queue** (WEB-040BM), if two or more open concerns share **exactly the same server timestamp of their original independent Flagged review**, sort those tied concerns by the **immutable, unique original Flagged review event ID in ascending order** as a stable secondary key. Apply this secondary key in **both** the default **Oldest Flagged First** and optional **Newest Flagged First** modes (WEB-040BR/BT), within any selected workflow-stage or flagged-age preset filters (WEB-040BS/BU/BV/BW). Do not reverse the ID tie-break when toggling newest-first; the primary timestamp order alone reverses. Stable ordering supports repeatable refresh and pagination without changing any underlying append-only audit event, derived workflow stage, concern status, permission, deadline, notification or production-release state. |
| WEB-040BY | OPEN | Next: **persistence of queue view selections** for stage, age preset and oldest/newest sort: reset to defaults on each queue visit, retain selections for the current authenticated session only, or save each administrator's selections across sessions. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BY reset queue view selections on every visit

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BY | LOCKED | **Option A:** on **every new visit** to the authenticated-administrator **Open Flagged Concerns queue** (WEB-040BM), reset the three queue-view selections to **All Open** workflow stages (WEB-040BQ/BS), **All Ages** flagged-age preset (WEB-040BU/BV/BW), and **Oldest Flagged First** (WEB-040BR/BT/BX). An administrator may change the stage, age preset or oldest/newest sorting during the **current queue view** only. Do **not** retain these selections across queue visits, within an authenticated session after leaving/reopening the queue, or as saved per-administrator preferences. The rule affects presentation only; no protected append-only audit event, derived workflow stage, canonical concern status, queue membership, administrator permission, deadline, notification or production-release state is changed. |
| WEB-040BZ | OPEN | Next: **queue navigation/pagination** for Open Flagged Concerns: explicit numbered pages with Previous/Next controls, explicit Load More batches, or automatic infinite scroll. Page size, pagination consistency under concurrent changes and other implementation specifics remain OPEN. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040BZ numbered-page Open Flagged Concerns navigation

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040BZ | LOCKED | **Option A:** the authenticated-administrator **Open Flagged Concerns queue** (WEB-040BM) uses **explicit numbered pagination with Previous and Next controls**. Administrators can navigate directly to a displayed page number or move backward/forward using Previous/Next. The numbered pages operate on the currently selected **workflow-stage filter**, **flagged-age preset**, and **Oldest Flagged First / Newest Flagged First** sort (WEB-040BS/BT/BU/BV/BW), with the **original independent Flagged review timestamp** as primary key and **immutable original Flagged review event ID ascending** as deterministic secondary key for ties (WEB-040BX). Each new queue visit resets stage, age and sort selections to **All Open / All Ages / Oldest Flagged First** (WEB-040BY). Pagination is display-only: no audit-event mutation, concern closure, permissions, deadlines, notifications or production-release state changes. **Page size**, behaviour when filters/sort change, and consistency during concurrent queue updates remain OPEN. |
| WEB-040CA | OPEN | Next: **page size for numbered Open Flagged Concerns pagination**: fixed 25 rows, fixed 50 rows, or administrator-selectable 25/50/100 rows (default 25). |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CA selectable Open Flagged Concerns page size

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CA | LOCKED | **Option C:** the authenticated-administrator **Open Flagged Concerns queue** (WEB-040BM) provides an **administrator-selectable page size of 25, 50, or 100 concerns**, with **25 as the default**. The selected size governs the numbered pages and Previous/Next navigation locked under WEB-040BZ, after the existing workflow-stage and flagged-age filters and original Flagged review timestamp sorting (WEB-040BS/BT/BU/BV/BW/BX). This is a presentation control only: no changes to protected append-only audit history, derived concern stage, canonical open/closed status, permissions, deadlines, notifications or production-release state. **Page-size persistence across queue visits**, **which page to show after a filter/sort/page-size change**, and **consistency during concurrent queue updates** remain OPEN; WEB-040BY's reset-on-visit rule for stage/age/sort remains unchanged. |
| WEB-040CB | OPEN | Next: **page navigation when a stage filter, age preset, sort direction or page size changes** within an Open Flagged Concerns queue view: always return to page 1; keep the current page number if it exists (otherwise use the last page); or attempt to keep the first currently visible concern in view. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CB page-one reset on queue control changes

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CB | LOCKED | **Option A:** whenever an authenticated administrator changes the **workflow-stage filter**, **flagged-age preset**, **Oldest Flagged First / Newest Flagged First sorting direction**, or **25/50/100 page size** within the **Open Flagged Concerns queue**, reset numbered pagination to **page 1** of the resulting filtered and sorted open-concern set. Do not retain the previous page number or attempt to anchor the first previously visible concern. Preserve WEB-040BZ numbered pages with Previous/Next, WEB-040CA selectable page sizes (default 25), WEB-040BY stage/age/sort defaults on each new queue visit, and WEB-040BX deterministic original Flagged review event ID ascending tie-break. This is display-only; no change to protected append-only audits, workflow stage, concern closure, permissions, deadlines, notifications or production-release state. **Page-size persistence across queue visits** and **pagination consistency during concurrent queue updates** remain OPEN. |
| WEB-040CC | OPEN | Next: **persistence of the 25/50/100 page-size selection**: reset to 25 on each new queue visit, remember within the current authenticated session, or save per administrator across sessions. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CC reset page size to 25 on every queue visit

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CC | LOCKED | **Option A:** on **every new visit** to the authenticated-administrator **Open Flagged Concerns queue**, initialize the **concerns-per-page selector to 25**. Administrators may choose **50 or 100** within the current queue view (WEB-040CA), but their selection does **not** persist after leaving and reopening the queue, even within the same authenticated session; do not store a per-administrator page-size preference. Together with WEB-040BY, every new queue visit starts at **All Open** stages, **All Ages**, **Oldest Flagged First**, and **25 concerns per page**. Within the view, changing stage, age, sort or page size returns to **page 1** (WEB-040CB); preserve numbered Previous/Next pagination (WEB-040BZ). These controls affect presentation only and do not alter protected append-only audit events, derived stages, concern closure, permissions, deadlines, notifications or production-release state. |
| WEB-040CD | OPEN | Next: **pagination consistency when the Open Flagged Concerns queue changes during navigation**: re-query live authoritative results on each page navigation; hold a fixed display snapshot until manual refresh or control change; or automatically refresh and return to page 1 whenever underlying queue membership/order changes. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CD live page-navigation re-query

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CD | LOCKED | **Option A:** on each **numbered-page selection, Previous or Next** navigation in the authenticated-administrator **Open Flagged Concerns queue** (WEB-040BM/BZ), retrieve the **current authorised, filtered and deterministically sorted** open-concern results rather than reusing a fixed snapshot from an earlier page. Recalculate the available page count using the current stage/age filters, oldest/newest sorting, and selected 25/50/100 page size (WEB-040BS/BT/BU/BV/BW/BX/CA). If the requested page no longer exists because queue membership or result count changed, show the **last valid page**, or an **empty-result state** if no matching concerns remain. New or resolved concerns may shift between pages across successive navigations; do not promise a frozen cross-page snapshot. Preserve WEB-040BY/CC reset-on-visit defaults and WEB-040CB page-1 reset on explicit stage/age/sort/page-size changes. This navigation re-query does not itself require automatic polling, push updates or notifications while an administrator remains idle on a page, and it does not alter protected append-only audit history, derived stages, concern closure, permissions, deadlines or production-release state. |
| WEB-040CE | OPEN | Next: **how an administrator sees queue changes while remaining on the same numbered page**: an explicit Refresh control only, automatic periodic in-view refresh, or live push-based in-view updates. Page-navigation live re-query (WEB-040CD) remains mandatory in all cases. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CE manual in-view queue refresh

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CE | LOCKED | **Option A:** the authenticated-administrator **Open Flagged Concerns queue** provides an explicit, visible **Refresh** control to re-query the **current authorised, stage/age-filtered and deterministically sorted** open-concern results while the administrator remains on a numbered page. Do **not** automatically poll at intervals or push in-view updates in response to background queue changes. Refresh retains the current stage/age/sort/page-size selections and requested page number where valid; if the current page has ceased to exist, show the **last valid page**, or an **empty-result state** when no matching concerns remain. Preserve WEB-040CD's mandatory **live re-query on each Previous/Next/numbered-page navigation**; WEB-040CB's page-1 reset applies to **explicit stage, age, sort or page-size changes**, not Refresh. Every new queue visit still starts with **All Open / All Ages / Oldest Flagged First / 25 per page** (WEB-040BY/CC). Manual refresh is a display/read action, not an automatic concern notification, and does not change protected append-only audits, concern status, permissions, deadlines or production-release state. |
| WEB-040CF | OPEN | Next: **result-count presentation** on numbered Open Flagged Concerns pages: show an exact visible range and matching total (for example, Showing 26–50 of 83), show only the exact matching total, or omit a matching-record count beyond existing numbered-page navigation. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CF row range and matching total

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CF | LOCKED | **Option A:** the authenticated-administrator **Open Flagged Concerns queue** displays the **exact one-based row range for the currently shown numbered page and the total number of matching open concerns**, for example **Showing 26–50 of 83 matching concerns**. Compute the range and total from the **currently fetched, authorised, workflow-stage-filtered, flagged-age-filtered, deterministically sorted** result set, respecting the current **25/50/100 concerns-per-page** setting (WEB-040BS/BT/BU/BV/BW/BX/BZ/CA). Update the display after initial load, **manual Refresh** (WEB-040CE), Previous/Next/numbered-page navigation (WEB-040CD), and explicit filter, sort or page-size changes (WEB-040CB). For **zero matches**, show the empty-result state and a **zero matching concerns** count; do not invent a row range or an invalid numbered page. Displayed counts describe the most recently fetched results and need not update in the background while the administrator remains on a page (WEB-040CE). This is presentation-only; do not alter protected append-only audit history, derived stages, concern closure, permissions, deadlines, notifications or production-release state. |
| WEB-040CG | SUPERSEDED | Decision recorded below; previously proposed: **last-updated indicator for the Open Flagged Concerns page**: show an absolute timestamp in Asia/Kolkata after each successful fetch, show a relative elapsed-time label since the latest successful fetch, or show no last-updated indicator. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CG relative last-updated indicator

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CG | LOCKED | **Option B:** the authenticated-administrator **Open Flagged Concerns queue** displays a **relative elapsed-time label** since the **latest successful authoritative queue fetch**, for example **Updated 3 minutes ago**. Reset the elapsed-time origin only after a successful initial load, explicit manual Refresh (WEB-040CE), Previous/Next/numbered-page navigation (WEB-040CD), or stage/age/sort/page-size change (WEB-040CB). Do not treat a failed fetch as an update or imply the underlying queue is continuously synchronized. The elapsed-time label may advance locally without fetching queue records; this does **not** introduce automatic polling, push-based queue updates, or notifications. Keep the label distinguishable from the original immutable Flagged review timestamp used for sorting. Exact display cadence, wording for very recent/old results, and failed-fetch presentation remain OPEN. This is presentation-only and does not change protected append-only audit history, derived concern stages, concern closure, permissions, deadlines or production-release state. |
| WEB-040CH | SUPERSEDED | Decision recorded below; previously proposed: **relative last-updated label granularity**: continuously updating seconds/minutes, minute-level updates with an immediate “Just updated” state, or coarse fixed buckets such as “Just updated / 5+ minutes / 1+ hour”. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CH coarse relative last-updated buckets

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CH | LOCKED | **Option C:** for the authenticated-administrator **Open Flagged Concerns queue**, display the elapsed time since the latest **successful** authoritative queue fetch (WEB-040CG) using **coarse relative-time buckets**, such as **Just updated**, **5+ minutes ago**, and **1+ hour ago**, rather than a continuously ticking seconds/minutes counter. Bucket changes may be calculated client-side without fetching queue data; they do not imply automatic polling, push updates or notifications (WEB-040CE). Only a successful queue fetch resets the freshness origin; a failed fetch does not. The label is separate from immutable Flagged review timestamps and does not alter append-only audits, concern state, permissions, deadlines or production-release state. Exact bucket thresholds beyond the examples, stale-state wording and failed-fetch presentation remain OPEN. |
| WEB-040CI | SUPERSEDED | Decision recorded below; previously proposed: **failed-refresh freshness presentation** for the Open Flagged Concerns queue: retain the previous relative last-updated label and show a separate refresh-error message; replace the label with an explicit stale/error indicator; or hide the last-updated label until a successful fetch. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CI retain freshness label on failed refresh

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CI | LOCKED | **Option A:** if an authenticated administrator's explicit **Refresh** of the **Open Flagged Concerns queue** fails, **retain the previously fetched queue results and their relative last-successful-fetch freshness label** (WEB-040CG/CH), and display a **separate visible “Refresh failed” error message**. Do not reset the freshness origin, falsely imply a successful update, clear the previously displayed rows/count, or silently suppress the error. A later successful fetch replaces the results and resets the relative freshness origin; navigation and control-change fetches continue to follow their approved behavior, with their error presentation details remaining OPEN. Preserve manual-only queue refresh (WEB-040CE), live re-query on navigation (WEB-040CD), deterministic filters/sort and page counts. No change to append-only audit history, concern state, permissions, deadlines, notifications or production-release state. |
| WEB-040CJ | SUPERSEDED | Decision recorded below; previously proposed: **duration of the failed-refresh error message** in the Open Flagged Concerns queue: persist until the next successful fetch or explicit dismissal; automatically dismiss after a short timeout; or persist until the next refresh attempt regardless of outcome. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CJ persistent failed-refresh error

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CJ | LOCKED | **Option A:** in the authenticated-administrator **Open Flagged Concerns queue**, a visible **Refresh failed** error from an unsuccessful manual Refresh **persists until the next successful authoritative queue fetch or explicit administrator dismissal**. Do not automatically hide it after a timeout, and do not clear it merely because another refresh is attempted. If that subsequent attempt fails, keep an appropriate visible failure message; if it succeeds, clear the error and update the displayed results and last-successful-fetch freshness origin. Explicit dismissal hides the message only and does not mark the failed fetch as successful, alter the retained results, or reset the relative freshness label (WEB-040CG/CH/CI). Preserve manual-only refresh (WEB-040CE), live re-query on navigation (WEB-040CD), and all existing protected audit, concern-state, permission, deadline, notification and production-release rules. |
| WEB-040CK | SUPERSEDED | Decision recorded below; previously proposed: **failed-refresh error dismissal control** for the Open Flagged Concerns queue: a visible close (×) control on the error message, a dedicated Dismiss text button, or no manual dismissal (clear only after a successful fetch). |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CK no manual failed-refresh error dismissal

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CK | LOCKED | **Option C:** the authenticated-administrator **Open Flagged Concerns queue** provides **no manual dismissal control** for a failed-refresh error. The error remains visible until the **next successful authoritative queue fetch**, which clears it and updates the queue results and relative last-successful-fetch freshness origin. Another unsuccessful fetch does not clear the message; do not auto-dismiss after a timeout. This decision **supersedes WEB-040CJ only insofar as WEB-040CJ allowed explicit administrator dismissal**; WEB-040CJ's persistence-until-success behavior otherwise remains LOCKED. Preserve WEB-040CI's previously fetched results and freshness label after failure, WEB-040CG/CH coarse relative freshness, WEB-040CE manual-only refresh, and WEB-040CD live re-query on page navigation. No change to protected append-only audit history, concern status, permissions, deadlines, notifications or production-release state. |
| WEB-040CL | SUPERSEDED | Decision recorded below; previously proposed: **failed-refresh error placement** in the Open Flagged Concerns queue: persistent inline banner above the results table, inline message adjacent to the Refresh control, or a dedicated status area below the queue header. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CL persistent inline error banner above queue results

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CL | LOCKED | **Option A:** in the authenticated-administrator **Open Flagged Concerns queue**, show a failed-refresh error in a **persistent inline banner immediately above the results table**. The banner must not obscure the previously fetched concern rows, matching counts, page navigation or Refresh control. Preserve the previous results and last-successful-fetch relative freshness label on failure (WEB-040CI), coarse relative freshness buckets (WEB-040CG/CH), and **no manual dismissal** (WEB-040CK, superseding WEB-040CJ's dismissal allowance). The banner remains visible through subsequent failed attempts and clears only after the next successful authoritative queue fetch. Do not automatically poll, push updates or alter protected append-only audit events, concern state, permissions, deadlines, notifications or production-release state. Exact banner wording, accessibility announcement behavior and treatment of other fetch failures remain OPEN. |
| WEB-040CM | SUPERSEDED | Decision recorded below; previously proposed: **failed-refresh banner message content**: concise “Refresh failed. Showing previously loaded results.”; include the relative last-successful-fetch freshness label in the banner text; or show a generic “Unable to refresh. Try again.” without explicitly describing retained results. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CM explicit retained-results failed-refresh message

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CM | LOCKED | **Option A:** the persistent inline error banner immediately above the authenticated-administrator **Open Flagged Concerns** results table (WEB-040CL) displays **“Refresh failed. Showing previously loaded results.”** after an unsuccessful manual Refresh. Keep the separate coarse relative last-successful-fetch freshness indicator (WEB-040CG/CH) rather than repeating its value inside the banner. Retain previously fetched rows, matching counts and navigation state (WEB-040CI); do not imply the failed request updated the data. The banner cannot be manually dismissed (WEB-040CK) and remains until a successful authoritative queue fetch, which clears the error and updates results/freshness. Preserve manual-only refresh, live page-navigation re-query and all protected audit, concern-state, permission, deadline, notification and production-release rules. |
| WEB-040CN | SUPERSEDED | Decision recorded below; previously proposed: **accessibility announcement of the persistent failed-refresh banner**: announce once via a non-interruptive status/live region; announce immediately via an assertive alert region; or make the banner visually visible without automatic screen-reader announcement. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CN polite failed-refresh accessibility announcement

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CN | LOCKED | **Option A:** when a failed manual Refresh causes the persistent inline error banner above the authenticated-administrator **Open Flagged Concerns** results table to appear, **announce the failure once using a non-interruptive polite status/live region** (for example, `role="status"` or `aria-live="polite"`), without interrupting ongoing screen-reader speech. Announce **“Refresh failed. Showing previously loaded results.”** as approved in WEB-040CM. Do not repeatedly re-announce an unchanged persistent banner during local relative-freshness bucket updates or unrelated renders; a distinct subsequent failed refresh may update the existing failure state without duplicate announcement unless the message materially changes. Preserve the banner's visibility until the next successful authoritative fetch (WEB-040CK), previously fetched results and separate coarse relative freshness indicator (WEB-040CI/CG/CH), and manual-only refresh (WEB-040CE). No changes to append-only audit history, concern state, permissions, deadlines, notifications or production-release state. |
| WEB-040CO | SUPERSEDED | Decision recorded below; previously proposed: **screen-reader announcement after a repeated failed Refresh while the same error banner remains visible**: announce each new failure politely, announce only the first failure until a successful fetch resets the state, or announce repeated failures only when the error reason/message changes. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CO one failed-refresh announcement per failure episode

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CO | LOCKED | **Option B:** in the authenticated-administrator **Open Flagged Concerns queue**, screen readers receive the **polite, non-interruptive announcement only for the first failed manual Refresh in a continuous failure episode**. Further unsuccessful Refresh attempts while the same persistent error banner remains visible **do not trigger another automatic announcement**, even if the administrator explicitly retries. A **successful authoritative queue fetch** clears the banner, updates the data and freshness origin, and **resets** the announcement state; a later failed Refresh begins a new episode and is announced once. Keep the visible banner message **“Refresh failed. Showing previously loaded results.”** (WEB-040CM), its position immediately above the table (WEB-040CL), no manual dismissal (WEB-040CK), preserved previously fetched results/freshness on failure (WEB-040CI), and polite live-region behavior (WEB-040CN). Do not alter audit, concern, permission, deadline, notification, or production-release rules. |
| WEB-040CP | SUPERSEDED | Decision recorded below; previously proposed: **keyboard focus behavior after a manual Refresh failure** in the Open Flagged Concerns queue: retain focus on the Refresh button; move focus to the persistent error banner; or move focus to the results-table heading. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CP retain Refresh focus after failure

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CP | LOCKED | **Option A:** after an authenticated administrator activates **Refresh** in the **Open Flagged Concerns** queue and the authoritative fetch fails, **retain keyboard focus on the Refresh button**; do not programmatically move focus to the persistent error banner or results-table heading. The first failure in each continuous failure episode is announced once via a non-interruptive polite live region (WEB-040CN/CO). Keep the persistent inline banner directly above results with **“Refresh failed. Showing previously loaded results.”** (WEB-040CL/CM), clear it only on a successful fetch with no manual dismissal (WEB-040CK), and preserve previously fetched results and last-successful-fetch freshness on failure (WEB-040CI). The button remains available for an explicit retry. Do not alter append-only audit history, concern state, permissions, deadlines, notifications or production-release state. |
| WEB-040CQ | SUPERSEDED | Decision recorded below; previously proposed: **Refresh button availability during an in-flight manual fetch** in the Open Flagged Concerns queue: disable Refresh until the request settles; leave it enabled but ignore duplicate clicks; or allow concurrent refresh requests. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CQ disable Refresh during in-flight request

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CQ | LOCKED | **Option A:** in the authenticated-administrator **Open Flagged Concerns queue**, temporarily **disable the Refresh button while a manually initiated authoritative queue fetch is in flight**. This prevents duplicate refresh requests and overlapping responses. Re-enable Refresh when that request settles, whether successful or failed. Preserve WEB-040CP's no-programmatic-focus-movement rule on failure and WEB-040CN/CO's polite once-per-failure-episode announcement. If the request fails, retain previously loaded results/freshness and show the persistent banner **“Refresh failed. Showing previously loaded results.”** until a successful authoritative fetch (WEB-040CI/CK/CL/CM). Whether to preserve keyboard focus while the button is temporarily disabled remains OPEN for the next decision. No automatic polling, and no changes to audit history, concern state, permissions, deadlines, notifications or production-release state. |
| WEB-040CR | SUPERSEDED | Decision recorded below; previously proposed: **keyboard-focus handling while Refresh is temporarily disabled for an in-flight fetch**: keep the focused control focusable using aria-disabled semantics while blocking activation; use native disabled and allow browser focus to move naturally; or move focus explicitly to a loading-status region. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CR preserve Refresh focus using aria-disabled

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CR | LOCKED | **Option A:** while a manually initiated authoritative fetch is in flight in the authenticated-administrator **Open Flagged Concerns queue**, keep the **Refresh** control keyboard-focusable and preserve its focus using **`aria-disabled="true"` semantics** rather than native `disabled`; prevent activation by pointer, keyboard or other input so no duplicate fetch begins (WEB-040CQ). Remove `aria-disabled` and restore activation once the request settles, whether success or failure. Do not programmatically move focus to the error banner or results heading after failure (WEB-040CP). Continue the persistent inline failure banner, retained results/freshness and once-per-failure-episode polite announcement (WEB-040CI/CK/CL/CM/CN/CO). Preserve manual-only refresh and all protected audit, concern, permission, deadline, notification and production-release rules. |
| WEB-040CS | SUPERSEDED | Decision recorded below; previously proposed: **visible in-progress feedback on the Refresh control** while the queue fetch runs: show a spinner with “Refreshing…” label; show text “Refreshing…” without a spinner; or keep the static “Refresh” label with only the disabled semantic state. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CS spinner and Refreshing label

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CS | LOCKED | **Option A:** while a manually initiated authoritative fetch is in flight in the authenticated-administrator **Open Flagged Concerns queue**, display a **small loading spinner alongside the visible text “Refreshing…”** on the Refresh control. Keep the control keyboard-focusable using `aria-disabled="true"`, block duplicate activation, and preserve focus (WEB-040CQ/CR). When the request settles, restore the normal **“Refresh”** label, remove the loading spinner and `aria-disabled`, and permit another manual request. On failure, preserve the previously loaded queue results/freshness and show the persistent inline error banner with its once-per-failure-episode polite announcement (WEB-040CI/CK/CL/CM/CN/CO/CP). The spinner is visual status feedback only, not an additional fetch or automatic polling mechanism. Preserve all protected audit, concern-state, permission, deadline, notification and production-release rules. |
| WEB-040CT | SUPERSEDED | Decision recorded below; previously proposed: **screen-reader loading-state announcement during manual Refresh**: announce “Refreshing…” once through a polite live region; rely only on the focused button's changing accessible name and aria-disabled state; or announce loading immediately through an assertive alert. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CT polite screen-reader Refresh-start announcement

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CT | LOCKED | **Option A:** when an authenticated administrator initiates a manual Refresh in the **Open Flagged Concerns queue**, announce **“Refreshing…” once** through a **non-interruptive polite live region**. Do not use an assertive alert for routine loading, repeatedly announce it during the same request, or rely solely on the button's changing accessible name. During the in-flight fetch, the Refresh control visibly shows a spinner and “Refreshing…” (WEB-040CS), remains keyboard-focusable using `aria-disabled="true"`, and blocks duplicate activation (WEB-040CQ/CR). When the request settles, restore normal button state; preserve the existing failure banner and once-per-failure-episode polite error announcement (WEB-040CI/CK/CL/CM/CN/CO/CP). No automatic polling or changes to audit history, concern state, permissions, deadlines, notifications or production-release state. |
| WEB-040CU | SUPERSEDED | Decision recorded below; previously proposed: **screen-reader announcement after a successful manual Refresh**: politely announce “Results updated.”; politely announce “Results updated” with the current matching result count; or provide no separate success announcement and rely on the updated freshness indicator. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CU successful Refresh announcement with matching count

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CU | LOCKED | **Option B:** after a successful administrator-initiated authoritative Refresh of the **Open Flagged Concerns queue**, announce completion **once via a polite, non-interruptive live region**, including the **actual matching concern total returned by that successful fetch**, for example **“Results updated. 24 matching concerns.”** (use correct singular/plural wording and zero count). The announcement must reflect the current filter scope and the authoritative matching total, not merely the number of rows on the visible page (WEB-040CF). Clear any persistent failed-refresh banner, reset its failure-episode announcement state, update the displayed results and relative last-successful-fetch freshness origin, and restore the Refresh button from its spinner/“Refreshing…”/aria-disabled state (WEB-040CI/CK/CL/CM/CN/CO/CQ/CR/CS/CT). Do not announce a success or updated count when the fetch fails, and do not change audit history, concern state, permissions, deadlines, notifications or production-release state. |
| WEB-040CV | SUPERSEDED | Decision recorded below; previously proposed: **screen-reader success announcement when a manual Refresh returns zero matching concerns**: announce “Results updated. 0 matching concerns.”; announce “Results updated. No matching concerns.”; or announce “No matching concerns.” without explicit success confirmation. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CV natural-language zero-results success announcement

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CV | LOCKED | **Option B:** when an authenticated administrator's manual Refresh of the **Open Flagged Concerns queue** succeeds and the authoritative matching concern total is **zero**, announce **“Results updated. No matching concerns.”** once via a polite, non-interruptive live region. This is the zero-count wording exception to WEB-040CU's successful-refresh announcement with the actual matching total; nonzero totals continue to use the count, with correct singular/plural wording. The message confirms successful fetch and an empty filtered result set, not a failed fetch or a mere empty visible page. On success, update queue data and last-successful-fetch freshness, clear any persistent failed-refresh banner and reset its announcement episode, and restore the Refresh control's normal state. Preserve manual-only refresh, focus continuity, protected audit history, concern state, permissions, deadlines, notifications and production-release rules. |
| WEB-040CW | SUPERSEDED | Decision recorded below; previously proposed: **screen-reader success announcement when exactly one concern matches after manual Refresh**: use singular “Results updated. 1 matching concern.”; use generic “Results updated. Matching concerns: 1.”; or omit the count for a single result. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CW singular matching-concern success announcement

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CW | LOCKED | **Option A:** when a successful authenticated-administrator manual Refresh of the **Open Flagged Concerns queue** returns **exactly one matching concern**, announce **“Results updated. 1 matching concern.”** once through a polite, non-interruptive live region. This is the singular wording for WEB-040CU's authoritative matching-count success announcement; for zero matches use **“Results updated. No matching concerns.”** (WEB-040CV), and for two or more use the numeric total with plural “matching concerns.” The count represents the full filtered matching total, not only visible rows. Success clears the persistent failed-refresh banner, updates results and last-successful-fetch freshness, resets the failure announcement episode, and restores Refresh to its idle state. Preserve manual-only refresh, focus continuity, protected audit history, concern state, permissions, deadlines, notifications and production-release rules. |
| WEB-040CX | SUPERSEDED | Decision recorded below; previously proposed: **visible success feedback after a successful manual Refresh** in the Open Flagged Concerns queue: show a brief inline “Results updated” status near Refresh; show no additional visible success message beyond updated results and freshness; or show a persistent success banner above results until the next interaction. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CX refreshed results and freshness without visual success message

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CX | LOCKED | **Option B:** after a successful authenticated-administrator manual Refresh of the **Open Flagged Concerns queue**, display the **updated queue results and reset the separate last-successful-fetch relative freshness indicator**, without an additional visible “Results updated” success message or success banner. Restore the Refresh control to its idle label/state and clear any persistent failed-refresh banner. Continue the previously approved **polite screen-reader success announcement with the authoritative matching total**, including the zero and singular wording rules (WEB-040CU/CV/CW). A successful fetch also resets the failed-refresh announcement episode. On failure, retain previously fetched results/freshness and show the persistent error banner. Preserve manual-only refresh, focus continuity and all protected audit, concern-state, permission, deadline, notification and production-release rules. |
| WEB-040CY | SUPERSEDED | Decision recorded below; previously proposed: **visual treatment of the last-updated freshness indicator immediately after a successful Refresh**: display “Just updated” immediately; display “Updated now” before switching to the approved coarse relative buckets; or briefly highlight the existing freshness indicator without changing its “Just updated” wording. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CY immediate Just updated freshness wording

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CY | LOCKED | **Option A:** immediately after a successful authoritative manual Refresh in the authenticated-administrator **Open Flagged Concerns queue**, reset the separate last-successful-fetch freshness origin and display **“Just updated”** using the existing approved coarse relative freshness buckets (WEB-040CG/CH). Do not introduce an initial “Updated now” wording, temporary highlight, animation or extra visible success message (WEB-040CX). The refreshed queue results and matching count reflect the successful fetch; clear any prior persistent failed-refresh banner, reset the failure announcement episode, and retain the polite screen-reader success announcement with the authoritative matching total (WEB-040CU/CV/CW). Failed requests do not reset the freshness origin (WEB-040CI). Preserve manual-only refresh, focus continuity, protected audit history, concern state, permissions, deadlines, notifications and production-release rules. |
| WEB-040CZ | SUPERSEDED | Decision recorded below; previously proposed: **freshness indicator behavior while a manual Refresh is in flight**: keep the last-successful-fetch relative freshness label visible and aging; temporarily replace it with “Refreshing…”; or hide it until the request completes. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040CZ keep last-successful freshness visible during Refresh

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040CZ | LOCKED | **Option A:** while an authenticated administrator's manual Refresh of the **Open Flagged Concerns queue** is in flight, **keep the separate last-successful-fetch relative freshness indicator visible and allow its coarse elapsed-time bucket to age naturally**. Do not replace it with “Refreshing…” or hide it. The Refresh control itself provides the spinner and “Refreshing…” loading feedback (WEB-040CS/CT); previously loaded results remain visible until a successful authoritative fetch updates them. On success, reset the freshness origin and immediately show “Just updated” (WEB-040CY); on failure, retain the existing freshness origin and results while displaying the persistent failed-refresh banner (WEB-040CI/CK/CL/CM). Preserve polite accessibility announcements, keyboard-focus continuity, manual-only refresh, protected audit history, concern state, permissions, deadlines, notifications and production-release rules. |
| WEB-040DA | SUPERSEDED | Decision recorded below; previously proposed: **presentation of previously loaded queue results while a manual Refresh is in flight**: keep rows fully interactive; keep rows visible but temporarily disable row actions; or replace rows with a loading placeholder until the fetch settles. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DA keep previously loaded concern rows interactive during Refresh

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DA | LOCKED | **Option A:** while an authenticated administrator's manual Refresh of the **Open Flagged Concerns queue** is in flight, **keep previously loaded concern rows visible and fully interactive for otherwise permitted row actions**. Do not disable the rows or replace them with loading placeholders merely because the queue fetch is pending. All actions must continue to enforce authoritative server-side permissions, current concern state, production lifecycle gates and concurrency checks; the stale displayed snapshot must not authorize an action that is no longer valid. The Refresh button alone blocks duplicate refresh activation and shows the spinner/“Refreshing…” label (WEB-040CQ/CR/CS), while the separate last-successful-fetch freshness indicator stays visible and ages naturally (WEB-040CZ). On success, reconcile with the newly fetched results and reset freshness; on failure, retain results/freshness and show the persistent failure banner. Exact handling when a row action and the pending Refresh return conflicting snapshots remains OPEN. Preserve protected audit history, concern state, deadlines, notifications and production-release rules. |
| WEB-040DB | SUPERSEDED | Decision recorded below; previously proposed: **reconciliation when a permitted concern-row action completes during an in-flight Refresh and the fetch returns an older snapshot**: preserve the action's confirmed result and re-fetch authoritative queue data; allow the Refresh response to replace the row until the next manual fetch; or block applying the Refresh response until the row action settles. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DB preserve confirmed row action and reconcile stale Refresh

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DB | LOCKED | **Option A:** when a permitted **Open Flagged Concerns** row action completes with a server-confirmed result while a manual queue Refresh is in flight, and the Refresh response represents an **older snapshot** for that concern, **preserve the confirmed action result in the displayed queue and initiate a fresh authoritative queue re-fetch for reconciliation**. Do not apply the older response in a way that visually reverses the confirmed action. The reconciliation re-fetch is a bounded, event-driven follow-up to this detected conflict, **not automatic polling**; enforce existing authoritative permissions, concern-state checks and concurrency safeguards. Reconcile the final queue rows, matching total and last-successful-fetch freshness against the successful authoritative result; a failed reconciliation fetch must not undo the confirmed action and must follow the existing failure-message and freshness rules. WEB-040DA keeps rows otherwise interactive during the in-flight fetch. Exact loading indication for the conflict-triggered reconciliation re-fetch remains OPEN. Preserve protected append-only audit history, concern state, deadlines, notifications and production-release rules. |
| WEB-040DC | SUPERSEDED | Decision recorded below; previously proposed: **loading feedback during a conflict-triggered authoritative reconciliation re-fetch**: reuse the Refresh button's spinner and “Refreshing…” state; show a separate inline “Syncing changes…” indicator near the affected row; or reconcile silently without additional loading feedback. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DC affected-row Syncing changes indicator

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DC | LOCKED | **Option B:** during the **conflict-triggered authoritative reconciliation re-fetch** required by WEB-040DB, display a separate inline **“Syncing changes…”** loading status **near the affected concern row**, while keeping the server-confirmed row-action result visible. Do not present this automatic reconciliation as an administrator-initiated Refresh by reusing the Refresh button's spinner or “Refreshing…” state; the manual Refresh control follows its own established behavior. Clear the affected-row syncing status when the reconciliation fetch settles, and apply the authoritative result without allowing an older snapshot to visually reverse a confirmed action. If reconciliation fails, retain the confirmed result and follow applicable fetch-failure handling without falsely indicating success. This is a bounded, conflict-triggered fetch, not polling; preserve existing server-side permission, state, concurrency and append-only audit safeguards. Accessibility announcement semantics for this inline syncing status remain OPEN. |
| WEB-040DD | SUPERSEDED | Decision recorded below; previously proposed: **screen-reader announcement of the affected-row “Syncing changes…” status** during conflict reconciliation: announce once politely; rely on the visible inline status without an automatic announcement; or use an assertive alert to announce immediately. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DD polite conflict-reconciliation status announcement

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DD | LOCKED | **Option A:** when an authoritative conflict-triggered reconciliation re-fetch begins for a concern row in the authenticated-administrator **Open Flagged Concerns queue** (WEB-040DB), announce the affected-row **“Syncing changes…”** status **once through a polite, non-interruptive screen-reader live region**. Do not use an assertive alert or repeat the same loading announcement during the same reconciliation request. Keep the separate visible inline status near the affected row (WEB-040DC) while preserving the server-confirmed action result; do not repurpose the manual Refresh button's loading state. Clear the syncing indicator when the reconciliation settles, apply only authoritative reconciled state, and do not allow an older response to reverse a confirmed action. Preserve existing failure handling, permissions, concern-state validation, concurrency protections, append-only audit history, deadlines, notifications and production-release rules. |
| WEB-040DE | SUPERSEDED | Decision recorded below; previously proposed: **screen-reader announcement when conflict-triggered reconciliation completes successfully**: politely announce “Changes synced.”; politely announce “Changes synced.” with the affected concern identifier; or provide no separate completion announcement and rely on the row status clearing. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DE polite reconciliation success announcement

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DE | LOCKED | **Option A:** when conflict-triggered authoritative reconciliation of an affected concern row in the authenticated-administrator **Open Flagged Concerns queue** completes **successfully**, announce **“Changes synced.”** once via a **polite, non-interruptive screen-reader live region**. Do not include the concern identifier in this announcement or announce success when reconciliation fails. Remove the inline **“Syncing changes…”** loading status on completion, reconcile displayed queue rows and matching total with authoritative results, and preserve the confirmed row-action outcome against older snapshots (WEB-040DB/DC/DD). Keep the manual Refresh loading and success announcements distinct from conflict-triggered reconciliation. Preserve existing failure handling, focus continuity, permissions, concern-state and concurrency safeguards, append-only audit history, deadlines, notifications and production-release rules. |
| WEB-040DF | SUPERSEDED | Decision recorded below; previously proposed: **visible feedback after successful conflict-triggered reconciliation**: silently remove the affected-row “Syncing changes…” indicator and show authoritative results; briefly replace it with “Changes synced”; or keep a persistent “Changes synced” badge on the affected row until the next interaction. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DF no separate visual success message after reconciliation

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DF | LOCKED | **Option A:** after successful conflict-triggered authoritative reconciliation in the authenticated-administrator **Open Flagged Concerns queue**, **remove the affected-row inline “Syncing changes…” indicator and show the authoritative reconciled results without an additional visual success message, temporary success label or persistent badge**. Preserve the once-only polite screen-reader announcement **“Changes synced.”** under WEB-040DE. A server-confirmed row-action result must not be visually reversed by an older Refresh response (WEB-040DB); reconcile from authoritative state, and keep manual Refresh feedback distinct. Existing permission, state, concurrency, focus, audit-history, deadline, notification and production-release safeguards remain unchanged. Handling the inline indicator when reconciliation fails is not decided by this success-only rule. |
| WEB-040DG | SUPERSEDED | Decision recorded below; previously proposed: **visible feedback when conflict-triggered reconciliation fails**: replace the affected-row “Syncing changes…” indicator with a persistent inline “Could not sync changes” warning; show a temporary warning that disappears automatically; or remove the indicator and rely solely on the queue-level fetch-failure banner. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DG persistent affected-row reconciliation failure warning

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DG | LOCKED | **Option A:** if the conflict-triggered authoritative reconciliation re-fetch fails in the authenticated-administrator **Open Flagged Concerns queue**, replace the affected-row inline **“Syncing changes…”** loading status with a **persistent inline “Could not sync changes” warning**. Keep the server-confirmed row-action result visible; never apply an older Refresh response to visually reverse that confirmed action. Do not automatically time out the row warning or rely solely on the queue-level fetch-failure banner; retain the existing queue-level failure handling where applicable. The row warning remains until a subsequent successful authoritative reconciliation resolves the affected concern; its exact recovery initiation behavior remains OPEN. Do not announce **“Changes synced.”** on failure. Preserve server-side permission, concern-state, concurrency, focus, append-only audit, deadline, notification and production-release safeguards. |
| WEB-040DH | SUPERSEDED | Decision recorded below; previously proposed: **recovery action for the persistent affected-row “Could not sync changes” warning**: offer an inline “Retry sync” control for that concern; require the administrator to use the existing queue-wide Refresh control; or retry automatically after a fixed delay. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DH inline targeted Retry sync recovery

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DH | LOCKED | **Option A:** when conflict-triggered reconciliation fails for a concern in the authenticated-administrator **Open Flagged Concerns queue**, keep the persistent inline **“Could not sync changes”** warning (WEB-040DG) and provide an adjacent **“Retry sync”** control. An administrator's activation initiates a **targeted authoritative re-fetch for that affected concern**, not a required queue-wide manual Refresh and not a timed or automatic retry. Retain the server-confirmed action result while the retry is pending and prevent older snapshots from reversing it; enforce existing authentication, permissions, concern-state validation and concurrency protections. Clear the warning only when successful authoritative reconciliation resolves the affected concern; on another failure keep the warning and recovery action available. Loading feedback and duplicate-activation behavior for the inline Retry sync control remain OPEN. Preserve append-only audit history, deadlines, notifications, production-release safeguards and existing queue-level Refresh behavior. |
| WEB-040DI | SUPERSEDED | Decision recorded below; previously proposed: **duplicate activation of the affected-row “Retry sync” control while its targeted reconciliation request is in flight**: disable the control until the request settles; permit repeated activations as separate requests; or hide the control until the request settles. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DI prevent duplicate targeted Retry sync requests

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DI | LOCKED | **Option A:** while an administrator-initiated targeted authoritative reconciliation request for an affected concern is in flight, **keep the inline “Retry sync” control visible but disable further activation until the request settles**. Do not issue concurrent duplicate targeted retries and do not hide the control. The existing persistent “Could not sync changes” warning and server-confirmed action result remain protected until successful authoritative reconciliation resolves the concern (WEB-040DG/DH); on failure, re-enable the retry control and retain the warning. The exact disabled-control accessibility mechanism and in-flight loading label remain OPEN. Preserve queue-wide manual Refresh behavior, authentication, permissions, concern-state and concurrency safeguards, append-only audit history, deadlines, notifications and production-release rules. |
| WEB-040DJ | SUPERSEDED | Decision recorded below; previously proposed: **accessible disabled state for the in-flight affected-row “Retry sync” control**: use `aria-disabled="true"` while retaining keyboard focus and blocking activation; use native `disabled` and remove it from keyboard navigation; or replace the control with non-interactive status text until the request settles. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DJ focus-preserving accessible Retry sync disabled state

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DJ | LOCKED | **Option A:** while a targeted authoritative reconciliation request is in flight for an affected concern in the authenticated-administrator **Open Flagged Concerns queue**, keep the inline **“Retry sync”** control visible and keyboard-focusable, set **`aria-disabled="true"`**, preserve existing keyboard focus, and **block all activation paths** until the request settles. Do not use native `disabled` or replace the control with non-interactive text. On a failed retry, remove `aria-disabled`, restore permitted activation, and retain the persistent **“Could not sync changes”** warning; on successful authoritative reconciliation, clear the warning and reconcile the row without reversing the server-confirmed action (WEB-040DB/DG/DH/DI). The control’s in-flight visual label remains OPEN. Preserve queue-wide manual Refresh behavior, authentication, permissions, concern-state and concurrency safeguards, append-only audit history, deadlines, notifications and production-release rules. |
| WEB-040DK | SUPERSEDED | Decision recorded below; previously proposed: **visual loading feedback on the affected-row “Retry sync” control during its targeted request**: show a spinner and change the label to “Retrying…”; retain the “Retry sync” label and add a spinner; or keep the disabled control visually unchanged while the adjacent “Syncing changes…” status provides feedback. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DK spinner and Retrying label on targeted Retry sync

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DK | LOCKED | **Option A:** while an administrator-initiated targeted authoritative **Retry sync** request is in flight for an affected concern in the authenticated-administrator **Open Flagged Concerns queue**, display a **spinner and change that control’s visible label to “Retrying…”** until the request settles. Keep the control visible and keyboard-focusable with **`aria-disabled="true"`**, preserve focus and block all repeat activation (WEB-040DI/DJ). The affected row continues to show its reconciliation-in-progress feedback without visually reversing any server-confirmed action; successful authoritative reconciliation clears the persistent failure warning, while failure retains **“Could not sync changes”** and restores an actionable **“Retry sync”** control. Do not treat the targeted retry as a queue-wide manual Refresh. Whether to automatically announce the control’s “Retrying…” state to screen readers is OPEN. Preserve authentication, permissions, concern-state and concurrency checks, append-only audit history, deadlines, notifications and production-release safeguards. |
| WEB-040DL | SUPERSEDED | Decision recorded below; previously proposed: **screen-reader announcement when the administrator activates the affected-row “Retry sync” control**: politely announce “Retrying sync…” once; rely on the existing “Syncing changes…” affected-row announcement; or use an assertive alert to announce the retry immediately. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DL separate polite Retry sync announcement

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DL | LOCKED | **Option A:** when an authenticated administrator activates the affected-row **“Retry sync”** control after failed conflict-triggered reconciliation, announce **“Retrying sync…” once through a polite, non-interruptive screen-reader live region** at the start of the targeted authoritative retry. This is a distinct administrator-initiated retry announcement; avoid also announcing the generic **“Syncing changes…”** message for the same retry start, while preserving WEB-040DD for the initial conflict-triggered reconciliation. The visible Retry sync control displays a spinner and **“Retrying…”** during the request (WEB-040DK), remains focusable with **`aria-disabled="true"`**, and blocks duplicate activation (WEB-040DI/DJ). On success, apply the authoritative result and preserve WEB-040DE’s once-only polite **“Changes synced.”** completion announcement; on failure, retain the persistent **“Could not sync changes”** warning and restore the actionable retry control. Preserve authoritative permissions, concern-state and concurrency safeguards, append-only audit history, deadlines, notifications and production-release rules. |
| WEB-040DM | SUPERSEDED | Decision recorded below; previously proposed: **screen-reader announcement when an administrator-initiated targeted “Retry sync” request fails again**: politely announce “Could not sync changes. Retry available.” once; announce only “Could not sync changes.”; or rely on the persistent inline warning without an automatic failure announcement. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DM concise polite targeted retry failure announcement

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DM | LOCKED | **Option B:** if an administrator-initiated targeted **“Retry sync”** request fails again in the authenticated-administrator **Open Flagged Concerns queue**, announce **“Could not sync changes.” once through a polite, non-interruptive screen-reader live region**. Do not append “Retry available.” to the automatic announcement; the persistent inline warning and restored actionable **“Retry sync”** control provide recovery affordance (WEB-040DG/DH). End the spinner/“Retrying…” loading state, remove `aria-disabled="true"` when the request settles, retain the server-confirmed action result, and do not announce **“Changes synced.”** on failure. Preserve distinct once-only start announcement **“Retrying sync…”** (WEB-040DL), authoritative permission and state checks, concurrency protections, append-only audit history, deadlines, notifications and production-release rules. |
| WEB-040DN | SUPERSEDED | Decision recorded below; previously proposed: **keyboard focus after a failed targeted “Retry sync” request**: retain focus on the restored “Retry sync” control; move focus to the persistent “Could not sync changes” warning; or move focus to the affected concern row heading. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DN retain Retry sync focus after failure

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DN | LOCKED | **Option A:** when an administrator-initiated targeted **“Retry sync”** request fails in the authenticated-administrator **Open Flagged Concerns queue**, **retain keyboard focus on the restored “Retry sync” control**. Do not move focus to the persistent **“Could not sync changes”** warning or to the affected concern-row heading. When the request settles, restore the actionable **“Retry sync”** label and remove `aria-disabled="true"` (WEB-040DI/DJ/DK), keep the persistent inline warning and server-confirmed action result intact, and issue the once-only polite failure announcement **“Could not sync changes.”** (WEB-040DM). Repeated retry activation remains explicitly administrator initiated, with no automatic polling. Preserve authoritative permissions, concern-state and concurrency checks, append-only audit history, deadlines, notifications and production-release rules. |
| WEB-040DO | SUPERSEDED | Decision recorded below; previously proposed: **keyboard focus when a targeted “Retry sync” succeeds and its warning/control disappear**: move focus to the affected concern row heading; move focus to the next available row action; or retain focus on the removed control until normal browser focus recovery occurs. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DO focus affected concern heading after successful Retry sync

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DO | LOCKED | **Option A:** when an administrator-initiated targeted **“Retry sync”** request succeeds in the authenticated-administrator **Open Flagged Concerns queue**, and the inline retry control and failure warning are removed, **programmatically move keyboard focus to the affected concern row heading** to maintain orientation. Do not automatically focus another administrative action or rely on browser focus recovery after removing the focused control. The heading must be programmatically focusable without changing the ordinary tab sequence; announce **“Changes synced.”** once politely as approved by WEB-040DE, remove the syncing status without a separate visual success message (WEB-040DF), and display only the authoritative reconciled result without reversing a confirmed action. Handling focus if the reconciled concern no longer appears in the filtered queue remains OPEN. Preserve server-side permissions, concern-state and concurrency protections, append-only audit history, deadlines, notifications and production-release safeguards. |
| WEB-040DP | SUPERSEDED | Decision recorded below; previously proposed: **keyboard focus after successful targeted reconciliation removes the affected concern from the current filtered queue**: move focus to the queue results heading; move focus to the next remaining concern row heading; or move focus to the queue-wide Refresh control. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DP queue results heading focus when reconciled row disappears

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DP | LOCKED | **Option A:** when successful targeted authoritative reconciliation removes the affected concern from the authenticated-administrator **Open Flagged Concerns** queue’s current filtered results, **programmatically move keyboard focus to the queue results heading**. This destination must remain present and programmatically focusable even when no concern rows remain, without inserting the heading into the normal tab sequence. Do not move focus to the next row or the queue-wide Refresh control. When the affected row remains, follow WEB-040DO and focus its heading instead. Preserve the once-only polite **“Changes synced.”** announcement (WEB-040DE), authoritative queue result and total reconciliation, and the no-extra-visual-success-message rule (WEB-040DF). Maintain server-side permissions, concern-state and concurrency safeguards, append-only audit history, deadlines, notifications and production-release rules. |
| WEB-040DQ | SUPERSEDED | Decision recorded below; previously proposed: **accessible announcement of the updated queue result count when successful targeted reconciliation removes the affected concern from the filtered queue**: announce the new matching total politely alongside “Changes synced.”; announce only “Changes synced.” and rely on the visible count; or announce the remaining visible-page row count. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DQ retain concise reconciliation completion announcement

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DQ | LOCKED | **Option B:** when successful targeted authoritative reconciliation removes the affected concern from the current filtered **Open Flagged Concerns** queue, **announce only “Changes synced.” once politely** as already approved under WEB-040DE. Do not append either the authoritative matching-concern total or the visible-page row count to this completion announcement. Update the visible authoritative matching total and queue results normally, and move keyboard focus to the queue results heading under WEB-040DP. This rule applies to conflict-triggered targeted reconciliation and does not override the separate manual queue-wide Refresh success announcements (WEB-040CU/CV/CW). Preserve permission, concern-state, concurrency, audit-history, deadline, notification and production-release safeguards. |
| WEB-040DR | SUPERSEDED | Decision recorded below; previously proposed: **what to display when a successful targeted reconciliation leaves the current filtered queue with zero matching concerns**: show a specific “No matching concerns” empty state; show a generic “No concerns to display” empty state; or leave an empty results region with only the zero-count indicator. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DR explicit zero-matching-concerns empty state

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DR | LOCKED | **Option A:** when successful targeted authoritative reconciliation leaves the current filtered authenticated-administrator **Open Flagged Concerns queue** with **zero matching concerns**, display the explicit empty-state text **“No matching concerns”** in the results area, alongside the authoritative zero matching-count indicator. The message describes the current filtered result set, not a claim that all concerns have been resolved globally. Keep the queue results heading present and programmatically focusable as the WEB-040DP focus destination; retain the once-only polite **“Changes synced.”** announcement without an added count (WEB-040DQ). Do not leave the results region blank or substitute “No concerns to display”. Preserve the existing manual Refresh rules, authoritative permissions, concern-state and concurrency protections, append-only audit history, deadlines, notifications and production-release safeguards. |
| WEB-040DS | SUPERSEDED | Decision recorded below; previously proposed: **whether the “No matching concerns” empty state should offer a filter-reset action**: provide an explicit “Clear filters” control when filters are active; show informational text only with no filter-reset action; or automatically clear filters when the result count reaches zero. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DS explicit Clear filters control in empty state

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DS | LOCKED | **Option A:** when the authenticated-administrator **Open Flagged Concerns queue** displays the **“No matching concerns”** empty state (WEB-040DR) and one or more administrator-selected filters are active, show an explicit **“Clear filters”** control alongside the message. The administrator must choose to activate this control; **do not automatically reset filters** when the matching count becomes zero. If no filters are active, do not show a misleading Clear filters control. The scope of filter values reset and focus handling after activation remain OPEN. Keep the authoritative matching total, queue results heading and accessibility behavior intact, and preserve permissions, concern-state/concurrency protections, append-only audit history, deadlines, notifications and production-release safeguards. |
| WEB-040DT | SUPERSEDED | Decision recorded below; previously proposed: **scope of the empty-state “Clear filters” action**: clear all administrator-selected queue filters while retaining the default Open Flagged Concerns scope; clear only the most recently changed filter; or reset filters and also reset the administrator’s chosen sort order. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DT clear selected filters while preserving queue scope and sorting

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DT | LOCKED | **Option A:** when an authenticated administrator activates **“Clear filters”** from the **“No matching concerns”** empty state in the **Open Flagged Concerns queue** (WEB-040DR/DS), **clear all administrator-selected queue filters**, while **preserving the default Open Flagged Concerns scope and the administrator’s current sort order**. Do not clear only the most recently changed filter, change the queue scope, or reset sorting. Re-evaluate the authoritative matching result set under the retained queue scope and sort order; do not imply that all concerns globally have been resolved. Keyboard focus after activation remains OPEN. Preserve permissions, concern-state and concurrency checks, append-only audit history, deadlines, notifications, production-release safeguards and the separate manual Refresh behavior. |
| WEB-040DU | SUPERSEDED | Decision recorded below; previously proposed: **keyboard focus immediately after the empty-state “Clear filters” control is activated**: move focus to the queue results heading; move focus to the first filter control; or retain focus on the Clear filters control until updated results render. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DU focus queue results heading after Clear filters

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DU | LOCKED | **Option A:** immediately after an authenticated administrator activates **“Clear filters”** from the **“No matching concerns”** empty state in the **Open Flagged Concerns queue**, **programmatically move keyboard focus to the queue results heading**, which must remain present and programmatically focusable without entering the ordinary tab sequence. Do not move focus to the first filter input or retain focus on the Clear filters control, which may disappear when the empty state resolves. Clear all administrator-selected filters while preserving the default Open Flagged Concerns scope and current sort order (WEB-040DT), then render the authoritative updated results and matching total. The exact screen-reader status announcement for this filter-clear results update remains OPEN. Preserve permissions, concern-state and concurrency checks, append-only audit history, deadlines, notifications, production-release safeguards and separate manual Refresh behavior. |
| WEB-040DV | SUPERSEDED | Decision recorded below; previously proposed: **screen-reader announcement after Clear filters updates the queue results**: politely announce “Filters cleared. Results updated.”; politely announce “Filters cleared.” with the authoritative matching-concern total; or rely on focus moving to the results heading without a separate live-region announcement. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DV concise screen-reader confirmation after Clear filters

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DV | LOCKED | **Option A:** once the authenticated-administrator **Open Flagged Concerns queue** has applied the explicit **“Clear filters”** action and updated the authoritative results, **politely announce “Filters cleared. Results updated.” once** via an accessible live region. Do not append the matching-concern total or omit the status announcement. Retain keyboard focus on the queue results heading (WEB-040DU), preserve the default Open Flagged Concerns scope and current sort order while clearing all administrator-selected filters (WEB-040DT), and render the authoritative matching total and rows. This is a filter-clear confirmation, distinct from the queue-wide manual Refresh and targeted reconciliation announcements; do not duplicate their announcements for the same action. Preserve permissions, concern-state and concurrency checks, append-only audit history, deadlines, notifications and production-release safeguards. |
| WEB-040DW | SUPERSEDED | Decision recorded below; previously proposed: **behavior of the Clear filters control while the updated results request is in flight**: disable the control until the request completes while keeping it visible; remove the control immediately after activation; or leave it enabled to permit repeated activation. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DW disable Clear filters during in-flight results request

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DW | LOCKED | **Option A:** after an authenticated administrator activates **“Clear filters”** from the **“No matching concerns”** empty state in the **Open Flagged Concerns queue**, **keep the Clear filters control visible but disabled while the authoritative updated-results request is in flight**, preventing repeated activation and duplicate requests. Do not remove the control immediately or allow repeat activation during the request. On completion, render authoritative results and matching total; when the empty state no longer applies, the control may disappear according to WEB-040DS. Preserve WEB-040DU queue-results-heading focus and WEB-040DV once-only polite “Filters cleared. Results updated.” announcement on successful update. The precise accessible disabled-state implementation remains OPEN. Preserve permissions, concern-state and concurrency checks, append-only audit history, deadlines, notifications and production-release safeguards. |
| WEB-040DX | SUPERSEDED | Decision recorded below; previously proposed: **accessible disabled-state implementation for the in-flight Clear filters control**: use aria-disabled="true" while retaining programmatic focusability and blocking activation; use native disabled attribute; or replace the control with static progress text. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DX accessible in-flight Clear filters disabled state

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DX | LOCKED | **Option A:** while the authoritative results request triggered by **“Clear filters”** is in flight in the authenticated-administrator **Open Flagged Concerns queue**, keep the control visible and expose **`aria-disabled="true"`** while retaining programmatic focusability and **explicitly blocking pointer, keyboard and scripted activation** to prevent duplicate requests. Do not use the native `disabled` attribute or replace the control with static text. Continue to move keyboard focus to the queue results heading after activation (WEB-040DU), maintain the existing filter-clear completion announcement only after successful results update (WEB-040DV), and restore the appropriate control state when the request ends. The in-flight visual label and progress affordance remain OPEN. Preserve the default queue scope and sort order (WEB-040DT), permissions, concern-state/concurrency protections, append-only audit history, deadlines, notifications and production-release safeguards. |
| WEB-040DY | SUPERSEDED | Decision recorded below; previously proposed: **in-flight visual treatment of the disabled Clear filters control**: show a spinner with “Clearing filters…” on the control; retain the “Clear filters” label with a separate adjacent loading indicator; or keep the unchanged label with no visible progress indicator. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DY spinner and Clearing filters in-flight label

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DY | LOCKED | **Option A:** while the authoritative updated-results request triggered by **“Clear filters”** is in flight in the authenticated-administrator **Open Flagged Concerns queue**, show a **spinner inside the control** and temporarily replace its visible label with **“Clearing filters…”**. Keep the control visible with **`aria-disabled="true"`**, retain programmatic focusability and block repeated activation as required by WEB-040DW/DX. On completion, render authoritative results, restore or remove the control according to the resulting filtered empty state, and on success retain the WEB-040DU queue-results-heading focus and WEB-040DV once-only polite **“Filters cleared. Results updated.”** announcement. The screen-reader announcement at the start of this in-flight operation remains OPEN. Preserve the default queue scope and current sort order (WEB-040DT), permissions, concern-state and concurrency safeguards, append-only audit history, deadlines, notifications and production-release rules. |
| WEB-040DZ | SUPERSEDED | Decision recorded below; previously proposed: **screen-reader announcement when Clear filters begins its results request**: politely announce “Clearing filters…” once at request start; rely on the changing control label without a separate live-region announcement; or announce the start assertively. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040DZ polite once-only Clear filters start announcement

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040DZ | LOCKED | **Option A:** when an authenticated administrator activates **“Clear filters”** in the **Open Flagged Concerns queue** and the authoritative updated-results request starts, **politely announce “Clearing filters…” exactly once** via a live region. Do not rely solely on the changing control label or interrupt assistive-technology output with an assertive announcement. Maintain the spinner and in-control “Clearing filters…” label (WEB-040DY), visible `aria-disabled="true"` control with blocked repeat activation (WEB-040DW/DX), and keyboard focus on the queue results heading after activation (WEB-040DU). On successful update, separately announce **“Filters cleared. Results updated.”** once (WEB-040DV), without duplicating the start announcement. Failure-state handling remains OPEN. Preserve the default Open Flagged Concerns scope and current sort order, authoritative permissions, concern-state/concurrency protections, append-only audit history, deadlines, notifications and production-release safeguards. |
| WEB-040EA | SUPERSEDED | Decision recorded below; previously proposed: **failure handling when the authoritative results request triggered by Clear filters fails**: retain the prior filtered results and selected filters with a persistent inline error and Retry control; keep cleared filter selections but show the previous results with a stale-data warning; or automatically retry the request without administrator action. |

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-040EA preserve filters and results on Clear filters failure

| Decision | Status | Approved rule |
|---|---|---|
| WEB-040EA | LOCKED | **Option A:** if the authoritative results request triggered by **“Clear filters”** fails in the authenticated-administrator **Open Flagged Concerns queue**, restore the previously selected administrator filters, retain the last successfully loaded results and their matching total, and show a **persistent inline error with an explicit “Retry” control**. Do not leave cleared filters paired with stale filtered results, and do not automatically retry. The success-only **“Filters cleared. Results updated.”** announcement must not fire on failure. Preserve the default queue scope and current sort order, authoritative permissions, concern-state/concurrency protections, append-only audit history, deadlines, notifications and production-release safeguards. |

**Decision process note:** Following stakeholder feedback, avoid opening separate product decisions for routine UI microstates, focus details, spinner text and screen-reader wording unless they materially affect product policy or unresolved user outcomes. Consolidate such details into implementation specifications and accessibility acceptance criteria. Continue one-at-a-time approval for substantive production-lifecycle decisions.

Quote Only participation and coupon details remain OPEN. WEB-040N retains exactly two customer-facing price components: discounted tax-inclusive products plus one combined delivery charge if applicable. WEB-038 cart interaction DEFERRED.

## 2026-10-28 — WEB-041 implementation-readiness audit before build

| Decision | Status | Approved rule |
|---|---|---|
| WEB-041 | LOCKED | **Option A: implementation-readiness audit first.** Review approved Made to Order production-lifecycle rules and related dependencies for contradictions, unresolved business decisions and implementation prerequisites; create a prioritized actionable build plan. Do not reopen settled decisions without a demonstrable conflict. Consolidate routine UI/accessibility microstates into implementation specifications and acceptance tests rather than further serial product approvals. This authorizes an audit and planning deliverables, **not** implementation, payment-provider selection, Quote Only resolution, coupon policy or WEB-038 cart interaction. |

**Constraints carried forward:** Quote Only participation/treatment **OPEN**; coupon details **OPEN**; exactly two customer-facing price components under WEB-040N (**discounted tax-inclusive product price** and **one combined delivery charge if applicable**); WEB-038 cart interaction **DEFERRED**.

## 2026-10-28 — WEB-042 canonical Made to Order lifecycle matrix first

| Decision | Status | Approved rule |
|---|---|---|
| WEB-042 | LOCKED | **Option A:** produce a **canonical Made to Order lifecycle state-transition and invariant matrix** as the first implementation-ready deliverable after WEB-041. Consolidate approved lifecycle actions, actors, preconditions, payment and readiness gates, concurrency/idempotency behavior, protected append-only audit events, and independent audit correction/review/flagged concern flows. Clearly distinguish approved behavior from proposed implementation models and unresolved requirements. Follow with architecture/persistence contracts; do not begin backend implementation or silently choose an unapproved policy. Do not reopen settled decisions without a demonstrated conflict. |

**Constraints preserved:** Quote Only treatment **OPEN**; coupon details **OPEN**; WEB-040N exactly two customer-facing price components (**discounted tax-inclusive product price** and **one combined delivery charge if applicable**); WEB-038 cart interaction **DEFERRED**.

## 2026-10-28 — Roadmap direction correction: whole website before implementation detail

| Decision | Status | Approved direction |
|---|---|---|
| ROADMAP-001 | LOCKED | **Restore the complete Tavistra website blueprint as the active task**: Phase 1 sitemap and functional module inventory; Phase 2 end-to-end functional architecture and cross-page journeys; Phase 3 page-level experience design (storefront before detailed admin UI, WEB-022); Phase 4 technical implementation planning and build. Do not tunnel into one workflow or solicit separate approvals for routine UI microstates. Use `docs/roadmap/master-website-blueprint.md` as the active north star and coverage checklist. WEB-041 and WEB-042 remain valid supporting technical documents but are **PARKED** as active implementation work until website coverage and functional architecture are defined; this changes sequencing, not their approved business rules. |

**Preserved:** Quote Only treatment OPEN; coupon details OPEN; WEB-040N exactly two customer-facing price components (discounted tax-inclusive product price and one combined delivery charge if applicable); WEB-038 cart interaction DEFERRED.


## 2026-11-04 — Owner approval for published Ready Stock return-policy changes (Option A)

**OWNER-APPROVED / LOCKED:** Any proposed change to a **published** Ready Stock product's explicit return eligibility (including enabling or disabling standard returns) or product-specific published N-calendar-day return duration must receive **explicit owner approval before the change becomes effective**. Authorised catalog staff may prepare a pending draft but may not make the changed terms effective directly. Until owner approval and successful versioned publication, the last effective published version remains authoritative for display, sale and new purchase-time snapshots. Record proposed old/new values, proposer, owner decision/actor/time, publication version/effective time, and immutable audit; reject stale or conflicting approvals against superseded drafts. At each purchase, preserve the exact effective return eligibility, duration (if eligible), source/version and disclosed terms immutably. No retroactive reduction of existing customer rights; retain statutory defect/consumer remedies and expressly applicable more favourable later policies. Unconfigured or explicitly non-returnable products remain standard non-returnable and saleable; explicitly returnable products without a valid owner-approved published product-specific N-day duration remain blocked from publication/sale. The confirmed delivery date remains day zero, with day N ending at 23:59:59 in the published business timezone. All existing customer, financial, pickup, inspection, unit-allocation, quarantine, separately authorised disposition and audit decisions remain unchanged. WEB-018/WEB-038 DEFERRED; Quote Only/coupons OPEN; WEB-040N two customer-facing price components.

**Next single major functional boundary (OPEN):** When a pending return-policy edit exists, may staff continue making unrelated product-content/price/inventory updates under their existing permissions without waiting for return-policy approval (Option A), or must all publication of that product be held until the return-policy edit is resolved (Option B)?


## 2026-11-04 — Administrator-only Ready Stock return-policy authority; roadmap alignment correction

**OWNER CLARIFICATION / LOCKED:** Only the **Administrator** may create, modify, approve and publish Ready Stock product return-policy settings, including eligibility and product-specific N-calendar-day duration. Non-administrator staff have no authority to propose editable policy changes, approve them or publish them. The previous 2026-11-04 statement that catalog staff may prepare return-policy drafts is **SUPERSEDED to that extent only**. Administrator changes remain subject to explicit approval before taking effect, versioned publication, immutable actor/time/old-new-value audit, effective-policy purchase-time snapshots, default non-returnability, publication/sale blocking for explicitly returnable products lacking valid approved duration, and statutory/more-favourable-policy safeguards. Do not infer any new administrator self-approval or separation-of-duties rule beyond this clarification.

**ROADMAP ALIGNMENT:** Maintain ROADMAP-001 as active north star: complete whole-website functional coverage and cross-module journeys before detailed UI states or implementation. Avoid proliferating serial micro-decisions. The previously proposed pending-return-policy-edit versus unrelated-publication boundary is **not approved and parked** unless a concrete functional conflict later requires it. Resume master website blueprint coverage after recording this clarification. Preserve WEB-018/WEB-038 deferrals, Quote Only/coupon open status, WEB-040N two customer-facing price components, and all existing settled rules.


## 2026-11-04 — Phase 2 Made to Order manufacturing job granularity (Option A)

**OWNER-APPROVED / LOCKED:** after an authorised Made to Order production release, manage manufacturing through **one authoritative production job per released order line**, including when the line quantity exceeds one. Maintain stable links to the order, released line, ordered quantity and existing release/audit evidence. Allow internal per-unit progress, work items and traceability where operationally necessary, but do **not** create a separate primary production job per physical unit or change the purchased order-line identity. No production job may bypass authoritative verified-full-payment, irreversible readiness and authorised release prerequisites. Preserve all existing WEB-042 release, concurrency, immutable audit, correction/review and permissions controls. This decision fixes job granularity only; it does not approve physical production stage names, job assignment, quality outcomes, rework, cancellation, customer-facing status labels, or dispatch gates. Phase 1 conceptual manufacturing work, quality disposition and fulfilment handover coverage remains in scope. Preserve Ready Stock administrator-only return-policy control, statutory protections, WEB-018/WEB-038 deferrals, Quote Only/coupons OPEN and WEB-040N two customer-facing price components.

**Next single major functional boundary (OPEN):** Should a released Made to Order production job require an explicit authorised **manufacturing start** action (Option A), or enter active manufacturing automatically upon release (Option B)? Production release itself remains irreversible under existing rules; no option is approved yet.


## 2026-11-04 — Phase 2 Made to Order automatic manufacturing activation on release (Option B)

**OWNER-APPROVED / LOCKED:** A successful authorised Made to Order production release **automatically creates or activates the authoritative manufacturing job for each newly released order line**. There is no separate staff `Start Manufacturing` gate or action. The job's operational state is active upon successful release; this is a system/workflow status and **does not assert physical workshop work has actually commenced**. Preserve one primary job per released order line, with optional internal per-unit progress; ensure idempotent, atomic linkage to the successful release so failed/rejected/duplicate release attempts cannot create or reactivate jobs. Preserve authoritative full verified payment, irreversible readiness, release permissions, immutable successful/rejected attempt audit, concurrency protection, and independent correction/review as previously locked. Do not introduce a reversible release or infer quality/dispatch approval. Existing Ready Stock return-policy administrator-only authority, statutory rights, WEB-018/WEB-038 DEFERRED, Quote Only/coupons OPEN and WEB-040N two customer-facing price components remain unchanged.

**Next single major functional boundary (OPEN):** Should each active Made to Order manufacturing job have a **mandatory accountable internal assignee/owner before work can be recorded (Option A)**, or may work progress be recorded by authorised production staff without a designated job assignee (Option B)? This is about operational accountability, not detailed UI or staff notifications.


## 2026-11-04 — Phase 2 Made to Order mandatory manufacturing job ownership (Option A)

**OWNER-APPROVED / LOCKED:** Each automatically activated Made to Order manufacturing job must have **one designated accountable internal staff owner before any manufacturing progress may be recorded**. The authorised production release still atomically creates/activates one job per released order line without waiting for assignment; an unassigned active job remains unable to accept progress records until an authorised assignment occurs. Multiple authorised contributors may perform work, but a single current accountable owner must be recorded. Record assignment and reassignment actor, time, prior/new owner and immutable audit; enforce current assignment and progress permissions at the backend. This does not add a separate manufacturing-start action, reverse release, or assume actual physical work began on activation. Preserve verified-full-payment/readiness/release prerequisites, WEB-042 atomic/idempotent release and immutable audit, independent review/correction, existing quality/fulfilment boundaries and all other approved rules. Ready Stock return-policy administration remains Administrator-only; WEB-018/WEB-038 DEFERRED, Quote Only/coupons OPEN, WEB-040N two customer-facing price components.

**Next single major functional boundary (OPEN):** May the accountable manufacturing job owner **record progress personally and permit other authorised production staff to contribute progress updates (Option A)**, or may **only the assigned owner record progress (Option B)**? Both options retain one accountable owner, permission checks and actor-level immutable audit. No option approved yet.


## 2026-11-04 — Phase 2 Made to Order collaborative manufacturing progress recording (Option A)

**OWNER-APPROVED / LOCKED:** Once an automatically activated Made to Order manufacturing job has its mandatory designated accountable owner, **the assigned owner and other explicitly authorised production staff may record manufacturing progress**. The job retains exactly one current accountable owner; recording a contribution does not transfer ownership or grant additional permissions. Every progress record must retain the actual contributing actor, timestamp, linked job/order line, event details and immutable audit, with backend authorization checks. No progress recording before an authorised owner assignment. This does not approve specific manufacturing stage names, completion criteria, quality approval, rework, dispatch, or customer-facing progress labels. Preserve one primary job per released order line, automatic activation on successful authorised release, verified full payment and irreversible readiness prerequisites, WEB-042 release/atomicity/audit and independent review rules, and all other locked controls. Ready Stock return-policy changes remain Administrator-only; statutory rights unchanged; WEB-018/WEB-038 DEFERRED, Quote Only/coupons OPEN, WEB-040N two customer-facing price components.

**Next single major functional boundary (OPEN):** For a Made to Order manufacturing job, should **manufacturing completion be explicitly attested by an authorised staff member before a separate quality disposition (Option A)**, or should **a quality-pass decision itself serve as manufacturing completion (Option B)**? Either choice must prevent shipment of unfinished/unapproved goods; no choice is approved yet.


## 2026-11-04 — Phase 2 Made to Order separate manufacturing completion and quality disposition (Option A)

**OWNER-APPROVED / LOCKED:** For each Made to Order manufacturing job, **manufacturing completion requires an explicit attestation by authorised staff** and is a distinct, auditable milestone from **subsequent quality review/disposition**. A completed job is not automatically quality-approved or eligible for fulfilment/dispatch. Require a separate authorised quality approval before goods may be handed to fulfilment, subject to any further fulfilment controls decided later. Preserve identity of actor, time, job/order-line linkage and immutable event history for both milestones. Completion must not be inferred from progress updates or quality-pass alone. Quality failure/rework handling, criteria, reviewer permissions and per-unit outcomes for multi-quantity lines remain OPEN; do not invent a disposition scheme or allow incomplete/unapproved units to ship. Preserve one authoritative job per released order line, automatic activation on authorised release, assigned accountable owner before collaborative progress recording, payment/readiness/release prerequisites and WEB-042 permissions/audit/concurrency protections. Preserve all prior Ready Stock and statutory safeguards, WEB-018/WEB-038 DEFERRED, Quote Only/coupons OPEN and WEB-040N exactly two customer-facing price components.

**Next single major functional boundary (OPEN):** For a manufacturing job covering multiple physical units, should quality review and approval be **tracked per physical unit with only approved units eligible for fulfilment (Option A)**, or should quality approval be **all-or-nothing at the entire order-line job level (Option B)**? This does not yet decide partial shipment policy; no option approved.


## 2026-11-04 — Phase 2 Made to Order per-physical-unit quality disposition (Option A)

**OWNER-APPROVED / LOCKED:** A Made to Order manufacturing job remains **one authoritative job per released order line**, including quantity greater than one, but **quality inspection/disposition must be recorded for each individual physical unit** associated with that job. Each unit's outcome is independent: accepted units retain their approval when another unit fails or awaits inspection; a failed/unapproved unit is not eligible for fulfilment. Keep durable unit-to-job/order-line/quantity traceability and immutable actor, time, outcome and decision history. Manufacturing completion attestation remains a separate prior milestone; unit quality approval cannot be inferred from manufacturing completion. Do **not** infer that per-unit quality approval permits partial dispatch or changes customer order identity. Specific quality criteria, failure/rework/remake procedures, review roles and partial shipment policy remain OPEN. Preserve verified full payment, irreversible readiness, authorised atomic/idempotent release and audit, automatic job activation, mandatory accountable owner and collaborative authorised progress, and all prior controls. Ready Stock return-policy settings remain Administrator-only; statutory rights and safeguards unchanged; WEB-018/WEB-038 DEFERRED, Quote Only/coupons OPEN, WEB-040N two customer-facing price components.

**Next single major functional boundary (OPEN):** If one or more Made to Order units fail quality inspection, should they enter an **explicit controlled rework/remake and mandatory reinspection path (Option A)**, or should staff handle failure through **case-by-case administrative disposition without a standard rework state (Option B)**? Neither choice authorises dispatch of unapproved units or automatic refunds/cancellations.


## 2026-11-04 — Phase 2 Made to Order controlled quality failure recovery (Option A)

**OWNER-APPROVED / LOCKED:** A Made to Order physical unit that fails its separate per-unit quality inspection must enter an **explicit controlled rework/remake recovery path**, with its failed disposition retained in immutable history. Authorised staff record the corrective work or replacement linkage under the original released order-line manufacturing job, preserving unit identity/history and, where remade, traceability between superseded and replacement physical units. Rework/remake does not erase or override a failed inspection and cannot itself make a unit fulfilment-eligible. **A fresh authorised per-unit quality inspection and passing disposition are mandatory** before a corrected/remade unit may be handed to fulfilment. Previously accepted units retain their approvals. Preserve the separate manufacturing-completion and quality milestones; specific corrective-work steps, approval roles, repeated-failure escalation and customer communications remain later design/policy work. Do not infer partial shipment permission, automatic refund/cancellation, additional production release, or bypass of existing full verified payment, readiness, atomic/idempotent release and immutable audit controls. Preserve one authoritative job per released order line, automatic activation, accountable owner and collaborative progress, Ready Stock Administrator-only return-policy controls, statutory protections, WEB-018/WEB-038 DEFERRED, Quote Only/coupons OPEN, and WEB-040N two customer-facing price components.

**Next single major functional boundary (OPEN):** For a Made to Order line with multiple units, may **individually quality-approved units be handed to fulfilment before all units on that line pass (Option A)**, or must **all ordered units pass quality before any line-level fulfilment handover (Option B)**? This addresses internal fulfilment handover only; partial customer dispatch/shipment remains a separate unapproved boundary.


## 2026-11-04 — Phase 2 Made to Order complete-line fulfilment handover (Option B)

**OWNER-APPROVED / LOCKED:** A Made to Order order line, represented by one authoritative manufacturing job, is **not eligible for any internal fulfilment-custody handover until every ordered physical unit on that line has a current passing quality disposition** after separate manufacturing completion. Per-unit quality outcomes remain independently tracked and accepted units retain approval if another unit fails, but **no subset of approved units may be handed to fulfilment** while any unit on that line remains failed, under rework/remake, uninspected or otherwise unapproved. Following successful rework/remake and mandatory reinspection, the complete line becomes eligible for controlled handover; this does not itself approve dispatch, partial order shipment, or automatic courier assignment. Preserve unit/job/order-line linkage and immutable quality, correction and handover audit. No change to one job per released order line, automatic activation upon authorised release, mandatory accountable owner before collaborative progress, separate manufacturing completion and per-unit quality review, verified full payment/readiness/release protections or WEB-042 audit controls. Preserve Ready Stock Administrator-only return-policy authority and statutory safeguards; WEB-018/WEB-038 DEFERRED, Quote Only/coupons OPEN, WEB-040N exactly two customer-facing price components.

**Next single major functional boundary (OPEN):** Once a Made to Order line is fully quality-approved, should its transfer into fulfilment custody require an **explicit authorised staff handover/receipt (Option A)**, or occur **automatically on the final passing unit-quality decision (Option B)**? This is internal custody transfer only, not customer shipment.


## 2026-11-04 — Phase 2 Made to Order explicit fulfilment custody handover and receipt (Option A)

**OWNER-APPROVED / LOCKED:** After separate manufacturing completion and current passing quality dispositions for **every physical unit of a Made to Order order line**, transfer from production custody to fulfilment custody requires an **explicit authorised staff handover and formal fulfilment receiving acknowledgement**. Quality approval or an initiated handover alone must not automatically change custody. Change authoritative custody only upon successful validated receipt, retaining linked job/order-line and unit coverage, identities of initiating and receiving actors, timestamps and immutable audit. A failed, incomplete, rejected or unacknowledged handover leaves custody with production; do not infer shipment, partial line transfer or courier assignment. Preserve one manufacturing job per released line, automatic activation on successful release, assigned accountable owner and collaborative progress, separate completion and per-unit quality review, controlled rework/remake/reinspection, complete-line handover gate, verified full payment/readiness/release protections, WEB-042 audit/concurrency safeguards, and all other locked rules. Ready Stock return-policy authority remains Administrator-only, statutory protections unchanged, WEB-018/WEB-038 DEFERRED, Quote Only/coupons OPEN, WEB-040N two customer-facing price components.

**Next single major functional boundary (OPEN):** For an order containing multiple Made to Order lines, may **each fully approved and formally received line proceed independently toward dispatch (Option A)**, or must **all Made to Order lines in that customer order be ready before any dispatch (Option B)**? This is the order-level shipment grouping rule; neither choice overrides the already locked complete-line custody gate or automatically decides mixed-mode Ready Stock/Quote Only treatment.


## 2026-11-04 — Phase 2 Made to Order consolidated multi-line dispatch (Option B)

**OWNER-APPROVED / LOCKED:** Where a customer order contains **multiple Made to Order order lines**, **no Made to Order line may be dispatched independently while another Made to Order line in the same order remains unready**. The complete set of Made to Order lines must each have finished manufacturing, received current passing per-unit quality dispositions for all ordered units, and completed the explicit authorised full-line production-to-fulfilment handover and receiving acknowledgement before any Made to Order dispatch can proceed. Finished lines may remain in fulfilment custody pending readiness of other lines. Preserve a consolidated Made to Order dispatch group and immutable readiness/dispatch audit; this decision does not bypass subsequent packing, dispatch authorisation, shipping or delivery controls, and does not determine mixed Ready Stock/Made to Order order grouping or Quote Only treatment. Preserve one job per released line, automatic job activation, assigned owner and collaborative progress, separate completion/quality, rework/remake and reinspection, complete-line custody and explicit receipt, verified payment/readiness/atomic release and WEB-042 controls. Preserve Ready Stock Administrator-only return-policy settings, statutory rights, WEB-018/WEB-038 DEFERRED, Quote Only/coupons OPEN and WEB-040N exactly two customer-facing price components; do not infer any new delivery charge.

**Next single major functional boundary (OPEN):** In a customer order containing both **Ready Stock and Made to Order** items, should **all eligible items be consolidated into one dispatch after the Made to Order items are ready (Option A)**, or should **Ready Stock items be eligible for earlier separate dispatch while Made to Order items remain consolidated with each other (Option B)**? Preserve existing purchase, stock, shipping-charge and payment decisions; no mixed-order dispatch policy is approved yet.


## 2026-11-04 — Phase 2 mixed Ready Stock / Made to Order consolidated dispatch (Option A)

**OWNER-APPROVED / LOCKED:** For a single customer order containing both **Ready Stock and Made to Order** purchasable lines, apply **one consolidated dispatch group for all items**: Ready Stock lines must not be dispatched earlier or separately merely because they are immediately available. Wait until all Made to Order lines complete manufacturing, every ordered physical unit has current passing quality disposition, and each complete Made to Order line has undergone explicit authorised handover with fulfilment receipt; all Ready Stock lines must also satisfy their independently locked reservation, stock, fulfilment and dispatch prerequisites. Only then may the combined order proceed through subsequent packing/dispatch authorisation and delivery controls. Disclose clearly before purchase that Ready Stock items in a mixed order wait for the longer Made to Order readiness/delivery timeline; do not silently promise immediate Ready Stock delivery. Preserve authoritative order-line identities, stock allocations, custody, shipment/readiness events and immutable audit. This is a consolidated-dispatch rule, **not** an approval to combine distinct parcels physically, override delivery-address or logistics restrictions, or bypass statutory/customer protections. No extra customer-facing charge: retain WEB-040N discounted tax-inclusive product component and one combined delivery charge if applicable. Do not resolve Quote Only eligibility, coupons, WEB-038 cart interaction or WEB-018 provider. Preserve all prior Made to Order job, payment/release, quality/rework, complete-line handover and multi-line consolidation decisions, Ready Stock Administrator-only return-policy controls and statutory rights.

**Next single major functional boundary (OPEN):** For consolidated orders containing Ready Stock and/or Made to Order items, should fulfilment require **an explicit authorised packing-completion and dispatch-readiness approval before carrier handover (Option A)**, or should **completion of packing automatically mark the order dispatch-ready without a separate approval (Option B)**? Neither option authorises shipment before all consolidated lines are eligible or decides carrier integration.


## 2026-11-04 — Phase 2 explicit packing completion and dispatch-readiness approval (Option A)

**OWNER-APPROVED / LOCKED:** For Ready Stock, Made to Order and consolidated mixed Ready Stock/Made to Order customer orders, **packing completion and dispatch-readiness approval are distinct operational milestones**. Authorised fulfilment staff must explicitly record packing completion after all applicable order-line, stock, quality and custody readiness prerequisites are satisfied. A **separate explicit authorised dispatch-readiness approval** is mandatory before any carrier handover or dispatch action; packing completion alone must never automatically mark the order dispatch-ready. Record the actual actor, timestamp, order/dispatch-group reference, approval status and immutable audit for each milestone; enforce authorisation and revalidate prerequisites server-side. This does not yet decide whether packing and approval must be performed by different individuals, the carrier integration method, parcel count, or proof of handover. Preserve consolidated dispatch for all Made to Order lines and mixed Ready Stock/Made to Order orders, complete-line quality/custody and formal receipt, payment/release and stock safeguards, statutory rights and Ready Stock Administrator-only return-policy authority. Preserve WEB-040N exactly two customer-facing price components; WEB-018/WEB-038 DEFERRED and Quote Only/coupons OPEN.

**Next single major functional boundary (OPEN):** After explicit dispatch-readiness approval, should an order be marked **dispatched only upon recorded physical carrier handover/acceptance (Option A)**, or **as soon as authorised staff initiate a shipping label/dispatch instruction (Option B)**? Neither option changes the prior packing/approval gate or decides specific logistics providers.


## 2026-11-04 — Phase 2 dispatch only upon confirmed physical carrier handover (Option A)

**OWNER-APPROVED / LOCKED:** For Ready Stock, Made to Order and consolidated mixed orders, the authoritative **Dispatched** milestone is permitted **only after physical carrier handover/acceptance is recorded with traceable evidence**, following separately recorded packing completion and explicit authorised dispatch-readiness approval. Shipping-label generation, pickup booking, carrier instruction, or internal readiness alone must **not** mark an order Dispatched or imply that goods left Tavistra custody. Validate order/dispatch-group eligibility and authorised handover evidence server-side; retain carrier/handover reference when available, actor/source, timestamp, linked order/group and immutable event history. Exact acceptable evidence formats, carrier integration, failure/reconciliation and customer notification mechanisms remain OPEN. Preserve consolidated dispatch across Made to Order lines and mixed Ready Stock/Made to Order orders, individual quality and rework controls, full-line custody handover, Ready Stock inventory/return-policy and statutory protections, WEB-040N two customer-facing price components, WEB-018/WEB-038 DEFERRED and Quote Only/coupons OPEN.

**Next single major functional boundary (OPEN):** For post-dispatch delivery status, should Tavistra mark an order **Delivered only upon verified proof of delivery from the carrier or an authorised documented delivery confirmation (Option A)**, or **automatically treat the carrier's unverified delivered-status signal as sufficient (Option B)**? Neither choice changes the existing Ready Stock confirmed-delivery return-window anchor or statutory rights.


## 2026-11-04 — Phase 2 verified delivery confirmation (Option A)

**OWNER-APPROVED / LOCKED:** For Ready Stock, Made to Order and consolidated mixed orders, mark an order **Delivered only upon verifiable carrier proof of delivery OR an authorised, documented delivery confirmation**. An unverified carrier status feed, estimated arrival, tracking event or customer-facing projection alone must not transition the authoritative order to Delivered. Validate the linked order/shipment and evidence, record the actual authoritative confirmed delivery calendar date in the published business timezone, evidence/reference, verification source, actual authorised confirming actor where applicable, timestamps and immutable audit; distinguish evidence capture from unsupported inferred delivery. Delivery confirmation must follow the previously locked physical carrier handover/Dispatched gate and must not rewrite prior events. Preserve the existing Ready Stock voluntary return-window calculation: confirmed delivery date is day zero, the next calendar date is day one, and eligible product-specific published N-day windows end at 23:59:59 on day N in the published business timezone; no implicit returnability and all statutory safeguards remain. Specific proof formats, dispute handling, carrier integrations and notification templates remain OPEN. Preserve consolidated dispatch, separate packing/dispatch approval, all Made to Order manufacturing/quality/custody decisions, Ready Stock Administrator-only return-policy configuration, WEB-040N two customer-facing price components, WEB-018/WEB-038 DEFERRED and Quote Only/coupons OPEN.

**Next single major functional boundary (OPEN):** When delivery is reported but credible evidence is missing or the customer disputes receipt, should Tavistra **retain a non-delivered exception state and require an authorised evidence-based resolution before any Delivered transition (Option A)**, or **provisionally mark Delivered while investigating, with later correction if needed (Option B)**? Preserve statutory safeguards and return-window anchoring; neither option decides carrier-provider integration.


## 2026-11-04 — Phase 2 provisional Delivered status during delivery exceptions/disputes (Option B)

**OWNER-APPROVED / LOCKED WITH PRIOR-GATE RECONCILIATION:** When a carrier reports delivery but reliable proof is missing or the customer disputes receipt, Tavistra may show a distinct, explicitly labelled **Delivered (Provisional)** status while an investigation remains open, with an authorised evidence-based correction/reconciliation path if the delivery claim is false. This is the owner's selected Option B rather than an outright non-delivered hold. **Provisional Delivered must never be conflated with the authoritative Verified Delivered milestone**, which under the previously locked delivery-confirmation decision still requires verifiable carrier proof of delivery or authorised documented delivery confirmation. Store provisional event, carrier report, disputed status, investigation owner/action, eventual resolution, actors, timestamps and immutable audit separately; preserve the prior Dispatched physical handover record. A provisional report does **not** establish the authoritative confirmed delivery calendar date, must not start/shorten/expire any Ready Stock voluntary return eligibility period or diminish statutory rights, and cannot automatically close customer complaints. Once acceptable evidence is obtained, confirm authoritative delivery and its actual evidenced delivery date, applying the already locked day-zero/day-N timezone policy; if disproved, correct provisional presentation and retain history. Exact customer-facing provisional wording, investigation deadlines, remedies and evidence criteria remain later decisions. Preserve all consolidated fulfilment, manufacturing/quality/custody, packing/dispatch and Ready Stock return-policy controls, Administrator-only return-policy authority, WEB-040N two price components, WEB-018/WEB-038 DEFERRED and Quote Only/coupons OPEN.

**Next single major functional boundary (OPEN):** When a delivery exception/dispute remains unresolved, should **Tavistra centrally manage carrier investigations and customer resolution through one linked support case with an accountable owner (Option A)**, or **leave carrier investigation in logistics and customer complaint handling in separate workflows with cross-references (Option B)**? Both preserve provisional-versus-verified delivery distinction and immutable evidence.


## 2026-11-04 — Phase 2 unified delivery dispute case ownership (Option A)

**OWNER-APPROVED / LOCKED:** Every delivery exception or customer-disputed receipt must be managed through **one authoritative support case linked to the affected customer order/shipment and delivery events**, with **one explicitly assigned accountable case owner** responsible for coordinating the investigation and customer resolution. Carrier/logistics investigation, supporting evidence, customer contacts, decisions, corrective actions and final case disposition must be linked to that case, with role-appropriate contributions and immutable actor/timestamp audit. Logistics may investigate and contribute, but separate uncoordinated carrier and customer-support workflows must not become competing sources of truth; case ownership does not automatically grant operational permissions outside assigned roles. The case must remain open until an authorised documented resolution; a carrier Delivered signal or provisional presentation alone cannot close it. Preserve the prior **Delivered (Provisional)** vs **Verified Delivered** distinction and evidence gate, including the rule that provisional status does not establish the authoritative confirmed delivery date or start/shorten Ready Stock return eligibility. Exact case SLAs, escalation triggers, customer notification cadence, remedy authorisations and proof standards remain OPEN. Preserve all existing Ready Stock, Made to Order, consolidated dispatch, quality, custody, packing, carrier handover, statutory, audit and pricing decisions; Ready Stock return-policy administration remains Administrator-only; WEB-018/WEB-038 DEFERRED, Quote Only/coupons OPEN, WEB-040N exactly two customer-facing price components.

**Next single major functional boundary (OPEN):** For a unified delivery dispute case, should **the accountable case owner coordinate an explicit authorised final resolution before the case can close (Option A)**, or **allow automatic closure when the carrier or logistics subsystem posts a resolved status (Option B)**? Neither choice weakens delivery verification, return-window safeguards or statutory remedies.


## 2026-11-04 — Phase 2 explicit authorised delivery dispute resolution and closure (Option A)

**OWNER-APPROVED / LOCKED:** A unified delivery dispute support case may be **closed only through an explicit authorised staff closure action** after its single accountable case owner has coordinated a documented final customer-resolution outcome, evidence review and completion or appropriately documented disposition of required corrective actions. A carrier/logistics **Resolved** signal, provisional Delivered status, or verified delivery event alone must **never automatically close** the customer support case. Validate closure authority and mandatory case prerequisites server-side; preserve case-to-order/shipment links, actual closure actor, case owner, resolution and evidence references, corrective actions, timestamps and immutable event/audit history. This does not require that the case owner and closing authorised staff be different people, nor does it authorise any particular refund, replacement or compensation outside independently applicable rules. Preserve the verified-vs-provisional delivery distinction, authoritative confirmed-delivery evidence/date and Ready Stock return-window safeguards, statutory rights, all previous fulfilment/manufacturing/quality/dispatch decisions, Administrator-only Ready Stock return-policy settings, WEB-040N two price components, WEB-018/WEB-038 DEFERRED, Quote Only/coupons OPEN.

**Next single major functional boundary (OPEN):** If a closed delivery dispute receives **material new evidence or a renewed customer challenge**, should Tavistra **reopen the same linked case with a new audited investigation cycle (Option A)**, or **create a new linked follow-up case while leaving the original closed (Option B)**? Neither choice rewrites immutable history or changes delivery verification rules.


## 2026-11-04 — Phase 2 reopen original resolved delivery dispute case (Option A)

**OWNER-APPROVED / LOCKED:** Where material new delivery evidence or a renewed customer challenge arises after authorised closure of a unified delivery dispute, **reopen the original authoritative support case** with a **new separately identifiable and auditable investigation cycle**, rather than generating an independent replacement case. Preserve the prior investigation, decision, resolution, closure, evidence and immutable audit without overwriting them. Record the reopening trigger/reason, actor, timestamp, cycle identity and links to new evidence; restore an explicitly accountable case owner, auditing any owner reassignment. Subsequent closure requires a new documented resolution and explicit authorised closure under the already locked case-closure gate; carrier signals cannot close the case. Reopening alone must not automatically reverse Verified Delivered status, invent an authoritative delivery date, start/shorten Ready Stock return eligibility, refund, replace or compensate; those remain subject to separate existing controls and statutory rights. Preserve provisional-vs-verified delivery, carrier handover, consolidated dispatch, all Made to Order quality/custody and Ready Stock policies, Administrator-only return-policy authority, WEB-040N two price components, WEB-018/WEB-038 DEFERRED and Quote Only/coupons OPEN.

**Next single major functional boundary (OPEN):** When a delivery dispute investigation establishes **confirmed non-delivery or loss**, should Tavistra **route the case into a formal customer-remedy workflow with authorised replacement/refund decision and tracked execution (Option A)**, or **close the investigation with a documented finding and handle any remedy through separate ad hoc processes (Option B)**? Neither option pre-approves a refund or replacement or limits statutory remedies.


## 2026-11-04 — Phase 2 formal customer-remedy workflow for confirmed non-delivery/loss (Option A)

**OWNER-APPROVED / LOCKED:** When an authorised delivery dispute investigation establishes **confirmed non-delivery or shipment loss**, record the evidenced finding in the existing unified support case and **open a formally linked, auditable customer-remedy workflow**. Authorised personnel must assess and approve the appropriate legally/policy-permitted remedy (which may include refund, replacement or another lawful resolution) before execution; track the selected remedy, responsible actors, authorisations, customer communications, execution status and immutable history through completion. **No refund, replacement, new manufacturing release or financial adjustment is automatically approved by the finding alone.** Required remedy actions must be completed or lawfully and explicitly resolved before the underlying delivery dispute may receive its separately required authorised final closure. Maintain one accountable case owner and preserve case reopen cycles; reconcile any provisional Delivered presentation and any disputed verified-delivery record through the existing authorised evidence/correction controls, without rewriting audit or falsely anchoring Ready Stock return windows. Preserve statutory consumer rights, existing payment/stock/fulfilment/quality/return protections, Administrator-only Ready Stock return-policy settings, consolidated dispatch, WEB-040N two customer-facing price components, WEB-018/WEB-038 DEFERRED and Quote Only/coupons OPEN. Specific remedy eligibility, monetary authority thresholds, replacement production and refund execution rules remain OPEN.

**Next single major functional boundary (OPEN):** For a **replacement approved as the remedy for confirmed non-delivery**, should Tavistra **create a separately traceable no-new-charge replacement fulfilment obligation linked to the original order and case (Option A)**, or **modify/reopen the original dispatched order lines as if their first fulfilment had not occurred (Option B)**? Neither option automatically grants replacement or changes the original financial ledger.


## 2026-11-04 — Phase 2 separately linked replacement fulfilment after confirmed non-delivery (Option A)

**OWNER-APPROVED / LOCKED:** When a customer-remedy workflow has **explicitly authorised a replacement for confirmed non-delivery/loss**, create a **separate, uniquely traceable replacement fulfilment obligation**, linked to the original customer order, affected original order lines/shipment, and the authoritative unified delivery-dispute/remedy case. **Do not reopen, overwrite or falsify the original dispatched order lines, shipment events or financial/payment ledger**. The approved replacement carries **no additional customer charge**; it is a remedy, not a new purchase or a fresh payment obligation. Track its own required stock allocation or manufacturing execution, quality/custody prerequisites where applicable, packing, dispatch authorisation, physical carrier handover, verified delivery and immutable audit, reusing existing relevant safety gates without assuming the original production release can be replayed or bypassed. Authorised approval is mandatory before replacement creation; avoid duplicate replacement obligations through idempotency/concurrency protection. Exact replacement production-release authority, original-order grouping versus replacement shipment grouping, and accounting/tax documentation are OPEN and must not be inferred. Preserve statutory consumer rights, consolidated dispatch rules for ordinary purchased orders, Ready Stock Administrator-only return-policy settings, WEB-040N exactly two customer-facing price components, WEB-018/WEB-038 DEFERRED, Quote Only/coupons OPEN and all previous decisions.

**Next single major functional boundary (OPEN):** For an **authorised Made to Order replacement** arising from confirmed non-delivery, should Tavistra require **a fresh, explicitly authorised replacement-production release with its own readiness/quality audit but without another customer payment (Option A)**, or **automatically initiate replacement manufacturing as soon as the remedy is approved (Option B)**? Neither choice modifies the original manufacturing job or financial ledger.


## 2026-11-04 — Phase 2 automatic Made to Order replacement manufacturing on authorised remedy (Option B)

**OWNER-APPROVED / LOCKED:** When the authoritative customer-remedy workflow **explicitly approves a no-new-charge Made to Order replacement** for confirmed non-delivery/loss, the system must **automatically create and activate a separately traceable replacement manufacturing job** linked to the approved replacement fulfilment obligation, original order/line and dispute case. **No second manual production-release action** and **no additional customer payment** are required for this remedy-authorised replacement. The authorised remedy approval is the distinct initiating authority for this replacement job; do not reuse or replay the original ordinary-sale production-release event or mutate the original manufacturing job, dispatch record, order lines or financial ledger. Enforce backend authorisation, approval validity, idempotency/concurrency and atomic job/obligation linkage to prevent duplicate or orphan replacement jobs. Automatic activation does not assert that physical workshop work has begun: require an accountable owner assignment before authorised staff may record progress; preserve separate completion attestation, per-unit quality inspection, controlled rework/remake and mandatory reinspection, complete-line quality gate, explicit fulfilment custody receipt, packing and dispatch authorisation, physical carrier handover, verified/provisional delivery rules and immutable actor/event audit. Preserve statutory rights, Ready Stock Administrator-only return-policy settings, consolidated purchased-order dispatch, WEB-040N two customer-facing price components, WEB-018/WEB-038 DEFERRED, Quote Only/coupons OPEN. Replacement shipment grouping and remedy cancellation/reversal controls remain OPEN.

**Next single major functional boundary (OPEN):** Once a no-charge replacement is authorised and created, should its fulfilment and dispatch **proceed independently of any other outstanding items on the original customer order (Option A)**, or **remain grouped with any still-pending original-order fulfilment until all are ready (Option B)**? Neither choice bypasses replacement quality/custody/dispatch gates or adds a customer charge.


## 2026-11-04 — Phase 2 independent shipment grouping for approved replacements (Option A)

**OWNER-APPROVED / LOCKED:** An **authorised, separately traceable, no-new-customer-charge replacement fulfilment obligation** created as a remedy for confirmed non-delivery/loss must be **fulfilled and dispatched independently of any still-outstanding original customer-order items**. Once the replacement itself has satisfied applicable manufacturing, per-unit quality, complete replacement-line readiness, explicit fulfilment custody receipt, packing completion, distinct dispatch-readiness authorisation and physical carrier handover controls, it may dispatch without waiting for other Ready Stock or Made to Order items from the original purchased order. Maintain its own shipment, carrier evidence, delivery verification, customer updates and immutable audit, with links to the original order/line and unified dispute/remedy case. This is a **narrow replacement-remedy exception** and does **not** change the locked consolidated dispatch rule for ordinary mixed or multi-line purchased orders, authorise splitting an individual replacement line before its complete-line quality gate, introduce new customer charges, or alter original order/payment/shipment records. Preserve all previous statutory, return-policy, production and audit safeguards, WEB-040N two price components, WEB-018/WEB-038 DEFERRED and Quote Only/coupons OPEN.

**Next single major functional boundary (OPEN):** If **new evidence invalidates an already-approved replacement remedy while replacement fulfilment is in progress**, should Tavistra require **a controlled authorised remedy-reversal review with execution-stage safeguards and full audit (Option A)**, or **permit the case owner to cancel the replacement directly at any stage (Option B)**? Neither choice permits rewriting original records or automatic reversal of completed physical shipment.


## 2026-11-04 — Phase 2 direct case-owner reversal of approved replacement remedies (Option B)

**OWNER-APPROVED / LOCKED:** If material new evidence invalidates an already approved no-charge replacement remedy, the **currently accountable unified delivery-dispute case owner may directly issue the replacement cancellation/reversal decision**, with a mandatory documented reason and immutable actor/time/evidence audit, **without a separate pre-cancellation remedy-reversal review or additional approval gate**. The backend must authenticate case ownership and enforce execution-state consistency and pre-existing legal/operational protections. **Before physical carrier handover**, immediately stop any further replacement execution/dispatch, recording safe workshop, stock, quality and custody disposition rather than silently erasing work. **After carrier handover**, do not pretend a physical shipment has been cancelled: record the case-owner cancellation decision and route any interception, return-to-sender or recovery action through the applicable operational process and evidence, without changing the historical handover event. **After verified delivery**, preserve delivered history and handle any permissible recovery through a separately authorised process; do not auto-charge the customer, reclaim goods, or retroactively revoke statutory rights. Direct case-owner authority does not grant unrelated stock, manufacturing, carrier, payment, refund or customer-charge permissions. Preserve original order and financial records, immutable audit, no-new-charge replacement rule, independent replacement dispatch, ordinary-order consolidation, verified/provisional delivery distinction, Ready Stock return policy Administrator-only controls, WEB-040N two customer-facing price components, WEB-018/WEB-038 DEFERRED and Quote Only/coupons OPEN.

**Next single major functional boundary (OPEN):** For **customer-visible tracking of original orders and their remedy replacements**, should Tavistra provide **one unified order timeline with clearly distinct original-shipment, dispute, and replacement fulfilment events (Option A)**, or **show replacement progress only in a separate support-case view without integrating it into the order timeline (Option B)**? Both preserve independent immutable operational records and privacy controls.


## 2026-11-04 — Phase 2 separate customer-facing support-case tracking for replacement remedies (Option B)

**OWNER-APPROVED / LOCKED:** Keep the **original customer order timeline focused on the original purchased-order fulfilment and delivery history**, without merging replacement production, remedy or replacement shipment events into that order timeline. Instead expose the **customer-visible delivery-dispute and replacement remedy progress through a separate authenticated support-case view**, including relevant case status, approved remedy, replacement production/fulfilment milestones and its independent carrier/delivery tracking as appropriate for customers. Maintain authoritative internal links between original order/line, original shipment, unified dispute case, remedy decision and separately traceable replacement obligation/shipment, with role- and customer-appropriate access controls and immutable operational audit. Do not fabricate a second purchase, change original payment/price components, or suppress required customer communications; provide an intelligible path to the linked support case from appropriate customer service surfaces without inserting replacement milestones into the original order timeline. Preserve prior case ownership, authorised closure/reopen, direct case-owner cancellation subject to physical execution safeguards, automatic remedy-authorised Made to Order replacement manufacturing, independent replacement dispatch, ordinary-order consolidated dispatch, verified/provisional delivery distinction, statutory rights, Administrator-only Ready Stock return-policy authority, WEB-040N exactly two price components, WEB-018/WEB-038 DEFERRED and Quote Only/coupons OPEN.

**Next single major functional boundary (OPEN):** For **customer-initiated post-purchase service requests** (delivery issues, damage, defects, eligible returns and other complaints), should Tavistra provide **one unified customer support entry point that routes requests to the appropriate governed workflow (Option A)**, or **separate customer entry points for delivery disputes, returns and product complaints (Option B)**? Existing policy and authorisation rules remain independent in either design.


## 2026-11-04 — Phase 2 unified customer post-purchase support entry point (Option A)

**OWNER-APPROVED / LOCKED:** Provide **one discoverable, customer-facing post-purchase support entry point** for order-linked delivery issues, damage, defects, return requests where eligible, and other customer complaints. Capture the customer's issue category and relevant order/item/shipment context, then **route to the appropriate governed backend workflow** (including unified delivery dispute cases, authorised remedies and existing Ready Stock return controls). A common entry point **does not merge underlying workflow states, eligibility rules, case ownership, staff permissions or approval/execution gates**, and must not imply that a non-returnable product lacks statutory remedies for defects or non-delivery. Avoid creating duplicate competing cases for the same incident through linked case discovery and audited routing; keep customer-facing status and communication coherent and enforce authenticated/authorised access to customer records. Preserve the previously locked separate customer-facing support-case tracking for replacement progress rather than inserting replacement milestones into the original order timeline. Preserve statutory rights, Administrator-only Ready Stock return-policy configuration, verified/provisional delivery and return-window protections, independent replacement dispatch, ordinary purchased-order consolidation, WEB-040N two customer-facing price components, WEB-018/WEB-038 DEFERRED and Quote Only/coupons OPEN. Exact intake form fields, triage automation and SLAs remain OPEN.

**Next single major functional boundary (OPEN):** When a customer submits a post-purchase support request, should Tavistra **automatically classify and route it using order/item context while allowing audited staff correction (Option A)**, or **require staff to manually triage and assign every incoming request before its workflow begins (Option B)**? Both preserve eligibility, statutory safeguards and authorised case ownership.


## 2026-11-04 — Phase 2 automatic post-purchase support classification and routing (Option A)

**OWNER-APPROVED / LOCKED:** On submission through Tavistra's unified customer post-purchase support entry point, **automatically classify and route** each request using the customer's stated issue category and available authoritative order, item, shipment and delivery context to its correct governed workflow, without requiring mandatory manual triage of every request. **Ambiguous, contradictory or insufficiently supported classifications must enter an accountable staff-review queue rather than silently guessing or denying a claim.** Authorised staff may correct routing/classification with a mandatory reason and immutable record of the original classification, changes, actors, timestamps and linked case/workflow identity. Protect against duplicate competing cases for the same incident, preserve a clearly accountable owner where the destination workflow requires one, and prevent automatic routing from bypassing return eligibility, statutory remedies, refund/replacement authorisation, delivery evidence gates, manufacturing/fulfilment safeguards or customer access controls. No automated classification alone authorises a financial or physical remedy. Preserve separate customer-facing support-case tracking for replacement fulfilment, Administrator-only Ready Stock return-policy configuration, independent replacement dispatch, consolidated ordinary-order dispatch, WEB-040N exactly two price components, WEB-018/WEB-038 DEFERRED and Quote Only/coupons OPEN.

**Next single major functional boundary (OPEN):** For **customer service cases that involve multiple issue categories in the same order** (for example delivery damage plus a product defect), should Tavistra **keep one customer-visible parent support case with linked specialised workstreams (Option A)**, or **create separate independent customer-visible cases for each category (Option B)**? Each specialised workstream retains its own eligibility, approvals and audit requirements.


## 2026-11-04 — Phase 2 separate customer-visible support cases for distinct issue categories (Option B)

**OWNER-APPROVED / LOCKED:** When one customer order presents **multiple distinct post-purchase issue categories** (e.g. delivery damage and a separate product defect), create **separate independent customer-visible support cases per distinct issue category**, each with its own case identifier, accountable owner, classification, communications, governed workflow, resolution/closure/reopen lifecycle and immutable audit. Do not introduce a mandatory customer-visible parent case combining the categories. Internally link the cases to the same authoritative order, affected item/shipment and one another as relevant; surface clear case references in the unified support area without merging case histories. The automatic intake classification/routing decision still applies; ambiguous categories go to accountable staff review and authorised reclassification is audited. Deduplicate repeat submissions of the **same incident/category** rather than creating parallel competing cases. Coordinate remedy commitments and execution across linked cases to prevent duplicate refunds, replacements, inventory adjustments or contradictory delivery findings, without weakening each case's own statutory eligibility and permission gates. Preserve the separate customer-facing replacement progress within its associated support case, not the original order timeline, as well as all previous delivery, manufacturing, return-policy, audit, WEB-040N pricing, WEB-018/WEB-038 DEFERRED and Quote Only/coupons OPEN decisions.

**Next single major functional boundary (OPEN):** When **separate issue-category cases for the same order propose overlapping remedies** (such as both a damage case and defect case requesting replacement of the same unit), should Tavistra enforce **one order/item-level remedy coordination gate that detects conflicts before any remedy approval/execution (Option A)**, or **let each case independently approve remedies and reconcile duplicates afterwards (Option B)**? This does not pre-approve remedies or change existing authority rules.


## 2026-11-04 — Phase 2 centralised order/item-level customer remedy coordination (Option A)

**OWNER-APPROVED / LOCKED:** Across independently owned support cases for the same purchased order, Tavistra must enforce **one authoritative order/item-level remedy coordination gate** before any overlapping remedy **approval or execution**. Consult pending, approved, executing, completed and reversed remedy obligations against the affected order, original line and identifiable physical unit or quantity, with case links and a concurrency-safe/idempotent reservation or conflict check to prevent races. **Block duplicate or incompatible refunds, replacements, financial adjustments and inventory/fulfilment actions** until an appropriately authorised documented conflict resolution; do not automatically deny valid independent claims or diminish statutory consumer rights. Maintain separate customer-visible issue-category cases and each case's existing accountable owner, workflow, communications, remedy authority, explicit closure/reopen and immutable audit. Audit detected overlaps, evidence, authorising actor, decision, timestamps and links to resulting obligations; preserve the original order/payment/shipment ledger and no-new-charge replacement rules. Preserve separate support-case replacement tracking, automatic remedy-authorised Made to Order manufacturing, independent replacement dispatch, ordinary purchased-order consolidation, Ready Stock Administrator-only return-policy configuration, verified/provisional delivery and return-window protections, WEB-040N two customer-facing price components, WEB-018/WEB-038 DEFERRED and Quote Only/coupons OPEN.

**Next single major functional boundary (OPEN):** For **customer-initiated post-purchase claims involving damaged or defective goods**, should Tavistra use **one standard evidence-and-inspection workflow shared across Ready Stock and Made to Order, with product-specific eligibility and remedies applied within it (Option A)**, or **separate damage/defect investigation workflows for each fulfilment model (Option B)**? Both preserve statutory protections and the independent return-policy controls.


## 2026-11-04 — Phase 2 unified damage and defect evidence/inspection workflow (Option A)

**OWNER-APPROVED / LOCKED:** Customer-reported **damage and product defects** for both **Ready Stock and Made to Order** must use **one common governed claim-investigation framework** for intake linkage, customer-submitted evidence, assessment, physical or remote inspection where appropriate, documented findings, case communications and authorised resolution. The common framework may use product- and incident-specific evidence/inspection requirements, and must retain traceability to order, item/unit, original shipment, Made to Order manufacturing/quality history where relevant and any related issue-category support case. **A common investigation does not unify or override commercial eligibility or remedies:** enforce each product's purchase-time policy snapshot, the Ready Stock default non-returnable rule for voluntary returns, Administrator-only return-policy publication controls, and all independent statutory rights for damaged, defective, misdescribed or undelivered goods. Do not automatically reject a damage/defect claim because voluntary return eligibility is absent; do not automatically authorise return, replacement, refund or manufacturing. Use the locked order/item-level remedy conflict gate before approval/execution, preserve separate customer-visible cases for distinct issue categories, accountable case ownership, evidence and immutable audit, explicit authorised closure/reopening, no-new-charge remedy replacement controls, verified/provisional delivery safeguards, WEB-040N two customer-facing price components, WEB-018/WEB-038 DEFERRED and Quote Only/coupons OPEN. Exact evidence minimums, remote vs physical inspection thresholds and remedy matrices remain OPEN.

**Next single major functional boundary (OPEN):** For damage/defect claims, should Tavistra **permit an authorised evidence-based resolution without physically receiving the product when evidence is sufficient (Option A)**, or **require physical product receipt and inspection before any remedy decision (Option B)**? Both preserve documented evidence, authorised remedy gates and statutory rights.


## 2026-11-04 — Phase 2 evidence-based remote damage/defect resolution without mandatory physical receipt (Option A)

**OWNER-APPROVED / LOCKED:** Within the shared Ready Stock/Made to Order damage-and-defect claim framework, **authorised staff may assess and approve an appropriate legally and policy-permitted remedy based on sufficient credible remote evidence without requiring Tavistra first to receive and physically inspect the affected product in every case**. Record evidence references (such as customer photos/video, descriptions, shipment and production/quality records), assessment rationale, actual assessor/authoriser, timestamps, whether physical inspection was waived and immutable audit. **When evidence is insufficient, inconsistent or the circumstances reasonably require it, route to physical receipt/inspection or additional evidence before the substantive decision**; do not silently assume fault or deny statutory rights because remote evidence is unavailable. Remote approval still requires existing eligibility/authority checks and the order/item-level remedy-conflict gate; it does not itself authorise refund execution, no-charge replacement production, collection, disposal or inventory adjustment. Preserve independent issue-category support cases, explicit closure/reopen, purchase-time Ready Stock policy snapshots and default non-returnability for voluntary returns, Administrator-only policy settings, statutory damage/defect remedies, verified/provisional delivery safeguards, WEB-040N two customer-facing price components, WEB-018/WEB-038 DEFERRED and Quote Only/coupons OPEN. Exact remote evidence sufficiency standards, inspection triggers and collection/disposition rules remain OPEN.

**Next single major functional boundary (OPEN):** When a damage/defect remedy is approved **without physical product return**, should Tavistra **explicitly record an authorised keep/dispose/collection disposition for the affected item before closing the claim (Option A)**, or **allow claim closure without any item-disposition decision unless a physical return is requested (Option B)**? Neither choice creates automatic ownership transfer, collection or customer disposal obligations.


## 2026-11-04 — Phase 2 mandatory damaged/defective item disposition after remote remedy resolution (Option A)

**OWNER-APPROVED / LOCKED:** Where a damage/defect claim is resolved using sufficient remote evidence **without physical receipt of the affected product**, require an **explicit authorised item-disposition decision before final support-case closure**. Record the affected order/line/unit, whether the customer may retain the item, collection is required, or another lawful disposition applies, with reason, responsible authorising actor, timestamp, evidence, customer-facing instructions, linked remedy and immutable audit. If the selected disposition entails collection, recovery or other operational actions, track and resolve those obligations or document their authorised lawful disposition before case closure; do not assume that a decision alone completes physical work. This is a case-closure prerequisite, not an automatic condition delaying a legally due refund or other remedy beyond applicable rights. Do not auto-transfer ownership, require unlawful disposal, create new customer charges, or adjust inventory without independently authorised controls. Preserve remote evidence-based decisions, shared Ready Stock/Made to Order damage/defect investigation, separate issue-category support cases, order/item-level remedy coordination, explicit authorised case closure/reopen, statutory protections, Administrator-only Ready Stock return-policy configuration, original shipment and replacement histories, WEB-040N two customer-facing price components, WEB-018/WEB-038 DEFERRED and Quote Only/coupons OPEN.

**Next single major functional boundary (OPEN):** When an approved damage/defect remedy requires **physical collection of the customer's product**, should Tavistra manage collection as **a tracked reverse-logistics workflow with pickup, custody, receipt and final disposition evidence (Option A)**, or **coordinate collection informally through support notes and carrier references without a dedicated reverse-logistics lifecycle (Option B)**? Both preserve authorised disposition, statutory rights and existing refund/replacement gates.


## 2026-11-04 — Phase 2 formal customer product collection and reverse logistics (Option A)

**OWNER-APPROVED / LOCKED:** Where an authorised damage/defect remedy or disposition requires physical collection of the affected customer-held product, create a **separately traceable, governed reverse-logistics obligation** linked to the original order/line/unit, appropriate independent issue-category support case, remedy and authorised collection disposition. Track collection approval, pickup scheduling, **verified physical pickup and carrier custody** (not merely a booking), transit and exceptions, **verified receiving-location handover and warehouse receipt** (not merely an unverified carrier Delivered scan), received item identity/quantity/condition, inspection where applicable, and explicit authorised final disposition. Preserve an immutable actor/time/evidence/custody audit and customer-facing case updates. The receiving inventory must remain non-sellable/quarantined pending the separately governed inspection and disposition decision; no automatic resale, stock adjustment, refund, replacement, disposal, ownership transfer or customer charge from a collection event alone. Any collection failure or discrepancy remains actionable and linked to the case, with legally required remedies not improperly delayed by logistics. Preserve remote-evidence resolution and mandatory item disposition where applicable, unified damage/defect assessment across Ready Stock and Made to Order, distinct customer-visible issue-category cases, central remedy conflict prevention, authorised case closure/reopen, statutory protections, Administrator-only Ready Stock return-policy settings, WEB-040N two customer-facing price components, WEB-018/WEB-038 DEFERRED and Quote Only/coupons OPEN.

**Next single major functional boundary (OPEN):** Once a collected product is **verified received**, should Tavistra require **an authorised inspection-and-disposition decision before it can re-enter sellable stock, be assigned to rework or be disposed of (Option A)**, or **automatically return eligible received units to available inventory based on the original claim category (Option B)**? Both preserve immutable custody and statutory safeguards.


## 2026-11-04 — Phase 2 mandatory inspection and authorised disposition of collected goods (Option A)

**OWNER-APPROVED / LOCKED:** After a customer-collected product is **verified physically received** through the governed reverse-logistics workflow, keep its identified units/quantities **quarantined and non-sellable** until an **authorised inspection and explicit disposition decision** is recorded. Inspection must document received identity, condition, evidence, actor and timestamp, and the authorised outcome may be sellable-stock reinstatement **only where the item meets all applicable quality, product and inventory eligibility gates**, controlled rework/repair, lawful disposal or another permitted disposition. **No automatic stock reinstatement from receipt or complaint category**, and no automatic rework or disposal merely from a warehouse scan. Any physical movement, stock adjustment or workshop job must be executed through its own authorised and auditable controls; a disposition approval alone is not proof that physical execution occurred. Preserve custody chain, immutable audit, links to original order/item, separate issue-category support case and customer remedy, and do not delay legally due customer remedies solely to complete internal inventory processing. Preserve statutory rights, Ready Stock default non-returnability for voluntary returns and Administrator-only return-policy settings, Made to Order quality controls, central remedy coordination, authorised case closure/reopen, WEB-040N two price components, WEB-018/WEB-038 DEFERRED and Quote Only/coupons OPEN.

**Next single major functional boundary (OPEN):** When inspected collected goods are **approved for rework/repair**, should Tavistra create **a separately traceable corrective-work job linked to the original unit, inspection and support case (Option A)**, or **record repair work as notes within the reverse-logistics record without a distinct operational job (Option B)**? Neither option automatically returns repaired goods to sellable stock or changes the customer's remedy.


## 2026-11-04 — Phase 2 dedicated corrective-work jobs for collected products (Option A)

**OWNER-APPROVED / LOCKED:** When an inspected, verified-received customer-collected unit is explicitly authorised for repair/rework, create a **distinct auditable corrective-work job** tied to its original order/line/identifiable unit, reverse-logistics custody and receipt, inspection/disposition approval, and associated issue-category support case. Require an accountable assigned job owner before recording execution; document approved scope, work performed, progress, materials/stock movements as applicable, contributors, exceptions, completion and **separate authorised post-work quality verification**. Preserve immutable event history and traceability; avoid conflating a customer-remedy replacement manufacturing job with a rework job on a collected physical unit. **Do not automatically mark the unit sellable, return it to inventory, dispatch it, or alter/withhold a customer remedy merely because corrective work is completed**: retain quarantine until quality and separately authorised final inventory/disposition release gates are met. Preserve Made to Order manufacturing/quality controls where relevant, central order/item remedy coordination, statutory rights, separate customer-facing support cases, physical reverse-logistics custody, Ready Stock policy protections, WEB-040N two price components, WEB-018/WEB-038 DEFERRED and Quote Only/coupons OPEN.

**Next single major functional boundary (OPEN):** After a collected product's corrective-work job passes post-work quality verification, should Tavistra **require a separate authorised inventory-release/disposition confirmation before it becomes sellable or otherwise leaves quarantine (Option A)**, or **automatically release it to the approved disposition when the quality pass is recorded (Option B)**? Neither changes customer remedy commitments or statutory protections.


## 2026-11-04 — Phase 2 Quote Only workflow and Made to Order 25%/75% payment milestones (Option B)

**OWNER-APPROVED / LOCKED — EXPLICIT SUPERSESSION OF WEB-040AK PAYMENT THRESHOLD:** Replace the prior WEB-040AK rule requiring **verified 100% payment before ordinary Made to Order production release** with **verified receipt of at least 25% of the authoritative agreed order total as the production-payment eligibility threshold for all ordinary Made to Order products, including Quote Only products fulfilled as Made to Order**. The balance of the authoritative order total must be **verified fully paid (100% cumulative) before dispatch eligibility**. This is an explicit owner-approved change to the earlier full-prepayment rule, not a silent reinterpretation. Preserve all **non-payment** production gates: irreversible readiness attestation, appropriately permissioned staff manual production release, existing scope/idempotency/rejected-attempt audit, manufacturing job ownership, quality checks, packing, custody and physical carrier handover. A successful 25% payment does **not** automatically release or start production. Pending, failed, unverifiable or duplicate payment signals do not count as verified funds; record payments and outstanding balance in an auditable order ledger and prevent double collection. Standard Ready Stock payment and allocation rules remain unchanged.

**OWNER-APPROVED / LOCKED — QUOTE ONLY CUSTOMER JOURNEY:** (1) A customer submits a Quote Only product enquiry via the website; no immediate ordinary cart checkout is assumed. (2) Staff contact the customer to discuss product options, customisation, requirements, commercial terms and a **tentative** timeline. (3) Staff issue a formal quote email recording agreed specifications/options, authoritative total quoted amount, tentative timeline and a secure payment link for **25% of the total**. (4) Only **verified successful receipt** of that 25% advance confirms the quoted order and makes it eligible for the separately controlled production-release process; an enquiry, email or unpaid accepted quote alone is not a confirmed order. (5) After authorised production, completion and required quality approval, staff may update the order status and send the customer a completion email containing product photographs, the QC report and a secure link for the **remaining 75%**. (6) Only after the **remaining balance is verified paid in full** may fulfilment proceed to packing/dispatch under all existing operational gates; payment does not itself mark the order Dispatched. Maintain immutable links among enquiry, quote/version, customer agreement, order, both payment milestones, production/quality records, notifications and shipment. Preserve WEB-040N's exactly two customer-facing price components (discounted tax-inclusive product amount plus one combined delivery charge if applicable), and do not assume the quote email is exempt from clearly communicating that breakdown. The precise quote revision/expiry and acceptance method, scope of payment link settlement/failure recovery, payment-provider selection WEB-018, and coupon treatment remain OPEN. WEB-038 cart interaction remains DEFERRED. This locks Quote Only's enquiry-first pathway and payment milestones without deciding mixed-cart participation.

**Next single major functional boundary (OPEN):** When staff revise a Quote Only quotation **after sending it but before verified 25% advance payment**, should Tavistra **issue a new versioned quotation and invalidate the previous quote's payment link (Option A)**, or **allow the original payment link to remain usable and reconcile the difference after payment (Option B)**? This must not alter any already confirmed order without its own governed change process.


## 2026-11-04 — Phase 2 Quote Only pre-advance quotation revision/version control (Option A)

**OWNER-APPROVED / LOCKED:** If staff revise a Quote Only quotation **after it was sent but before the authoritative verified 25% advance has been received**, issue a **new immutable, numbered/versioned quotation** with the revised agreed product specifications, customisation/options, customer-facing price breakdown and total, tentative timeline, issue details and linked secure **25%-of-current-total** advance-payment link. Explicitly supersede the old quotation and **invalidate its old payment link for new payment attempts**; never let an obsolete quotation or payment link confirm an order against stale commercial terms. Retain all earlier quotation versions, reasons/actors/timestamps, emails, customer communications and payment-link lifecycle in immutable audit, linked to the original enquiry and eventual order. A verified advance against the currently effective quotation is the order-confirmation/payment eligibility event, subject to existing reconciliation and authorised production-release gates. If an old payment attempt was already in flight, reconcile authoritative payment outcome before changing confirmation/collecting funds again; never silently discard a captured payment, charge twice, or treat a late success as acceptance of stale terms. Escalate such exceptions for staff-controlled customer communication and lawful refund/reconciliation. **This policy applies only before advance-payment confirmation**; modifications to already confirmed orders require a separate governed change decision. Preserve the locked 25% production eligibility / 75% post-QC balance and 100%-before-dispatch rule for Made to Order including Quote Only, all readiness/release, quality, custody, order/item remedy and audit controls, Ready Stock rules, statutory rights, WEB-040N exactly two customer-facing price components, WEB-018 payment provider DEFERRED, WEB-038 cart interaction DEFERRED and coupon rules OPEN.

**Next single major functional boundary (OPEN):** For a Quote Only quotation that has been sent but **not yet paid**, should Tavistra enforce **a stated quote validity/expiry date that disables the payment link on expiry and requires staff reissue or extension (Option A)**, or **keep quotes payable indefinitely until staff explicitly supersede or withdraw them (Option B)**? No automatic price change or order confirmation follows from expiry.


## 2026-11-04 — Phase 2 Quote Only mandatory quotation validity and expiry (Option A)

**OWNER-APPROVED / LOCKED:** Every formally issued **Quote Only quotation** must have an explicitly stated, recorded **valid-until deadline**, displayed in the quotation email and enforced by the authoritative server against new 25% advance-payment attempts. A quote remains payable only while it is the **current effective version**, has not been withdrawn, and is **within its validity window**. At expiry, mark the quotation **Expired/non-payable** and disable/reject new payments through its advance link; expiry itself does not accept, cancel or modify an already confirmed order, automatically reprice products, reverse funds, or create a new quotation. **Authorised staff must review commercial terms** and explicitly extend validity or issue a new versioned quotation and payment link before new payment is permitted, preserving prior versions, original expiry, changes, actor, reason, timestamps and immutable audit. For an advance payment initiated before the deadline but resolved afterward, reconcile the authoritative provider outcome and prevent duplicate collection; a late success is not silently lost or used to confirm stale terms without a governed determination. Preserve prior quote revision supersession/link invalidation, the Quote Only enquiry/staff consultation/quote email workflow, 25% verified advance for confirmation and production-payment eligibility across Made to Order, 75% post-QC balance and 100% verified payment before dispatch, all manual readiness/release, production, QC, fulfilment and customer rights controls, WEB-040N two customer-facing price components, WEB-018 payment provider and WEB-038 cart interaction DEFERRED, coupons OPEN. **Exact duration and deadline timezone/format remain OPEN**; no universal N-day validity is inferred.

**Next single major functional boundary (OPEN):** If a Quote Only order has already been confirmed by verified 25% advance and the customer requests changes to specifications, should Tavistra **require an authorised formal order-change workflow with revised scope, price/timeline, customer acceptance and payment reconciliation before production continues (Option A)**, or **allow staff to modify the confirmed order directly and reconcile differences later (Option B)**? Preserve immutable original quotation/payment history and existing production gates.


## 2026-11-04 — Phase 2 formal change control for confirmed Quote Only orders (Option A)

**OWNER-APPROVED / LOCKED:** After verified receipt of the **25% advance** has confirmed a Quote Only order, changes to agreed dimensions, materials, specifications, options, quantity or other commercial/production terms must proceed through a **separately traceable, authorised formal order-change request**. Staff document the requested change, revised scope/specifications, total and customer-facing two-component price breakdown, revised tentative timeline, feasibility/production impact and differences from the immutable accepted quotation and confirmed order. Require **explicit customer acceptance of revised terms and authorised staff approval before a revision becomes effective**; preserve version history, evidence, responsible actors, timestamps, communications and immutable audit. Reconcile the already verified advance against the revised authoritative order total, with any additional amount due or lawful refund/credit governed by payment/refund controls; do not assume the original 25% is forfeited or silently charge a new amount. While review is pending, prevent affected work from continuing on conflicting instructions using a controlled, auditable operational hold where needed, without rewriting past production events or cancelling unrelated safe work. On approval, update only the effective forward-looking order requirements and relevant production instructions, maintaining original quotation, customer agreement, payment and manufacturing history; on rejection/withdrawal, retain the existing confirmed terms unless separately lawfully resolved. Preserve the existing 25%-verified production-payment eligibility threshold for all Made to Order, full verified payment before dispatch, readiness and explicit production-release authority, separate QC, fulfilment and remedy controls, statutory rights, WEB-040N exactly two customer-facing price components, WEB-018/WEB-038 DEFERRED and coupon policy OPEN. Exact adjustment collection/refund timing and late-stage change feasibility remain OPEN.

**Next single major functional boundary (OPEN):** When an authorised **post-confirmation Quote Only order-change request is under review**, should Tavistra **automatically place only the affected production work on an audited hold until the change is approved or rejected (Option A)**, or **allow production to continue under existing specifications unless staff explicitly impose a hold (Option B)**? Both preserve the existing confirmed terms until approval and all statutory safeguards.


## 2026-11-04 — Phase 2 mandatory seven-day pre-production grace period and production-start cutoff (Option A)

**OWNER-APPROVED / LOCKED; EXPLICIT SUPERSESSION OF CONFLICTING QUOTE ONLY CHANGE-CONTROL SCOPE:** For all ordinary **Made to Order orders, including Quote Only orders fulfilled through Made to Order**, the authoritative server-verified successful **25% advance receipt / order-confirmation timestamp** starts a **mandatory seven (7) calendar-day pre-production grace period**. Production **must not actually commence during this period**, regardless of staff readiness attestation, release permission or customer request. The server must enforce the no-start gate even if a production release action is attempted; existing production-release readiness, permission, all-or-nothing, idempotency and audit controls continue to apply after the gate. A production release must not be treated as evidence of actual physical production commencement. Define a separately recorded, auditable **actual production-start event** with accountable staff actor and timestamp; no retrospective or automatic commencement merely from grace-period expiry. During the seven-day pre-production grace period customers may request changes or cancellation, subject to the already-approved formal staff review, revised terms and explicit customer acceptance for changes, and separately governed cancellation/refund rights. Existing confirmed terms remain authoritative until approved revision. **Once actual production starts**, ordinary discretionary customer-requested specification changes are **not permitted**, and the verified 25% advance becomes **contractually non-refundable**, **subject always to applicable consumer law, statutory cancellation/refund/defect remedies, Tavistra nonperformance, fraud/error corrections and any legally required exceptions**. Grace-period expiry alone neither starts production nor automatically makes the advance non-refundable; if production has not actually begun, any later change/cancellation request remains subject to pre-production staff review and applicable policy, not an automatic approval. Staff must communicate the grace-period, production-start cutoff and advance conditions clearly before advance payment and in the confirmed order record. Preserve all original and revised quote/order versions, payments, requests, staff decisions and timestamps with immutable audit.

**Supersession:** The 2026-11-04 formal post-confirmation Quote Only order-change workflow is **narrowed to changes requested and decided before actual production commencement**, not permission to change production after commencement. The previously OPEN choice of **automatic vs staff-controlled production hold during post-confirmation change review** is **WITHDRAWN / SUPERSEDED** as a standing next decision: production is prohibited during the mandatory grace period, and after actual production starts ordinary customer changes are disallowed. Any exceptional legal/quality/safety operational stop remains governed by existing controls, not this discretionary customer-change process. Preserve previously approved Quote Only enquiry/quote/version/expiry, 25%-verified advance production-payment eligibility, 75% after completion/QC, full verified payment before dispatch, all production/quality/fulfilment/support controls, WEB-040N exactly two customer-facing price components, WEB-018/WEB-038 DEFERRED and coupon policy OPEN. Precise published timezone and timestamp boundary implementation, and any additional rules for late pre-production changes after day seven, remain for subsequent definition without weakening the seven-day minimum.

**Next single major functional boundary (OPEN):** For a customer-requested **cancellation before actual production has begun** on a confirmed Made to Order / Quote Only order, should Tavistra **make the verified 25% advance refundable in full as the standard contractual rule (Option A)**, or **permit an authorised, disclosed deduction for documented nonrecoverable pre-production costs, subject to consumer law (Option B)**? Neither option permits keeping the advance solely because the seven-day grace period has elapsed, and neither overrides statutory rights.


## 2026-11-04 — Phase 2 full advance refund on approved pre-production Made to Order / Quote Only cancellation (Option A)

**OWNER-APPROVED / LOCKED:** For an ordinary Made to Order order, including Quote Only fulfilled as Made to Order, where **actual physical production has not commenced**, a customer may request cancellation during the mandatory seven-calendar-day grace period **or later while still pre-production**. Upon **authorised approval of cancellation while the order remains genuinely pre-production**, Tavistra must refund **100% of the successfully verified 25% advance actually collected**, with **no ordinary cancellation fee, cost deduction, administrative charge or forfeiture**. This is the standard contractual pre-production cancellation refund policy; do not infer an automatic right to approve cancellation or to trigger money movement merely from request submission. Validate the authoritative production-start event, order and verified payment ledger before approval; record the approving actor, evidence, refund obligation and settlement/reconciliation lifecycle with immutable audit and prevent duplicate refund execution. If any other verified payments exist, handle them under applicable payment/refund and statutory rules rather than silently retaining them. The seven-day grace-period expiry **alone does not make the advance non-refundable**; the earlier locked contractual 25%-advance non-refundability applies only **after actual production commencement**, always subject to applicable consumer law, statutory cancellation/refund/defect remedies, Tavistra nonperformance and other legally mandated exceptions. Preserve mandatory seven-day no-production gate, authorised readiness/release, customer-accepted pre-production order change control, Quote Only quotation/version/expiry and email payment workflow, 25% production-payment eligibility, 75% post-QC balance, full verified payment before dispatch, fulfilment/support/quality/audit controls, WEB-040N exactly two customer-facing price components, WEB-018/WEB-038 DEFERRED and coupon treatment OPEN.

**Next single major functional boundary (OPEN):** For a **customer-requested pre-production cancellation** of a confirmed Made to Order / Quote Only order, should Tavistra **immediately place that order's not-yet-started production work under an audited cancellation-review block until an authorised approval or rejection (Option A)**, or **allow scheduled production to proceed after the seven-day minimum unless staff manually intervene (Option B)**? Neither option cancels the order or refunds money automatically, and both preserve existing readiness/release permissions and statutory protections.


## 2026-11-04 — Phase 2 automatic pre-production cancellation-review production block (Option A)

**OWNER-APPROVED / LOCKED:** For every confirmed Made to Order order, including Quote Only fulfilled as Made to Order, **a valid customer cancellation request accepted while actual physical production has not begun must atomically establish an auditable cancellation-review production-start block** on the affected order/production scope. No staff release, scheduled job or automated process may initiate actual production while that request remains pending; the authoritative backend must check the pending block together with the existing seven-calendar-day no-start gate, readiness attestation and explicit production-release permission, including concurrent cancellation-submission/production-start attempts. Reject or safely serialize racing actions so an accepted pre-start cancellation request cannot be overtaken by commencement; if production has already authoritatively started, use the applicable post-start request/remedy pathway rather than falsely classify it as pre-production. The block remains until **authorised staff explicitly approve or reject** the cancellation, with actor, timestamp, reason, request, payment/production evidence and immutable audit. **Approval** invokes the separately controlled cancellation and verified **full refund of the collected 25% advance** under the approved pre-production policy; it does not itself mark funds settled. **Rejection** clears this specific block but never automatically starts production; all existing grace, readiness, permission and other holds must still pass. A cancellation request alone neither cancels the order nor moves money. Preserve the 25%-verified advance production-payment eligibility, 75% post-QC balance and 100%-before-dispatch rule, the contractual non-refundability only after actual commencement subject to law, all Quote Only version/expiry and pre-start change rules, quality/fulfilment/support and statutory controls, WEB-040N two customer-facing price components, WEB-018/WEB-038 DEFERRED and coupons OPEN.

**Next single major functional boundary (OPEN):** For **confirmed Made to Order and Quote Only orders after the seven-day grace period but before actual production starts**, should customer-requested **specification changes** remain eligible for formal review/approval (Option A), or should discretionary specification changes **close automatically when the seven-day grace period ends**, even if production has not yet started (Option B)? Both preserve the absolute no-change rule after actual production commencement and statutory rights.


## 2026-11-04 — Phase 2 seven-day cutoff for discretionary MTO / Quote Only specification changes (Option B)

**OWNER-APPROVED / LOCKED; EXPLICITLY NARROWS EARLIER PRE-PRODUCTION CHANGE ELIGIBILITY:** For confirmed **Made to Order orders, including Quote Only fulfilled as Made to Order**, the seven (7) calendar-day grace period beginning at the authoritative verified 25%-advance receipt/order-confirmation timestamp is the **final eligibility window to submit ordinary discretionary customer-requested specification/customisation changes**. After the seven-day period ends, **do not accept new ordinary customer-requested specification changes**, **even when actual physical production has not begun**. Changes submitted validly before the deadline remain subject to the already locked formal versioned change request, authorised staff review, feasibility, revised price/timeline, explicit customer acceptance, payment reconciliation and immutable audit; timely submission does not guarantee approval. Prevent an unresolved timely change request from being silently bypassed by production commencement: apply the existing controlled affected-work conflict block and resolve it through authorised approval/rejection before affected work begins, without changing the seven-day mandatory no-production gate. After actual production starts, the existing no-discretionary-change rule independently applies. Correcting Tavistra errors, legal/statutory remedies, safety or quality exceptions and separately authorised obligations are not treated as ordinary discretionary customer changes. **Cancellation is distinct:** before actual physical production starts, customers may still request cancellation after day seven, subject to staff approval, atomic cancellation-review production block and the already locked full refund of verified 25% advance for approved pre-production cancellation. The 25% becomes contractually non-refundable only on actual production commencement, always subject to law. Preserve the Quote Only enquiry, quotation versions/expiry and payment links, 25% verified production eligibility, 75% post-QC balance, 100% before dispatch, all readiness/release, quality, fulfilment, audit, statutory controls, WEB-040N two customer-facing price components, WEB-018/WEB-038 DEFERRED and coupons OPEN.

**Next single major functional boundary (OPEN):** For an **ordinary customer-requested specification change submitted within the seven-day grace period but still awaiting staff/customer resolution when day seven expires**, should Tavistra **keep the timely request valid and block affected production until an authorised final outcome (Option A)**, or **automatically expire unresolved requests at the grace deadline and retain the original confirmed specifications (Option B)**? Neither option permits new changes after day seven or bypasses existing payment, release and legal controls.


## 2026-11-04 — Phase 2 timely MTO / Quote Only specification-change requests survive day-seven deadline (Option A)

**OWNER-APPROVED / LOCKED:** For ordinary confirmed Made to Order orders, including Quote Only fulfilled as Made to Order, a customer specification/customisation change request **authoritatively received within the mandatory seven-calendar-day grace period** remains a **valid pending request** even if staff review, revised commercial terms, customer acceptance or final disposition extend beyond the day-seven submission deadline. **Do not automatically expire or reject the request merely because the deadline passed.** Establish and retain an **audited affected-production start block** while the timely request is unresolved, including the interval after the grace period: production cannot begin on the affected work until an authorised final approval/rejection/withdrawal outcome, and any required explicit customer acceptance and payment reconciliation, are recorded. Original confirmed order specifications remain authoritative until a fully authorised and customer-accepted change takes effect; the request itself does not change price, manufacturing instructions or payment obligations. After a final rejection/withdrawal, clear only this request's block, without automatically starting production or bypassing the seven-day gate, cancellation-review blocks, readiness, staff release permission, or other safeguards. After approval, use the approved revised specifications and any required revalidation of readiness/release before affected production. No **new ordinary discretionary change request** is permitted after the seven-day submission deadline, even if production has not started. Record original submission time, actor, status transitions, communications, reasons, versioned revised terms, payment consequences and final disposition with immutable audit. Preserve the actual-production-start cutoff, statutory/quality/error remedies, pre-production cancellation-review block and full verified 25% refund upon approved cancellation, 25% verified advance production-payment eligibility, 75% post-QC balance, full payment before dispatch, Quote Only quotation/version/expiry, WEB-040N two customer-facing price components, WEB-018/WEB-038 DEFERRED and coupons OPEN.

**Next single major functional boundary (OPEN):** For the **seven-day grace period and change-submission deadline** across Made to Order and Quote Only, should Tavistra use **one authoritative order-confirmation timestamp with a precise rolling 7×24-hour deadline in the published business timezone (Option A)**, or **calendar-date counting with the confirmation date as day zero and the deadline at 23:59:59 on calendar day seven (Option B)**? Neither permits production before the applicable full seven-calendar-day grace period has ended; exact boundary handling must be consistent across customer notices and server enforcement.

## 2026-11-04 — Phase 2 calendar-date seven-day grace period and change-submission deadline (Option B)

**OWNER-APPROVED / LOCKED; RESOLVES THE PREVIOUSLY OPEN DEADLINE CALCULATION:** For confirmed Made to Order orders, including Quote Only orders fulfilled as Made to Order, calculate the mandatory seven-calendar-day grace period and ordinary discretionary specification-change submission deadline using the authoritative server-verified successful 25% advance receipt/order-confirmation instant, converted to the **published Tavistra business timezone**. The local **confirmation calendar date is day zero**; the following local calendar date is day one; the deadline is **23:59:59 on local calendar day seven**, inclusive. Do not use a rolling 7×24-hour interval or the customer's device timezone. The authoritative backend must evaluate and persist the timezone identifier, confirmation instant, local day-zero date and calculated deadline consistently for customer notices, staff views, change intake and production-start gating. To avoid a fractional-second loophole, treat the deadline as inclusive through the final instant of day seven and reject new ordinary discretionary change submissions from **00:00:00 on day eight**; production may not actually commence before that day-eight boundary and may begin only after all other readiness, permission, release, payment, pending change/cancellation blocks and legal gates pass. Grace expiry never automatically commences production or makes the advance non-refundable. Example: confirmation on November 4 in the published business timezone means day seven is November 11, with changes accepted through the end of November 11 and earliest possible actual production start on November 12. Preserve timely submitted unresolved change requests and affected-work holds until authorised final resolution, original terms until an accepted authorised revision, no ordinary changes after the deadline or actual production start, pre-production cancellation eligibility and audited cancellation-review block, full verified 25% advance refund on approved pre-production cancellation, statutory/error/quality/safety remedies, Quote Only quotation/version/expiry, 25% verified advance eligibility, 75% post-QC balance, full verified payment before dispatch, immutable audit, WEB-040N exactly two customer-facing price components, WEB-018 and WEB-038 DEFERRED, and coupons OPEN. The specific IANA business timezone and its governance are not invented by this approval; they require a published authoritative configuration.

**Next single major functional boundary (OPEN):** If Tavistra's change-submission service is unavailable during the seven-day window, should **Option A** provide a narrowly controlled, audited deadline exception for verifiably prevented timely submissions, with evidence, authorised review and an affected-production hold, or should **Option B** enforce the published deadline without discretionary outage extensions, while preserving mandatory statutory remedies and Tavistra-error corrections? Neither option permits production before day eight or bypasses existing blocks and rights.

## 2026-11-04 — Phase 2 controlled outage exception for timely specification-change submission (Option A)

**OWNER-APPROVED / LOCKED:** For confirmed Made to Order orders, including Quote Only fulfilled as Made to Order, retain the published business-timezone calendar-date deadline (confirmation date day zero, submissions through 23:59:59 on day seven; ordinary intake closes at day-eight 00:00:00). Where a **verifiable Tavistra-controlled submission-service failure** actually prevented a customer from submitting an ordinary discretionary specification-change request within that window, permit a **narrow, authorised, evidence-based deadline exception** rather than automatically denying the customer's timely attempt. An exception is not a general extension or customer self-declared late submission: authorised staff must verify contemporaneous outage/attempt evidence, the affected order and deadline, causal prevention, request scope, and an appropriately prompt recovery submission; record reason, evidence references, reviewer identity, original and recovery timestamps, decision, communications and immutable audit. A credible exception claim accepted for review must atomically impose an **audited affected-production-start block** pending the exception decision; acceptance of a justified exception then routes the change through the existing formal staff approval, revised terms, explicit customer acceptance and payment reconciliation process, retaining the affected-work block until final disposition. Rejection releases only the exception-specific block and never triggers production. Where production has already actually commenced, do not silently backdate or override the locked no-ordinary-post-start-change rule; route exceptional customer claims for authorised legal/remedy/error review and preserve evidence. Protect against concurrent production-start and exception-review actions; avoid manufactured evidence or arbitrary staff extensions. No change is effective merely because an exception is granted, and no payment/refund is executed automatically. Preserve statutory rights, Tavistra error/quality/safety remedies, seven-day no-production gate, original confirmed specifications until accepted revision, timely pending requests, pre-production cancellation-review blocks and full verified 25% refund upon approved pre-start cancellation, 25% verified advance eligibility, 75% post-QC balance, full verified payment before dispatch, Quote Only quote/version/expiry, production readiness/release, WEB-040N two customer-facing price components, WEB-018/WEB-038 DEFERRED and coupon treatment OPEN. Detailed evidence standards and recovery submission timing are implementation-level controls, not permission to weaken this exception's narrow scope.

**Next single major functional boundary (OPEN):** For the published business timezone governing the seven-day grace and change deadline, should **Option A** lock one owner-approved IANA timezone for all Tavistra orders and snapshot it at confirmation (subsequent configuration changes never recalculate existing orders), or should **Option B** allow timezone selection by order/market with each order's selected published timezone snapshotted at confirmation? Both preserve calendar-date counting, audit and statutory rights.


## 2026-11-04 — Phase 2 global timezone policy (Option A)

**LOCKED:** One published IANA business timezone governs all Made to Order and Quote Only seven-day grace periods. Snapshot the timezone and computed calendar deadline at verified advance/order confirmation; future changes apply only to new orders. Existing protections, holds, payment rules and audits remain intact.

## 2026-11-04 — Phase 2 authoritative global timezone: Asia/Kolkata (Option A)

**OWNER-APPROVED / LOCKED:** Tavistra's single published global IANA business timezone is **Asia/Kolkata (India Standard Time, UTC+05:30)** for all Made to Order orders, including Quote Only fulfilled through Made to Order. Apply this timezone to the server-verified 25% advance/order-confirmation instant; confirmation local date is day zero, day seven ends at 23:59:59 IST, and day eight begins at 00:00:00 IST. Snapshot the IANA identifier, confirmation instant and calculated dates/deadline immutably per order. A later authorised timezone configuration change cannot recalculate existing order deadlines. Preserve the controlled service-outage exception, timely pending change holds, no-start gate, actual-production cutoff, cancellation and refund policy, statutory remedies, payment/release/quality/audit controls and all other locked decisions. This approval resolves the previously open exact-timezone selection.

**Next single major functional boundary (OPEN):** For an accepted, evidence-backed outage exception, should **Option A** require a defined maximum recovery-submission window after service restoration, or **Option B** allow case-by-case authorised recovery timing without a universal maximum? Both require causation evidence, audit and affected-production blocks.

## 2026-11-04 — Outage recovery submission timing: Option B

**OWNER-APPROVED / LOCKED:** For a verified Tavistra submission-service outage that prevented an otherwise timely Made to Order or Quote Only specification-change request, do not impose a universal maximum recovery-submission window after service restoration. Authorised staff set and communicate a reasonable case-specific recovery deadline based on verified service availability, customer access and contemporaneous evidence. Record the original IST deadline, outage evidence, causation, customer attempt, decision-maker, reasoning, recovery deadline, submission and disposition with immutable audit. This is not a blanket extension or automatic approval of the underlying change. Maintain an atomic affected-production start block during a credible exception review and, if accepted, until formal change disposition; resolve competing production-start attempts safely. Preserve the day-zero/day-seven Asia/Kolkata calculation, day-eight earliest production start, no ordinary post-deadline changes without a verified exception, no ordinary changes after actual production start, statutory/error/quality remedies, pre-production cancellation and refund rights, all existing payment, readiness/release, Quote Only, audit and customer-price controls.

**Next single major functional boundary (OPEN):** When a customer claims a submission outage but platform logs are incomplete, should **Option A** permit authorised review using corroborating customer-provided evidence and independent operational signals, or **Option B** require authoritative platform-side outage evidence before granting an exception? Both require audited decisions and protect against fabricated claims.


## 2026-11-04 — Outage review: corroboration, notification and failed delivery

**LOCKED (Option A, evidence):** Authorised reviewers may consider corroborating customer screenshots, support correspondence and independent operational evidence where Tavistra outage logs are incomplete. Verify credibility and causation, and audit evidence and decision; no automatic exception.

**LOCKED (Option A, notice):** Notify customers immediately upon acceptance of a credible outage-exception claim for review, stating pending status and affected-production block; notify again on disposition. Notice does not approve the change.

**LOCKED (Option A, failed delivery):** Continue authorised review despite notification failure, keep affected-production blocks, retry through available verified channels, and audit attempts and outcomes. Failed delivery never implies acceptance or consent. Preserve all existing IST deadlines, outage recovery timing, production-start restrictions, payment, refund, statutory rights and audit rules.

**Next OPEN boundary:** When an outage-exception review is rejected, should Option A automatically lift only its own production hold after verifying no other active blocks, or Option B require separate authorised manual hold release?


## 2026-11-04 — Outage claim hold decisions

**LOCKED Option A (rejection):** Following authorised rejection, atomically clear only the rejected claim's production hold. Verify current state and retain all other holds. Never automatically start or release production; audit the decision and hold transition.

**LOCKED Option A (multiple claims):** Maintain a separate, linked production hold for each credible outage-exception claim. Review and resolve each independently. Removing one hold never removes another; any outstanding hold blocks production. Enforce concurrency safety and immutable audit. Preserve prior evidence, notification, IST deadline, payment, cancellation, statutory and production controls.

**Next OPEN boundary:** Should duplicate outage claims covering the same incident be linked and consolidated for review while retaining distinct audit identities (Option A), or always reviewed as separate claims (Option B)?


## 2026-11-04 — Duplicate outage claims Option A; simplified staff-led review

**LOCKED:** Link duplicate claims about the same outage into one practical staff review, retaining each original claim, evidence, audit identity and linked hold. Authorised staff may request customer clarification, verify available evidence, determine whether the exception is justified and document the decision. Do not require automated evidence scoring or a complex duplicate-resolution workflow. Resolve each linked hold safely with the review outcome; never release independent holds or start production automatically. General design principle: automate objective rules and safety gates; reserve discretionary exception decisions for authorised staff. Preserve all prior IST grace, production, change, refund, payment, statutory and audit decisions.

**Next major functional boundary (OPEN):** Should customers be allowed to withdraw an unresolved specification-change request before production starts (Option A), or must staff formally reject/close it even when the customer asks to withdraw (Option B)?


## 2026-11-04 — Customer withdrawal of pending specification changes (Option A)

**LOCKED:** Before actual production commencement, customers may withdraw their own unresolved Made to Order or Quote Only specification-change requests without a separate staff approval. Withdrawal is valid only while the request is pending and not already made effective through formal acceptance. The original confirmed specifications remain authoritative, unless another previously accepted revision applies. Atomically close the withdrawn request and remove only its linked production hold, retaining all other holds, active exception reviews and production gates; never automatically release or start production. Record the customer action and timestamps in immutable audit, and make the resulting status visible to staff and customer. Withdrawal is not order cancellation, does not extend the seven-day IST submission window or waive payment, statutory or refund controls. Preserve all existing decisions.

**Next major functional boundary (OPEN):** After a customer withdraws a pending change request, should **Option A** allow a new replacement request only if the original seven-day deadline is still open (or an independently approved outage exception permits it), or **Option B** allow a short replacement window triggered by withdrawal even after the original deadline?


## 2026-11-04 — Replacement request after withdrawal Option A LOCKED

Customers may submit a new Made to Order or Quote Only specification-change request after withdrawing a pending request only while the original snapshotted seven-day Asia/Kolkata deadline remains open, or pursuant to an independently authorised and evidenced service-outage exception. Withdrawal never restarts or extends the grace period. Actual production commencement remains the ordinary change cutoff. Preserve the request audit history, independent production holds, cancellation/refund rights, statutory safeguards and all existing payment and release controls.

**Next major functional boundary (OPEN):** If a customer submits multiple different specification-change requests within the grace period, should Option A permit concurrent requests for staff to resolve together, or Option B require one active request at a time?


## 2026-11-04 — Concurrent specification changes Option A LOCKED

Customers may submit multiple change requests during the original seven-day IST grace period, or through separately authorised outage exceptions. Staff may review together and clarify with the customer to create one consistent final revised specification. Staff approval, customer acceptance and required payment reconciliation remain mandatory. Production remains blocked while any relevant request is unresolved. Preserve original specifications, request audit, production-start cutoff, cancellation/refund and statutory rights.

**Next OPEN boundary:** Consolidated requests: one customer acceptance of the full final revised specification (A), or separate customer acceptance for every requested change (B)?


## 2026-11-04 — Rejected consolidated revisions and bounded commercial negotiation

**OWNER-APPROVED (Option A, qualified):** A customer rejecting a consolidated revised specification may return to authorised staff for clarification and a revised final proposal; production remains blocked until the relevant change request is resolved. This is not unlimited negotiation. The initial quotation is valid for 30 calendar days, and the existing seven-day specification-change window is included within, not added to, the applicable commercial timeline. Staff require a clear customer acceptance or rejection within the applicable published deadline; unresolved negotiations cannot remain open indefinitely. Expired offers require a fresh quote and, where appropriate, a fresh order with current pricing and customer agreement. Do not automatically extend validity because discussions continue. Critically, quotation expiry must not silently cancel an already confirmed, advance-paid order or forfeit payment; preserve approved pre-production cancellation/refund rights, statutory protections and all existing order/production controls. Exact start point and application of the 30-day limit to already confirmed orders remain OPEN for owner approval.

**Next major functional boundary (OPEN):** What starts the 30-day commercial decision clock? Option A: original quotation issuance, with no reset for revisions; Option B: verified 25% advance/order confirmation, while unaccepted quotations retain their separate 30-day expiry. Both prevent endless negotiation, but affect confirmed-order rights differently.


## 2026-11-04 — Original quote 30-day clock and advance refund Option A LOCKED

The original quotation issuance date starts one non-resetting 30-calendar-day commercial negotiation period, calculated using Asia/Kolkata. Later revisions, customer discussions and seven-day change submissions do not extend or restart it. Where a final revised specification or offer remains unaccepted or is rejected when the negotiation closes, close the unresolved offer and refund the entire verified 25% advance without deductions, subject to statutory protections. A fresh customer-approved quotation/order is needed for renewed negotiations. This deadline does not automatically cancel a fully agreed confirmed order merely awaiting production; preserve existing production gates, customer rights, change holds, payment and audit decisions.

**Next major functional boundary (OPEN):** For a quote expiring on day 30, should Option A allow customer acceptance through 23:59:59 IST on day 30, or Option B expire at the exact issuance time on the thirtieth day?


## 2026-11-04 — Quote expiry day 30 Option A

**LOCKED:** Original quote date is day zero in IST. Acceptance through day 30 at 23:59:59 IST; unresolved quote expires at day 31 00:00:00 IST. No reset for revisions. Close unresolved negotiations with full refund of verified 25% advance, without deductions. Fully agreed confirmed orders are unaffected. Preserve existing rights and controls.

**Next OPEN boundary:** Automatic pre-expiry reminders (A) or staff-only reminders (B)?


## 2026-11-04 — Automated quote reminders Option A

**LOCKED:** Send automated reminders for unresolved quotations before the fixed 30-day IST expiry. Stop when accepted, rejected, expired or closed. Staff may follow up; reminders never reset the deadline. Detailed schedule and channels are implementation configuration. Preserve all earlier decisions.

**Next OPEN boundary:** Prioritise Quote Only to Made to Order end-to-end workflow (A), or broad storefront browsing first (B)?


## 2026-11-04 — Quote workflow approvals

**LOCKED:** Prioritise Quote Only to Made to Order end-to-end implementation before broad catalog expansion. Staff create, price, revise and issue quotations; customers review and accept or reject. No mandatory customer account or initial self-service quote builder. Permit a secure, expiring identity-verified quotation link with a 25% advance payment link. Record explicit acceptance of the precise quote version and terms separately from verified payment. Confirm the order and start the seven-day grace period only after required acceptance and verified advance. Preserve original 30-day quote expiry, refund and statutory protections, all production gates, WEB-018 provider deferral and other decisions.

**Next OPEN boundary:** If customer explicitly accepts the quote but the 25% payment is not verified before its 30-day expiry, should the quotation expire and require reissue (A), or should acceptance reserve the offer for a short fixed payment period (B)?


## 2026-11-04 — Unpaid quotation expiry Option A LOCKED

Customer acceptance alone does not extend quote validity or reserve pricing. The 25% advance must be verified by the original quotation's day-30 deadline (23:59:59 Asia/Kolkata). Otherwise expire the unconfirmed quotation and require a fresh one. Pending or failed payments never confirm an order or permit production. Reconcile late-arriving payment notifications against authoritative payment timing and refund amounts received for expired offers where appropriate; do not silently create orders. Preserve statutory, refund, audit and all earlier controls.

**Next major functional boundary (OPEN):** If payment was actually completed before expiry but provider confirmation arrives afterward, should Option A honour the timely payment after authoritative verification, or Option B require a fresh quotation regardless of the payment's actual timestamp?


## 2026-11-04 — Delayed payment confirmation and reinstatement

**LOCKED:** Honour an accepted quotation if authoritative evidence proves successful 25% advance before the original day-30 IST expiry even when confirmation arrives later. **LOCKED Option A:** Automatically reinstate an expired quotation and confirm its order once timely payment and exact quotation-version acceptance are unambiguously verified. Send discrepancies to staff review; never confirm on incomplete evidence. Seven-day grace starts on verified order confirmation. Preserve all other production, statutory and audit controls.

**Next OPEN major boundary:** Should the first Quote Only workflow support customer-requested quotation rejection directly from the secure link (A), or require contacting staff to reject (B)?


## 2026-11-04 — Flexible quote responses and revisions

**LOCKED:** Customer may reject quote via secure link, email or other channel used to send it, or ignore it until automatic day-30 IST expiry. Staff audit off-platform rejection; silence is not acceptance. **LOCKED Option A:** Customer may request quotation revisions through those same channels or the secure quote page. Staff capture, consolidate and assess requests, then issue versioned revisions. Neither requests nor revisions reset original 30-day deadline. Exact final version acceptance and verified 25% advance remain required; confirmed orders retain separate seven-day change rules. Preserve refunds, statutory and existing production controls.

**Next OPEN major boundary:** Should staff be able to mark a quotation as withdrawn before expiry with a recorded reason and immediate customer notification (A), or only allow closure by customer rejection or natural expiry (B)?


## 2026-11-04 — Optional accounts and guest order tracking (Options A and B)

**OWNER-APPROVED / LOCKED:** Confirmed Quote Only-to-Made to Order customers need not register. Registered customers have an authenticated account dashboard showing their verified linked quotations, order details, payment and tracking history while their accounts remain, subject to lawful retention and a separately approved future cleanup policy. Potential yearly cleanup is DEFERRED and does not authorise deletion of records required for tax, disputes, warranty, audit or statutory duties. Guest customers receive email order information and a secure identity-verified tracking link, without permanent self-service account history. **LOCKED Option B:** Guest tracking access lasts throughout the order lifecycle through authoritative delivery/completion, then expires after an approved post-completion period; do not use a fixed issuance-based expiry that cuts off in-progress orders. Expiring guest access does not erase internal records, contractual rights or statutory remedies. Identity verification is required; order IDs alone never grant access. Preserve separate quotation/order references, original 30-day IST quote clock, exact acceptance and verified 25% advance, seven-day production grace, holds, cancellation/refund, payment, statutory and audit protections.

**Next single major functional boundary (OPEN):** Post-completion guest link expiry: Option A fixed 30 calendar days from authoritative delivery/completion; Option B owner-configurable, explicitly approved published duration without an implicit default. Expired-link assistance requires fresh identity verification; records and rights remain intact.


## 2026-11-04 — Guest tracking link post-completion expiry (Option A)

**OWNER-APPROVED / LOCKED:** For guest customers, keep secure identity-verified order-tracking access available throughout the confirmed order lifecycle. Following the authoritative confirmed delivery/completion event, retain access for a fixed **30 calendar days**, using the published Asia/Kolkata business timezone: the authoritative completion local date is day zero; the link remains valid through 23:59:59 IST on day 30 and expires at 00:00:00 IST on day 31. Preserve immutable completion timestamp, calculated deadline and audit; a later correction to the authoritative event must be authorised and audited, not silently shift expiry. This replaces the earlier OPEN choice between fixed and configurable post-completion duration. Expiration revokes the guest link only; it never deletes orders, financial or legal records, restricts statutory rights or remove access to verified support/remedies. Registered customers continue to use authenticated accounts under the separately approved retention policy. Maintain verified identity, secure links and existing quotation, advance, grace, production, cancellation/refund, audit and statutory safeguards.

**Next single major functional boundary (OPEN):** After a guest tracking link expires, should **Option A** allow the customer to request a fresh, short-lived identity-verified tracking link for the existing order, or **Option B** provide order information only through staff-assisted verified support without issuing another self-service tracking link? Neither restores permanent guest access or changes record retention and customer rights.


## 2026-11-04 — Guest access after tracking-link expiry (Option B)

**OWNER-APPROVED / LOCKED:** After a guest customer's original order-tracking link expires at 00:00:00 Asia/Kolkata on day 31 after authoritative delivery/completion, do not issue a replacement self-service tracking link for that order. Instead, authorised Tavistra staff may provide necessary order status, documentation and assistance through verified support channels after proportionate identity and order-ownership verification. Staff must protect customer information, limit disclosure to the verified requester and retain appropriate audit of verification and disclosures. This is staff-assisted information access, not restoration of guest dashboard privileges. Customers may independently register for an account under the existing optional-account policy, but any historical order linkage must be verified; registration does not revive expired guest links. Expiry does not erase records or diminish statutory, contractual, refund, warranty or dispute rights. Preserve the existing 30-calendar-day IST post-completion expiry, separate quote/order IDs, original 30-day quotation validity, 25% verified advance, seven-day production grace, holds, cancellation/refund, payment and immutable audit safeguards.

**Next single major functional boundary (OPEN):** For a guest who registers after placing an order, should **Option A** allow authorised automatic association of historical guest orders after strong verification of order ownership, or **Option B** require staff review and approval for each historical order linked to the new account? Both prevent matching on email address alone and preserve all retention and access controls.


## 2026-11-04 — Historical guest-order account linking (Option B)

**OWNER-APPROVED / LOCKED:** When a former guest registers for a Tavistra customer account, do not automatically attach earlier guest quotations or orders, even where contact details match. Each historical guest order proposed for account association requires an authorised staff review and explicit approval after proportionate verification of the requester's ownership and the target account identity. Email-address matching alone is never sufficient. Record the order/account references, evidence, reviewer, decision, timestamps and immutable audit; reject or escalate ambiguous, disputed or conflicting ownership. Until approved, historical orders remain inaccessible in the account. Successful linking gives the verified account holder authenticated access under the existing account-retention and access policy; it does not renew expired guest tracking links, alter order status or deadlines, or weaken the staff-only guest support policy. Preserve all previously locked quotation, 30-day IST validity, verified 25% advance, seven-day production grace, production/change/cancellation holds, refunds, statutory rights, privacy and audit controls.

**Next single major functional boundary (OPEN):** How should a registered customer request linking of an older guest order? **Option A:** a self-service account request that collects order reference and ownership evidence, then routes to mandatory staff approval; **Option B:** support-contact-only request entered by staff, with no account-side linking request. Both require staff verification and approval for each order and prohibit email-only matching.


## 2026-11-04 — Customer-initiated historical guest-order linking (Option A)

**OWNER-APPROVED / LOCKED:** Provide an authenticated self-service request entry point in the registered customer's account for linking an earlier guest order. The customer submits the historical order reference and proportionate ownership-verification information; the request creates a pending staff-review case, not an order association or permission to view the historical order. Authorised staff must verify ownership of each specific order and the destination account, record evidence, decision, reviewer and immutable audit, and explicitly approve before linking. Email matching alone never establishes ownership. Keep unapproved orders and sensitive details hidden; safely reject or escalate ambiguous, disputed or conflicting requests. Retain the existing staff-only assistance rule after guest-link expiry, the 30-calendar-day IST post-completion link expiry, optional accounts and lawful record retention. Do not change quotation validity, order confirmation, payments, production/change/cancellation holds, refunds, statutory rights or other approved controls.

**Next single major functional boundary (OPEN):** For a customer-submitted historical order-linking request, should **Option A** display its review status (pending, approved, rejected or needs information) inside the customer's account, with private staff notes hidden, or **Option B** communicate the outcome only through email/support while the account shows no request status? Both retain mandatory staff approval and appropriate customer notification.


## 2026-11-04 — Historical guest-order linking request status visibility (Option A)

**OWNER-APPROVED / LOCKED:** In a registered customer's authenticated account, show each customer-initiated historical guest-order linking request with a clear current status: **Pending**, **Needs Information**, **Approved** or **Rejected**. Provide only customer-appropriate request references, progress and instructions; keep staff-only verification evidence, internal reasons, sensitive identity information and immutable audit details restricted. Status visibility never exposes the underlying guest order or its private details before authorised staff verifies ownership and explicitly approves the association. On approval, link only the verified order to the verified account and then make permitted order history accessible. On rejection, do not link; staff may communicate a safe customer-facing explanation without disclosing protected information. Keep appropriate customer notifications and auditable status changes. Preserve all existing staff-approved per-order linking, account-initiated requests, guest-link expiry and post-expiry support, account retention, privacy, quotation, payment, production, cancellation/refund and statutory safeguards.

**Next single major functional boundary (OPEN):** When staff marks a historical order-linking request **Needs Information**, should **Option A** let the customer submit additional evidence directly inside that existing account request, or **Option B** require the customer to provide it through verified support channels for staff to attach? Both keep the same request identity, staff verification and approval, private evidence and audit controls.


## 2026-11-04 — In-account supplemental verification for historical guest-order linking (Option A)

**OWNER-APPROVED / LOCKED:** When authorised staff marks a registered customer's historical guest-order linking request **Needs Information**, the customer may submit the requested clarification, data or supporting evidence directly within that existing authenticated account request. Retain the same request identifier and full submission/review history; do not create a replacement request or automatically approve/link the guest order on submission. Restrict evidence and sensitive identifiers to authorised personnel, validate uploads and access, protect customer privacy and record submission, staff review, status changes, decisions and timestamps in immutable audit. Staff retain mandatory per-order ownership verification and explicit approval; email matching alone remains insufficient. Until approval, the underlying guest order and its private details remain inaccessible through the account. Preserve all earlier customer-visible request statuses, optional-account and guest-access expiry policies, staff-assisted post-expiry support, retention, quotation, payment, production, cancellation/refund and statutory controls.

**Next single major functional boundary (OPEN):** When a customer submits requested additional verification information, should **Option A** automatically move the linking request from **Needs Information** back to **Pending staff review**, notifying staff, or **Option B** retain **Needs Information** until staff manually marks the submission ready for review? Both preserve staff-only approval and immutable history.


## 2026-11-04 — Supplemental evidence returns guest-order linking to pending review (Option A)

**OWNER-APPROVED / LOCKED:** When a registered customer submits additional requested verification information within an existing historical guest-order linking request currently marked **Needs Information**, atomically transition that same request to **Pending staff review** and notify authorised reviewing staff. Retain its original request identifier, all evidence versions, customer-facing status history, timestamps and immutable audit. Do not require a separate staff action merely to reopen review. This automatic transition is administrative only: it does not verify ownership, approve the request, attach any guest order, reveal restricted order details or bypass staff approval. Guard against stale/concurrent submissions and terminal Approved/Rejected states; apply appropriate evidence access and privacy protections. Preserve all earlier optional-account, guest-link expiry and staff-only post-expiry support, staff-approved per-order linking, 30-day quotation, verified 25% advance, seven-day production grace, payment, cancellation/refund, statutory and audit decisions.

**Next single major functional boundary (OPEN):** If a historical guest-order linking request is **Rejected**, should **Option A** let the customer submit a fresh request for the same order with new evidence, preserving the rejected case as immutable history, or **Option B** require staff to authorise any new attempt for that same order before the customer can submit it? Both retain staff verification and approval and prevent automatic linking.


## 2026-11-04 — Reapplication after rejected historical guest-order linking (Option B)

**OWNER-APPROVED / LOCKED:** A historical guest-order linking request in **Rejected** status is final and remains read-only in customer-visible request history and immutable staff audit. The registered customer cannot directly submit a new linking request for that same historical guest order after rejection. They must contact verified Tavistra support; authorised staff review the original rejection, any new ownership evidence and potential abuse/conflicting claims, then explicitly authorise or deny permission for a fresh request with a documented reason, responsible reviewer, timestamp and audit. If permitted, create a new request linked to the rejected predecessor; it is not automatically approved or linked and remains subject to the existing per-order staff identity/ownership verification and explicit linking approval. Do not reopen, edit or erase the rejected decision. Protect against duplicate/concurrent requests and disclosure of historical order details before approval. Preserve optional accounts, 30-day IST post-completion guest-link expiry, staff-only expired-link support, in-account evidence/status rules, quotation and production deadlines, verified advance, cancellation/refund, statutory and audit safeguards.

**Next single major functional boundary (OPEN):** After staff authorises a rejected customer's new linking attempt, should **Option A** enable a fresh customer-submitted account request with a staff-issued one-time authorisation, or **Option B** require staff to create the fresh request directly and invite the customer to supply evidence in their account? Both retain predecessor linkage, staff authorisation and separate final linking approval.


## 2026-11-04 — Staff-created authorised guest-order linking reapplications (Option B)

**OWNER-APPROVED / LOCKED:** Where an earlier historical guest-order linking request was rejected and authorised staff subsequently approve permission to reapply, staff themselves create a new, distinct linking request for the same claimed guest order and verified customer account. Link it to the immutable rejected predecessor and record the staff authorisation, creation reason, reviewer/creator, timestamps and audit. Notify the customer of the new request and allow them to provide supporting ownership evidence inside that request in their authenticated account. Do not require a staff-issued one-time reapplication code or permit the customer to create a replacement independently. A staff-created case is not approval of ownership or order association: retain mandatory per-order staff verification and explicit final linking approval, private evidence, customer-facing status, anti-duplicate/concurrency protections and safe handling of notifications. Preserve all previously locked optional-account, guest-link expiry, staff-only post-expiry support, account retention, quote/order IDs, quotation expiry, advance, production, cancellation/refund, statutory and audit controls.

**Next single major functional boundary (OPEN):** For a staff-created reapplication awaiting customer evidence, should **Option A** show **Needs Information** immediately until the customer submits the requested evidence (then automatically return to Pending staff review), or **Option B** show **Pending** immediately with a separate evidence-needed prompt? Both retain staff verification and approval.


## 2026-11-04 — Initial status for staff-created guest-order linking reapplications (Option B)

**OWNER-APPROVED / LOCKED:** A new historical guest-order linking reapplication created by authorised staff after permission to retry a rejected request starts in customer-visible **Pending** status, even when customer ownership evidence is still needed. Display a distinct, actionable evidence-needed prompt within that Pending request, specifying only safe customer-facing requirements; notify the customer. The customer may submit supporting evidence in the same authenticated request, with submission and review events audited; submitting evidence while already Pending does not imply automatic approval or an artificial status change. Preserve the existing **Needs Information → Pending staff review** automatic transition for cases that staff explicitly place in Needs Information and then receive the requested evidence. Staff must independently verify account/order ownership and explicitly approve any linkage. Keep the rejected predecessor immutable and linked, restrict sensitive evidence, prevent duplicate/concurrent associations and preserve all earlier account, guest-link expiry, support, quote, payment, production, cancellation/refund, statutory and audit decisions.

**Next single major functional boundary (OPEN):** Should the customer's account support **Option A**, a self-service request to unlink a previously staff-approved historical guest order, routed to staff verification and approval before any access change, or **Option B**, unlinking requests handled only through verified support contact? Both prohibit immediate self-service removal and preserve audit, lawful retention and order rights.


## 2026-11-04 — Support-only unlinking of approved historical guest orders (Option B)

**OWNER-APPROVED / LOCKED:** Registered customers cannot self-service unlink an earlier guest order previously associated with their account by staff approval. The customer must contact verified Tavistra support; authorised staff authenticate the requester, verify the relevant account/order association, assess competing ownership/access or fraud concerns and decide whether unlinking is appropriate, with reason, actor, evidence and timestamp in immutable audit. On approved unlinking, revoke that account's access to the historical order and its linked customer-facing details, including any active sessions/cached access as applicable; do not delete the authoritative order, payment, delivery, refund, communication or statutory records, change ownership rights, or restore/extend expired guest links. Communicate a safe outcome to the customer. Protect lawful retention and privacy, preserve historical linking and unlinking decisions, and retain all existing optional account, guest-link expiry, staff-assisted post-expiry support, quotation, advance, production, cancellation/refund, statutory and audit decisions.

**Next single major functional boundary (OPEN):** If an account is suspected of unauthorised access to a linked historical guest order, should **Option A** let authorised staff immediately suspend that account's access to the specific order pending ownership review, without deleting the association or records, or **Option B** keep access active until the staff unlinking review concludes? Both require audited staff action and protect statutory records and rights.


## 2026-11-04 — Immediate order-specific access suspension during historical guest-order ownership investigation (Option A)

**OWNER-APPROVED / LOCKED:** Where unauthorised access or an incorrect historical guest-order/account association is reasonably suspected, authorised staff may immediately suspend the affected registered account's access to that **specific linked historical guest order** while conducting an ownership/privacy investigation. Enforce the restriction across account order views, order detail endpoints, linked documents and other authenticated access paths, including already-issued access as technically applicable; do not suspend unrelated orders or the whole account merely by this action. Record who imposed the suspension, when, the reason/evidence and subsequent review outcomes in immutable audit, with restricted staff visibility for sensitive evidence. Suspension is protective, not a final finding, and does not itself unlink the order, change authoritative order/payment/refund records, alter deadlines or restore expired guest tracking links. Preserve lawful rights and support escalation; staff must resolve ownership and separately decide whether to restore access or perform an audited support-only unlinking. Preserve all earlier linking, reapplication, account, quotation, advance, production, cancellation/refund, privacy, statutory and audit controls.

**Next single major functional boundary (OPEN):** Following an investigation of suspended historical guest-order access, should **Option A** require an explicit authorised-staff decision to restore access or unlink the order, keeping access suspended until that decision, or **Option B** automatically restore access when an investigation is marked closed unless staff separately unlink? Both retain audit and statutory protections.


## 2026-11-04 — Explicit staff disposition of suspended historical guest-order access (Option A)

**OWNER-APPROVED / LOCKED:** An order-specific historical guest-order account-access suspension remains effective until an authorised staff member explicitly records and executes a final access disposition after ownership/privacy review: either **restore the verified account's access** to that order or **unlink the order from that account** under the already locked verified support-only unlinking process. Merely closing, completing or administratively dismissing an investigation never restores access. Require an authorised actor, recorded reason, supporting verification evidence, timestamp and immutable audit for disposition; do not expose private investigation notes to customers. Preserve enforcement against stale sessions/links and concurrent requests, and maintain access blocks while disposition is unresolved. Restoration must not re-enable an expired guest tracking link or bypass other independent access restrictions. Do not delete or rewrite order/payment/refund records, modify deadlines or reduce statutory rights. All earlier guest-order linking, reapplication, account, quote, advance, production, cancellation/refund, privacy and audit decisions remain binding.

**Next single major functional boundary (OPEN):** For a suspended historical guest-order association, should **Option A** require a second authorised staff member to approve restoration of access (four-eyes review), or **Option B** permit the investigating authorised staff member to restore access after documented verification? Both require explicit action, reason and immutable audit; unlinking remains governed by its existing staff verification controls.


## 2026-11-04 — Single authorised staff approval for historical guest-order access restoration (Option B)

**OWNER-APPROVED / LOCKED:** After investigating a suspended historical guest-order association, the same investigating staff member may explicitly restore that account's order-specific access **if authorised by role** and after documenting satisfactory account/order ownership verification. No mandatory second-person approval is required for restoration. Record the staff actor, evidence reference, reason, decision and timestamp in immutable audit; restrict internal investigation evidence and notify the affected customer safely as appropriate. Closing an investigation alone never restores access; maintain suspension until an explicit successful restoration or audited support-only unlinking disposition. Restoration must not bypass any separate access restrictions, recreate an expired guest tracking link, modify authoritative records or reduce statutory rights. Preserve all previous historical order linking, reapplication, privacy, optional-account, quotation, verified advance, production, cancellation/refund and audit controls.

**Next single major functional boundary (OPEN):** If a suspended historical guest-order association is confirmed incorrect, should **Option A** require staff to unlink it promptly as the investigation's final disposition, or **Option B** allow the association to remain indefinitely suspended without unlinking, pending further staff action? Both preserve order records and immutable audit, and prohibit access during suspension.


## 2026-11-04 — Prompt unlinking of confirmed incorrect historical guest-order associations (Option A)

**OWNER-APPROVED / LOCKED:** When an authorised investigation establishes that a historical guest order was associated with the wrong registered customer account, staff must promptly execute verified, audited **unlinking** as the final investigation disposition; indefinite suspension is not an acceptable substitute once incorrect association is confirmed. Keep order-specific access suspended and all relevant access paths blocked until unlinking succeeds, including handling stale sessions and concurrent requests. Record the determination, supporting evidence, actor, unlink action and timestamps in immutable audit; restrict sensitive investigation materials and communicate customer-safe outcomes as appropriate. Preserve the authoritative order and its payment, delivery, communication, refund and lawful retention records; do not automatically associate the order with a different account or revive an expired guest tracking link. Any future account association still requires its own ownership verification and explicit staff approval. Preserve all earlier optional-account, guest-access, linking/reapplication, quote, advance, production, cancellation/refund, privacy and statutory decisions.

**Next single major functional boundary (OPEN):** When a historical guest-order association is found incorrect, should **Option A** require a proactive, privacy-safe notification to the affected account holder after unlinking (without revealing the rightful customer's information), or **Option B** notify only when legally required or when the customer contacts support? Both retain mandatory statutory/privacy breach obligations and internal audit.


## 2026-11-04 — Proactive notification following incorrect historical guest-order unlinking (Option A)

**OWNER-APPROVED / LOCKED:** When staff confirm an incorrect historical guest-order/account association and complete its mandatory prompt unlinking, proactively notify the affected registered account holder through an appropriate verified customer communication channel that an order association was corrected/removed. The message must be privacy-safe: do not disclose the rightful customer's identity, private order details, investigation evidence or other protected information; provide an appropriate support route for questions. Record notification creation, channel, dispatch/delivery outcome and relevant failures in auditable history; failure to deliver does not reinstate the incorrect association or its access. Apply any independent legal privacy/security incident assessment and mandatory notifications without substituting this operational notice for statutory duties. Preserve authoritative records, immutable linking/unlinking and investigation audit, staff verification, expired guest-link policy, optional accounts, quotation, payment, production, cancellation/refund and all other approved safeguards.

**Next single major functional boundary (OPEN):** For a confirmed incorrect historical order association, should **Option A** require staff to assess whether the rightful customer may have been exposed to unauthorised account access and escalate any suspected privacy incident through a documented internal review, or **Option B** treat the unlinking and customer notice as sufficient unless an external complaint is received? Both preserve applicable statutory incident-response duties.


## 2026-11-04 — Mandatory privacy assessment after incorrect historical guest-order association (Option A)

**OWNER-APPROVED / LOCKED:** Every confirmed incorrect historical guest-order/account association triggers a documented internal privacy/security incident assessment, whether or not a customer complains. Authorised staff assess whether the rightful customer's personal or order information may have been accessible or actually accessed, considering relevant access and activity logs, exposure scope, timing and potential harm; record the facts, uncertainty, reviewer, decision and evidence references in restricted immutable audit. Escalate suspected privacy incidents to the designated responsible internal owner for appropriate containment, investigation, remediation and applicable statutory notification/response. Do not assume lack of evidence of access means no possible exposure; avoid claiming a breach without supporting assessment. This assessment supplements, and never delays, immediate access suspension, prompt unlinking of confirmed incorrect associations and proactive privacy-safe notice to the affected linked account holder. Preserve statutory duties and all previously locked account, guest-access, quotation, advance, production, cancellation/refund, retention and audit decisions.

**Next single major functional boundary (OPEN):** Should Tavistra **Option A** automatically create a separate tracked privacy-incident review case whenever an incorrect historical order association is confirmed, linked to the unlinking investigation and owned by an authorised reviewer, or **Option B** document the mandatory privacy assessment within the existing unlinking investigation without a separate case? Both require documented assessment, escalation where warranted and immutable audit.


## 2026-11-04 — Privacy assessment in existing investigation (Option B) and global simplicity-first implementation principle

**OWNER-APPROVED / LOCKED — Option B:** Document the mandatory privacy/security assessment of a confirmed incorrect historical guest-order association within the existing staff unlinking/ownership investigation. Do **not** automatically open a separate privacy review case for every such occurrence. Staff record the relevant evidence, assessment, responsible reviewer, conclusion, action and immutable audit within that existing record; escalate to a separate incident process only where actual circumstances or legal requirements warrant it. Preserve prompt suspension/unlinking, privacy-safe customer notice and all statutory incident-response obligations.

**OWNER DIRECTION — GLOBAL IMPLEMENTATION PRINCIPLE:** Prefer the simplest workable Tavistra process across customer, staff and back-office flows. Automate repeatable, high-volume operational actions and objective controls where reliability or scale warrants it (for example payment reconciliation, stock/order state, expiry/deadline enforcement, essential notifications, production access gates and audit). Keep exceptional situations, discretionary decisions, investigation, customer clarification and special reviews staff-led within existing operational screens/records wherever practical. Avoid unnecessary linked cases, status variants, triggers, approval layers, bespoke dashboards and automation merely because they are technically possible. Do not add separate workflows when a manual documented staff action suffices. Minimise staff clicks and customer friction while preserving security, privacy, statutory rights, traceability and essential execution blocks. Treat this as a design and prioritisation rule for all future decisions and implementation; **it does not silently override previously owner-locked functional decisions**. Where earlier decisions appear overcomplex, explicitly surface a targeted simplification proposal for owner approval before superseding them. Focus next on major customer/operations boundaries rather than minor edge-case micro-decisions.

**Next single major functional boundary (OPEN):** Should Tavistra **Option A** perform a structured simplicity audit of previously approved Phase 2 workflows, flagging unnecessary automation/case management for explicit owner decisions before proceeding to new functionality, or **Option B** apply simplicity-first only to decisions from this point forward and leave existing approved workflows untouched unless a specific problem arises? Both preserve all locked decisions until expressly revised.


## 2026-11-04 — Owner-delegated global simplification pass (approved Option A)

**OWNER-APPROVED DELEGATION:** The owner authorises the assistant to simplify non-critical implementation design autonomously, escalating only decisions that materially affect customer rights, financial obligations, access/privacy/security, production or fulfilment commitments, or previously locked customer-facing business outcomes. This authorisation supersedes the previous instruction to obtain owner approval for *every* implementation simplification, but does not authorise silently changing those protected outcomes. Apply to all Phase 2 modules, not only guest-order linking.

**IMPLEMENTATION CONSOLIDATION / INTERPRETATION (effective globally):**
1. **One operational record, not a case for every exception.** Record routine review, evidence, staff notes, outcome, audit and any needed follow-up on the existing order, quote, stock discrepancy, shipment, support request or account-linking record. Create a distinct linked case/job only where already explicitly required for an independent customer-visible obligation, a genuinely separate physical job/shipment, or a legally necessary incident. Do not build a generic workflow engine or separate dashboard per review type.
2. **Staff judgement stays manual.** Clarifications, exception handling, disputes, identity/ownership verification, privacy assessment, discretionary remedy, outage evidence and escalation can be handled by authorised staff through a simple action + reason/notes + supporting evidence in the existing back office. Avoid automated risk scoring, inferred approvals, cascaded review cases and unnecessary multi-person approvals. Mandatory approvals already locked remain mandatory.
3. **Automate objective execution, not deliberation.** Preserve automated expiry/eligibility arithmetic, payment verification, stock reservations/adjustments, essential status transitions, production/release holds, access revocation, required customer notifications and immutable audit where already locked. Notifications can be implemented as events from the underlying record rather than a separate notification workflow; staff may handle exceptional delivery failures manually unless law or an explicit decision requires otherwise.
4. **Minimise status proliferation.** Reuse existing customer-facing states and show a simple contextual action/message rather than adding another state. For example, a staff-created guest-order reapplication remains Pending with an evidence-needed prompt, as approved; the previously approved Needs Information and return-to-Pending transition remain intact. Preserve explicitly approved customer-visible status and deadlines.
5. **Prefer shared staff screens and configurable fields.** A single staff work queue with filters and role-based access may surface pending exceptions across modules; separate bespoke inboxes, linked investigation trackers, approval chains and reminder loops are not required unless a locked outcome cannot otherwise be met. Use existing records for historical immutable audit rather than duplicating full case histories.
6. **Scope control.** Treat previously discussed fine-grained implementation mechanics as guidance for satisfying their protected business outcome, not an obligation to build separate subsystems for each named concept. This consolidation explicitly supersedes any implication that a distinct automation service, separate case-management UI or extra staff step is required solely to support those mechanics. It does **not** supersede explicit approved requirements for distinct production jobs, customer-facing support cases, separate replacement fulfilment, legally required processes, or other substantive outcomes. Resolve actual conflicts against the locked decision and flag genuinely consequential changes for owner approval.

**Practical Phase 2 priority:** Build core quote → verified advance → confirmed order → production/stock → dispatch/delivery → support/refund operations first. Implement rare historical-linking disputes and privacy exceptions as lightweight staff actions on existing records. Avoid further micro-decisions about those exceptions unless a critical business choice is unavoidable.

**Next major functional boundary (OPEN; critical):** Should the initial launch include **Option A**, the full customer-account historical guest-order linking and exception-management functionality already approved, or **Option B**, defer this low-frequency account-linking feature to a later release while preserving the approved design for that release? This is a launch-scope decision only; no underlying customer rights, privacy or legal obligations may be deferred.


## 2026-11-04 — Initial-launch historical guest-order linking scope (Option A)

**OWNER-APPROVED / LOCKED:** Include the previously approved registered-account historical guest-order linking functionality **in Tavistra's initial launch**, rather than deferring it. Launch scope covers customer-initiated requests with order reference and verification information; staff-only per-order ownership verification and explicit approval; customer-visible Pending/Needs Information/Approved/Rejected statuses; in-account supplemental evidence; automatic Needs Information-to-Pending transition on evidence submission; staff-authorised and staff-created reapplications after rejection, initially Pending with an evidence-needed prompt; support-only unlinking; order-specific suspension of suspected incorrect associations; explicit authorised-staff restoration or prompt unlinking on confirmed incorrect association; proactive privacy-safe notice; and mandatory privacy assessment recorded within the existing investigation. Preserve original rejected-case history, restricted evidence and immutable audit, no email-only automatic linking, no restoration of expired guest tracking links, optional registration and lawful retention. Implement these outcomes through simple shared account/staff screens and existing records, avoiding unnecessary dedicated case-management engines, extra approval layers or automation. Preserve all previous quotation, verified advance, seven-day grace, production, inventory, fulfilment, cancellation/refund, privacy and statutory protections. This launch-scope approval overrides the immediately preceding OPEN defer-versus-include question, not any approved business rule.

**Next single critical functional boundary (OPEN):** For initial-launch registered accounts, should **Option A** require verified control of the customer's email address before allowing the account to submit historical guest-order linking requests, or **Option B** allow an authenticated but email-unverified account to submit requests, relying on staff ownership verification before linking? Both retain mandatory staff verification and approval, and neither treats an email match as proof of order ownership.


## 2026-11-04 — Verified account email prerequisite for historical guest-order linking (Option A)

**OWNER-APPROVED / LOCKED:** At initial launch, an authenticated registered customer must have verified control of their current account email address before they can submit a historical guest-order linking request. Use the normal account email-verification mechanism; an unverified account sees a straightforward verification prompt and cannot submit the request until verified. Verified email is only an account-contact/control prerequisite, never proof of ownership of a guest order: email equality, even verified, must never automatically link orders or bypass the existing per-order evidence review and explicit authorised staff approval. Continue to support staff-led verified assistance and all previously approved customer status/evidence/reapplication, access suspension/unlinking, privacy incident, immutable audit, optional account, expired guest-link, statutory and commercial protections. Do not create a separate email-verification case-management workflow.

**Next single critical functional boundary (OPEN):** When a registered customer changes their account email address, should **Option A** require verification of the new address before it becomes the active verified email and before new historical guest-order linking requests can be submitted, or **Option B** activate the new address immediately while restricting only historical linking until later verification? Both preserve existing approved historical-order links subject to security review, prevent automatic relinking and retain appropriate account-security notifications.


## 2026-11-04 — Account email change verification (Option A); global Phase 1/2 simplicity and decision-scope governance

**LOCKED:** Existing verified account email remains active until replacement email is verified. Pending change blocks new historical guest-order linking requests. After verification, new email becomes active; existing approved order links are not automatically changed, and staff verification remains mandatory for new historical links. Use normal email-verification, security notice and audit controls, not a bespoke manual case. Preserve all existing decisions and statutory safeguards.

**OWNER-APPROVED GOVERNANCE / INTERPRETATION:** The target deliverable is the *full website concept and major functional/business logic*, not exhaustive software design. Apply the simplicity-first implementation principle to **Phase 1 as well as Phase 2**. Phase 1 conceptual coverage remains formally CLOSED and approved; its page/module inventories describe necessary capabilities, not a mandate for one screen/service/workflow per named item. Staff manually resolve exceptional reviews, customer clarification and discretionary matters using existing records and minimal audit; automate routine high-volume operational work and objective safety/financial controls. Assistant may simplify noncritical implementation details independently, including consolidating overlapping screens, notifications, review records and micro-states. Do not silently reverse owner-approved substantive outcomes or statutory/privacy/security/payment/production constraints. Reserve owner questions for genuine critical business/launch/customer tradeoffs; defer internal schema, UI splits, retry policy, test cases and low-level implementation details to development, QA and launch. Stop micro-decision drift; prioritise missing major modules, coherent end-to-end journeys and an explicit short list of open critical decisions. Later dated decisions supersede earlier OPEN/DRAFT statements where applicable; do not mistake old text for current policy.

**Next critical functional boundary (OPEN):** Option A consolidated major cross-module concept gap audit first; Option B continue sequential account-security decisions. Both preserve all locked decisions.


## 2026-11-04 — Approved Option A: Consolidated full-website concept gap review

**OWNER-APPROVED REVIEW SCOPE:** Reconcile Phase 1's formally approved conceptual sitemap against later Phase 2 decisions across public discovery, brand/editorial, catalogue/merchandising, three purchase modes (Ready Stock, Made to Order and Quote Only/custom enquiry), cart/checkout, payments, delivery, inventory, production, fulfilment, returns/support, accounts/guests, private administration, content governance, security and operational reliability. This is a **major-gap audit**, not permission to reopen approved decisions or turn minor development choices into owner votes. Phase 1 stays CLOSED. Apply global simplicity-first and staff-led exception handling.

### Consolidated coverage and decision status

| Website area | Concept coverage | Major decision status / action |
|---|---|---|
| Brand, public home, Shop, six categories, collections, search, product pages | Covered by Phase 1 and locked storefront/navigation/search/design direction | Preserve; detailed layouts, labels, SEO templates and content production are design/development tasks, not new owner votes. |
| Catalogue, variants, merchandising, content publishing, inventory | Covered by Phase 1; substantial operational rules approved | Preserve; consolidate shared staff screens; remaining field-level publishing validation and admin UI are development tasks. |
| Ready Stock commerce, delivery pricing, payment verification, reservations, fulfilment and return eligibility | Extensive approved Phase 2 logic | Preserve; no new micro-decisions unless a genuine unaddressed customer/financial promise is found. |
| Made to Order, Quote Only/custom enquiry, quote expiry, 25% advance, seven-day grace, production, cancellation | Extensive approved Phase 2 logic; newer Quote Only decisions supersede historical OPEN markers | Preserve; reconcile later dated rules when implementing. Do not reopen quote mechanics. |
| Mixed purchase-mode orders and shipments | Consolidated dispatch and mixed Ready Stock/Made to Order dispatch approved | Check remaining *cart/checkout compatibility* only as part of deferred WEB-038, not as a new shipment-state design exercise. |
| Cart and checkout interaction | WEB-038 deliberately DEFERRED | **Critical unresolved product boundary**: agree launch cart behaviour and compatibility with purchase modes at concept level before detailed UX. |
| Promotions/coupons | Earlier documents explicitly OPEN; no verified later comprehensive approval in this audit | **Critical unresolved commercial boundary**: launch inclusion and basic discount eligibility/stacking at business-policy level, not coupon-engine microstates. |
| Payment service provider | WEB-018 deliberately DEFERRED | **Critical pre-build integration selection**, but provider/vendor choice belongs to implementation procurement once business payment/verification/refund requirements are confirmed. Do not mistake provider selection for missing website concept. |
| Customer accounts, optional guest access, historical order linking | Approved Phase 2, including initial-launch linking and verified-email prerequisites | Preserve; ordinary account screens and authentication mechanics to development. |
| Dispatch, delivery disputes, customer remedies, reverse logistics and support | Approved functional coverage and substantial Phase 2 policies | Preserve customer remedies and separate cases where expressly required; simplify staff handling and UI, no extra micro-review systems. |
| Admin, permissions, audit, monitoring, content operations | Covered by Phase 1 and later Phase 2 protections | Preserve essential role/security controls; consolidate screens/queues and leave operational implementation detail to development/QA. |
| Legal, privacy, shipping/returns/care and customer trust content | Covered conceptually by Phase 1 | Final legally compliant policy copy and operational configuration remain **prelaunch content/compliance work**, not a reason to micro-specify every page here. |

### Short list of genuinely unresolved major boundaries

1. **P0 — Cart/checkout concept (WEB-038):** whether launch cart can hold Ready Stock and Made to Order together and how Quote Only enquiries/quotes are kept distinct; settle the *customer journey and checkout boundary*, not button/microstate details. Preserve already approved mixed dispatch, pricing and quote/payment rules.
2. **P0 — Coupon/promotion policy:** whether coupon redemption is included at launch, which purchase modes are eligible and whether multiple discounts can combine. Decide the broad commercial policy first; detailed rules and configuration can follow in development.
3. **P1 — Concept completeness sign-off:** after resolving the two material gaps, review one concise end-to-end website concept summary and identify any truly missing business area. Do not re-run Phase 1 sitemap approval.
4. **Implementation/launch dependencies, not concept votes:** payment provider selection, policy drafting, exact admin/storefront UI, notification retry cadence, integration setup, QA cases, SEO execution and operational runbooks.

**Audit limits:** This review reconciles the canonical blueprint/register and approved Phase 1 sitemap/admin inventory; it does not claim a full semantic validation of every historical line or that all deferred items are resolved. Historical OPEN statements are not authoritative when superseded by later locked decisions. No substantive locked business outcome is changed by this audit.

**Next single critical owner decision (OPEN):** For initial-launch cart and checkout, should **Option A** permit Ready Stock and Made to Order products together in one cart/checkout, with each line retaining its approved payment/production rules, while keeping Quote Only quotations on their separate acceptance/advance-payment path; or **Option B** require separate checkouts for Ready Stock and Made to Order, with Quote Only still separate? Both preserve approved mixed-dispatch capability where applicable and exactly two customer-facing price components.


## 2026-11-04 — Initial-launch cart and checkout purchase-mode separation (Option B)

**OWNER-APPROVED / LOCKED:** At initial launch, Ready Stock and Made to Order products **must not be purchased together in one cart checkout or combined payment transaction**. Provide mode-specific checkout flows: Ready Stock items may be checked out together under the existing Ready Stock rules; Made to Order items may be checked out together under their own approved order/payment/production rules; Quote Only remains on its distinct staff-issued quotation, customer acceptance and verified 25% advance-payment path. Where a customer selects products across modes, clearly separate the groups and guide them to the appropriate checkout(s) without silently combining financial or production commitments. Do not require duplicate accounts or unnecessarily duplicate shared checkout UI. This expressly resolves the deferred WEB-038 mixed-mode cart/checkout **business boundary**, while detailed cart interactions and interface design remain development-stage matters. Previously approved mixed-mode consolidated dispatch remains available for separately placed eligible orders when operationally appropriate; no automatic cross-order merge or shared payment is implied. Preserve exactly two customer-facing price components, all previously locked pricing, stock reservation, payment verification, grace-period, production, delivery, refunds, audit and statutory rules. The earlier proposal for a unified mixed-mode checkout is rejected and superseded.

**Next single major unresolved business boundary (OPEN):** Should Tavistra **Option A** include customer-entered coupon codes at initial launch, subject to simple owner-configured eligibility rules, or **Option B** defer customer-entered coupons and rely on directly configured product/sale prices and staff-managed offers for launch? Neither changes approved tax-inclusive product pricing or the separate delivery-charge component. If coupons launch, eligible purchase modes and stacking rules require one further high-level policy decision, not a detailed coupon-engine design.


## 2026-11-04 — Initial-launch coupon policy (Option B) and concept gap checkpoint

**OWNER-APPROVED / LOCKED:** Do **not** include customer-entered coupon codes or coupon redemption/stacking in Tavistra's initial launch checkout. Defer the coupon feature and detailed coupon-engine rules to a later release; do not accidentally treat historical coupon OPEN markers as launch requirements. Initial-launch promotions may use owner/staff-authorised configured product discounts, sale prices and direct staff-managed offers, subject to all existing pricing, quotation, permission, payment, consumer-disclosure and audit controls. Preserve tax-inclusive discounted product pricing plus the single applicable combined delivery charge as the **only two customer-facing price components**, as previously approved. No discount may bypass existing quote acceptance, verified advance/payment, production, refund, or statutory obligations.

**MAJOR CONCEPT GAP CHECKPOINT:** The two P0 business boundaries identified by the 2026-11-04 consolidated review are now resolved: (1) separate Ready Stock and Made to Order launch checkouts, Quote Only separate; (2) coupon redemption deferred. Phase 1 conceptual sitemap remains owner-approved and CLOSED; Phase 2 approved functional decisions remain locked. Do not reopen these decisions or drift into implementation microstates. Payment provider procurement, detailed cart UX, final legal copy, SEO execution, testing and launch runbooks remain delivery-stage dependencies rather than additional website-concept votes.

**Next single major boundary (OPEN):** Confirm **concept-level completeness** of Tavistra's initial-launch website across public storefront/brand, catalogue, Ready Stock, Made to Order, Quote Only, checkout/payments, inventory/production, delivery/returns/support, customer/guest accounts and staff administration. **Option A:** accept that these major functional areas are conceptually covered, freeze the approved concept baseline, and transition to a consolidated implementation-readiness plan with a short dependency/risk register; gaps found during implementation must be escalated only if they change a locked business outcome. **Option B:** keep concept review open for one additional bounded major-area audit, naming the specific missing business capability rather than requesting unspecified micro-detail. Neither option declares the website built, QA-complete or ready to launch.


## 2026-11-04 — Website concept baseline frozen; implementation-readiness phase authorised (Option A)

**OWNER-APPROVED / LOCKED MILESTONE:** Tavistra's initial-launch **website concept and major functional/business logic are accepted as complete and FROZEN as the implementation baseline**. Phase 1 conceptual sitemap was already CLOSED; the consolidated Phase 2 business-boundary review is now CLOSED at concept level. This is **not** a declaration that detailed technical specifications, code, integrations, testing, compliance sign-off or launch are complete. Historical OPEN/DRAFT notes and proposed microdecisions are superseded by later dated owner-approved rules and this milestone; retain them as history, not new questions. The frozen baseline incorporates separate Ready Stock and Made to Order checkout, separate Quote Only quotation/25% advance acceptance, coupon-code deferral, account verification and historical linking at launch, and all previously approved pricing, seven-day grace, stock, production, fulfilment, return, cancellation, refund, privacy, permissions, audit and statutory safeguards. No silent changes to any substantive locked outcome.

**Next phase: IMPLEMENTATION READINESS, not more concept voting.** Produce one consolidated execution plan and dependency/risk register, using existing repository specifications as source of truth. Working sequence: (1) baseline reconciliation and technical architecture/security boundaries; (2) data model and integrations, including payment provider selection and verified webhooks/reconciliation; (3) storefront/design-system and content implementation; (4) catalogue, pricing, inventory, role-aware staff tools; (5) separate Ready Stock and Made to Order checkouts plus Quote Only staff quote/payment journey; (6) production, shipment, tracking, returns/refunds and support; (7) optional accounts, verified historical guest-order linking and notifications; (8) end-to-end QA, statutory/policy review, accessibility, SEO, monitoring/backups and launch readiness. These are **planning workstreams, not owner-approved technical stack or rigid waterfall dependencies**. Parallelise sensibly after identifying critical-path dependencies.

**Short delivery dependency/risk register:**
- **Payment provider and settlement/refunds:** provider/vendor selection deferred; validate 25% quote advance, authoritative payment verification, 75% balance, refunds and reconciliation before build integration.
- **Purchase-mode separation and delivery:** prevent cross-mode combined checkout while retaining approved eligible mixed-dispatch capability; preserve two customer-facing price components and approved shipping rules.
- **Complex legacy decision history:** build a concise implementation acceptance matrix referencing the *latest locked* decisions; avoid treating old OPEN labels or microstate prose as independent features.
- **Staff usability and operational load:** manual exception decisions with audit on existing records; automate only objective commerce execution, safety guards and essential notifications.
- **Security/privacy and guest history:** verified account email and per-order staff approval, restricted evidence, secure guest links, immutable audit and statutory response handling.
- **Content/compliance and release:** approved policy wording, product data, accessibility, legal review, tax disclosure, SEO, observability, backups and realistic end-to-end testing remain required before launch.

**Execution governance:** Do not ask owner for repeated low-level decisions about UI components, internal states, notification retries, technical schemas, test cases or admin menu splits. Engineering should choose simple, testable implementation approaches consistent with locked business rules. Escalate only material changes to customer promises, finances, production, permissions, privacy/statutory compliance or launch scope. Maintain a small explicit list of genuine blockers and progress against the implementation plan. **Next action:** prepare the consolidated implementation-readiness blueprint and dependency-ordered build plan; do not resume serial concept decisions.


## 2026-11-04 — Implementation-readiness execution plan created

**EXECUTION STATUS:** Created the [Implementation-readiness blueprint and build plan](../roadmap/implementation-readiness-plan.md) as the active delivery-planning reference. It defines recommended modular-monolith architecture (stack/vendor not yet locked), dependency-ordered build slices, a compact critical acceptance matrix, a prioritized blocker/risk register, release gates and the first engineering execution sprint. This is **planning only**, not evidence of implemented code, selected payment vendor, completed QA or launch approval. The frozen website concept and every later locked business/statutory outcome remain authoritative; this plan cannot silently supersede them. Next action is acceptance traceability plus architecture validation, then a narrow Ready Stock end-to-end vertical slice. Do not reopen concept decisions or solicit UI/technical micro-votes.


## 2026-11-04 — Owner clarification: Phase 3 before Phase 4; specification only

**OWNER-DIRECTED / ACTIVE PHASE:** Work in this project is to **discuss and finalise the requirements and design needed to build Tavistra**, not to write or deploy the website here. Phase 1 (website concept/sitemap) and Phase 2 (major functional/business rules) are conceptually complete and frozen. **Phase 3 (page-level UX/UI design and experience specification) is now ACTIVE and must be completed before resuming Phase 4 (technical architecture/implementation planning and developer handoff).** The previously created implementation-readiness plan is retained as a preliminary reference, not an active execution sprint or authorisation to start coding.

**Phase 3 deliverable:** a coherent design specification covering visual language, global navigation and mobile patterns, major public page families, product discovery/product detail, distinct Ready Stock and Made to Order carts/checkouts, Quote Only customer journey, guest/account/tracking/support, and consolidated staff admin patterns. Define each page family's purpose, essential information, primary actions, responsive behaviour and meaningful cross-page transitions. Keep to **concept and design-level choices**, not pixel-perfect layouts, detailed microstates, API/data schemas, engineering/test steps or repetitive owner votes. Reuse the frozen brand and business decisions; escalate only materially new customer-facing design direction or a true business-rule conflict.

**Phase 4 remains ON HOLD** until Phase 3 concept-level sign-off. It will produce a developer-ready technical planning/handoff package, not perform website development within this conversation. Earlier 'next action: build vertical slice' wording in the preliminary implementation plan is **not** the current project instruction and is superseded by this owner clarification.


## 2026-11-04 — Phase 3 duplicate decision corrected; gap-first review

**CORRECTION / NO NEW DESIGN VOTE:** The owner's Option C response to the proposed 'Hybrid Gallery + Commerce' storefront direction **reaffirms an existing locked decision**, not a new design boundary. Decision Register WEB-001 already locks Hybrid Editorial + Commerce, WEB-002 locks Contemporary Gallery, and WEB-021 locks the Adaptive Gallery system (light practical commerce surfaces with selected dark editorial surfaces). Do not re-open, re-number or seek repeat approval of these decisions. The earlier Phase 3 Option A/B/C framing was redundant.

**ACTIVE PHASE 3 METHOD:** First inventory previously locked design/UX decisions against Phase 1 page families and Phase 2 journeys; produce a compact coverage matrix with three labels: already locked, design-level specification still needed, genuinely unresolved material choice. Draft missing page-family briefs and responsive interaction principles directly where no owner tradeoff is required. Ask the owner only for a consequential unresolved experience choice that changes a meaningful customer or staff journey. Avoid speculative design questions, UI microstates and premature Phase 4 architecture. The existing Adaptive Gallery direction remains authoritative. **Next action:** targeted Phase 3 design-gap audit, then fill only genuine gaps.


## 2026-11-04 — Phase 3 UX audit reference

The targeted Phase 3 design gap audit is in docs/roadmap/phase-3-ux-coverage-audit.md. Previously approved visual, navigation and search choices remain locked. No missing major page family was found. Next: customer page-family experience briefs, then consolidated staff admin UX, then Phase 3 sign-off. Phase 4 remains deferred.


## 2026-11-04 — Phase 3 page-family UX draft specifications

Prepared two consolidated design-level drafts: [customer-facing page families](../roadmap/phase-3-customer-page-family-specification.md) and [staff administration patterns](../roadmap/phase-3-admin-ux-specification.md). They translate existing locked visual, navigation, purchase-mode and operational rules into page purposes, content hierarchy, primary actions, responsive behaviour and staff worklist/record-detail patterns. These drafts **do not** add new owner-approved business policies or imply pixel-perfect comps, implementation, QA or Phase 3 sign-off. Next: cross-surface consistency/gap review and owner Phase 3 design acceptance; Phase 4 remains on hold.


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

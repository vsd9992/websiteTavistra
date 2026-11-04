# Proposed technical architecture and publishing

> **CURRENT EFFECTIVE POLICY (2026-11-04):** Architectural candidates remain recommendations. Historical WEB-040AK references below requiring **full payment before MTO production**, historical Quote Only/coupon/WEB-038 OPEN flags and optional courier/live-rate assumptions are superseded where conflicting. Effective rules: [cross-phase baseline](../roadmap/current-effective-handoff-baseline.md), [current payment/production lifecycle](../decisions/current-production-payment-lifecycle.md). Hostinger small VPS selected direction, PhonePe intended gateway pending merchant approval; separate mode-specific orders/fulfilment; >=25% verified MTO and Quote Only production, 100% dispatch; independent 30-day quote and confirmed-order 7-day grace. No execution authorised.


**Status distinction:** Architectural principles below are accepted where described; exact frameworks, vendors and hosting sizes remain candidates.

## Logical applications
Owner favours distinct **storefront**, **admin**, and shared **backend API** with one deployment if operationally simpler. Modular monolith preferred over microservices for initial scale; one mono-repository plausible.

**Candidate stack, NOT locked**: Next.js + React/TypeScript storefront; Vite + React/TypeScript admin; Node/TypeScript backend (Rust/Axum viable alternative); PostgreSQL; standard Linux VPS; reverse proxy; containers or process manager; local/object media storage with independent backups; SMTP library matched to backend language; self-hostable auth, job queue and analytics.

## Rendering
Public content initial HTML via SSG/ISR/SSR as appropriate. CSR for authenticated/admin UI, cart, filters and interactive widgets. Always check live stock and authoritative selling prices in backend before accepting order/payment. Product pages' stale cached availability cannot authorize purchase. Evaluate complexity of ISR and cache invalidation before choosing exact framework.

## Publishing model (strong preference; accepted in principle)
- Product-heavy editorial fields and images authored as `product.md` with YAML front matter + dedicated media folder; similar to earlier VDesign blog file-based content workflow.
- **Commercial state excluded from Markdown**: live selling price, stock/reservations, batches, accounts, payments, orders, shipment history, taxes/refunds and permissions reside in transactional database.
- Pipeline: upload -> schema validation/safe Markdown handling -> image/reference validation -> draft preview -> approve/publish -> versioned representation/cache invalidation/sitemaps.
- Never blindly scan full filesystem for every incoming request; produce validated published representation. Never run arbitrary JavaScript/HTML supplied by product uploads.
- Content metadata for product identity, material, specs, care, design story, image alt text, curated SEO titles/descriptions, collections and factual FAQs. Maintain consistency with authoritative offers.

## Search discovery
Technical SEO: clean crawlable routes, canonicalization, sitemaps, redirects, Open Graph/image optimization, internal links, fast/mobile accessibility, server-rendered Product/Offer/Breadcrumb/Organization schema when eligible. AEO/GEO rely on accessible factual product info, consistent brand details and original authoritative evidence; no separate magic indexing guarantee. Generate page metadata and JSON-LD from validated editorial + commerce records; don't rely entirely on browser-side JS.

## Data/transactions
PostgreSQL preferred for transactional integrity/concurrent inventory. Maintain SKU/batch movement ledger or equivalent auditable inventory events; reserve/release stock safely, separate ready-stock and make-to-order availability. Orders/payment/shipment/production are independent state machines with historical events. Guest sessions opaque; guest access verified and expiring. Backend is source of truth for price, inventory, payment, order authorization.
 
## Service portability
Default to maintained open-source/self-hostable components with compatible commercial licenses; no fee-bearing or usage-restricted dependency where avoidable. External payment gateway remains necessary, courier APIs optional. PHPMailer was prior experience, **not a requirement**: use language-native SMTP and queued/retriable email delivery. SMTP provider/relay and email deliverability still need configuration; don't introduce PHP just to send mail.

## Deployment
Tavistra VPS only, distinct from VDesign. Linode or Hostinger VPS under evaluation; existing Hostinger account only supports static assets. A 4GB VPS was a planning estimate **not** a purchased or benchmarked requirement. Evaluate CPU, RAM, disk I/O, backups, network, Indian latency, cost and portability before selection. No provider lock-in designed into core.

## 2026-10-28 — Internal delivery pricing architecture clarification
- **LOCKED:** Tavistra maintains its own shipping-rate tables/rules in the application, using configured destination/distance, size, weight, fragility and fulfilment factors. The storefront's single estimate request is handled by Tavistra backend against internal data; **no courier API, live courier pricing, or courier provider fallback** is part of delivery estimation.
- Courier selection, dispatch, tracking link and status updates are managed independently as operational fulfilment steps. Customer delivery charges are based on Tavistra's policy, not a live courier quote; courier cost and customer charge may differ.
- Internal zone/distance mapping, calculation formulas, rate-versioning and admin UX remain to be specified. Existing historical mentions of optional courier APIs are **not an active integration requirement**; this clarification supersedes conflicting delivery-estimation proposals.
- Checkout recomputes and discloses the final delivery charge before order confirmation; WEB-038 cart interaction remains DEFERRED.

## 2026-10-28 — Admin-maintained pincode distance reference
- **LOCKED (WEB-040K):** delivery pricing uses internally assigned **presumptive kilometres per exact pincode or pincode range**, maintained by Tavistra admin. No live route calculation or courier API; kilometre values are pricing proxies.
- Proposed implementation: versioned origin-aware pincode/range mappings, validation against ambiguous overlap, and clear distinction between absent mapping and explicit no-service status. Exact schema and precedence unapproved.
- **OPEN (WEB-040L):** charge calculation using presumptive kilometres with package weight, size and fragility factors.
- **DEFERRED (WEB-038):** cart interaction unchanged.

## 2026-10-28 — Distance-band rate engine
- **LOCKED (WEB-040L):** Tavistra internal shipping pricing uses configured distance bands over presumptive kilometres assigned to destination pincode/range, each with an admin-maintained base delivery charge. No live courier API or per-km tariff.
- **PROPOSED:** packed weight/dimensions and volumetric divisor, handling/fragility surcharge, minimum delivery charge floor, versioned rules, clear missing-configuration feedback and final checkout recalculation. Exact formulas and numeric tariffs remain open.
- **OPEN (WEB-040M):** chargeable weight policy; multi-item packing and cart interaction remain undecided (WEB-038 DEFERRED).

## 2026-10-28 — Customer-facing price composition
- **LOCKED (WEB-040N):** Tavistra exposes only **product price** (all-inclusive, packaging and product handling absorbed, applicable product taxes included) and **delivery charge** if applicable. No separate customer-facing packaging, chargeable-weight, volumetric, fragile-handling or minimum-charge components.
- Backend may retain shipment dimensions, weight and fragility for fulfilment and possible internal shipping rate calculation, but such use remains unapproved (WEB-040O OPEN). Any permitted shipping adjustments roll into one delivery amount; avoid double recovery.
- Checkout discloses final payable total and accurately accounts for applicable delivery taxes; no courier API. WEB-038 cart interaction remains DEFERRED.

## 2026-10-28 — Shipment adjustments in internal delivery engine
- **LOCKED (WEB-040O):** backend calculates one delivery charge from a configured distance-band base plus applicable internal transport-related shipment adjustments (weight, packed size, fragility). Customer sees only all-inclusive product price and one delivery charge if applicable; never separate adjustment lines or duplicate product-included packaging/handling costs.
- **PROPOSED:** versioned rule engine with configurable thresholds, minimum floor, explicit free-shipping eligibility, clear missing-configuration/manual-review states and checkout recalculation. Exact calculation and tax sequencing remain open.
- **OPEN (WEB-040P):** adjustment structure; chargeable-weight basis WEB-040M remains open and internal only. No courier APIs. **WEB-038 cart interaction DEFERRED.**

## 2026-10-28 — Fixed / bracketed shipment pricing engine
- **LOCKED (WEB-040P):** backend calculates delivery from one presumptive-km distance-band base plus applicable **fixed/bracketed** transport-related adjustments for packed weight, dimensions/oversize and fragility. No courier API or live rate lookup. Exact rates, thresholds and adjustment stacking are unapproved.
- **LOCKED (WEB-040N):** one all-inclusive product price (including packaging/ordinary handling and applicable product taxes) plus one delivery charge if applicable; no separate customer-facing weight, packaging, fragile or minimum-charge lines. Do not double recover product-included costs.
- **PROPOSED:** non-overlapping brackets, versioned rules, missing-data/manual-review states, configurable minimum floor and explicit zero/free-delivery eligibility, checkout final calculation. Shipping tax handling remains to be verified.
- **OPEN (WEB-040M):** internal actual-vs-volumetric-vs-class-specific weight basis. Multi-item packing/aggregation unapproved; **WEB-038 cart interaction DEFERRED**.

## 2026-10-28 — Internal chargeable-weight engine approved
- **LOCKED (WEB-040M):** derive packed actual kg and packed-dimension volumetric kg using an administrator-configurable divisor; use `max(actual, volumetric)` for internal bracket selection. Divisor value, numeric bracket limits, rounding and shipping rates unapproved.
- **PROPOSED:** server-authoritative packed measurements, non-overlapping bracket validation, dimension/oversize rules for distinct transport constraints only, transport-related fragility, minimum/waiver exceptions, versioned rules and checkout recalculation.
- **LOCKED (WEB-040N):** all-inclusive product price plus one combined delivery charge if applicable, with no separate weight/packaging fees or double recovery. No courier API. **WEB-038 DEFERRED.**
- **OPEN (WEB-040Q):** bracket application method and remaining numerical rules.

## 2026-10-28 — Single-bracket weight adjustment
- **LOCKED (WEB-040Q):** backend calculates chargeable packed weight (max actual/volumetric), matches **one** weight bracket and applies that bracket's single fixed shipping adjustment; no cumulative weight thresholds.
- **PROPOSED:** admin-editable contiguous kg ranges, validated overlaps and boundary precision, distinct oversize transport rules, fragility classes, minimum floor and explicit free-shipping/exception handling. No missing-rate-as-zero fallback.
- **OPEN (WEB-040R):** bracket configuration policy; numeric tariffs and thresholds, volumetric divisor, multi-item packing and delivery tax remain open.
- **LOCKED (WEB-040N):** only all-inclusive product price plus one combined delivery charge if applicable; no separate packaging/weight/handling fees. No courier APIs. **WEB-038 DEFERRED.**

## 2026-10-28 — Predefined weight-bracket configuration
- **LOCKED (WEB-040R):** application supplies a predefined/versioned weight-bracket schedule with fixed kg boundaries; admin edits only the fixed ₹ adjustment per bracket. Actual boundary values and tariff amounts remain OPEN. No cumulative threshold charging.
- **PROPOSED:** bracket IDs and schedule versioning, boundary/rounding validation, missing-rate handling, separate dimensional transport thresholds, fragility, minimum floor/waiver and checkout recalculation. Missing adjustment is not free delivery.
- **OPEN (WEB-040S):** packed-dimension transport adjustment policy, then fragility/minimum/exception decisions individually.
- **LOCKED (WEB-040N):** all-inclusive product price plus one delivery charge if applicable, with no separate customer-facing weight/packaging/fragility fees or double recovery. No courier API. **WEB-038 DEFERRED.**

## 2026-10-28 — Longest-side dimensional transport rule
- **LOCKED (WEB-040S):** internal rate engine computes `longest_packed_side_cm = max(packed_length_cm, packed_width_cm, packed_height_cm)`; when longer than configured threshold, apply fixed transport-only dimensional adjustment. Threshold/₹ amount OPEN.
- This is distinct from volumetric-weight pricing; avoid charging the same size factor twice. Product packaging and ordinary handling remain in product price.
- **PROPOSED:** admin threshold validation, authoritative packed measurements, unavailable-estimate/manual-review states, rule audit/versioning and checkout recomputation.
- **OPEN (WEB-040T):** fragility class policy, then minimum floor/waivers and exceptions.
- **LOCKED (WEB-040N):** only all-inclusive product price plus one combined delivery charge if applicable. No courier APIs. **WEB-038 DEFERRED.**

## 2026-10-28 — Universal fragile handling, no fragility surcharge
- **LOCKED (WEB-040T):** all products treated as fragile. Standard protective packaging and fragile handling included in product price, so the backend **does not calculate an automatic fragility transport adjustment** and does not need routine fragile/special handling price classes.
- Internal shipping amount is based on distance band + single weight bracket + applicable distinct longest-side adjustment, subject to still-open minimum/waiver, exceptional freight and tax rules. Exceptional transport is not automatically chargeable merely due to fragility.
- **OPEN (WEB-040U):** minimum delivery charge policy; no amount or waiver/tax sequence approved.
- **LOCKED (WEB-040N):** all-inclusive product price plus one combined delivery charge if applicable. No courier APIs; **WEB-038 DEFERRED**.

## 2026-10-28 — Per-distance-band minimum delivery floor
- **LOCKED (WEB-040U):** internal distance-band configuration contains an admin-editable minimum delivery charge; for valid ordinary eligible calculations `floor_result = max(distance_base + one_fixed_weight_adjustment + applicable_longest_side_adjustment, band.minimum_delivery_charge)`. No global minimum; actual values OPEN.
- **OPEN (WEB-040V):** free-delivery/waiver override policy, promotion precedence and legally correct shipping tax/rounding.
- **PROPOSED:** validate missing band minimum, base, weight adjustment, packed dimensions and destination mapping; separate missing-rate/manual-review/unsupported/error states; version and audit rate calculations.
- **LOCKED (WEB-040N/T):** only all-inclusive product price plus one delivery charge if applicable; no fragility surcharge or separate packing/weight/minimum fee lines. No courier APIs. **WEB-038 DEFERRED.**

## 2026-10-28 — Waivers and coupons approved
- **LOCKED (WEB-040V):** valid explicit free-delivery waivers override distance-band minimums, without treating missing rates as free delivery.
- **LOCKED (WEB-040W):** support free-delivery coupons and product-discount coupons. Coupon validation, limits, stacking and tax treatment remain OPEN.
- **LOCKED (WEB-040N):** discounted all-inclusive product amount plus one delivery charge if applicable; savings may be explained without adding cost components.
- **OPEN (WEB-040X):** missing-rate and manual-review response policy.
- No courier API. **WEB-038 DEFERRED.**

## 2026-10-28 — Missing-rate state in internal delivery engine
- **LOCKED (WEB-040X):** missing mapping/rate/minimum/required shipment data yields a nonnumeric "Delivery estimate unavailable" response; manual review may be requested, not auto-created for every failure. Never silently treat missing data as free shipping or an unsupported destination.
- **PROPOSED:** structured internal reason codes and distinct `estimate_unavailable`, `destination_not_covered` (only explicit exclusion), `manual_review_required` (criteria OPEN) and `calculation_error` states; require resolved final payable total before order confirmation.
- **OPEN (WEB-040Y):** admin explicit destination exclusion model, then exceptional shipment manual-review policy separately.
- **LOCKED (WEB-040N):** two customer-facing charge components, discounted all-inclusive product amount plus one delivery charge if applicable. Coupon specifics OPEN. No courier APIs. **WEB-038 DEFERRED.**

## 2026-10-28 — Registered-pincode coverage approved
- **LOCKED (WEB-040Y):** Tavistra delivers only to registered pincodes. Unregistered -> delivery unavailable; registered with missing rate -> estimate unavailable under WEB-040X, with review possible.
- Coverage and price completeness are separate; coupon waivers do not extend delivery to unregistered pincodes.
- **OPEN (WEB-040Z):** exceptional shipment review triggers and workflow.
- **LOCKED (WEB-040N):** two customer-facing charge components. Coupon details OPEN. **WEB-038 DEFERRED.**

## 2026-10-28 — Normal calculator for complete shipments
- **LOCKED (WEB-040Z):** no exceptional-shipment hold based on size/weight alone, and no special admin review flag required. Use normal internal delivery calculation whenever coverage and complete valid pricing inputs permit. WEB-040S longest-side surcharge remains a pricing rule, not a manual-review trigger.
- **LOCKED (WEB-040X/Y):** registered with incomplete rate -> estimate unavailable and review possible; unregistered -> delivery unavailable. No automatic courier API.
- **OPEN (WEB-040AA):** manual-review case initiation and staff approval/resumption.
- **LOCKED (WEB-040N):** only discounted all-inclusive product amount plus one delivery charge if applicable. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 — Customer-initiated review request lifecycle
- **LOCKED (WEB-040AA):** `estimate_unavailable` for a registered pincode can expose an explicit customer-submitted "Request delivery estimate" action. Do not auto-create a request from estimate lookup or checkout attempt. Unregistered pincode -> `destination_not_covered`, no review request in this flow.
- **PROPOSED:** create a distinct request record only on intentional submission, retain request/shipment context and internal audit; no order, payment or quote promise until staff approval and customer acceptance.
- **OPEN (WEB-040AB):** authorised quote approval roles, then quote publication/checkout resumption rules.
- **LOCKED (WEB-040N):** two customer-facing charge components; coupon details OPEN. No courier API. **WEB-038 DEFERRED**.

## 2026-10-28 — Permission-gated manual delivery quote approval
- **LOCKED (WEB-040AB):** preparation and approval are separate actions. Only an authenticated admin explicitly granted delivery-quote approval permission may approve and release a manual delivery charge. Generic admin access does not suffice. Backend must enforce the permission.
- **PROPOSED:** preserve quote/request association, approval actor/time, amount, change history and validity; exact audit/expiry controls remain OPEN.
- **OPEN (WEB-040AC):** checkout resumption and customer acceptance after approval.
- **LOCKED (WEB-040N):** two customer-facing charge components only. Coupon details OPEN. No courier APIs. **WEB-038 DEFERRED**.

## 2026-10-28 — Approved manual quote creates unpaid order
- **LOCKED (WEB-040AC):** only after explicit delivery-quote approval permission is checked and approval succeeds, create an associated **unpaid order** automatically. Quote request alone never creates an order. Do not automatically collect payment or mark paid/fulfillable.
- **PROPOSED:** approval/order creation atomic and idempotent, secure order-payment access, traceability to request/approver/approved amount and server-verified payment.
- **OPEN (WEB-040AD):** quote validity policy, expiry handling, customer notification and unpaid-order lifecycle.
- **LOCKED (WEB-040N):** two customer-facing charge components only. Coupon details OPEN. No courier APIs. **WEB-038 DEFERRED**.

## 2026-10-28 — Configured quote validity and payment gate
- **LOCKED (WEB-040AD):** centrally admin-configurable manual delivery quote validity period; compute deadline at approval. After expiry, stale approved delivery charge cannot be paid without revalidation. Duration, clock precision, changes to settings and order expiry lifecycle OPEN.
- **LOCKED (WEB-040AC):** approval creates unpaid order; no automatic payment or fulfilment. Quote expiry is not itself order deletion.
- **OPEN (WEB-040AE):** outbound customer notification channel and retry/recovery policy.
- **PROPOSED:** server-side expiry checks before payment, audit of approved amount/deadline and secure guest order access; details not yet approved.
- **LOCKED (WEB-040N):** two customer-facing charge components. Coupon details OPEN. No courier APIs. **WEB-038 DEFERRED**.

## 2026-10-28 — SMTP customer notice and secure order access
- **LOCKED (WEB-040AE):** following permission-gated approval and unpaid-order creation, send Tavistra SMTP transactional email containing order reference, approved payable total, quote deadline and secure customer-specific order/payment access link.
- No SMS/WhatsApp or courier API required. Email send status is independent from order/payment status; email failure cannot create duplicate orders or mark paid.
- **PROPOSED:** authenticated or tokenised secure guest access, retries, idempotent notification and audit; exact design OPEN.
- **OPEN (WEB-040AF):** expired quote/unpaid-order lifecycle and revalidation.
- **LOCKED (WEB-040N):** two customer-facing charge components only. Coupon details OPEN; **WEB-038 DEFERRED**.

## 2026-10-28 — Expired manual quote cancellation state
- **LOCKED (WEB-040AF):** on quote deadline, if associated order is unpaid, automatically transition it to cancelled; reject payment attempts against expired/cancelled quote/order and require a new customer review request and order. Never cancel an already successfully paid order solely due to quote expiry.
- **PROPOSED:** idempotent expiry processing, preserve audit and cancelled order history, payment-state reconciliation for in-flight transactions. Exact race/refund behavior OPEN.
- **OPEN (WEB-040AG):** inventory reservation and release for unpaid manual-quote orders.
- **LOCKED (WEB-040N):** two customer-facing charge components only. Coupon details OPEN. No courier APIs. **WEB-038 DEFERRED**.

## 2026-10-28 — Ready-stock reservation tied to unpaid quote lifecycle
- **LOCKED (WEB-040AG):** reserve eligible available ready-stock units at authorised quote approval/unpaid-order creation; exclude held units from other sales while quote valid. On WEB-040AF automatic cancellation for expiry/nonpayment, release reserved units; if payment succeeded, retain order allocation beyond original deadline.
- **PROPOSED:** transactional stock hold and release with idempotency, avoid negative stock and duplicate reservation. Made-to-order/quote-only, insufficient stock, partial orders, and payment races OPEN.
- **OPEN (WEB-040AH):** expiry cancellation email versus order status only versus staff-triggered email.
- **LOCKED (WEB-040N):** two customer-facing charge components only. Coupon details OPEN. No courier APIs. **WEB-038 DEFERRED**.

## 2026-10-28 — Automated cancellation notification state
- **LOCKED (WEB-040AH):** after WEB-040AF cancellation of unpaid expired manual quote order and WEB-040AG reservation release, dispatch Tavistra SMTP transactional cancellation email with order reference, cancellation reason, stock-release explanation and new-request instruction. No active payment link for cancelled order.
- **PROPOSED:** event-driven, idempotent email enqueue/send separate from cancellation transaction; exact retries, delivery audit and bounce handling OPEN.
- **OPEN (WEB-040AI):** stock-shortfall policy before approval creates unpaid order.
- **LOCKED (WEB-040N):** two customer-facing charge components only. Coupon details OPEN. No courier APIs. **WEB-038 DEFERRED**.

## 2026-10-28 — Ready-stock sufficiency gate
- **LOCKED (WEB-040AI):** full available stock for every requested ready-stock SKU/variant is a precondition of permission-gated quote approval and automatic unpaid-order creation. Shortfall -> keep review pending, no unpaid order and no partial reservation/backorder/override. On successful approval, reserve eligible units per WEB-040AG.
- **PROPOSED:** transactional availability check + reservation, concurrency/idempotency, staff shortfall display. Exact implementation OPEN.
- **OPEN (WEB-040AJ):** made-to-order line treatment, quote-only line treatment separate.
- **LOCKED (WEB-040N):** two customer-facing charge components only. Coupon details OPEN. No courier APIs. **WEB-038 DEFERRED**.

## 2026-10-28 — Made-to-order line classification and reservation
- **LOCKED (WEB-040AJ):** Made to Order lines may appear in manual-delivery approved unpaid orders; no finished-stock allocation for those lines. Mixed orders reserve/check full quantities only for Ready Stock lines per WEB-040AI/AG. Do not invent a finished-goods hold for unmade units.
- Delivery quote approval/order creation does not trigger production or imply capacity/lead-time promise. Quote Only participation OPEN.
- **OPEN (WEB-040AK):** production-start eligibility (payment vs staff approval vs deposit). Scheduling and production-state machine details OPEN.
- **LOCKED (WEB-040N):** two customer-facing charge components only. Coupon details OPEN. No courier APIs. **WEB-038 DEFERRED**.

## 2026-10-28 — Made to Order production payment gate
- **LOCKED (WEB-040AK):** a Made to Order line in a manual-delivery approved order is eligible for production only when **full order payment is successfully verified by trusted server-side payment processing**. Pending/partial/deposit payments, client success redirect, unpaid order or staff prepayment authorisation cannot bypass gate.
- Eligibility must remain distinct from production release/start; exact scheduling and permission rules OPEN. Payment/expiry races and refunds OPEN.
- **PROPOSED:** auditable state transitions and idempotent verification. Exact gateway implementation OPEN.
- **OPEN (WEB-040AL):** post-payment production release.
- **LOCKED (WEB-040N):** two customer-facing charge components only. Coupon details OPEN. No courier APIs. **WEB-038 DEFERRED**.

## 2026-10-28 — Manual Made to Order production release state
- **LOCKED (WEB-040AL):** server-verified successful full payment (WEB-040AK) makes Made to Order items eligible, transitioning to an internal Awaiting Production Release state. Only an explicit action by authorised staff releases them to production after readiness/capacity check. Never automatically release on payment or permit staff to bypass full payment.
- **PROPOSED:** server-enforced authorisation and payment gate, audit actor/time and idempotent state transition. Exact release permissions, production scheduling and stage granularity OPEN.
- **OPEN (WEB-040AM):** production-release permission model; Quote Only workflow OPEN.
- **LOCKED (WEB-040N):** two customer-facing price components only. Coupon details OPEN. No courier APIs. **WEB-038 DEFERRED**.

## 2026-10-28 — Permission-enforced Made to Order release
- **LOCKED (WEB-040AM):** require authenticated user with explicit Production Release permission and trusted verified full order payment before allowing manual release of Made to Order items from Awaiting Production Release. Ordinary admin privileges do not suffice; not owner-only.
- **PROPOSED:** backend authorisation on every release, auditable actor/time, idempotent release, immediate effect of permission revocation. Permission administration details OPEN.
- **OPEN (WEB-040AN):** release granularity per line/order; Quote Only treatment OPEN.
- **LOCKED (WEB-040N):** two customer-facing price components only. Coupon details OPEN. No courier APIs. **WEB-038 DEFERRED**.

## 2026-10-28 — Dual-granularity Made to Order release
- **LOCKED (WEB-040AN):** implement explicit manual release for an eligible Made to Order order line and a whole-order action, both gated by server-verified full payment (WEB-040AK) and explicit Production Release permission (WEB-040AM). Track release status per line; one-line release must not mutate unrelated lines.
- **PROPOSED:** auditable idempotent transitions and concurrency protection; exact mixed-readiness bulk behaviour OPEN (WEB-040AO).
- Quote Only participation OPEN. **LOCKED (WEB-040N):** two customer-facing price components only. Coupon details OPEN. No courier APIs. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040AO whole-order production release
- **LOCKED:** Release Whole Order must validate readiness of all currently unreleased Made to Order lines. If any line is not ready, no unreleased line changes release status. Already released lines are not released again.
- Enforce verified full payment and explicit Production Release permission server-side. Apply whole-order release atomically; implementation of concurrency, audit and retries remains OPEN.
- **OPEN WEB-040AP:** method for confirming readiness. Quote Only and coupon details OPEN. Customer-facing price components remain discounted tax-inclusive merchandise and one delivery charge if applicable. No courier APIs. WEB-038 DEFERRED.

## 2026-10-28 — WEB-040AP readiness state
- **LOCKED:** maintain independently recorded Ready for Production state per Made to Order order line, explicitly confirmed by staff after specifications/materials/capacity review. Confirmation must not trigger production release. Release continues to require verified full payment and explicit Production Release permission.
- **LOCKED:** whole-order release checks all unreleased line readiness and changes none if any fail (WEB-040AO).
- **PROPOSED:** audit readiness actor/time and handle revocation/stale state; exact permission and state transition mechanics OPEN.
- **OPEN WEB-040AQ:** who can confirm readiness. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. No courier APIs. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040AQ production readiness permission enforcement
- **LOCKED:** use existing explicit Production Release permission for both readiness-confirmation and release endpoints; authenticate and authorise on backend for each operation. Preserve separate readiness and release state transitions. Ordinary admin role alone insufficient.
- Production release still requires trusted verified full payment (WEB-040AK); readiness confirmation does not bypass it. Exact audit/revocation and checklist details OPEN.
- **OPEN WEB-040AR:** readiness checklist structure. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. No courier APIs. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040AR single-attestation readiness state
- **LOCKED:** an authorised staff user with Production Release permission may explicitly attest Ready for Production for a Made to Order line without required per-checklist fields or supporting evidence. Backend checks permission; readiness is independently stored and must not itself trigger release.
- Release separately enforces verified full payment and readiness, with whole-order all-or-nothing semantics (WEB-040AO). Exact audit, optional notes and withdrawal policy remain OPEN.
- **OPEN WEB-040AS:** readiness withdrawal before release. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. No courier APIs. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040AS irreversible readiness state
- **LOCKED:** Ready for Production is a one-way attestation per Made to Order order line; after confirmation, no transition back to Not Ready, including prior to release. Backend must not expose a readiness-withdrawal action. Release remains separate, manually permission-gated and dependent on verified full payment.
- **OPEN WEB-040AT:** possible independent pre-release operational hold when circumstances change; hold state must not be mistaken for readiness reversal. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. No courier APIs. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040AT omit pre-release hold state
- **LOCKED:** no pre-release operational hold/unhold state, endpoint, required reason or order-wide hold for Made to Order. Irreversible readiness remains as recorded; authorised staff withhold release when current operating conditions are unsuitable.
- Preserve separate manual release and existing backend full-payment, explicit-permission and readiness checks. No machine-enforced hold is implied.
- **OPEN WEB-040AU:** production release confirmation interaction. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. No courier APIs. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040AU direct production-release action
- **LOCKED:** individual and whole-order release endpoints may be invoked by one explicit staff click with no second confirmation step. Server validates verified full payment, explicit Production Release permission and line readiness; whole-order changes are atomic for unreleased target lines.
- Present release scope in UI before action; no mandatory typed phrase, reason or checklist. No separate pre-release hold state.
- **OPEN WEB-040AV:** duplicate-click, retries and idempotency policy. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. No courier APIs. **WEB-038 DEFERRED**.

## 2026-10-28 — WEB-040AV reject duplicate release at backend
- **LOCKED:** production release transition must be guarded against duplicate/concurrent execution. If target line is already Released, return an **Already Released** error without any second production release. Do not treat duplicate requests as successful idempotent releases.
- Whole-order release atomically operates on currently unreleased lines only; previously released lines are untouched. Empty unreleased target set returns Already Released. For nonempty targets, require all Ready plus verified full payment and explicit Production Release permission. Ensure concurrent losing requests do not cause partial updates or duplicate production work.
- **OPEN WEB-040AW:** audit record details. Quote Only and coupon details OPEN. WEB-040N two customer-facing price components unchanged. No courier APIs. **WEB-038 DEFERRED**.

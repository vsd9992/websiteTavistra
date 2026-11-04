# Tavistra — Customer journey and page coverage audit

**Date:** 2026-10-28  
**Phase:** 1 — complete website blueprint  
**Status:** DRAFT COVERAGE AUDIT, not approval of exact routes, page count or detailed UI.  
**Evidence:** `docs/decisions/decision-register.md`, `docs/website/requirements.md`, `docs/roadmap/master-website-blueprint.md`.

## Rule of review

Do not reopen accepted capability decisions. Distinguish **locked requirements**, **documented scope**, and **actual gaps**. A proposed page below is a destination/functional grouping, not an approved URL or UI pattern.

## Customer-facing destinations and use cases

| Destination / conceptual page | Primary user jobs | Evidence and status | Gap remaining |
|---|---|---|---|
| Product detail | Understand specifications, purchase mode, published tax-inclusive product price, optional pincode delivery estimate, care, and help/enquiry path | Requirements; WEB-040E/F/G and related pricing rules LOCKED | Exact CTA composition by purchase mode, especially Quote Only, OPEN |
| Cart / order review | Inspect intended items, quantities, product amount and one delivery charge, then continue checkout | Cart and checkout in scope; WEB-040N LOCKED | WEB-038 cart page vs drawer DEFERRED; multi-mode/mixed-order behavior not assumed |
| Checkout: identity and address | Continue as guest or authenticated customer; enter verified contact, delivery address | WEB-005 LOCKED; requirements | Screen split and validation UX DRAFT |
| Checkout: final totals and payment | Verify final delivery charge, tax-inclusive products, final payable total; submit payment securely | WEB-040N and WEB-040F LOCKED; backend payment verification required | Payment gateway WEB-018 DEFERRED; coupons OPEN; Quote Only OPEN |
| Payment pending / interrupted / failed | Understand payment is not yet confirmed, safely retry/recover without duplicate order or assumed success | Recovery required in requirements | Exact destination, retry/reconciliation and customer messaging DRAFT |
| Order confirmation | Show verified order status and order reference; offer order details and support | Requirements imply confirmation and recovery | Exact confirmation view DRAFT; do not imply payment success from client redirect |
| Guest order access/recovery | Retrieve own order via expiring link or verified contact, without mandatory account | WEB-005 LOCKED; requirements | Exact verification channel/expiry and destination DRAFT |
| Account sign-in/registration | Authenticate for optional account access | Requirements | Exact screens/identity provider DRAFT |
| Account profile/addresses | Maintain identity/contact and saved delivery addresses | Requirements | Edit/security flow and address verification DRAFT |
| Account orders / order detail | Review past orders, payment and fulfilment statuses, line items, support link | Requirements | Exact page split, cancellation/refund request policy OPEN |
| Order tracking | See staff-entered dispatch/courier/tracking number/link and timeline | WEB-019 LOCKED | Exact tracking presentation DRAFT; no carrier-verified claims |
| Manual delivery estimate request/status | Submit explicit request for registered pincode with missing rate; later access approved unpaid order/payment link | WEB-040AA–AH LOCKED | Whether a dedicated status page or order detail view is best remains DRAFT; no new approval needed yet |
| Custom enquiry | Submit custom request and follow up | WEB-004 and requirements | Exact enquiry status/communication destinations DRAFT; Quote Only participation OPEN |
| Contact/support and case status | Raise issue from product, checkout, order or footer; track response | OPS-003 LOCKED; requirements | Dedicated case-status page vs integrated order/support view DRAFT |
| Policy/help | Read FAQ, care, shipping, returns, privacy and terms | Requirements | Exact grouping and legal text TBD; do not invent policy |

## Primary cross-page journeys to validate in Phase 2

1. **Ready Stock:** Product → Cart → Guest/account checkout → final delivery/total → payment → verified confirmation → order detail/tracking → support.
2. **Made to Order:** Product → checkout/payment → verified confirmation → authorized staff readiness/release (internal) → customer order status → dispatch/tracking → support. Do not invent production completion stages.
3. **Custom Enquiry:** Product or contact → enquiry submission → secure follow-up; no automatic checkout conversion for Quote Only.
4. **Interrupted payment:** Checkout → pending/failure → backend reconciliation → safe recovery/retry → confirmed order or support. Do not infer paid state from browser return.
5. **Guest order recovery:** Order reference/email touchpoint → secure identity verification or expiring link → order details/tracking/support. Order number plus email alone is insufficient proof.
6. **Missing delivery rate:** Product pincode check → explicit manual estimate request → authorized admin quote approval → automatically created unpaid order → transactional secure payment link → verified payment or expiry cancellation. WEB-040AA–AH govern this exceptional path.
7. **After-sales issue:** Order detail/tracking or help → support case → administrative response and resolution; refund/return policy details not fabricated.

## Gap-only findings

| Priority | Gap | Recommended handling |
|---|---|---|
| P0 | **No consolidated page-level map for payment pending/failure/recovery, order confirmation and guest access.** | Keep all destinations in blueprint as conceptual screens; map their transitions in Phase 2. |
| P0 | **Customer-facing representation of mixed purchase modes is not settled**, especially Quote Only and coupon details. | Preserve as explicit OPEN business-policy gates; do not resolve by drafting page structure. |
| P1 | **No approved page grouping** for account orders vs order detail vs tracking, and guest access to same underlying order. | Propose one shared order-detail capability with secure guest/account access, pending page-level review; not a locked architecture. |
| P1 | **Manual delivery review needs an end-to-end customer destination map.** | Reuse existing locked quote, email, expiry and unpaid-order rules; avoid reopening them. |
| P1 | **Support-case visibility and customer follow-up page grouping is unconfirmed.** | Include capability, decide page split during page-level design if material. |
| P2 | **Exact URL structure, visual layout, field placement and micro-interactions** are not approved. | Defer to Phase 3, not a Phase 1 blocker. |

## What is already covered

- Guest checkout and secure guest recovery (WEB-005).
- Product, cart, checkout, account, tracking and support **capability scope** in website requirements.
- Manual multi-courier customer tracking (WEB-019).
- Customer issue-report path and admin support case workflow (OPS-003).
- Manual delivery estimate approval → unpaid order → secure email link → expiry cancellation and ready-stock reservation (WEB-040AA–AH).
- Full verified payment prerequisite for Made to Order release (WEB-040AK onward).
- Exactly two customer-facing price components (WEB-040N).

## Next Phase 1 work

**Admin module and role/use-case coverage audit**, then a unified sitemap/coverage matrix. Do not request owner approval for page labels or alternate navigation that existing decisions already cover. Raise only genuinely unresolved major product boundaries after tracing existing records.

## Preserved constraints

Quote Only treatment **OPEN**; coupon details **OPEN**; exactly two customer-facing price components (discounted tax-inclusive product price and one combined delivery charge if applicable); WEB-038 cart interaction **DEFERRED**.

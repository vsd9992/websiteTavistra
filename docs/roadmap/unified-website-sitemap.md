# Tavistra — Unified conceptual website sitemap and use-case coverage

**Date:** 2026-10-28
**Phase:** 1 — complete website blueprint
**Status:** OWNER-APPROVED PHASE 1 CONCEPTUAL COVERAGE (2026-10-28). Not approved routes, menu labels, screen count or finished implementation.
**Source audits:** [Customer journey coverage](customer-journey-coverage.md), [Admin module coverage](admin-module-coverage.md), [Master blueprint](master-website-blueprint.md).

## 1. Site surfaces

### A. Public storefront
- Home
- Shop / all products
  - Six approved category landing destinations
  - Approved subcategory destinations within category pages
  - Product details (per-product purchase mode: Ready Stock, Made to Order, Custom Enquiry; Quote Only treatment OPEN)
- Collections / curated collection destinations (distinct from taxonomy)
- Search/results (compact overlay entry, dedicated results page; WEB-037/039)
- Our Story and appropriate craftsmanship/materials editorial
- Contact, help/FAQ, care, shipping, returns, legal/policy information

**Existing navigation decisions:** desktop Shop curated mega-menu WEB-035; mobile Shop → Shop All + six categories WEB-036; adaptive sticky header WEB-033. Exact URLs, final top-level label/order and wireframes not locked. No Journal at launch.

### B. Customer purchase and account
- Cart / intended order review (interaction WEB-038 DEFERRED)
- Checkout: contact/identity, address, final amount, payment initiation
- Payment status: pending/interrupted/failed and recoverable verification
- Order confirmation and secure order detail
- Guest order access/recovery with verified contact or expiring secure link
- Sign in/register, profile, addresses, order history/detail
- Tracking/dispatch status (manual courier updates)
- Manual delivery estimate request and approved unpaid-order/payment access
- Custom enquiry entry/follow-up (Quote Only policy OPEN)
- Support case submission/follow-up and order-linked help

**Commercial constraints:** exactly two customer-facing price components: discounted tax-inclusive product price and one combined delivery charge if applicable (WEB-040N). Coupons OPEN. Payment provider WEB-018 DEFERRED.

### C. Private administration
- Authentication/overview
- Catalogue, editorial content/media, publishing, collections, SEO
- Pricing/tax and offer controls
- Inventory, stock reservations, batches
- Orders, payment reconciliation and refunds
- Made to Order production readiness/release
- Custom enquiries and manual delivery quote preparation/approval
- Delivery rules and pincode/distance/weight/size configuration
- Dispatch, courier/tracking updates
- Customer records and support cases
- Staff roles, explicit permissions
- Release audit, correction/review and flagged concern queues
- Operational monitoring, recovery and release oversight

These are **module destinations**, not a final sidebar structure. Detailed admin UI comes after storefront experience design (WEB-022).

### D. Shared application services (not necessarily pages)
- Identity, access and secure guest verification
- Editorial publication/media pipeline and search
- Product offers, stock reservations, order/payment ledgers
- Internal delivery pricing and manual quote workflow
- Production release guards and immutable audit
- Shipment status and transactional SMTP
- Monitoring/logging, backups/restore, isolated beta/live environments

## 2. End-to-end use-case coverage

| Journey | Storefront/customer destinations | Admin/system counterpart | Coverage status |
|---|---|---|---|
| Browse and discover | Home → Shop/category/collection/search → product | Publishing, catalogue, SEO/search | **Established scope**, page details DRAFT |
| Buy Ready Stock | Product → cart → checkout → payment → order | Pricing, stock reservation, payment/order verification | **Established scope**, cross-module transitions need Phase 2 |
| Buy Made to Order | Product → checkout → order/tracking | Full payment → staff readiness/release → production/dispatch | **Core release locked**, physical production stages gap |
| Custom enquiry | Product/contact → enquiry/follow-up | Enquiry handling/quote | **Established scope**, Quote Only checkout participation OPEN |
| Recover interrupted payment | Checkout → pending/failure → order recovery | Reconciliation, idempotency, support | **Required**, exact transition contract gap |
| Recover guest order | Email/contact verification → order detail/tracking | Secure guest identity/access | **Locked principle**, exact access flow gap |
| Missing delivery price | Pincode check → explicit request → approved unpaid order → payment link | Rate lookup → manual quote approval → stock reservation → expiry cancellation | **Extensive locked rules**, UI path and races gap |
| Dispatch and track | Order detail → tracking → help | Courier assignment, manual tracking updates | **Locked scope**, detailed shipment states gap |
| After-sales support | Order/help → support case | Case handling and customer response | **Locked scope**, status visibility and return/refund policy gap |
| Governance | No public admin access | Roles, audit correction, independent review, flagged concerns | **Locked core**, role grant governance and UI grouping gap |

## 3. Phase 1 closure assessment

**Inventory coverage:** public storefront, customer commerce/account/service, private admin and shared system surfaces are now represented. This is **not owner approval of the final sitemap**.

**Already locked:** catalogue taxonomy, Shop mega-menu and mobile drill-down, search entry, guest checkout/recovery, manual courier tracking, admin core responsibilities, explicit sensitive permissions, production release/audit rules and pricing composition.

**Genuine major policy gaps to carry into Phase 2:** Quote Only participation, coupon rules, payment/refund/cancellation races, mixed-mode order constraints, physical production stages after release, secure guest verification specifics, and detailed role governance. Some are technical workflow details, others require later owner decisions. Do not silently settle them.

**Page-level matters deferred to Phase 3:** exact routes, page split/merge, responsive wireframes, labels and component microstates. WEB-038 remains DEFERRED.

## 4. Recommended next action

Begin **Phase 2 functional architecture** with an end-to-end **order and payment lifecycle map across Ready Stock, Made to Order and Custom Enquiry**. Reconcile all existing locked decisions before asking about missing business policies. The sitemap inventory is sufficient to proceed to a cross-module architecture draft, subject to owner review of material coverage gaps.

## 5. 2026-10-28 — Owner-requested gap-only verification (Phase 1 remains OPEN)

Rechecked the unified map against the customer/admin coverage audits, website requirements and decision register. The following are **genuine coverage gaps**, not approval requests for previously locked decisions:

1. **Purchase-mode entry/exit map (P0):** explicitly account for Ready Stock, Made to Order and Custom Enquiry entry, allowed next destinations and exit/status surfaces at the conceptual page/use-case level. Do not infer Quote Only checkout eligibility or mixed-mode cart rules.
2. **Post-release production coverage (P0):** existing WEB-040 production rules focus on readiness/release/audit. The admin sitemap still needs a conceptual production work/complete/handover-to-fulfilment capability after release, without inventing factory stages or specific permissions.
3. **Customer self-service boundary (P1):** customer-initiated cancellation/return/refund requests are not expressly represented as a customer-facing use case, though admin refunds and policies/support are. Decide whether support-mediated requests suffice for launch or a self-service request capability belongs in scope; do not invent eligibility/refund rules.
4. **Transactional communications coverage (P1):** SMTP and several specific email events are recorded, but the unified module inventory should include notification triggers, delivery failures/retries and staff visibility as a functional capability. Exact event catalog belongs in Phase 2.

**Not gaps requiring a fresh decision:** six-category Shop navigation, guest checkout, secure guest order recovery, payment interruption recovery, manual courier tracking, support cases, audit correction/review, admin catalogue publishing, delivery-rate rules. Their exact screens and transitions belong to later phases.

**Phase 1 exit remains pending.** Resolve/document P0 conceptual coverage first, then P1 scope boundaries, then obtain owner review of the consolidated sitemap. Preserve Quote Only and coupon details OPEN, WEB-038 DEFERRED and WEB-040N's two customer-facing price components.

## 6. 2026-10-28 — Owner-accepted Phase 1 purchase-mode coverage

**ACCEPTED FOR CONCEPTUAL PHASE 1 COVERAGE (not new commerce policy):**
- **Ready Stock:** product detail → purchase/checkout → verified payment/order → dispatch/tracking/support.
- **Made to Order:** product detail → purchase/checkout → verified full payment/order → authorized readiness and production release → production work/completion → fulfilment/tracking/support. Production after release is a **coverage placeholder**, not a locked state machine.
- **Custom Enquiry:** product/contact → enquiry submission → staff follow-up → communicated outcome; no automatic conversion to checkout or production is implied.

This acceptance confirms the three **entry/exit conceptual journeys** only. It does not approve exact routes, mixed-mode cart behavior, Quote Only eligibility, coupons, physical production stages or gateway choice. Existing locked rules remain authoritative. **P0 purchase-mode coverage gap CLOSED.** Phase 1 stays OPEN pending remaining gap review and owner sign-off.

### Next gap under review: post-release production capability

WEB-042 explicitly excludes manufacturing progression after release, production completion and dispatch. The admin module inventory contains production readiness/release but needs a conceptual capability for **work in progress, completion/quality disposition, and handover to fulfilment**. Whether these are distinct stages, how they are authorized and which customer statuses appear are **NOT LOCKED**. Do not confuse conceptual sitemap inclusion with approval of a production lifecycle. Review this single scope boundary next.

## 7. 2026-10-28 — Owner-accepted post-release production coverage (Option A)

**ACCEPTED FOR PHASE 1 FUNCTIONAL COVERAGE ONLY:** following existing verified-payment, readiness and authorised release rules, the private administration and shared system inventory must account for (1) **production work management**, (2) **completion and quality disposition**, and (3) **handover to fulfilment**, connecting to existing manual courier/tracking capability.

This acceptance closes the **P0 post-release production coverage gap**. It **does not** approve manufacturing states/transitions, job scheduling, quality checklists, rework/remake/cancellation rules, staff permissions, automatic handover, customer-facing progress messages, or technical implementation. WEB-042 explicitly leaves post-release execution out of scope. Its locked release and audit rules are unchanged. Phase 1 remains **OPEN** pending the P1 gaps and owner review.

**Next single gap:** customer-initiated cancellation/return/refund request **scope boundary**. Website requirements already include policies/returns, support cases and admin refund handling, but the decision register does not establish a dedicated customer self-service request action. Determine whether support-mediated requests are sufficient for launch or whether an explicit customer request capability should be in Phase 1 scope. No cancellation/return eligibility, refund entitlement or automation is implied.

## 8. 2026-10-28 — Owner-approved order-linked customer requests (Option B)

**ACCEPTED FOR PHASE 1 COVERAGE:** include a dedicated, secure **order-linked customer request capability** for cancellation, return and refund requests, accessible to authorised registered customers and securely verified guest-order holders. Requests go to staff for review and handling, with a customer-facing request/status follow-up and an administrative review/response capability. This is separate from general support, but may reuse its case infrastructure; no new standalone page or URL is approved by this decision.

**Explicit limits:** submitting a request does **not** cancel an order, approve a return, create a refund entitlement, issue money or change production/shipment state automatically. Eligibility, policy windows, partial-order handling, permissions, state transitions and payment-provider refund mechanics remain for later functional architecture/policy review. Existing OPS-003 support cases and admin refund scope remain valid. **P1 customer request-channel coverage gap CLOSED.**

**Phase 1 remains OPEN.** Next single gap: **transactional communications coverage**. Existing SMTP approvals (WEB-040AE and WEB-040AH) and independent support email are preserved. Assess whether to include an explicit shared notification-delivery/operational visibility capability; do not reopen already locked email-channel choices.

## 9. 2026-10-28 — Owner-approved managed transactional notifications (Option A)

**ACCEPTED FOR PHASE 1 FUNCTIONAL COVERAGE ONLY:** a shared managed transactional-notification capability spanning event-triggered message preparation, delivery-status visibility, failure detection, retry/recovery capability and appropriate staff operational oversight. This includes customer-facing transactional communications and administration/monitoring as needed; it does not imply a new dedicated customer page or admin screen.

**Existing locked rules remain:** WEB-040AE SMTP approved-quote/unpaid-order notice and WEB-040AH SMTP expiry-cancellation notice; email failure must not reverse business transactions or create duplicate orders/stock movements. Independent support mailbox remains. No SMS, WhatsApp or marketing campaign scope is added. Exact event catalogue, retry timing/count, templates, sender, visibility permissions, UI and technical delivery mechanics are **NOT APPROVED** here. **P1 communications coverage gap CLOSED.**

## 10. 2026-10-28 — Final gap-only reconciliation before owner sign-off

Compared the unified sitemap, customer journey coverage, admin module coverage, website requirements, proposed architecture and existing decision-register constraints. The four identified major **conceptual coverage gaps** are now closed by owner decisions: (1) purchase-mode journeys, (2) post-release production work/quality/handover, (3) dedicated order-linked cancellation/return/refund requests with staff review, (4) managed transactional notifications.

**No further unrepresented major website surface or use-case class identified in this review.** Public discovery/brand/trust, customer commerce/account/guest recovery, delivery quote exception, order/payment failure recovery, custom enquiries, support, admin catalogue/commercial/inventory/production/fulfilment/governance and shared security/operations are covered conceptually. This is a coverage assessment, **not** proof that every functional rule is decided.

**Carry to Phase 2 or later, not Phase 1 blockers:** Quote Only checkout participation OPEN; coupon details OPEN; mixed-mode order constraints and refund/cancellation/production/fulfilment transitions unresolved; payment provider WEB-018 DEFERRED; cart interaction WEB-038 DEFERRED; precise notification event/retry contract OPEN; role-grant governance and guest verification mechanics need detailed mapping. Exact routes, page grouping, screen layouts and admin UI belong to Phase 3. Maintain WEB-040N's two customer-facing price components.

**Exit gate:** Phase 1 stays **OPEN / AWAITING OWNER CONSOLIDATED SIGN-OFF**. The owner may accept the conceptual sitemap and module coverage as sufficient for Phase 1, without approving any of the unresolved policy, implementation or detailed design items above. Do not activate Phase 2 until explicit sign-off.

## 11. 2026-10-28 — Formal owner sign-off

**PHASE 1 CLOSED.** Owner explicitly accepted the consolidated conceptual sitemap and module inventory after closing all four identified coverage gaps. Prior DRAFT/AWAITING SIGN-OFF statements above are historical and superseded. This is approval of conceptual coverage only, not exact page/URL designs or unresolved business rules. **PHASE 2 ACTIVE** with Ready Stock order/payment functional architecture as its first, individually reviewed step. Quote Only/coupons OPEN, WEB-038 DEFERRED, WEB-018 DEFERRED, and WEB-040N's two customer-facing price components preserved.


## 12. 2026-11-04 — Phase 1 simplicity-first interpretation and concept scope

**OWNER-APPROVED GUIDANCE:** Phase 1 remains CLOSED as an accepted **conceptual** website sitemap and module/use-case coverage map. This inventory defines what Tavistra must support, not the number of pages, admin screens, API services, automated triggers or case-management subsystems. Reuse shared storefront/account/staff surfaces and common operational records where practical. Exceptions, disputes, clarification and special review may be handled manually by authorised staff; automate core commerce execution, objective safeguards, essential notifications and audit. Exact URL hierarchy, screen decomposition, visual interaction, integration mechanics, test scenarios and launch tuning belong to design/development/QA unless they materially affect an approved business outcome. Later Phase 2 decisions, including approved Quote Only handling and historical guest-order linking at launch, supersede older OPEN labels here. Preserve all approved capabilities, customer rights, security, financial controls and statutory obligations. The project objective is to complete the full website concept and high-level functional logic before diving into incidental implementation details.

# Task: Set 6 — 30-Day Architectural Quotes & Bulk Enquiry Lifecycle

**Status:** COMPLETED (Verified 23/23 Live on devMachine)  
**Completed:** 2026-11-12  
**Owner:** Antigravity / User  
**Package:** Isolated Set 6 (Commercial Bulk Enquiries, Versioned 30-Day Quotes & Acceptance Conversion)

## Scope Delivered
1. **Bulk Enquiry Intake & Validation (QOT-01)**:
   - Hardened `/contact` form with practice/studio name, requested units, and destination PIN validation.
   - Server route `/api/inquiries` enforces `validateEmail`, `validateIndianMobile`, and `lookupPincode` (mapping PIN to city e.g. 560001 -> Bengaluru).
   - Generates authoritative `INQ-YYYY-NNNN` sequence, logs `AuditLog`, and sends acknowledgement email via Mailpit.
2. **Staff Proposal Generation with Line Items (QOT-02, QOT-03)**:
   - Admin Proposals tab upgraded to support dynamic bespoke line items (name, finish, quantity, rate), custom crating & freight, lead time in weeks, and notes.
   - Computes authoritative totals: items subtotal + delivery = totalQuoted; 25% advance; 75% balance.
   - Locks offer validity for exactly 30 calendar days (`computeIstQuoteExpiry` through 23:59:59.999 IST on Day 30 per TAV-07).
   - Dispatches formal proposal email via Mailpit with Tavistra branding and direct quote review URL.
   - Originating BulkInquiry automatically transitions to `QUOTE_ISSUED`.
3. **Customer Proposal Page & SEC-03 Shell (QOT-04, SEC-03)**:
   - `/quote/[quoteNumber]` renders line items table, delivery terms, 30-day countdown timer, and 25% advance acceptance action.
   - Non-existent quote requests return clean 404 API and luxury fallback shell.
4. **N+1 Revision Lifecycle with Clock Preservation (QOT-05)**:
   - Admin UI adds "+ Issue Revision (vN+1)" modal preloaded with existing version details.
   - Route `/api/quotes/[quoteNumber]/revisions` creates version $V2$ (and $V3$), updating items/prices while **strictly preserving original 30-day expiresAt clock** (never extending or restarting).
5. **Exact-Version Acceptance & MTO Order Conversion (QOT-06, QOT-07)**:
   - Route `/api/quotes/[quoteNumber]/accept` requires matching latest version number (rejecting stale revisions with 409).
   - Atomically updates quote status to `ACCEPTED`, creates confirmed `Order` (`purchaseMode = MADE_TO_ORDER`, 25% paid, 75% balance due), and creates verified `QUOTE_ADVANCE` payment entry.
   - Converted order starts distinct 7-day IST pre-production grace window independent of original quote clock.
   - Sends post-acceptance confirmation email via Mailpit.
   - Immediately trackable via `/track?orderId=TAV-QTE-...`.
6. **Expired Quote Gate (QOT-08)**:
   - Quotes past 30 days auto-transition to `EXPIRED` with 0 days remaining; revisions and acceptances blocked with 400.

## Verification
- Verified live on `devMachine` (`Storefront :3001`, `Admin :3002`, `Mailpit :8025`):
  - `test:set6`: 23/23 PASSED (0 FAILED)
  - `test:set5`: 21/21 PASSED (0 FAILED)
  - `test:set4`: 20/20 PASSED (0 FAILED)
  - `test:set3`: 54/54 PASSED (0 FAILED)
  - `test:set2`: 68/68 PASSED (0 FAILED)

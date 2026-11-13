# Task: Set 7 — Support Tickets, Threaded Messaging & Client Concierge Desk

**Status:** COMPLETED LOCALLY (Awaiting devMachine execution upon GitHub cloud sync resumption)  
**Created:** 2026-11-12  
**Completed:** 2026-11-13  
**Owner:** Antigravity / User  
**Package:** Isolated Set 7 (Support Tickets & Concierge Desk)  
**Dependencies:** Set 6 (30-Day Architectural Quotes & Bulk Enquiry Lifecycle — Completed & Verified)

## Deliverables Completed

1. **Intake Flow & Validation (TCK-01):**
   - Storefront `/contact` dual-mode switcher: "Commercial & Bespoke Quotes" vs "Client Desk & Support Tickets".
   - Hardened validation: legal name, `validateEmail`, `validateIndianMobile`, subject, message.
   - Categories: `ORDER_INQUIRY`, `SPEC_ALTERATION`, `DELIVERY_SCHEDULE`, `DAMAGE_REPORT`, `CANCELLATION`, `GENERAL_ASSISTANCE`.
   - Priority auto-escalation: default `NORMAL`, `HIGH` for `DAMAGE_REPORT` and `CANCELLATION`.
   - `TCK-YYYY-NNNN` sequence generation with initial customer message and `AuditLog` entry.
   - Immediate confirmation screen with reference and direct tracking link.

2. **Admin Concierge Desk Workbench (TCK-02, TCK-03, TCK-05):**
   - Multi-dimensional filters: Status (`ALL`, `OPEN`, `IN_PROGRESS`, `RESOLVED`), Priority (`ALL`, `NORMAL`, `HIGH`, `URGENT`), Category (6 categories), and unified search input.
   - Visual badges: color-coded status, priority pills, category label, linked order reference, client info.
   - Interactive details pane: Status dropdown, Priority dropdown, one-click "Mark Resolved" button (`PATCH /api/tickets/[id]`).
   - 1-click linked order inspector: switches to Orders tab and selects linked order.

3. **Threaded Messaging & Outbound Email (TCK-03, TCK-04):**
   - Two-way conversation thread (`TicketMessage`) for both `CUSTOMER` and `STAFF`.
   - Staff response dispatches luxury-branded email via Mailpit (`sendTicketEmail`) with excerpt, staff name, and tracking button.
   - Submitting staff reply auto-transitions ticket status from `OPEN` to `IN_PROGRESS`.

4. **Customer Self-Service Tracking & Follow-Up:**
   - Storefront `/track` dual-mode switcher: "Track Consignment / Order" vs "Track Support Ticket" (supports `?ticket=...`).
   - Secure lookup: requires registered email/phone to inspect thread.
   - Customer follow-up reply form: calls `POST /api/tickets/[id]/messages` (`sender: "CUSTOMER"`).
   - Auto re-open: if ticket is `RESOLVED`, customer reply re-opens status to `IN_PROGRESS`.

5. **Bidirectional Order Cross-Linking:**
   - Order tracking view and Customer Account orders page feature direct "Raise Support Ticket" buttons pre-filling order reference.
   - Tickets persist `orderNumber` and display direct links to consignment tracking.

6. **Automated Verification Suite:**
   - `packages/db/tests/verify-set7-support-tickets.ts` (`test:set7`): 19 rigorous assertion checks covering TCK-01 to TCK-05, field validation gates, DB status transitions, Mailpit emails, and order cross-linking.

## Verification Gate
- Local Next.js Turbopack storefront build: **PASSED (0 errors)**.
- Local Vite admin build: **PASSED (3.16s, 0 errors)**.
- Local git commit created (`efe08e9`) and pushed to `origin/main`.
- devMachine live run: Queued pending GitHub cloud sync resumption.

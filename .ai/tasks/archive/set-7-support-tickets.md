# Task: Set 7 — Support Tickets, Threaded Messaging & Client Concierge Desk

**Status:** VERIFIED LIVE ON devMachine (28/28 checks passed)  
**Created:** 2026-11-12  
**Completed:** 2026-11-13  
**Owner:** Antigravity / User  
**Package:** Isolated Set 7 (Support Tickets & Concierge Desk)  
**Dependencies:** Set 6 (30-Day Architectural Quotes & Bulk Enquiry Lifecycle — Completed & Verified)

## Deliverables Completed

1. **Intake Flow with Distinct Forms (TCK-01):**
   - Storefront `/contact` separated into two dedicated modes:
     - **General & Studio Inquiry:** Practice name, nature of inquiry (dropdown: bespoke quotes, visits, trade, samples, corporate, general), optional delivery PIN with instant hub check, and project message. Submits to `/api/inquiries`.
     - **Raise Support Ticket:** Specific client support fields including registered email, mobile, support category (`ORDER_INQUIRY`, `SPEC_ALTERATION`, `DELIVERY_SCHEDULE`, `DAMAGE_REPORT`, `CANCELLATION`, `GENERAL_ASSISTANCE`), target order reference (`TAV-...`), subject, and detailed query. Submits to `/api/tickets`.
   - Auto-escalates priority to `HIGH` for `DAMAGE_REPORT` and `CANCELLATION`.
   - `TCK-YYYY-NNNN` sequential generation with immutable `AuditLog` logging.
   - Immediate confirmation card with direct link to the standalone ticket tracker.

2. **Dedicated Support Ticket Tracking Page (`/track-ticket`):**
   - Distinct from physical consignment tracking (`/track`).
   - Secure identity verification: requires Ticket Reference + Registered Email or Mobile. Works seamlessly without requiring client login.
   - Full thread visualization: displays client notes and official Studio Concierge responses with timestamps.
   - In-thread customer follow-up reply form: posts to `/api/tickets/[id]/messages` (`sender: "CUSTOMER"`), instantly appending notes and automatically reopening `RESOLVED` tickets to `IN_PROGRESS`.
   - Bidirectional cross-link to physical consignment delivery tracking (`/track?orderId=...`).

3. **Prominent "Raise Support Ticket" Actions:**
   - Dedicated tab on `/contact` labeled **"Raise Support Ticket"**.
   - Customer Account Orders page (`/account/orders`): high-contrast, icon-badged **"Raise Support Ticket"** action on every order card.
   - Customer Account Overview (`/account`): **"Raise Support Ticket"** next to recent orders and in the `AccountNav` sidebar.
   - Consignment Tracking page (`/track`): header action and primary sidebar button **"Need Help? Raise Support Ticket"** pre-filling order reference.
   - Header navigation and mobile drawer: direct links to **Support Desk** (`/track-ticket`) and **Raise Support Ticket** (`/contact?intent=support`).
   - Footer: helpful links for both **Track Support Ticket** and **Raise Support Ticket**.

4. **Admin Concierge Desk Workbench (TCK-02, TCK-03, TCK-05):**
   - Multi-dimensional filters: Status (`ALL`, `OPEN`, `IN_PROGRESS`, `RESOLVED`), Priority (`ALL`, `NORMAL`, `HIGH`, `URGENT`), Category (6 categories), and unified search input.
   - Visual cards showing ticket reference, priority pill, status badge, category label, customer details, and linked order.
   - Interactive details pane: Live Status dropdown, Priority dropdown, one-click "Mark Resolved" button (`PATCH /api/tickets/[id]`).
   - 1-click linked order inspector: switches to Orders tab and selects linked order.

5. **Threaded Messaging & Outbound Email (TCK-03, TCK-04):**
   - Two-way conversation thread (`TicketMessage`) for both `CUSTOMER` and `STAFF`.
   - Staff response dispatches luxury-branded email via Mailpit (`sendTicketEmail`) with excerpt, staff name, and `/track-ticket?ticket=...` button.
   - Submitting staff reply auto-transitions ticket status from `OPEN` to `IN_PROGRESS`.

6. **Automated Verification Suite:**
   - `packages/db/tests/verify-set7-support-tickets.ts` (`test:set7`): 28 assertion checks covering TCK-01 to TCK-05, field validation gates, DB status transitions, Mailpit emails, contact authorization guards, and order cross-linking.

## Verification Gate
- Local Next.js Turbopack storefront build: **PASSED (0 errors, 50/50 routes compiled)**.
- Local Vite admin build: **PASSED (0 errors)**.
- devMachine live execution (`pnpm test:set7`): **28/28 PASSED (0 FAILED)**.
- devMachine full regression (`test:set6`, `test:set5`, `test:set4`, `test:set3`, `test:set2`): **188/188 PASSED (0 FAILED)**.
- Total passing checks across all suites on `devMachine`: **216/216 PASSED**.

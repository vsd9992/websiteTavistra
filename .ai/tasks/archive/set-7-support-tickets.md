# Task: Set 7 — Support Tickets, Threaded Messaging & Client Concierge Desk

**Status:** COMPLETED & VERIFIED LIVE ON devMachine (38/38 checks passed)  
**Created:** 2026-11-12  
**Completed:** 2026-11-13  
**Owner:** Antigravity / User  
**Package:** Isolated Set 7 (Support Tickets & Concierge Desk)  
**Dependencies:** Set 6 (30-Day Architectural Quotes & Bulk Enquiry Lifecycle — Completed & Verified)

## Deliverables Completed

1. **Header & Navigation Streamlining:**
   - Removed "Support Desk" from desktop header and mobile drawer. Preserved in Footer only.
   - Cleaned up redundant links in mobile drawer.

2. **Footer Helpful Links & Contact Desk:**
   - Merged duplicate `/contact` and `/contact?intent=support` links into unified **"Contact & Support Desk"** (`/contact`).
   - Retained standalone **"Track Support Ticket"** (`/track-ticket`) in footer.
   - Updated official working hours site-wide to **Mon – Fri, 10:00 AM – 5:00 PM IST**.
   - Displayed both designated mailbox channels: `concierge@tavistra.in` (Desk) and `support@tavistra.com` (Support).

3. **Contact Page Distillation:**
   - Removed redundant cards from `/contact` ("Client Concierge Desk", "Studio Desk Hours & Contacts", "7-Day Pre-Production Alterations").
   - Streamlined into a clean, centered `max-w-3xl` container focusing on the form and dual-mode switcher (`GENERAL_INQUIRY` vs `SUPPORT_TICKET`).

4. **Client Portal Support Ticket Tracking & Management (Logged In):**
   - **API Endpoint:** `GET /api/account/tickets` (strict session authentication, returns tickets with messages matching `authUser.email`).
   - **Dedicated Portal Page:** `/account/tickets`
     - Status filters (All, Open, In Progress, Resolved).
     - Ticket cards displaying reference (`TCK-YYYY-NNNN`), status badge, priority, category label, linked order (`TAV-...`), and timestamps.
     - Expandable conversation thread showing customer messages and official studio responses.
     - In-thread customer reply form (`POST /api/tickets/[id]/messages`), automatically appending notes and reopening resolved tickets to `IN_PROGRESS`.
     - Direct link to standalone tracker `/track-ticket`.
     - Action to "+ Raise Support Ticket".
   - **Account Navigation:** Added `Support Tickets` to `AccountNav`.
   - **Account Overview:** Integrated active tickets KPI and recent tickets preview card into `/account`.

5. **Inbound Email Ingestion Architecture (Decision 0006):**
   - Architectural decision record: `.ai/decisions/current/0006-inbound-email-routing-and-desk-channels.md`.
   - **Inbound Webhook API:** `POST /api/webhooks/inbound-email`
     - `support@tavistra.com`: Generates sequential `TCK-YYYY-NNNN`, detects order reference, auto-escalates priority for damage/cancellation, creates first message, dispatches intake acknowledgment via Mailpit, logs `AuditLog`.
     - `concierge@tavistra.in`: Generates sequential `INQ-YYYY-NNNN`, creates `BulkInquiry`, dispatches inquiry confirmation email, logs `AuditLog`.

6. **Site-Wide Operating Hours:**
   - Authoritative schedule: **Mon – Fri, 10:00 AM – 5:00 PM IST**.
   - Updated in Footer, transactional email templates (`sendTicketEmail`), Decision 0006, and system copy.

## Verification Gate
- Local Next.js Turbopack build: **PASSED (0 errors, 53/53 routes compiled)**.
- devMachine Next.js Turbopack build: **PASSED (0 errors, 53/53 routes compiled)**.
- devMachine live execution (`pnpm test:set7`): **38/38 PASSED (0 FAILED)**.
- devMachine full regression (`test:set6`, `test:set5`, `test:set4`, `test:set3`, `test:set2`): **188/188 PASSED (0 FAILED)**.
- Total passing checks across all suites on `devMachine`: **226/226 PASSED (100%)**.

# Decision 0006: Inbound Email Routing Channels & Studio Operating Hours

**Status:** APPROVED (2026-11-13)  
**modified:** 2026-11-13  
**Context:** To provide seamless omnichannel communication for high-end clientele and trade partners, direct inbound emails to official studio mailboxes must automatically integrate with Tavistra's backend desk infrastructure. Additionally, working hours are standardized site-wide.

## Decisions

### 1. Inbound Email Routing Architecture

#### A. Support Ticket Desk (`support@tavistra.com`)
- **Channel Purpose:** Customer support, order inquiries, 7-day pre-production grace alterations, courier coordination, transit damage reports, and cancellation/refund processing.
- **System Action:**
  1. Inbound email to `support@tavistra.com` automatically creates a `SupportTicket` record with the next sequential reference `TCK-YYYY-NNNN`.
  2. Extracts client name and email from email headers (`From: Name <email@domain>`).
  3. Subject line is mapped to `subject`; message body (text/HTML) is stored as the initial `TicketMessage` (`sender: "CUSTOMER"`).
  4. Automatically inspects subject and body for order references (`TAV-...`); if found, links `orderNumber`.
  5. Heuristic priority escalation: if subject or body mentions damage, defect, broken, or cancel, auto-escalates `priority` to `HIGH`.
  6. Dispatches standard luxury intake acknowledgment email (`sendTicketEmail`) to client with ticket reference and link to `/track-ticket`.
  7. Records an immutable `AuditLog` entry: `INBOUND_EMAIL_TICKET_CREATED`.

#### B. General & Architectural Inquiry Desk (`concierge@tavistra.in`)
- **Channel Purpose:** Bespoke editions, trade & architect partnerships, studio visits, sample requests, commercial proposals, and general inquiries.
- **System Action:**
  1. Inbound email to `concierge@tavistra.in` is handled identically to submitting the Storefront `/contact` general inquiry form.
  2. Automatically creates a `BulkInquiry` record with reference `INQ-YYYY-NNNN`.
  3. Client details and inquiry scope preserved in PostgreSQL.
  4. Dispatches inquiry acknowledgment email (`sendBulkInquiryRegisteredEmail`).
  5. Records an immutable `AuditLog` entry: `INBOUND_EMAIL_INQUIRY_CREATED`.

### 2. Studio Operating & Desk Hours Policy
- **Authoritative Schedule:** **Monday through Friday, 10:00 AM – 5:00 PM IST** (`Mon – Fri, 10:00 AM – 5:00 PM IST`).
- **Closed:** Saturdays, Sundays, and Indian gazetted statutory holidays.
- **SLA Commitment:** All inquiries and support tickets received during business hours are reviewed within 24 business hours; submissions received outside operating hours are queued for processing the subsequent business morning.
- **Site-Wide Scope:** Standardized across Storefront Header/Footer, `/contact`, `/account/tickets`, transactional email templates, and Admin workbench.


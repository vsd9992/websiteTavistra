# Task: Set 7 — Support Tickets, Threaded Messaging & Client Concierge Desk

**Status:** PENDING APPROVAL (Phase 2 — Next Set)  
**Created:** 2026-11-12  
**Owner:** Antigravity / User  
**Package:** Isolated Set 7 (Support Tickets & Customer Desk)  
**Dependencies:** Set 6 (30-Day Architectural Quotes & Bulk Enquiry Lifecycle — Completed & Verified)

## Scope Overview (From Decision 0005 & Baseline)
1. **Ticket Creation & Validation**: Customer support ticket intake via `/contact` for order inquiry, spec alteration, damage report, or cancellation (`TCK-YYYY-NNNN`).
2. **Threaded Messaging & Staff Replies**: Two-way customer and staff ticket message thread (`/api/tickets/[id]/messages`), email notifications with conversation context, and customer reply handling.
3. **Admin Desk Workbench**: Filterable ticketing inbox by status (`OPEN`, `IN_PROGRESS`, `RESOLVED`) and priority (`NORMAL`, `HIGH`, `URGENT`), internal notes, and staff response dispatch.
4. **Order Linking**: Direct linkage between support tickets and confirmed `Order` / `QuoteProposal` entities.

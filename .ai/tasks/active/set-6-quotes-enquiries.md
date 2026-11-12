# Task: Set 6 — 30-Day Architectural Quotes & Bulk Enquiry Lifecycle

**Status:** PENDING APPROVAL (Phase 2 — Next Set)  
**Created:** 2026-11-12  
**Owner:** Antigravity / User  
**Package:** Isolated Set 6 (Commercial Bulk Enquiries, Versioned 30-Day Quotes & Acceptance Conversion)  
**Dependencies:** Set 5 (Order Tracking, 7-Day Grace, QC Photos & 75% Balance Gate — Completed & Verified)

## Scope Overview (From Decision 0005 & Baseline)
1. **Bulk Enquiry Intake & Validation**: Harden `/contact` bulk quotation transfer and `/api/inquiries` server validation, customer visibility, and Admin triage workflow (`NEW -> QUOTE_ISSUED`).
2. **30-Day Versioned Quotes & Conversion**: Verify `/quote/[quoteNumber]` proposal rendering, 30-day clock persistence without extension on revisions (`/api/quotes/[quoteNumber]/revisions`), exact-version acceptance + 25% advance checkout conversion, and expiry enforcement.

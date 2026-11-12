# Task: Set 5 — Order Tracking, 7-Day Grace, QC Photos & 75% Balance Gate

**Status:** PENDING APPROVAL (Phase 2 — Next Set)  
**Created:** 2026-11-12  
**Owner:** Antigravity / User  
**Package:** Isolated Set 5 (Post-Order Production, Fulfillment & Balance Lifecycle)  
**Dependencies:** Set 4 (Cart Governance, Delivery Engine & Ready Stock / MTO Checkout — Completed & Verified)

## Scope Overview (From Decision 0005 & Baseline)
1. **Order Tracking & 7-Day Modification/Cancel Grace**: Authenticated & guest order detail tracking, 7-day (`confirmedAt`) Made-to-Order grace window controls, and clean state transitions.
2. **QC Approval & 75% Balance Gate**: Admin production milestone controls, QC photo upload/display (`qcPhotosJson`), dispatch block until 100% paid (MTO remaining 75% balance gate), and `devMachine` live verification.

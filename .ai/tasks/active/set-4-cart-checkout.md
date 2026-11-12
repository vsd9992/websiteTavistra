# Task: Set 4 — Cart Governance, Delivery Engine & Ready Stock / MTO Checkout

**Status:** PENDING APPROVAL (Phase 1 — Next Set)  
**Created:** 2026-11-12  
**Owner:** Antigravity / User  
**Package:** Isolated Set 4 (Cart & Checkout End-to-End Integrity)  
**Dependencies:** Set 3 (Customer Identity, Authentication, Addresses & Privacy Isolation — Completed & Verified)

## Scope Overview (From Decision 0005 & Baseline)
1. **Cart Split & Governance**: Separate Ready Stock vs. Made to Order bags cleanly with server-verified product pricing/stock and strict **10-unit overall order / 10-line** bulk inquiry escalation boundary.
2. **Delivery Estimator & Checkout Integrity**: Ensure `/checkout` never falls back to stale static `lookupPincode()` when `/api/shipping/calculate` rejects an unserviceable PIN (e.g., `380053`), cleanly enforce DB-backed 12-slab / override / highest-product-fee calculations, and verify Ready Stock (`100%`) vs. Made to Order (`25% advance / 75% balance`) checkout persistence and stock updates end-to-end on `devMachine`.

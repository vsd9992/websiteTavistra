# Task: Admin Portal In-Place Modal Inspection & Global Navigation Overhaul

**Status:** ACTIVE (Pre-Live Punchlist)  
**Created:** 2026-11-18  
**Owner:** Antigravity / User  
**Target Package:** `apps/admin` (Admin Portal Workbench)  
**Requirement Source:** User Request (2026-11-18) — eliminate disruptive tab switching when inspecting cross-linked items.

---

## 1. Problem Statement & User Directive
Across the administrative portal, clicking inspection buttons (e.g., inspecting order details from Customer Dossier, inspecting quotes from Overview, inspecting customer profiles from Tickets, or inspecting orders from Audit Logs) historically triggered tab-level navigation (`setActiveTab("ORDERS")`, `setActiveTab("PROPOSALS")`).

This created undesired, disruptive navigation away from the staff member's working context (such as losing their scroll position, search query, or customer dossier view).

### Directive
1. Information available across consoles must open in-place as stacked / nested modals or overlays.
2. The user must remain on their active screen when closing the inspected item.
3. Explicit "Open in Console ↗" actions should remain strictly as secondary shortcuts only when the user deliberately wants to navigate to that workbench.

---

## 2. Global Inventory of Navigation-to-Modal Conversions
- [x] **Client Dossier → Order Inspection:** When viewing a customer dossier and clicking "Inspect ↗" on an order, open the Order Details modal directly in-place with elevated stacking (`z-[60]`) over the dossier (`z-50`). Closing the order modal leaves staff in the dossier.
- [x] **Client Dossier → Proposal Inspection:** When clicking "Inspect ↗" on an associated quote, open the 30-Day Locked Proposal Dossier directly in-place with elevated stacking (`z-[60]`) over the dossier. Closing the proposal leaves staff in the dossier.
- [x] **Support Tickets → Linked Consignment Inspection:** Inspect associated consignment directly in-place (`setSelectedOrder(order)` at `z-[60]`) without switching tabs (`setActiveTab("ORDERS")` removed). Closing leaves staff in the active ticket thread.
- [ ] **Overview Attention Required → Order Inspection:** Open order inspection in-place rather than switching to Orders tab.
- [ ] **Overview Commercial Ledger → Order Inspection:** Open order inspection in-place.
- [ ] **Audit Trail → Resource Inspection:** Inspect order, quote, or ticket in-place from audit log entries.

---

## 3. Verification Criteria
1. All inspected modals stack cleanly without backdrop glitches or layout shifts.
2. Closing child inspection modals restores exact prior scroll position and parent modal state.
3. Zero TypeScript or Vite bundling errors.

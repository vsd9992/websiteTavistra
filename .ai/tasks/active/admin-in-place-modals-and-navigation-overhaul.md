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
- [x] **Order Inspector → RMA / Return & Refund Modal:** Seamless in-place modal to initiate returns and statutory GST Rule 53 credit notes without leaving the order inspector.
- [x] **Inventory & Stock Ledger (`INVENTORY`):** Standalone console with physical stock management, in-place stock adjustment modal (`adjustStockModalItem`), chronological movement history modal (`viewMovementsItem`), and dedicated Returns & RMAs sub-tab.
- [x] **Studio QA Intake Inspection Modal (`inspectRmaModal`):** In-place intake verdict routing (`RESTOCK_TO_INVENTORY`, `RE_MACHINE_OR_POLISH`, `SCRAP_TO_FOUNDRY`) with automated inventory re-stocking and bank NEFT UTR / gateway refund recording.
- [x] **Statutory Rule 53 Credit Note Modal (`creditNoteModal`):** Formatted printable Tax Credit Note cross-referencing original invoice numbers, patron GSTIN, reverse GST debit, and settlement UTR.
- [x] **Workflow Stage Gating Toggles & Action Locks:**
  - Workshop Queue: `Actionable Only` vs `Full Pipeline` toggle with explicit `Authorize Foundry Casting` stage pass gate.
  - Dispatch Queue: `Ready for Dispatch` vs `Full Pipeline` toggle with explicit `Authorize Crating` stage pass gate once 100% balance is verified.
- [x] **Backup, Disaster Recovery & Schema Upgrades:** Instant server database snapshot generator (`handleTriggerDatabaseBackup`), JSON operational state download (`handleExportStateSnapshot`), Prisma schema migration status tracker, and staff maintenance bypass preview token generator (`handleGenerateBypassToken`).

---

## 3. Verification Criteria
1. All inspected modals stack cleanly without backdrop glitches or layout shifts.
2. Closing child inspection modals restores exact prior scroll position and parent modal state.
3. Zero TypeScript or Vite bundling errors (`tsc && vite build` built clean in 2.61s).
4. Live verified on `devMachine` (`192.168.1.100:3002` Admin and `:3001` Storefront returning HTTP 200).

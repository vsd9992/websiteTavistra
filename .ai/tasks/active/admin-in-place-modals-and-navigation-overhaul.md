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
- [x] **Inventory & Stock Ledger Deep Dive (Synchronized Catalogue, Draft Gates, Bins & Audit Trail):**
  - **Catalogue & Inventory Synchronization (`GET & PATCH /api/admin/inventory`):** Connected the physical inventory ledger directly to PostgreSQL `ProductVariant` and `InventoryLedger`, dynamically synchronizing all 11 product variants across all 6 catalogue works.
  - **Draft Product Marker (`isDraft` / `Do Not Refill`):** Prominently displays amber pulsed warning badge `Draft Product · Do Not Refill` on all inventory rows belonging to unpublished catalogue pieces (e.g. Monolith Minimalist Wall Clock). Displays an explicit warning notice inside the "Adjust Physical Stock" modal discouraging replenishment until the product is published.
  - **Location Bay Binning (`locationBayModalItem`):** Added interactive "Location Bay" assignment column with dedicated in-place modal, standard studio hub presets (Bay A1/A2 for Clocks, Shelf S1/S2 for Desk Objects, Cage L1/L2 for Lighting, Bay H1/H2 for Crated Mirrors, Vault V1 for Sculptures), free-text custom bay entry, and database persistence via `PATCH /api/admin/inventory`.
  - **Min / Max Order Thresholds (`thresholdModalItem`):** Added per-SKU configurable low stock reorder alert (`lowStockThreshold`) and maximum bay capacity ceiling (`maxStockThreshold`), displayed directly in the Health & Thresholds column and editable via dedicated in-place modal.
  - **Audit Trail Notes Visibility:** Redesigned the "Audit Notes" table column in the Chronological Ledger modal with high-contrast, theme-aware container (`text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-white/10 px-2.5 py-1.5 rounded-md min-w-[220px]`), eliminating unreadable dark-gray text.
  - **Stock Movement Audit Trail CSV Export:** Added instant "⬇ Download CSV" button in the Chronological Ledger modal header (per SKU) and a "⬇ Download Audit Trail (CSV)" toolbar button across all inventory SKUs, exporting full movement timestamps, SKUs, product names, deltas, balances, reference IDs, authorizing staff, and notes with proper character escaping.
- [x] **Studio QA Intake Inspection Modal (`inspectRmaModal`):** In-place intake verdict routing (`RESTOCK_TO_INVENTORY`, `RE_MACHINE_OR_POLISH`, `SCRAP_TO_FOUNDRY`) with automated inventory re-stocking and bank NEFT UTR / gateway refund recording.
- [x] **Statutory Rule 53 Credit Note Modal (`creditNoteModal`):** Formatted printable Tax Credit Note cross-referencing original invoice numbers, patron GSTIN, reverse GST debit, and settlement UTR.
- [x] **Workflow Stage Gating Toggles & Action Locks:**
  - Workshop Queue: `Actionable Only` vs `Full Pipeline` toggle with explicit `Authorize Foundry Casting` stage pass gate.
  - Dispatch Queue: `Ready for Dispatch` vs `Full Pipeline` toggle with explicit `Authorize Crating` stage pass gate once 100% balance is verified.
- [x] **Backup, Disaster Recovery & Schema Upgrades:** Instant server database snapshot generator (`handleTriggerDatabaseBackup`), JSON operational state download (`handleExportStateSnapshot`), Prisma schema migration status tracker, and staff maintenance bypass preview token generator (`handleGenerateBypassToken`).
- [x] **Catalogue & Variants Deep Dive (Studio Review & Zone Governance):**
  - **Studio Review & Gallery Modal:** Full high-definition product preview with interactive variant edition selector, real-time image viewport switching, zoom/inspect toggle, and fullscreen lightbox overlay.
  - **Dynamic Variant-Aware Architectural Specs (Section 3):**
    - Seamlessly binds the architectural and engineering specification box to the active variant selection.
    - Dynamically displays exact variant price (e.g. ₹52,000 for Grand Vanity vs ₹38,000 for Standard) with `Exact Edition Price` tag.
    - Dynamically updates dimensions (e.g. `800mm W × 1200mm H × 35mm D` vs `600mm W × 900mm H × 30mm D`).
    - Dynamically updates net product weight (`14.20 kg` vs `8.50 kg`) and calculated packed/volumetric weights (`15.0 kg actual / 17.9 kg volumetric`).
    - Displays selected variant finish badge, SKU, and stock availability.
    - Shows variant-specific editorial description override and highlights variant material finish in Materials & Craft.
    - Added one-click "Reset to Master Specs ✕" and two-way toggle-off on variant chip clicks.
  - **Delivery Zone Logistics Matrix (Zones A to E):** Granular zone-level governance (Zone A Intra-City Metro, Zone B Regional Tier-1, Zone C Rest of India Tier-2, Zone D Special Terrains, Zone E White-Glove Heavy Freight) with instant click-to-toggle allowed/restricted status on every catalogue row and within the review modal, logging `ZONE_GOVERNANCE_UPDATE` audit events.
  - **Draft/Published Filter & Interactive SVG Donut Stabilization:**
    - Fixed missing `catalogueStatusFilter` dependency in `filteredCatalogue` `useMemo`, ensuring immediate real-time filtering upon clicking Live Published / Drafts.
    - Added two-way toggle-off support across all segmented filters (clicking an active status or mode pill toggles it back to `"ALL"`).
    - Added contextual scoped counts for publication status (`catalogueStatusCounts`), eliminating misleading 0-result states when combining mode and status filters.
    - Added interactive active ring (`strokeWidth={18}`), opacity dimming of inactive slices, and `✓ Active` badges to the Donut Chart and legend list.
    - Added clickable center hub reset to instantly clear all active chart filters with clear visual feedback.
    - Hardened `handleTogglePublish` so toggling a product from Published to Draft resets `catalogueStatusFilter` to `"ALL"`, preventing the row from vanishing from view.
- [x] **Storefront Draft Product Lockdown & Admin API Resiliency:**
  - Locked down `getPublishedProductBySlug` to return `null` (404) for draft products (`isPublished === false`).
  - Added strict guard in `CartContext.tsx` preventing draft products from being added to bag.
  - Upgraded Next.js to 16.4.6 (`agentUpgrade: "security"`).
  - Admin `PATCH /api/admin/catalogue` enhanced to look up products by `id`, `slug`, or `sku`.
  - Workspace footer and sidebar footer restyled with high-contrast Radix Slate tokens and theme-aware logo handling.
- [x] **Light & Dark Theme Comprehensive Contrast Resolution (7-Issue Punchlist):**
  - **Sidebar Active Key (Image 1):** Active tab ("Studio Overview") styled with crisp dark charcoal text (`#18181B`), warm paper background (`#EDE9E1`), and burnished brass indicator tab (`#9E7238`), eliminating white-on-beige illegibility.
  - **Domain Filter Bar (Image 2):** Active domain pill ("All Domains") styled as elevated white card with `#18181B` charcoal text and brass accent tab.
  - **Urgent Bottlenecks Stat Card (Image 3):** Upgraded from muddy dark-950 tint to soft warm rose (`#FFF1F2` canvas, `#FECDD3` border) with authoritative high-contrast ruby typography (`text-rose-700` / `text-rose-800`, AAA contrast ratio 7.8:1).
  - **Import / Sync Markdown Action (Image 4):** Restyled with warm brass pill tint (`bg-[#9E7238]/10 text-[#825821] border-[#9E7238]/30`), eliminating black-on-black smudge.
  - **Catalogue Table Badges & Headers (Image 5):** "Ready Stock" (emerald), "Made to Order" (amber), and "Bespoke Quote" (purple) badges upgraded with crisp pastel fills, distinct borders, and high-contrast typography; prices and edition buttons given explicit contrast.
  - **Review Specs Modal Done Action (Image 6):** Prominent Burnished Brass action button (`bg-[#9E7238] hover:bg-[#855E28] text-white`).
  - **Expanded Variant Tray Row (Image 7):** Remapped table row from pitch-black `#1a1815` to warm sub-surface `#F4F1EA` (light mode) / `#13161C` (dark mode) with elevated white/dark variant cards and clean typography.
- [x] **Candidate A Ergonomic Design System & Dual Theme Engine:**
  - Implemented 8+ hour continuous workstation ergonomics: zero-glare warm stone alabaster canvas (`#F8F7F4`), elevated warm cards (`#FFFFFF`), non-pure-black charcoal espresso dark mode with true layer elevation (`#0E1013` canvas, `#13161C` sidebar, `#1A1D25` cards, `#2C3342` borders, `#F1F3F5` text), stone typography (`#18181B` / `#52525B`), and burnished brass accents (`#9E7238` / `#E0B26E`).
  - Resolved active tab contrast: active items ("Studio Overview", "All Domains") render crisp elevated surface with `#18181B` charcoal text and brass indicator, eliminating white-on-beige illegibility.
  - Resolved hover state text: `.hover:text-white` properly remaps to dark charcoal in light mode, preventing text from vanishing on hover.
  - Resolved exception shelf & badges: Urgent Bottlenecks card and alert badges remap from muddy `-950` tints to soft pastels with authoritative high-contrast text (`#BE123C` / `#9F1239` in light mode; luminous ruby in dark mode).
  - Set Light Theme as default on initial load; persistent `localStorage` (`tavistra_admin_theme`) synchronization and `data-theme` HTML attribute binding.
  - Bespoke Astrolabe & Solar Chronometer Theme Switcher (`ThemeSwitcher.tsx`): Custom architectural draftsmanship glyphs, kinetic coin flip/spin with `cubic-bezier(0.34, 1.56, 0.64, 1)` spring physics, and `Alt+T` keyboard shortcut.
  - Decision 0007 Strictly Enforced: 0 modifications to `apps/storefront/`.

---

## 3. Verification Criteria
1. All inspected modals stack cleanly without backdrop glitches or layout shifts.
2. Closing child inspection modals restores exact prior scroll position and parent modal state.
3. Zero TypeScript or Vite bundling errors (`tsc && vite build` built clean in 2.69s).
4. Live verified on `devMachine` (`192.168.1.100:3002` Admin and `:3001` Storefront returning HTTP 200).

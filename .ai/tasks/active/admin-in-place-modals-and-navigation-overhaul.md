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
  - **Auto-Dismiss Feedback Banner:** Added auto-dismiss timeout to dismiss the green action feedback notification banner after exactly 10 seconds.
  - **Interactive Dual-Metric Volume Distribution Donut (`By SKUs` vs `By Units`):**
    - Added metric switcher allowing staff to view distribution by physical unit volume or SKU count.
    - Fixed calculation logic so depleted SKUs (which have 0 on-hand units) accurately reflect in SKU count mode (5 depleted SKUs = 45.5%, 6 healthy = 54.5%), resolving the issue where the chart previously showed 100% green.
    - Added interactive click-to-filter on SVG slices and legend cards, instantly filtering the master ledger table by Allocation Status or Curated Category with active filter visual indicators.
    - Upgraded SVG track circle and center typography with high-contrast, theme-aware styling.
  - **Master Ledger Table Column Fitting & Formatting:**
    - Established explicit proportional column widths preventing column squeezing and text clipping.
    - Eliminated location bay text truncation (`Delhi Studio Hub - Bay A... ✎`); renders complete, readable bay badges with instant edit shortcut and dashed `+ Assign Bay` trigger for unassigned SKUs.
    - Redesigned threshold chips to sleek `Min: X · Max: Y ✎` buttons with high-contrast typography.
    - Styled draft product markers as clean `Draft Product · Do Not Refill` badges with pulsing amber indicators.
  - **Studio Location Bay Binning & Directory Management:**
    - Added "Clear Bay (Unassign)" button to cleanly remove bay assignments and persist to PostgreSQL.
    - Added ability to add custom presets and remove unused presets from the studio directory.
    - Added standalone "Manage Location Bays" directory modal displaying total bays, live assigned SKU counts, and directory maintenance controls.
  - **High-Contrast Stock Ledger Adjustment Modal:**
    - Replaced low-contrast light mode classes with enterprise Radix Slate & Atelier Brass tokens.
    - Restyled 4 KPI balance cards (`bg-slate-50 dark:bg-[#181715]`) with crisp dark text in light mode and vibrant emerald/amber accents.
    - Upgraded draft replenishment warning notice to deep amber (`bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200`), eliminating illegible yellow-on-white text.
    - High-contrast form inputs, selects, and audit note textareas.
  - **Chronological Stock Movement Ledger Modal & Column Sizing:**
    - Applied `table-fixed w-full` layout with dedicated column widths (`Timestamp [w-40]`, `Type [w-44]`, `Delta [w-20]`, `Balance [w-20]`, `Reference [w-36]`, `Staff [w-32]`, `Audit Notes [min-w-[220px]]`).
    - Styled audit notes with comfortable padding, high-contrast text, and line wrapping.
    - Instant CSV download per SKU and across the entire studio inventory ledger.
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

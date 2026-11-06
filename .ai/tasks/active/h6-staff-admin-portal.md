# Task: H6 Staff Administration Portal (`apps/admin`)

**Status:** IN PROGRESS  
**Created:** 2026-11-06  
**Owner:** Antigravity / User  
**Package:** H6 (Staff Administration & Fulfilment Operations)

## Context & Objectives
With the customer-facing storefront (H2), purchase journeys (H5), and commerce database foundations (H4) complete, we now build the private staff administration portal (`apps/admin`) specified in `docs/roadmap/phase-3-admin-ux-specification.md` and Decision `0002-pnpm-monorepo-structure.md`.

## Key Deliverables
1. **Scaffold `apps/admin` Application**:
   - Vite + React + TypeScript + Tailwind CSS workspace application.
   - Package setup (`package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`).
   - Integrated with `@tavistra/shared`.
2. **Staff Administration Shell & Navigation**:
   - Clean, high-density layout for studio operations.
   - Navigation: **Overview**, **Orders & Payments**, **Production Release (7-Day Grace)**, **Fulfilment & AWB**, and **Commercial Inquiries**.
3. **Core Operational Views**:
   - **Orders & Payments**: Mode-separated records (Ready Stock vs Made to Order), financial ledger (25% advance vs 100% full payment), customer contact.
   - **Production Release & 7-Day Grace Matrix**:
     - Visual countdown of confirmed MTO orders.
     - Production hold guards preventing physical machining prior to Day 8.
     - Action to release to "Workshop Crafting" on Day 8 or process 100% advance cancellation.
   - **Dispatch & Courier Assignment**:
     - Assign white-glove courier partners (Blue Dart, Safeexpress, Delhivery).
     - Enter and update carrier Air Waybill (AWB) numbers.
   - **Commercial Bulk Inquiries & Custom Proposals**:
     - View bulk/custom quotation submissions.
4. **Build & Monorepo Verification**:
   - Typechecking and static distribution build verification.


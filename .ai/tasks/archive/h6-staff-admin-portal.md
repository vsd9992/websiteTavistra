# Task: H6 Staff Administration Portal (`apps/admin`) & Centralized Commerce Synchronization

**Status:** COMPLETED & VERIFIED  
**Created:** 2026-11-06  
**Modified:** 2026-11-09  
**Owner:** Antigravity / User  
**Package:** H6 (Staff Administration & Fulfilment Operations)

## Context & Objectives
With the customer-facing storefront (H2), purchase journeys (H5), and commerce database foundations (H4) complete, we established the unified operational backend connecting the storefront and admin portals ("two sides of the same coin") backed by live PostgreSQL on `devMachine` (`192.168.1.100:5433`).

## Key Deliverables Completed
1. **Live PostgreSQL Infrastructure (`devMachine` `192.168.1.100:5433`)**:
   - Containerized PostgreSQL 17 (`tavistra-postgres`) on port 5433.
   - Extended Prisma schema with `qcNotes`, `qcImages` on `Order`, plus `SupportTicket`, `TicketMessage`, and `BulkInquiry`.
   - Seeded active orders (`TAV-RS-2026-1001`, `TAV-MTO-2026-2002`, `TAV-MTO-2026-2004`), support tickets (`TCK-2026-101`), and commercial inquiries (`INQ-2026-801`).
2. **Centralized Backend REST APIs (`apps/storefront/src/app/api`)**:
   - `GET /api/orders`: Server-queried order tracking by reference and phone/email, email order history, and full admin worklist.
   - `PATCH /api/orders/[id]`: State transitions with **Hard 100% Payment Gate** blocking dispatch/AWB entry when `balanceDue > 0`.
   - `POST /api/orders/[id]/pay-balance`: Day 1 enabled 75% balance payment recording verified PhonePe ledger entry and unlocking dispatch readiness.
   - `POST /api/inquiries` & `GET /api/inquiries`: Bulk and architectural quote ingestion from `/contact`.
   - `POST /api/tickets` & `GET /api/tickets`: Client desk support ticket ingestion and thread replies.
3. **Storefront Tracking & QC Transparency ([`/track`](file:///d:/_devProjects/Tavistra/apps/storefront/src/app/track/page.tsx))**:
   - Centralized database query so tracking works cross-device (mobile SMS click, tablet, desktop).
   - Day 1 active **"Pay Remaining Balance (75%)"** card and instant ledger payment.
   - Interactive **"Finished Piece QC Inspection Photos"** gallery displaying workshop photos and master craftsman notes directly to the customer.
4. **Staff Admin Portal (`apps/admin`) Operational Hardening**:
   - Vite proxy forwarding `/api` to Next.js backend on port 3000.
   - Live synchronization on mount for Orders, Inquiries, Tickets, and Customers.
   - Hard dispatch lockout in UI: when `balanceDueRupees > 0`, AWB inputs are disabled and a `Dispatch Blocked` security warning is displayed with a "Copy Balance Link" action.
   - Dedicated **"Workshop QC Photos & Review"** action enabling staff to upload inspection photos directly to the customer portal.
5. **Studio Governance & Operations Suite**:
   - **Live Catalogue Governance**: `GET` and `PATCH /api/admin/catalogue` connected to PostgreSQL `Product.isPublished`. Admin portal allows 1-click toggling between "Publish" and "Draft" with modal review. Storefront `/shop`, `/category/[slug]`, and `/product/[slug]` dynamically filter by `isPublished: true` with `<Suspense>` streaming.
   - **Delivery PIN Code Governance**: `GET` and `PATCH /api/admin/pincodes` connected to PostgreSQL `PincodeRange.isServiceable`. Real-time validation endpoint `GET /api/pincodes/check` allows staff to suspend or activate PIN codes/zones, and `/checkout` immediately blocks suspended PINs with an informative alert.
   - **System Maintenance & Hiatus Engine**: `SystemSetting` model added to Prisma (`MAINTENANCE_MODE`, `STUDIO_HIATUS`, `ANNOUNCEMENT_BANNER`). Public `GET /api/settings` and Admin `GET/PATCH /api/admin/settings`. Storefront `Header` renders a luxury announcement bar during hiatus/notices, and `/checkout` gracefully freezes checkout when maintenance mode is active.
6. **Quote Only 30-Day Architectural Proposal Lifecycle (TAV-07)**:
   - Proposal generation API (`/api/quotes`) with automatic versioning, revision management preserving the strict original 30-day offer clock, and branded luxury HTML quotation emails via containerized Mailpit SMTP.
   - Public quote review page (`/quote/[quoteNumber]`) with validity countdown, detailed scope/line-item breakdowns, and 1-click **"Accept Proposal & Pay 25% Advance"** atomic checkout.
   - Staff admin interface ("Inquiries & Proposals" tab) allowing commercial staff to issue bespoke proposals directly from customer inquiries.
7. **Markdown Product Importer & Catalogue Reviewer**:
   - Markdown parser and upsert engine (`/api/admin/catalogue/import`) supporting both bulk sync from repository markdown files (`docs/products/*.md`) and raw frontmatter upload.
   - Authoritative product markdown editions created in `docs/products/` with YAML frontmatter specs and luxury editorial descriptions.
8. **Automated End-to-End Integration Test Suite**:
   - 35 automated integration tests (`packages/db/tests/comprehensive-e2e.ts`) verifying all lifecycles against live PostgreSQL (`192.168.1.100:5433`) and Mailpit SMTP (`192.168.1.100:1025`): **35 passed, 0 failed**.
9. **Live Deployment to `devMachine` (`192.168.1.100`)**:
   - Built and deployed monorepo on remote Debian host `192.168.1.100`.
   - Storefront running on port 3001 (`http://192.168.1.100:3001`).
   - Admin running on port 3002 (`http://192.168.1.100:3002`).
   - Verified HTTP 200 OK and live database query responses across both services.


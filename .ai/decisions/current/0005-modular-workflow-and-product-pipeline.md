# Decision 0005: Modular Workflow Phasing Strategy & Product Content Pipeline Architecture

**Status:** APPROVED (2026-11-12)  
**Context:** Following preliminary manual review of the pre-live acceptance runbook, full end-to-end UAT was suspended to decompose the implementation into isolated, strictly dependency-ordered functional sets (Sets 0 through 8).

## Decisions

### 1. Phasing & Isolation Model
- Work progresses in isolated, dependency-ordered sets:
  - **Set 0 (Completed):** Runtime & Admin Proxy Connectivity (`stop-production.sh` / `start-production.sh` + Vite API proxy).
  - **Set 1 (Active):** Product Content, Markdown Specification, Media Handling & Multi-Variant Engine.
  - **Set 2:** Delivery PIN Governance, Zones, Studio Controls & Institutional Copy.
  - **Set 3:** Customer Identity, Authentication, Addresses & Privacy Isolation.
  - **Set 4:** Cart Governance, Delivery Engine & Ready Stock / MTO Checkout (with confirmed 10-unit overall order ceiling).
  - **Set 5:** Order Tracking, 7-Day Grace, QC Photos & 75% Balance Gate.
  - **Set 6:** 30-Day Architectural Quotes & Bulk Enquiry Lifecycle.
  - **Set 7:** Support Ticket Desk & Email Threading.
  - **Set 8:** Staff Authentication, RBAC & Final Acceptance Runbook Sweep.
- Each set must be verified independently on `devMachine` (`192.168.1.100`) before proceeding to the dependent set.

### 2. Product Content & Folder Structure (Set 1)
- Each product is authored as an isolated package folder:
  ```
  <product-slug>/
    ├── <product-slug>.md   (Single master Markdown + YAML frontmatter)
    └── images/             (Local media assets referenced relatively)
  ```
- Upload mechanism: Uploaded via Admin as a single `.zip` archive containing the folder, or synced from disk.
- Markdown YAML frontmatter strictly defines:
  - Product metadata & taxonomy (Category, Subcategory, Product Type).
  - Multi-variant array (`variants: [...]`) with individual SKUs, title/finish, tax-inclusive price, initial stock, and variant image.
  - Physical specifications (weight, dimensions, returnability, mode).
  - Delivery slab logic is decoupled from `.md` files and managed centrally in the database.
- Media storage: Uploaded images are extracted into persistent host storage on `devMachine` and served via `/uploads/products/<slug>/...` ensuring persistence across redeploys.

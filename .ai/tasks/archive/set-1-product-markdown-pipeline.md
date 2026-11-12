# Task: Set 1 — Product Markdown, Media Assets, Multi-Variant & Pricing Handlers

**Status:** COMPLETED & VERIFIED  
**Created:** 2026-11-12  
**Completed:** 2026-11-12  
**Owner:** Antigravity / User  
**Package:** Isolated Set 1 (Product Content Foundation)  
**Dependencies:** Set 0 (Runtime & Admin Proxy — Completed)

## Context & Objectives
Implement an isolated, production-grade product content pipeline supporting a master folder structure (`<slug>/<slug>.md` + `<slug>/images/`), multi-variant pricing, persistent media extraction & serving, and comprehensive Storefront/Admin catalog presentation.

## Deliverables Completed & Verified
1. **Product Markdown Schema & Parser (`parseProductMarkdown`)**:
   - YAML frontmatter parser using `js-yaml` supporting:
     - Taxonomy: Category, Subcategory, Product Type.
     - Mode: `READY_STOCK`, `MADE_TO_ORDER`, `QUOTE_ONLY`.
     - Physical attributes: dimensions, weight, mm sizes, materials.
     - Multi-variant array: `variants` (SKU, title/finish, taxInclusivePrice, initialStock, image).
     - Gallery images: `images` list with alt text and display ordering.
     - Markdown body: editorial description, craftsmanship highlights, care instructions.
2. **Product Package (.zip / Folder) Upload & Storage API**:
   - Upgraded `/api/admin/catalogue/import` to accept multipart form-data `.zip` archive packages containing `<product-slug>/<product-slug>.md` and `<product-slug>/images/*`.
   - Media extractor (`importProductZipPackage`) extracts media directly into persistent host storage at `/storage/uploads/products/<slug>/`.
   - Dedicated media streaming endpoint (`/uploads/[...path]`) with MIME resolution, caching headers, and path traversal protection.
   - Upsert engine safely creates/updates `Product`, `Category`, `ProductVariant`, `ProductImage`, and `InventoryLedger` in PostgreSQL.
3. **Admin Catalogue Workspace**:
   - Integrated `.zip` package upload form with drag & drop support.
   - Catalogue table displays primary thumbnail, taxonomy tag (`Category · Subcategory`), variant counts, and `From ₹X` price labels.
   - "Review Specs" modal displays full multi-variant breakdown with individual variant prices, SKUs, and stock.
4. **Storefront Browsing & PDP Hardening**:
   - `/shop` and `/category/[slug]` render actual uploaded product primary image and `From ₹X` pricing when variants differ.
   - Interactive PDP (`/product/[slug]`) client component with dynamic variant selector updating price, SKU, stock status, hero image, and gallery thumbnail switcher.
5. **Sample Product Package & Verification**:
   - Authored master folder and archive: `docs/products/monolith-minimalist-wall-clock/` with 2 variants (Matte Obsidian ₹14,500 and Raw Aluminium ₹16,200) and SVG media assets.
   - Verified end-to-end import, database records, and storefront PDP switching live on `devMachine` (`192.168.1.100`).

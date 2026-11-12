# Task: Set 1 — Product Markdown, Media Assets, Multi-Variant & Pricing Handlers

**Status:** ACTIVE  
**Created:** 2026-11-12  
**Owner:** Antigravity / User  
**Package:** Isolated Set 1 (Product Content Foundation)  
**Dependencies:** Set 0 (Runtime & Admin Proxy — Completed)

## Context & Objectives
Implement an isolated, production-grade product content pipeline supporting a master folder structure (`<slug>/<slug>.md` + `<slug>/images/`), multi-variant pricing, persistent media extraction & serving, and comprehensive Storefront/Admin catalog presentation.

## Core Deliverables
1. **Product Markdown Schema & Parser (`parseProductMarkdown`)**:
   - YAML frontmatter parsing supporting:
     - Taxonomy: Category, Subcategory, Product Type.
     - Mode: `READY_STOCK`, `MADE_TO_ORDER`, `QUOTE_ONLY`.
     - Physical attributes: dimensions, weight, mm sizes, materials.
     - Multi-variant array: `variants` (SKU, title/finish, taxInclusivePrice, initialStock, image).
     - Gallery images: `images` list with alt text and ordering.
     - Markdown body: short description, full description, highlights, care instructions.
2. **Product Package (.zip / Folder) Upload & Storage API**:
   - Endpoint `/api/admin/catalogue/upload`: Accepts `<product>.zip` archive containing the product folder and `images/`.
   - Extracts images to persistent `/uploads/products/<slug>/` storage on disk.
   - Upserts `Product`, `Category`, `ProductVariant`, `ProductImage`, and `InventoryLedger` into PostgreSQL.
3. **Admin Catalogue Workspace**:
   - New Product Package Uploader (drag & drop `.zip`).
   - Catalog view showing thumbnail gallery, active variants, price ranges (`From ₹X`), and mode.
4. **Storefront Browsing & PDP Hardening**:
   - `/shop`: Fix category filter navigation (`STR-05`), allowing seamless clearing back to "All Products".
   - Cards display `From ₹X` when variants differ in price.
   - `/product/[slug]`: Image gallery with thumbnail selection, interactive variant dropdown/buttons updating price, SKU, stock status, and variant-specific image.

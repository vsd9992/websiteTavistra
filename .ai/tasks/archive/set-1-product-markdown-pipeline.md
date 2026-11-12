# Task: Set 1 — Product Markdown, Folder Media Sync, Variant Overrides & PDP

**Status:** COMPLETED & VERIFIED (Archived 2026-11-12)  
**Created:** 2026-11-12  
**Completed:** 2026-11-12  
**Owner:** Antigravity / User  
**Package:** Isolated Set 1 (Product Content Foundation)  
**Dependencies:** Set 0 (Runtime & Admin Proxy — Completed)

## Deliverables Completed & Verified
1. **Markdown Schema, Parser & Variant Inheritance (`parseProductMarkdown`)**:
   - YAML frontmatter + editorial body supporting taxonomy (`Category`, `Subcategory`, `Product Type`), mode (`READY_STOCK`, `MADE_TO_ORDER`, `QUOTE_ONLY`), physical attributes (`dimensions`, `weightGrams`, `returnWindowDays`, materials, GST rate), and multi-variant `variants[]`.
   - Each variant specifies `sku`, `title`, `taxInclusivePrice`, `initialStock`, optional per-variant `images[]`, and optional attribute overrides (`description`, `dimensions`, `weightGrams`, `returnWindowDays`, craft/care instructions); omitted variant attributes automatically inherit from the master specification.
2. **Direct Folder Media Sync & Persistent Storage (`/api/admin/catalogue/import`)**:
   - Removed `.zip` upload/extraction overhead per owner direction; Admin Catalogue supports direct disk folder sync (`syncAllMarkdownEditionsFromDisk` scanning `docs/products/<slug>/<slug>.md` + `images/`) and single `.md` multipart/JSON import.
   - Copies media directly into persistent `/storage/uploads/products/<slug>/...` served via `/uploads/[...path]`; safely upserts `Product`, `Category`, `ProductVariant`, `ProductImage`, and `InventoryLedger`.
3. **Storefront PDP & Live `.md` Binding**:
   - Interactive PDP (`/product/[slug]`) displays capsule variant buttons with per-variant prices, switches per-variant image galleries, reflects live `.md` values (`returnWindowDays`, `weightGrams`, variant overrides), and places the **Delivery & Transit Estimate** card beneath Add to Cart.
   - Verified end-to-end with `docs/products/monolith-minimalist-wall-clock/` on `devMachine` (`192.168.1.100`).

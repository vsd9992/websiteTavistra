# Approved master taxonomy

**LOCKED 2026-10-22:** 6 main categories, 19 named subcategories, **43 primary product types**. The `Others` internal fallback is permitted in relevant categories but **not** counted as a named subcategory. This is a product-family taxonomy, **not 43 production-approved SKUs**.

| Category | Subcategory | Canonical product types |
|---|---|---|
| Personal Accessories | Key Accessories | Keychains; Key Organisers; Key Fobs & Tags |
| Personal Accessories | Personal Carry | Wallets & Card Holders; Money Clips; Compact Cases |
| Personal Accessories | Wearable & Personal Objects | Wearable Objects |
| Home Décor & Objects | Clocks | Wall Clocks; Table Clocks |
| Home Décor & Objects | Mirrors | Wall Mirrors |
| Home Décor & Objects | Wall Décor | Decorative Wall Panels; Frames & Displays; Wall Hangings |
| Home Décor & Objects | Organisation & Storage | Organisers; Storage & Keepsake Boxes; Trays & Catch-Alls; Holders & Racks |
| Home Décor & Objects | Vases & Planters | Vases; Indoor Planters |
| Desk & Workspace | Desk Organisation | Desk Organisers; Document & Letter Holders; Cable Management |
| Desk & Workspace | Stands & Holders | Phone & Tablet Stands; Laptop Stands; Headphone Stands; Business Card Holders |
| Desk & Workspace | Desk Décor & Objects | Paperweights; Desk Nameplates & Signs |
| Lighting & Ambience | Table & Desk Lighting | Table Lamps; Desk Lamps |
| Lighting & Ambience | Floor Lighting | Floor Lamps |
| Lighting & Ambience | Wall Lighting | Wall Lamps & Sconces |
| Lighting & Ambience | Ambient & Decorative Lighting | Mood & Accent Lights; Sculptural & Decorative Lights |
| Outdoor & Balcony | Planters & Plant Accessories | Outdoor Planters; Plant Stands |
| Outdoor & Balcony | Outdoor Décor | Outdoor Wall Décor; Garden & Balcony Décor |
| Art & Collectibles | Sculptures & Art Objects | Sculptures; Art Objects; Functional Art |
| Art & Collectibles | Wall Art | Art Panels; Wall Sculptures |

## Counting and migration rules
Original 46 entries -> 43 canonical primary types:
- Decorative & Sculptural Clocks: no separate product type. Its approved abstract/kinetic/industrial/conceptual directions migrate to Wall Clocks and Table Clocks.
- Desk Clocks: merge underlying development family into Table Clocks; retain **Desk Clocks** customer discovery/cross-listing.
- Desk Display Objects: cross-list/display context populated from Sculptures and Art Objects, not a separate underlying product-development family; its five concept ideas remain **provisional**.

Each actual SKU has one canonical record and primary placement; deliberate secondary customer-facing placement is allowed. Aesthetic/technical attributes can appear across types without generating duplicate records.

## Overlap boundaries
- Decorative Wall Panels vs Art Panels: décor-first vs authored/art-led works; deduplicate physically identical items.
- Wall Hangings vs Wall Sculptures: suspended/flat hangings vs three-dimensional artwork.
- Home Organisers vs Desk Organisers, Trays vs Desk Organisers: preserve use contexts; do not duplicate SKUs.
- Sculptures and Outdoor Sculptural Objects: outdoor suitability is an attribute requiring technical validation.
- Mood/Accent vs Sculptural/Decorative Lights: lighting effect first vs object/art form central.
- Functional Art is retained with a strict art-first threshold, not a catch-all for any attractive functional product.
- Garden & Balcony Décor is broad and earmarked for later individual concept review.

## Four design layers — LOCKED
1. Product type (what customer buys).
2. Development concept (distinct functional/engineering/artistic approach).
3. Design language (aesthetics/material inspiration).
4. Product attributes (configuration, adjustment, installation, personalisation, environment suitability).
The layers are working classifications, not rigid ontologies; a feature can be concept-defining in one product and a mere attribute in another.

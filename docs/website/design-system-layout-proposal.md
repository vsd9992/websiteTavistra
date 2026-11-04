# Tavistra storefront — spacing and layout proposal v1

**Date:** 2026-10-23. **Status:** PROPOSED only (WEB-030). Typography baseline is approved; spacing, grids and page widths are not.

## Objectives
- Gallery-like breathing room in editorial sections without making shopping slow or sparse.
- Clear product comparisons and comfortable mobile browsing.
- Consistent gutters and component spacing across home, shop, PDP, cart and checkout.
- No fixed-height content blocks that clip text at 200% zoom.

## Proposed baseline spacing scale
4px-based units with occasional 6/12/20/28 values for fine adjustments:
`4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128px`.
Example CSS: `--space-1: .25rem`, `--space-2: .5rem`, `--space-3: .75rem`, `--space-4: 1rem`, `--space-6: 1.5rem`, `--space-8: 2rem`, `--space-12: 3rem`, `--space-16: 4rem`, `--space-20: 5rem`, `--space-24: 6rem`, `--space-32: 8rem`.

## Proposed containers and responsive grid
| Area | Narrow mobile | Tablet | Desktop |
|---|---|---|---|
| Page side gutters | 16px | 24–32px | 40–64px |
| General content max-width | fluid | fluid | 1280px |
| Editorial story text max-width | 100% minus gutters | 640px | 720px |
| Product listing columns | 2 if readable, 1 if constrained | 2–3 | 3–4 |
| Product listing gap | 12–16px | 20–24px | 24–32px |
| Section vertical spacing | 48–64px | 64–80px | 80–112px |
| PDP gallery/details | stacked | stacked or split if viable | split, roughly 55/45 |
| Checkout | single column | single column | readable 2-column where useful |

## Options under review
- **Balanced Gallery (recommended):** 1280px max general container, 16px mobile gutters, 4-column desktop product grid, 2-column mobile product grid where card width permits, 80–112px editorial section rhythm.
- **Immersive Gallery:** 1440px container, wider imagery, fewer products per row, greater editorial whitespace; risk of slower product discovery.
- **Compact Commerce:** 1200px container, denser product grid, smaller section spacing; efficient but less distinctive.

## Constraints
- Images have stable aspect ratios and responsive sizes; no cumulative layout shifts from lazy-loaded imagery.
- Tap targets aim for >=44px minimum (stricter than WCAG 2.2 AA 24px target for many controls) where feasible.
- Grid collapses by available width, not device labels alone. At 320px viewport, 2 cards must not become illegibly narrow; allow 1-column fallback.
- Editorial full-bleed imagery is permitted but text and purchase controls must sit in readable content containers.
- Use CSS grid/flex with `minmax` and intrinsic sizing, avoiding fixed pixel heights for dynamic content.
- Keep forms readable, full width on mobile, and allow error text to reflow.

## Next
Owner chooses a layout-density direction before exact spacing/grid tokens are locked. Header/navigation design follows.

## 2026-10-23 — Owner feedback: asymmetrical editorial layouts
- **SELECTED direction (WEB-030):** Balanced Gallery as the overall spacing/density approach. Owner explicitly dislikes an exclusively symmetrical grid and prefers mixed large/small cards and masonry-like presentation. Exact spacing/grid tokens still require review.
- **PROPOSED implementation (WEB-031):** use **curated editorial mosaics** (intentional large/small cards) on homepage and featured sections; consider masonry on collection discovery; use predictable, consistent cards for search results, price comparison, cart and transactional workflows. Shop/category listings may incorporate a limited featured tile without disrupting filters or comparison.
- Editorial size differences must have a purpose (featured stories/products), not random prominence. Preserve accessible reading/focus order and stable content order; do not reorder products visually in a way that conflicts with screen reader/keyboard sequence.
- Reserve image dimensions/aspect ratios, use responsive `srcset` and lazy-loading below the fold, and prevent CLS. Masonry browser support/implementation strategy must be tested; use a robust CSS grid fallback rather than assuming native CSS masonry is universally supported.
- Mobile: reduce asymmetry where tiles become too narrow, preserve readable product titles/prices and usable tap targets. Avoid cropping important product details in image cards.
- **OPEN:** decide whether editorial mosaics should be the default for homepage/collections and consistent grids for commerce, or whether product listings should use more pervasive masonry. This is not yet an approved universal masonry mandate.

## 2026-10-23 — Approved grid strategy and refined responsive tokens (v2)

**LOCKED strategy (WEB-031): Curated Masonry + Functional Grid.** This supersedes the earlier OPEN/PROPOSED grid-strategy options. **LOCKED direction (WEB-030): Balanced Gallery.** Exact numeric spacing and breakpoints below remain **PROPOSED (WEB-032)** pending owner review and real-device tests.

### Page-by-page layout rule
| Context | Layout | Purpose |
|---|---|---|
| Homepage featured objects / editorial | Curated asymmetric mosaic with intentional 2x feature tiles, plus optional masonry | Distinctive gallery composition and curated visual hierarchy |
| Collections landing / discovery | Controlled masonry or mosaic where content and image proportions justify it | Browsing and inspiration |
| Shop / category / filtered listing | Predictable responsive grid, with at most an occasional clearly marked featured tile outside core sorted results | Scannability, filtering, price comparison |
| Search, recommendations, cart, checkout | Consistent cards/structured layouts | Stable order, readability and conversion |
| Product detail | Image gallery plus details, split on wide screens, stacked on mobile | Product evaluation |

### Proposed spatial tokens (CSS rem; 1rem = 16px at default settings)
| Token | Value | Use |
|---|---|---|
| `--space-1` | 0.25rem / 4px | micro |
| `--space-2` | 0.5rem / 8px | compact |
| `--space-3` | 0.75rem / 12px | small |
| `--space-4` | 1rem / 16px | base |
| `--space-6` | 1.5rem / 24px | card gap |
| `--space-8` | 2rem / 32px | major internal gap |
| `--space-12` | 3rem / 48px | small section |
| `--space-16` | 4rem / 64px | mobile editorial section |
| `--space-20` | 5rem / 80px | desktop section |
| `--space-24` | 6rem / 96px | desktop editorial |
| `--space-32` | 8rem / 128px | exceptional story separation only |

### Proposed responsive container / grid tokens
```css
:root {
  --layout-max: 80rem; /* 1280px */
  --story-max: 45rem; /* 720px */
  --page-gutter: clamp(1rem, 0.6rem + 2vw, 4rem);
  --section-gap: clamp(3rem, 2rem + 4vw, 6rem);
  --section-gap-editorial: clamp(4rem, 2.5rem + 5vw, 8rem);
  --product-grid-gap: clamp(0.75rem, 0.5rem + 1vw, 2rem);
  --mosaic-gap: clamp(0.75rem, 0.5rem + 1vw, 1.5rem);
}
.page-container { width: min(calc(100% - 2 * var(--page-gutter)), var(--layout-max)); margin-inline: auto; }
.product-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--product-grid-gap); }
@media (min-width: 48rem) { .product-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (min-width: 72rem) { .product-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (max-width: 22rem) { .product-grid { grid-template-columns: minmax(0, 1fr); } }
```
These breakpoints are initial candidates; verify against actual card minimum widths, localized labels, zoom and filter-sidebar presence. Use container queries where they improve component reliability.

### Proposed card and composition rules
- Functional product cards use a consistent image frame (initial candidate 4:5) with names/prices visible below; final image ratio is **not locked**.
- Editorial mosaics can combine 1x1, 2x1, 1x2 or 2x2 cells, but should use a **curated explicit content order** and a robust CSS Grid fallback.
- On narrow mobile, limit mosaics to one hero + two standard tiles or a stacked sequence. Never force unreadably narrow columns.
- No arbitrary card enlargement from randomness or popularity without clear merchandising logic. Avoid misleading visual prominence.
- Do not apply CSS `order` or dense packing that breaks logical reading/tab order. Use DOM order matching meaningful reading order.
- Reserve image space via width/height or aspect-ratio, use responsive sizes, lazy-load below fold, and test CLS.
- Maintain 44px comfortable touch-target goal, WCAG 2.2 AA reflow and text resize, and keyboard-visible focus.

### Open approval gate
Approve or adjust the **exact numeric tokens** (container 1280px, gutters, grid columns, gaps and section rhythm) after reviewing Step 01C. Grid strategy and overall direction are already locked. Responsive navigation is the next independent step (WEB-033).

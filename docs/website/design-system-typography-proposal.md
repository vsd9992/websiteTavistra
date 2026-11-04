# Tavistra typography system — historical proposal v1

**Date:** 2026-10-23  
**Status:** **SUPERSEDED** by the approved baseline in [design-system-typography-tokens.md](design-system-typography-tokens.md) on 2026-10-23. Retained for decision history. **LOCKED** pairing: Instrument Serif + Manrope (WEB-027).  
**Dependencies:** Approved Warm Mineral colour tokens, Adaptive Gallery, storefront-first workflow.

## Approved direction
- **Instrument Serif** provides selective editorial character for hero display headings, collection statements, short story pull-quotes and select section introductions.
- **Manrope** provides clear and consistent UI typography: navigation, product titles, prices, descriptions, buttons, forms, cart, checkout, order status, support and long-form reading.
- Avoid Instrument Serif for prices, numerical data, body paragraphs, buttons and transactional status.
- Brand wordmark is a separate identity asset and is **not automatically** typeset in either font.

## Proposed type scale (fluid sizes)
| Role | Mobile target | Desktop target | Family | Weight | Line height | Tracking |
|---|---:|---:|---|---:|---:|---|
| Editorial display | 42px | 80px | Instrument Serif | 400 | 1.00–1.06 | -0.025em |
| Page title / H1 | 34px | 56px | Manrope (default) | 500–600 | 1.12–1.18 | -0.03em |
| Editorial section H2 | 30px | 44px | Instrument Serif (selective) | 400 | 1.08–1.15 | -0.02em |
| Functional section H2 | 28px | 40px | Manrope | 600 | 1.16–1.24 | -0.025em |
| H3 | 22px | 28px | Manrope | 600 | 1.25–1.32 | -0.015em |
| Body large | 17px | 18px | Manrope | 400 | 1.55–1.65 | 0 |
| Body default | 16px | 16px | Manrope | 400 | 1.55–1.65 | 0 |
| Product title | 16px | 18px | Manrope | 500–600 | 1.35–1.45 | -0.01em |
| Navigation | 15px | 15px | Manrope | 500 | 1.4 | 0 |
| Button/control | 16px | 16px | Manrope | 600 | 1.3 | 0 |
| Supporting metadata | 14px | 14px | Manrope | 400–500 | 1.45–1.55 | 0 |

The values below were **proposed at the time**; the approved baseline is now in `design-system-typography-tokens.md`. Prefer `rem` and fluid `clamp()` rather than fixed pixel font sizes; examples:
```css
:root {
  --font-editorial: "Instrument Serif", Georgia, "Times New Roman", serif;
  --font-ui: "Manrope", "Segoe UI", Arial, sans-serif;

  --text-display: clamp(2.625rem, 2rem + 3.125vw, 5rem);
  --text-h1: clamp(2.125rem, 1.75rem + 1.875vw, 3.5rem);
  --text-h2-editorial: clamp(1.875rem, 1.625rem + 1.25vw, 2.75rem);
  --text-h2-ui: clamp(1.75rem, 1.5rem + 1.25vw, 2.5rem);
  --text-h3: clamp(1.375rem, 1.25rem + 0.625vw, 1.75rem);
  --text-body: 1rem;
  --text-body-large: clamp(1.0625rem, 1rem + 0.3125vw, 1.125rem);
  --text-meta: 0.875rem;
}
```
**Note:** CSS `clamp` interpolation depends on viewport width; table targets are conceptual bounds, not guarantees of an exact value at a named device width. Verify at 320px, 375px, 768px, 1024px, 1440px and 200% zoom.

## Hierarchy and usage rules
1. **One H1 per page as a working authoring convention**, with correct semantic heading hierarchy; visual styling need not equal heading level.
2. Editorial serif appears on a small number of prominent elements, not every card or page title. Functional H1/H2 remain sans by default.
3. No all-caps paragraphs; all-caps micro-labels only with careful tracking and legibility.
4. Avoid forcing `white-space: nowrap` on headings. Long product names and translations must wrap safely.
5. Keep long-form line length approximately 55–75 characters; maintain generous paragraph spacing.
6. Use tabular numerals for prices, quantities and order numbers where available; avoid visually ambiguous number formatting.
7. Avoid artificial bold for Instrument Serif; choose font weights/styles the actual font supports. Italic may be used selectively if the font asset and visual review support it.
8. Respect user browser text resizing and 200% zoom, reflow, line spacing and reduced motion; do not rely on typography embedded in hero images.
9. Maintain meaningful type contrast using approved Warm Mineral foreground/background pairings.

## Loading/performance plan (proposed)
- Verify each font's licence and permitted self-hosting; use maintained, official font distributions.
- Self-host WOFF2, subset by scripts actually needed; avoid pulling fonts from third-party CDNs at runtime.
- Prefer one variable Manrope file if compatible and beneficial, and regular Instrument Serif plus optional italic only when needed. Do not assume every font family supports every weight.
- Declare `font-display: swap` initially, test `optional` only if it improves the measured experience.
- Preload **only** the actual above-the-fold critical WOFF2 resources; use `crossorigin` for font preloads where required and correct MIME type.
- Cache immutable versioned font assets; specify fallback stacks and consider font metric overrides after measuring CLS.
- Audit transfer size, LCP, CLS and actual render across low-end mobile and slower connections. Avoid over-fetching unneeded styles/scripts.
- Do not commit copyrighted third-party font binaries without checking licences and redistribution terms.

## Open design questions
- Should editorial H1 be serif on select page types (homepage, collection story), with functional product/category H1 sans? Recommended yes, not locked.
- Should serif italic be included? Recommended optional, only if it adds real value.
- Is Manrope sufficient for all scripts used in phase one? English-first presumed for testing, language support not decided.
- Should product prices use tabular numerals? Recommended if supported.
- Final wordmark typography separate from UI font pairing.
- Exact type sizes/weights/line heights/tracking and responsive rules need owner review and visual implementation tests before lock.

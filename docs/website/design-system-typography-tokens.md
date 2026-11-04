# Tavistra storefront — approved typography tokens v1

**Approved:** 2026-10-23. **Status:** LOCKED design baseline, **conditional on implementation font and accessibility tests**. **Decisions:** WEB-027, WEB-028, WEB-029. Original proposal retained as historical context in [design-system-typography-proposal.md](design-system-typography-proposal.md).

## Approved typeface roles and hierarchy
- **Instrument Serif**: **selective editorial serif** only. Hero/display statements, select collection story titles, short editorial section headings, optional short pull-quotes. Regular weight 400 by default.
- **Manrope**: default for commerce and utility: functional H1/H2/H3, category and product headings, prices, descriptions, navigation, buttons, forms, cart, checkout, orders, support and longer text.
- **Editorial H1 exception:** homepage/collection story may use Instrument Serif if it suits the content. Category, product, checkout and account headings use Manrope by default.
- Do not use Instrument Serif for prices, quantities, transactional statuses, body paragraphs or buttons.
- The logo/wordmark remains a separate identity decision, not automatically typeset in either font.
- Serif italic is **optional, not a required asset**. Add only after visual/performance review.
- Avoid synthetic bolding of serif.

## Approved responsive typography scale
The sizes below describe mobile minimum / desktop maximum at a 16px browser root. Browser scaling must remain effective; use rem-based fluid sizing and test.

| Semantic role | Mobile min | Desktop max | Typeface | Weight | Line-height | Letter-spacing |
|---|---:|---:|---|---:|---:|---|
| Editorial display | 42px | 80px | Instrument Serif | 400 | 1.04 | -0.025em |
| Functional H1 | 34px | 56px | Manrope | 600 | 1.16 | -0.03em |
| Editorial H2 | 30px | 44px | Instrument Serif | 400 | 1.12 | -0.02em |
| Functional H2 | 28px | 40px | Manrope | 600 | 1.20 | -0.025em |
| H3 | 22px | 28px | Manrope | 600 | 1.30 | -0.015em |
| Body large | 17px | 18px | Manrope | 400 | 1.60 | 0 |
| Body default | 16px | 16px | Manrope | 400 | 1.60 | 0 |
| Product name | 16px | 18px | Manrope | 500 | 1.40 | -0.01em |
| Navigation | 15px | 15px | Manrope | 500 | 1.40 | 0 |
| Button/control | 16px | 16px | Manrope | 600 | 1.30 | 0 |
| Supporting metadata | 14px | 14px | Manrope | 400 | 1.50 | 0 |

## Reference design tokens
```css
:root {
  --font-editorial: "Instrument Serif", Georgia, "Times New Roman", serif;
  --font-ui: "Manrope", "Segoe UI", Arial, sans-serif;

  --text-display: clamp(2.625rem, 2rem + 3.125vw, 5rem);
  --text-h1: clamp(2.125rem, 1.75rem + 1.875vw, 3.5rem);
  --text-h2-editorial: clamp(1.875rem, 1.625rem + 1.25vw, 2.75rem);
  --text-h2-ui: clamp(1.75rem, 1.5rem + 1.25vw, 2.5rem);
  --text-h3: clamp(1.375rem, 1.25rem + 0.625vw, 1.75rem);
  --text-body-large: clamp(1.0625rem, 1rem + 0.3125vw, 1.125rem);
  --text-body: 1rem;
  --text-product-name: clamp(1rem, 0.9375rem + 0.3125vw, 1.125rem);
  --text-nav: 0.9375rem;
  --text-control: 1rem;
  --text-meta: 0.875rem;
}
```
These are baseline tokens; adjust only via documented accessibility/implementation findings. Fluid values depend on viewport and zoom, not hard breakpoint jumps.

## Readability, semantics and accessibility
- Body copy 16px / line-height 1.6; long-form content target ~55–75 characters per line.
- Allow long product names, localisation and user zoom to wrap. Avoid forced no-wrap and fixed-height text containers.
- Use correct semantic heading order; normally one primary H1 per page as an authoring convention. Visual size does not dictate HTML heading level.
- Keep metadata at 14px minimum baseline, never use metadata styling for essential instructions/checkout content.
- Tabular numerals for prices, quantities and order IDs **where supported by font**; test Indian currency symbol and numeric shaping.
- No all-caps paragraphs. All-caps micro-labels are exceptional and must remain readable.
- Respect browser font scaling, 200% zoom, reflow, WCAG 2.2 AA target, contrast using approved Warm Mineral tokens, and increased text spacing.
- Text is real HTML text, not baked into promotional images.

## Font delivery and performance baseline
- Self-host verified-licence WOFF2 files; no runtime dependency on a third-party font CDN.
- Prefer minimal necessary assets: Manrope variable if compatible, Instrument Serif regular; italic only if actually needed.
- Use `font-display: swap` as baseline, measure layout shift and evaluate `optional` only if superior in actual tests.
- Preload only fonts used above the fold and shown to improve performance; don't preload all styles or subsets.
- Cache versioned immutable font assets; specify fallbacks and consider font-metric overrides after measurement.
- Test LCP, CLS, font-transfer bytes and glyph coverage on low-end mobile and constrained networks. Validate fonts and rendering at 320/375/768/1024/1440px and 200% zoom.
- Actual font asset licensing, weight support, glyph coverage, browser appearance, responsive reflow and performance tests are **release/implementation gates**. The design baseline is locked; failing tests should produce a documented change rather than silently override it.

## Remaining separate decisions
- Wordmark/logo typography.
- Exact mobile/desktop page spacing and layout grid (Step 01C).
- Header/navigation, controls, footer and interaction states.
- Multilingual/script expansion beyond tested launch content.

# Tavistra storefront — approved Warm Mineral colour tokens (v1)

**Approved:** 2026-10-23. **Status: LOCKED** for baseline palette, semantic roles and accessibility goals. **Related decisions:** WEB-021, WEB-024, WEB-025, WEB-026. Historical discussion: [colour proposal](design-system-colour-proposal.md).

## Foundation palette
| Token | Value | Role |
|---|---|---|
| `--color-canvas` | `#FCFBF8` | Main clean page and checkout background |
| `--color-ivory` | `#F4F1EB` | Warm section and card surface |
| `--color-stone` | `#E5E0D7` | Quiet secondary panel |
| `--color-ink` | `#252521` | Main text; primary button background on light |
| `--color-charcoal` | `#202321` | Dark editorial/gallery surface |
| `--color-bronze` | `#80674F` | Restrained accent and qualifying links/focus on light |
| `--color-muted-light` | `#66645E` | Secondary text on ivory |
| `--color-muted-dark` | `#C5C5BD` | Secondary text on charcoal |
| `--color-control-border` | `#807B72` | Identifiable form control border on ivory |
| `--color-decorative-border` | `#D2CCC2` | Nonessential dividers only |
| `--color-error` | `#9C3434` | Error foreground candidate; contrast must be validated against exact backgrounds |

## Approved usage rules
- Adaptive Gallery is intentionally composed: light commerce/product/cart/checkout/account surfaces and selectively dark editorial heroes/collections. Not automatic OS dark mode.
- Primary light-surface CTA: ink background + canvas text. Primary dark-surface reverse CTA: ivory background + charcoal text.
- Bronze is a restrained brand accent; not a universal button colour, and not a substitute for semantic success/error states.
- Text and controls use semantic tokens (surface, foreground, border, focus, action) mapped to this palette; avoid hardcoding hex values per component.
- Image overlays must use controlled contrast (scrim/solid surface), not rely on arbitrary photography.
- Accessibility target: **WCAG 2.2 AA**. Normal text contrast >=4.5:1; large text >=3:1; essential non-text UI indicators >=3:1 against adjacent colours; visible keyboard focus; state not conveyed by colour alone.
- Decorative borders can be low-contrast; interactive control boundaries cannot rely only on decorative border.
- Define hover, focus, selected, disabled, error and success component-state treatments during component design. These are **not** yet locked by this palette approval.
- Browser/device testing and accessibility audits still required. Colour-token approval is not a claim of overall WCAG conformance.

## Calculated contrast reference (WCAG sRGB formula)
| Foreground / Background | Ratio | Normal text >=4.5:1 |
|---|---:|---|
| Ink on Ivory | 13.64:1 | Pass |
| Muted Light on Ivory | 5.25:1 | Pass |
| Bronze on Ivory | 4.69:1 | Pass, narrow margin |
| Bronze on Canvas | 5.11:1 | Pass |
| Ivory on Charcoal | 14.07:1 | Pass |
| Muted Dark on Charcoal | 9.14:1 | Pass |
| Ivory on Bronze | 4.69:1 | Pass, narrow margin |
| Canvas on Ink | 14.86:1 | Pass |
| Control Border on Ivory | 3.73:1 | Pass for non-text indicator where applicable |
| Decorative Border on Ivory | 1.42:1 | Decorative only |

## Reference CSS (baseline values, not final component API)
```css
:root {
  --color-canvas: #FCFBF8;
  --color-ivory: #F4F1EB;
  --color-stone: #E5E0D7;
  --color-ink: #252521;
  --color-charcoal: #202321;
  --color-bronze: #80674F;
  --color-muted-light: #66645E;
  --color-muted-dark: #C5C5BD;
  --color-control-border: #807B72;
  --color-decorative-border: #D2CCC2;
  --color-error: #9C3434;
  --surface-default: var(--color-canvas);
  --text-primary: var(--color-ink);
  --action-primary-bg: var(--color-ink);
  --action-primary-fg: var(--color-canvas);
}
```

**Next:** Typography selection is still open. Typography and its size/weight/spacing tokens require independent approval.

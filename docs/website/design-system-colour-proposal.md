# Tavistra storefront — Warm Mineral colour tokens (historical proposal v1)

**Date:** 2026-10-23. **Status:** SUPERSEDED as a proposal by approved `design-system-colour-tokens.md` on 2026-10-23. Values and roles were approved unchanged; this file remains as historical proposal context.

## Palette

| Token | Hex | Role |
|---|---|---|
| `--color-canvas` | `#FCFBF8` | Clean product/checkout page base |
| `--color-ivory` | `#F4F1EB` | Warm page sections / cards |
| `--color-stone` | `#E5E0D7` | Secondary panels, quiet separation |
| `--color-ink` | `#252521` | Main text and light-surface primary CTA |
| `--color-charcoal` | `#202321` | Dark editorial sections |
| `--color-bronze` | `#80674F` | Restrained accent, link or focus on light |
| `--color-muted-light` | `#66645E` | Secondary copy on ivory |
| `--color-muted-dark` | `#C5C5BD` | Secondary copy on charcoal |
| `--color-control-border` | `#807B72` | Functional input border on ivory |
| `--color-decorative-border` | `#D2CCC2` | Decorative divider only |
| `--color-error` | `#9C3434` | Error foreground/background, subject to pairing tests |

## Semantic usage
- Commerce: canvas/ivory surfaces + ink text; primary button ink + canvas text.
- Editorial: charcoal surface + ivory text; reverse button ivory + charcoal text.
- Accent: bronze for selected textual links or details; not a blanket replacement for main buttons or semantic status colours.
- Component semantics should be expressed as `--surface-default`, `--text-primary`, `--text-muted`, `--action-primary-bg`, `--action-primary-fg`, `--focus-ring`, etc., mapping to palette values per surface context. Do not hardcode arbitrary hex values in individual components.
- Use intentionally composed light and dark sections, not automatic operating-system dark mode.

## Calculated WCAG contrast samples
Contrast computed with standard sRGB relative-luminance method (rounded):

| Foreground / Background | Contrast |
|---|---:|
| Ink `#252521` on ivory `#F4F1EB` | 13.64:1 |
| Muted-light `#66645E` on ivory | 5.25:1 |
| Bronze `#80674F` on ivory | 4.69:1 |
| Bronze on canvas | 5.11:1 |
| Ivory on charcoal | 14.07:1 |
| Muted-dark `#C5C5BD` on charcoal | 9.14:1 |
| Ivory on bronze | 4.69:1 |
| Canvas on ink | 14.86:1 |
| Functional border `#807B72` on ivory | 3.73:1 |
| Decorative border `#D2CCC2` on ivory | 1.42:1 |

## Accessibility and exceptions
- Target WCAG 2.2 AA: normal text >=4.5:1; large text >=3:1; relevant non-text UI indicators/controls >=3:1 against adjacent colours; visible keyboard focus. These values are minimums, not blanket certification of the site.
- Bronze on ivory barely clears normal-text AA; don't use opacity reduction or smaller/lighter rendering that weakens contrast.
- Decorative borders can be subtle; interactive input outlines must remain identifiable without relying solely on a low-contrast border.
- Never convey inventory, errors or selection solely by colour. Define focus, hover, active, disabled and error states during component design and verify actual rendered combinations.
- Product photography has no fixed palette; maintain sufficient contrast for text overlays via an opaque/scrim-backed region rather than assuming every photo supports white type.
- Test in real browsers and with automated accessibility checks; the palette alone cannot guarantee WCAG compliance.

## Next steps
1. **Completed 2026-10-23:** Owner approved exact colour values and roles.
2. Typography direction and type scale, independently reviewed.
3. Spacing/grid, navigation, controls and responsive behavior.

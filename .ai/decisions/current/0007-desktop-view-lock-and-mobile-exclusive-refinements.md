# Storefront Desktop View Lock and Mobile-Exclusive Refinements Governance

modified: 2026-11-17

## Context
Following the completion and verification of Usability Batch 3, the desktop layout and architecture of the Tavistra storefront were finalized and locked. Subsequent refinements to improve mobile ergonomics, such as drawer filters, portalled overlay menus, bottom sheets, and app-like layouts, must never modify or regress the desktop storefront.

## Decision
- **Strict Desktop View Lock**: The desktop storefront layout (`lg:`, `>= 1024px`) is completely frozen and locked to the Batch 3 baseline. No modifications to desktop page structure, component hierarchy, typography, or interaction models are permitted without explicit user instruction.
- **Mobile-Exclusive Scope**: All current and ongoing storefront UX/UI enhancements must be strictly scoped to mobile screen sizes (`lg:hidden`, `< 1024px`).
- **Isolation Pattern**: Any mobile layout change (such as repositioning buy-box specs, moving delivery estimators, or showing floating action pills) must be strictly isolated via responsive utilities (`lg:hidden` for mobile elements, `hidden lg:block` / `hidden lg:flex` / `hidden lg:grid` for desktop elements). Desktop elements must never be modified or removed to satisfy mobile requirements.

## Consequences
- The desktop experience remains 100% stable, spacious, and identical to the approved Batch 3 baseline.
- Mobile view can be optimized aggressively into a sleek, app-like experience without risk of desktop regressions.
- Every commit affecting storefront layouts must explicitly verify both desktop (`>= 1024px`) and mobile (`< 1024px`) viewports.

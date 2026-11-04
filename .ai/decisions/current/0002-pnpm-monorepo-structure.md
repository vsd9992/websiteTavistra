# Architecture Decision: pnpm Monorepo Structure

modified: 2026-11-04

## Context
Tavistra requires an SEO-optimized public storefront, a distinct staff administration portal with dense worklists and transactional operations, and shared database models, validation schemas, and business rules across both surfaces.

## Decision
Adopt a **pnpm Monorepo (Modular Monolith)** structure:
- Root workspace manager: `pnpm` workspaces.
- `apps/storefront`: Next.js (App Router, React, TypeScript, Tailwind CSS) for public showroom, catalogue discovery, editorial markdown rendering, and customer checkouts (optimized for SEO, performance, and PhonePe merchant review).
- `apps/admin`: Vite + React + TypeScript SPA for private staff administration, worklists, role-based workflows, and manual operations.
- `packages/db`: PostgreSQL database access layer, migrations, and transactional ledger operations (using Prisma or Drizzle ORM).
- `packages/shared`: Shared TypeScript types, Zod schemas, constants, and business-logic helpers (3-mode purchase state machines, pincode distance calculator interfaces, payment gates).

## Deployment & Operational Alignment
- Conforms directly to `docs/website/architecture.md` (distinct storefront, admin, and shared backend API / modular monolith).
- Admin builds to static client-side distribution artifacts, enabling lightweight hosting via Nginx/Caddy reverse proxy on the Debian dev machine (`192.168.1.100`) and the future small Hostinger VPS.
- High memory efficiency and complete isolation of staff administrative code from the public storefront bundle.

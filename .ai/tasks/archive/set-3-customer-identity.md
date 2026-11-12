# Task: Set 3 — Customer Identity, Authentication, Addresses & Privacy Isolation

**Status:** COMPLETED & VERIFIED (Archived 2026-11-12)  
**Created:** 2026-11-12  
**Completed:** 2026-11-12  
**Owner:** Antigravity / User  
**Package:** Isolated Set 3 (Customer Identity & Privacy Foundations)  
**Dependencies:** Set 2 (Delivery PIN Governance, Zones & Studio Controls — Completed & Verified)

## Approved Owner Direction (2026-11-12)
1. **Authentication Model**: Email + Password + Email Verification OTP (with Password Reset and Email One-Time Code sign-in) delivered via live Mailpit SMTP (`192.168.1.100:1025`).
2. **Guest vs. Account Orders**: Keep guest orders strictly separate (`userId: null`); customers track guest orders exclusively via `/track` using Order ID + Contact (`email` or `phone`), while `/account/orders` displays only orders placed by the authenticated customer (`userId`).

## Implemented Architecture
1. **PostgreSQL Auth, Sessions & OTP Verification (`packages/db/prisma/schema.prisma`, `apps/storefront/src/lib/auth.ts`, `apps/storefront/src/lib/email.ts`)**:
   - Extended `User` (`passwordHash`, `emailVerifiedAt`, `gstin`, `practiceOrStudio`) and `CustomerAddress` (`label`, `updatedAt`); added `CustomerSession` (SHA-256 hashed HTTP-only `tavistra_session` cookie, 30-day TTL) and `EmailVerificationToken` (SHA-256 hashed 6-digit OTP, 15-min TTL, 5-attempt limit, purposes `VERIFY_EMAIL`, `LOGIN_OTP`, `PASSWORD_RESET`).
   - Added scrypt password hashing (`salt:hash`) and Nodemailer Mailpit SMTP templates (`sendCustomerOtpEmail`).
2. **Customer Auth & Account APIs**:
   - `POST /api/auth/register`, `/api/auth/verify-email`, `/api/auth/login` (password, OTP request, OTP verify modes), `/api/auth/logout`, `/api/auth/forgot-password`, `/api/auth/reset-password`.
   - Strict session-authenticated `GET / PATCH /api/account`, `GET / POST /api/account/addresses`, `PATCH / DELETE /api/account/addresses/[id]` (live `resolvePincodeHierarchy` validation + FK-safe order address detach), and `GET /api/account/orders` (strict `userId` isolation).
3. **Privacy Hardening & Guest Order Separation**:
   - Rejected unauthenticated requests (`401`) on `/api/account*`, `/api/orders?email=...`, `/api/quotes?email=...`, and bare `/api/orders?orderId=...`.
   - Rejected mismatched contact lookups on `/api/orders?orderId=...&contact=...` (`403`) without leaking order existence; `POST /api/orders` reuses identical saved `CustomerAddress` records for signed-in users and leaves guest orders unlinked (`userId: null`).
4. **Storefront UI & Admin Client Directory**:
   - Replaced demo auto-login & `localStorage` auth scaffolding in `AuthContext.tsx`, `AccountNav.tsx`, `Header.tsx`, `/account`, `/account/login`, `/account/register`, `/account/profile`, `/account/addresses` (with live `/api/pincodes/check` verification & Edit support), `/account/orders`, `/track`, and `/checkout` saved-address autofill selector.
   - Updated `GET /api/admin/customers`, `apps/admin/src/data.ts`, and `apps/admin/src/App.tsx` inspector modal to expose `lifetimeSpendRupees`, `gstin`, `practiceOrStudio`, `emailVerified`, and `addresses[]` cleanly without exposing `passwordHash`.

## Verification Results (Live on `devMachine` `192.168.1.100`)
- Typechecks & production builds (`pnpm --filter @tavistra/db typecheck`, `pnpm --filter storefront exec tsc --noEmit`, `pnpm --filter admin build`, `pnpm --filter storefront build`) exited `0`.
- Live services healthy on `devMachine` (`Storefront PID: 75816` port `3001`, `Admin PID: 75818` port `3002`).
- `pnpm --filter @tavistra/db test:set3`: **38 / 38 checks passed, 0 failed**, covering unauthenticated privacy isolation (`401`), registration + real Mailpit (`:8025`) OTP delivery & login gating before verification, logout session revocation, password & OTP sign-in, forgot/reset password flow via Mailpit, GSTIN validation, strict 6-digit PIN whitelist (`380053` rejected, `380001` resolved), cross-user `403` isolation, saved address reuse + FK-safe deletion, strict guest vs. authenticated order separation, `403` wrong-contact tracking rejection, and Admin Customers visibility.

# Task: Set 3 — Customer Identity, Authentication, Addresses & Privacy Isolation

**Status:** ACTIVE (Phase 2 — Execution)  
**Created:** 2026-11-12  
**Owner:** Antigravity / User  
**Package:** Isolated Set 3 (Customer Identity & Privacy Foundations)  
**Dependencies:** Set 2 (Delivery PIN Governance, Zones & Studio Controls — Completed & Verified)

## Approved Owner Direction (2026-11-12)
1. **Authentication Model**: Email + Password + Email Verification OTP (with Password Reset and Email Code OTP sign-in) delivered via live Mailpit SMTP (`192.168.1.100:1025`).
2. **Guest vs. Account Orders**: Keep guest orders separate; customers track guest orders exclusively via `/track` using Order ID + Contact (`email` or `phone`), while `/account/orders` displays only orders placed by the authenticated customer (`userId`).

## Core Deliverables
1. **Database & Session Layer (`packages/db/prisma/schema.prisma`, `apps/storefront/src/lib/auth.ts`, `email.ts`)**:
   - Extend `User` (`passwordHash`, `emailVerifiedAt`, `gstin`, `practiceOrStudio`) and `CustomerAddress` (`label`, `updatedAt`).
   - Add `CustomerSession` (SHA-256 hashed HTTP-only cookie token, expiry) and `EmailVerificationToken` (SHA-256 hashed 6-digit OTP, purpose, expiry, max-attempt guard).
   - Scrypt password hashing and Mailpit SMTP OTP email templates.
2. **Customer Auth & Account APIs**:
   - `POST /api/auth/register`, `/api/auth/verify-email`, `/api/auth/login` (password + email OTP code modes), `/api/auth/logout`, `/api/auth/forgot-password`, `/api/auth/reset-password`.
   - Session-authenticated `GET / PATCH /api/account`, `GET / POST /api/account/addresses`, `PATCH / DELETE /api/account/addresses/[id]` (with live PostgreSQL PIN validation via `resolvePincodeHierarchy`), `GET /api/account/orders`.
3. **Privacy & Guest Isolation**:
   - Reject unauthenticated `/api/account` and `/api/orders?email=...` queries with `401`.
   - Require `contact` verification on `/api/orders?orderId=...` (unless requested by authenticated owner `userId`).
   - Do not auto-link guest `POST /api/orders` submissions to `User` accounts (`userId: null`).
4. **Storefront UI & Admin Client Directory**:
   - Replace demo auto-login & localStorage mock auth in `AuthContext`, `/account`, `/account/login`, `/account/register`, `/account/profile`, `/account/addresses`, `/account/orders`, `/track`, and Checkout saved-address picker.
   - Fix Admin Customers directory (`GET /api/admin/customers` & `App.tsx`) to expose `lifetimeSpendRupees`, `gstin`, `practiceOrStudio`, `emailVerified`, and saved addresses cleanly.

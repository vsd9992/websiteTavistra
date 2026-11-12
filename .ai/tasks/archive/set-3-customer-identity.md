# Task: Set 3 — Customer Identity, Authentication, Addresses & Privacy Isolation

**Status:** COMPLETED & VERIFIED (Archived 2026-11-12)  
**Created:** 2026-11-12  
**Completed:** 2026-11-12  
**Owner:** Antigravity / User  
**Package:** Isolated Set 3 (Customer Identity & Privacy Foundations)  
**Dependencies:** Set 2 (Delivery PIN Governance, Zones & Studio Controls — Completed & Verified)

## Approved Owner Direction & Post-Review Hardening (2026-11-12)
1. **Authentication Model**: Email + Password + Email Verification OTP (with Password Reset, Email One-Time Code sign-in, Authenticated Password Change, and Email / Authenticator App TOTP MFA) delivered via live Mailpit SMTP (`192.168.1.100:1025`).
2. **Guest vs. Account Orders**: Keep guest orders strictly separate (`userId: null`); customers track guest orders exclusively via `/track` using Order ID + Contact (`email` or `phone`), while `/account/orders` displays only orders placed by the authenticated customer (`userId`).
3. **Validation & Branding Rules**: Apply Contact/Checkout email (`validateEmail`, disposable/relay block) & Indian mobile (`validateIndianMobile`) policies on registration/profile; enforce strong passwords (`8–15` chars, uppercase, lowercase, number, allowed symbols `!@#$%^&*_-+=?.,:;`); validate GSTIN state code, PAN entity type, and mod-36 checksum digit; use **Tavistra** + `/logo-name.png` (inline CID logo in emails) across customer-facing pages and communications, restricting **VDesign** strictly to subtle footer/policy/lineage parent attribution.

## Implemented Architecture
1. **PostgreSQL Auth, Sessions, MFA & Validation (`packages/db/prisma/schema.prisma`, `packages/shared/src/validation.ts`, `apps/storefront/src/lib/auth.ts`, `apps/storefront/src/lib/totp.ts`, `apps/storefront/src/lib/email.ts`)**:
   - Extended `User` (`passwordHash`, `emailVerifiedAt`, `gstin`, `practiceOrStudio`, `mfaEnabled`, `mfaMethod`, `totpSecret`, `totpPendingSecret`) and `CustomerAddress` (`label`, `updatedAt`); added `CustomerSession` (SHA-256 hashed HTTP-only `tavistra_session` cookie, 30-day TTL) and `EmailVerificationToken` (SHA-256 hashed 6-digit OTP, 15-min TTL, 5-attempt limit, purposes `VERIFY_EMAIL`, `LOGIN_OTP`, `PASSWORD_RESET`, `MFA_EMAIL`, `MFA_EMAIL_SETUP`, `MFA_CHALLENGE`).
   - Added scrypt password hashing (`salt:hash`), RFC 6238 SHA-1 TOTP generation/verification (`totp.ts`), `validateStrongPassword`, strict checksummed `validateGstin`, and Nodemailer Mailpit SMTP templates with `[Tavistra]` subjects & inline `cid:tavistra-logo` (`apps/storefront/public/logo-name.png`).
2. **Customer Auth, Password & MFA APIs**:
   - `POST /api/auth/register`, `/api/auth/verify-email`, `/api/auth/login` (`password`, `otp_request`, `otp_verify`, and `mfa_verify` challenge modes), `/api/auth/logout`, `/api/auth/forgot-password`, `/api/auth/reset-password`.
   - Strict session-authenticated `GET / PATCH /api/account`, `POST /api/account/password` (verifies current password + revokes other active sessions), `POST /api/account/mfa` (`setup_totp` QR PNG, `verify_totp`, `enable_email_request`, `enable_email_verify`, `disable`), `GET / POST /api/account/addresses`, `PATCH / DELETE /api/account/addresses/[id]` (live `resolvePincodeHierarchy` validation + FK-safe order address detach), and `GET /api/account/orders` (strict `userId` isolation).
3. **Privacy Hardening & Guest Order Separation**:
   - Rejected unauthenticated requests (`401`) on `/api/account*`, `/api/orders?email=...`, `/api/quotes?email=...`, and bare `/api/orders?orderId=...`.
   - Rejected mismatched contact lookups on `/api/orders?orderId=...&contact=...` (`403`) without leaking order existence; `POST /api/orders` reuses identical saved `CustomerAddress` records for signed-in users and leaves guest orders unlinked (`userId: null`).
4. **Storefront UI & Admin Client Directory**:
   - Replaced demo auto-login & `localStorage` auth scaffolding in `AuthContext.tsx`, `AccountNav.tsx`, `Header.tsx`, `/account`, `/account/login` (with MFA challenge screen + `/logo-name.png`), `/account/register` (with live email/phone/password/GSTIN checklist + `/logo-name.png`), `/account/profile` (with Change Password + Email/Authenticator App MFA setup QR & disable controls), `/account/addresses` (with live `/api/pincodes/check` verification & Edit support), `/account/orders`, `/track`, and `/checkout` saved-address autofill selector; updated customer-visible Tavistra branding.
   - Updated `GET /api/admin/customers`, `apps/admin/src/data.ts`, and `apps/admin/src/App.tsx` inspector modal to expose `lifetimeSpendRupees`, `gstin`, `practiceOrStudio`, `emailVerified`, and `addresses[]` cleanly without exposing `passwordHash`.

## Verification Results (Live on `devMachine` `192.168.1.100`)
- Typechecks & production builds (`pnpm --filter @tavistra/shared typecheck`, `pnpm --filter @tavistra/db exec tsc --noEmit`, `pnpm --filter storefront exec tsc --noEmit`, `pnpm --filter admin build`, `pnpm --filter storefront build`) exited `0`.
- Live services healthy on `devMachine` (`Storefront PID: 81425` port `3001`, `Admin PID: 81427` port `3002`).
- `pnpm --filter @tavistra/db test:set3`: **54 / 54 checks passed, 0 failed**, covering unauthenticated privacy isolation (`401`), disposable email / fake phone / over-15-char password / invalid GSTIN checksum rejections, registration + real Mailpit (`:8025`) OTP delivery & `[Tavistra]` branding (no `VDesign`), login gating before verification, logout session revocation, password & OTP sign-in, forgot/reset password flow, authenticated password change, Email MFA & Authenticator App TOTP QR setup/login/disable flows, strict 6-digit PIN whitelist (`380053` rejected, `380001` resolved), cross-user `403` isolation, saved address reuse + FK-safe deletion, strict guest vs. authenticated order separation, `403` wrong-contact tracking rejection, and Admin Customers visibility.


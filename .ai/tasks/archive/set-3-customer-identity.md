# Task: Set 3 — Customer Identity, Auth, MFA, Addresses & Privacy Isolation

**Status:** COMPLETED & VERIFIED (Archived 2026-11-12)  
**Created:** 2026-11-12  
**Completed:** 2026-11-12  
**Owner:** Antigravity / User  
**Package:** Isolated Set 3 (Customer Identity & Privacy Foundations)  
**Dependencies:** Set 2 (Delivery PIN Governance, Zones & Studio Controls)

## Approved Owner Direction (2026-11-12)
1. **Authentication & MFA**: Email + Password, Email Verification OTP, Password Reset OTP, Email One-Time Sign-In, Authenticated Password Change, and Email / Authenticator App (TOTP) MFA via Mailpit SMTP (`192.168.1.100:1025`).
2. **Guest vs. Account Orders**: Guest orders stay unlinked (`userId: null`), tracked on `/track` via Order ID + matching contact; `/account/orders` exposes only authenticated user orders.
3. **Validation & Branding**: Apply `validateEmail` (no disposable/relay domains) and `validateIndianMobile` on auth/profile forms; enforce strong passwords (`8–15` chars, upper/lower/digit/symbol `!@#$%^&*_-+=?.,:;`) and checksummed GSTIN (`validateGstin`); brand visible UI and emails **Tavistra** (`/logo-name.png` + `cid:tavistra-logo`), reserving **VDesign** strictly for footer/policy/lineage attribution.

## Implemented Architecture
1. **DB, Crypto, TOTP & Mail (`packages/db/prisma/schema.prisma`, `packages/shared/src/validation.ts`, `auth.ts`, `totp.ts`, `email.ts`)**:
   - Extended `User` (`passwordHash`, `emailVerifiedAt`, `gstin`, `practiceOrStudio`, `mfaEnabled`, `mfaMethod`, `totpSecret`, `totpPendingSecret`) and `CustomerAddress` (`label`, `updatedAt`); added `CustomerSession` (SHA-256 `tavistra_session`, 30d TTL) and `EmailVerificationToken` (`VERIFY_EMAIL`, `LOGIN_OTP`, `PASSWORD_RESET`, `MFA_EMAIL`, `MFA_EMAIL_SETUP`, `MFA_CHALLENGE`).
   - Added scrypt hashing, RFC 6238 TOTP (`totp.ts`), strict validators, and `[Tavistra]` Nodemailer templates with inline `cid:tavistra-logo`.
2. **APIs & Privacy Isolation**:
   - Auth endpoints (`/api/auth/register`, `verify-email`, `login` incl. `mfa_verify`, `logout`, `forgot-password`, `reset-password`) and account endpoints (`/api/account`, `/api/account/password`, `/api/account/mfa`, `/api/account/addresses*` with `resolvePincodeHierarchy` + FK-safe delete, `/api/account/orders`).
   - Rejected unauthenticated (`401`) and wrong-contact tracking (`403`) leaks; checkout reuses matching saved addresses cleanly.
3. **Storefront UI, Sign-Out State Reset & Admin Customers**:
   - Replaced legacy `localStorage` auth across `/account*` (`login`, `register`, `profile`, `addresses`, `orders`), `AuthContext`, `AccountNav`, `/track`, and `/checkout`; fixed Next.js `<Activity>` state retention on sign-out via `resetLoginState`/`resetRegisterState` + full navigation (`window.location.assign("/account/login")`).
   - Updated `/api/admin/customers` and Admin customer modal (`spend`, `gstin`, `addresses[]`, zero `passwordHash`).

## Live Verification (`devMachine` `192.168.1.100`)
- Typechecks & production builds (`@tavistra/shared`, `@tavistra/db`, `admin`, `storefront`) exited `0`; live services active (`Storefront PID: 93286` `:3001`, `Admin PID: 93288` `:3002`).
- `pnpm --filter @tavistra/db test:set3`: **54 / 54 PASSED (0 FAILED)** across privacy isolation, registration validation gates, Mailpit `[Tavistra]` emails, OTP & password auth, password change, Email + TOTP QR MFA flows, strict PIN whitelist (`380053` rejected, `380001` accepted), cross-user `403` guards, guest vs. account order separation, and Admin customer directory.

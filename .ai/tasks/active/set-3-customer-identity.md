# Task: Set 3 — Customer Identity, Authentication, Addresses & Privacy Isolation

**Status:** ACTIVE  
**Created:** 2026-11-12  
**Owner:** Antigravity / User  
**Package:** Isolated Set 3 (Customer Identity & Privacy Foundations)  
**Dependencies:** Set 2 (Delivery PIN Governance, Zones & Studio Controls — Completed)

## Context & Objectives
Finalize and harden Set 3 as an isolated functional unit, ensuring customer registration, passwordless/magic-link or credential authentication, session tokens/cookies, customer address book governance, order history privacy isolation, and profile management are fully operational and verified live on `devMachine` (`192.168.1.100`).

## Core Deliverables
1. **Customer Authentication & Session Security**:
   - Customer login (`/account/login`) and registration (`/account/register`).
   - Secure HTTP-only session cookie / token generation and validation.
   - Authentication middleware protecting `/account/*` routes with graceful redirection.
2. **Customer Profile & Address Book**:
   - Profile management (`/account/profile`): Name, email, verified mobile number.
   - Address book (`/account/addresses`): Multiple delivery addresses, default address selection, live 6-digit PIN serviceability validation.
3. **Privacy & Data Isolation**:
   - Strict tenant/user data isolation: Customers can view only their own orders (`/account/orders`), quotes, tickets, and addresses.
   - Admin customer management (`GET /api/admin/customers`): Staff visibility into customer profiles, order aggregates, and delivery addresses without exposing sensitive authentication tokens.
4. **Verification & Testing**:
   - Automated integration tests and browser verification on `devMachine` (`http://192.168.1.100:3001/account`).


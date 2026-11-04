# Documentation governance

> **CURRENT GOVERNANCE NOTE (2026-11-04):** Earlier 'not yet approved' and phase directions below are a historical snapshot. Phases 1–4 are now CLOSED. Latest owner-approved [effective handoff index](../roadmap/current-effective-handoff-baseline.md) and [decision register](../decisions/decision-register.md) control. Hostinger small VPS and PhonePe are selected directions, brand palette and typography and UX baseline approved, three purchase modes separated, MTO/Quote Only >=25% production threshold / 100% dispatch threshold, and independent original quote/confirmed grace clocks. Exact vendor credentials/capacity, production SKUs, code and compliance evidence are not complete. Preserve old text as history; no code/deployment authorised.


## Purpose
Make this repository the long-lived source of project decisions, including reasoning behind rejected alternatives, without turning exploratory advice into binding specifications.

## Decision states
- **LOCKED:** explicitly accepted by project owner.
- **PROPOSED:** discussed/recommended but not approved.
- **DEFERRED:** intentionally postponed.
- **REJECTED:** explicitly excluded or determined unsuitable for baseline; rationale preserved.
- **CONDITIONAL:** eligible only if safety, compliance, technical or commercial conditions are met.
- **SUPERSEDED:** a prior decision replaced by a newer one; retain historical context.

## Required decision record fields
ID; domain; decision statement; status; rationale; consequences; date/context; related files; supersedes/superseded-by as relevant.

Update the decision register when a decision changes. Avoid copying the same narrative into many places. Date changes and distinguish recommendations from owner approval. If a detail has not been resolved, write *TBD*, never infer it. Avoid storing personal identities, secrets and transactional data.

## Project workflow
Plan → Execute → Test, keeping the plan living as evidence and constraints change. Capture only durable, non-reconstructable context. Document architecture/design tradeoffs and test/rollback evidence before deployment.

## Not yet approved
A specific frontend/backend framework, hosting provider, payment gateway, domain, design palette, UI wireframes, initial SKU assortment, pricing, budget, launch date, and production readiness.

## 2026-10-28 — Whole-website direction safeguard

Before starting a new detailed workstream, consult [Master Website Blueprint and Delivery Roadmap](../roadmap/master-website-blueprint.md). The active priority is complete website sitemap/module/use-case coverage, followed by functional architecture and page-level design; technical implementation planning follows. Reuse LOCKED decisions without reopening them. Separate owner-approved product decisions from DRAFT page inventories and PROPOSED technical implementation details. Group routine button states, focus behavior, copy and accessibility details into implementation acceptance criteria, not serial owner approvals. WEB-041/WEB-042 remain valid supporting references but are not the active work queue. Explicitly preserve Quote Only and coupon details OPEN, WEB-040N's two customer-facing price components and WEB-038 DEFERRED.

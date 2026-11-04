# Reliability, monitoring, customer recovery and launch

**Accepted:** Extensive testing is necessary but insufficient; production needs monitoring, operational controls, off-server backups, restoration and rollback.

## Production controls
- Structured JSON application logs with timestamp, severity, event name and request/correlation identifier.
- Separate security logs, audit trail for privileged price/stock/refund changes, and business events for orders/payment/fulfilment.
- Never log secrets, full payment credentials, passwords, authentication tokens or unnecessary personal data. Define log retention/redaction/access.
- Independently monitored uptime and server resources; alert on failed payment handling, background jobs, disk exhaustion, database errors, SMTP failures.
- Admin **System Health** view proposed; external outage alert path required even if host itself fails.
- Backups: encrypted off-server database/media/config, automated schedule, periodic *tested restore* and documented rollback.
- Deployment: reproducible artifacts and environment-specific configuration; staging and production use same tested release where practical.
- Customer support: dedicated email available even during outage; site issue-reporting + admin support cases, payment recovery and order traceability.
- Separate order, payment, production and shipment status; manually entered carrier status explicitly identified.
- Idempotent payment callbacks, reconciliation and retry mechanisms; double purchase of last stock unit must be prevented.

## Two-phase release — LOCKED
1. **Private beta (~one week)** with selected known friends on a test/staging domain, using invited access, test payment credentials, isolated database, test orders/mail and crawl prevention.
2. **Public go-live** only after beta review and critical issues are resolved, plus production smoke checks and monitoring.

Suggested test cycle: browsing/responsiveness; accounts/guest checkout; payment success/failure; ready-stock/MTO/enquiries; admin/shipping/refunds; network/concurrency/error cases; regression and acceptance. The exact day-by-day sequence is a proposal, not a locked schedule.

## Production acceptance gates (PROPOSED)
No critical/high unresolved security/commerce issues; tested end-to-end purchases and recoveries; correct concurrent inventory; verified payment hooks and production credentials; functioning support; restored backup demonstration; external monitoring; correct SEO/indexability and domain; tested mobile/browser performance; rollback rehearsal; controlled live payment smoke test. Seven days elapsed does not automatically authorize launch.

## 2026-11-04 — Public merchant review site is not the private commerce beta

The owner intends a non-transacting, publicly reviewable branded site to obtain PhonePe merchant approval. This is a **separate pre-approval public presence**, not the locked OPS-004 private invited beta or the paid commerce go-live. Show genuine brand/business/catalogue and reviewed policies, truthful payment-unavailable messages, and no fake/unchecked payment or order acceptance. Confirm actual PhonePe review requirements; if a real checkout is required for approval, use only provider-sanctioned sandbox/demo/review procedure, not improvised live collection. Continue to require the **separate private invited beta with isolated keys/data and crawl prevention** before a fully gated commercial launch. No stage starts without explicit owner deployment authorisation.

## Beta domain cautions
Use invitation protection (not just robots.txt); staging domain and environment TBD. Keep test and live keys, orders, notifications and databases isolated. Do not migrate beta customer data into production by accident.

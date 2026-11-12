# Tavistra Pre-Live Acceptance & Quality Assurance Runbook

**Document Version:** 1.0.0  
**Effective Date:** 2026-11-09  
**Target Environment:** `devMachine` (`192.168.1.100`)  
**Storefront URL:** [http://192.168.1.100:3001](http://192.168.1.100:3001)  
**Staff Admin Portal URL:** [http://192.168.1.100:3002](http://192.168.1.100:3002)  
**Mailpit Web UI (SMTP):** [http://192.168.1.100:8025](http://192.168.1.100:8025)  
**PostgreSQL 17 Database:** `192.168.1.100:5433` (`tavistra_db`)  

---

## 1. How to Use This Runbook

This runbook is designed for comprehensive, end-to-end operational verification before public release. It covers every user journey, operational workflow, administrative control, and security gate.

### Review Instructions for the Reviewer:
1. **Execute each test case in order.**
2. Under **Status**, mark as `[PASS]`, `[FAIL]`, or `[BLOCKED]`.
3. Under **Reviewer Notes & Feedback**, type your observations, UX notes, defect descriptions, or feature enhancement requests directly into this file.
4. Once you complete your review, Antigravity will analyze the documented findings and execute the requested enhancements.

### Service Management Commands (on `devMachine` via SSH):
```bash
# Connect to devMachine
ssh -i ~/.ssh/krama_dev_server vishnu@192.168.1.100

# Start All Services (Storefront on 3001, Admin on 3002)
/home/vishnu/deployments/websiteTavistra/start-production.sh

# Stop All Services
/home/vishnu/deployments/websiteTavistra/stop-production.sh

# Inspect Live Daemon Logs
tail -f /home/vishnu/deployments/websiteTavistra/storefront.log
tail -f /home/vishnu/deployments/websiteTavistra/admin.log
```

---

## 2. Quick Links Reference

| Destination | Live URL | Purpose |
| :--- | :--- | :--- |
| **Storefront Homepage** | [http://192.168.1.100:3001/](http://192.168.1.100:3001/) | Customer public entry & catalog discovery |
| **Storefront Shop** | [http://192.168.1.100:3001/shop](http://192.168.1.100:3001/shop) | Full luxury product catalog |
| **Order Tracking** | [http://192.168.1.100:3001/track](http://192.168.1.100:3001/track) | Public/authenticated tracking, QC photos, 75% balance pay |
| **Customer Account** | [http://192.168.1.100:3001/account](http://192.168.1.100:3001/account) | Customer profile, addresses, order history |
| **Contact & Inquiries** | [http://192.168.1.100:3001/contact](http://192.168.1.100:3001/contact) | Support tickets, bulk inquiries, bespoke requests |
| **Staff Admin Portal** | [http://192.168.1.100:3002/](http://192.168.1.100:3002/) | Fulfilment, proposals, catalog governance, PINs, settings |
| **Mailpit SMTP Console** | [http://192.168.1.100:8025/](http://192.168.1.100:8025/) | Inspect all outbound transactional and proposal emails |

---

## Phase 1: Environment & Infrastructure Verification

| Test ID | Module / Area | Test Objective & Action | Expected Result | Status | Reviewer Notes & Feedback |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **INF-01** | Service Launch | Run `/home/vishnu/deployments/websiteTavistra/start-production.sh` on `devMachine`. | Both Storefront (port 3001) and Admin (port 3002) start cleanly with PIDs recorded. | `[ Pass ]` | |
| **INF-02** | Storefront Health | Open [http://192.168.1.100:3001](http://192.168.1.100:3001) in browser. | Returns HTTP 200; homepage renders instantly without missing fonts or CSS chunks. | `[ Pass ]` | |
| **INF-03** | Admin Health | Open [http://192.168.1.100:3002](http://192.168.1.100:3002) in browser. | Returns HTTP 200; Admin dashboard loads and connects to backend APIs without network errors. | `[ Pass ]` | |
| **INF-04** | Mailpit SMTP | Open [http://192.168.1.100:8025](http://192.168.1.100:8025) in browser. | Mailpit Web UI loads and displays captured email inbox. | `[ Pass ]` | |
| **INF-05** | Service Teardown | Run `/home/vishnu/deployments/websiteTavistra/stop-production.sh` and re-run start script. | Ports 3001 and 3002 release cleanly without orphaned processes, and restart smoothly. | `[ Fail ]` | Stop script didn't stop anything! The web pages are still aceesible. In terminal i see the message "Stopped Tavistra services on ports 3001 and 3002." But it's not true. I can still access the web pages. | 

---

## Phase 2: Brand Foundation & Storefront Experience

| Test ID | Module / Area | Test Objective & Action | Expected Result | Status | Reviewer Notes & Feedback |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **STR-01** | Brand Entity | Check header, footer, copyright notice, legal documents, and page titles across the site. | Legal entity is strictly **VDesign** (never "VDesign Studio"). Sub-brand is **Tavistra**. | `[ Pass ]` | |
| **STR-02** | Prohibited Terms | Search visible page copy and metadata for the prohibited word `"Commission"`. | Prohibited word is absent; appropriate terminology ("Bespoke Proposal", "Custom Order", "Architectural Request") is used. | `[ Pass ]` | |
| **STR-03** | Homepage Layout | Inspect Homepage [http://192.168.1.100:3001/](http://192.168.1.100:3001/): Hero, Philosophy, Featured Curation, Footer. | Visual luxury aesthetic (Cormorant Garamond serif / Inter sans, brass/charcoal/warm paper palette), responsive navigation, high-resolution imagery. | `[ Pass ]` | |
| **STR-04** | Institutional Pages | Visit `/our-story`, `/shipping`, `/returns-refunds`, `/terms`, `/privacy`. | Complete, polished policy text matching PhonePe onboarding standards and the 12-slab delivery policy. No placeholder `Lorem Ipsum`. | `[ Blocked ]` | I would liek to avoid mentioning the courier names, this makes me tied up. we should adjust shipping page content accordingly. for shipping zones, i would like to have 2-3 days of delivery time for zone A. for zone B, C, D i would keep the estimate to 7-10 days and for zone E 10-15 days; i also needs to make a remark that the delivery can be imacted and these number are just estimation. for retuns & refunds; say 7 calendar days from the day of delivery instead of " return request must be raised within 7 calendar days of the carrier delivery scan", refund will be issued only if product is return in as is condition (neww, not used, etc.), don't say "allocates metal stock" say allocate material and other resources, after the end of 7 day grace period the 25% advance is not refundable, made to order have a delivery timeline of 15-30 days no matter the zone, qoute only product will have a separate delivery timeline as mentioned in the qoute, upi retunrs upto 7 days, card and netbanking refunds in upto 15 days. |
| **STR-05** | Catalogue Browsing | Navigate to `/shop` and filter by category (e.g. Home Decor Objects, Personal Accessories). | Active products display accurate names, pricing, materials, and badges (Ready Stock / Made to Order). | `[ Block ]` | on the shop page it says fileter category and when i click on it then it takes me to category product page and there we have sub-catergory filter, well sub category filter kind of works fine but the category one doesn't as now i am on the caregorized product page and cannot go to shop page (can go but from menu) by clearing any filter where i see all the products |
| **STR-06** | Product Detail Page (PDP) | Open a product detail page (e.g., `/product/monolith-minimalist-wall-clock`). | High-resolution image gallery, full specifications table, dimensions, materials, care instructions, lead time, and delivery slab preview. | `[ Block ]` | we have markdown product detail functionality, but so far we haven't extended it to handle picture(s) which we need to do |
| **STR-07** | Pricing Transparency (TAV-03) | Check price displayed on PDP and compare with checkout. | Price is strictly tax-inclusive (GST included). Delivery fee is separated. No surprise customer packing or fuel surcharge fees. | `[ Pass ]` | |
| **STR-08** | Made to Order PDP Notice | Open a Made to Order product (e.g., `/product/arc-solid-brass-wall-mirror`). | Explicit notice that a 25% production advance is payable today, with the remaining 75% due after workshop QC inspection before dispatch. | `[ Pass ]` | |
| **STR-09** | Bulk Order Ceiling Alert | On PDP, attempt to increase quantity beyond 10 units. | UI enforces max 10 units per standard order and guides large inquiries to `/contact` for architectural/bulk pricing. | `[ Block ]` | well this is partially working. it should become bulk order if there are more than 10 line items or overall item quantities are more than 10 (even for multiple line item) because if i have 5 line items and each have 10 quantity then we are talking about 50 product dispatchs, physically talking i would not want to dispatch more than 10 items in single retail order (same or multiple product(s)) |

---

## Phase 3: Cart Governance, Delivery Fees & Checkout

| Test ID | Module / Area | Test Objective & Action | Expected Result | Status | Reviewer Notes & Feedback |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **CHK-01** | Cart Addition | Add a Ready Stock item to cart; verify header cart count badge and slide-over/cart page (`/cart`). | Item accurately appears with thumbnail, chosen variant, unit price, and subtotal. | `[ Pass ]` | We don't have product images inthe system yet so thumbnain couldn't be seen |
| **CHK-02** | 12-Slab Delivery Fee (Single Item) | Add 1 product with delivery fee (e.g. Monolith Clock with ₹500 delivery fee) and proceed to `/checkout`. | Delivery fee displays exactly ₹500 matching the approved 12-slab ladder. | `[ Pass ]` | |
| **CHK-03** | Highest Delivery Fee Rule (Multi-Item) | Add 2 products with different delivery fees (e.g., Product A: ₹250, Product B: ₹750). | Single combined delivery fee equals ₹750 (the highest single-product fee in the cart). Excess freight is absorbed by the studio. | `[ Pass ]` | |
| **CHK-04** | Universal PIN Validation (Serviceable) | At checkout, enter a known standard PIN code (e.g. `560001` or `110001`). | PIN is verified as serviceable; total reflects Tax-Inclusive Price + Delivery Fee; payment button is enabled. | `[ Pass ]` | |
| **CHK-05** | PIN Code Serviceability Block (Unserviceable) | In Admin, mark a PIN code as inactive (or enter a disabled test PIN like `999999` at checkout). | System immediately displays a clear, elegant alert: *"Delivery is currently unserviceable to PIN [code]"*. Checkout payment is prevented. | `[ Block ]` | Well the pin which was not int he list (999999) wa highlighted but when i disabled a pincode in system it was still working which shouldn't happen. and i don't think i have access to the all pincodes (allowed ones) in the admina panel. |
| **CHK-06** | Ready Stock Full Checkout (100%) | Complete checkout for a Ready Stock item. Enter address and click "Pay ₹... via PhonePe (Simulated)". | Order created with status `CONFIRMED`, `purchaseMode: READY_STOCK`, `PaymentStatus: COMPLETED` (100% paid). Confirmation page displays with Order Reference (`TAV-RS-...`). | `[ Pass ]` | |
| **CHK-07** | Made to Order Checkout (25% Advance) | Complete checkout for a Made to Order item. | Order created with `purchaseMode: MADE_TO_ORDER`, status `CONFIRMED`. Payment record shows 25% advance settled (`balanceDue = 75%`). Order confirmation highlights the 7-day grace period. | `[ Pass ]` | |
| **CHK-08** | Transactional Email Dispatch | Check Mailpit (`http://192.168.1.100:8025`) immediately after placing orders CHK-06 and CHK-07. | Luxury branded HTML confirmation email arrived for each order, showing exact line items, pricing, delivery address, and reference number. | `[ Pass ]` | |
| **CHK-09** | Studio Maintenance Freeze | In Admin, enable **Maintenance Mode**. Try to checkout on the storefront. | Checkout page gracefully locks down with an informative notice: *"Our checkout is temporarily paused for routine studio system maintenance."* | `[ Fail ]` | Checkout is still working |

---

## Phase 4: Customer Account & Order Tracking Suite

| Test ID | Module / Area | Test Objective & Action | Expected Result | Status | Reviewer Notes & Feedback |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **ACC-01** | Registration | Register a new customer account at `/account/register`. | Account created in database; redirected to account dashboard showing greeting and profile details. | `[ Pass ]` | Well the account creation is working but we need to do a lot more things, email needs to be varified, no password generation, and lot more. also the new account show other orders (our test ones) and i think this can be a privacy issue |
| **ACC-02** | Customer Login | Log out and log back in at `/account/login` using credentials. | Seamless authentication; session persists across page reloads. | `[ Block ]` | It logged in but no password was needed! |
| **ACC-03** | Address Management | In `/account/addresses`, add a new shipping address with full contact info and PIN code. | Address saves and can be marked as default; auto-populates during subsequent checkouts. | `[ Block ]` | Addinign address work but auto filling in pincode or autofill checkout form doesn't work. i should have option to choose a delivery address when i am logged in! |
| **ACC-04** | Order History View | Open `/account/orders` for the logged-in customer. | Displays past orders, order dates, payment status (e.g. "25% Advance Paid" vs "Fully Paid"), and tracking links. | `[ Fail ]` | For make to order, even after clearing the remaining 75% the status was still showing balance amount need to be paid, once i go into track milestone there it shows that its paid |
| **ACC-05** | Public Tracking Search | Go to `/track` while logged out. Enter an Order Reference (e.g. `TAV-MTO-2026-2002`) and customer email. | Order tracking detail loads correctly without requiring a full login. | `[ Block]` | Well it kind of working, the tracking page already had one order visisble which it shouldn't, it tracked without email just order id was enough |
| **ACC-06** | Production Milestone Timeline | Inspect the tracking page visual timeline for an active order. | Visual milestone tracker shows active step (e.g., Material Procurement, Workshop Production, QC Inspection, Packed & Dispatched, Delivered). | `[ Pass ]` | Kind of ok but need to improve |
| **ACC-07** | QC Inspection Photos Gallery | On tracking page of an order with QC photos uploaded, inspect the **"Finished Piece QC Inspection Photos"** section. | High-resolution workshop photos of the finished piece render with craftsman inspection notes. | `[ Block ]` | We haven't uploaded any pictures yet |
| **ACC-08** | 75% Balance Payment Action | On an MTO order tracking page with 75% balance due, click **"Pay Remaining Balance (75%)"**. | System processes the simulated 75% payment, updates the ledger, sets `balanceDue = 0`, and updates the badge to "Fully Paid - Ready for Packing". | `[ Pass ]` | |

---

## Phase 5: "Quote Only" 30-Day Architectural Proposal Lifecycle (TAV-07)

| Test ID | Module / Area | Test Objective & Action | Expected Result | Status | Reviewer Notes & Feedback |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **QOT-01** | Inquiry Ingestion | On `/contact`, submit a Bespoke / Architectural Inquiry with dimensions, quantities, and client brief. | Ingestion succeeds with confirmation message; record appears in PostgreSQL and Admin Inquiries worklist. | `[ Fail ]` | Submitted the the form but didn't appear in the admin panel |
| **QOT-02** | Staff Proposal Generation | In Admin (`http://192.168.1.100:3002`), open **Inquiries & Proposals** tab. Click **"Issue 30-Day Proposal"**. Enter 2 bespoke line items, custom delivery charge, and production lead time (e.g. 6 weeks). | Proposal created with status `DRAFT`/`SENT`, assigned Quote Reference (`QTE-2026-...`), and `expiresAt` automatically set to exactly 30 days from creation. | `[ Fail ]` | didn't worked. very basic form, nto possibility to create multiple line items. also got an error "JSON.parse: unexpected end of data at line 1 column 1 of the JSON data" |
| **QOT-03** | Proposal Email Dispatch | Check Mailpit (`http://192.168.1.100:8025`). | Formal quotation email received by customer containing luxury branding ("VDesign"), line-item breakdown, 30-day offer lock notice, and a direct link to `/quote/[quoteNumber]`. | `[ Fail ]` | Not able to issue quote, there was an error. |
| **QOT-04** | Customer Proposal Page | Open the proposal URL (e.g. `http://192.168.1.100:3001/quote/QTE-2026-8001`) in browser. | Proposal page renders: 30-day countdown timer, detailed line items, materials, delivery terms, advance payment breakdown (25% today, 75% pre-dispatch). | `[ Fail ]` | No quotes to work with or quotes are not connected. |
| **QOT-05** | Proposal Revision (N+1) | In Admin, create a Revision for this quote (e.g., change item price or add custom finish). | New version ($V2$) created; **CRITICAL:** Original 30-day offer clock is strictly preserved (revisions do NOT extend the expiry deadline). | `[ Fail ]` | Issue proposal are nto working |
| **QOT-06** | 1-Click Proposal Acceptance | On proposal page (`/quote/[quoteNumber]`), click **"Accept Proposal & Pay 25% Advance"**. | Atomically creates a confirmed Order in PostgreSQL, records 25% advance payment, marks Quote as `ACCEPTED`, and redirects to order confirmation. | `[ Fail ]` | Not working |
| **QOT-07** | Post-Acceptance Mailpit Notification | Check Mailpit (`http://192.168.1.100:8025`). | Confirmation email arrives acknowledging proposal acceptance, receipt of 25% production advance, and scheduled workshop production start. | `[ Fail ]` | Alredy mentioned quote issuing not working |
| **QOT-08** | Expired Proposal Gate (Negative Test) | Simulate an expired quote (or inspect route check for `expiresAt < now`). | Acceptance button is disabled; page indicates proposal has expired and invites the client to request an updated quotation. | `[ Fail ]` | Alredy mentioned quote issuing not working |

---

## Phase 6: Client Desk & Support Ticket Management

| Test ID | Module / Area | Test Objective & Action | Expected Result | Status | Reviewer Notes & Feedback |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **TCK-01** | Ticket Submission | On `/contact`, submit a Support Ticket with Subject, Order Reference, and detailed query. | Success confirmation with Ticket Number (`TCK-2026-...`); record saved in PostgreSQL. | `[ Fail ]` | We don't have a specific support ticket flow i gues, just the contact form, we need to built it properly. |
| **TCK-02** | Admin Ticket Queue | In Admin portal (`http://192.168.1.100:3002`), open the **Support Tickets** tab. | Newly created ticket appears in the worklist with status `OPEN`, priority, and preview. | `[ Fail ]` | We don't have a specific support ticket flow i gues, just the contact form, we need to built it properly. |
| **TCK-03** | Staff Thread Reply | In Admin, click the ticket to expand thread. Enter a staff reply and submit. | Reply appends to the conversation thread; ticket status updates to `IN_PROGRESS`. | `[ Fail ]` | We don't have a specific support ticket flow i gues, just the contact form, we need to built it properly. |
| **TCK-04** | Outbound Email Dispatch | Check Mailpit (`http://192.168.1.100:8025`). | Customer receives a formatted luxury email with staff response and ticket reference. | `[ Fail ]` | We don't have a specific support ticket flow i gues, just the contact form, we need to built it properly. |
| **TCK-05** | Ticket Resolution | In Admin, mark ticket status as `RESOLVED`. | Status updates in database and UI reflects resolved state. | `[ Fail ]` | We don't have a specific support ticket flow i gues, just the contact form, we need to built it properly. |

---

## Phase 7: Staff Administration Portal (`apps/admin`) Operations

| Test ID | Module / Area | Test Objective & Action | Expected Result | Status | Reviewer Notes & Feedback |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **ADM-01** | Orders Worklist | In Admin **Orders** tab, filter by status (All, Confirmed, In Production, QC, Dispatched). | Orders table updates dynamically with correct order references, dates, customer names, and balance due. | `[ ]` | |
| **ADM-02** | 7-Day Grace Period Tracker | Inspect an order in the 7-day post-confirmation window. | Grace period countdown badge displays remaining days; flags any delivery address or courier feasibility review. | `[ ]` | |
| **ADM-03** | Hard Dispatch Gate (Lockout) | Find an order with `balanceDue > 0`. Attempt to enter an AWB tracking number or click "Packed & Dispatched". | **STRICT SECURITY GATE:** Action is completely disabled; UI displays warning banner: *"Dispatch Blocked — 100% Payment Required. Balance Due: ₹..."*. | `[ ]` | |
| **ADM-04** | Balance Payment Link Copy | On the blocked order from ADM-03, click **"Copy Balance Link"**. | Direct link to order balance payment is copied to clipboard for staff to share with customer via SMS/WhatsApp. | `[ ]` | |
| **ADM-05** | Dispatch After Balance Clearance | Pay the 75% balance for the order (via customer tracking or simulated payment). Return to Admin. | Balance due shows ₹0; AWB input and "Packed & Dispatched" button become enabled; courier AWB can now be assigned. | `[ ]` | |
| **ADM-06** | Workshop QC Photo Upload | In Orders tab, click **"Upload QC Photos"** on an order in production/QC. Add image URLs and craftsman inspection notes. | QC photos save to order record; immediately visible on customer tracking page (`/track`). | `[ ]` | |
| **ADM-07** | Catalogue Draft / Publish Toggle | In **Catalogue** tab, click **"Unpublish (Draft)"** on an active product. Check storefront `/shop`. | Product immediately disappears from public storefront. Clicking **"Publish"** restores it immediately. | `[ ]` | |
| **ADM-08** | Markdown Catalogue Importer | In **Catalogue** tab, click **"Import / Sync Markdown"** -> **"Sync All from docs/products"**. | System parses markdown files and frontmatter, syncs prices and specifications, and reports success modal. | `[ ]` | |
| **ADM-09** | Delivery PIN Code Control | In **Delivery PINs** tab, search a PIN (e.g. `110001`) and toggle status to Inactive. | PIN is immediately blocked on storefront checkout; toggling back restores serviceability. | `[ ]` | |
| **ADM-10** | Studio Maintenance Mode | In **Settings** tab, toggle **Maintenance Mode** ON. Visit storefront checkout. | Storefront checkout freezes with maintenance notification banner. | `[ ]` | |
| **ADM-11** | Studio Hiatus & Announcement | In **Settings** tab, enable **Studio Hiatus** and enter a custom announcement text. Refresh storefront. | Top announcement bar renders across all storefront pages with the exact custom text. | `[ ]` | |
| **ADM-12** | Customer Directory Review | In **Customers** tab, inspect customer profiles, lifetime spend, order count, and addresses. | Customer statistics and contact records display accurately. | `[ ]` | |

---

## Phase 8: Security, Integrity & Non-Functional Audit

| Test ID | Module / Area | Test Objective & Action | Expected Result | Status | Reviewer Notes & Feedback |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **SEC-01** | Mobile Responsiveness | Open Storefront and Admin on mobile viewport (or Chrome DevTools responsive mode at 375px/390px). | Layout adapts seamlessly; typography scales; no horizontal scrolling or overlapping touch targets. | `[ ]` | |
| **SEC-02** | Zero Secret Exposure | Inspect client-side network requests and source maps in browser DevTools. | No database connection strings, SSH keys, or server credentials exposed to client. | `[ ]` | |
| **SEC-03** | Direct URL Tampering | Try entering an invalid order ID or quote ID in URL (e.g., `/quote/NON-EXISTENT-QUOTE` or `/orders/FAKE`). | Returns graceful 404 / Not Found luxury state without leaking unhandled server stack traces. | `[ ]` | |
| **SEC-04** | Negative Quantity / Price Tampering | Attempt to submit checkout or cart with negative quantity via network intercept. | Server validates and rejects invalid quantities; database constraints maintain positive values. | `[ ]` | |
| **SEC-05** | Concurrent State Verification | Open Admin in one window and Customer Tracking in another. Perform a status update in Admin. | Status update is persistent in PostgreSQL; refreshing customer tracking displays updated state immediately. | `[ ]` | |

---

## 3. Reviewer Summary & Feedback Log

*Use this section to record broader observations, UX refinements, design adjustments, or prioritized change requests after completing the test cases above.*

### Overall Assessment:
- **Date Tested:** 
- **Tester / Reviewer:** 
- **Overall Verdict:** `[READY FOR PRODUCTION]` / `[CHANGES REQUESTED]` / `[BLOCKING ISSUES]`

### Key Observations & Enhancements Required:
1. *(e.g., Product detail page zoom interaction on mobile)*:
   - 
2. *(e.g., Email template footer styling or typography)*:
   - 
3. *(e.g., Admin dashboard filtering or export capability)*:
   - 
4. *(e.g., Additional copy refinements)*:
   - 

### Bugs / Edge Cases Identified:
1. 
2. 
3. 


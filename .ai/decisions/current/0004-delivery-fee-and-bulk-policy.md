# Decision 0004: Delivery Fee Architecture, PIN Serviceability, and Bulk Order Governance

modified: 2026-11-12

## Context & Authority
Approved by repository owner on 2026-11-06 in `docs/website/delivery-fee-pricing-approved.md`, `docs/website/delivery-pincode-launch-policy.md`, and `docs/decisions/current-production-payment-lifecycle.md` (with strict 6-digit whitelist enforcement confirmed in Set 2 on 2026-11-12). Supersedes earlier automatic per-product PIN restrictions, live carrier-rate dependency, and weight/distance calculation formulas as the customer-facing checkout engine.

## Core Decisions & Rules

### 1. Customer-Facing Delivery Fee Ladder
- Owner-configured product-specific fee per destination commercial band selected from an approved 12-slab ladder (INR):
  `0, 250, 500, 750, 1,000, 1,500, 2,000, 2,500, 3,000, 4,000, 5,000, 7,500`
- Raw courier rates, volumetric weights, and distance formulas serve strictly as **internal benchmark/costing inputs**, not live frontend calculators.
- Product price embeds baseline packaging and freight allowances; delivery fee recovers only incremental destination freight exposure.

### 2. Tax-Inclusive Final Customer Presentation (TAV-03)
- The approved fee ladder values are **final customer-payable amounts**. Do NOT add extra GST, fuel surcharges, or packing fees on top at checkout.
- Statutory GST is computed and disclosed **within** the transaction total per CGST Act s.15(2)(c).
- Checkout displays strictly two customer-facing price components: **Tax-inclusive Product Price + Single Combined Delivery Fee**.

### 3. Highest Product Fee Rule for Multi-Item Orders
- For single-destination orders containing multiple items, charge a **single delivery fee equal to the highest applicable product delivery fee**, NOT the sum of fees.
- Tavistra absorbs any extra multi-parcel freight variance.

### 4. Fixed Order Delivery Charge
- The accepted delivery fee is fixed at checkout and is **not recalculated or refunded solely because one item in a multi-item order is partially cancelled**.
- Full order cancellations resulting from seller-side non-fulfilment or delivery impossibility receive a **100% full refund including the delivery charge**.

### 5. Quantity Ceilings & Bulk Order Threshold
- Ordinary purchasable order limit: **up to 10 total units overall across the order** AND **up to 10 distinct order line items** (updated from 10-per-product on 2026-11-12 per owner instruction).
- Exceeding **either** ceiling blocks ordinary checkout and directs the customer to the **Bulk Order Enquiry** workflow.
- Bulk enquiries capture product, quantity, destination, and contact details for staff quotation; ordinary fee ladders do not automatically apply to bulk orders.

### 6. Universal Enabled-PIN Serviceability (Strict Whitelist Governance)
- Delivery eligibility is governed by a 2-level hierarchy (**2-digit/3-digit Region Prefixes -> Nested 6-Digit Whitelist**, `coverageMode: "STRICT_WHITELIST"` by default).
- Any **owner-enabled** six-digit PIN is presumed serviceable for all standard catalogue items; unlisted PINs remain unserviceable (`NOT_IN_WHITELIST`) until enabled in Admin Logistics.
- For Made to Order and Quote Only pieces, staff use the **7-day post-confirmation grace period** to verify physical courier feasibility.
- Unresolved delivery infeasibility blocks physical production start and mandates a 100% full refund with zero customer penalty.

### 7. Logistics Hub Origins
- Operations may dispatch from Delhi hubs (`110062`, `110019`, `110074`), but customer fee schedules remain strictly origin-independent.


# Tavistra — PIN-code coverage reconciliation and validation (2026-11-06)

## Current status and correction
The [884-row candidate register](delivery-pincode-candidates.csv) is **screening only**. Its group label was inferred from a three-digit prefix using an older GeoNames-derived public list; that is **not** authoritative city assignment, current India Post validation, urban classification, carrier serviceability or fragile-goods acceptance. All rows remain disabled. Do not publish 884 as an approved delivery count.

## Better source identified
The government [All India Pincode Directory](https://data.gov.in/catalog/all-india-pincode-directory-through-webservice) is the authoritative target and lists office name, district, state, delivery status and PIN. A [public republishing project](https://github.com/dropdevrahul/pincodes-india) is documented as containing roughly 157,126 post-office records / 19,300 unique PINs (2024 snapshot), materially fuller than the older ~884 candidate selection. Another [weekly-refreshing project](https://github.com/paramadeep/indiapins) documents ~154,000 offices and ~19,000 PINs, sourced through indiapost.org, but is unofficial. **Neither was imported or cross-checked here**: the direct CSV retrieval was inaccessible and the repo connector did not expose the large file contents. Do not claim this pass verified or added any PIN.

## Priority reconciliation (before final band or fee approval)
1. **NCR critical:** individually split Delhi, Noida, Greater Noida, Ghaziabad, Gurugram and Faridabad; add missing 201xxx, 203xxx, 122xxx and 121xxx PINs from the fuller directory. The prior prefix filter only returned five combined Noida/Ghaziabad candidates and missed much of the intended market.
2. **West critical:** separate Mumbai, Navi Mumbai, Thane, Pune and Surat. A narrow 395xxx-only filter returned three Surat candidates; 400xxx-only and 411xxx-only likewise miss legitimate nearby urban prefixes. Do not approve the present groups as complete.
3. **Chandigarh tri-city:** separate Chandigarh, Mohali and Panchkula; inspect 160xxx, 140xxx and 134xxx without assuming all are urban.
4. **Other cities:** map each individual post-office locality and district; remove peripheral/rural PINs and flag office non-delivery where relevant. Do not infer coverage from a district or 3-digit prefix.
5. For each retained PIN, record: verified office/district/state, city, urban/peripheral classification, source date, geographic band, separately priced commercial band, at least one valid Delhi origin, eligible carrier/service, written fragile-commodity acceptance/claims conditions, and owner approval date. Only then set checkout eligible = YES.
6. Price representative packed chargeable-weight profiles 2/5/10/25/50 kg; retain product-price baseline freight allowance and manually approved fee slabs. Charge one highest applicable delivery fee per order, preserve separate purchase modes.

## Implementation boundary
This is planning-data preparation, not website execution. The next data operation requires an accessible official CSV/API export or a verifiable fuller source. No auto-approval or unverified rates. Existing 884 candidates remain as an audit trail.

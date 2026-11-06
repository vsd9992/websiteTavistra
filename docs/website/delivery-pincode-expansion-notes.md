# Tavistra delivery PIN candidate expansion (2026-11-06)

## Status
Expanded **884 unique candidate PIN codes** from the publicly accessible `sanand0/pincode` `data/IN.csv` source (archived repository; older data, not a current official postal or courier verification). See [candidate CSV](delivery-pincode-candidates.csv). The original 30 seeds were illustrative, not a sufficient market coverage set.

**NOT approved:** None of the 884 records is enabled for checkout. All are `NO` until individually verified. The dataset's state/place columns and PIN-prefix assignment are useful screening evidence only; prefix grouping **must not** be treated as proof that a PIN belongs to the named target city, is urban, is delivery-office serviceable, or accepts fragile products. The 884 rows do not guarantee coverage of all shortlisted cities. The 201 prefix, for example, yielded only five source records and must be supplemented with a newer directory before considering NCR coverage complete.

## Next validation pass
1. Import the current India Post directory and reconcile each PIN, office name, district, state and delivery status; add missing urban PINs (especially NCR and other sparse markets).
2. Separate merged markets (Noida / Greater Noida / Ghaziabad; Chandigarh / Mohali / Panchkula; Mumbai / Navi Mumbai / Thane) by actual locality; reject or manually review peripheral/rural entries.
3. Record actual six-digit PIN eligibility by at least one of Delhi origins 110062, 110019, 110074 and carrier acceptance of fragile commodity/packaging, including insurance exclusions.
4. Assign geographical D1–D5 independently from commercial cost band; benchmark 2/5/10/25/50 kg chargeable packed weight and apply owner-approved product-by-band delivery fee slabs.
5. Enable only explicitly approved PIN/product/mode combinations. One fee per order = highest eligible product fee, preserving separate Ready Stock, Made to Order and Quote Only order flows.

**Source:** https://github.com/sanand0/pincode/blob/master/data/IN.csv (archived January 2026); official reference https://data.gov.in/catalog/all-india-pincode-directory-through-webservice . No website implementation authorised.

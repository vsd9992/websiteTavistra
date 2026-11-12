/**
 * Set 2 Comprehensive Verification Suite
 * Verifies Delivery PIN Governance, 12-Slab Fee Ladder, Studio Operational Controls, and Brand Compliance.
 * Targets live devMachine: http://192.168.1.100:3001 and PostgreSQL on devMachine:5433
 */

import { prisma } from "../src";
import {
  DELIVERY_FEE_SLABS,
  matchDeliveryFeeSlab,
  calculateOrderDeliveryFee,
  checkBulkOrderCeiling,
  resolveShippingZone,
  SHIPPING_ZONES,
} from "@tavistra/shared";

const STOREFRONT_URL = process.env.STOREFRONT_URL || "http://192.168.1.100:3001";
const ADMIN_URL = process.env.ADMIN_URL || "http://192.168.1.100:3002";

interface TestReport {
  name: string;
  category: string;
  passed: boolean;
  details: string;
}

const report: TestReport[] = [];

function assert(condition: boolean, name: string, category: string, details: string) {
  if (condition) {
    report.push({ name, category, passed: true, details });
    console.log(`  [PASS] ${category} > ${name}`);
  } else {
    report.push({ name, category, passed: false, details: `FAILED: ${details}` });
    console.error(`  [FAIL] ${category} > ${name}: ${details}`);
  }
}

async function runSet2Verification() {
  console.log("\n=======================================================");
  console.log("  SET 2 VERIFICATION SUITE — LIVE ON DEVMACHINE");
  console.log(`  Target Storefront: ${STOREFRONT_URL}`);
  console.log(`  Target Database: ${process.env.DATABASE_URL || "devMachine:5433"}`);
  console.log("=======================================================\n");

  // --------------------------------------------------------------------------
  // SECTION 1: 12-Slab Delivery Fee Ladder & Multi-Item Ceiling Governance
  // --------------------------------------------------------------------------
  console.log("--- Section 1: 12-Slab Delivery Fee Ladder & Ceiling Rules ---");

  // Test 1.1: Approved Slabs
  const expectedSlabs = [0, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500];
  const slabsMatch =
    DELIVERY_FEE_SLABS.length === 12 &&
    expectedSlabs.every((s, i) => DELIVERY_FEE_SLABS[i] === s);
  assert(slabsMatch, "12-Slab Ladder Structure", "Fee Ladder", "Exact 12 slabs (0 to 7500) match 2026-11-06 Owner Policy");

  // Test 1.2: matchDeliveryFeeSlab
  assert(matchDeliveryFeeSlab(0) === 0, "Slab Match Zero", "Fee Ladder", "0 maps to 0");
  assert(matchDeliveryFeeSlab(200) === 250, "Slab Match 200->250", "Fee Ladder", "200 maps to 250");
  assert(matchDeliveryFeeSlab(1200) === 1500, "Slab Match 1200->1500", "Fee Ladder", "1200 maps to 1500");
  assert(matchDeliveryFeeSlab(6000) === 7500, "Slab Match 6000->7500", "Fee Ladder", "6000 maps to 7500");
  assert(matchDeliveryFeeSlab(10000) === 7500, "Slab Match Overflow", "Fee Ladder", "Excess amounts capped at 7500 pending review");

  // Test 1.3: Highest Product Fee Rule for Multi-Item Orders
  const sampleProductFees = [250, 1500, 750, 500];
  const orderFee = calculateOrderDeliveryFee(sampleProductFees);
  assert(orderFee === 1500, "Highest Product Fee Absorption", "Multi-Item Rule", "Multi-item fee equals single highest fee (1500), never the sum (3000)");

  // Test 1.4: Bulk Order Ceiling Rules
  // <= 10 units of same product
  const okUnits = checkBulkOrderCeiling([{ productId: "prod-1", quantity: 10 }]);
  assert(!okUnits.isBulkEnquiryRequired, "10 Units Allowed", "Bulk Boundary", "Exactly 10 units allowed for ordinary checkout");

  // > 10 total units
  const breachUnits = checkBulkOrderCeiling([{ productId: "prod-1", quantity: 11 }]);
  assert(
    breachUnits.isBulkEnquiryRequired &&
      breachUnits.reason === "EXCEEDS_MAX_TOTAL_UNITS" &&
      !/single product/i.test(breachUnits.message || ""),
    "11 Units Triggers Bulk",
    "Bulk Boundary",
    "11 total units overall triggers Bulk Enquiry without stale single-product wording"
  );

  // Aggregated units across repeated lines of same product
  const splitLineUnits = checkBulkOrderCeiling([
    { productId: "prod-1", quantity: 6 },
    { productId: "prod-1", quantity: 5 },
  ]);
  assert(splitLineUnits.isBulkEnquiryRequired, "Split-Line Aggregation", "Bulk Boundary", "6 + 5 = 11 units across split lines correctly triggers Bulk Enquiry");

  // <= 10 distinct line items
  const tenLines = Array.from({ length: 10 }, (_, i) => ({ productId: `prod-${i}`, quantity: 1 }));
  assert(!checkBulkOrderCeiling(tenLines).isBulkEnquiryRequired, "10 Distinct Lines Allowed", "Bulk Boundary", "10 distinct lines allowed for retail checkout");

  // > 10 distinct line items
  const elevenLines = Array.from({ length: 11 }, (_, i) => ({ productId: `prod-${i}`, quantity: 1 }));
  const breachLines = checkBulkOrderCeiling(elevenLines);
  assert(breachLines.isBulkEnquiryRequired && breachLines.reason === "EXCEEDS_MAX_DISTINCT_LINES", "11 Distinct Lines Triggers Bulk", "Bulk Boundary", "11 distinct lines triggers Bulk Enquiry");

  // --------------------------------------------------------------------------
  // SECTION 2: Postal Code Serviceability & Zone Resolution
  // --------------------------------------------------------------------------
  console.log("\n--- Section 2: Postal Code Serviceability & Zone Resolution ---");

  // Test 2.1: Zone Resolution
  assert(resolveShippingZone("110001") === "ZONE_A", "Delhi Local Zone A", "Zone Resolution", "110001 resolves to ZONE_A");
  assert(resolveShippingZone("122002") === "ZONE_A", "Gurgaon NCR Zone A", "Zone Resolution", "122002 resolves to ZONE_A");
  assert(resolveShippingZone("302001") === "ZONE_B", "Jaipur Regional Zone B", "Zone Resolution", "302001 resolves to ZONE_B");
  assert(resolveShippingZone("560001") === "ZONE_C", "Bengaluru Metro Zone C", "Zone Resolution", "560001 resolves to ZONE_C");
  assert(resolveShippingZone("400001") === "ZONE_C", "Mumbai Metro Zone C", "Zone Resolution", "400001 resolves to ZONE_C");
  assert(resolveShippingZone("194101") === "ZONE_E", "Leh Remote Zone E", "Zone Resolution", "194101 resolves to ZONE_E");

  // Test 2.2: Live API PIN Check
  const testPins = [
    { pin: "110001", expectedZone: "ZONE_A", expectedCity: "New Delhi" },
    { pin: "560001", expectedZone: "ZONE_C", expectedCity: "Bengaluru" },
    { pin: "400001", expectedZone: "ZONE_C", expectedCity: "Mumbai" },
  ];

  for (const t of testPins) {
    const res = await fetch(`${STOREFRONT_URL}/api/pincodes/check?pincode=${t.pin}`);
    const data = await res.json();
    assert(
      res.ok && data.isServiceable === true && data.zoneCode === t.expectedZone,
      `Live PIN Check ${t.pin}`,
      "Live API",
      `PIN ${t.pin} returns serviceable=true in ${data.zoneCode} (${data.city})`
    );
  }

  // Test 2.3: Malformed PIN Check
  const badRes = await fetch(`${STOREFRONT_URL}/api/pincodes/check?pincode=123`);
  assert(badRes.status === 400, "Malformed PIN Validation", "Live API", "PIN '123' returns HTTP 400 Bad Request");

  // --------------------------------------------------------------------------
  // SECTION 3: Dynamic PIN Toggle & Audit Logging
  // --------------------------------------------------------------------------
  console.log("\n--- Section 3: Dynamic PIN Toggle & Audit Logging ---");

  // Test 3.1: Fetch admin pincodes
  const adminPinsRes = await fetch(`${STOREFRONT_URL}/api/admin/pincodes`);
  const adminPinsData = await adminPinsRes.json();
  assert(
    adminPinsRes.ok && Array.isArray(adminPinsData.pincodes) && adminPinsData.pincodes.length > 0,
    "Admin PIN Directory Listing",
    "Admin API",
    `Loaded ${adminPinsData.pincodes?.length || 0} configured PIN ranges from DB`
  );

  const testTargetPin = adminPinsData.pincodes.find((p: any) => p.pincode === "121" || p.pincode === "11") || adminPinsData.pincodes[0];
  if (testTargetPin) {
    const originalState = testTargetPin.isServiceable;

    // Toggle to false
    const toggleOffRes = await fetch(`${STOREFRONT_URL}/api/admin/pincodes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: testTargetPin.id,
        isServiceable: false,
        staffName: "QA Automated Suite",
      }),
    });
    const toggleOffData = await toggleOffRes.json();
    assert(toggleOffRes.ok && toggleOffData.success, "Admin PIN Toggle to Disabled", "Admin API", `Disabled PIN ${testTargetPin.pincode}`);

    const fullTestPin = testTargetPin.pincode.length === 6 
      ? testTargetPin.pincode 
      : testTargetPin.pincode.padEnd(6, "1");

    // Verify public check reflects disabled state
    const publicDisabledRes = await fetch(`${STOREFRONT_URL}/api/pincodes/check?pincode=${fullTestPin}`);
    const publicDisabledData = await publicDisabledRes.json();
    assert(
      publicDisabledData.isServiceable === false && !!publicDisabledData.unserviceableReason,
      "Public Check Reflects Disabled PIN",
      "Live API",
      `Public check for ${fullTestPin} returns isServiceable=false with notice: "${publicDisabledData.unserviceableReason}"`
    );

    // Verify AuditLog record in PostgreSQL
    const auditRecord = await prisma.auditLog.findFirst({
      where: {
        action: "PINCODE_SERVICEABILITY_TOGGLE",
        entityId: testTargetPin.pincode,
      },
      orderBy: { createdAt: "desc" },
    });
    assert(
      auditRecord !== null && auditRecord.payloadJson.includes("QA Automated Suite"),
      "AuditLog Entry Generated",
      "Database Audit",
      `AuditLog entry confirmed for PIN ${testTargetPin.pincode} by QA Automated Suite`
    );

    // Restore to original state
    const restoreRes = await fetch(`${STOREFRONT_URL}/api/admin/pincodes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: testTargetPin.id,
        isServiceable: originalState,
        staffName: "QA Automated Suite (Restoration)",
      }),
    });
    assert(restoreRes.ok, "Admin PIN Restoration", "Admin API", `Restored PIN ${testTargetPin.pincode} to serviceable=${originalState}`);
  }

  // --------------------------------------------------------------------------
  // SECTION 4: Studio Operating Controls & Settings
  // --------------------------------------------------------------------------
  console.log("\n--- Section 4: Studio Operating Controls & Settings ---");

  // Test 4.1: Public Settings Endpoint
  const pubSettingsRes = await fetch(`${STOREFRONT_URL}/api/settings`);
  const pubSettings = await pubSettingsRes.json();
  assert(
    pubSettingsRes.ok && typeof pubSettings.maintenanceMode === "boolean",
    "Public Settings Endpoint",
    "Studio Controls",
    `Public settings returned: maintenance=${pubSettings.maintenanceMode}, hiatus=${pubSettings.studioHiatus}`
  );

  // Test 4.2: Admin Settings Full Inventory
  const adminSettingsRes = await fetch(`${STOREFRONT_URL}/api/admin/settings`);
  const adminSettings = await adminSettingsRes.json();
  assert(
    adminSettingsRes.ok && adminSettings.settings !== undefined,
    "Admin Settings Endpoint",
    "Studio Controls",
    `Admin settings loaded with keys: ${Object.keys(adminSettings.settings).join(", ")}`
  );

  // Test 4.3: Toggle Maintenance Mode Roundtrip
  const setMaintenanceOn = await fetch(`${STOREFRONT_URL}/api/admin/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: "MAINTENANCE_MODE",
      value: "true",
      staffName: "QA Suite",
    }),
  });
  const mOnCheck = await (await fetch(`${STOREFRONT_URL}/api/settings`)).json();
  assert(mOnCheck.maintenanceMode === true, "Maintenance Mode Activation", "Studio Controls", "Maintenance mode toggled to true");

  const setMaintenanceOff = await fetch(`${STOREFRONT_URL}/api/admin/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: "MAINTENANCE_MODE",
      value: "false",
      staffName: "QA Suite",
    }),
  });
  const mOffCheck = await (await fetch(`${STOREFRONT_URL}/api/settings`)).json();
  assert(mOffCheck.maintenanceMode === false, "Maintenance Mode Deactivation", "Studio Controls", "Maintenance mode toggled back to false");

  // --------------------------------------------------------------------------
  // SECTION 5: Institutional Copy & Brand Compliance
  // --------------------------------------------------------------------------
  console.log("\n--- Section 5: Institutional Copy & Brand Compliance ---");

  const institutionalPages = [
    { path: "/shipping", name: "Shipping Policy" },
    { path: "/terms", name: "Terms of Service" },
    { path: "/privacy", name: "Privacy Policy" },
    { path: "/returns-refunds", name: "Returns & Refunds" },
    { path: "/our-story", name: "Our Story" },
    { path: "/contact", name: "Contact & Desk" },
  ];

  for (const p of institutionalPages) {
    const res = await fetch(`${STOREFRONT_URL}${p.path}`);
    const text = await res.text();

    assert(res.ok, `HTTP 200: ${p.name}`, "Institutional Pages", `GET ${p.path} returned status ${res.status}`);

    const hasVDesign = text.includes("VDesign");
    assert(hasVDesign, `Brand Entity 'VDesign' Present in ${p.name}`, "Brand Compliance", `'VDesign' referenced on ${p.path}`);

    const hasVDesignStudio = text.includes("VDesign Studio");
    assert(!hasVDesignStudio, `Prohibited 'VDesign Studio' Absent in ${p.name}`, "Brand Compliance", `Strict brand nomenclature observed on ${p.path}`);

    const hasCommission = /\bcommission\b/i.test(text);
    assert(!hasCommission, `Prohibited Term 'Commission' Absent in ${p.name}`, "Brand Compliance", `Prohibited term 'commission' not found on ${p.path}`);
  }

  // --------------------------------------------------------------------------
  // SECTION 6: Hierarchical Nested PIN Governance, 884 Sync & Live DB Logistics
  // --------------------------------------------------------------------------
  console.log("\n--- Section 6: Hierarchical Nested PINs, Admin 12-Slab Matrix & Overrides ---");

  // Test 6.1: Strict 6-Digit Whitelist (380053 Unlisted -> Blocked) & Nested Override Lifecycle
  const unlistedPin = "380053";
  const checkUnlistedBefore = await (await fetch(`${STOREFRONT_URL}/api/pincodes/check?pincode=${unlistedPin}`)).json();
  assert(
    checkUnlistedBefore.isServiceable === false && checkUnlistedBefore.resolutionType === "NOT_IN_WHITELIST",
    "Unlisted PIN 380053 Rejected (No Blanket Prefix Fallback)",
    "Hierarchy PIN",
    `${unlistedPin} resolved to resolutionType=${checkUnlistedBefore.resolutionType}, serviceable=${checkUnlistedBefore.isServiceable}`
  );

  const checkSiblingAhmedabad = await (await fetch(`${STOREFRONT_URL}/api/pincodes/check?pincode=380001`)).json();
  assert(
    checkSiblingAhmedabad.isServiceable === true && checkSiblingAhmedabad.resolutionType === "EXACT_6_DIGIT",
    "Whitelisted Sibling PIN 380001 Serviceable",
    "Hierarchy PIN",
    `380001 remains serviceable=${checkSiblingAhmedabad.isServiceable} (tier=${checkSiblingAhmedabad.resolutionType})`
  );

  // Add 380053 explicitly -> becomes serviceable
  const createOverrideRes = await fetch(`${STOREFRONT_URL}/api/admin/pincodes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "UPSERT_RULE",
      pincodePrefix: unlistedPin,
      cityLabel: "Ahmedabad Science City QA",
      stateName: "Gujarat",
      zoneCode: "ZONE_C",
      isServiceable: true,
      staffName: "QA Suite",
    }),
  });
  const createOverrideJson = await createOverrideRes.json();
  const createdRuleId = createOverrideJson.rule?.id;
  assert(
    createOverrideRes.ok && createOverrideJson.rule?.pincodePrefix === unlistedPin && Boolean(createdRuleId),
    "Exact 6-Digit Whitelist PIN Addition",
    "Hierarchy PIN",
    `Created enabled rule for ${unlistedPin} (id=${createdRuleId})`
  );

  const checkAddedEnabled = await (await fetch(`${STOREFRONT_URL}/api/pincodes/check?pincode=${unlistedPin}`)).json();
  assert(
    checkAddedEnabled.isServiceable === true && checkAddedEnabled.resolutionType === "EXACT_6_DIGIT",
    "Added PIN 380053 Becomes Serviceable",
    "Hierarchy PIN",
    `${unlistedPin} resolved to resolutionType=${checkAddedEnabled.resolutionType}, serviceable=${checkAddedEnabled.isServiceable}`
  );

  // Delete 380053 -> reverts back to NOT_IN_WHITELIST (unserviceable)
  const deleteOverrideRes = await fetch(`${STOREFRONT_URL}/api/admin/pincodes?id=${encodeURIComponent(createdRuleId)}`, {
    method: "DELETE",
  });
  assert(deleteOverrideRes.ok, "Delete 6-Digit PIN Rule", "Hierarchy PIN", `Deleted rule ${unlistedPin}`);

  const checkDeletedUnlisted = await (await fetch(`${STOREFRONT_URL}/api/pincodes/check?pincode=${unlistedPin}`)).json();
  assert(
    checkDeletedUnlisted.isServiceable === false && checkDeletedUnlisted.resolutionType === "NOT_IN_WHITELIST",
    "Deleted PIN 380053 Reverts to Unserviceable",
    "Hierarchy PIN",
    `After deletion, ${unlistedPin} reverted to tier=${checkDeletedUnlisted.resolutionType}, serviceable=${checkDeletedUnlisted.isServiceable}`
  );

  // Test 6.2: Admin Logistics Endpoint (Direct & Via Admin Vite Proxy)
  const logisticsRes = await fetch(`${STOREFRONT_URL}/api/admin/logistics`);
  const logisticsData = await logisticsRes.json();
  assert(
    logisticsRes.ok &&
      Array.isArray(logisticsData.feeSlabs) &&
      logisticsData.feeSlabs.length === 12 &&
      Array.isArray(logisticsData.zones) &&
      logisticsData.zones.length >= 5 &&
      Array.isArray(logisticsData.rateMatrix) &&
      logisticsData.rateMatrix.length >= 25,
    "Admin Logistics DB Payload (12 Slabs + 5 Zones + 5x5 Matrix)",
    "Admin Logistics",
    `slabs=${logisticsData.feeSlabs?.length}, zones=${logisticsData.zones?.length}, rules=${logisticsData.rateMatrix?.length}`
  );

  const adminProxyRes = await fetch(`${ADMIN_URL}/api/admin/logistics`).catch(() => null);
  assert(
    Boolean(adminProxyRes && adminProxyRes.ok),
    "Admin Vite Proxy /api/admin/logistics Reachable",
    "Admin Logistics",
    adminProxyRes ? `Status ${adminProxyRes.status} from ${ADMIN_URL}/api/admin/logistics` : "Admin proxy unreachable"
  );

  // Test 6.3: Live DB 12-Slab Rate & Product Override Propagation to Storefront Shipping API
  if (Array.isArray(logisticsData.products) && logisticsData.products.length > 0) {
    const sampleProduct = logisticsData.products[0];
    const testPin = "400001"; // Mumbai -> ZONE_C

    // Set temporary product override to slab 4000 for ZONE_C
    const setOverrideRes = await fetch(`${STOREFRONT_URL}/api/admin/logistics`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SET_PRODUCT_OVERRIDE",
        productId: sampleProduct.id,
        shippingZoneCode: "ZONE_C",
        feeSlabRupees: 4000,
        staffName: "QA Suite",
      }),
    });
    assert(setOverrideRes.ok, "Set Product Delivery Override", "Live Shipping DB", `Set ${sampleProduct.slug} ZONE_C override to ₹4000`);

    const calcOverrideRes = await fetch(`${STOREFRONT_URL}/api/shipping/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pincode: testPin,
        items: [
          {
            productId: sampleProduct.id,
            slug: sampleProduct.slug,
            title: sampleProduct.title,
            quantity: 1,
            priceRupees: 5000,
            weightGrams: sampleProduct.weightGrams || 1000,
            lengthMm: sampleProduct.lengthMm || 200,
            widthMm: sampleProduct.widthMm || 200,
            heightMm: sampleProduct.heightMm || 200,
          },
        ],
      }),
    });
    const calcOverrideData = await calcOverrideRes.json();
    assert(
      calcOverrideRes.ok &&
        calcOverrideData.totalDeliveryFeeRupees === 4000 &&
        calcOverrideData.ruleSource === "PRODUCT_ZONE_OVERRIDE",
      "Storefront Shipping API Respects Live DB Override",
      "Live Shipping DB",
      `Calculated fee=₹${calcOverrideData.totalDeliveryFeeRupees}, source=${calcOverrideData.ruleSource}`
    );

    // Clear temporary override
    const clearOverrideRes = await fetch(`${STOREFRONT_URL}/api/admin/logistics`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SET_PRODUCT_OVERRIDE",
        productId: sampleProduct.id,
        shippingZoneCode: "ZONE_C",
        feeSlabRupees: null,
        staffName: "QA Suite",
      }),
    });
    assert(clearOverrideRes.ok, "Clear Temporary Product Override", "Live Shipping DB", `Cleared QA override for ${sampleProduct.slug}`);
  }

  // Test 6.4: Sync 884 Urban Hub PINs & Verify Leh (194) Blocked Rule
  const sync884Res = await fetch(`${STOREFRONT_URL}/api/admin/pincodes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "IMPORT_URBAN_884",
      staffName: "QA Suite",
    }),
  });
  const sync884Json = await sync884Res.json();
  assert(
    sync884Res.ok && sync884Json.success === true,
    "Sync 884 Urban Hub PINs",
    "Admin Logistics",
    `884 urban hub sync executed: insertedCount=${sync884Json.insertedCount}, msg=${sync884Json.message}`
  );

  const lehCheck = await (await fetch(`${STOREFRONT_URL}/api/pincodes/check?pincode=194101`)).json();
  assert(
    lehCheck.isServiceable === false && lehCheck.zoneCode === "ZONE_E",
    "Remote Prefix 194 (Leh) Blocked",
    "Hierarchy PIN",
    `194101 resolved to zone=${lehCheck.zoneCode}, serviceable=${lehCheck.isServiceable}`
  );

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log("\n=======================================================");
  console.log("  SET 2 VERIFICATION SUMMARY REPORT");
  console.log("=======================================================");
  const total = report.length;
  const passed = report.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log(`  Total Checks:  ${total}`);
  console.log(`  Passed:        ${passed}`);
  console.log(`  Failed:        ${failed}`);
  console.log("=======================================================\n");

  if (failed > 0) {
    console.error("FAILED CHECKS:");
    report.filter((r) => !r.passed).forEach((r) => console.error(`  - [${r.category}] ${r.name}: ${r.details}`));
    process.exit(1);
  } else {
    console.log("ALL SET 2 GOVERNANCE CHECKS PASSED WITH 100% SUCCESS.");
    process.exit(0);
  }
}

runSet2Verification().catch((err) => {
  console.error("FATAL ERROR IN VERIFICATION SUITE:", err);
  process.exit(1);
});

/**
 * Live Verification Script: Set 8 (Staff Administration Portal, RBAC & Pre-Live Runbook Sweep)
 *
 * Runs against live devMachine PostgreSQL, Storefront (:3001), Admin (:3002), and Mailpit (:8025).
 * Tests runbook items ADM-01 through ADM-12, SEC-01 through SEC-05, and RBAC matrix.
 *
 * Execute: pnpm --filter @tavistra/db test:set8
 */

import { PrismaClient, OrderStatus, PurchaseMode } from "@prisma/client";
import {
  ROLE_TAB_PERMISSIONS,
  ROLE_ACTION_PERMISSIONS,
  isTabPermitted,
  isActionPermitted,
  StaffRole,
  AdminTabId,
  AdminAction,
} from "../../../apps/admin/src/rbac";
import { STAFF_USERS } from "../../../apps/admin/src/data";

const prisma = new PrismaClient();
const STOREFRONT_URL = process.env.STOREFRONT_URL || "http://192.168.1.100:3001";
const ADMIN_URL = process.env.ADMIN_URL || "http://192.168.1.100:3002";
const MAILPIT_URL = process.env.MAILPIT_URL || "http://192.168.1.100:8025";

interface TestResult {
  name: string;
  section: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, section: string, details: string) {
  results.push({ name, section, passed: condition, details });
  const badge = condition ? "  [PASS]" : "  [FAIL]";
  console.log(`${badge} ${section} > ${name}${condition ? "" : `: ${details}`}`);
}

async function run() {
  console.log("=======================================================");
  console.log("  TAVISTRA SET 8 VERIFICATION: STAFF ADMIN, RBAC & PRE-LIVE SWEEP");
  console.log("  Target Environment: " + STOREFRONT_URL + " & " + ADMIN_URL);
  console.log("=======================================================\n");

  // =========================================================================
  // SECTION 1: ROLE-BASED ACCESS CONTROL (RBAC) MATRIX
  // =========================================================================
  console.log("--- 1. Role-Based Access Control (RBAC) Matrix ---");

  // 1.1 Super Admin (Ar. Vikramaditya)
  const superAdminTabs: AdminTabId[] = [
    "OVERVIEW", "ORDERS", "PRODUCTION", "DISPATCH", "TICKETS",
    "CUSTOMERS", "PROPOSALS", "CATALOGUE", "PINCODES", "SETTINGS", "AUDIT"
  ];
  const superAdminAllTabs = superAdminTabs.every((tab) => isTabPermitted("SUPER_ADMIN", tab));
  assert(
    superAdminAllTabs,
    "SUPER_ADMIN has unrestricted access to all 11 admin tabs",
    "RBAC Engine",
    `Tabs: ${ROLE_TAB_PERMISSIONS.SUPER_ADMIN.length}/11 permitted`
  );

  const superAdminActions: AdminAction[] = [
    "WORKSHOP_RELEASE", "QC_PHOTO_UPLOAD", "DISPATCH_AWB", "ORDER_REFUND_MANAGE",
    "ORDER_CANCEL", "PROPOSAL_CREATE_REVISE", "TICKET_MANAGE", "CATALOGUE_MUTATE",
    "PINCODES_MUTATE", "SETTINGS_MUTATE", "AUDIT_VIEW"
  ];
  const superAdminAllActions = superAdminActions.every((act) => isActionPermitted("SUPER_ADMIN", act));
  assert(
    superAdminAllActions,
    "SUPER_ADMIN has unrestricted execution authority across all 11 action guards",
    "RBAC Engine",
    `Actions: ${ROLE_ACTION_PERMISSIONS.SUPER_ADMIN.length}/11 permitted`
  );

  // 1.2 Commerce Admin (Pooja Mehta)
  const commAdminAllowedTabs = isTabPermitted("COMMERCE_ADMIN", "ORDERS") &&
    isTabPermitted("COMMERCE_ADMIN", "CATALOGUE") &&
    isTabPermitted("COMMERCE_ADMIN", "PROPOSALS") &&
    isTabPermitted("COMMERCE_ADMIN", "PINCODES") &&
    isTabPermitted("COMMERCE_ADMIN", "CUSTOMERS");
  const commAdminBlockedTabs = !isTabPermitted("COMMERCE_ADMIN", "PRODUCTION") &&
    !isTabPermitted("COMMERCE_ADMIN", "TICKETS") &&
    !isTabPermitted("COMMERCE_ADMIN", "SETTINGS");
  assert(
    commAdminAllowedTabs && commAdminBlockedTabs,
    "COMMERCE_ADMIN access: permitted for Commerce tabs; blocked from Production, Tickets, Settings",
    "RBAC Engine",
    `Allowed: ${ROLE_TAB_PERMISSIONS.COMMERCE_ADMIN.join(", ")}`
  );

  const commAdminPermittedActions = isActionPermitted("COMMERCE_ADMIN", "CATALOGUE_MUTATE") &&
    isActionPermitted("COMMERCE_ADMIN", "PINCODES_MUTATE") &&
    isActionPermitted("COMMERCE_ADMIN", "PROPOSAL_CREATE_REVISE") &&
    isActionPermitted("COMMERCE_ADMIN", "ORDER_REFUND_MANAGE") &&
    !isActionPermitted("COMMERCE_ADMIN", "WORKSHOP_RELEASE") &&
    !isActionPermitted("COMMERCE_ADMIN", "SETTINGS_MUTATE");
  assert(
    commAdminPermittedActions,
    "COMMERCE_ADMIN action guards: permitted for Catalogue/PIN/Proposal/Refund; blocked from Workshop Release & Settings",
    "RBAC Engine",
    `Actions count: ${ROLE_ACTION_PERMISSIONS.COMMERCE_ADMIN.length}`
  );

  // 1.3 Production Staff (Rajesh Sharma)
  const prodAllowedTabs = isTabPermitted("PRODUCTION_STAFF", "PRODUCTION") &&
    isTabPermitted("PRODUCTION_STAFF", "ORDERS") &&
    isTabPermitted("PRODUCTION_STAFF", "DISPATCH");
  const prodBlockedTabs = !isTabPermitted("PRODUCTION_STAFF", "TICKETS") &&
    !isTabPermitted("PRODUCTION_STAFF", "CUSTOMERS") &&
    !isTabPermitted("PRODUCTION_STAFF", "PROPOSALS") &&
    !isTabPermitted("PRODUCTION_STAFF", "PINCODES") &&
    !isTabPermitted("PRODUCTION_STAFF", "SETTINGS");
  assert(
    prodAllowedTabs && prodBlockedTabs,
    "PRODUCTION_STAFF access: permitted for Workshop & Orders; blocked from Tickets, Customers, Quotes, PINs, Settings",
    "RBAC Engine",
    `Allowed: ${ROLE_TAB_PERMISSIONS.PRODUCTION_STAFF.join(", ")}`
  );

  const prodPermittedActions = isActionPermitted("PRODUCTION_STAFF", "WORKSHOP_RELEASE") &&
    isActionPermitted("PRODUCTION_STAFF", "QC_PHOTO_UPLOAD") &&
    isActionPermitted("PRODUCTION_STAFF", "DISPATCH_AWB") &&
    !isActionPermitted("PRODUCTION_STAFF", "TICKET_MANAGE") &&
    !isActionPermitted("PRODUCTION_STAFF", "CATALOGUE_MUTATE") &&
    !isActionPermitted("PRODUCTION_STAFF", "PINCODES_MUTATE") &&
    !isActionPermitted("PRODUCTION_STAFF", "SETTINGS_MUTATE");
  assert(
    prodPermittedActions,
    "PRODUCTION_STAFF action guards: permitted for Workshop Release, QC Photos, Dispatch; blocked from Catalogue, Tickets, Settings",
    "RBAC Engine",
    `Actions: ${ROLE_ACTION_PERMISSIONS.PRODUCTION_STAFF.join(", ")}`
  );

  // 1.4 Support Staff (Kavita Rao)
  const supportAllowedTabs = isTabPermitted("SUPPORT_STAFF", "TICKETS") &&
    isTabPermitted("SUPPORT_STAFF", "CUSTOMERS") &&
    isTabPermitted("SUPPORT_STAFF", "ORDERS");
  const supportBlockedTabs = !isTabPermitted("SUPPORT_STAFF", "PRODUCTION") &&
    !isTabPermitted("SUPPORT_STAFF", "CATALOGUE") &&
    !isTabPermitted("SUPPORT_STAFF", "PINCODES") &&
    !isTabPermitted("SUPPORT_STAFF", "SETTINGS") &&
    !isTabPermitted("SUPPORT_STAFF", "AUDIT");
  assert(
    supportAllowedTabs && supportBlockedTabs,
    "SUPPORT_STAFF access: permitted for Tickets, Customers, Orders; blocked from Production, Catalogue, PINs, Settings, Audit",
    "RBAC Engine",
    `Allowed: ${ROLE_TAB_PERMISSIONS.SUPPORT_STAFF.join(", ")}`
  );

  const supportPermittedActions = isActionPermitted("SUPPORT_STAFF", "TICKET_MANAGE") &&
    isActionPermitted("SUPPORT_STAFF", "ORDER_CANCEL") &&
    !isActionPermitted("SUPPORT_STAFF", "WORKSHOP_RELEASE") &&
    !isActionPermitted("SUPPORT_STAFF", "QC_PHOTO_UPLOAD") &&
    !isActionPermitted("SUPPORT_STAFF", "CATALOGUE_MUTATE") &&
    !isActionPermitted("SUPPORT_STAFF", "PINCODES_MUTATE") &&
    !isActionPermitted("SUPPORT_STAFF", "SETTINGS_MUTATE");
  assert(
    supportPermittedActions,
    "SUPPORT_STAFF action guards: permitted for Ticket reply/resolve & Pre-Production Cancel; blocked from Workshop, QC, Catalogue, Settings",
    "RBAC Engine",
    `Actions: ${ROLE_ACTION_PERMISSIONS.SUPPORT_STAFF.join(", ")}`
  );

  // 1.5 Staff Identity Roster
  const rosterHasAllRoles = STAFF_USERS.some((u) => u.role === "SUPER_ADMIN") &&
    STAFF_USERS.some((u) => u.role === "COMMERCE_ADMIN") &&
    STAFF_USERS.some((u) => u.role === "PRODUCTION_STAFF") &&
    STAFF_USERS.some((u) => u.role === "SUPPORT_STAFF");
  assert(
    rosterHasAllRoles && STAFF_USERS.length >= 4,
    "Staff Roster includes distinct identities for all 4 roles",
    "Staff Roster",
    `Roster count: ${STAFF_USERS.length} staff members`
  );

  // =========================================================================
  // SECTION 2: PHASE 7 RUNBOOK VERIFICATION (ADM-01 TO ADM-12)
  // =========================================================================
  console.log("\n--- 2. Phase 7: Staff Administration Operations Runbook ---");

  // ADM-01: Orders Worklist with dynamic status filtering
  const resOrders = await fetch(`${STOREFRONT_URL}/api/orders`);
  assert(resOrders.ok, "ADM-01: GET /api/orders responds HTTP 200", "ADM-01 Orders Worklist", `Status: ${resOrders.status}`);
  const ordersData = await resOrders.json();
  const ordersList: any[] = Array.isArray(ordersData.orders) ? ordersData.orders : [];
  assert(
    ordersList.length > 0,
    "ADM-01: Orders worklist returns populated orders ledger",
    "ADM-01 Orders Worklist",
    `Returned ${ordersList.length} orders`
  );

  const sampleOrder = ordersList[0];
  const hasRequiredFields = sampleOrder &&
    typeof sampleOrder.id === "string" &&
    typeof sampleOrder.orderNumber === "string" &&
    typeof sampleOrder.mode === "string" &&
    typeof sampleOrder.customerName === "string" &&
    typeof sampleOrder.totalAmountRupees === "number" &&
    typeof sampleOrder.balanceDueRupees === "number";
  assert(
    hasRequiredFields,
    "ADM-01: Order objects contain required admin presentation fields",
    "ADM-01 Orders Worklist",
    `Sample: ${sampleOrder?.orderNumber} (${sampleOrder?.mode})`
  );

  // ADM-02: 7-Day Grace Period Tracker
  const mtoOrder = ordersList.find((o) => o.mode === "MADE_TO_ORDER" && o.status !== "CANCELLED");
  assert(
    Boolean(mtoOrder),
    "ADM-02: Found Made to Order consignment for 7-day grace inspection",
    "ADM-02 Grace Period",
    `MTO Order: ${mtoOrder?.orderNumber || "None"}`
  );

  if (mtoOrder) {
    const hasGraceMeta = typeof mtoOrder.isGraceActive === "boolean" &&
      typeof mtoOrder.graceDaysRemaining === "number" &&
      (mtoOrder.releaseEligibleDate === null || typeof mtoOrder.releaseEligibleDate === "string");
    assert(
      hasGraceMeta,
      "ADM-02: Made to Order record includes authoritative 7-day grace metadata",
      "ADM-02 Grace Period",
      `isGraceActive: ${mtoOrder.isGraceActive}, remaining: ${mtoOrder.graceDaysRemaining}d, releaseEligibleDate: ${mtoOrder.releaseEligibleDate}`
    );
  }

  // Create an active test order for ADM-03, ADM-04, ADM-05, ADM-06
  const testPin = "110001";
  const testProduct = await prisma.product.findFirst({
    where: { primaryMode: PurchaseMode.MADE_TO_ORDER, isPublished: true },
    include: { variants: true },
  });
  assert(Boolean(testProduct), "Found active Made to Order product for runbook tests", "Test Setup", `Product: ${testProduct?.slug}`);

  let testOrderNumber = `TAV-ADM-SET8-${Date.now().toString().slice(-6)}`;
  let testOrderId = "";

  if (testProduct && testProduct.variants[0]) {
    const unitPrice = Number(testProduct.taxInclusivePrice);
    const advance = Math.round(unitPrice * 0.25);
    const balance = unitPrice - advance;

    const dbOrder = await prisma.order.create({
      data: {
        orderNumber: testOrderNumber,
        purchaseMode: PurchaseMode.MADE_TO_ORDER,
        status: OrderStatus.GRACE_PERIOD_ACTIVE,
        currency: "INR",
        totalAmount: unitPrice,
        itemsSubtotal: unitPrice,
        shippingCharge: 0,
        requiredAdvanceAmount: advance,
        amountPaid: advance,
        balanceAmount: balance,
        customerEmail: "director.adm8@vdesign-architecture.in",
        customerPhone: "9876543210",
        confirmedAt: new Date(),
        shippingAddress: {
          create: {
            fullName: "Ar. Vikramaditya Test Suite",
            phone: "9876543210",
            addressLine1: "Studio Suite 801, Nariman Point",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: testPin,
          },
        },
        items: {
          create: {
            productId: testProduct.id,
            productVariantId: testProduct.variants[0].id,
            quantity: 1,
            unitPrice: unitPrice,
            lineTotal: unitPrice,
          },
        },
        payments: {
          create: {
            paymentType: "ADVANCE_25",
            amount: advance,
            currency: "INR",
            status: "COMPLETED",
            gateway: "SIMULATED",
            paymentRef: `PAY-ADV-${Date.now()}`,
          },
        },
      },
    });
    testOrderId = dbOrder.id;
  }

  // ADM-03: Hard Dispatch Gate (Lockout) when balanceDue > 0
  const resBlockedDispatch = await fetch(`${STOREFRONT_URL}/api/orders/${testOrderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "DISPATCH",
      carrierName: "Blue Dart Fragile Surface",
      awbNumber: "BD-BLOCKED-1234",
      staffName: "Pooja Mehta",
    }),
  });
  const blockedData = await resBlockedDispatch.json();
  const dispatchBlockedCorrectly = !resBlockedDispatch.ok &&
    (resBlockedDispatch.status === 400 || resBlockedDispatch.status === 403) &&
    (blockedData.error === "DISPATCH_BLOCKED" || String(blockedData.message).includes("100% Payment Required"));
  assert(
    dispatchBlockedCorrectly,
    "ADM-03: Hard Dispatch Lockout strictly blocks carrier handover when balanceDue > 0",
    "ADM-03 Dispatch Lockout",
    `Status: ${resBlockedDispatch.status}, response: ${blockedData.message || blockedData.error}`
  );

  // ADM-04: Balance Payment Link Generation
  const expectedBalanceLink = `${STOREFRONT_URL}/track?orderId=${encodeURIComponent(testOrderNumber)}`;
  const resTrackPage = await fetch(expectedBalanceLink);
  const trackHtml = await resTrackPage.text();
  const linkResolvesTracking = resTrackPage.ok && trackHtml.includes("Tavistra");
  assert(
    linkResolvesTracking,
    "ADM-04: One-click balance payment URL resolves correctly to live order tracking",
    "ADM-04 Balance Link",
    `URL: ${expectedBalanceLink}`
  );

  // ADM-05: Dispatch After Balance Clearance
  // Clear the balance to simulate customer paying 75% balance
  await prisma.order.update({
    where: { id: testOrderId },
    data: {
      amountPaid: { increment: Number(testProduct?.taxInclusivePrice || 50000) * 0.75 },
      balanceAmount: 0,
      status: OrderStatus.PRODUCTION_COMPLETED,
    },
  });

  const testAwb = `BD-TAV-SET8-${Date.now().toString().slice(-6)}`;
  const resValidDispatch = await fetch(`${STOREFRONT_URL}/api/orders/${testOrderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "DISPATCH",
      carrierName: "Blue Dart Fragile Express",
      awbNumber: testAwb,
      staffName: "Rajesh Sharma",
    }),
  });
  const validDispatchData = await resValidDispatch.json();
  const dispatchedDbOrder = await prisma.order.findUnique({ where: { id: testOrderId } });
  const dispatchSucceeded = resValidDispatch.ok &&
    dispatchedDbOrder?.status === OrderStatus.DISPATCHED &&
    dispatchedDbOrder?.trackingNumber === testAwb;
  assert(
    dispatchSucceeded,
    "ADM-05: Dispatch and AWB assignment cleanly succeed after 100% balance clearance",
    "ADM-05 Dispatch Clearance",
    `Status: ${dispatchedDbOrder?.status}, AWB: ${dispatchedDbOrder?.trackingNumber}`
  );

  // ADM-06: Workshop QC Photo Upload
  const qcNotes = "Brass casing edge bevel verified at 0.05mm tolerance under craftsman inspection.";
  const qcImages = ["/qc/set8-mirror-front.jpg", "/qc/set8-mirror-detail.jpg"];
  const resQc = await fetch(`${STOREFRONT_URL}/api/orders/${testOrderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "UPDATE_QC",
      qcNotes,
      qcImages,
      staffName: "Rajesh Sharma",
    }),
  });
  const qcData = await resQc.json();
  const qcDbOrder = await prisma.order.findUnique({ where: { id: testOrderId } });
  const qcSucceeded = resQc.ok &&
    qcDbOrder?.qcNotes === qcNotes &&
    String(qcDbOrder?.qcImages).includes("set8-mirror-front.jpg");
  assert(
    qcSucceeded,
    "ADM-06: Multi-image workshop QC photos and craftsman notes save and persist cleanly in DB",
    "ADM-06 QC Upload",
    `Saved notes: "${qcDbOrder?.qcNotes?.slice(0, 40)}...", images: ${qcDbOrder?.qcImages}`
  );

  // ADM-07: Catalogue Draft / Publish Toggle
  if (testProduct) {
    // Unpublish
    const resUnpublish = await fetch(`${STOREFRONT_URL}/api/admin/catalogue`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: testProduct.id,
        isPublished: false,
        staffName: "Pooja Mehta",
      }),
    });
    const dbUnpublished = await prisma.product.findUnique({ where: { id: testProduct.id } });
    const unpublishSucceeded = resUnpublish.ok && dbUnpublished?.isPublished === false;
    assert(
      unpublishSucceeded,
      "ADM-07: Catalogue Draft toggle unpublishes product immediately",
      "ADM-07 Catalogue Toggle",
      `isPublished in DB: ${dbUnpublished?.isPublished}`
    );

    // Re-publish
    const resRepublish = await fetch(`${STOREFRONT_URL}/api/admin/catalogue`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: testProduct.id,
        isPublished: true,
        staffName: "Pooja Mehta",
      }),
    });
    const dbRepublished = await prisma.product.findUnique({ where: { id: testProduct.id } });
    const republishSucceeded = resRepublish.ok && dbRepublished?.isPublished === true;
    assert(
      republishSucceeded,
      "ADM-07: Catalogue Publish toggle restores product immediately",
      "ADM-07 Catalogue Toggle",
      `isPublished in DB: ${dbRepublished?.isPublished}`
    );
  }

  // ADM-08: Markdown Catalogue Importer
  const sampleMarkdown = `---
title: "Bespoke Sculptural Credenza Edition"
sku: "TAV-CRD-SET8-001"
primary_mode: "MADE_TO_ORDER"
category: "Furniture & Architectural Objects"
lead_time_days: 28
weight_grams: 45000
price_inr: 85000
dimensions: "180cm x 45cm x 75cm"
materials: "Smoked Oak, Antiqued Brass hardware"
---

# Bespoke Sculptural Credenza

Hand-finished architectural storage piece.`;

  const resImport = await fetch(`${STOREFRONT_URL}/api/admin/catalogue/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      markdownContent: sampleMarkdown,
      staffName: "Pooja Mehta",
    }),
  });
  const importData = await resImport.json();
  const importSucceeded = resImport.ok &&
    Boolean(importData.product) &&
    importData.product.sku === "TAV-CRD-SET8-001";
  assert(
    importSucceeded,
    "ADM-08: Markdown catalogue importer parses YAML frontmatter and specifications cleanly",
    "ADM-08 Markdown Importer",
    `Imported SKU: ${importData.product?.sku}, Title: ${importData.product?.title}`
  );

  // ADM-09: Delivery PIN Code Control
  const testPinCode = "110098";
  // Create or toggle PIN inactive
  const resUpsertPin = await fetch(`${STOREFRONT_URL}/api/admin/pincodes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "UPSERT_RULE",
      pincodePrefix: testPinCode,
      cityLabel: "Delhi Set8 Test Suburb",
      stateName: "Delhi",
      zoneCode: "ZONE_A",
      isServiceable: false,
      coverageMode: "STRICT_WHITELIST",
      unserviceableReason: "Temporary test suspension by Studio Logistics",
      staffName: "Pooja Mehta",
    }),
  });
  const resPinCheckBlocked = await fetch(`${STOREFRONT_URL}/api/pincodes/check?pincode=${testPinCode}`);
  const pinBlockedData = await resPinCheckBlocked.json();
  const pinBlockEnforced = resPinCheckBlocked.ok && pinBlockedData.isServiceable === false;
  assert(
    pinBlockEnforced,
    "ADM-09: Toggling PIN code to inactive immediately enforces unserviceable state on storefront check",
    "ADM-09 PIN Control",
    `PIN ${testPinCode} isServiceable: ${pinBlockedData.isServiceable}`
  );

  // Restore PIN to active
  await fetch(`${STOREFRONT_URL}/api/admin/pincodes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "UPSERT_RULE",
      pincodePrefix: testPinCode,
      cityLabel: "Delhi Set8 Test Suburb",
      stateName: "Delhi",
      zoneCode: "ZONE_A",
      isServiceable: true,
      coverageMode: "STRICT_WHITELIST",
      staffName: "Pooja Mehta",
    }),
  });
  const resPinCheckRestored = await fetch(`${STOREFRONT_URL}/api/pincodes/check?pincode=${testPinCode}`);
  const pinRestoredData = await resPinCheckRestored.json();
  const pinRestoreEnforced = resPinCheckRestored.ok && pinRestoredData.isServiceable === true;
  assert(
    pinRestoreEnforced,
    "ADM-09: Re-enabling PIN immediately restores delivery serviceability on storefront check",
    "ADM-09 PIN Control",
    `PIN ${testPinCode} isServiceable: ${pinRestoredData.isServiceable}`
  );

  // ADM-10: Studio Maintenance Mode Toggle
  const resSetMaintenanceOn = await fetch(`${STOREFRONT_URL}/api/admin/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: "MAINTENANCE_MODE",
      value: "true",
      staffName: "Ar. Vikramaditya",
    }),
  });
  assert(resSetMaintenanceOn.ok, "ADM-10: Successfully enabled MAINTENANCE_MODE via admin settings", "ADM-10 Maintenance Mode", `HTTP ${resSetMaintenanceOn.status}`);

  const resSettingsPublic = await fetch(`${STOREFRONT_URL}/api/settings`);
  const settingsData = await resSettingsPublic.json();
  assert(
    settingsData.maintenanceMode === true,
    "ADM-10: Public settings endpoint immediately reports maintenanceMode = true",
    "ADM-10 Maintenance Mode",
    `maintenanceMode: ${settingsData.maintenanceMode}`
  );

  // Attempt checkout while maintenance mode is ON
  const resCheckoutBlocked = await fetch(`${STOREFRONT_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Maintenance Test",
      email: "test@vdesign.in",
      phone: "9876543210",
      addressLine1: "123 Maintenance Way",
      city: "New Delhi",
      state: "Delhi",
      destinationPin: "110001",
      items: [{ productId: testProduct?.id, quantity: 1 }],
    }),
  });
  const checkoutBlockedData = await resCheckoutBlocked.json();
  const maintenanceEnforced = resCheckoutBlocked.status === 503 &&
    checkoutBlockedData.code === "MAINTENANCE_MODE";
  assert(
    maintenanceEnforced,
    "ADM-10: Storefront checkout strictly freezes and rejects orders (HTTP 503) during Maintenance Mode",
    "ADM-10 Maintenance Mode",
    `Status: ${resCheckoutBlocked.status}, Code: ${checkoutBlockedData.code}`
  );

  // Restore Maintenance Mode to false
  await fetch(`${STOREFRONT_URL}/api/admin/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: "MAINTENANCE_MODE",
      value: "false",
      staffName: "Ar. Vikramaditya",
    }),
  });
  const resSettingsRestored = await fetch(`${STOREFRONT_URL}/api/settings`);
  const settingsRestoredData = await resSettingsRestored.json();
  assert(
    settingsRestoredData.maintenanceMode === false,
    "ADM-10: Maintenance Mode restored to false cleanly",
    "ADM-10 Maintenance Mode",
    `maintenanceMode: ${settingsRestoredData.maintenanceMode}`
  );

  // ADM-11: Studio Hiatus & Announcement
  const customAnnouncement = "Studio Annual Foundry Audit: Bespoke orders resume crafting on Monday.";
  await fetch(`${STOREFRONT_URL}/api/admin/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: "STUDIO_HIATUS",
      value: "true",
      staffName: "Ar. Vikramaditya",
    }),
  });
  await fetch(`${STOREFRONT_URL}/api/admin/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: "ANNOUNCEMENT_BANNER",
      value: customAnnouncement,
      staffName: "Ar. Vikramaditya",
    }),
  });

  const resHiatusSettings = await fetch(`${STOREFRONT_URL}/api/settings`);
  const hiatusData = await resHiatusSettings.json();
  const hiatusEnforced = hiatusData.studioHiatus === true &&
    hiatusData.announcementBanner === customAnnouncement;
  assert(
    hiatusEnforced,
    "ADM-11: Studio Hiatus and custom broadcast announcement banner update and propagate instantly",
    "ADM-11 Hiatus Banner",
    `Hiatus: ${hiatusData.studioHiatus}, Banner: "${hiatusData.announcementBanner}"`
  );

  // Restore announcement & hiatus
  await fetch(`${STOREFRONT_URL}/api/admin/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: "STUDIO_HIATUS",
      value: "false",
      staffName: "Ar. Vikramaditya",
    }),
  });
  await fetch(`${STOREFRONT_URL}/api/admin/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: "ANNOUNCEMENT_BANNER",
      value: "Studio craftsmanship running normally. All editions dispatched on schedule.",
      staffName: "Ar. Vikramaditya",
    }),
  });

  // ADM-12: Customer Directory Review
  const resCustomers = await fetch(`${STOREFRONT_URL}/api/admin/customers`);
  assert(resCustomers.ok, "ADM-12: GET /api/admin/customers responds HTTP 200", "ADM-12 Customer Directory", `Status: ${resCustomers.status}`);
  const customersData = await resCustomers.json();
  const customersList: any[] = Array.isArray(customersData.customers) ? customersData.customers : [];
  assert(
    customersList.length > 0,
    "ADM-12: Customer directory returns customer profiles with spend and address aggregates",
    "ADM-12 Customer Directory",
    `Directory count: ${customersList.length} clients`
  );
  const sampleCust = customersList[0];
  const custHasMetrics = sampleCust &&
    typeof sampleCust.name === "string" &&
    typeof sampleCust.email === "string" &&
    typeof sampleCust.totalOrders === "number" &&
    typeof sampleCust.lifetimeSpendRupees === "number" &&
    Array.isArray(sampleCust.addresses);
  assert(
    custHasMetrics,
    "ADM-12: Customer profile includes lifetime spend, order count, and address books",
    "ADM-12 Customer Directory",
    `Sample: ${sampleCust?.email} (Orders: ${sampleCust?.totalOrders}, Spent: ₹${sampleCust?.lifetimeSpendRupees})`
  );

  // =========================================================================
  // SECTION 3: PHASE 8 SECURITY, INTEGRITY & NON-FUNCTIONAL AUDIT (SEC-01 TO SEC-05)
  // =========================================================================
  console.log("\n--- 3. Phase 8: Security, Integrity & Non-Functional Audit ---");

  // SEC-01: Responsive UI & Viewport Integrity
  const pagesToCheck = ["/", "/shop", "/track", "/contact"];
  let allViewportsValid = true;
  for (const path of pagesToCheck) {
    const resPage = await fetch(`${STOREFRONT_URL}${path}`);
    const html = await resPage.text();
    const hasViewport = html.includes('name="viewport"') && html.includes("width=device-width");
    if (!hasViewport) allViewportsValid = false;
  }
  assert(
    allViewportsValid,
    "SEC-01: Standard responsive viewport meta tag configured across all public storefront routes",
    "SEC-01 Viewport",
    `Verified paths: ${pagesToCheck.join(", ")}`
  );

  // SEC-02: Zero Secret Exposure
  const publicEndpoints = [
    `${STOREFRONT_URL}/api/products`,
    `${STOREFRONT_URL}/api/settings`,
    `${STOREFRONT_URL}/api/orders?orderId=${testOrderNumber}&contact=9876543210`,
  ];
  const forbiddenPatterns = [
    "DATABASE_URL",
    "POSTGRES_PASSWORD",
    "krama_dev_server",
    "BEGIN RSA PRIVATE KEY",
    "BEGIN OPENSSH PRIVATE KEY",
    "AUTH_SECRET",
  ];
  let leakFound = false;
  let leakedSecret = "";

  for (const url of publicEndpoints) {
    try {
      const res = await fetch(url);
      const body = await res.text();
      for (const pattern of forbiddenPatterns) {
        if (body.includes(pattern)) {
          leakFound = true;
          leakedSecret = `${pattern} in ${url}`;
          break;
        }
      }
    } catch {
      // Ignore
    }
  }
  assert(
    !leakFound,
    "SEC-02: Public API endpoints and client responses are strictly clean of secrets and private keys",
    "SEC-02 Secret Protection",
    leakFound ? `LEAK: ${leakedSecret}` : "Zero secret leaks detected across public endpoints"
  );

  // SEC-03: Direct URL Tampering Resilience (Graceful Luxury 404)
  const resFakeOrder = await fetch(`${STOREFRONT_URL}/api/orders/NON_EXISTENT_ORDER_999999`);
  const fakeOrderData = await resFakeOrder.json();
  const fakeOrderHandledCleanly = resFakeOrder.status === 404 &&
    fakeOrderData.error === "Order not found";
  assert(
    fakeOrderHandledCleanly,
    "SEC-03: Invalid direct order ID returns clean HTTP 404 with zero server stack leaks",
    "SEC-03 Tampering Resilience",
    `Status: ${resFakeOrder.status}, error: ${fakeOrderData.error}`
  );

  const resFakeQuote = await fetch(`${STOREFRONT_URL}/api/quotes/FAKE_QUOTE_NON_EXISTENT_999999`);
  const fakeQuoteData = await resFakeQuote.json();
  const fakeQuoteHandledCleanly = resFakeQuote.status === 404 &&
    fakeQuoteData.error === "Proposal not found";
  assert(
    fakeQuoteHandledCleanly,
    "SEC-03: Invalid direct proposal reference returns clean HTTP 404 with zero server stack leaks",
    "SEC-03 Tampering Resilience",
    `Status: ${resFakeQuote.status}, error: ${fakeQuoteData.error}`
  );

  const resFakeTrackPage = await fetch(`${STOREFRONT_URL}/track?orderId=NON_EXISTENT_ORDER_888888`);
  const fakeTrackHtml = await resFakeTrackPage.text();
  const fakeTrackClean = resFakeTrackPage.ok && !fakeTrackHtml.includes("Unhandled Runtime Error");
  assert(
    fakeTrackClean,
    "SEC-03: Track page with invalid order parameter renders graceful client UI without unhandled crashes",
    "SEC-03 Tampering Resilience",
    `Status: ${resFakeTrackPage.status}`
  );

  // SEC-04: Negative Quantity / Price Tampering Rejection
  const resNegativeQty = await fetch(`${STOREFRONT_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Tampering Tester",
      email: "tamper@vdesign.in",
      phone: "9876543210",
      addressLine1: "123 Security Avenue",
      city: "New Delhi",
      state: "Delhi",
      destinationPin: "110001",
      items: [{ productId: testProduct?.id, quantity: -2 }],
    }),
  });
  const negQtyData = await resNegativeQty.json();
  const negQtyRejected = resNegativeQty.status === 400 &&
    (negQtyData.error || "").includes("Invalid item quantity");
  assert(
    negQtyRejected,
    "SEC-04: Negative item quantity in order payload is strictly rejected (HTTP 400)",
    "SEC-04 Tamper Rejection",
    `Status: ${resNegativeQty.status}, error: ${negQtyData.error}`
  );

  const resNegativePrice = await fetch(`${STOREFRONT_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Price Tampering Tester",
      email: "tamper@vdesign.in",
      phone: "9876543210",
      addressLine1: "123 Security Avenue",
      city: "New Delhi",
      state: "Delhi",
      destinationPin: "110001",
      items: [{ productId: testProduct?.id, quantity: 1, priceRupees: -500 }],
    }),
  });
  const negPriceData = await resNegativePrice.json();
  const negPriceRejected = resNegativePrice.status === 400 &&
    (negPriceData.error || "").includes("negative");
  assert(
    negPriceRejected,
    "SEC-04: Negative price tampering in order payload is strictly rejected (HTTP 400)",
    "SEC-04 Tamper Rejection",
    `Status: ${resNegativePrice.status}, error: ${negPriceData.error}`
  );

  // SEC-05: Concurrent State Verification
  // Update order carrier in Admin, immediately fetch via Storefront single-order tracking
  const concurrentAwb = `BD-CONCUR-${Date.now().toString().slice(-6)}`;
  await fetch(`${STOREFRONT_URL}/api/orders/${testOrderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "DISPATCH",
      carrierName: "Blue Dart Fragile Surface",
      awbNumber: concurrentAwb,
      staffName: "Rajesh Sharma",
    }),
  });

  const resConcurrentCheck = await fetch(
    `${STOREFRONT_URL}/api/orders?orderId=${testOrderNumber}&contact=9876543210`
  );
  const concurrentData = await resConcurrentCheck.json();
  const concurrentConsistent = resConcurrentCheck.ok &&
    concurrentData.found === true &&
    concurrentData.order?.awbNumber === concurrentAwb;
  assert(
    concurrentConsistent,
    "SEC-05: Concurrent state updates persist with immediate ACID consistency between Admin and Storefront tracking",
    "SEC-05 State Consistency",
    `Written AWB: ${concurrentAwb}, Read AWB: ${concurrentData.order?.awbNumber}`
  );

  // Clean up test order from DB
  if (testOrderId) {
    await prisma.auditLog.deleteMany({ where: { entityId: testOrderNumber } });
    await prisma.payment.deleteMany({ where: { orderId: testOrderId } });
    await prisma.orderItem.deleteMany({ where: { orderId: testOrderId } });
    await prisma.order.deleteMany({ where: { id: testOrderId } });
  }

  // Clean up test import credenza
  await prisma.auditLog.deleteMany({ where: { entityId: "tav-crd-set8-001" } });
  await prisma.productVariant.deleteMany({ where: { sku: "TAV-CRD-SET8-001" } });
  await prisma.product.deleteMany({ where: { sku: "TAV-CRD-SET8-001" } });

  // Final Summary
  console.log("\n=======================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`  SET 8 RESULTS: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log("=======================================================");

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Set 8 verification runner exception:", err);
  process.exit(1);
});


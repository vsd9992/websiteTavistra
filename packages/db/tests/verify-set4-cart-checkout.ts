/**
 * Set 4 Automated Verification Script (Live against devMachine PostgreSQL, Storefront API, and Mailpit)
 * Tests cumulative 10-unit/10-line bulk ceilings, PIN whitelist server enforcement,
 * mixed-mode & maintenance gates, Ready Stock 100% + atomic inventory deduction,
 * tampered-client price immunity, MTO 25% advance / 75% balance, and Mailpit order receipts.
 */

import { PrismaClient } from "@prisma/client";
import { checkBulkOrderCeiling } from "../../shared/src/shipping";
import { computeGstinCheckDigit } from "../../shared/src/validation";

const prisma = new PrismaClient();
const STOREFRONT_URL = process.env.STOREFRONT_URL || "http://192.168.1.100:3001";
const ADMIN_PROXY_URL = process.env.ADMIN_PROXY_URL || "http://192.168.1.100:3002";
const MAILPIT_URL = process.env.MAILPIT_URL || "http://192.168.1.100:8025";

interface TestResult {
  name: string;
  section: string;
  passed: boolean;
  details: string;
}

const report: TestResult[] = [];

function assert(condition: boolean, name: string, section: string, details: string) {
  report.push({ name, section, passed: condition, details });
  if (!condition) {
    console.error(`  [FAIL] ${section} > ${name}: ${details}`);
  } else {
    console.log(`  [PASS] ${section} > ${name}`);
  }
}

async function fetchMailpitMessageByQuery(query: string, sinceMs: number): Promise<{ subject: string; text: string } | null> {
  await new Promise((r) => setTimeout(r, 900));
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const res = await fetch(`${MAILPIT_URL}/api/v1/messages?limit=25`);
      if (res.ok) {
        const data = await res.json();
        const messages = data.messages || [];
        for (const m of messages) {
          const createdMs = new Date(m.Created).getTime();
          if (createdMs < sinceMs - 5000) continue;
          const haystack = `${m.Subject || ""} ${JSON.stringify(m.To || [])}`.toLowerCase();
          if (haystack.includes(query.toLowerCase())) {
            const detailRes = await fetch(`${MAILPIT_URL}/api/v1/message/${m.ID}`);
            if (detailRes.ok) {
              const detail = await detailRes.json();
              return {
                subject: detail.Subject || m.Subject || "",
                text: `${detail.Text || ""}\n${detail.HTML || ""}`,
              };
            }
          }
        }
      }
    } catch {
      // Retry
    }
    await new Promise((r) => setTimeout(r, 700));
  }
  return null;
}

async function runSet4Verification() {
  console.log("\n=======================================================");
  console.log("  SET 4 VERIFICATION SUITE — CART & CHECKOUT INTEGRITY");
  console.log(`  Storefront: ${STOREFRONT_URL}`);
  console.log(`  Mailpit:    ${MAILPIT_URL}`);
  console.log("=======================================================\n");

  const runId = Date.now().toString().slice(-6);
  const qaEmail = `qa.set4.${runId}@gmail.com`;
  const qaPhone = "9820202020";
  const gstinPrefix = "27AAPFU0939F1Z";
  const validGstin = `${gstinPrefix}${computeGstinCheckDigit(gstinPrefix)}`;
  const invalidGstin = `${gstinPrefix}${validGstin[14] === "0" ? "1" : "0"}`;
  const createdOrderNumbers: string[] = [];
  let initialMaintenanceVal = "false";
  let didToggleMaintenance = false;

  try {
    // Discover real live variants from DB
    const clockOb = await prisma.productVariant.findUnique({
      where: { sku: "TAV-CLK-001-OB" },
      include: { product: true, inventoryLedger: true },
    });
    const clockRaw = await prisma.productVariant.findUnique({
      where: { sku: "TAV-CLK-001-RAW" },
      include: { product: true, inventoryLedger: true },
    });
    const keyTagNat = await prisma.productVariant.findUnique({
      where: { sku: "TAV-ACC-005-NAT" },
      include: { product: true, inventoryLedger: true },
    });
    const mtoMirrorStd = await prisma.productVariant.findUnique({
      where: { sku: "TAV-MIR-002-STD" },
      include: { product: true },
    });
    const quoteSculpture = await prisma.product.findUnique({
      where: { slug: "oblique-kinetic-wind-sculpture" },
    });

    assert(
      Boolean(clockOb && clockRaw && keyTagNat && mtoMirrorStd && quoteSculpture),
      "Live Catalog Fixtures Present in PostgreSQL",
      "Setup",
      "Verified TAV-CLK-001-OB, TAV-CLK-001-RAW, TAV-ACC-005-NAT, TAV-MIR-002-STD, quote fixture"
    );

    if (!clockOb || !clockRaw || !keyTagNat || !mtoMirrorStd || !quoteSculpture) {
      throw new Error("Missing required catalog fixtures in DB.");
    }

    // ------------------------------------------------------------------------
    // SECTION 1: Cumulative 10-Unit / 10-Line Bulk Boundary
    // ------------------------------------------------------------------------
    console.log("--- Section 1: Cumulative 10-Unit & 10-Line Bulk Boundary ---");

    const ok10Total = checkBulkOrderCeiling([
      { productId: "p1", quantity: 4 },
      { productId: "p2", quantity: 6 },
    ]);
    assert(
      !ok10Total.isBulkEnquiryRequired,
      "10 Cumulative Units Across 2 Lines Allowed",
      "Bulk Boundary",
      `isBulk=${ok10Total.isBulkEnquiryRequired}`
    );

    const breach50 = checkBulkOrderCeiling([
      { productId: "p1", quantity: 10 },
      { productId: "p2", quantity: 10 },
      { productId: "p3", quantity: 10 },
      { productId: "p4", quantity: 10 },
      { productId: "p5", quantity: 10 },
    ]);
    assert(
      breach50.isBulkEnquiryRequired && breach50.reason === "EXCEEDS_MAX_TOTAL_UNITS",
      "50 Units Across 5 Lines Triggers Bulk Ceiling (STR-09)",
      "Bulk Boundary",
      `reason=${breach50.reason}`
    );

    const breach11Split = checkBulkOrderCeiling([
      { productId: clockOb.productId, quantity: 6 },
      { productId: keyTagNat.productId, quantity: 5 },
    ]);
    assert(
      breach11Split.isBulkEnquiryRequired &&
        breach11Split.reason === "EXCEEDS_MAX_TOTAL_UNITS" &&
        /total units overall/i.test(breach11Split.message || "") &&
        !/single product/i.test(breach11Split.message || ""),
      "11 Cumulative Units Across Distinct Products Blocked",
      "Bulk Boundary",
      `reason=${breach11Split.reason}`
    );

    // Server Shipping API reports bulk boundary
    const bulkShipRes = await fetch(`${STOREFRONT_URL}/api/shipping/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pincode: "380001",
        items: [
          { productId: clockOb.productId, quantity: 6 },
          { productId: keyTagNat.productId, quantity: 5 },
        ],
      }),
    });
    const bulkShipData = await bulkShipRes.json();
    assert(
      bulkShipRes.ok && bulkShipData.bulkCheck?.isBulkEnquiryRequired === true,
      "POST /api/shipping/calculate Flags 11 Cumulative Units",
      "Bulk Boundary",
      `bulk=${JSON.stringify(bulkShipData.bulkCheck)}`
    );

    // Server Order API rejects > 10 cumulative units across 2 products
    const bulkOrderRes = await fetch(`${STOREFRONT_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "READY_STOCK",
        customerName: "QA Bulk Buyer",
        email: qaEmail,
        phone: qaPhone,
        addressLine1: "100 Bulk Avenue",
        city: "Ahmedabad",
        state: "Gujarat",
        destinationPin: "380001",
        items: [
          { variantId: clockOb.id, quantity: 6 },
          { variantId: keyTagNat.id, quantity: 5 },
        ],
      }),
    });
    const bulkOrderData = await bulkOrderRes.json();
    assert(
      bulkOrderRes.status === 400 && bulkOrderData.code === "BULK_ORDER_REQUIRED",
      "POST /api/orders Rejects > 10 Cumulative Units (400)",
      "Bulk Boundary",
      `status=${bulkOrderRes.status} code=${bulkOrderData.code}`
    );

    // ------------------------------------------------------------------------
    // SECTION 2: PIN Whitelist, Contact Gates & Strict Mode Separation
    // ------------------------------------------------------------------------
    console.log("\n--- Section 2: Server PIN Whitelist, Validation & Mode Separation ---");

    const badPinOrderRes = await fetch(`${STOREFRONT_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "READY_STOCK",
        customerName: "QA Buyer",
        email: qaEmail,
        phone: qaPhone,
        addressLine1: "14 Unlisted Lane",
        city: "Ahmedabad",
        state: "Gujarat",
        destinationPin: "380053",
        items: [{ variantId: keyTagNat.id, quantity: 1 }],
      }),
    });
    const badPinOrderData = await badPinOrderRes.json();
    assert(
      badPinOrderRes.status === 400 && badPinOrderData.code === "PIN_UNSERVICEABLE",
      "Reject Unlisted PIN 380053 at Order Submit (400)",
      "PIN Gate",
      `status=${badPinOrderRes.status} code=${badPinOrderData.code}`
    );

    const mixedModeRes = await fetch(`${STOREFRONT_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "READY_STOCK",
        customerName: "QA Mixed Buyer",
        email: qaEmail,
        phone: qaPhone,
        addressLine1: "14 Ashram Road",
        city: "Ahmedabad",
        state: "Gujarat",
        destinationPin: "380001",
        items: [
          { variantId: clockOb.id, quantity: 1 },
          { variantId: mtoMirrorStd.id, quantity: 1 },
        ],
      }),
    });
    const mixedModeData = await mixedModeRes.json();
    assert(
      mixedModeRes.status === 400 && mixedModeData.code === "MIXED_PURCHASE_MODE",
      "Reject Mixed Ready Stock + MTO Single Order (400)",
      "Mode Separation",
      `status=${mixedModeRes.status} code=${mixedModeData.code}`
    );

    const quoteOrderRes = await fetch(`${STOREFRONT_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "MADE_TO_ORDER",
        customerName: "QA Quote Buyer",
        email: qaEmail,
        phone: qaPhone,
        addressLine1: "14 Ashram Road",
        city: "Ahmedabad",
        state: "Gujarat",
        destinationPin: "380001",
        items: [{ productId: quoteSculpture.id, quantity: 1 }],
      }),
    });
    assert(
      quoteOrderRes.status === 400,
      "Reject QUOTE_ONLY Product in Retail Order API (400)",
      "Mode Separation",
      `status=${quoteOrderRes.status}`
    );

    const badGstinOrderRes = await fetch(`${STOREFRONT_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "READY_STOCK",
        customerName: "QA GST Buyer",
        email: qaEmail,
        phone: qaPhone,
        addressLine1: "14 Ashram Road",
        city: "Ahmedabad",
        state: "Gujarat",
        destinationPin: "380001",
        gstin: invalidGstin,
        items: [{ variantId: keyTagNat.id, quantity: 1 }],
      }),
    });
    assert(
      badGstinOrderRes.status === 400,
      "Reject Invalid GSTIN Checksum at Checkout API (400)",
      "Validation Gate",
      `status=${badGstinOrderRes.status}`
    );

    // ------------------------------------------------------------------------
    // SECTION 3: Maintenance Mode Server Gate (CHK-09)
    // ------------------------------------------------------------------------
    console.log("\n--- Section 3: Studio Maintenance Mode Gate (CHK-09) ---");

    const maintBefore = await prisma.systemSetting.findUnique({ where: { key: "MAINTENANCE_MODE" } });
    initialMaintenanceVal = maintBefore?.value || "false";

    await prisma.systemSetting.upsert({
      where: { key: "MAINTENANCE_MODE" },
      update: { value: "true" },
      create: { key: "MAINTENANCE_MODE", value: "true" },
    });
    didToggleMaintenance = true;

    const maintBlockedRes = await fetch(`${STOREFRONT_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "READY_STOCK",
        customerName: "QA Maint Buyer",
        email: qaEmail,
        phone: qaPhone,
        addressLine1: "14 Ashram Road",
        city: "Ahmedabad",
        state: "Gujarat",
        destinationPin: "380001",
        items: [{ variantId: keyTagNat.id, quantity: 1 }],
      }),
    });
    const maintBlockedData = await maintBlockedRes.json();
    assert(
      maintBlockedRes.status === 503 && maintBlockedData.code === "MAINTENANCE_MODE",
      "POST /api/orders Blocked While Maintenance Mode Active (503)",
      "Maintenance Gate",
      `status=${maintBlockedRes.status} code=${maintBlockedData.code}`
    );

    await prisma.systemSetting.update({
      where: { key: "MAINTENANCE_MODE" },
      data: { value: initialMaintenanceVal },
    });
    didToggleMaintenance = false;

    // ------------------------------------------------------------------------
    // SECTION 4: Ready Stock Checkout, Tampered Price Immunity & Stock Ledger
    // ------------------------------------------------------------------------
    console.log("\n--- Section 4: Ready Stock Checkout, Server Pricing & Inventory Deduction ---");

    const startStockClockOb = clockOb.inventoryLedger?.availableStock ?? 0;
    const startStockKeyNat = keyTagNat.inventoryLedger?.availableStock ?? 0;
    const startStockClockRaw = clockRaw.inventoryLedger?.availableStock ?? 0;

    // Pre-calculate authoritative expected shipping for clockOb(1) + keyTagNat(2) to 380001
    const calcShipRes = await fetch(`${STOREFRONT_URL}/api/shipping/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pincode: "380001",
        items: [
          {
            productId: clockOb.productId,
            slug: clockOb.product.slug,
            title: clockOb.product.title,
            quantity: 1,
            priceRupees: Number(clockOb.taxInclusivePrice),
            weightGrams: clockOb.weightGrams ?? clockOb.product.weightGrams,
            lengthMm: clockOb.lengthMm ?? clockOb.product.lengthMm,
            widthMm: clockOb.widthMm ?? clockOb.product.widthMm,
            heightMm: clockOb.heightMm ?? clockOb.product.heightMm,
          },
          {
            productId: keyTagNat.productId,
            slug: keyTagNat.product.slug,
            title: keyTagNat.product.title,
            quantity: 2,
            priceRupees: Number(keyTagNat.taxInclusivePrice),
            weightGrams: keyTagNat.weightGrams ?? keyTagNat.product.weightGrams,
            lengthMm: keyTagNat.lengthMm ?? keyTagNat.product.lengthMm,
            widthMm: keyTagNat.widthMm ?? keyTagNat.product.widthMm,
            heightMm: keyTagNat.heightMm ?? keyTagNat.product.heightMm,
          },
        ],
      }),
    });
    const calcShipData = await calcShipRes.json();
    const expectedDeliveryFee = Number(calcShipData.totalDeliveryFeeRupees || 0);
    const expectedRsSubtotal = Number(clockOb.taxInclusivePrice) * 1 + Number(keyTagNat.taxInclusivePrice) * 2;
    const expectedRsTotal = expectedRsSubtotal + expectedDeliveryFee;

    const rsOrderNum = `TAV-RS-QA-${runId}`;
    const mailStart = Date.now();
    const rsOrderRes = await fetch(`${STOREFRONT_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: rsOrderNum,
        mode: "READY_STOCK",
        customerName: "QA ReadyStock Patron",
        email: qaEmail,
        phone: qaPhone,
        addressLine1: "42 C.G. Road, Navrangpura",
        city: "Ahmedabad",
        state: "Gujarat",
        destinationPin: "380001",
        gstin: validGstin,
        items: [
          { variantId: clockOb.id, quantity: 1, pricePaise: 100 }, // Tampered ₹1 client price!
          { variantId: keyTagNat.id, quantity: 2, pricePaise: 100 }, // Tampered ₹1 client price!
        ],
        itemsSubtotalRupees: 3, // Tampered ₹3 client total!
        deliveryFeeRupees: 0,
        totalAmountRupees: 3,
        amountPaidRupees: 3,
        balanceDueRupees: 0,
      }),
    });
    const rsOrderData = await rsOrderRes.json();
    if (rsOrderData?.orderNumber) createdOrderNumbers.push(rsOrderData.orderNumber);

    assert(
      rsOrderRes.ok &&
        rsOrderData.order?.itemsSubtotalRupees === expectedRsSubtotal &&
        rsOrderData.order?.deliveryFeeRupees === expectedDeliveryFee &&
        rsOrderData.order?.totalAmountRupees === expectedRsTotal &&
        rsOrderData.order?.amountPaidRupees === expectedRsTotal &&
        rsOrderData.order?.balanceDueRupees === 0,
      "Ready Stock Order Ignores Tampered Prices & Enforces 100% DB Totals",
      "Ready Stock Checkout",
      `expected=${expectedRsTotal}, got=${JSON.stringify(rsOrderData.order)}`
    );

    const dbRsOrder = await prisma.order.findUnique({
      where: { orderNumber: rsOrderNum },
      include: { items: true, payments: true },
    });
    assert(
      Boolean(dbRsOrder) &&
        dbRsOrder?.items.length === 2 &&
        dbRsOrder?.payments.some((p) => p.paymentType === "FULL_PAYMENT" && p.status === "COMPLETED"),
      "DB Ready Stock Order, Variant Items & FULL_PAYMENT Ledger Persisted",
      "Ready Stock Checkout",
      `items=${dbRsOrder?.items.length} paid=${dbRsOrder?.amountPaid}`
    );

    // Check InventoryLedger decrements + StockMovement rows
    const afterLedgerOb = await prisma.inventoryLedger.findUnique({ where: { variantId: clockOb.id } });
    const afterLedgerNat = await prisma.inventoryLedger.findUnique({ where: { variantId: keyTagNat.id } });
    const stockMoves = await prisma.stockMovement.findMany({ where: { referenceId: rsOrderNum } });

    assert(
      afterLedgerOb?.availableStock === startStockClockOb - 1 &&
        afterLedgerNat?.availableStock === startStockKeyNat - 2 &&
        stockMoves.length === 2,
      "InventoryLedger Atomically Decremented & StockMovement Logged",
      "Inventory Ledger",
      `OB: ${startStockClockOb}->${afterLedgerOb?.availableStock}, NAT: ${startStockKeyNat}->${afterLedgerNat?.availableStock}, moves=${stockMoves.length}`
    );

    // Verify Mailpit receipt for Ready Stock order
    const rsMail = await fetchMailpitMessageByQuery(rsOrderNum, mailStart);
    assert(
      Boolean(rsMail) && rsMail!.subject.includes("Tavistra") && !rsMail!.text.includes("VDesign"),
      "Mailpit Delivered Ready Stock Confirmation with Tavistra Branding",
      "Mailpit",
      `subject=${rsMail?.subject || "missing"}`
    );

    // Insufficient Stock test using clockRaw (stock = 4, request 5 <= 10 bulk limit!)
    const overStockQty = Math.min(10, startStockClockRaw + 1);
    const overStockRes = await fetch(`${STOREFRONT_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: `TAV-RS-OOS-${runId}`,
        mode: "READY_STOCK",
        customerName: "QA Overstock Buyer",
        email: qaEmail,
        phone: qaPhone,
        addressLine1: "42 C.G. Road",
        city: "Ahmedabad",
        state: "Gujarat",
        destinationPin: "380001",
        items: [{ variantId: clockRaw.id, quantity: overStockQty }],
      }),
    });
    const overStockData = await overStockRes.json();
    assert(
      overStockRes.status === 409 && overStockData.code === "INSUFFICIENT_STOCK",
      `Insufficient Stock Rejected Atomically (${overStockQty} > ${startStockClockRaw}, 409)`,
      "Inventory Ledger",
      `status=${overStockRes.status} code=${overStockData.code}`
    );

    // ------------------------------------------------------------------------
    // SECTION 5: Made to Order End-to-End Checkout (25% Advance / 75% Balance)
    // ------------------------------------------------------------------------
    console.log("\n--- Section 5: Made to Order Checkout (25% Advance / 75% Balance) ---");

    const calcMtoShipRes = await fetch(`${STOREFRONT_URL}/api/shipping/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pincode: "110001",
        items: [
          {
            productId: mtoMirrorStd.productId,
            slug: mtoMirrorStd.product.slug,
            title: mtoMirrorStd.product.title,
            quantity: 1,
            priceRupees: Number(mtoMirrorStd.taxInclusivePrice),
            weightGrams: mtoMirrorStd.weightGrams ?? mtoMirrorStd.product.weightGrams,
            lengthMm: mtoMirrorStd.lengthMm ?? mtoMirrorStd.product.lengthMm,
            widthMm: mtoMirrorStd.widthMm ?? mtoMirrorStd.product.widthMm,
            heightMm: mtoMirrorStd.heightMm ?? mtoMirrorStd.product.heightMm,
          },
        ],
      }),
    });
    const calcMtoShipData = await calcMtoShipRes.json();
    const expectedMtoDelivery = Number(calcMtoShipData.totalDeliveryFeeRupees || 0);
    const expectedMtoSubtotal = Number(mtoMirrorStd.taxInclusivePrice);
    const expectedMtoTotal = expectedMtoSubtotal + expectedMtoDelivery;
    const expectedMtoAdvance = Math.round(expectedMtoTotal * 0.25);
    const expectedMtoBalance = expectedMtoTotal - expectedMtoAdvance;

    const mtoOrderNum = `TAV-MTO-QA-${runId}`;
    const mtoMailStart = Date.now();
    const mtoOrderRes = await fetch(`${STOREFRONT_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: mtoOrderNum,
        mode: "MADE_TO_ORDER",
        customerName: "QA MTO Architect",
        email: qaEmail,
        phone: qaPhone,
        addressLine1: "14 Barakhamba Road",
        city: "New Delhi",
        state: "Delhi",
        destinationPin: "110001",
        items: [{ variantId: mtoMirrorStd.id, quantity: 1 }],
      }),
    });
    const mtoOrderData = await mtoOrderRes.json();
    if (mtoOrderData?.orderNumber) createdOrderNumbers.push(mtoOrderData.orderNumber);

    assert(
      mtoOrderRes.ok &&
        mtoOrderData.order?.totalAmountRupees === expectedMtoTotal &&
        mtoOrderData.order?.amountPaidRupees === expectedMtoAdvance &&
        mtoOrderData.order?.balanceDueRupees === expectedMtoBalance,
      "MTO Order Computes Exact 25% Advance & 75% Balance",
      "MTO Checkout",
      `total=${expectedMtoTotal} advance=${mtoOrderData.order?.amountPaidRupees} balance=${mtoOrderData.order?.balanceDueRupees}`
    );

    const dbMtoOrder = await prisma.order.findUnique({
      where: { orderNumber: mtoOrderNum },
      include: { payments: true },
    });
    assert(
      Boolean(dbMtoOrder?.confirmedAt) &&
        dbMtoOrder?.payments.some((p) => p.paymentType === "ADVANCE_25" && p.status === "COMPLETED"),
      "DB MTO Order Persists Grace Clock (confirmedAt) & ADVANCE_25 Ledger",
      "MTO Checkout",
      `confirmedAt=${dbMtoOrder?.confirmedAt?.toISOString()}`
    );

    const mtoMail = await fetchMailpitMessageByQuery(mtoOrderNum, mtoMailStart);
    assert(
      Boolean(mtoMail) &&
        mtoMail!.subject.includes("Tavistra") &&
        mtoMail!.text.includes(expectedMtoAdvance.toLocaleString("en-IN")),
      "Mailpit Delivered MTO 25% Advance Receipt",
      "Mailpit",
      `subject=${mtoMail?.subject || "missing"}`
    );

    // Admin Proxy Connectivity Smoke Check
    const adminCheckRes = await fetch(`${ADMIN_PROXY_URL}/api/products`);
    assert(adminCheckRes.ok, "Admin Proxy (:3002 -> :3001) Healthy", "Proxy", `status=${adminCheckRes.status}`);
  } finally {
    console.log("\n--- Cleanup QA Artifacts ---");
    try {
      if (didToggleMaintenance) {
        await prisma.systemSetting.update({
          where: { key: "MAINTENANCE_MODE" },
          data: { value: initialMaintenanceVal },
        });
      }
      if (createdOrderNumbers.length > 0) {
        const movements = await prisma.stockMovement.findMany({
          where: { referenceId: { in: createdOrderNumbers }, type: "ORDER_FULFILLED" },
        });
        for (const m of movements) {
          if (m.quantity < 0) {
            await prisma.inventoryLedger.update({
              where: { id: m.inventoryLedgerId },
              data: { availableStock: { increment: Math.abs(m.quantity) } },
            });
          }
        }
        await prisma.stockMovement.deleteMany({
          where: { referenceId: { in: createdOrderNumbers } },
        });
        await prisma.orderItem.deleteMany({
          where: { order: { orderNumber: { in: createdOrderNumbers } } },
        });
        await prisma.payment.deleteMany({
          where: { order: { orderNumber: { in: createdOrderNumbers } } },
        });
        await prisma.order.deleteMany({
          where: { orderNumber: { in: createdOrderNumbers } },
        });
      }
      await prisma.customerAddress.deleteMany({
        where: { guestEmail: qaEmail },
      });
      console.log("  Restored inventory, system settings, and removed QA orders/addresses.");
    } catch (cleanupErr) {
      console.error("  QA cleanup warning:", cleanupErr);
    }
    await prisma.$disconnect();
  }

  const passedCount = report.filter((r) => r.passed).length;
  const failedCount = report.filter((r) => !r.passed).length;

  console.log("\n=======================================================");
  console.log(`  SET 4 VERIFICATION SUMMARY: ${passedCount}/${report.length} PASSED (${failedCount} FAILED)`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSet4Verification().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});


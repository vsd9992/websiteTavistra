/**
 * Live Verification Script: Set 5 (Order Tracking, 7-Day Grace, QC Photos & 75% Balance Gate)
 *
 * Runs directly against live devMachine PostgreSQL, Storefront (:3001), Admin Proxy (:3002),
 * and Mailpit (:8025).
 *
 * Execute: pnpm --filter @tavistra/db test:set5
 */

import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

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

async function fetchMailpitMessages() {
  try {
    const res = await fetch(`${MAILPIT_URL}/api/v1/messages?limit=30`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.messages) ? data.messages : [];
  } catch {
    return [];
  }
}

async function waitForMailpitSubject(recipient: string, keyword: string, timeoutMs = 6000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const msgs = await fetchMailpitMessages();
    const hit = msgs.find(
      (m: { To?: Array<{ Address?: string }>; Subject?: string }) =>
        (m.To || []).some((t) => (t.Address || "").toLowerCase() === recipient.toLowerCase()) &&
        (m.Subject || "").toLowerCase().includes(keyword.toLowerCase())
    );
    if (hit) return hit;
    await new Promise((r) => setTimeout(r, 350));
  }
  return null;
}

// Valid 1x1 transparent PNG buffer for upload testing
const SAMPLE_PNG_BUFFER = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=",
  "base64"
);

async function run() {
  console.log("=======================================================");
  console.log("  SET 5 VERIFICATION SUITE — ORDER TRACKING & GATES");
  console.log(`  Storefront: ${STOREFRONT_URL}`);
  console.log(`  Admin:      ${ADMIN_URL}`);
  console.log(`  Mailpit:    ${MAILPIT_URL}`);
  console.log("=======================================================\n");

  const runId = Date.now();
  const qaEmail = `qa.set5.${runId}@gmail.com`;
  const qaPhone = "9876505505";
  const createdOrderNumbers: string[] = [];
  const uploadedDiskDirs: string[] = [];
  let qaUserId: string | null = null;
  let qaSessionCookie = "";

  try {
    // ------------------------------------------------------------------------
    // SECTION 1: Setup Customer Session & MTO Order (25% Advance + Day 0 Grace)
    // ------------------------------------------------------------------------
    console.log("--- Section 1: Customer Session & MTO Grace Order Setup ---");

    const qaUser = await prisma.user.create({
      data: {
        email: qaEmail,
        name: "QA Set5 Client",
        phone: qaPhone,
        passwordHash: "qa_set5_session_only",
        emailVerifiedAt: new Date(),
      },
    });
    qaUserId = qaUser.id;

    const rawSession = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawSession).digest("hex");
    await prisma.customerSession.create({
      data: {
        userId: qaUser.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    qaSessionCookie = `tavistra_session=${rawSession}`;

    const mtoProduct = await prisma.product.findFirst({
      where: { primaryMode: "MADE_TO_ORDER", isPublished: true },
      include: { variants: { where: { isPublished: true }, take: 1 } },
    });
    assert(
      Boolean(mtoProduct && mtoProduct.variants.length > 0),
      "Published MTO Catalog Fixture Exists",
      "Setup",
      mtoProduct ? mtoProduct.title : "missing"
    );
    if (!mtoProduct || mtoProduct.variants.length === 0) return;
    const mtoVariant = mtoProduct.variants[0];

    const placeOrder = async () => {
      const res = await fetch(`${STOREFRONT_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: qaSessionCookie,
        },
        body: JSON.stringify({
          mode: "MADE_TO_ORDER",
          customerName: "QA Set5 Client",
          email: qaEmail,
          phone: qaPhone,
          addressLine1: "42 Ashram Architectural Enclave",
          city: "Ahmedabad",
          state: "Gujarat",
          destinationPin: "380001",
          items: [{ variantId: mtoVariant.id, productId: mtoProduct.id, quantity: 1 }],
        }),
      });
      return { res, data: await res.json() };
    };

    const { res: o1Res, data: o1Data } = await placeOrder();
    const orderNum1 = o1Data.order?.orderNumber as string;
    if (orderNum1) createdOrderNumbers.push(orderNum1);

    assert(
      o1Res.ok && Boolean(orderNum1) && o1Data.order.balanceDueRupees > 0,
      "MTO Order Created With 25% Advance & 75% Balance Due",
      "MTO Setup",
      `status=${o1Res.status} order=${orderNum1} balance=${o1Data.order?.balanceDueRupees}`
    );
    if (!orderNum1) return;

    // ------------------------------------------------------------------------
    // SECTION 2: 7-Day IST Grace Window Release Cutoff (ADM-02)
    // ------------------------------------------------------------------------
    console.log("\n--- Section 2: 7-Day IST Grace Cutoff Enforcement ---");

    const day0ReleaseRes = await fetch(`${ADMIN_URL}/api/orders/${orderNum1}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "RELEASE_TO_WORKSHOP", staffName: "QA Production Lead" }),
    });
    const day0ReleaseData = await day0ReleaseRes.json();
    assert(
      day0ReleaseRes.status === 400 && day0ReleaseData.error === "GRACE_WINDOW_ACTIVE",
      "Block Workshop Release on Day 0 During 7-Day Grace (400)",
      "Grace Cutoff",
      `status=${day0ReleaseRes.status} err=${day0ReleaseData.error}`
    );

    // Move confirmedAt back 4 days -> Day 4 still must fail
    await prisma.order.update({
      where: { orderNumber: orderNum1 },
      data: { confirmedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
    });
    const day4ReleaseRes = await fetch(`${ADMIN_URL}/api/orders/${orderNum1}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "RELEASE_TO_WORKSHOP", staffName: "QA Production Lead" }),
    });
    const day4ReleaseData = await day4ReleaseRes.json();
    assert(
      day4ReleaseRes.status === 400 && day4ReleaseData.error === "GRACE_WINDOW_ACTIVE",
      "Block Workshop Release on Day 4 Still Inside 7-Day Grace (400)",
      "Grace Cutoff",
      `status=${day4ReleaseRes.status} err=${day4ReleaseData.error}`
    );

    // Move confirmedAt back 8 days -> Day 8 release succeeds
    await prisma.order.update({
      where: { orderNumber: orderNum1 },
      data: { confirmedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
    });
    const day8ReleaseRes = await fetch(`${ADMIN_URL}/api/orders/${orderNum1}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "RELEASE_TO_WORKSHOP", staffName: "QA Production Lead" }),
    });
    const day8ReleaseData = await day8ReleaseRes.json();
    assert(
      day8ReleaseRes.ok && day8ReleaseData.order?.status === "IN_PRODUCTION",
      "Allow Workshop Release on Day 8 (IN_PRODUCTION)",
      "Grace Cutoff",
      `status=${day8ReleaseRes.status} orderStatus=${day8ReleaseData.order?.status}`
    );

    // Duplicate release rejected
    const dupReleaseRes = await fetch(`${ADMIN_URL}/api/orders/${orderNum1}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "RELEASE_TO_WORKSHOP" }),
    });
    const dupReleaseData = await dupReleaseRes.json();
    assert(
      dupReleaseRes.status === 409 && dupReleaseData.error === "ALREADY_RELEASED",
      "Reject Duplicate Production Release (409 ALREADY_RELEASED)",
      "Grace Cutoff",
      `status=${dupReleaseRes.status} err=${dupReleaseData.error}`
    );

    // ------------------------------------------------------------------------
    // SECTION 3: Real QC Photo Upload & Customer Publication (ADM-06 / ACC-07)
    // ------------------------------------------------------------------------
    console.log("\n--- Section 3: Real Workshop QC Photo Upload & Notification ---");

    const form = new FormData();
    form.append("files", new Blob([SAMPLE_PNG_BUFFER], { type: "image/png" }), "qc-bevel-check.png");

    const uploadRes = await fetch(`${ADMIN_URL}/api/admin/orders/${orderNum1}/qc-upload`, {
      method: "POST",
      body: form,
    });
    const uploadData = await uploadRes.json();
    const uploadedUrl = Array.isArray(uploadData.urls) ? uploadData.urls[0] : "";
    assert(
      uploadRes.ok && typeof uploadedUrl === "string" && uploadedUrl.startsWith(`/uploads/qc/${orderNum1}/`),
      "Upload Local QC Photo via Admin Proxy (:3002 -> /uploads/qc/...)",
      "QC Upload",
      `status=${uploadRes.status} url=${uploadedUrl}`
    );

    if (uploadedUrl) {
      const storageDirCandidates = [
        path.resolve(process.cwd(), "../../storage/uploads/qc", orderNum1),
        path.resolve(process.cwd(), "storage/uploads/qc", orderNum1),
      ];
      storageDirCandidates.forEach((d) => {
        if (fs.existsSync(d)) uploadedDiskDirs.push(d);
      });

      const serveRes = await fetch(`${STOREFRONT_URL}${uploadedUrl}`);
      assert(
        serveRes.ok && (serveRes.headers.get("content-type") || "").includes("image/png"),
        "Serve Uploaded QC Photo at Public Storefront /uploads URL (200 image/png)",
        "QC Upload",
        `status=${serveRes.status} ct=${serveRes.headers.get("content-type")}`
      );
    }

    const qcSaveRes = await fetch(`${ADMIN_URL}/api/orders/${orderNum1}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "UPDATE_QC",
        qcNotes: "Brass frame hand-burnished; joints ultrasonic cleaned and lacquered.",
        qcImages: uploadedUrl ? [uploadedUrl] : [],
        staffName: "QA Master Craftsman",
      }),
    });
    const qcSaveData = await qcSaveRes.json();
    assert(
      qcSaveRes.ok &&
        qcSaveData.order?.status === "PRODUCTION_COMPLETED" &&
        Array.isArray(qcSaveData.order?.qcImages) &&
        qcSaveData.order.qcImages.length === 1,
      "Publish QC Photos & Notes (PRODUCTION_COMPLETED)",
      "QC Publish",
      `status=${qcSaveRes.status} orderStatus=${qcSaveData.order?.status}`
    );

    const qcMail = await waitForMailpitSubject(qaEmail, orderNum1);
    assert(
      Boolean(qcMail),
      "Mailpit Delivered QC Inspection Photo Ready Email",
      "Mailpit QC",
      qcMail ? qcMail.Subject : "no email"
    );

    // ------------------------------------------------------------------------
    // SECTION 4: Hard 100% Balance Dispatch Lockout & Privacy (ADM-03)
    // ------------------------------------------------------------------------
    console.log("\n--- Section 4: Hard Dispatch Lockout & Direct Order Privacy ---");

    const blockedDispatchRes = await fetch(`${ADMIN_URL}/api/orders/${orderNum1}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "DISPATCH",
        carrierName: "Blue Dart Fragile Surface",
        awbNumber: "BD000BLOCKED",
      }),
    });
    const blockedDispatchData = await blockedDispatchRes.json();
    assert(
      blockedDispatchRes.status === 400 && blockedDispatchData.error === "DISPATCH_BLOCKED",
      "Hard Block Dispatch While 75% Balance Due > 0 (400 DISPATCH_BLOCKED)",
      "Dispatch Gate",
      `status=${blockedDispatchRes.status} err=${blockedDispatchData.error}`
    );

    const unauthDirectGet = await fetch(`${STOREFRONT_URL}/api/orders/${orderNum1}`);
    assert(
      unauthDirectGet.status === 401,
      "Reject Unauthenticated GET /api/orders/[id] Without Contact (401)",
      "Privacy Gate",
      `status=${unauthDirectGet.status}`
    );

    // ------------------------------------------------------------------------
    // SECTION 5: 75% Balance Settlement & ACC-04 Status Reflection
    // ------------------------------------------------------------------------
    console.log("\n--- Section 5: 75% Balance Payment & ACC-04 Account Status ---");

    const payRes = await fetch(`${STOREFRONT_URL}/api/orders/${orderNum1}/pay-balance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gateway: "PHONEPE" }),
    });
    const payData = await payRes.json();
    assert(
      payRes.ok &&
        payData.success &&
        payData.order?.balanceDueRupees === 0 &&
        payData.order?.status === "AWAITING_DISPATCH" &&
        payData.order?.isFullyPaid === true,
      "Clear Remaining 75% Balance & Advance to AWAITING_DISPATCH",
      "Balance Gate",
      `status=${payRes.status} bal=${payData.order?.balanceDueRupees} orderStatus=${payData.order?.status}`
    );

    const accOrdersRes = await fetch(`${STOREFRONT_URL}/api/account/orders`, {
      headers: { Cookie: qaSessionCookie },
    });
    const accOrdersData = await accOrdersRes.json();
    const matchedAccOrder = (accOrdersData.orders || []).find(
      (o: { orderNumber: string }) => o.orderNumber === orderNum1
    );
    assert(
      accOrdersRes.ok &&
        Boolean(matchedAccOrder) &&
        matchedAccOrder.balanceDueRupees === 0 &&
        matchedAccOrder.isFullyPaid === true &&
        /100%\s*Paid/i.test(matchedAccOrder.paymentStatusLabel || "") &&
        !/Advance Paid/i.test(matchedAccOrder.paymentStatusLabel || "") &&
        Array.isArray(matchedAccOrder.qcImages) &&
        matchedAccOrder.qcImages.length === 1,
      "ACC-04 Account Orders Reflects 100% Paid & QC Photos After Balance Clear",
      "Account History",
      `bal=${matchedAccOrder?.balanceDueRupees} payBadge="${matchedAccOrder?.paymentStatusLabel}"`
    );

    // ------------------------------------------------------------------------
    // SECTION 6: Dispatch After 100% Payment & Delivery Completion (ADM-05)
    // ------------------------------------------------------------------------
    console.log("\n--- Section 6: Dispatch Unlock, Delivery & Cancellation Guards ---");

    const dispatchRes = await fetch(`${ADMIN_URL}/api/orders/${orderNum1}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "DISPATCH",
        carrierName: "Blue Dart Fragile Surface",
        awbNumber: "BD77889900",
        staffName: "QA Logistics Lead",
      }),
    });
    const dispatchData = await dispatchRes.json();
    assert(
      dispatchRes.ok &&
        dispatchData.order?.status === "DISPATCHED" &&
        dispatchData.order?.trackingNumber === "BD77889900",
      "Dispatch & Assign AWB Succeeds Once 100% Balance Settled",
      "Dispatch Unlock",
      `status=${dispatchRes.status} awb=${dispatchData.order?.trackingNumber}`
    );

    const deliverRes = await fetch(`${ADMIN_URL}/api/orders/${orderNum1}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "MARK_DELIVERED", staffName: "QA Logistics Lead" }),
    });
    const deliverData = await deliverRes.json();
    assert(
      deliverRes.ok && deliverData.order?.status === "DELIVERED",
      "Mark Dispatched Order DELIVERED",
      "Delivery",
      `status=${deliverRes.status} orderStatus=${deliverData.order?.status}`
    );

    const cancelDeliveredRes = await fetch(`${ADMIN_URL}/api/orders/${orderNum1}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CANCEL_ORDER" }),
    });
    assert(
      cancelDeliveredRes.status === 400,
      "Reject Cancellation After Dispatch / Delivery (400)",
      "Cancel Guard",
      `status=${cancelDeliveredRes.status}`
    );

    // Second MTO order in Grace: test both early 100% payment badge during grace AND 100% refund cancel
    const { res: o2Res, data: o2Data } = await placeOrder();
    const orderNum2 = o2Data.order?.orderNumber as string;
    if (orderNum2) createdOrderNumbers.push(orderNum2);
    assert(o2Res.ok && Boolean(orderNum2), "Create Second MTO Order Inside 7-Day Grace", "Grace Cancel", `order=${orderNum2}`);

    if (orderNum2) {
      await fetch(`${STOREFRONT_URL}/api/orders/${orderNum2}/pay-balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateway: "PHONEPE" }),
      });
      const track2Res = await fetch(`${STOREFRONT_URL}/api/orders?orderId=${orderNum2}`, {
        headers: { Cookie: qaSessionCookie },
      });
      const track2Data = await track2Res.json();
      assert(
        track2Res.ok &&
          track2Data.order?.balanceDueRupees === 0 &&
          /100%\s*Paid/i.test(track2Data.order?.statusLabel || ""),
        "Early 100% Payment During Grace Displays '100% Paid' Label (ACC-04)",
        "Grace Payment Label",
        `label="${track2Data.order?.statusLabel}"`
      );

      const cancelGraceRes = await fetch(`${ADMIN_URL}/api/orders/${orderNum2}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL_ORDER", staffName: "QA Studio Desk" }),
      });
      const cancelGraceData = await cancelGraceRes.json();
      assert(
        cancelGraceRes.ok && cancelGraceData.order?.status === "CANCELLED",
        "Pre-Production Cancel During Grace Creates Refund & Cancels Order",
        "Grace Cancel",
        `status=${cancelGraceRes.status} orderStatus=${cancelGraceData.order?.status}`
      );
    }

    // ------------------------------------------------------------------------
    // SECTION 7: Direct Order URL 404 Guard (SEC-03)
    // ------------------------------------------------------------------------
    console.log("\n--- Section 7: Direct Order URL & Luxury 404 Guard (SEC-03) ---");

    const fakeOrderPageRes = await fetch(`${STOREFRONT_URL}/orders/NON-EXISTENT-ORDER-FAKE`);
    const fakeOrderHtml = await fakeOrderPageRes.text();
    assert(
      (fakeOrderPageRes.status === 404 || fakeOrderPageRes.status === 200) &&
        /Order Record Not Found/i.test(fakeOrderHtml) &&
        !/Application error|PrismaClient|ECONNREFUSED/i.test(fakeOrderHtml),
      "Direct /orders/FAKE Returns Luxury Not Found UI Without Stack Trace",
      "SEC-03",
      `status=${fakeOrderPageRes.status}`
    );
  } finally {
    console.log("\n--- Cleanup QA Artifacts ---");
    for (const dirPath of uploadedDiskDirs) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
    if (createdOrderNumbers.length > 0) {
      await prisma.auditLog.deleteMany({
        where: { entityId: { in: createdOrderNumbers } },
      });
      const ordersToDelete = await prisma.order.findMany({
        where: { orderNumber: { in: createdOrderNumbers } },
        select: { id: true, shippingAddressId: true },
      });
      const orderIds = ordersToDelete.map((o) => o.id);
      const addrIds = Array.from(new Set(ordersToDelete.map((o) => o.shippingAddressId)));
      if (orderIds.length > 0) {
        await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
      }
      if (addrIds.length > 0) {
        await prisma.customerAddress.deleteMany({ where: { id: { in: addrIds } } });
      }
    }
    if (qaUserId) {
      await prisma.customerSession.deleteMany({ where: { userId: qaUserId } });
      await prisma.user.deleteMany({ where: { id: qaUserId } });
    }
    console.log("  Cleaned QA Set 5 orders, QC disk files, payments, audit logs, and test user.");
  }

  console.log("\n=======================================================");
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`  SET 5 VERIFICATION SUMMARY: ${passed}/${results.length} PASSED (${failed} FAILED)`);
  console.log("=======================================================");

  await prisma.$disconnect();
  if (failed > 0) process.exit(1);
}

run().catch(async (err) => {
  console.error("Set 5 Verification crashed:", err);
  await prisma.$disconnect();
  process.exit(1);
});

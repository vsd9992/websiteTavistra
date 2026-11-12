/**
 * Live Verification Script: Set 6 (30-Day Architectural Quotes & Bulk Enquiry Lifecycle)
 *
 * Runs directly against live devMachine PostgreSQL, Storefront (:3001), Admin Proxy (:3002),
 * and Mailpit (:8025).
 *
 * Execute: pnpm --filter @tavistra/db test:set6
 */

import { PrismaClient } from "@prisma/client";

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

async function fetchMailpitBody(msgId: string): Promise<string> {
  try {
    const res = await fetch(`${MAILPIT_URL}/api/v1/message/${msgId}`);
    if (!res.ok) return "";
    const data = await res.json();
    return `${data.HTML || ""}\n${data.Text || ""}`;
  } catch {
    return "";
  }
}

async function run() {
  console.log("=======================================================");
  console.log("  SET 6 VERIFICATION SUITE — QUOTES & BULK ENQUIRIES");
  console.log(`  Storefront: ${STOREFRONT_URL}`);
  console.log(`  Admin:      ${ADMIN_URL}`);
  console.log(`  Mailpit:    ${MAILPIT_URL}`);
  console.log("=======================================================\n");

  const runId = Date.now();
  const qaEmail = `qa.set6.${runId}@gmail.com`;
  const qaPhone = "9876506606";
  const createdInquiryNumbers: string[] = [];
  const createdQuoteNumbers: string[] = [];
  const createdOrderNumbers: string[] = [];
  let createdUserEmail: string | null = null;

  try {
    // ------------------------------------------------------------------
    // SECTION 0: Clean /track Page Check (Recent UX Fix)
    // ------------------------------------------------------------------
    const trackPageRes = await fetch(`${STOREFRONT_URL}/track`);
    const trackHtml = await trackPageRes.text();
    assert(
      trackPageRes.status === 200 && !trackHtml.includes("Authoritative Order Record"),
      "Clean /track starts without preloaded last-tracked order card",
      "REGRESSION",
      `status=${trackPageRes.status}`
    );

    // ------------------------------------------------------------------
    // SECTION 1: Bulk / Bespoke Inquiry Ingestion & Validation (QOT-01)
    // ------------------------------------------------------------------
    const badRelayRes = await fetch(`${STOREFRONT_URL}/api/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "QA Relay Reject",
        email: "blocked@mailinator.com",
        phone: qaPhone,
        pincode: "560001",
        productName: "Bulk Test",
        quantity: 12,
        message: "Testing disposable email rejection",
      }),
    });
    assert(
      badRelayRes.status === 400,
      "Inquiry rejects banned relay/disposable email domain",
      "QOT-01",
      `status=${badRelayRes.status}`
    );

    const badPhoneRes = await fetch(`${STOREFRONT_URL}/api/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "QA Phone Reject",
        email: qaEmail,
        phone: "12345",
        pincode: "560001",
        productName: "Bulk Test",
        quantity: 12,
        message: "Testing invalid phone rejection",
      }),
    });
    assert(
      badPhoneRes.status === 400,
      "Inquiry rejects invalid Indian mobile number",
      "QOT-01",
      `status=${badPhoneRes.status}`
    );

    const inqCreateRes = await fetch(`${STOREFRONT_URL}/api/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Ar. Meera Krishnan",
        practiceOrStudio: "Studio Vayu Architecture",
        email: qaEmail,
        phone: qaPhone,
        pincode: "560001",
        productName: "Aurelia Wall Sculpture & Monolith Console Bulk",
        quantity: 15,
        message: "Boutique hotel lobby & suites architectural fit-out.\n\nSelected Products & Quantities:\n- Aurelia Sculptural Brass Wall Mirror (Aged Antique Brass Patina) × 10 @ ₹8,500 each\n- Monolith Teakwood & Cast Brass Console (Hand-rubbed Dark Walnut) × 5 @ ₹22,000 each",
        lineItems: [
          {
            name: "Aurelia Sculptural Brass Wall Mirror",
            finish: "Aged Antique Brass Patina",
            quantity: 10,
            unitPriceRupees: 8500,
          },
          {
            name: "Monolith Teakwood & Cast Brass Console",
            finish: "Hand-rubbed Dark Walnut",
            quantity: 5,
            unitPriceRupees: 22000,
          },
        ],
      }),
    });
    const inqCreateJson = await inqCreateRes.json();
    const inqNumber: string = inqCreateJson.inquiryNumber;
    const inqId: string = inqCreateJson.inquiry?.id;
    if (inqNumber) createdInquiryNumbers.push(inqNumber);

    assert(
      inqCreateRes.ok && inqCreateJson.success && /^INQ-\d{4}-\d+$/.test(inqNumber),
      "Valid commercial bulk inquiry creates INQ reference in PostgreSQL",
      "QOT-01",
      JSON.stringify(inqCreateJson)
    );

    // Confirm inquiry appears in Admin API (/api/inquiries via :3002) with line items preserved
    const adminInqListRes = await fetch(`${ADMIN_URL}/api/inquiries`);
    const adminInqListJson = await adminInqListRes.json();
    const foundInq = (adminInqListJson.inquiries || []).find(
      (i: { inquiryNumber?: string; destinationCity?: string; lineItems?: any[] }) => i.inquiryNumber === inqNumber
    );
    assert(
      adminInqListRes.ok &&
        foundInq &&
        foundInq.status === "NEW" &&
        foundInq.destinationCity.toLowerCase().includes("bengaluru") &&
        Array.isArray(foundInq.lineItems) &&
        foundInq.lineItems.length === 2 &&
        foundInq.lineItems[0].name.includes("Aurelia Sculptural Brass Wall Mirror") &&
        foundInq.lineItems[1].name.includes("Monolith Teakwood & Cast Brass Console"),
      "Inquiry appears in Admin worklist with Bengaluru destination and cart line items preserved",
      "QOT-01",
      JSON.stringify(foundInq || {})
    );
      (i: { inquiryNumber?: string; destinationCity?: string }) => i.inquiryNumber === inqNumber
    );
    assert(
      adminInqListRes.ok &&
        foundInq &&
        foundInq.status === "NEW" &&
        foundInq.destinationCity.toLowerCase().includes("bengaluru"),
      "Inquiry appears in Admin worklist with resolved Bengaluru destination city",
      "QOT-01",
      JSON.stringify(foundInq || {})
    );

    const inqMail = await waitForMailpitSubject(qaEmail, "Commercial Inquiry Registered");
    assert(
      !!inqMail,
      "Mailpit received Commercial Inquiry Registered email",
      "QOT-01",
      inqMail ? inqMail.Subject : "not found in Mailpit"
    );

    // ------------------------------------------------------------------
    // SECTION 2: Multi-Line-Item 30-Day Proposal Generation (QOT-02, QOT-03)
    // ------------------------------------------------------------------
    const lineItemsV1 = [
      {
        name: "Aurelia Sculptural Brass Wall Mirror",
        finish: "Aged Antique Brass Patina",
        quantity: 10,
        unitPriceRupees: 8500,
      },
      {
        name: "Monolith Teakwood & Cast Brass Console",
        finish: "Hand-rubbed Dark Walnut",
        quantity: 5,
        unitPriceRupees: 22000,
      },
    ];
    // Expected: (10 * 8500) + (5 * 22000) + 4500 delivery = 85000 + 110000 + 4500 = 199500
    // 25% advance = 49875; 75% balance = 149625
    const quoteCreateRes = await fetch(`${ADMIN_URL}/api/quotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inquiryId: inqId,
        customerName: "Ar. Meera Krishnan",
        customerEmail: qaEmail,
        customerPhone: qaPhone,
        deliveryPincode: "560001",
        lineItems: lineItemsV1,
        deliveryChargeRupees: 4500,
        estimatedLeadDays: 42,
        notes: "Include protective dual-layer pinewood crating for hospitality lobby.",
        staffName: "Senior Curator",
      }),
    });
    const quoteCreateJson = await quoteCreateRes.json();
    const quoteNumber: string = quoteCreateJson.proposal?.quoteNumber;
    const originalExpiresAt: string = quoteCreateJson.proposal?.expiresAt;
    if (quoteNumber) {
      createdQuoteNumbers.push(quoteNumber);
      createdUserEmail = qaEmail.toLowerCase();
    }

    assert(
      quoteCreateRes.status === 201 &&
        quoteCreateJson.success &&
        /^QTE-\d{8}-\d{4}$/.test(quoteNumber) &&
        Number(quoteCreateJson.proposal?.versions?.[0]?.quotedAmount) === 199500 &&
        Number(quoteCreateJson.proposal?.versions?.[0]?.advanceRequired) === 49875 &&
        Number(quoteCreateJson.proposal?.versions?.[0]?.deliveryCharge) === 4500,
      "Admin creates multi-line-item proposal with exact 25% advance calculation (₹1,99,500 / ₹49,875)",
      "QOT-02",
      JSON.stringify(quoteCreateJson)
    );

    const updatedInqRow = await prisma.bulkInquiry.findUnique({ where: { id: inqId } });
    assert(
      updatedInqRow?.status === "QUOTE_ISSUED",
      "Originating BulkInquiry automatically transitions to QUOTE_ISSUED",
      "QOT-02",
      `status=${updatedInqRow?.status}`
    );

    const propMailV1 = await waitForMailpitSubject(qaEmail, `Architectural Proposal — ${quoteNumber}`);
    const propMailV1Body = propMailV1 ? await fetchMailpitBody(propMailV1.ID) : "";
    assert(
      !!propMailV1 &&
        propMailV1Body.includes("Tavistra") &&
        !propMailV1Body.includes("VDesign") &&
        !propMailV1Body.toLowerCase().includes("commission") &&
        propMailV1Body.includes("Aurelia Sculptural Brass Wall Mirror") &&
        propMailV1Body.includes(`/quote/${quoteNumber}`),
      "Proposal email sent via Mailpit with Tavistra branding, line items, and review link",
      "QOT-03",
      propMailV1 ? propMailV1.Subject : "not found in Mailpit"
    );

    // ------------------------------------------------------------------
    // SECTION 3: Customer Proposal Page & Not Found Gate (QOT-04, SEC-03)
    // ------------------------------------------------------------------
    const propGetRes = await fetch(`${STOREFRONT_URL}/api/quotes/${encodeURIComponent(quoteNumber)}`);
    const propGetJson = await propGetRes.json();
    assert(
      propGetRes.ok &&
        Array.isArray(propGetJson.lineItems) &&
        propGetJson.lineItems.length === 2 &&
        propGetJson.daysRemaining >= 29 &&
        propGetJson.daysRemaining <= 31 &&
        propGetJson.isExpired === false &&
        propGetJson.isAccepted === false,
      "Customer quote API returns 2 structured line items and active 30-day clock",
      "QOT-04",
      `days=${propGetJson.daysRemaining}, items=${propGetJson.lineItems?.length}`
    );

    const propHtmlRes = await fetch(`${STOREFRONT_URL}/quote/${encodeURIComponent(quoteNumber)}`);
    assert(
      propHtmlRes.status === 200,
      "Customer proposal page /quote/[quoteNumber] renders HTTP 200",
      "QOT-04",
      `status=${propHtmlRes.status}`
    );

    const missingApiRes = await fetch(`${STOREFRONT_URL}/api/quotes/NON-EXISTENT-QUOTE`);
    const missingPageRes = await fetch(`${STOREFRONT_URL}/quote/NON-EXISTENT-QUOTE`);
    const missingPageHtml = await missingPageRes.text();
    assert(
      missingApiRes.status === 404 &&
        missingPageRes.status === 200 &&
        (missingPageHtml.includes("Loading formal proposal") || missingPageHtml.includes("Tavistra")),
      "Non-existent quote returns API 404 and clean Storefront fallback shell",
      "SEC-03",
      `apiStatus=${missingApiRes.status}, pageStatus=${missingPageRes.status}`
    );

    // ------------------------------------------------------------------
    // SECTION 4: Proposal Revision N+1 & 30-Day Clock Preservation (QOT-05)
    // ------------------------------------------------------------------
    const lineItemsV2 = [
      ...lineItemsV1,
      {
        name: "Bespoke Fluted Bronze Pedestal Sconce",
        finish: "Warm Satin Bronze",
        quantity: 4,
        unitPriceRupees: 7500,
      },
    ];
    // Expected V2 total: 199500 + (4 * 7500) = 229500; 25% advance = 57375; 75% balance = 172125
    const revRes = await fetch(`${ADMIN_URL}/api/quotes/${encodeURIComponent(quoteNumber)}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lineItems: lineItemsV2,
        deliveryChargeRupees: 4500,
        estimatedLeadDays: 49,
        notes: "Added 4 matching bronze pedestal sconces per V2 architect revision.",
        staffName: "Senior Curator",
      }),
    });
    const revJson = await revRes.json();
    const revExpiresAt: string = revJson.proposal?.expiresAt;
    assert(
      revRes.ok &&
        revJson.success &&
        revJson.version?.versionNumber === 2 &&
        Number(revJson.version?.quotedAmount) === 229500 &&
        Number(revJson.version?.advanceRequired) === 57375 &&
        new Date(revExpiresAt).getTime() === new Date(originalExpiresAt).getTime(),
      "Revision V2 updates quote total to ₹2,29,500 while strictly preserving original 30-day expiresAt",
      "QOT-05",
      `origExp=${originalExpiresAt}, revExp=${revExpiresAt}, v=${revJson.version?.versionNumber}`
    );

    // ------------------------------------------------------------------
    // SECTION 5: Exact-Version Acceptance & MTO Order Conversion (QOT-06, QOT-07)
    // ------------------------------------------------------------------
    const staleAcceptRes = await fetch(`${STOREFRONT_URL}/api/quotes/${encodeURIComponent(quoteNumber)}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acceptedVersionNumber: 1 }),
    });
    assert(
      staleAcceptRes.status === 409,
      "Stale revision V1 acceptance blocked cleanly with 409 Conflict when V2 exists",
      "QOT-06",
      `status=${staleAcceptRes.status}`
    );

    const acceptRes = await fetch(`${STOREFRONT_URL}/api/quotes/${encodeURIComponent(quoteNumber)}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acceptedVersionNumber: 2 }),
    });
    const acceptJson = await acceptRes.json();
    const convertedOrderNumber: string = acceptJson.orderNumber;
    if (convertedOrderNumber) createdOrderNumbers.push(convertedOrderNumber);

    assert(
      acceptRes.ok &&
        acceptJson.success &&
        /^TAV-QTE-\d{8}-\d{4}$/.test(convertedOrderNumber) &&
        Number(acceptJson.amountPaidRupees) === 57375 &&
        Number(acceptJson.balanceDueRupees) === 172125,
      "Exact-version V2 acceptance atomically creates confirmed TAV-QTE order with 25% paid & 75% due",
      "QOT-06",
      JSON.stringify(acceptJson)
    );

    const dbOrder = await prisma.order.findUnique({
      where: { orderNumber: convertedOrderNumber },
      include: { shippingAddress: true, payments: true },
    });
    assert(
      !!dbOrder &&
        dbOrder.purchaseMode === "MADE_TO_ORDER" &&
        dbOrder.status === "CONFIRMED" &&
        Number(dbOrder.itemsSubtotal) === 225000 &&
        Number(dbOrder.shippingCharge) === 4500 &&
        Number(dbOrder.totalAmount) === 229500 &&
        dbOrder.shippingAddress.city.toLowerCase().includes("bengaluru") &&
        dbOrder.payments.some((p) => p.paymentType === "QUOTE_ADVANCE" && p.status === "COMPLETED"),
      "Converted Order splits itemsSubtotal (₹2,25,000) + delivery (₹4,500), resolves Bengaluru PIN, and logs QUOTE_ADVANCE payment",
      "QOT-06",
      JSON.stringify({
        mode: dbOrder?.purchaseMode,
        sub: dbOrder?.itemsSubtotal,
        ship: dbOrder?.shippingCharge,
        city: dbOrder?.shippingAddress?.city,
      })
    );

    // Duplicate acceptance blocked
    const dupAcceptRes = await fetch(`${STOREFRONT_URL}/api/quotes/${encodeURIComponent(quoteNumber)}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acceptedVersionNumber: 2 }),
    });
    assert(
      dupAcceptRes.status === 400,
      "Duplicate proposal acceptance is rejected with 400",
      "QOT-06",
      `status=${dupAcceptRes.status}`
    );

    // Customer GET returns linkedOrderNumber
    const afterAcceptGet = await (await fetch(`${STOREFRONT_URL}/api/quotes/${encodeURIComponent(quoteNumber)}`)).json();
    assert(
      afterAcceptGet.isAccepted === true && afterAcceptGet.linkedOrderNumber === convertedOrderNumber,
      "Proposal GET reflects ACCEPTED state and returns linkedOrderNumber",
      "QOT-06",
      `linkedOrder=${afterAcceptGet.linkedOrderNumber}`
    );

    // Mailpit post-acceptance email
    const acceptMail = await waitForMailpitSubject(qaEmail, `Proposal Accepted & 25% Advance Verified — ${convertedOrderNumber}`);
    assert(
      !!acceptMail,
      "Mailpit received post-acceptance 25% advance confirmation email",
      "QOT-07",
      acceptMail ? acceptMail.Subject : "not found in Mailpit"
    );

    // Verify order is trackable on /api/orders and displays independent grace window
    const trackApiRes = await fetch(
      `${STOREFRONT_URL}/api/orders?orderId=${encodeURIComponent(convertedOrderNumber)}&contact=${encodeURIComponent(qaEmail)}`
    );
    const trackApiJson = await trackApiRes.json();
    assert(
      trackApiRes.ok && trackApiJson.found && trackApiJson.order?.balanceDueRupees === 172125,
      "Converted TAV-QTE order is immediately queryable in tracking API with ₹1,72,125 balance due",
      "QOT-07",
      JSON.stringify(trackApiJson.order || {})
    );

    // ------------------------------------------------------------------
    // SECTION 6: Expired Proposal Negative Gate (QOT-08)
    // ------------------------------------------------------------------
    const expCreateRes = await fetch(`${ADMIN_URL}/api/quotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Expired Offer Test",
        customerEmail: qaEmail,
        customerPhone: qaPhone,
        deliveryPincode: "110001",
        lineItems: [{ name: "Test Piece", finish: "Brass", quantity: 1, unitPriceRupees: 40000 }],
        deliveryChargeRupees: 1000,
        estimatedLeadDays: 21,
      }),
    });
    const expCreateJson = await expCreateRes.json();
    const expiredQuoteNumber: string = expCreateJson.proposal?.quoteNumber;
    if (expiredQuoteNumber) createdQuoteNumbers.push(expiredQuoteNumber);

    // Simulate Day 31 past expiry
    await prisma.quoteProposal.update({
      where: { quoteNumber: expiredQuoteNumber },
      data: { expiresAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    });

    const expRevRes = await fetch(`${ADMIN_URL}/api/quotes/${encodeURIComponent(expiredQuoteNumber)}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lineItems: [{ name: "Test Piece", finish: "Brass", quantity: 1, unitPriceRupees: 45000 }],
        deliveryChargeRupees: 1000,
      }),
    });
    assert(
      expRevRes.status === 400,
      "Expired quote cannot be revised silently to extend deadline",
      "QOT-08",
      `status=${expRevRes.status}`
    );

    const expAcceptRes = await fetch(`${STOREFRONT_URL}/api/quotes/${encodeURIComponent(expiredQuoteNumber)}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acceptedVersionNumber: 1 }),
    });
    assert(
      expAcceptRes.status === 400,
      "Expired quote acceptance is blocked with 400",
      "QOT-08",
      `status=${expAcceptRes.status}`
    );

    const expGetJson = await (await fetch(`${STOREFRONT_URL}/api/quotes/${encodeURIComponent(expiredQuoteNumber)}`)).json();
    assert(
      expGetJson.isExpired === true && expGetJson.daysRemaining === 0 && expGetJson.proposal?.status === "EXPIRED",
      "Expired quote auto-transitions to EXPIRED with 0 daysRemaining",
      "QOT-08",
      `status=${expGetJson.proposal?.status}, isExpired=${expGetJson.isExpired}`
    );
  } finally {
    // Cleanup QA fixtures
    for (const oNum of createdOrderNumbers) {
      await prisma.payment.deleteMany({ where: { order: { orderNumber: oNum } } }).catch(() => {});
      await prisma.orderItem.deleteMany({ where: { order: { orderNumber: oNum } } }).catch(() => {});
      await prisma.order.deleteMany({ where: { orderNumber: oNum } }).catch(() => {});
    }
    for (const qNum of createdQuoteNumbers) {
      await prisma.auditLog.deleteMany({ where: { entityId: qNum } }).catch(() => {});
      await prisma.quoteProposal.deleteMany({ where: { quoteNumber: qNum } }).catch(() => {});
    }
    for (const iNum of createdInquiryNumbers) {
      await prisma.auditLog.deleteMany({ where: { entityId: iNum } }).catch(() => {});
      await prisma.bulkInquiry.deleteMany({ where: { inquiryNumber: iNum } }).catch(() => {});
    }
    if (createdUserEmail) {
      const user = await prisma.user.findUnique({ where: { email: createdUserEmail } });
      if (user) {
        await prisma.customerAddress.deleteMany({ where: { userId: user.id } }).catch(() => {});
        await prisma.user.deleteMany({ where: { id: user.id } }).catch(() => {});
      }
    }
    await prisma.$disconnect();
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`\n=======================================================`);
  console.log(`  SET 6 SUMMARY: ${passedCount}/${results.length} PASSED (${failedCount} FAILED)`);
  console.log(`=======================================================`);
  if (failedCount > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal error running Set 6 suite:", err);
  process.exit(1);
});


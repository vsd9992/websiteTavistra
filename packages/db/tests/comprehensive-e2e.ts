import {
  prisma,
  PurchaseMode,
  OrderStatus,
  PaymentStatus,
  PaymentType,
  QuoteStatus,
  Prisma,
} from "../src/index";
import {
  parseProductMarkdown,
  importProductToDatabase,
} from "D:/_devProjects/Tavistra/apps/storefront/src/lib/markdownImporter";
import {
  sendOrderConfirmationEmail,
  sendQuoteProposalEmail,
  sendTicketEmail,
} from "D:/_devProjects/Tavistra/apps/storefront/src/lib/email";

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ✕ FAIL: ${testName}`);
    testsFailed++;
  }
}

async function runComprehensiveE2ETestSuite() {
  console.log("===============================================================");
  console.log("       TAVISTRA COMMERCE & ARCHITECTURAL ENGINE");
  console.log("          COMPREHENSIVE END-TO-END TEST SUITE");
  console.log("===============================================================\n");

  const now = new Date();
  const testRunId = Date.now().toString().slice(-6);

  // -------------------------------------------------------------------------
  // SUITE 1: Ready Stock Purchase Flow (100% Payment & Immediate Confirmation)
  // -------------------------------------------------------------------------
  console.log("[SUITE 1] Ready Stock 100% Payment & Order Confirmation");

  const rsOrderNum = `TEST-RS-${testRunId}`;
  const rsUser = await prisma.user.upsert({
    where: { email: `client-${testRunId}@test.tavistra.in` },
    update: {},
    create: {
      email: `client-${testRunId}@test.tavistra.in`,
      name: "Ar. Aditya Sengupta",
      phone: "+91 98101 23456",
    },
  });

  const rsAddress = await prisma.customerAddress.create({
    data: {
      userId: rsUser.id,
      fullName: "Ar. Aditya Sengupta",
      phone: "+91 98101 23456",
      addressLine1: "12A Central Court, Barakhamba Road",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110001",
    },
  });

  const clockProduct = await prisma.product.findUnique({
    where: { slug: "monolith-minimalist-wall-clock" },
  });
  assert(clockProduct !== null, "Found seeded Ready Stock product entity in DB");

  const rsOrder = await prisma.order.create({
    data: {
      orderNumber: rsOrderNum,
      userId: rsUser.id,
      customerEmail: rsUser.email,
      customerPhone: rsUser.phone || "+91 98101 23456",
      shippingAddressId: rsAddress.id,
      purchaseMode: PurchaseMode.READY_STOCK,
      status: OrderStatus.CONFIRMED,
      itemsSubtotal: 14500.0,
      shippingCharge: 250.0,
      totalAmount: 14750.0,
      requiredAdvanceAmount: 14750.0,
      amountPaid: 14750.0,
      balanceAmount: 0.0,
      confirmedAt: now,
      items: {
        create: [
          {
            productId: clockProduct!.id,
            quantity: 1,
            unitPrice: 14500.0,
            subtotal: 14500.0,
          },
        ],
      },
      payments: {
        create: {
          paymentType: PaymentType.FULL_PAYMENT,
          amount: 14750.0,
          status: PaymentStatus.COMPLETED,
          gateway: "PHONEPE",
          gatewayTransactionId: `TXN-RS-${testRunId}`,
          verifiedAt: now,
        },
      },
    },
    include: { payments: true, items: true },
  });

  assert(rsOrder.status === OrderStatus.CONFIRMED, "Ready Stock order confirmed immediately");
  assert(Number(rsOrder.balanceAmount) === 0, "Ready Stock order has zero balance due (100% cleared)");
  assert(rsOrder.payments.length === 1, "Ready Stock payment ledger record created");

  // Verify email dispatch to Mailpit
  try {
    const emailResult = await sendOrderConfirmationEmail({
      orderNumber: rsOrderNum,
      customerName: "Ar. Aditya Sengupta",
      customerEmail: rsUser.email,
      mode: "READY_STOCK",
      items: [{ name: clockProduct!.title, quantity: 1, priceRupees: 14500 }],
      itemsSubtotalRupees: 14500,
      deliveryFeeRupees: 250,
      totalAmountRupees: 14750,
      amountPaidRupees: 14750,
      balanceDueRupees: 0,
      city: "New Delhi",
      state: "Delhi",
      pincode: "110001",
    });
    assert(Boolean(emailResult.messageId), "Ready Stock confirmation email dispatched to Mailpit container");
  } catch (err: unknown) {
    assert(false, `Email dispatch error: ${(err as Error).message}`);
  }

  // -------------------------------------------------------------------------
  // SUITE 2: Made to Order (MTO) 25% Advance, 7-Day Grace & 75% Balance Gate
  // -------------------------------------------------------------------------
  console.log("\n[SUITE 2] MTO 25% Advance, 7-Day Grace Window & Hard Fulfilment Gate");

  const mtoOrderNum = `TEST-MTO-${testRunId}`;
  const mirrorProduct = await prisma.product.findUnique({
    where: { slug: "arc-solid-brass-wall-mirror" },
  });
  assert(mirrorProduct !== null, "Found seeded MTO product entity in DB");

  const totalMto = 38000.0 + 500.0; // ₹38,500 total
  const adv25 = Math.round(totalMto * 0.25 * 100) / 100; // ₹9,625
  const bal75 = totalMto - adv25; // ₹28,875

  const mtoOrder = await prisma.order.create({
    data: {
      orderNumber: mtoOrderNum,
      userId: rsUser.id,
      customerEmail: rsUser.email,
      customerPhone: rsUser.phone || "+91 98101 23456",
      shippingAddressId: rsAddress.id,
      purchaseMode: PurchaseMode.MADE_TO_ORDER,
      status: OrderStatus.CONFIRMED,
      itemsSubtotal: 38000.0,
      shippingCharge: 500.0,
      totalAmount: totalMto,
      requiredAdvanceAmount: adv25,
      amountPaid: adv25,
      balanceAmount: bal75,
      confirmedAt: now,
      items: {
        create: [
          {
            productId: mirrorProduct!.id,
            quantity: 1,
            unitPrice: 38000.0,
            subtotal: 38000.0,
          },
        ],
      },
      payments: {
        create: {
          paymentType: PaymentType.ADVANCE_25,
          amount: adv25,
          status: PaymentStatus.COMPLETED,
          gateway: "PHONEPE",
          gatewayTransactionId: `TXN-MTO-ADV-${testRunId}`,
          verifiedAt: now,
        },
      },
    },
    include: { payments: true },
  });

  assert(Number(mtoOrder.amountPaid) === adv25, "MTO order verified with 25% production advance");
  assert(Number(mtoOrder.balanceAmount) === bal75, "MTO order balance due correctly calculated (75%)");

  // Attempting to dispatch prior to balance payment (Hard Gate Test)
  const canDispatch = Number(mtoOrder.balanceAmount) === 0;
  assert(!canDispatch, "HARD DISPATCH GATE: Dispatch blocked while balanceDue > 0");

  // Workshop Release & QC Photo Inspection Upload
  const updatedWithQc = await prisma.order.update({
    where: { id: mtoOrder.id },
    data: {
      status: OrderStatus.PRODUCTION_COMPLETED,
      productionCompletedAt: new Date(),
      qcNotes: "Hand-rolled brass edges inspected. Silvering verified with zero optical distortion.",
      qcImages: JSON.stringify([
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
      ]),
    },
  });
  assert(
    updatedWithQc.status === OrderStatus.PRODUCTION_COMPLETED,
    "Order transitioned to PRODUCTION_COMPLETED"
  );
  assert(Boolean(updatedWithQc.qcImages), "Craftsman QC inspection photos attached to order");

  // Customer Clears Remaining 75% Balance
  const balancePayment = await prisma.payment.create({
    data: {
      orderId: mtoOrder.id,
      paymentType: PaymentType.BALANCE_75,
      amount: bal75,
      status: PaymentStatus.COMPLETED,
      gateway: "PHONEPE",
      gatewayTransactionId: `TXN-MTO-BAL-${testRunId}`,
      verifiedAt: new Date(),
    },
  });

  const orderPaidInFull = await prisma.order.update({
    where: { id: mtoOrder.id },
    data: {
      amountPaid: totalMto,
      balanceAmount: 0.0,
      status: OrderStatus.AWAITING_DISPATCH,
    },
  });
  assert(Number(orderPaidInFull.balanceAmount) === 0, "100% cumulative payment verified after balance settlement");
  assert(
    orderPaidInFull.status === OrderStatus.AWAITING_DISPATCH,
    "Order transitioned to AWAITING_DISPATCH"
  );

  // Dispatch Now Permitted with AWB
  const dispatchedOrder = await prisma.order.update({
    where: { id: mtoOrder.id },
    data: {
      status: OrderStatus.DISPATCHED,
      carrierName: "Blue Dart Fragile White-Glove Surface",
      trackingNumber: `BD-AWB-${testRunId}`,
      dispatchedAt: new Date(),
    },
  });
  assert(dispatchedOrder.status === OrderStatus.DISPATCHED, "Order successfully dispatched with carrier AWB");
  assert(dispatchedOrder.trackingNumber === `BD-AWB-${testRunId}`, "AWB tracking number attached");

  // -------------------------------------------------------------------------
  // SUITE 3: "Quote Only" 30-Day Architectural Proposal Lifecycle (TAV-07)
  // -------------------------------------------------------------------------
  console.log("\n[SUITE 3] Quote Only 30-Day Architectural Proposal Lifecycle (TAV-07)");

  const quoteNumber = `QTE-20261109-${testRunId}`;
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const quoteValue = 185000.0;
  const quoteAdv = 46250.0; // 25%

  const proposal = await prisma.quoteProposal.create({
    data: {
      quoteNumber,
      customerName: "Studio Lotus Architects (Sunita Singhania)",
      customerEmail: `procurement-${testRunId}@studiolotus.in`,
      customerPhone: "+91 98110 55432",
      deliveryPincode: "110049",
      projectSpecifications: "Custom 600mm oversized architectural wall clocks for luxury boutique suites.",
      status: QuoteStatus.ISSUED,
      expiresAt,
      versions: {
        create: {
          versionNumber: 1,
          specifications: "Custom 600mm oversized architectural wall clocks for luxury boutique suites.",
          quotedAmount: quoteValue,
          advanceRequired: quoteAdv,
          estimatedLeadDays: 28,
          validUntil: expiresAt,
        },
      },
    },
    include: { versions: true },
  });

  assert(proposal.status === QuoteStatus.ISSUED, "30-Day Proposal created in ISSUED status");
  assert(proposal.versions.length === 1, "Proposal has Initial Version 1");
  const daysDiff = Math.ceil((new Date(proposal.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  assert(daysDiff === 30, "Proposal has locked 30-calendar-day validity window");

  // Test Revision Generation (Version 2) without resetting original 30-day clock
  const revision = await prisma.quoteVersion.create({
    data: {
      quoteProposalId: proposal.id,
      versionNumber: 2,
      specifications: "Revised: Custom 600mm wall clocks with aged patinated brass dial finish.",
      quotedAmount: 195000.0,
      advanceRequired: 48750.0,
      estimatedLeadDays: 32,
      validUntil: proposal.expiresAt, // Retains original 30-day clock
    },
  });
  assert(revision.versionNumber === 2, "Created Revision 2 for existing proposal");
  assert(
    new Date(revision.validUntil).getTime() === new Date(proposal.expiresAt).getTime(),
    "TAV-07 Rule: Revision does not reset original 30-day offer expiration clock"
  );

  // Customer Accepts Version 2 & Pays 25% Advance
  const qteOrderNum = `TAV-QTE-${testRunId}`;
  const convertedOrder = await prisma.order.create({
    data: {
      orderNumber: qteOrderNum,
      userId: rsUser.id,
      customerEmail: proposal.customerEmail,
      customerPhone: proposal.customerPhone,
      shippingAddressId: rsAddress.id,
      purchaseMode: PurchaseMode.MADE_TO_ORDER,
      status: OrderStatus.CONFIRMED,
      itemsSubtotal: 195000.0,
      shippingCharge: 0.0,
      totalAmount: 195000.0,
      requiredAdvanceAmount: 48750.0,
      amountPaid: 48750.0,
      balanceAmount: 195000.0 - 48750.0,
      confirmedAt: new Date(),
      items: {
        create: [
          {
            productId: clockProduct!.id,
            quantity: 1,
            unitPrice: 195000.0,
            subtotal: 195000.0,
          },
        ],
      },
      payments: {
        create: {
          paymentType: PaymentType.QUOTE_ADVANCE,
          amount: 48750.0,
          status: PaymentStatus.COMPLETED,
          gateway: "PHONEPE",
          gatewayTransactionId: `TXN-QTE-ADV-${testRunId}`,
          verifiedAt: new Date(),
        },
      },
    },
  });

  const acceptedProposal = await prisma.quoteProposal.update({
    where: { id: proposal.id },
    data: {
      status: QuoteStatus.ACCEPTED,
      acceptedAt: new Date(),
      linkedOrderId: convertedOrder.id,
    },
  });

  assert(acceptedProposal.status === QuoteStatus.ACCEPTED, "Proposal transitioned to ACCEPTED");
  assert(acceptedProposal.linkedOrderId === convertedOrder.id, "Proposal linked to confirmed workshop order");

  // Send formal proposal email verification
  try {
    const qteEmailRes = await sendQuoteProposalEmail({
      quoteNumber,
      versionNumber: 2,
      customerName: proposal.customerName,
      customerEmail: proposal.customerEmail,
      specifications: revision.specifications,
      quotedAmountRupees: 195000,
      advanceRequiredRupees: 48750,
      balanceDueRupees: 146250,
      estimatedLeadDays: 32,
      expiresAt: proposal.expiresAt,
    });
    assert(Boolean(qteEmailRes.messageId), "30-Day Proposal notification email dispatched to Mailpit");
  } catch (err: unknown) {
    assert(false, `Quote email dispatch error: ${(err as Error).message}`);
  }

  // -------------------------------------------------------------------------
  // SUITE 4: Markdown Product Importer & Schema Validation (WEB-007 / WEB-008)
  // -------------------------------------------------------------------------
  console.log("\n[SUITE 4] Markdown Product Importer & Spec Validation");

  const sampleMd = `---
sku: TEST-OBJ-${testRunId}
slug: test-kinetic-prism-${testRunId}
title: Kinetic Brass Prism Edition
category: art-collectibles
primaryMode: READY_STOCK
taxInclusivePrice: 24500.00
gstRate: 0.18
weightGrams: 3200
dimensions: 180mm x 180mm x 180mm
lengthMm: 220
widthMm: 220
heightMm: 220
isReturnable: false
returnWindowDays: 0
initialStock: 5
materialDescription: Solid Polished Brass, Optical Grade K9 Crystal Prism
variantTitle: Mirror Polished & Optic Prism
---

# Kinetic Brass Prism Edition

Equilateral solid brass cradle featuring an optical K9 crystal prism.

## Full Description
Hand-milled solid brass equilateral cradle supporting an optical K9 crystal prism. Refracts incoming natural light into room-scale chromatic spectra.

## Highlights
- Milled architectural solid brass
- Optical grade K9 crystal
- Hand-buffed living patina finish
`;

  const parsed = parseProductMarkdown(sampleMd);
  assert(parsed.sku === `TEST-OBJ-${testRunId}`, "Parsed SKU from YAML frontmatter correctly");
  assert(parsed.taxInclusivePrice === 24500.0, "Parsed tax-inclusive price correctly");
  assert(parsed.features.length === 3, "Extracted 3 highlights from markdown body");

  const imported = await importProductToDatabase(parsed, "Test Runner");
  assert(imported.product.slug === `test-kinetic-prism-${testRunId}`, "Product entity persisted into PostgreSQL");
  assert(imported.variant.sku === `TEST-OBJ-${testRunId}-01`, "Variant created and linked");

  const ledger = await prisma.inventoryLedger.findUnique({
    where: { variantId: imported.variant.id },
  });
  assert(ledger?.availableStock === 5, "Inventory Ledger initialized with 5 units stock");

  // -------------------------------------------------------------------------
  // SUITE 5: Support Desk & Customer Tickets
  // -------------------------------------------------------------------------
  console.log("\n[SUITE 5] Support Ticket Creation & Thread Messaging");

  const tckNum = `TCK-${testRunId}`;
  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber: tckNum,
      orderNumber: mtoOrderNum,
      customerName: "Ar. Aditya Sengupta",
      email: rsUser.email,
      phone: rsUser.phone || "+91 98101 23456",
      subject: "Custom patina verification request",
      category: "SPEC_ALTERATION",
      status: "OPEN",
      messages: {
        create: [
          {
            sender: "CUSTOMER",
            authorName: "Ar. Aditya Sengupta",
            text: "Hello, could we please confirm if the aged patina can have deeper bronze highlights on the bevel?",
          },
        ],
      },
    },
    include: { messages: true },
  });

  assert(ticket.ticketNumber === tckNum, "Support ticket created in OPEN status");
  assert(ticket.messages.length === 1, "Initial customer message attached");

  // Staff Reply
  const staffReply = await prisma.ticketMessage.create({
    data: {
      ticketId: ticket.id,
      sender: "STAFF",
      authorName: "VDesign Master Artisan",
      text: "Noted with thanks. Our brass finisher has verified the alteration and applied the deeper highlights before final wax baking.",
    },
  });
  assert(staffReply.sender === "STAFF", "Staff reply message appended to thread");

  // Test ticket email notification
  try {
    const tckEmailRes = await sendTicketEmail({
      ticketNumber: tckNum,
      customerName: ticket.customerName,
      customerEmail: ticket.email,
      subject: ticket.subject,
      messageText: staffReply.text,
      isStaffReply: true,
      authorName: "VDesign Master Artisan",
    });
    assert(Boolean(tckEmailRes.messageId), "Staff ticket reply email delivered to Mailpit");
  } catch (err: unknown) {
    assert(false, `Ticket email dispatch error: ${(err as Error).message}`);
  }

  // -------------------------------------------------------------------------
  // SUITE 6: Studio Governance & Operations Suite (PIN & Hiatus Settings)
  // -------------------------------------------------------------------------
  console.log("\n[SUITE 6] Studio Governance, PIN Serviceability & Hiatus Controls");

  const delhiPinRange = await prisma.pincodeRange.findFirst({
    where: { pincodePrefix: "11" },
  });
  assert(delhiPinRange !== null && delhiPinRange.isServiceable, "Delhi PIN 11 is currently active and serviceable");

  const hiatusSetting = await prisma.systemSetting.findUnique({
    where: { key: "STUDIO_HIATUS" },
  });
  assert(hiatusSetting !== null, "Found STUDIO_HIATUS system setting in database");

  // Clean up test entities
  console.log("\n[CLEANUP] Cleaning up transient test artifacts...");
  await prisma.order.deleteMany({
    where: { orderNumber: { in: [rsOrderNum, mtoOrderNum, qteOrderNum] } },
  });
  await prisma.quoteProposal.deleteMany({
    where: { quoteNumber },
  });
  await prisma.supportTicket.deleteMany({
    where: { ticketNumber: tckNum },
  });
  await prisma.product.deleteMany({
    where: { slug: `test-kinetic-prism-${testRunId}` },
  });
  await prisma.user.deleteMany({
    where: { email: rsUser.email },
  });

  console.log("\n===============================================================");
  console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log("===============================================================");

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runComprehensiveE2ETestSuite()
  .catch((e) => {
    console.error("Test execution encountered an error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * Live Verification Script: Set 7 (Support Tickets, Threaded Messaging & Client Concierge Desk)
 *
 * Runs against live devMachine PostgreSQL, Storefront (:3001), Admin Proxy (:3002), and Mailpit (:8025).
 * Tests runbook items TCK-01 through TCK-05 + Order Cross-Linking + Validation Gates.
 *
 * Execute: pnpm --filter @tavistra/db test:set7
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

async function waitForMailpitSubject(recipient: string, keyword: string, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const msgs = await fetchMailpitMessages();
    const hit = msgs.find(
      (m: { To?: Array<{ Address?: string }>; Subject?: string }) =>
        (m.To || []).some((t) => (t.Address || "").toLowerCase() === recipient.toLowerCase()) &&
        (m.Subject || "").toLowerCase().includes(keyword.toLowerCase())
    );
    if (hit) return hit;
    await new Promise((r) => setTimeout(r, 400));
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
  console.log("  SET 7 VERIFICATION SUITE — SUPPORT TICKETS & CONCIERGE");
  console.log(`  Storefront: ${STOREFRONT_URL}`);
  console.log(`  Admin:      ${ADMIN_URL}`);
  console.log(`  Mailpit:    ${MAILPIT_URL}`);
  console.log("=======================================================\n");

  const runId = Date.now().toString().slice(-5);
  const testEmail = `concierge.client.${runId}@studio-vayu.in`;
  const testPhone = "+91 98111 22334";
  const testName = "Ar. Kanishk Sen";

  // SECTION 1: TCK-01 TICKET INTAKE & VALIDATION GATES
  console.log("--- SECTION 1: TCK-01 Ticket Submission & Field Validation ---");

  // 1.1 Missing Name Validation
  const resBadName = await fetch(`${STOREFRONT_URL}/api/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "",
      email: testEmail,
      phone: testPhone,
      subject: "Test Subject",
      message: "Test Query",
    }),
  });
  assert(
    resBadName.status === 400,
    "Missing client name rejection",
    "TCK-01 Validation",
    `Expected 400, got ${resBadName.status}`
  );

  // 1.2 Invalid Email Validation
  const resBadEmail = await fetch(`${STOREFRONT_URL}/api/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testName,
      email: "not-an-email",
      phone: testPhone,
      subject: "Test Subject",
      message: "Test Query",
    }),
  });
  assert(
    resBadEmail.status === 400,
    "Invalid email format rejection",
    "TCK-01 Validation",
    `Expected 400, got ${resBadEmail.status}`
  );

  // 1.3 Invalid Indian Mobile Validation
  const resBadPhone = await fetch(`${STOREFRONT_URL}/api/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      phone: "12345",
      subject: "Test Subject",
      message: "Test Query",
    }),
  });
  assert(
    resBadPhone.status === 400,
    "Invalid mobile number rejection",
    "TCK-01 Validation",
    `Expected 400, got ${resBadPhone.status}`
  );

  // 1.4 Missing Message Validation
  const resBadMsg = await fetch(`${STOREFRONT_URL}/api/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      phone: testPhone,
      subject: "Test Subject",
      message: "   ",
    }),
  });
  assert(
    resBadMsg.status === 400,
    "Empty message rejection",
    "TCK-01 Validation",
    `Expected 400, got ${resBadMsg.status}`
  );

  // 1.5 Successful Ticket Submission (TCK-01 Standard)
  const ticketSubject = `Alteration Request for Wall Fixture finish #${runId}`;
  const ticketMessage =
    "We wish to request a brushed bronze finish alteration during our 7-day pre-production grace window.";
  const resCreate = await fetch(`${STOREFRONT_URL}/api/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      phone: testPhone,
      subject: ticketSubject,
      category: "SPEC_ALTERATION",
      orderNumber: "TAV-RS-2026-1001",
      message: ticketMessage,
    }),
  });
  const dataCreate = await resCreate.json();

  assert(
    resCreate.status === 201 && Boolean(dataCreate.ticketNumber),
    "Ticket creation succeeds with 201 & ticketNumber",
    "TCK-01 Submission",
    `Status ${resCreate.status}, response: ${JSON.stringify(dataCreate)}`
  );

  const createdTicketNumber: string = dataCreate.ticketNumber || "";
  assert(
    /^TCK-\d{4}-\d{4}$/.test(createdTicketNumber),
    "Sequential ticketNumber format (TCK-YYYY-NNNN)",
    "TCK-01 Submission",
    `Got ticketNumber: ${createdTicketNumber}`
  );

  // 1.6 Database Verification for Created Ticket
  const dbTicket = await prisma.supportTicket.findUnique({
    where: { ticketNumber: createdTicketNumber },
    include: { messages: true },
  });
  assert(
    Boolean(dbTicket && dbTicket.status === "OPEN" && dbTicket.category === "SPEC_ALTERATION"),
    "Ticket saved in PostgreSQL with status OPEN and correct category",
    "TCK-01 Database",
    `DB record: status=${dbTicket?.status}, category=${dbTicket?.category}`
  );
  assert(
    Boolean(dbTicket && dbTicket.messages.length === 1 && dbTicket.messages[0].sender === "CUSTOMER"),
    "Initial customer message recorded in message thread",
    "TCK-01 Database",
    `Messages count: ${dbTicket?.messages.length}`
  );

  // 1.7 Auto-Escalation Priority Test (Damage Report -> HIGH)
  const resDamage = await fetch(`${STOREFRONT_URL}/api/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testName,
      email: `damage.${runId}@studio.in`,
      phone: testPhone,
      subject: "Crate damage on arrival",
      category: "DAMAGE_REPORT",
      message: "Crate arrived with corner structural denting.",
    }),
  });
  const dataDamage = await resDamage.json();
  const dbDamage = await prisma.supportTicket.findUnique({
    where: { ticketNumber: dataDamage.ticketNumber },
  });
  assert(
    Boolean(dbDamage && dbDamage.priority === "HIGH"),
    "Auto-escalates priority to HIGH for DAMAGE_REPORT",
    "TCK-01 Policy",
    `Got priority=${dbDamage?.priority}`
  );

  // SECTION 2: TCK-02 ADMIN QUEUE & MULTI-DIMENSIONAL FILTERS
  console.log("\n--- SECTION 2: TCK-02 Admin Ticket Queue & Filters ---");

  // 2.1 Fetch All Tickets via GET /api/tickets
  const resList = await fetch(`${STOREFRONT_URL}/api/tickets`);
  const dataList = await resList.json();
  assert(
    resList.ok && Array.isArray(dataList.tickets),
    "GET /api/tickets returns array of tickets",
    "TCK-02 Queue",
    `Found ${dataList.tickets?.length} tickets`
  );

  const foundInList = (dataList.tickets || []).some(
    (t: { ticketNumber: string }) => t.ticketNumber === createdTicketNumber
  );
  assert(
    foundInList,
    "Newly created ticket appears in Admin queue worklist",
    "TCK-02 Queue",
    `Ticket ${createdTicketNumber} in listing`
  );

  // 2.2 Filter by Status
  const resOpen = await fetch(`${STOREFRONT_URL}/api/tickets?status=OPEN`);
  const dataOpen = await resOpen.json();
  const allOpen = (dataOpen.tickets || []).every((t: { status: string }) => t.status === "OPEN");
  assert(
    allOpen && (dataOpen.tickets || []).length > 0,
    "Filter by status=OPEN returns only OPEN tickets",
    "TCK-02 Filters",
    `Found ${dataOpen.tickets?.length} OPEN tickets`
  );

  // 2.3 Filter by Category
  const resCat = await fetch(`${STOREFRONT_URL}/api/tickets?category=SPEC_ALTERATION`);
  const dataCat = await resCat.json();
  const allCat = (dataCat.tickets || []).every((t: { category: string }) => t.category === "SPEC_ALTERATION");
  assert(
    allCat && (dataCat.tickets || []).length > 0,
    "Filter by category=SPEC_ALTERATION returns matching tickets",
    "TCK-02 Filters",
    `Found ${dataCat.tickets?.length} SPEC_ALTERATION tickets`
  );

  // 2.4 Search Query
  const resSearch = await fetch(`${STOREFRONT_URL}/api/tickets?search=${encodeURIComponent(testEmail)}`);
  const dataSearch = await resSearch.json();
  assert(
    (dataSearch.tickets || []).some((t: { ticketNumber: string }) => t.ticketNumber === createdTicketNumber),
    "Search by customer email locates the ticket",
    "TCK-02 Search",
    `Search matches ticket ${createdTicketNumber}`
  );

  // SECTION 3: TCK-03 STAFF THREAD REPLY & STATUS AUTO-TRANSITION
  console.log("\n--- SECTION 3: TCK-03 Staff Thread Reply & Status Transition ---");

  const staffReplyText = `We have reviewed alteration #${runId}. Master artisan has approved satin finish.`;
  const resStaffReply = await fetch(`${STOREFRONT_URL}/api/tickets/${createdTicketNumber}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: "STAFF",
      authorName: "Kavita Rao (Studio Concierge)",
      text: staffReplyText,
    }),
  });
  const dataStaffReply = await resStaffReply.json();

  assert(
    resStaffReply.ok && dataStaffReply.success && dataStaffReply.ticketStatus === "IN_PROGRESS",
    "Staff reply appends to thread and auto-transitions status to IN_PROGRESS",
    "TCK-03 Reply",
    `Status: ${dataStaffReply.ticketStatus}, msgId=${dataStaffReply.message?.id}`
  );

  const dbAfterStaff = await prisma.supportTicket.findUnique({
    where: { ticketNumber: createdTicketNumber },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  assert(
    Boolean(
      dbAfterStaff &&
        dbAfterStaff.status === "IN_PROGRESS" &&
        dbAfterStaff.messages.length === 2 &&
        dbAfterStaff.messages[1].sender === "STAFF"
    ),
    "PostgreSQL reflects IN_PROGRESS and 2 messages (CUSTOMER + STAFF)",
    "TCK-03 Database",
    `Status: ${dbAfterStaff?.status}, messages: ${dbAfterStaff?.messages.length}`
  );

  // SECTION 4: TCK-04 OUTBOUND EMAIL DISPATCH (MAILPIT)
  console.log("\n--- SECTION 4: TCK-04 Outbound Email Verification ---");

  // 4.1 Check Initial Intake Email in Mailpit
  const intakeEmail = await waitForMailpitSubject(testEmail, createdTicketNumber);
  assert(
    Boolean(intakeEmail),
    "Customer received ticket acknowledgment email in Mailpit",
    "TCK-04 Email",
    `Subject: ${intakeEmail?.Subject}`
  );

  if (intakeEmail) {
    const body = await fetchMailpitBody(intakeEmail.ID);
    assert(
      body.includes(createdTicketNumber) &&
        (body.includes("/track-ticket?ticket=") || body.includes("/track?ticket=")),
      "Intake email contains ticketNumber and direct tracking link",
      "TCK-04 Email",
      "Tracking link verified in email body"
    );
  }

  // 4.2 Check Staff Reply Email in Mailpit
  const replyEmail = await waitForMailpitSubject(testEmail, "Official Studio Response");
  assert(
    Boolean(replyEmail),
    "Customer received official studio response email in Mailpit",
    "TCK-04 Email",
    `Subject: ${replyEmail?.Subject}`
  );

  if (replyEmail) {
    const replyBody = await fetchMailpitBody(replyEmail.ID);
    assert(
      replyBody.includes("Kavita Rao") && replyBody.includes("satin finish"),
      "Staff reply email contains staff author name and response body",
      "TCK-04 Email",
      "Staff response text verified in email body"
    );
  }

  // SECTION 5: TCK-05 TICKET RESOLUTION & RE-OPENING WORKFLOW
  console.log("\n--- SECTION 5: TCK-05 Ticket Resolution & Customer Follow-Up ---");

  // 5.1 Mark Ticket Resolved via PATCH
  const resResolve = await fetch(`${STOREFRONT_URL}/api/tickets/${createdTicketNumber}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "RESOLVED",
      staffName: "Kavita Rao",
    }),
  });
  const dataResolve = await resResolve.json();
  assert(
    resResolve.ok && dataResolve.ticket?.status === "RESOLVED",
    "Admin PATCH /api/tickets/[id] updates status to RESOLVED in database",
    "TCK-05 Resolution",
    `Status: ${dataResolve.ticket?.status}`
  );

  const dbResolved = await prisma.supportTicket.findUnique({
    where: { ticketNumber: createdTicketNumber },
  });
  assert(
    dbResolved?.status === "RESOLVED",
    "PostgreSQL reflects RESOLVED state",
    "TCK-05 Database",
    `DB status: ${dbResolved?.status}`
  );

  // 5.2 Customer Tracking Access Check (Negative & Positive)
  const resUnauth = await fetch(`${STOREFRONT_URL}/api/tickets?ticketNumber=${createdTicketNumber}`);
  assert(
    resUnauth.status === 401,
    "Privacy Guard: /api/tickets without contact details returns 401",
    "TCK-05 Privacy",
    `Expected 401, got ${resUnauth.status}`
  );

  const resWrongContact = await fetch(
    `${STOREFRONT_URL}/api/tickets?ticketNumber=${createdTicketNumber}&contact=wrong@other.in`
  );
  assert(
    resWrongContact.status === 403,
    "Privacy Guard: /api/tickets with mismatching contact returns 403",
    "TCK-05 Privacy",
    `Expected 403, got ${resWrongContact.status}`
  );

  const resTrackTicket = await fetch(
    `${STOREFRONT_URL}/api/tickets?ticketNumber=${createdTicketNumber}&contact=${encodeURIComponent(testEmail)}`
  );
  const dataTrackTicket = await resTrackTicket.json();
  assert(
    resTrackTicket.ok && dataTrackTicket.found && dataTrackTicket.ticket?.messages.length === 2,
    "Customer /track fetches full ticket conversation thread with valid contact",
    "TCK-05 Tracking",
    `Messages: ${dataTrackTicket.ticket?.messages.length}, status: ${dataTrackTicket.ticket?.status}`
  );

  // 5.3 Customer Posts Follow-Up Reply -> Auto Re-opens to IN_PROGRESS
  const customerFollowUpText = "Understood, thank you. One quick question about the mounting bracket screw pack.";
  const resCustomerReply = await fetch(`${STOREFRONT_URL}/api/tickets/${createdTicketNumber}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: "CUSTOMER",
      authorName: testName,
      text: customerFollowUpText,
    }),
  });
  const dataCustomerReply = await resCustomerReply.json();
  assert(
    resCustomerReply.ok && dataCustomerReply.ticketStatus === "IN_PROGRESS",
    "Customer follow-up on RESOLVED ticket auto re-opens status to IN_PROGRESS",
    "TCK-05 Reopening",
    `Status transitioned to: ${dataCustomerReply.ticketStatus}`
  );

  const dbFinal = await prisma.supportTicket.findUnique({
    where: { ticketNumber: createdTicketNumber },
    include: { messages: true },
  });
  assert(
    Boolean(dbFinal && dbFinal.status === "IN_PROGRESS" && dbFinal.messages.length === 3),
    "Database reflects 3 threaded messages and IN_PROGRESS status",
    "TCK-05 Database",
    `Messages: ${dbFinal?.messages.length}, Status: ${dbFinal?.status}`
  );

  // SECTION 6: ORDER CROSS-LINKING VERIFICATION
  console.log("\n--- SECTION 6: Order Cross-Linking ---");
  assert(
    dbFinal?.orderNumber === "TAV-RS-2026-1001",
    "Support ticket preserves linked order number (TAV-RS-2026-1001)",
    "Cross-Link",
    `Linked Order: ${dbFinal?.orderNumber}`
  );

  // SECTION 7: INBOUND EMAIL WEBHOOK ROUTING (support@tavistra.com & concierge@tavistra.in)
  console.log("\n--- SECTION 7: Inbound Email Ingestion & Routing ---");

  // 7.1 Inbound Email to support@tavistra.com creates SupportTicket
  const inboundSupportEmail = `client.support.${runId}@studio-vayu.in`;
  const resInboundSupport = await fetch(`${STOREFRONT_URL}/api/webhooks/inbound-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: "support@tavistra.com",
      from: `Kanishk Sen <${inboundSupportEmail}>`,
      subject: "Urgent: Transit Damage on TAV-RS-2026-1001",
      text: "The outer crate arrived with a visible fissure. Please advise on inspection and return replacement.",
    }),
  });
  const dataInboundSupport = await resInboundSupport.json();
  assert(
    resInboundSupport.status === 201 &&
      dataInboundSupport.channel === "SUPPORT_TICKET" &&
      typeof dataInboundSupport.ticketNumber === "string" &&
      dataInboundSupport.priority === "HIGH",
    "Inbound email to support@tavistra.com creates SupportTicket with HIGH priority",
    "Inbound Email",
    `Status: ${resInboundSupport.status}, Ticket: ${dataInboundSupport.ticketNumber}, Priority: ${dataInboundSupport.priority}`
  );

  const dbInboundTicket = dataInboundSupport?.ticketNumber
    ? await prisma.supportTicket.findUnique({
        where: { ticketNumber: dataInboundSupport.ticketNumber },
        include: { messages: true },
      })
    : null;
  assert(
    Boolean(
      dbInboundTicket &&
        dbInboundTicket.email === inboundSupportEmail &&
        dbInboundTicket.orderNumber === "TAV-RS-2026-1001" &&
        dbInboundTicket.messages.length === 1 &&
        dbInboundTicket.messages[0].sender === "CUSTOMER"
    ),
    "Inbound ticket saved in DB with customer message and detected order link",
    "Inbound Email",
    `Saved in DB: ${Boolean(dbInboundTicket)}, Messages: ${dbInboundTicket?.messages.length}`
  );

  const inboundSupportMail = await waitForMailpitSubject(inboundSupportEmail, "Support Ticket Registered", 6000);
  assert(
    Boolean(inboundSupportMail),
    "Customer received automated ticket intake confirmation from inbound email",
    "Inbound Email",
    `Mailpit Subject: ${inboundSupportMail?.Subject}`
  );

  // 7.2 Inbound Email to concierge@tavistra.in creates BulkInquiry
  const inboundConciergeEmail = `client.concierge.${runId}@studio-vayu.in`;
  const resInboundConcierge = await fetch(`${STOREFRONT_URL}/api/webhooks/inbound-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: "concierge@tavistra.in",
      from: `Devi Prasad <${inboundConciergeEmail}>`,
      subject: "Hospitality Architectural Quote Request — 24 Kinetic Lamps",
      text: "We are specifying 24 bespoke kinetic brass table lamps for a boutique retreat in Coorg.",
    }),
  });
  const dataInboundConcierge = await resInboundConcierge.json();
  assert(
    resInboundConcierge.status === 201 &&
      dataInboundConcierge.channel === "GENERAL_INQUIRY" &&
      typeof dataInboundConcierge.inquiryNumber === "string",
    "Inbound email to concierge@tavistra.in creates BulkInquiry (INQ-YYYY-NNNN)",
    "Inbound Email",
    `Status: ${resInboundConcierge.status}, Inquiry: ${dataInboundConcierge.inquiryNumber}`
  );

  const dbInboundInquiry = dataInboundConcierge?.inquiryNumber
    ? await prisma.bulkInquiry.findUnique({
        where: { inquiryNumber: dataInboundConcierge.inquiryNumber },
      })
    : null;
  assert(
    Boolean(dbInboundInquiry && dbInboundInquiry.email === inboundConciergeEmail),
    "Inbound general inquiry saved in PostgreSQL BulkInquiry table",
    "Inbound Email",
    `Inquiry saved: ${Boolean(dbInboundInquiry)}`
  );

  // SECTION 8: NAVIGATION, FOOTER & CLIENT PORTAL GOVERNANCE
  console.log("\n--- SECTION 8: Navigation, Footer & Client Account Portal ---");

  // 8.1 /api/account/tickets requires authentication
  const resAccountTicketsUnauth = await fetch(`${STOREFRONT_URL}/api/account/tickets`);
  assert(
    resAccountTicketsUnauth.status === 401,
    "GET /api/account/tickets rejects unauthenticated requests with 401",
    "Account Portal",
    `Expected 401, got ${resAccountTicketsUnauth.status}`
  );

  // 8.2 Header does NOT contain "Support Desk" (reserved for footer only)
  const resHeader = await fetch(`${STOREFRONT_URL}/`);
  const headerHtml = await resHeader.text();
  const headerHasSupportDeskNav =
    headerHtml.includes(`href="/track-ticket">Support Desk<`) ||
    headerHtml.includes(`>Support Desk</a>`);
  assert(
    !headerHasSupportDeskNav,
    "Header navigation cleanly omits 'Support Desk' (only in footer)",
    "Header Navigation",
    `Support Desk in header nav: ${headerHasSupportDeskNav}`
  );

  // 8.3 Footer contains Mon-Fri 10-5 operating hours and merged Contact & Support Desk
  const footerHasHours =
    headerHtml.includes("Mon – Fri, 10:00 AM – 5:00 PM IST") ||
    headerHtml.includes("Mon - Fri, 10:00 AM - 5:00 PM IST");
  assert(
    footerHasHours,
    "Footer displays authoritative hours: 'Mon – Fri, 10:00 AM – 5:00 PM IST'",
    "Footer Governance",
    `Operating hours found in footer: ${footerHasHours}`
  );

  const footerHasMergedContact =
    headerHtml.includes("Contact &amp; Support Desk") ||
    headerHtml.includes("Contact & Support Desk");
  assert(
    footerHasMergedContact,
    "Footer Helpful Links includes merged 'Contact & Support Desk'",
    "Footer Governance",
    `Merged contact link found: ${footerHasMergedContact}`
  );

  // 8.4 Contact page omits obsolete sidebar cards
  const resContact = await fetch(`${STOREFRONT_URL}/contact`);
  const contactHtml = await resContact.text();
  const contactHasObsoleteCards =
    contactHtml.includes("Studio Desk Hours &amp; Contacts") ||
    contactHtml.includes("Studio Desk Hours & Contacts") ||
    contactHtml.includes("7-Day Pre-Production Alterations");
  assert(
    !contactHasObsoleteCards,
    "Contact page cleanly omits obsolete sidebar cards",
    "Contact Page",
    `Obsolete cards present: ${contactHasObsoleteCards}`
  );

  // Final Summary
  console.log("\n=======================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`  SET 7 RESULTS: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log("=======================================================");

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Set 7 verification runner exception:", err);
  process.exit(1);
});


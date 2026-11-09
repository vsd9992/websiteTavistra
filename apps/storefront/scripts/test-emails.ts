import {
  sendOrderConfirmationEmail,
  sendQcPhotosReadyEmail,
  sendBalancePaymentClearedEmail,
  sendTicketEmail,
} from "../src/lib/email";

async function testAll() {
  console.log("=== DISPATCHING LUXURY TRANSACTIONAL EMAILS TO DEVMACHINE MAILPIT ===");

  // 1. Order Confirmation (MTO 25%)
  await sendOrderConfirmationEmail({
    orderNumber: "TAV-MTO-2026-2002",
    customerName: "Ar. Vikramaditya Sharma",
    customerEmail: "vikramaditya@studiovishnu.in",
    mode: "MADE_TO_ORDER",
    items: [{ name: "Arc Solid Brass Wall Mirror", quantity: 1, priceRupees: 28500 }],
    itemsSubtotalRupees: 28500,
    deliveryFeeRupees: 1500,
    totalAmountRupees: 30000,
    amountPaidRupees: 7500,
    balanceDueRupees: 22500,
    city: "New Delhi",
    state: "Delhi",
    pincode: "110001",
  });
  console.log("✓ Order Confirmation (MTO 25%) delivered to Mailpit");

  // 2. QC Photos Ready
  await sendQcPhotosReadyEmail({
    orderNumber: "TAV-MTO-2026-2004",
    customerName: "Ar. Vikramaditya Sharma",
    customerEmail: "vikramaditya@studiovishnu.in",
    qcNotes: "Hand-beveled edges verified. Brass brushed patina uniform and sealed with aerospace microcrystalline wax.",
    balanceDueRupees: 24000,
  });
  console.log("✓ QC Photos Ready Notification delivered to Mailpit");

  // 3. Balance Payment Cleared
  await sendBalancePaymentClearedEmail({
    orderNumber: "TAV-MTO-2026-2004",
    customerName: "Ar. Vikramaditya Sharma",
    customerEmail: "vikramaditya@studiovishnu.in",
    amountPaidRupees: 24000,
    totalAmountRupees: 32000,
  });
  console.log("✓ Balance Payment Cleared Receipt delivered to Mailpit");

  // 4. Ticket Acknowledgment
  await sendTicketEmail({
    ticketNumber: "TCK-2026-101",
    customerName: "Ar. Vikramaditya Sharma",
    customerEmail: "vikramaditya@studiovishnu.in",
    subject: "Inquiry regarding brass edge finish variation",
    messageText: "Can we request a slightly deeper brushed patina on the outer rim for our Connaught Place project?",
    isStaffReply: false,
  });
  console.log("✓ Support Ticket Confirmation delivered to Mailpit");

  // 5. Staff Ticket Reply
  await sendTicketEmail({
    ticketNumber: "TCK-2026-101",
    customerName: "Ar. Vikramaditya Sharma",
    customerEmail: "vikramaditya@studiovishnu.in",
    subject: "Inquiry regarding brass edge finish variation",
    messageText: "Our master metalsmith has confirmed we can achieve a rich warm amber brushed rim for your architectural edition at no additional charge. We will share QC photos on Day 14.",
    isStaffReply: true,
    authorName: "Arjun Mehta (Studio Director)",
  });
  console.log("✓ Staff Ticket Reply delivered to Mailpit");

  // Query Mailpit REST API
  const res = await fetch("http://192.168.1.100:8025/api/v1/messages");
  const data = await res.json();
  console.log("\n=== MAILPIT STATUS ON DEVMACHINE (http://192.168.1.100:8025) ===");
  console.log("Total Verified Emails in Mailpit:", data.total);
  for (const m of data.messages.slice(0, 5)) {
    console.log(`- [${m.Created.substring(11, 19)}] To: ${m.To[0]?.Address} | Subject: ${m.Subject}`);
  }
}

testAll().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

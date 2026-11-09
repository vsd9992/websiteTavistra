import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST || "192.168.1.100";
const smtpPort = parseInt(process.env.SMTP_PORT || "1025", 10);
const smtpFrom = process.env.SMTP_FROM || "VDesign <concierge@tavistra.in>";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Create reusable Nodemailer transporter pointing to devMachine or production SMTP
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: false, // true for 465, false for 1025 or 587
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

// Minimalist Luxury Email Shell
function wrapLuxuryEmailTemplate(title: string, subtitle: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: #f7f6f2; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1c1b18; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e5e2da; border-radius: 12px; overflow: hidden; }
    .header { padding: 36px 36px 24px 36px; border-bottom: 1px solid #edebe4; text-align: center; }
    .brand-mark { font-size: 13px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #8e6c46; margin-bottom: 12px; }
    .title { font-family: Georgia, serif; font-size: 26px; line-height: 1.25; color: #141412; margin: 0 0 6px 0; font-weight: normal; }
    .subtitle { font-size: 13px; color: #726e64; margin: 0; }
    .content { padding: 36px; font-size: 13px; line-height: 1.65; color: #35332e; }
    .card { background-color: #faf9f6; border: 1px solid #e9e6dd; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .ledger-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e3dfd5; font-size: 12px; }
    .ledger-row.total { font-weight: bold; border-top: 1px solid #c9c4b7; border-bottom: none; padding-top: 10px; font-size: 13px; color: #141412; }
    .btn { display: inline-block; background-color: #1c1b18; color: #ffffff !important; padding: 13px 28px; border-radius: 50px; text-decoration: none; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; text-align: center; margin-top: 12px; }
    .footer { padding: 24px 36px; background-color: #faf9f6; border-top: 1px solid #edebe4; text-align: center; font-size: 11px; color: #8a867c; line-height: 1.6; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
    .badge-mto { background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .badge-ready { background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
    .badge-success { background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-mark">VDesign</div>
      <h1 class="title">${title}</h1>
      <p class="subtitle">${subtitle}</p>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0;"><strong>VDesign</strong> · New Delhi, India</p>
      <p style="margin: 0;">Bespoke Architectural Editions & Timeless Lifestyle Objects</p>
      <p style="margin: 8px 0 0 0; font-size: 10px; color: #a39f94;">This is an authoritative communication concerning your acquisition.</p>
    </div>
  </div>
</body>
</html>`;
}

// 1. Send Order Confirmation Email
export async function sendOrderConfirmationEmail(params: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  mode: "READY_STOCK" | "MADE_TO_ORDER";
  items: { name: string; quantity: number; priceRupees: number }[];
  itemsSubtotalRupees: number;
  deliveryFeeRupees: number;
  totalAmountRupees: number;
  amountPaidRupees: number;
  balanceDueRupees: number;
  city: string;
  state: string;
  pincode: string;
}) {
  const {
    orderNumber,
    customerName,
    customerEmail,
    mode,
    items,
    itemsSubtotalRupees,
    deliveryFeeRupees,
    totalAmountRupees,
    amountPaidRupees,
    balanceDueRupees,
    city,
    state,
    pincode,
  } = params;

  const trackingLink = `${appUrl}/track?orderId=${encodeURIComponent(orderNumber)}`;
  const isMto = mode === "MADE_TO_ORDER";

  const itemsHtml = items
    .map(
      (it) => `
    <div style="padding: 8px 0; border-bottom: 1px solid #f0eee8;">
      <strong style="color: #1c1b18;">${it.name}</strong> × ${it.quantity}
      <span style="float: right; color: #4a4843;">₹${(it.priceRupees * it.quantity).toLocaleString("en-IN")}</span>
    </div>`
    )
    .join("");

  const bodyContent = `
    <p>Dear ${customerName},</p>
    <p>
      We gratefully acknowledge receipt of your acquisition record <strong style="font-family: monospace;">${orderNumber}</strong>.
      ${
        isMto
          ? `Your <strong>25% advance (₹${amountPaidRupees.toLocaleString("en-IN")})</strong> has been verified. Your order is registered in our <strong>7-Day Confirmation Grace Window</strong>.`
          : `Your <strong>full payment (₹${amountPaidRupees.toLocaleString("en-IN")})</strong> has been verified. Your consignment is being inspected and prepared for crated dispatch.`
      }
    </p>

    <div style="margin: 16px 0;">
      <span class="badge ${isMto ? "badge-mto" : "badge-ready"}">
        ${isMto ? "Made to Order · 25% Advance Verified" : "Ready Stock · 100% Paid"}
      </span>
    </div>

    <div class="card">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8e6c46; font-weight: bold; margin-bottom: 10px;">
        Acquired Works
      </div>
      ${itemsHtml}

      <div style="margin-top: 16px; pt-2;">
        <div class="ledger-row">
          <span>Items Value (Tax Inclusive)</span>
          <span>₹${itemsSubtotalRupees.toLocaleString("en-IN")}</span>
        </div>
        <div class="ledger-row">
          <span>Insured Transit & Crating</span>
          <span>${deliveryFeeRupees === 0 ? "Complimentary" : `₹${deliveryFeeRupees.toLocaleString("en-IN")}`}</span>
        </div>
        <div class="ledger-row total">
          <span>Total Transaction Value</span>
          <span>₹${totalAmountRupees.toLocaleString("en-IN")}</span>
        </div>
        <div class="ledger-row" style="color: #065f46; font-weight: bold;">
          <span>Verified Amount Paid</span>
          <span>₹${amountPaidRupees.toLocaleString("en-IN")}</span>
        </div>
        ${
          balanceDueRupees > 0
            ? `<div class="ledger-row" style="color: #b45309; font-weight: bold;">
                <span>Balance Due Before Dispatch (75%)</span>
                <span>₹${balanceDueRupees.toLocaleString("en-IN")}</span>
              </div>`
            : ""
        }
      </div>
    </div>

    <p style="font-size: 12px; color: #5a574f;">
      <strong>Delivery Destination:</strong> ${city}, ${state} (${pincode})
    </p>

    ${
      isMto
        ? `<div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px; margin: 18px 0; font-size: 12px; color: #92400e;">
            <strong>7-Day Confirmation Grace Window:</strong> Physical workshop machining begins on Day 8. You may adjust specifications or request a 100% full refund cancellation prior to Day 8. You may also settle your remaining 75% balance anytime from Day 1 onward.
          </div>`
        : ""
    }

    <div style="text-align: center; margin: 28px 0 10px 0;">
      <a href="${trackingLink}" class="btn">View Consignment Milestones & Status</a>
    </div>
  `;

  const html = wrapLuxuryEmailTemplate(
    isMto ? "Made to Order Confirmed" : "Order Confirmed & Paid",
    `Reference: ${orderNumber}`,
    bodyContent
  );

  return transporter.sendMail({
    from: smtpFrom,
    to: customerEmail,
    subject: `[VDesign] Order Confirmation — ${orderNumber}`,
    html,
  });
}

// 2. Send Workshop QC Photos Ready Notification
export async function sendQcPhotosReadyEmail(params: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  qcNotes?: string;
  balanceDueRupees: number;
}) {
  const { orderNumber, customerName, customerEmail, qcNotes, balanceDueRupees } = params;
  const trackingLink = `${appUrl}/track?orderId=${encodeURIComponent(orderNumber)}`;

  const bodyContent = `
    <p>Dear ${customerName},</p>
    <p>
      Our master craftsmen have concluded workshop machining and detailing for your bespoke order <strong style="font-family: monospace;">${orderNumber}</strong>.
    </p>

    <div style="margin: 16px 0;">
      <span class="badge badge-success">✓ Studio Quality Control Verified</span>
    </div>

    ${
      qcNotes
        ? `<div class="card" style="font-style: italic; color: #4a4843;">
            <strong style="font-style: normal; display: block; font-size: 11px; text-transform: uppercase; color: #8e6c46; margin-bottom: 4px;">Master Craftsman Quality Notes:</strong>
            "${qcNotes}"
          </div>`
        : ""
    }

    <p>
      High-resolution workshop inspection photographs of your finished piece have been uploaded directly into your order tracking portal. You can review the craftsmanship, surface patina, and dimensional detailing prior to crated packaging.
    </p>

    ${
      balanceDueRupees > 0
        ? `<div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px; margin: 18px 0; font-size: 12px; color: #92400e;">
            <strong>Pre-Dispatch Settlement:</strong> Outstanding balance of <strong>₹${balanceDueRupees.toLocaleString("en-IN")}</strong> is due prior to final crating and courier handover. You can clear this balance securely via PhonePe on the tracking page.
          </div>`
        : `<p style="color: #065f46; font-weight: bold;">Your order is 100% paid in full. Handover to our white-glove carrier is being scheduled.</p>`
    }

    <div style="text-align: center; margin: 28px 0 10px 0;">
      <a href="${trackingLink}" class="btn">Inspect Workshop QC Photos</a>
    </div>
  `;

  const html = wrapLuxuryEmailTemplate(
    "Workshop QC Inspection Photos Ready",
    `Order Reference: ${orderNumber}`,
    bodyContent
  );

  return transporter.sendMail({
    from: smtpFrom,
    to: customerEmail,
    subject: `[VDesign] Finished Piece QC Photos Ready — ${orderNumber}`,
    html,
  });
}

// 3. Send 75% Balance Payment Cleared Receipt
export async function sendBalancePaymentClearedEmail(params: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amountPaidRupees: number;
  totalAmountRupees: number;
}) {
  const { orderNumber, customerName, customerEmail, amountPaidRupees, totalAmountRupees } = params;
  const trackingLink = `${appUrl}/track?orderId=${encodeURIComponent(orderNumber)}`;

  const bodyContent = `
    <p>Dear ${customerName},</p>
    <p>
      Thank you for your final balance settlement. We have verified receipt of <strong>₹${amountPaidRupees.toLocaleString("en-IN")}</strong> for order <strong style="font-family: monospace;">${orderNumber}</strong>.
    </p>

    <div style="margin: 16px 0;">
      <span class="badge badge-success">✓ 100% Cumulative Payment Verified</span>
    </div>

    <div class="card">
      <div class="ledger-row">
        <span>Total Transaction Value</span>
        <span>₹${totalAmountRupees.toLocaleString("en-IN")}</span>
      </div>
      <div class="ledger-row total" style="color: #065f46;">
        <span>Cumulative Verified Paid</span>
        <span>₹${totalAmountRupees.toLocaleString("en-IN")}</span>
      </div>
      <div class="ledger-row" style="color: #10b981;">
        <span>Remaining Balance Due</span>
        <span>₹0 (Fully Settled)</span>
      </div>
    </div>

    <p>
      Your piece is now authorized for final packaging inside our bespoke protective shock-absorbing wooden crating. Carrier assignment and insured Air Waybill (AWB) tracking will follow shortly.
    </p>

    <div style="text-align: center; margin: 28px 0 10px 0;">
      <a href="${trackingLink}" class="btn">Track Packing & Carrier Transit</a>
    </div>
  `;

  const html = wrapLuxuryEmailTemplate(
    "Final Balance Payment Verified",
    `Consignment: ${orderNumber}`,
    bodyContent
  );

  return transporter.sendMail({
    from: smtpFrom,
    to: customerEmail,
    subject: `[VDesign] 100% Payment Cleared — ${orderNumber}`,
    html,
  });
}

// 4. Send Support Ticket Acknowledgment & Staff Reply
export async function sendTicketEmail(params: {
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  messageText: string;
  isStaffReply?: boolean;
  authorName?: string;
}) {
  const { ticketNumber, customerName, customerEmail, subject, messageText, isStaffReply, authorName } = params;

  const bodyContent = `
    <p>Dear ${customerName},</p>
    ${
      isStaffReply
        ? `<p>Our studio team has reviewed your note regarding <strong style="font-family: monospace;">${ticketNumber}</strong>.</p>
           <div class="card" style="background-color: #faf7f2; border-left: 3px solid #8e6c46;">
             <strong style="color: #8e6c46; display: block; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Response from ${authorName || "Studio Concierge"}:</strong>
             <p style="margin: 0; white-space: pre-line;">${messageText}</p>
           </div>
           <p style="font-size: 12px; color: #726e64;">You may reply directly to this thread or reach us at <a href="mailto:concierge@tavistra.in" style="color: #8e6c46;">concierge@tavistra.in</a>.</p>`
        : `<p>Thank you for contacting the VDesign client desk. We have registered your inquiry under reference <strong style="font-family: monospace;">${ticketNumber}</strong>.</p>
           <div class="card">
             <strong>Subject:</strong> ${subject}<br><br>
             <strong>Your Note:</strong>
             <p style="margin: 6px 0 0 0; white-space: pre-line; color: #5a574f;">${messageText}</p>
           </div>
           <p>Our commercial and architectural design desk will review your inquiry within 24 to 48 business hours.</p>`
    }
  `;

  const html = wrapLuxuryEmailTemplate(
    isStaffReply ? "Studio Reply to Your Inquiry" : "Inquiry Received & Registered",
    `Ticket: ${ticketNumber}`,
    bodyContent
  );

  return transporter.sendMail({
    from: smtpFrom,
    to: customerEmail,
    subject: `[VDesign] ${isStaffReply ? "Update regarding" : "Inquiry Registered"} — ${ticketNumber}: ${subject}`,
    html,
  });
}

// 5. Send Formal 30-Day Architectural Quote Proposal (TAV-07)
export async function sendQuoteProposalEmail(params: {
  quoteNumber: string;
  versionNumber: number;
  customerName: string;
  customerEmail: string;
  specifications: string;
  quotedAmountRupees: number;
  advanceRequiredRupees: number;
  balanceDueRupees: number;
  estimatedLeadDays: number;
  expiresAt: Date;
}) {
  const {
    quoteNumber,
    versionNumber,
    customerName,
    customerEmail,
    specifications,
    quotedAmountRupees,
    advanceRequiredRupees,
    balanceDueRupees,
    estimatedLeadDays,
    expiresAt,
  } = params;

  const quoteUrl = `${appUrl}/quote/${encodeURIComponent(quoteNumber)}`;
  const formattedExpiry = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(expiresAt));

  const formatRupees = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  const bodyContent = `
    <p>Dear ${customerName},</p>
    <p>Our architectural craftsmanship and design team has formulated a formal proposal for your bespoke project under reference <strong style="font-family: monospace;">${quoteNumber} (Revision ${versionNumber})</strong>.</p>
    
    <div class="card">
      <div style="margin-bottom: 14px;">
        <span class="badge" style="background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a;">30-Day Locked Commercial Offer</span>
      </div>
      <strong style="color: #141412; font-size: 13px; display: block; margin-bottom: 6px;">Project Specifications:</strong>
      <p style="margin: 0 0 16px 0; font-size: 12px; color: #5a574f; white-space: pre-line;">${specifications}</p>

      <div class="ledger-row">
        <span>Estimated Workshop Production:</span>
        <strong>${estimatedLeadDays} Days (From Advance Verification)</strong>
      </div>
      <div class="ledger-row">
        <span>Offer Validity Guarantee:</span>
        <strong>Locked until ${formattedExpiry}</strong>
      </div>
      <div class="ledger-row">
        <span>Total Quoted Value (Tax-Inclusive):</span>
        <strong style="color: #141412;">${formatRupees(quotedAmountRupees)}</strong>
      </div>
      <div class="ledger-row" style="background-color: #faf2ea; padding: 6px 8px; border-radius: 4px; margin: 4px 0;">
        <span style="color: #8e6c46; font-weight: 600;">25% Production Advance:</span>
        <strong style="color: #8e6c46;">${formatRupees(advanceRequiredRupees)}</strong>
      </div>
      <div class="ledger-row">
        <span style="color: #726e64;">Remaining Balance (Due post-QC):</span>
        <span style="color: #726e64;">${formatRupees(balanceDueRupees)}</span>
      </div>
    </div>

    <div style="text-align: center; margin: 30px 0 10px 0;">
      <a href="${quoteUrl}" class="btn" style="background-color: #8e6c46;">Review Proposal & Pay 25% Advance</a>
    </div>
    <p style="font-size: 11px; text-align: center; color: #8a867c;">
      Direct review link: <a href="${quoteUrl}" style="color: #8e6c46;">${quoteUrl}</a>
    </p>

    <div style="margin-top: 24px; padding: 14px; background-color: #f9f8f5; border-radius: 6px; font-size: 11px; color: #726e64; line-height: 1.5;">
      <strong>Authoritative Policy (TAV-07):</strong> This quotation is locked against materials and artisanal labor cost escalations for 30 calendar days from initial issuance. Upon payment of the 25% production advance, workshop craftsmanship commences immediately.
    </div>
  `;

  const html = wrapLuxuryEmailTemplate(
    "Formal Architectural Proposal",
    `Offer: ${quoteNumber} · Revision ${versionNumber}`,
    bodyContent
  );

  return transporter.sendMail({
    from: smtpFrom,
    to: customerEmail,
    subject: `[VDesign] Formal 30-Day Architectural Proposal — ${quoteNumber}`,
    html,
  });
}


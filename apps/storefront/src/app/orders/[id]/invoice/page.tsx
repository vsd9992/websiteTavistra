import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@tavistra/db";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  DEFAULT_SELLER_DETAILS,
  resolveSellerDetails,
  FREIGHT_SAC_CODE,
  resolveHsnCode,
  deriveGstStateDetails,
  deriveDocumentNumbers,
  numberToIndianRupeesWords,
} from "@/lib/invoiceUtils";
import { InvoicePrintActions, InvoiceBackButton } from "./InvoicePrintActions";

interface InvoicePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ contact?: string }>;
}

export const metadata = {
  title: "Statutory Tax Document — Tavistra",
  description: "Official Statutory Indian GST Tax Document issued by VDesign / Tavistra.",
};

async function InvoiceContent({ params, searchParams }: InvoicePageProps) {
  await connection();
  const { id } = await params;
  const { contact } = await searchParams;
  const cleanId = (id || "").trim();

  if (!cleanId) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: cleanId }, { orderNumber: cleanId.toUpperCase() }],
    },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      shippingAddress: true,
      user: true,
      payments: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Load any backend admin overrides from SystemSetting
  const sellerSetting = await prisma.systemSetting.findUnique({
    where: { key: "INVOICE_SELLER_DETAILS" },
  });
  const sellerDetails = resolveSellerDetails(sellerSetting?.value);

  // Security Verification: Logged-in owner OR matching contact param
  const sessionUser = await getAuthenticatedUser();
  const isOwner = Boolean(sessionUser && order.userId === sessionUser.id);
  const cleanContact = (contact || "").trim().toLowerCase();

  const isContactMatched =
    cleanContact.length > 0 &&
    (order.customerEmail.toLowerCase() === cleanContact ||
      order.customerPhone.replace(/\D/g, "").endsWith(cleanContact.replace(/\D/g, "")));

  if (!isOwner && !isContactMatched) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-canvas)] p-6">
        <div className="w-full max-w-md rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-8 text-center space-y-5 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-bronze)] block">
            Verification Required
          </span>
          <h2 className="font-editorial text-2xl text-[var(--color-ink)]">
            Access Statutory Document
          </h2>
          <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
            To view or print the official GST tax invoice / credit note for{" "}
            <strong className="text-[var(--color-ink)]">{order.orderNumber}</strong>, please sign in or provide the registered email or mobile used at checkout.
          </p>
          <form method="GET" action={`/orders/${encodeURIComponent(order.orderNumber)}/invoice`} className="space-y-3 pt-2">
            <input
              type="text"
              name="contact"
              required
              placeholder="Enter billing email or 10-digit mobile"
              className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-[var(--color-ink)] py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
            >
              Verify &amp; Open Document
            </button>
          </form>
          <div className="pt-2 text-[11px]">
            <Link
              href={`/account/login?next=${encodeURIComponent(`/orders/${order.orderNumber}/invoice`)}`}
              className="text-[var(--color-bronze)] font-medium hover:underline"
            >
              Sign In to Your Account →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine Document Type
  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
  const totalAmountNum = Number(order.totalAmount);
  const itemsSubtotalNum = Number(order.itemsSubtotal);
  const shippingChargeNum = Number(order.shippingCharge);
  const amountPaidNum = Number(order.amountPaid);
  const balanceDueNum = Number(order.balanceAmount);

  const isMtoPending =
    (order.purchaseMode === "MADE_TO_ORDER" || Boolean(order.quoteNumber)) &&
    balanceDueNum > 0 &&
    !isCancelled;

  // Determine State Tax Breakdown (Delhi intra-state vs Inter-state)
  const gstState = deriveGstStateDetails(order.shippingAddress.state);
  const isInterState = gstState.isInterState;

  // Standard Document Numbers
  const docNumbers = deriveDocumentNumbers(order.orderNumber, order.createdAt);
  const invoiceDateFormatted = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const updatedDateFormatted = new Date(order.updatedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Line items breakdown
  const lineItems = order.items.map((item, idx) => {
    const itemTotal = Number(item.subtotal);
    const taxableValue = Math.round((itemTotal / 1.18) * 100) / 100;
    const taxAmount = Math.round((itemTotal - taxableValue) * 100) / 100;

    return {
      slNo: idx + 1,
      title: item.product.title,
      variantTitle: item.variant?.title || undefined,
      sku: item.variant?.sku || item.product.sku,
      hsnCode: resolveHsnCode(undefined, item.product.subcategory || undefined, item.product.title),
      quantity: item.quantity,
      unitPriceGross: Number(item.unitPrice),
      taxableValue,
      taxAmount,
      total: itemTotal,
    };
  });

  // Freight Line Item
  const freightTaxable = Math.round((shippingChargeNum / 1.18) * 100) / 100;
  const freightTax = Math.round((shippingChargeNum - freightTaxable) * 100) / 100;

  // Aggregated Tax Totals
  const totalTaxable = Math.round((itemsSubtotalNum / 1.18 + freightTaxable) * 100) / 100;
  const totalTax = Math.round((totalAmountNum - totalTaxable) * 100) / 100;
  const cgstAmount = isInterState ? 0 : Math.round((totalTax / 2) * 100) / 100;
  const sgstAmount = isInterState ? 0 : Math.round((totalTax / 2) * 100) / 100;
  const igstAmount = isInterState ? totalTax : 0;

  // Amount In Words
  const documentTotalRupees = isCancelled ? amountPaidNum : totalAmountNum;
  const amountInWords = numberToIndianRupeesWords(documentTotalRupees);

  // Document labels
  const docBadge = isCancelled
    ? "GST CREDIT NOTE"
    : isMtoPending
    ? "ADVANCE RECEIPT VOUCHER"
    : "TAX INVOICE";

  const docRule = isCancelled
    ? "Section 34(1) · Rule 53 · CGST Rules, 2017"
    : isMtoPending
    ? "Section 31(3)(d) · CGST Act, 2017"
    : "Rule 46 · CGST Rules, 2017";

  const docNumber = isCancelled
    ? docNumbers.creditNoteNumber
    : isMtoPending
    ? docNumbers.receiptVoucherNumber
    : docNumbers.invoiceNumber;

  const fallbackBackUrl = isOwner ? "/account/orders" : `/track?orderId=${encodeURIComponent(order.orderNumber)}`;

  return (
    <div className="min-h-screen bg-stone-100 py-6 sm:py-10 px-4 sm:px-6 font-sans text-neutral-900 print:bg-white print:p-0 print:m-0">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="mx-auto max-w-4xl mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <InvoiceBackButton fallbackUrl={fallbackBackUrl} />
        <InvoicePrintActions
          orderNumber={order.orderNumber}
          contact={cleanContact}
          documentLabel={isCancelled ? "Credit Note" : isMtoPending ? "Advance Voucher" : "Tax Invoice"}
        />
      </div>

      {/* Made-to-Order Pending Balance Notice */}
      {isMtoPending && (
        <div className="mx-auto max-w-4xl mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 print:hidden space-y-1.5">
          <strong className="font-semibold flex items-center gap-1.5 text-amber-900">
            <span>ℹ</span> Advance Receipt Voucher (75% Balance Pending)
          </strong>
          <p className="leading-relaxed">
            This voucher acknowledges your 25% production advance (₹{amountPaidNum.toLocaleString("en-IN")}). In accordance with Section 31(1) of the CGST Act, 2017, the final statutory GST Tax Invoice is generated once 100% payment (remaining ₹{balanceDueNum.toLocaleString("en-IN")}) is completed prior to dispatch.
          </p>
        </div>
      )}

      {/* Cancelled Order Credit Note Notice */}
      {isCancelled && (
        <div className="mx-auto max-w-4xl mb-4 rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-950 print:hidden space-y-1">
          <strong className="font-semibold flex items-center gap-1.5 text-rose-900">
            <span>✓</span> Official Statutory Credit Note (100% Refund Issued)
          </strong>
          <p className="leading-relaxed">
            This statutory GST Credit Note has been issued for order cancellation and full refund under Section 34(1) of the CGST Act, 2017.
          </p>
        </div>
      )}

      {/* Main A4 Document Sheet */}
      <div className="mx-auto max-w-4xl bg-white border border-neutral-300 shadow-lg p-8 sm:p-12 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none space-y-6 text-[12px] leading-relaxed">
        {/* Document Header */}
        <div className="border-b-2 border-neutral-800 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="font-mono text-2xl font-bold tracking-tight text-neutral-900 block">
                {sellerDetails.brandName}
              </span>
              <span className="text-[11px] font-semibold text-neutral-700 block mt-0.5">
                {sellerDetails.businessUnitLine}
              </span>
              <span className="text-[10px] text-neutral-500 block">
                Legal Entity: <strong>{sellerDetails.legalEntityName}</strong> · {sellerDetails.tagline}
              </span>
              <p className="text-[11px] text-neutral-600 mt-2 max-w-xs">
                {sellerDetails.registeredAddressLine1}, {sellerDetails.city}, {sellerDetails.state} - {sellerDetails.pincode}, {sellerDetails.country}
              </p>
              <div className="mt-1.5 font-mono text-[10px] text-neutral-700 space-y-0.5">
                <div>
                  GSTIN: <strong>{sellerDetails.gstin}</strong> | PAN: <strong>{sellerDetails.pan}</strong>
                </div>
                <div>
                  State: {sellerDetails.state} (Code: {sellerDetails.stateCode})
                </div>
                <div>Email: {sellerDetails.supportEmail}</div>
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <span
                className={`inline-block text-white font-mono uppercase text-xs font-bold px-3 py-1 rounded ${
                  isCancelled ? "bg-rose-800" : isMtoPending ? "bg-amber-800" : "bg-neutral-900"
                }`}
              >
                {docBadge}
              </span>
              <span className="block text-[9px] text-neutral-500 uppercase tracking-wider">
                {docRule}
              </span>
              <div className="pt-2 font-mono text-[11px] space-y-1">
                <div>
                  {isCancelled ? "Credit Note No:" : isMtoPending ? "Voucher No:" : "Invoice No:"}{" "}
                  <strong>{docNumber}</strong>
                </div>
                <div>Date: <strong>{isCancelled ? updatedDateFormatted : invoiceDateFormatted}</strong></div>
                {isCancelled && (
                  <div>
                    Original Invoice Ref: <strong>{docNumbers.invoiceNumber}</strong>
                  </div>
                )}
                <div>Order Ref: <strong>{order.orderNumber}</strong></div>
                <div>
                  Place of Supply: <strong>{gstState.stateName} ({gstState.stateCode})</strong>
                </div>
                {isCancelled && (
                  <div className="text-[10px] text-rose-800 font-semibold pt-1">
                    Reason: Order Cancellation &amp; 100% Refund (Sec 34 CGST)
                  </div>
                )}
                <div>Reverse Charge: <strong>No</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Billed To / Shipped To Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-neutral-300 rounded-lg p-4 bg-neutral-50/50 print:bg-white">
          <div className="space-y-1">
            <span className="font-mono text-[10px] uppercase font-bold text-neutral-500 block">
              Billed To (Client / Studio):
            </span>
            <div className="font-bold text-neutral-900 text-sm">
              {order.shippingAddress.fullName}
            </div>
            {order.user?.practiceOrStudio && (
              <div className="text-[11px] font-semibold text-neutral-700">
                {order.user.practiceOrStudio}
              </div>
            )}
            <div className="text-neutral-700">
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}
            </div>
            <div className="text-neutral-700">
              {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
            </div>
            <div className="text-neutral-600 font-mono text-[11px] pt-1">
              Phone: {order.shippingAddress.phone} | Email: {order.customerEmail}
            </div>
            {order.user?.gstin && (
              <div className="font-mono text-[11px] font-bold text-neutral-900 pt-0.5">
                Client GSTIN: {order.user.gstin}
              </div>
            )}
          </div>

          <div className="space-y-1 sm:border-l sm:border-neutral-300 sm:pl-4">
            <span className="font-mono text-[10px] uppercase font-bold text-neutral-500 block">
              Shipped To (Consignee):
            </span>
            <div className="font-bold text-neutral-900 text-sm">
              {order.shippingAddress.fullName}
            </div>
            <div className="text-neutral-700">
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}
            </div>
            <div className="text-neutral-700">
              {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
            </div>
            <div className="text-neutral-600 font-mono text-[11px] pt-1">
              Destination Phone: {order.shippingAddress.phone}
            </div>
            <div className="text-[10px] text-neutral-500 pt-1">
              Insured White-Glove Handover · FOV 100% Protection
            </div>
          </div>
        </div>

        {/* Itemized Goods & Services Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-neutral-300 text-left text-[11px]">
            <thead>
              <tr className="bg-neutral-100 font-mono text-[10px] text-neutral-700 border-b border-neutral-300">
                <th className="border-r border-neutral-300 p-2 text-center w-8">#</th>
                <th className="border-r border-neutral-300 p-2">
                  {isCancelled ? "Credited Goods / Services Description" : "Description of Goods / Services"}
                </th>
                <th className="border-r border-neutral-300 p-2 text-center w-16">HSN/SAC</th>
                <th className="border-r border-neutral-300 p-2 text-center w-10">Qty</th>
                <th className="border-r border-neutral-300 p-2 text-right w-20">Gross (₹)</th>
                <th className="border-r border-neutral-300 p-2 text-right w-20">
                  {isCancelled ? "Taxable Credit (₹)" : "Taxable (₹)"}
                </th>
                {isInterState ? (
                  <th className="border-r border-neutral-300 p-2 text-right w-20">IGST 18% (₹)</th>
                ) : (
                  <>
                    <th className="border-r border-neutral-300 p-2 text-right w-16">CGST 9% (₹)</th>
                    <th className="border-r border-neutral-300 p-2 text-right w-16">SGST 9% (₹)</th>
                  </>
                )}
                <th className="p-2 text-right w-24">{isCancelled ? "Credited Total (₹)" : "Total (₹)"}</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.slNo} className="border-b border-neutral-200">
                  <td className="border-r border-neutral-300 p-2 text-center font-mono">{item.slNo}</td>
                  <td className="border-r border-neutral-300 p-2">
                    <span className="font-semibold text-neutral-900 block">{item.title}</span>
                    {item.variantTitle && (
                      <span className="text-[10px] text-neutral-500 block">Finish: {item.variantTitle}</span>
                    )}
                    <span className="font-mono text-[9px] text-neutral-400 block">SKU: {item.sku}</span>
                  </td>
                  <td className="border-r border-neutral-300 p-2 text-center font-mono">{item.hsnCode}</td>
                  <td className="border-r border-neutral-300 p-2 text-center font-mono">{item.quantity}</td>
                  <td className="border-r border-neutral-300 p-2 text-right font-mono">
                    {item.unitPriceGross.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border-r border-neutral-300 p-2 text-right font-mono">
                    {item.taxableValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  {isInterState ? (
                    <td className="border-r border-neutral-300 p-2 text-right font-mono">
                      {item.taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  ) : (
                    <>
                      <td className="border-r border-neutral-300 p-2 text-right font-mono">
                        {(item.taxAmount / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="border-r border-neutral-300 p-2 text-right font-mono">
                        {(item.taxAmount / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </>
                  )}
                  <td className="p-2 text-right font-mono font-semibold">
                    {item.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}

              {/* Freight Line Item */}
              <tr className="border-b border-neutral-300 bg-neutral-50/30">
                <td className="border-r border-neutral-300 p-2 text-center font-mono">{lineItems.length + 1}</td>
                <td className="border-r border-neutral-300 p-2">
                  <span className="font-semibold text-neutral-900 block">Insured Crating &amp; Courier Transportation</span>
                  <span className="text-[10px] text-neutral-500 block">Carrier&apos;s Risk (FOV Insurance Included)</span>
                </td>
                <td className="border-r border-neutral-300 p-2 text-center font-mono">{FREIGHT_SAC_CODE}</td>
                <td className="border-r border-neutral-300 p-2 text-center font-mono">1</td>
                <td className="border-r border-neutral-300 p-2 text-right font-mono">
                  {shippingChargeNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td className="border-r border-neutral-300 p-2 text-right font-mono">
                  {freightTaxable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                {isInterState ? (
                  <td className="border-r border-neutral-300 p-2 text-right font-mono">
                    {freightTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                ) : (
                  <>
                    <td className="border-r border-neutral-300 p-2 text-right font-mono">
                      {(freightTax / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border-r border-neutral-300 p-2 text-right font-mono">
                      {(freightTax / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </>
                )}
                <td className="p-2 text-right font-mono font-semibold">
                  {shippingChargeNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary & Amount in Words */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start border-t border-neutral-300 pt-4">
          <div className="sm:col-span-7 space-y-3">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-neutral-500 block">
                {isCancelled ? "Credited / Refunded Amount in Words:" : "Total Amount in Words:"}
              </span>
              <p className="font-medium text-neutral-900 text-xs italic mt-0.5">
                {amountInWords}
              </p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 space-y-1.5 text-[11px] print:bg-white">
              <span className="font-mono text-[10px] font-bold text-neutral-700 uppercase block">
                Payment &amp; Financial Settlement:
              </span>
              <div className="flex justify-between font-mono">
                <span>Method / Gateway:</span>
                <span>PhonePe Verified Electronic</span>
              </div>
              {isCancelled ? (
                <>
                  <div className="flex justify-between font-mono">
                    <span>Original Amount Paid:</span>
                    <span className="text-neutral-900">
                      ₹{amountPaidNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono text-rose-800 font-bold">
                    <span>100% Refund Credited to Source:</span>
                    <span>₹{amountPaidNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-neutral-500 pt-0.5">
                    <span>Credit Note Reason:</span>
                    <span>Cancellation &amp; Full Refund (Section 34 CGST)</span>
                  </div>
                </>
              ) : isMtoPending ? (
                <>
                  <div className="flex justify-between font-mono">
                    <span>25% Advance Paid Today:</span>
                    <span className="font-bold text-neutral-900">
                      ₹{amountPaidNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono text-amber-800 font-semibold">
                    <span>Remaining 75% Balance Due at Dispatch:</span>
                    <span>₹{balanceDueNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between font-mono">
                    <span>Amount Paid:</span>
                    <span className="font-bold text-neutral-900">
                      ₹{amountPaidNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono text-emerald-800 font-semibold">
                    <span>Settlement Status:</span>
                    <span>100% Upfront Verified Settlement</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="sm:col-span-5 space-y-1.5 border border-neutral-300 rounded-lg p-3 bg-neutral-50 font-mono text-[11px] print:bg-white">
            <div className="flex justify-between text-neutral-600">
              <span>Taxable Value:</span>
              <span>₹{totalTaxable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
            {isInterState ? (
              <div className="flex justify-between text-neutral-600">
                <span>IGST (18.0%):</span>
                <span>₹{igstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-neutral-600">
                  <span>CGST (9.0%):</span>
                  <span>₹{cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>SGST (9.0%):</span>
                  <span>₹{sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-neutral-900 font-bold border-t border-neutral-300 pt-2 text-xs">
              <span>{isCancelled ? "Total Credited Value:" : "Grand Total (GST Incl.):"}</span>
              <span>₹{totalAmountNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Statutory Declaration & System-Generated Exemption Box */}
        <div className="border-t-2 border-neutral-800 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
          <div className="text-[10px] text-neutral-500 space-y-1">
            <p className="font-semibold text-neutral-700">Declaration &amp; Warranty Conditions:</p>
            <p>
              {isCancelled
                ? "We declare that this Credit Note shows the actual reduction in output tax liability and credit value as per Section 34 of the CGST Act, 2017. All credits have been verified."
                : "We declare that this invoice shows the actual price of the goods and services described and that all particulars are true and correct. All products are covered by Tavistra master artisanal guarantee."}
            </p>
          </div>

          <div className="sm:text-right space-y-1 pt-4 sm:pt-0">
            <span className="text-[10px] font-mono text-neutral-500 block">
              Issued for: {sellerDetails.legalEntityName} (Trade Name: {sellerDetails.brandName})
            </span>
            <div className="rounded border border-neutral-200 bg-neutral-50 p-2.5 text-[10px] text-neutral-600 leading-snug">
              <strong className="block text-neutral-800 font-mono uppercase text-[9px] mb-0.5">
                Electronic Document Authentication
              </strong>
              This is a computer-generated electronic document issued in accordance with Rule 46 / Rule 53 of the CGST Rules, 2017 and the Information Technology Act, 2000. No physical or digital signature is required.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderInvoicePage({ params, searchParams }: InvoicePageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-stone-100 text-xs text-neutral-600">
          Generating official statutory document...
        </div>
      }
    >
      <InvoiceContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

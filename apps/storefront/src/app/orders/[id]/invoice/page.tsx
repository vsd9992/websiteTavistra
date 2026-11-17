import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@tavistra/db";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  SELLER_DETAILS,
  FREIGHT_SAC_CODE,
  resolveHsnCode,
  deriveGstStateDetails,
  numberToIndianRupeesWords,
} from "@/lib/invoiceUtils";
import { InvoicePrintActions } from "./InvoicePrintActions";

interface InvoicePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ contact?: string }>;
}

export const metadata = {
  title: "GST Tax Invoice — Tavistra",
  description: "Official Statutory GST Tax Invoice issued under Section 31 of CGST Act, 2017.",
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
            Access GST Tax Invoice
          </h2>
          <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
            To view or print the official tax invoice for <strong className="text-[var(--color-ink)]">{order.orderNumber}</strong>, please sign in or provide the registered email or phone used at checkout.
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
              Verify &amp; Open Tax Invoice
            </button>
          </form>
          <div className="pt-2 text-[11px]">
            <Link href={`/account/login?next=${encodeURIComponent(`/orders/${order.orderNumber}/invoice`)}`} className="text-[var(--color-bronze)] font-medium hover:underline">
              Sign In to Your Account →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine State Tax Breakdown (Delhi intra-state vs Inter-state)
  const gstState = deriveGstStateDetails(order.shippingAddress.state);
  const isInterState = gstState.isInterState;

  // Invoice Number (Standard format: TAV-INV-YYYY-XXXX)
  const orderNumberDigits = order.orderNumber.replace(/\D/g, "");
  const invoiceNumber = `TAV-INV-${new Date(order.createdAt).getFullYear()}-${orderNumberDigits.slice(-4) || order.orderNumber}`;
  const invoiceDateFormatted = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const totalAmountNum = Number(order.totalAmount);
  const itemsSubtotalNum = Number(order.itemsSubtotal);
  const shippingChargeNum = Number(order.shippingCharge);
  const amountPaidNum = Number(order.amountPaid);
  const balanceDueNum = Number(order.balanceAmount);

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

  const amountInWords = numberToIndianRupeesWords(totalAmountNum);

  return (
    <div className="min-h-screen bg-stone-100 py-6 sm:py-10 px-4 sm:px-6 font-sans text-neutral-900 print:bg-white print:p-0 print:m-0">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="mx-auto max-w-4xl mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/track?orderId=${encodeURIComponent(order.orderNumber)}`}
          className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 transition-colors"
        >
          <span>←</span> Back to Order Tracker
        </Link>
        <InvoicePrintActions orderNumber={order.orderNumber} />
      </div>

      {/* Main A4 Document Sheet */}
      <div className="mx-auto max-w-4xl bg-white border border-neutral-300 shadow-lg p-8 sm:p-12 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none space-y-6 text-[12px] leading-relaxed">
        {/* Document Header */}
        <div className="border-b-2 border-neutral-800 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="font-mono text-2xl font-bold tracking-tight text-neutral-900 block">
                {SELLER_DETAILS.brandName}
              </span>
              <span className="text-[10px] text-neutral-600 block mt-0.5">
                {SELLER_DETAILS.legalEntityName} · {SELLER_DETAILS.tagline}
              </span>
              <p className="text-[11px] text-neutral-600 mt-2 max-w-xs">
                {SELLER_DETAILS.registeredAddressLine1}, {SELLER_DETAILS.city}, {SELLER_DETAILS.state} - {SELLER_DETAILS.pincode}, {SELLER_DETAILS.country}
              </p>
              <div className="mt-1.5 font-mono text-[10px] text-neutral-700 space-y-0.5">
                <div>GSTIN: <strong>{SELLER_DETAILS.gstin}</strong> | PAN: <strong>{SELLER_DETAILS.pan}</strong></div>
                <div>State: {SELLER_DETAILS.state} (Code: {SELLER_DETAILS.stateCode})</div>
                <div>Email: {SELLER_DETAILS.supportEmail}</div>
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="inline-block bg-neutral-900 text-white font-mono uppercase text-xs font-bold px-3 py-1 rounded">
                TAX INVOICE
              </span>
              <span className="block text-[9px] text-neutral-500 uppercase tracking-wider">
                Rule 46 · CGST Rules, 2017
              </span>
              <div className="pt-2 font-mono text-[11px] space-y-1">
                <div>Invoice No: <strong>{invoiceNumber}</strong></div>
                <div>Invoice Date: <strong>{invoiceDateFormatted}</strong></div>
                <div>Order Ref: <strong>{order.orderNumber}</strong></div>
                <div>Place of Supply: <strong>{gstState.stateName} ({gstState.stateCode})</strong></div>
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
                <th className="border-r border-neutral-300 p-2">Description of Goods / Services</th>
                <th className="border-r border-neutral-300 p-2 text-center w-16">HSN/SAC</th>
                <th className="border-r border-neutral-300 p-2 text-center w-10">Qty</th>
                <th className="border-r border-neutral-300 p-2 text-right w-20">Gross (₹)</th>
                <th className="border-r border-neutral-300 p-2 text-right w-20">Taxable (₹)</th>
                {isInterState ? (
                  <th className="border-r border-neutral-300 p-2 text-right w-20">IGST 18% (₹)</th>
                ) : (
                  <>
                    <th className="border-r border-neutral-300 p-2 text-right w-16">CGST 9% (₹)</th>
                    <th className="border-r border-neutral-300 p-2 text-right w-16">SGST 9% (₹)</th>
                  </>
                )}
                <th className="p-2 text-right w-24">Total (₹)</th>
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
                Total Amount in Words:
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
              <div className="flex justify-between font-mono">
                <span>Amount Paid:</span>
                <span className="font-bold text-neutral-900">
                  ₹{amountPaidNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              {balanceDueNum > 0 ? (
                <div className="flex justify-between font-mono text-amber-800 font-semibold">
                  <span>Balance Due Before Dispatch (75%):</span>
                  <span>₹{balanceDueNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              ) : (
                <div className="flex justify-between font-mono text-emerald-800 font-semibold">
                  <span>Settlement Status:</span>
                  <span>100% Upfront Verified Settlement</span>
                </div>
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
              <span>Grand Total (GST Incl.):</span>
              <span>₹{totalAmountNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Statutory Declaration & Signature Box */}
        <div className="border-t-2 border-neutral-800 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
          <div className="text-[10px] text-neutral-500 space-y-1">
            <p className="font-semibold text-neutral-700">Declaration &amp; Warranty Conditions:</p>
            <p>
              We declare that this invoice shows the actual price of the goods and services described and that all particulars are true and correct.
            </p>
            <p>
              All products are covered by Tavistra master artisanal guarantee. This is a computer-generated tax invoice issued in accordance with Rule 46 of the CGST Rules, 2017.
            </p>
          </div>

          <div className="sm:text-right space-y-1 pt-4 sm:pt-0">
            <span className="text-[10px] font-mono text-neutral-500 block">
              For VDesign / Tavistra:
            </span>
            <div className="h-10 flex items-center justify-end">
              <span className="font-serif italic text-base text-neutral-700">
                VDesign Studio Desk
              </span>
            </div>
            <span className="text-[10px] font-mono text-neutral-600 uppercase font-semibold block border-t border-neutral-300 pt-1 inline-block">
              Authorized Signatory
            </span>
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
          Generating official GST tax invoice...
        </div>
      }
    >
      <InvoiceContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

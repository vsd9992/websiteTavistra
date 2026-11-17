"use client";

import React, { useState } from "react";

export function InvoiceBackButton({ fallbackUrl }: { fallbackUrl: string }) {
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.assign(fallbackUrl);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent border-none p-0"
    >
      <span>←</span> Back
    </button>
  );
}

interface InvoicePrintActionsProps {
  orderNumber: string;
  contact?: string;
  documentLabel?: string;
}

export function InvoicePrintActions({
  orderNumber,
  contact,
  documentLabel = "Tax Invoice",
}: InvoicePrintActionsProps) {
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleEmailInvoice = async () => {
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/email-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: contact || "" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to dispatch email.");
      }
      setEmailStatus(`✓ Dispatched to ${data.email || "registered email"}`);
    } catch (err) {
      setEmailStatus(err instanceof Error ? `⚠ ${err.message}` : "⚠ Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 print:hidden">
      {emailStatus && (
        <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          {emailStatus}
        </span>
      )}

      <button
        type="button"
        onClick={handleEmailInvoice}
        disabled={sendingEmail}
        className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
        title="Email a copy of this document"
      >
        <svg className="h-3.5 w-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span>{sendingEmail ? "Dispatching Email..." : `Email ${documentLabel}`}</span>
      </button>

      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
        title="Print or Save PDF"
      >
        <svg
          className="h-3.5 w-3.5 text-neutral-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
          />
        </svg>
        <span>Print / Save PDF</span>
      </button>
    </div>
  );
}

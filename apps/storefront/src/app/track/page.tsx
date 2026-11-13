"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useOrders, OrderRecord } from "@/context/OrderContext";

interface TrackedOrder extends OrderRecord {
  orderNumber?: string;
  quoteNumber?: string;
  qcNotes?: string;
  qcImages?: string[];
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || searchParams.get("order") || "";
  const initialContact = searchParams.get("contact") || "";
  const initialTicket = searchParams.get("ticket") || searchParams.get("ticketNumber") || "";

  // Auto redirect if user navigated to /track with ticket reference
  useEffect(() => {
    if (initialTicket) {
      window.location.replace(
        `/track-ticket?ticket=${encodeURIComponent(initialTicket)}${
          initialContact ? `&contact=${encodeURIComponent(initialContact)}` : ""
        }`
      );
    }
  }, [initialTicket, initialContact]);

  const [orderId, setOrderId] = useState(initialOrderId);
  const [contact, setContact] = useState(initialContact);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matchedOrder, setMatchedOrder] = useState<TrackedOrder | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Balance payment states
  const [payingBalance, setPayingBalance] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);

  // Direct server query function
  const fetchOrderFromServer = async (ref: string, contactInfo?: string) => {
    setLoading(true);
    setSearchError(null);
    try {
      const url = `/api/orders?orderId=${encodeURIComponent(ref.trim())}${
        contactInfo ? `&contact=${encodeURIComponent(contactInfo.trim())}` : ""
      }`;
      const res = await fetch(url, { credentials: "include", cache: "no-store" });
      const data = await res.json();

      if (res.ok && data.found && data.order) {
        setMatchedOrder(data.order);
        setSearched(true);
        setLoading(false);
        return true;
      }

      if (res.status === 401 || res.status === 403 || res.status === 404) {
        setMatchedOrder(null);
        setSearched(true);
        setSearchError(
          data.error ||
            "Provide the Billing Email or Mobile registered on this order, or sign in to view your account orders."
        );
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.warn("Backend lookup error:", err);
      setSearchError("Unable to reach the order tracking service. Please try again.");
    }

    setMatchedOrder(null);
    setSearched(true);
    setLoading(false);
    return false;
  };

  useEffect(() => {
    if (initialOrderId) {
      setOrderId(initialOrderId);
      setContact(initialContact);
      fetchOrderFromServer(initialOrderId, initialContact);
    } else {
      setOrderId("");
      setContact("");
      setMatchedOrder(null);
      setSearched(false);
      setSearchError(null);
      setPaymentSuccessMessage(null);
      setPaymentErrorMessage(null);
    }
  }, [initialOrderId, initialContact]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setSearchError("Please enter your Order Reference (e.g. TAV-RS-2026-1001).");
      return;
    }
    const cleanRef = orderId.trim().toUpperCase();
    if (cleanRef.startsWith("TCK")) {
      window.location.assign(
        `/track-ticket?ticket=${encodeURIComponent(cleanRef)}${
          contact ? `&contact=${encodeURIComponent(contact.trim())}` : ""
        }`
      );
      return;
    }
    fetchOrderFromServer(orderId, contact);
  };

  const handlePayBalance = async () => {
    if (!matchedOrder) return;
    setPayingBalance(true);
    setPaymentSuccessMessage(null);
    setPaymentErrorMessage(null);

    try {
      const res = await fetch(`/api/orders/${matchedOrder.id}/pay-balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateway: "PHONEPE" }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPaymentSuccessMessage(
          `Payment of ₹${matchedOrder.balanceDueRupees.toLocaleString("en-IN")} cleared successfully! Your order is now 100% verified.`
        );
        await fetchOrderFromServer(matchedOrder.id, contact || matchedOrder.email);
      } else {
        setPaymentErrorMessage(data.error || "Unable to complete balance payment.");
      }
    } catch {
      setPaymentErrorMessage("Network error processing balance payment.");
    } finally {
      setPayingBalance(false);
    }
  };

  const formatPrice = (amountRupees: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amountRupees);

  return (
    <div className="mx-auto max-w-5xl py-12 px-6 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold block">
          Tavistra Fulfilment &amp; Consignment Tracking
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--color-ink)]">
          Track Your Order
        </h1>
        <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
          Monitor your studio consignment through every milestone: verified advance, workshop craft, inspection, crating, and white-glove courier transit.
        </p>
      </div>

      {/* Tracking Search Form */}
      <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-8 shadow-sm space-y-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="orderId" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                Order Reference *
              </label>
              <input
                id="orderId"
                type="text"
                placeholder="e.g. TAV-RS-2026-1001"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-ivory)] px-4 py-3 text-xs text-[var(--color-ink)] placeholder-[var(--color-muted-light)] focus:border-[var(--color-ink)] focus:outline-none font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="contact" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                Billing Email or Mobile
              </label>
              <input
                id="contact"
                type="text"
                placeholder="email@domain.com or 98101..."
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-ivory)] px-4 py-3 text-xs text-[var(--color-ink)] placeholder-[var(--color-muted-light)] focus:border-[var(--color-ink)] focus:outline-none"
              />
            </div>
          </div>

          {searchError && (
            <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200">
              {searchError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[var(--color-ink)] py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? "Searching Authoritative Records..." : "Locate Consignment & Production Record"}
          </button>
        </form>

        {/* Support Ticket Cross Link Banner */}
        <div className="pt-4 border-t border-[var(--color-decorative-border)] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[var(--color-muted-light)] gap-2">
          <span>Looking to track a support ticket or alteration query?</span>
          <Link
            href="/track-ticket"
            className="font-semibold text-[var(--color-bronze)] hover:underline inline-flex items-center gap-1"
          >
            Track Support Ticket Online →
          </Link>
        </div>
      </div>

      {/* Order Results */}
      {searched && (
        <>
          {matchedOrder ? (
            <div className="space-y-8">
              {/* Top Banner: Status & Order Reference */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--color-decorative-border)] gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-[var(--color-ink)]">
                      {matchedOrder.id}
                    </span>
                    {matchedOrder.quoteNumber && (
                      <span className="font-mono text-xs text-[#8e6c46] bg-[#faf2ea] px-2 py-0.5 rounded border border-[#f5e6d6]">
                        Quote: {matchedOrder.quoteNumber}
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider ${
                        matchedOrder.status === "CANCELLED" || matchedOrder.status === "REFUNDED"
                          ? "bg-rose-100 text-rose-900 border border-rose-300"
                          : matchedOrder.status === "DISPATCHED" || matchedOrder.status === "DELIVERED"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}
                    >
                      {matchedOrder.statusLabel}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-muted-light)]">
                    Placed on {matchedOrder.createdAt} · Mode: {matchedOrder.mode}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* High visibility Raise Support Ticket button */}
                  <Link
                    href={`/contact?intent=support&order=${encodeURIComponent(matchedOrder.id)}&subject=${encodeURIComponent(`Assistance for Order ${matchedOrder.id}`)}`}
                    className="rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5 text-[var(--color-bronze)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Raise Support Ticket
                  </Link>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors"
                  >
                    Print Record
                  </button>
                </div>
              </div>

              {paymentSuccessMessage && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-900">
                  ✓ {paymentSuccessMessage}
                </div>
              )}
              {paymentErrorMessage && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-900">
                  ⚠ {paymentErrorMessage}
                </div>
              )}

              {/* Grid: Production Progress & Ledger Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Milestones & Items (Col 7) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Status Description Box */}
                  <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-bronze)] block">
                      Production State &amp; Progress
                    </span>
                    <h3 className="font-editorial text-xl text-[var(--color-ink)]">
                      {matchedOrder.statusLabel}
                    </h3>
                    <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
                      {matchedOrder.statusDescription}
                    </p>
                  </div>

                  {/* QC Inspection Photos if Available */}
                  {matchedOrder.qcImages && matchedOrder.qcImages.length > 0 && (
                    <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-6 space-y-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-bronze)] block">
                        Workshop Quality Inspection Photos
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {matchedOrder.qcImages.map((img, idx) => (
                          <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]">
                            <img src={img} alt={`QC Photo ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      {matchedOrder.qcNotes && (
                        <p className="text-xs text-[var(--color-muted-light)] italic mt-2">
                          Craftsman Notes: &ldquo;{matchedOrder.qcNotes}&rdquo;
                        </p>
                      )}
                    </div>
                  )}

                  {/* Ordered Pieces */}
                  <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-6 space-y-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block">
                      Consignment Pieces ({matchedOrder.items.length})
                    </span>
                    <div className="divide-y divide-[var(--color-decorative-border)]">
                      {matchedOrder.items.map((item, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-[var(--color-ink)] block">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-[var(--color-muted-light)]">
                              Quantity: {item.quantity}
                            </span>
                          </div>
                          <span className="font-mono font-semibold text-[var(--color-ink)]">
                            {formatPrice((item.pricePaise / 100) * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Payment Ledger & Settled Balance (Col 5) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Ledger Breakdown Card */}
                  <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-6 space-y-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block">
                      Payment Ledger
                    </span>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-[var(--color-muted-light)]">
                        <span>Items Subtotal:</span>
                        <span>{formatPrice(matchedOrder.itemsSubtotalRupees)}</span>
                      </div>
                      <div className="flex justify-between text-[var(--color-muted-light)]">
                        <span>Crating &amp; Delivery Freight:</span>
                        <span>{formatPrice(matchedOrder.deliveryFeeRupees)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-[var(--color-ink)] pt-2 border-t border-[var(--color-decorative-border)]">
                        <span>Total Committed Value:</span>
                        <span>{formatPrice(matchedOrder.totalAmountRupees)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-800 font-semibold pt-1">
                        <span>Verified Paid Amount:</span>
                        <span>{formatPrice(matchedOrder.amountPaidRupees)}</span>
                      </div>
                      {matchedOrder.balanceDueRupees > 0 && (
                        <div className="flex justify-between text-[var(--color-bronze)] font-semibold">
                          <span>Balance Due at Dispatch:</span>
                          <span>{formatPrice(matchedOrder.balanceDueRupees)}</span>
                        </div>
                      )}
                    </div>

                    {/* Day 1 Enabled Balance Payment */}
                    {matchedOrder.balanceDueRupees > 0 &&
                      matchedOrder.status !== "CANCELLED" &&
                      matchedOrder.status !== "REFUNDED" && (
                        <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 space-y-3 pt-4 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900">
                              Balance Settlement (Day 1 Enabled)
                            </span>
                            <span className="text-xs font-bold text-amber-900">
                              {formatPrice(matchedOrder.balanceDueRupees)}
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            Under studio policy, 100% payment must be verified before crating and courier handover.
                          </p>
                          <button
                            type="button"
                            onClick={handlePayBalance}
                            disabled={payingBalance}
                            className="w-full rounded-full bg-emerald-800 py-3 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                          >
                            {payingBalance
                              ? "Verifying PhonePe Gateway..."
                              : `Pay Remaining Balance (${formatPrice(matchedOrder.balanceDueRupees)})`}
                          </button>
                        </div>
                      )}

                    {/* Action Links */}
                    <div className="pt-2 space-y-2">
                      <Link
                        href={`/contact?intent=support&order=${encodeURIComponent(matchedOrder.id)}&subject=${encodeURIComponent(`Assistance for Order ${matchedOrder.id}`)}`}
                        className="block text-center w-full rounded-full bg-[var(--color-ink)] py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5 text-[var(--color-bronze)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Need Help? Raise Support Ticket
                      </Link>
                    </div>
                  </div>

                  {/* Destination Information */}
                  <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 space-y-2 text-xs">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-muted-light)] block">
                      Destination &amp; Freight Courier
                    </span>
                    <p className="font-semibold text-[var(--color-ink)]">{matchedOrder.customerName}</p>
                    <p className="text-[var(--color-muted-light)]">{matchedOrder.addressLine1}</p>
                    <p className="text-[var(--color-muted-light)]">
                      {matchedOrder.city}, {matchedOrder.state} — {matchedOrder.destinationPin}
                    </p>
                    <div className="pt-2 border-t border-[var(--color-decorative-border)]/60 text-[11px]">
                      <span className="text-[var(--color-muted-light)]">Assigned Courier: </span>
                      <strong className="text-[var(--color-ink)]">{matchedOrder.carrierName}</strong>
                      {matchedOrder.awbNumber && (
                        <p className="font-mono mt-0.5">
                          AWB: <strong className="text-[var(--color-bronze)]">{matchedOrder.awbNumber}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-12 text-center space-y-4">
              <span className="font-editorial text-2xl text-[var(--color-ink)] block">
                No Consignment Located
              </span>
              <p className="text-xs text-[var(--color-muted-light)] max-w-md mx-auto">
                We could not locate an active studio order matching reference <strong className="font-mono text-[var(--color-ink)]">{orderId}</strong> with the provided contact information.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/track-ticket"
                  className="rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                >
                  Track Support Ticket Instead →
                </Link>
                <Link
                  href="/contact?intent=support"
                  className="rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-6 py-2.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors"
                >
                  Raise Support Ticket
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="py-20 text-center text-xs text-[var(--color-muted-light)]">Loading Order Tracking...</div>}>
          <TrackOrderContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

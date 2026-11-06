"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useOrders, OrderRecord } from "@/context/OrderContext";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";
  const initialContact = searchParams.get("contact") || "";

  const { orders, lookupOrder } = useOrders();

  const [orderId, setOrderId] = useState(initialOrderId);
  const [contact, setContact] = useState(initialContact);
  const [searched, setSearched] = useState(false);
  const [matchedOrder, setMatchedOrder] = useState<OrderRecord | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Auto-lookup if query params provided
  useEffect(() => {
    if (initialOrderId) {
      // Find matching order
      const found = orders.find(
        (o) => o.id.toUpperCase() === initialOrderId.trim().toUpperCase()
      );
      if (found) {
        setMatchedOrder(found);
        setSearched(true);
      }
    }
  }, [initialOrderId, orders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setSearchError("Please enter your Order Reference (e.g. TAV-RS-2026-1001).");
      return;
    }

    setSearchError(null);
    setSearched(true);

    const found = lookupOrder(orderId, contact);
    if (found) {
      setMatchedOrder(found);
    } else {
      // Fallback lookup by Order ID if contact is empty or matches partial
      const direct = orders.find(
        (o) => o.id.toUpperCase() === orderId.trim().toUpperCase()
      );
      if (direct) {
        setMatchedOrder(direct);
      } else {
        setMatchedOrder(null);
      }
    }
  };

  const loadExample = (exId: string, exContact: string) => {
    setOrderId(exId);
    setContact(exContact);
    setSearchError(null);
    setSearched(true);
    const found = orders.find((o) => o.id === exId);
    setMatchedOrder(found || null);
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
          Tavistra Fulfilment & Production Tracking
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--color-ink)]">
          Track Your Order
        </h1>
        <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
          Monitor your studio consignment through every milestone: verified advance, workshop craft, inspection, crating, and white-glove courier transit.
        </p>
      </div>

      {/* Search Bar Card */}
      <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 sm:p-8 space-y-4 shadow-sm max-w-3xl mx-auto">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-light)] mb-1">
              Order Reference *
            </label>
            <input
              required
              type="text"
              value={orderId}
              onChange={(e) => {
                setOrderId(e.target.value);
                if (searchError) setSearchError(null);
              }}
              placeholder="e.g. TAV-RS-2026-1001"
              className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-mono"
            />
          </div>
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-light)] mb-1">
              Mobile or Email
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
            />
          </div>
          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--color-ink)] py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
            >
              Search
            </button>
          </div>
        </form>

        {searchError && (
          <p className="text-xs text-red-600 font-medium">{searchError}</p>
        )}

        {/* Quick Demo Previews */}
        <div className="pt-2 border-t border-[var(--color-decorative-border)]/60 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] text-[var(--color-muted-light)]">Quick Previews:</span>
          <button
            type="button"
            onClick={() => loadExample("TAV-RS-2026-1001", "vikramaditya@studiovishnu.in")}
            className="rounded-full border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] px-3 py-1 text-[11px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors"
          >
            Ready Stock Dispatched (1001)
          </button>
          <button
            type="button"
            onClick={() => loadExample("TAV-MTO-2026-2002", "vikramaditya@studiovishnu.in")}
            className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-900 hover:bg-amber-100 transition-colors"
          >
            Made to Order in 7-Day Grace (2002)
          </button>
        </div>
      </div>

      {/* Result Card */}
      {searched && (
        <>
          {matchedOrder ? (
            <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-8 sm:p-12 space-y-10 shadow-sm">
              {/* Order Header Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-decorative-border)] pb-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold">
                      Authoritative Order Record
                    </span>
                    <span className="rounded-md bg-[var(--color-ivory)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--color-ink)] border border-[var(--color-decorative-border)]">
                      {matchedOrder.mode === "READY_STOCK" ? "Ready Stock" : "Made to Order"}
                    </span>
                  </div>
                  <h2 className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)]">
                    {matchedOrder.id}
                  </h2>
                  <p className="text-xs text-[var(--color-muted-light)]">
                    Placed on {matchedOrder.createdAt} · Client: <strong className="text-[var(--color-ink)]">{matchedOrder.customerName}</strong>
                  </p>
                </div>
                <div className="text-left sm:text-right space-y-1">
                  <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {matchedOrder.statusLabel}
                  </span>
                  <p className="text-xs text-[var(--color-muted-light)]">
                    Destination: {matchedOrder.city}, {matchedOrder.state} ({matchedOrder.destinationPin})
                  </p>
                </div>
              </div>

              {/* Lifecycle Progress Stepper */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-[var(--color-ink)] font-semibold">
                  Milestone Lifecycle Progress
                </h3>

                {matchedOrder.mode === "MADE_TO_ORDER" ? (
                  /* MTO Stepper */
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Step 1 · Complete</span>
                      <h4 className="text-xs font-semibold text-[var(--color-ink)]">25% Advance Verified</h4>
                      <p className="text-[11px] text-[var(--color-muted-light)]">₹{matchedOrder.amountPaidRupees.toLocaleString("en-IN")} received</p>
                    </div>

                    <div className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">Step 2 · Active</span>
                      <h4 className="text-xs font-semibold text-[var(--color-ink)]">7-Day Confirmation Grace</h4>
                      <p className="text-[11px] text-amber-900 font-medium">
                        {matchedOrder.graceDaysRemaining !== undefined ? `${matchedOrder.graceDaysRemaining} days remaining` : "Active window"}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] opacity-60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--color-muted-light)] tracking-wider">Step 3 · Pending</span>
                      <h4 className="text-xs font-semibold text-[var(--color-ink)]">Workshop Machining</h4>
                      <p className="text-[11px] text-[var(--color-muted-light)]">Commences on Day 8</p>
                    </div>

                    <div className="p-4 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] opacity-60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--color-muted-light)] tracking-wider">Step 4 · Pending</span>
                      <h4 className="text-xs font-semibold text-[var(--color-ink)]">QC & Crated Dispatch</h4>
                      <p className="text-[11px] text-[var(--color-muted-light)]">Remaining 75% balance</p>
                    </div>
                  </div>
                ) : (
                  /* Ready Stock Stepper */
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Step 1 · Complete</span>
                      <h4 className="text-xs font-semibold text-[var(--color-ink)]">100% Payment Confirmed</h4>
                      <p className="text-[11px] text-[var(--color-muted-light)]">Electronic verification done</p>
                    </div>

                    <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Step 2 · Complete</span>
                      <h4 className="text-xs font-semibold text-[var(--color-ink)]">Inspection & Crating</h4>
                      <p className="text-[11px] text-[var(--color-muted-light)]">Multi-layer protective box</p>
                    </div>

                    <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Step 3 · Active</span>
                      <h4 className="text-xs font-semibold text-[var(--color-ink)]">In Transit with Carrier</h4>
                      <p className="text-[11px] text-[var(--color-muted-light)]">{matchedOrder.carrierName}</p>
                    </div>

                    <div className="p-4 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] opacity-60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--color-muted-light)] tracking-wider">Step 4 · Pending</span>
                      <h4 className="text-xs font-semibold text-[var(--color-ink)]">Out for Delivery</h4>
                      <p className="text-[11px] text-[var(--color-muted-light)]">Estimated {matchedOrder.transitEstimate}</p>
                    </div>
                  </div>
                )}

                {/* Status Narrative Callout */}
                <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-5 text-xs text-[var(--color-ink)] leading-relaxed space-y-1.5">
                  <span className="font-semibold text-[var(--color-bronze)] uppercase tracking-wider text-[11px] block">
                    Current Milestone Summary
                  </span>
                  <p>{matchedOrder.statusDescription}</p>
                  {matchedOrder.awbNumber && (
                    <p className="text-[11px] text-[var(--color-muted-light)] pt-1">
                      Carrier Air Waybill (AWB): <strong className="font-mono text-[var(--color-ink)]">{matchedOrder.awbNumber}</strong> · Insured Carriage by {matchedOrder.carrierName}
                    </p>
                  )}
                </div>
              </div>

              {/* Items & Delivery Details (2 Columns) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-[var(--color-decorative-border)]">
                {/* Left: Ordered Objects (Span 7) */}
                <div className="lg:col-span-7 space-y-3">
                  <h3 className="text-xs uppercase tracking-widest text-[var(--color-ink)] font-semibold">
                    Consignment Items
                  </h3>
                  <div className="divide-y divide-[var(--color-decorative-border)]/60 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] overflow-hidden">
                    {matchedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 text-xs">
                        <div>
                          <p className="font-semibold text-[var(--color-ink)]">{item.name}</p>
                          <p className="text-[11px] text-[var(--color-muted-light)]">Quantity: {item.quantity}</p>
                        </div>
                        <span className="font-semibold text-[var(--color-ink)]">
                          ₹{((item.pricePaise * item.quantity) / 100).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] text-xs text-[var(--color-muted-light)] space-y-1">
                    <strong className="text-[var(--color-ink)] block">Destination Address:</strong>
                    <p>{matchedOrder.addressLine1}</p>
                    <p>{matchedOrder.city}, {matchedOrder.state} — {matchedOrder.destinationPin}</p>
                  </div>
                </div>

                {/* Right: Payment Ledger & Safeguards (Span 5) */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="text-xs uppercase tracking-widest text-[var(--color-ink)] font-semibold">
                    Two-Component Price & Payment
                  </h3>
                  <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-5 space-y-3 text-xs">
                    <div className="flex justify-between text-[var(--color-muted-light)]">
                      <span>1. Items Value (Tax Inclusive):</span>
                      <span className="font-semibold text-[var(--color-ink)]">
                        {formatPrice(matchedOrder.itemsSubtotalRupees)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[var(--color-muted-light)]">
                      <span>2. Insured Crating & Freight:</span>
                      <span className="font-semibold text-[var(--color-ink)]">
                        {matchedOrder.deliveryFeeRupees === 0 ? "Complimentary" : formatPrice(matchedOrder.deliveryFeeRupees)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[var(--color-decorative-border)]/60 text-sm font-semibold text-[var(--color-ink)]">
                      <span>Total Transaction Value:</span>
                      <span>{formatPrice(matchedOrder.totalAmountRupees)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[var(--color-decorative-border)]/60 text-emerald-800 font-semibold">
                      <span>Verified Amount Paid:</span>
                      <span>{formatPrice(matchedOrder.amountPaidRupees)}</span>
                    </div>
                    {matchedOrder.balanceDueRupees > 0 && (
                      <div className="flex justify-between text-[var(--color-bronze)] font-semibold">
                        <span>Balance Due Before Dispatch (75%):</span>
                        <span>{formatPrice(matchedOrder.balanceDueRupees)}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="w-full rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] py-3 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors"
                    >
                      Print Official Invoice & Receipt
                    </button>
                    <Link
                      href={`/contact?subject=Order%20Support%20(${matchedOrder.id})&message=Inquiring%20regarding%20Order%20${matchedOrder.id}%20for%20${encodeURIComponent(matchedOrder.customerName)}.`}
                      className="block text-center w-full rounded-full bg-[var(--color-ink)] py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                    >
                      Contact Client Desk
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Not Found Screen */
            <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
              <span className="font-editorial text-3xl text-[var(--color-ink)] block">
                No Record Located
              </span>
              <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
                We could not locate an active order matching reference <strong>{orderId}</strong>. Please check your confirmation SMS or email, or select one of the quick previews above.
              </p>
              <Link
                href="/contact"
                className="inline-block rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors"
              >
                Inquire with Support
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)]">
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="mx-auto max-w-5xl py-24 px-6 text-center text-xs text-[var(--color-muted-light)]">
              Loading tracking desk...
            </div>
          }
        >
          <TrackOrderContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

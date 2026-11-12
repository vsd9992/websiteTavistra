"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useOrders, OrderRecord } from "@/context/OrderContext";

interface TrackedOrder extends OrderRecord {
  orderNumber?: string;
  qcNotes?: string;
  qcImages?: string[];
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";
  const initialContact = searchParams.get("contact") || "";

  const { orders, lookupOrder } = useOrders();

  const [orderId, setOrderId] = useState(initialOrderId);
  const [contact, setContact] = useState(initialContact);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matchedOrder, setMatchedOrder] = useState<TrackedOrder | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [payingBalance, setPayingBalance] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);

  // Direct server query function
  const fetchOrderFromServer = async (ref: string, contactInfo?: string) => {
    setLoading(true);
    setSearchError(null);
    try {
      const url = `/api/orders?orderId=${encodeURIComponent(ref.trim())}${
        contactInfo ? `&contact=${encodeURIComponent(contactInfo.trim())}` : ""
      }`;
      const res = await fetch(url, { credentials: "include" });
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

  // Auto-lookup if query params provided
  useEffect(() => {
    if (initialOrderId) {
      fetchOrderFromServer(initialOrderId, initialContact);
    }
  }, [initialOrderId, initialContact]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setSearchError("Please enter your Order Reference (e.g. TAV-RS-2026-1001).");
      return;
    }
    fetchOrderFromServer(orderId, contact);
  };

  const handlePayBalance = async () => {
    if (!matchedOrder) return;
    setPayingBalance(true);
    setPaymentSuccessMessage(null);

    try {
      const res = await fetch(`/api/orders/${matchedOrder.id}/pay-balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateway: "PHONEPE" }),
      });
      const data = await res.json();

      if (data.success) {
        setPaymentSuccessMessage(
          `Payment of ₹${matchedOrder.balanceDueRupees.toLocaleString("en-IN")} cleared successfully! Your order is now 100% verified.`
        );
        // Refresh order details from server
        await fetchOrderFromServer(matchedOrder.id, matchedOrder.email);
      } else {
        alert(data.error || "Unable to complete balance payment.");
      }
    } catch {
      alert("Network error processing balance payment.");
    } finally {
      setPayingBalance(false);
    }
  };

  const loadExample = (exId: string, exContact: string) => {
    setOrderId(exId);
    setContact(exContact);
    fetchOrderFromServer(exId, exContact);
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
                placeholder="TAV-RS-2026-1001"
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

        {/* Quick Example Chips */}
        <div className="pt-4 border-t border-[var(--color-decorative-border)]/60 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-[var(--color-muted-light)]">Test Records in Database:</span>
          <button
            type="button"
            onClick={() => loadExample("TAV-RS-2026-1001", "arjun.mehta@studio.in")}
            className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-900 hover:bg-blue-100 transition-colors"
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
          <button
            type="button"
            onClick={() => loadExample("TAV-MTO-2026-2004", "vikramaditya@studiovishnu.in")}
            className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-900 hover:bg-emerald-100 transition-colors"
          >
            MTO Finished with QC Photos (2004)
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {paymentSuccessMessage && (
        <div className="mx-auto max-w-2xl p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-xs text-emerald-900 font-semibold text-center">
          ✓ {paymentSuccessMessage}
        </div>
      )}

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

                    <div className={`p-4 rounded-xl border space-y-1 ${
                      matchedOrder.status === "CONFIRMED"
                        ? "border-2 border-amber-400 bg-amber-50"
                        : "border-emerald-300 bg-emerald-50/70"
                    }`}>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900">
                        Step 2 · {matchedOrder.status === "CONFIRMED" ? "Active" : "Complete"}
                      </span>
                      <h4 className="text-xs font-semibold text-[var(--color-ink)]">7-Day Confirmation Grace</h4>
                      <p className="text-[11px] text-amber-900 font-medium">
                        {matchedOrder.status === "CONFIRMED"
                          ? `${matchedOrder.graceDaysRemaining !== undefined ? matchedOrder.graceDaysRemaining : 4} days remaining`
                          : "Grace concluded · Machined"}
                      </p>
                    </div>

                    <div className={`p-4 rounded-xl border space-y-1 ${
                      matchedOrder.status === "IN_PRODUCTION"
                        ? "border-2 border-blue-400 bg-blue-50"
                        : matchedOrder.status === "PRODUCTION_COMPLETED" || matchedOrder.status === "AWAITING_DISPATCH" || matchedOrder.status === "DISPATCHED"
                        ? "border-emerald-300 bg-emerald-50/70"
                        : "border-[var(--color-decorative-border)] bg-[var(--color-ivory)] opacity-60"
                    }`}>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-ink)]">
                        Step 3 · {matchedOrder.status === "IN_PRODUCTION" ? "Active" : matchedOrder.status === "CONFIRMED" ? "Pending" : "Complete"}
                      </span>
                      <h4 className="text-xs font-semibold text-[var(--color-ink)]">Workshop Machining</h4>
                      <p className="text-[11px] text-[var(--color-muted-light)]">
                        {matchedOrder.status === "IN_PRODUCTION" ? "Active Crafting in Studio" : matchedOrder.status === "CONFIRMED" ? "Commences on Day 8" : "Machining Finished"}
                      </p>
                    </div>

                    <div className={`p-4 rounded-xl border space-y-1 ${
                      matchedOrder.status === "DISPATCHED"
                        ? "border-2 border-emerald-500 bg-emerald-50"
                        : matchedOrder.status === "PRODUCTION_COMPLETED" || matchedOrder.status === "AWAITING_DISPATCH"
                        ? "border-2 border-amber-400 bg-amber-50"
                        : "border-[var(--color-decorative-border)] bg-[var(--color-ivory)] opacity-60"
                    }`}>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-ink)]">
                        Step 4 · {matchedOrder.status === "DISPATCHED" ? "In Transit" : matchedOrder.status === "PRODUCTION_COMPLETED" ? "QC Ready" : "Pending"}
                      </span>
                      <h4 className="text-xs font-semibold text-[var(--color-ink)]">QC & Insured Handover</h4>
                      <p className="text-[11px] text-[var(--color-muted-light)]">
                        {matchedOrder.balanceDueRupees === 0 ? "100% Paid" : `₹${matchedOrder.balanceDueRupees.toLocaleString("en-IN")} due`}
                      </p>
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

              {/* STUDIO WORKSHOP QC PHOTOS GALLERY (IF AVAILABLE) */}
              {matchedOrder.qcImages && matchedOrder.qcImages.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-[var(--color-decorative-border)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[var(--color-bronze)] font-semibold block">
                        Studio Workshop Verification
                      </span>
                      <h3 className="font-editorial text-2xl text-[var(--color-ink)]">
                        Finished Piece QC Inspection Photos
                      </h3>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      ✓ Quality Control Passed
                    </span>
                  </div>
                  {matchedOrder.qcNotes && (
                    <div className="p-4 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] text-xs text-[var(--color-ink)] leading-relaxed">
                      <strong className="block text-[11px] uppercase tracking-wider text-[var(--color-muted-light)] pb-1">Master Craftsman Notes:</strong>
                      {matchedOrder.qcNotes}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {matchedOrder.qcImages.map((imgUrl, i) => (
                      <div key={i} className="group relative rounded-xl overflow-hidden border border-[var(--color-decorative-border)] aspect-[16/10] bg-neutral-100">
                        <img
                          src={imgUrl}
                          alt={`QC Inspection ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] backdrop-blur-sm">
                          QC Photo {i + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

                {/* Right: Payment Ledger, 75% Balance Action & Safeguards (Span 5) */}
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

                  {/* DAY 1 ENABLED 75% BALANCE PAYMENT ACTION */}
                  {matchedOrder.balanceDueRupees > 0 && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900">
                          Balance Settlement (Day 1 Enabled)
                        </span>
                        <span className="text-xs font-bold text-amber-900">
                          {formatPrice(matchedOrder.balanceDueRupees)}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        You may clear your remaining balance now or after reviewing workshop QC photos. Under studio policy, 100% payment must be verified before crating and courier handover.
                      </p>
                      <button
                        type="button"
                        onClick={handlePayBalance}
                        disabled={payingBalance}
                        className="w-full rounded-full bg-emerald-800 py-3 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                      >
                        {payingBalance ? "Verifying PhonePe Gateway..." : `Pay Remaining Balance (${formatPrice(matchedOrder.balanceDueRupees)})`}
                      </button>
                    </div>
                  )}

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
            <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-12 text-center space-y-4">
              <span className="font-editorial text-2xl text-[var(--color-ink)] block">
                No Record Located
              </span>
              <p className="text-xs text-[var(--color-muted-light)] max-w-md mx-auto">
                We could not locate an active studio order matching reference <strong className="font-mono text-[var(--color-ink)]">{orderId}</strong> with the provided contact information.
              </p>
              <p className="text-[11px] text-[var(--color-muted-light)]">
                Please double-check your Order Confirmation SMS/Email or contact our studio desk for direct assistance.
              </p>
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

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

interface TrackedTicketMessage {
  id: string;
  sender: "CUSTOMER" | "STAFF";
  authorName: string;
  text: string;
  timestamp: string;
}

interface TrackedTicket {
  id: string;
  ticketNumber: string;
  orderNumber?: string;
  customerName: string;
  email: string;
  phone: string;
  subject: string;
  category: string;
  priority: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
  messages: TrackedTicketMessage[];
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || searchParams.get("order") || "";
  const initialTicketId = searchParams.get("ticket") || searchParams.get("ticketNumber") || "";
  const initialContact = searchParams.get("contact") || "";

  const [trackMode, setTrackMode] = useState<"ORDER" | "TICKET">(
    initialTicketId || (initialOrderId && initialOrderId.startsWith("TCK")) ? "TICKET" : "ORDER"
  );

  const [referenceId, setReferenceId] = useState(initialTicketId || initialOrderId);
  const [contact, setContact] = useState(initialContact);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matchedOrder, setMatchedOrder] = useState<TrackedOrder | null>(null);
  const [matchedTicket, setMatchedTicket] = useState<TrackedTicket | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Balance payment states
  const [payingBalance, setPayingBalance] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);

  // Ticket reply states
  const [ticketReplyText, setTicketReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);

  // Direct server query function for Orders
  const fetchOrderFromServer = async (ref: string, contactInfo?: string) => {
    setLoading(true);
    setSearchError(null);
    setMatchedTicket(null);
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

  // Direct server query function for Support Tickets
  const fetchTicketFromServer = async (ref: string, contactInfo?: string) => {
    setLoading(true);
    setSearchError(null);
    setMatchedOrder(null);
    try {
      const url = `/api/tickets?ticketNumber=${encodeURIComponent(ref.trim())}${
        contactInfo ? `&contact=${encodeURIComponent(contactInfo.trim())}` : ""
      }`;
      const res = await fetch(url, { credentials: "include", cache: "no-store" });
      const data = await res.json();

      if (res.ok && data.found && data.ticket) {
        setMatchedTicket(data.ticket);
        setSearched(true);
        setLoading(false);
        return true;
      }

      if (res.status === 401 || res.status === 403 || res.status === 404) {
        setMatchedTicket(null);
        setSearched(true);
        setSearchError(
          data.error ||
            "Provide the registered email or mobile number associated with this ticket to inspect the thread."
        );
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.warn("Backend ticket lookup error:", err);
      setSearchError("Unable to reach the ticket tracking service. Please try again.");
    }

    setMatchedTicket(null);
    setSearched(true);
    setLoading(false);
    return false;
  };

  // Auto-lookup if query params provided
  useEffect(() => {
    if (initialTicketId) {
      setTrackMode("TICKET");
      setReferenceId(initialTicketId);
      setContact(initialContact);
      fetchTicketFromServer(initialTicketId, initialContact);
    } else if (initialOrderId) {
      if (initialOrderId.startsWith("TCK")) {
        setTrackMode("TICKET");
        setReferenceId(initialOrderId);
        setContact(initialContact);
        fetchTicketFromServer(initialOrderId, initialContact);
      } else {
        setTrackMode("ORDER");
        setReferenceId(initialOrderId);
        setContact(initialContact);
        fetchOrderFromServer(initialOrderId, initialContact);
      }
    } else {
      setReferenceId("");
      setContact("");
      setMatchedOrder(null);
      setMatchedTicket(null);
      setSearched(false);
      setSearchError(null);
      setPaymentSuccessMessage(null);
      setPaymentErrorMessage(null);
    }
  }, [initialOrderId, initialTicketId, initialContact]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceId.trim()) {
      setSearchError(
        trackMode === "ORDER"
          ? "Please enter your Order Reference (e.g. TAV-RS-2026-1001)."
          : "Please enter your Ticket Reference (e.g. TCK-2026-0101)."
      );
      return;
    }

    const cleanRef = referenceId.trim().toUpperCase();
    if (cleanRef.startsWith("TCK")) {
      setTrackMode("TICKET");
      fetchTicketFromServer(cleanRef, contact);
    } else if (cleanRef.startsWith("TAV") || cleanRef.startsWith("ORD")) {
      setTrackMode("ORDER");
      fetchOrderFromServer(cleanRef, contact);
    } else {
      if (trackMode === "TICKET") {
        fetchTicketFromServer(cleanRef, contact);
      } else {
        fetchOrderFromServer(cleanRef, contact);
      }
    }
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
        // Refresh order details from server
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

  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedTicket || !ticketReplyText.trim()) return;

    setSubmittingReply(true);
    setReplyError(null);
    setReplySuccess(null);

    try {
      const res = await fetch(`/api/tickets/${matchedTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "CUSTOMER",
          authorName: matchedTicket.customerName,
          text: ticketReplyText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to post message to ticket thread.");
      }

      setMatchedTicket((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: data.ticketStatus || (prev.status === "RESOLVED" ? "IN_PROGRESS" : prev.status),
          messages: [...prev.messages, data.message],
        };
      });

      setTicketReplyText("");
      setReplySuccess("Your follow-up note has been submitted to the studio concierge desk.");
    } catch (err) {
      setReplyError((err as Error).message || "Failed to deliver message.");
    } finally {
      setSubmittingReply(false);
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
          Tavistra Fulfilment &amp; Concierge Desk
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--color-ink)]">
          {trackMode === "TICKET" ? "Track Support Ticket" : "Track Your Order"}
        </h1>
        <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
          {trackMode === "TICKET"
            ? "Inspect two-way studio conversation threads, request alterations, and track concierge desk resolutions."
            : "Monitor your studio consignment through every milestone: verified advance, workshop craft, inspection, crating, and white-glove courier transit."}
        </p>
      </div>

      {/* Dual Switcher: Track Order vs Track Support Ticket */}
      <div className="max-w-md mx-auto grid grid-cols-2 p-1.5 rounded-2xl bg-[var(--color-stone)] border border-[var(--color-decorative-border)]">
        <button
          type="button"
          onClick={() => {
            setTrackMode("ORDER");
            setSearchError(null);
            setMatchedTicket(null);
            if (referenceId.startsWith("TCK")) setReferenceId("");
          }}
          className={`py-2.5 px-4 rounded-xl text-xs font-semibold transition-all text-center ${
            trackMode === "ORDER"
              ? "bg-[var(--color-canvas)] text-[var(--color-ink)] shadow-sm"
              : "text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
          }`}
        >
          Track Consignment / Order
        </button>
        <button
          type="button"
          onClick={() => {
            setTrackMode("TICKET");
            setSearchError(null);
            setMatchedOrder(null);
            if (referenceId.startsWith("TAV")) setReferenceId("");
          }}
          className={`py-2.5 px-4 rounded-xl text-xs font-semibold transition-all text-center ${
            trackMode === "TICKET"
              ? "bg-[var(--color-canvas)] text-[var(--color-ink)] shadow-sm"
              : "text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
          }`}
        >
          Track Support Ticket
        </button>
      </div>

      {/* Tracking Search Form */}
      <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-8 shadow-sm space-y-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="referenceId" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                {trackMode === "TICKET" ? "Ticket Reference *" : "Order Reference *"}
              </label>
              <input
                id="referenceId"
                type="text"
                placeholder={trackMode === "TICKET" ? "TCK-2026-0101" : "TAV-RS-2026-1001"}
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
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
            {loading
              ? "Searching Authoritative Records..."
              : trackMode === "TICKET"
              ? "Locate Support Ticket & Conversation Thread"
              : "Locate Consignment & Production Record"}
          </button>
        </form>
      </div>

      {/* SUPPORT TICKET VIEW */}
      {trackMode === "TICKET" && searched && (
        <>
          {matchedTicket ? (
            <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-8 shadow-sm space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--color-decorative-border)] gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-base font-bold text-[var(--color-ink)]">
                      {matchedTicket.ticketNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider ${
                        matchedTicket.status === "OPEN"
                          ? "bg-rose-100 text-rose-900 border border-rose-300"
                          : matchedTicket.status === "IN_PROGRESS"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      }`}
                    >
                      {matchedTicket.status === "OPEN"
                        ? "Open · Awaiting Concierge Review"
                        : matchedTicket.status === "IN_PROGRESS"
                        ? "In Progress · Concierge Active"
                        : "✓ Resolved"}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[var(--color-stone)] text-[var(--color-ink)]">
                      {matchedTicket.category.replace(/_/g, " ")}
                    </span>
                  </div>
                  <h2 className="font-editorial text-2xl text-[var(--color-ink)]">
                    {matchedTicket.subject}
                  </h2>
                  <p className="text-xs text-[var(--color-muted-light)]">
                    Submitted on {matchedTicket.createdAt} by {matchedTicket.customerName}
                  </p>
                </div>

                {matchedTicket.orderNumber && (
                  <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-3 text-right">
                    <span className="text-[10px] uppercase font-semibold text-[var(--color-muted-light)] block">
                      Linked Consignment
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTrackMode("ORDER");
                        setReferenceId(matchedTicket.orderNumber!);
                        fetchOrderFromServer(matchedTicket.orderNumber!, contact || matchedTicket.email);
                      }}
                      className="font-mono text-xs font-bold text-[var(--color-bronze)] hover:underline inline-block mt-0.5"
                    >
                      {matchedTicket.orderNumber} →
                    </button>
                  </div>
                )}
              </div>

              {/* Conversation Thread */}
              <div className="space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-light)] block">
                  Concierge Conversation History ({matchedTicket.messages.length} notes)
                </span>

                <div className="space-y-4">
                  {matchedTicket.messages.map((msg) => {
                    const isStaff = msg.sender === "STAFF";
                    return (
                      <div
                        key={msg.id}
                        className={`rounded-2xl p-5 border transition-all ${
                          isStaff
                            ? "bg-[#faf7f2] border-[var(--color-bronze)]/50 sm:mr-8"
                            : "bg-[var(--color-canvas)] border-[var(--color-decorative-border)] sm:ml-8"
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--color-decorative-border)]/40 text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                isStaff
                                  ? "bg-[var(--color-bronze)] text-[var(--color-canvas)]"
                                  : "bg-[var(--color-stone)] text-[var(--color-ink)]"
                              }`}
                            >
                              {isStaff ? "Studio Concierge" : "Client"}
                            </span>
                            <span className="font-semibold text-[var(--color-ink)]">
                              {msg.authorName}
                            </span>
                          </div>
                          <span className="text-[11px] text-[var(--color-muted-light)]">
                            {msg.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-ink)] leading-relaxed whitespace-pre-line">
                          {msg.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reply Box */}
              <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                  Add Follow-Up Note or Alteration Request
                </h4>

                {replySuccess && (
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900">
                    ✓ {replySuccess}
                  </div>
                )}
                {replyError && (
                  <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-900">
                    ⚠ {replyError}
                  </div>
                )}

                <form onSubmit={handleSendTicketReply} className="space-y-3">
                  <textarea
                    rows={4}
                    value={ticketReplyText}
                    onChange={(e) => setTicketReplyText(e.target.value)}
                    placeholder="Type your message, query, or specification details for the concierge desk..."
                    className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-mono leading-relaxed"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[var(--color-muted-light)]">
                      {matchedTicket.status === "RESOLVED"
                        ? "Posting a message will reopen this ticket for concierge review."
                        : "Messages are delivered directly to assigned studio staff."}
                    </span>
                    <button
                      type="submit"
                      disabled={submittingReply || !ticketReplyText.trim()}
                      className="rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      {submittingReply ? "Posting Message..." : "Post Follow-Up Message"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-12 text-center space-y-4">
              <span className="font-editorial text-2xl text-[var(--color-ink)] block">
                No Support Ticket Located
              </span>
              <p className="text-xs text-[var(--color-muted-light)] max-w-md mx-auto">
                We could not locate a support ticket matching reference <strong className="font-mono text-[var(--color-ink)]">{referenceId}</strong> with the provided contact information.
              </p>
              <div className="pt-2">
                <Link
                  href="/contact?intent=support"
                  className="inline-block rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                >
                  Create New Support Ticket
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {/* ORDER RESULTS VIEW */}
      {trackMode === "ORDER" && searched && (
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

                <div className="flex items-center gap-3">
                  <Link
                    href={`/contact?intent=support&order=${encodeURIComponent(matchedOrder.id)}&subject=${encodeURIComponent(`Assistance for Order ${matchedOrder.id}`)}`}
                    className="rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors"
                  >
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

              {/* Status Notice / Notifications */}
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
                        className="block text-center w-full rounded-full bg-[var(--color-ink)] py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                      >
                        Contact Client Desk / Raise Ticket
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
                No Record Located
              </span>
              <p className="text-xs text-[var(--color-muted-light)] max-w-md mx-auto">
                We could not locate an active studio order matching reference <strong className="font-mono text-[var(--color-ink)]">{referenceId}</strong> with the provided contact information.
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

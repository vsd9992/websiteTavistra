"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface TicketMessageItem {
  id: string;
  sender: "CUSTOMER" | "STAFF";
  authorName: string;
  text: string;
  timestamp: string;
}

interface SupportTicketDetail {
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
  messages: TicketMessageItem[];
}

function TrackTicketContent() {
  const searchParams = useSearchParams();
  const initialTicketParam = searchParams.get("ticket") || searchParams.get("ticketNumber") || "";
  const initialContactParam = searchParams.get("contact") || "";

  const [ticketNumberInput, setTicketNumberInput] = useState(initialTicketParam);
  const [contactInput, setContactInput] = useState(initialContactParam);

  const [ticket, setTicket] = useState<SupportTicketDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Follow-up reply state
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);

  const fetchTicket = async (ref: string, contactVal: string) => {
    if (!ref.trim()) {
      setErrorMessage("Please enter your Ticket Reference (e.g. TCK-2026-0101).");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setReplySuccess(null);
    setReplyError(null);

    try {
      const cleanRef = ref.trim().toUpperCase();
      const url = `/api/tickets?ticketNumber=${encodeURIComponent(cleanRef)}${
        contactVal ? `&contact=${encodeURIComponent(contactVal.trim())}` : ""
      }`;

      const res = await fetch(url, { credentials: "include", cache: "no-store" });
      const data = await res.json();

      if (res.ok && data.found && data.ticket) {
        setTicket(data.ticket);
        setSearched(true);
        setLoading(false);
        return;
      }

      setTicket(null);
      setSearched(true);
      setLoading(false);

      if (res.status === 401 || res.status === 403) {
        setErrorMessage(
          data.error ||
            "Please provide the registered billing email or mobile number associated with this ticket to verify your identity."
        );
      } else {
        setErrorMessage(data.error || "No support ticket found matching this reference.");
      }
    } catch {
      setTicket(null);
      setSearched(true);
      setLoading(false);
      setErrorMessage("Unable to connect to the concierge desk. Please check your network and retry.");
    }
  };

  useEffect(() => {
    if (initialTicketParam) {
      setTicketNumberInput(initialTicketParam);
      setContactInput(initialContactParam);
      fetchTicket(initialTicketParam, initialContactParam);
    }
  }, [initialTicketParam, initialContactParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTicket(ticketNumberInput, contactInput);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !replyText.trim()) return;

    setSubmittingReply(true);
    setReplyError(null);
    setReplySuccess(null);

    try {
      const res = await fetch(`/api/tickets/${ticket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "CUSTOMER",
          authorName: ticket.customerName,
          text: replyText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to post message to the concierge desk.");
      }

      setTicket((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: data.ticketStatus || (prev.status === "RESOLVED" ? "IN_PROGRESS" : prev.status),
          messages: [...prev.messages, data.message],
        };
      });

      setReplyText("");
      setReplySuccess("Your response has been dispatched to the studio concierge desk.");
    } catch (err) {
      setReplyError((err as Error).message || "Failed to post reply.");
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-12 px-6 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold block">
          Tavistra Client Concierge Desk
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--color-ink)]">
          Track Support Ticket
        </h1>
        <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
          Inspect two-way conversation threads with studio staff, submit follow-up notes, and track alteration or resolution progress.
        </p>
      </div>

      {/* Ticket Lookup Card */}
      <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-8 shadow-sm space-y-6 max-w-2xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="ticketRef" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                Ticket Reference *
              </label>
              <input
                id="ticketRef"
                type="text"
                placeholder="e.g. TCK-2026-0101"
                value={ticketNumberInput}
                onChange={(e) => setTicketNumberInput(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-ivory)] px-4 py-3 text-xs text-[var(--color-ink)] placeholder-[var(--color-muted-light)] focus:border-[var(--color-ink)] focus:outline-none font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="contactRef" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                Registered Email or Mobile *
              </label>
              <input
                id="contactRef"
                type="text"
                placeholder="name@studio.in or 98765..."
                value={contactInput}
                onChange={(e) => setContactInput(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-ivory)] px-4 py-3 text-xs text-[var(--color-ink)] placeholder-[var(--color-muted-light)] focus:border-[var(--color-ink)] focus:outline-none"
              />
            </div>
          </div>

          <p className="text-[11px] text-[var(--color-muted-light)]">
            Registered contact information is required to securely view conversation threads without requiring an account login.
          </p>

          {errorMessage && (
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-900">
              ⚠ {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[var(--color-ink)] py-3.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm disabled:opacity-50 uppercase tracking-wider"
          >
            {loading ? "Searching Concierge Desk Records..." : "Locate Support Ticket"}
          </button>
        </form>

        <div className="pt-2 border-t border-[var(--color-decorative-border)] flex items-center justify-between text-xs text-[var(--color-muted-light)]">
          <span>Need to raise a new query?</span>
          <Link href="/contact?intent=support" className="font-semibold text-[var(--color-bronze)] hover:underline">
            Raise Support Ticket →
          </Link>
        </div>
      </div>

      {/* Ticket Details & Thread */}
      {searched && (
        <>
          {ticket ? (
            <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-8 shadow-sm space-y-8">
              {/* Ticket Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--color-decorative-border)] gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-base font-bold text-[var(--color-ink)]">
                      {ticket.ticketNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider ${
                        ticket.status === "OPEN"
                          ? "bg-rose-100 text-rose-900 border border-rose-300"
                          : ticket.status === "IN_PROGRESS"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      }`}
                    >
                      {ticket.status === "OPEN"
                        ? "Open · Awaiting Concierge Review"
                        : ticket.status === "IN_PROGRESS"
                        ? "In Progress · Concierge Active"
                        : "✓ Resolved"}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[var(--color-stone)] text-[var(--color-ink)]">
                      {ticket.category.replace(/_/g, " ")}
                    </span>
                  </div>

                  <h2 className="font-editorial text-2xl text-[var(--color-ink)]">
                    {ticket.subject}
                  </h2>
                  <p className="text-xs text-[var(--color-muted-light)]">
                    Opened on {ticket.createdAt} by <strong className="text-[var(--color-ink)]">{ticket.customerName}</strong>
                  </p>
                </div>

                {ticket.orderNumber && (
                  <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-3 text-right">
                    <span className="text-[10px] uppercase font-semibold text-[var(--color-muted-light)] block">
                      Linked Consignment Order
                    </span>
                    <Link
                      href={`/track?orderId=${encodeURIComponent(ticket.orderNumber)}&contact=${encodeURIComponent(contactInput || ticket.email)}`}
                      className="font-mono text-xs font-bold text-[var(--color-bronze)] hover:underline inline-block mt-0.5"
                    >
                      {ticket.orderNumber} (Track Shipment) →
                    </Link>
                  </div>
                )}
              </div>

              {/* Conversation Thread */}
              <div className="space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-light)] block">
                  Concierge Conversation History ({ticket.messages.length} notes)
                </span>

                <div className="space-y-4">
                  {ticket.messages.map((msg) => {
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

              {/* Reply Form */}
              <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                  Add Follow-Up Note or Question
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

                <form onSubmit={handleSendReply} className="space-y-3">
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your follow-up note, spec detail, or query for the concierge desk..."
                    className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-mono leading-relaxed"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[11px] text-[var(--color-muted-light)]">
                      {ticket.status === "RESOLVED"
                        ? "Note: Replying will automatically re-open this ticket for concierge review."
                        : "Messages are delivered directly to the assigned studio desk staff."}
                    </span>
                    <button
                      type="submit"
                      disabled={submittingReply || !replyText.trim()}
                      className="rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm shrink-0"
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
                We could not locate a support ticket matching reference <strong className="font-mono text-[var(--color-ink)]">{ticketNumberInput}</strong> with the provided contact information.
              </p>
              <div className="pt-2">
                <Link
                  href="/contact?intent=support"
                  className="inline-block rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                >
                  Raise a New Support Ticket
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {/* Cross link to Order Tracking */}
      <div className="text-center pt-4">
        <p className="text-xs text-[var(--color-muted-light)]">
          Looking to track physical delivery milestones of a confirmed order?{" "}
          <Link href="/track" className="font-semibold text-[var(--color-bronze)] hover:underline">
            Track Consignment Order Here →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function TrackTicketPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="py-20 text-center text-xs text-[var(--color-muted-light)]">Loading Ticket Tracking...</div>}>
          <TrackTicketContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}


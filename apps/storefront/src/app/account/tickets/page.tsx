"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import AccountNav from "@/components/AccountNav";
import { useAuth } from "@/context/AuthContext";

interface TicketMessage {
  id: string;
  sender: string;
  authorName: string;
  text: string;
  createdAt: string;
}

interface AccountTicket {
  id: string;
  ticketNumber: string;
  orderNumber?: string | null;
  customerName: string;
  email: string;
  phone: string;
  subject: string;
  category: string;
  categoryLabel: string;
  priority: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
  messagesCount: number;
  latestMessage?: {
    text: string;
    sender: string;
    authorName: string;
    createdAt: string;
  } | null;
  messages: TicketMessage[];
}

export default function AccountTicketsPage() {
  const { user, isAuthenticated, authLoading } = useAuth();
  const [tickets, setTickets] = useState<AccountTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "IN_PROGRESS" | "RESOLVED">("ALL");
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/tickets", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to load support tickets.");
      }
      setTickets(Array.isArray(data.tickets) ? data.tickets : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load support tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setTickets([]);
      return;
    }
    void loadTickets();
  }, [isAuthenticated]);

  const handleSendReply = async (ticketId: string) => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    setReplyError(null);
    try {
      const res = await fetch(`/api/tickets/${encodeURIComponent(ticketId)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: user?.name || "Client",
          text: replyText.trim(),
          sender: "CUSTOMER",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to post message.");
      }
      setReplyText("");
      await loadTickets();
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : "Error submitting follow-up.");
    } finally {
      setSendingReply(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === "ALL") return true;
    return t.status === statusFilter;
  });

  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)]">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-12 lg:py-16">
        {authLoading ? (
          <div className="py-24 text-center text-xs text-[var(--color-muted-light)]">
            Verifying your client session...
          </div>
        ) : !isAuthenticated ? (
          <div className="mx-auto max-w-md rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-8 text-center space-y-4">
            <h1 className="font-serif text-2xl text-[var(--color-ink)]">
              Client Portal Sign In
            </h1>
            <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
              Please sign in to access your registered support tickets and concierge correspondence.
            </p>
            <div className="pt-2">
              <Link
                href="/account/login?redirect=/account/tickets"
                className="inline-block rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors"
              >
                Sign In to Account
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-3">
              <AccountNav />
            </div>

            <div className="lg:col-span-9 space-y-6">
              {/* Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-decorative-border)] pb-6">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-bronze)]">
                    Concierge &amp; Resolution Desk
                  </p>
                  <h1 className="font-serif text-2xl sm:text-3xl text-[var(--color-ink)] mt-1">
                    Support Tickets &amp; Inquiries
                  </h1>
                  <p className="text-xs text-[var(--color-muted-light)] mt-1">
                    Manage direct communications, 7-day grace alteration requests, and courier assistance.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/contact?intent=support"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Raise Support Ticket</span>
                  </Link>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStatusFilter("ALL")}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === "ALL"
                      ? "bg-[var(--color-ink)] text-[var(--color-canvas)]"
                      : "bg-[var(--color-stone)] text-[var(--color-ink)] hover:bg-[var(--color-stone)]/80"
                  }`}
                >
                  All Tickets ({tickets.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("OPEN")}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === "OPEN"
                      ? "bg-amber-700 text-white"
                      : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  Open ({openCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("IN_PROGRESS")}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === "IN_PROGRESS"
                      ? "bg-blue-700 text-white"
                      : "bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100"
                  }`}
                >
                  In Progress ({inProgressCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("RESOLVED")}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === "RESOLVED"
                      ? "bg-emerald-700 text-white"
                      : "bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  Resolved ({resolvedCount})
                </button>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-900">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="py-16 text-center text-xs text-[var(--color-muted-light)]">
                  Loading your support tickets...
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/70 p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-stone)] text-[var(--color-ink)] mx-auto flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-lg text-[var(--color-ink)]">
                    {statusFilter === "ALL" ? "No support tickets found" : `No ${statusFilter.toLowerCase().replace("_", " ")} tickets found`}
                  </h3>
                  <p className="text-xs text-[var(--color-muted-light)] max-w-md mx-auto leading-relaxed">
                    Need assistance with a recent order, finish alteration, or delivery schedule? Our client concierge desk is at your service.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/contact?intent=support"
                      className="inline-block rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors"
                    >
                      Raise a Support Ticket →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => {
                    const isExpanded = expandedTicketId === ticket.id;
                    const isResolved = ticket.status === "RESOLVED";

                    return (
                      <div
                        key={ticket.id}
                        className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] transition-shadow hover:shadow-sm overflow-hidden"
                      >
                        {/* Summary Header */}
                        <div className="p-6 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[var(--color-ink)]">
                                {ticket.ticketNumber}
                              </span>
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                  ticket.status === "RESOLVED"
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : ticket.status === "IN_PROGRESS"
                                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                                    : "bg-amber-100 text-amber-800 border border-amber-200"
                                }`}
                              >
                                {ticket.statusLabel}
                              </span>
                              {ticket.priority !== "NORMAL" && (
                                <span className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                                  {ticket.priority} Priority
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-[var(--color-muted-light)]">
                              Raised on {new Date(ticket.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <h3 className="font-serif text-base text-[var(--color-ink)] font-medium">
                              {ticket.subject}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-muted-light)]">
                              <span>
                                Category: <strong className="text-[var(--color-ink)] font-medium">{ticket.categoryLabel}</strong>
                              </span>
                              {ticket.orderNumber && (
                                <span>
                                  Order:{" "}
                                  <Link
                                    href={`/track?orderId=${encodeURIComponent(ticket.orderNumber)}`}
                                    className="font-mono text-[var(--color-bronze)] font-semibold hover:underline"
                                  >
                                    {ticket.orderNumber}
                                  </Link>
                                </span>
                              )}
                              <span>
                                {ticket.messagesCount} message{ticket.messagesCount === 1 ? "" : "s"}
                              </span>
                            </div>
                          </div>

                          {ticket.latestMessage && (
                            <div className="rounded-xl bg-[var(--color-stone)]/50 p-3 text-xs text-[var(--color-muted-light)] border border-[var(--color-decorative-border)]/40 line-clamp-2">
                              <span className="font-semibold text-[var(--color-ink)]">
                                {ticket.latestMessage.sender === "STAFF" ? "Studio Concierge" : "You"}:{" "}
                              </span>
                              {ticket.latestMessage.text}
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--color-decorative-border)]/60">
                            <button
                              type="button"
                              onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                              className="text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-bronze)] transition-colors flex items-center gap-1.5"
                            >
                              <span>{isExpanded ? "Hide Conversation Thread" : "View Thread & Reply"}</span>
                              <svg
                                className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            <Link
                              href={`/track-ticket?ticket=${encodeURIComponent(ticket.ticketNumber)}&contact=${encodeURIComponent(user?.email || "")}`}
                              className="text-xs text-[var(--color-muted-light)] hover:text-[var(--color-ink)] underline flex items-center gap-1"
                            >
                              Standalone Ticket View →
                            </Link>
                          </div>
                        </div>

                        {/* Expandable Conversation Thread */}
                        {isExpanded && (
                          <div className="border-t border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/40 p-6 space-y-6">
                            <div className="space-y-4">
                              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-light)]">
                                Conversation Thread
                              </h4>

                              <div className="space-y-3">
                                {ticket.messages.map((msg) => {
                                  const isStaff = msg.sender === "STAFF";
                                  return (
                                    <div
                                      key={msg.id}
                                      className={`rounded-xl p-4 text-xs space-y-1.5 ${
                                        isStaff
                                          ? "bg-[var(--color-canvas)] border border-[var(--color-decorative-border)] mr-4 shadow-sm"
                                          : "bg-stone-100/80 border border-stone-200 ml-4"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span
                                          className={`font-semibold ${
                                            isStaff ? "text-[var(--color-bronze)]" : "text-[var(--color-ink)]"
                                          }`}
                                        >
                                          {isStaff ? `Official Desk (${msg.authorName})` : `${msg.authorName} (Client)`}
                                        </span>
                                        <span className="text-[10px] text-[var(--color-muted-light)]">
                                          {new Date(msg.createdAt).toLocaleString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            hour: "numeric",
                                            minute: "2-digit",
                                            hour12: true,
                                          })}
                                        </span>
                                      </div>
                                      <p className="text-[var(--color-ink)] whitespace-pre-wrap leading-relaxed">
                                        {msg.text}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Reply Input Box */}
                            <div className="pt-2 space-y-3 border-t border-[var(--color-decorative-border)]/60">
                              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                                Send Follow-Up Message
                              </label>
                              {isResolved && (
                                <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                                  ℹ This ticket is currently marked as <strong>Resolved</strong>. Sending a new follow-up will automatically reopen it to <strong>In Progress</strong> with our concierge desk.
                                </p>
                              )}
                              <textarea
                                rows={3}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your note, alteration request, or question for the concierge desk..."
                                className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] p-3 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] leading-relaxed"
                              />

                              {replyError && (
                                <p className="text-xs text-rose-700">{replyError}</p>
                              )}

                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleSendReply(ticket.id)}
                                  disabled={sendingReply || !replyText.trim()}
                                  className="rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                  {sendingReply ? "Transmitting..." : "Send Reply to Desk"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}


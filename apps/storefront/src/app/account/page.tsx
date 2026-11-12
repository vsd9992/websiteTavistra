"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import AccountNav from "@/components/AccountNav";
import { useAuth } from "@/context/AuthContext";

interface AccountOrderItem {
  name: string;
  quantity: number;
  pricePaise: number;
}

interface AccountOrder {
  id: string;
  orderNumber: string;
  mode: string;
  city: string;
  state: string;
  items: AccountOrderItem[];
  totalAmountRupees: number;
  amountPaidRupees: number;
  balanceDueRupees: number;
  status: string;
  statusLabel: string;
  createdAt: string;
}

interface AccountQuote {
  id: string;
  quoteNumber: string;
  status: string;
  expiresAt: string;
  versions: {
    versionNumber: number;
    quotedAmount: number | string;
    advanceRequired: number | string;
  }[];
}

export default function AccountOverviewPage() {
  const { user, isAuthenticated, authLoading } = useAuth();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [quotes, setQuotes] = useState<AccountQuote[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      setOrders([]);
      setQuotes([]);
      return;
    }

    let cancelled = false;
    setOrdersLoading(true);
    Promise.all([
      fetch("/api/account/orders", { credentials: "include" }).then((res) => (res.ok ? res.json() : { orders: [] })),
      fetch(`/api/quotes?email=${encodeURIComponent(user.email)}`, { credentials: "include" }).then((res) =>
        res.ok ? res.json() : { proposals: [] }
      ),
    ])
      .then(([ordersData, quotesData]) => {
        if (!cancelled) {
          if (Array.isArray(ordersData.orders)) setOrders(ordersData.orders);
          if (Array.isArray(quotesData.proposals)) setQuotes(quotesData.proposals);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.email]);

  const activeCount = orders.filter((o) => o.status !== "DISPATCHED").length;
  const totalBalanceDue = orders.reduce((acc, o) => acc + (o.balanceDueRupees || 0), 0);
  const defaultAddress = user?.addresses.find((a) => a.isDefault) || user?.addresses[0] || null;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)]">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-12 lg:py-16">
        {authLoading ? (
          <div className="py-24 text-center text-xs text-[var(--color-muted-light)]">
            Verifying your client session...
          </div>
        ) : !isAuthenticated ? (
          <div className="mx-auto max-w-md text-center space-y-6 py-16">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted-light)]">
              Tavistra Client Account
            </span>
            <h1 className="text-3xl font-serif font-light text-[var(--color-ink)]">
              Sign in to view your account
            </h1>
            <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
              Access your authenticated order history, production milestones, GSTIN profile, and saved delivery addresses.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/account/login?next=/account"
                className="rounded-full bg-[var(--color-ink)] px-8 py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)]"
              >
                Sign In
              </Link>
              <Link
                href="/account/register"
                className="rounded-full border border-[var(--color-control-border)] px-8 py-3 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)]"
              >
                Create Account
              </Link>
            </div>
            <p className="text-[11px] text-[var(--color-muted-light)]">
              Checked out as a guest?{" "}
              <Link href="/track" className="text-[var(--color-bronze)] font-semibold hover:underline">
                Track Guest Order
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-1">
              <AccountNav />
            </div>

            <div className="lg:col-span-3 space-y-8">
              <div className="space-y-1 border-b border-[var(--color-decorative-border)] pb-5">
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted-light)]">
                  Client Dashboard
                </span>
                <h1 className="text-3xl font-serif font-light text-[var(--color-ink)]">
                  Welcome back, {user?.name}
                </h1>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/80 p-5 space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted-light)] font-semibold">
                    Account Orders
                  </p>
                  <p className="text-2xl font-serif text-[var(--color-ink)]">
                    {ordersLoading ? "…" : orders.length}
                  </p>
                  <p className="text-[11px] text-[var(--color-muted-light)]">
                    {activeCount} currently active
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/80 p-5 space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted-light)] font-semibold">
                    Pending Balance Due
                  </p>
                  <p className="text-2xl font-serif text-[var(--color-bronze)]">
                    {ordersLoading ? "…" : `₹${totalBalanceDue.toLocaleString("en-IN")}`}
                  </p>
                  <p className="text-[11px] text-[var(--color-muted-light)]">
                    Due upon QC completion before dispatch
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/80 p-5 space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted-light)] font-semibold">
                    Primary Delivery PIN
                  </p>
                  <p className="text-2xl font-serif text-[var(--color-ink)] font-mono">
                    {defaultAddress?.pincode || "Not Set"}
                  </p>
                  <p className="text-[11px] text-[var(--color-muted-light)] truncate">
                    {defaultAddress
                      ? `${defaultAddress.city}, ${defaultAddress.state}`
                      : "Add a verified address"}
                  </p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-serif font-light text-[var(--color-ink)]">
                    Recent Account Orders
                  </h2>
                  <Link
                    href="/account/orders"
                    className="text-xs font-semibold text-[var(--color-bronze)] hover:underline"
                  >
                    View All Orders →
                  </Link>
                </div>

                {ordersLoading ? (
                  <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/40 p-8 text-center text-xs text-[var(--color-muted-light)]">
                    Loading your account orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/40 p-8 text-center space-y-3">
                    <p className="text-sm font-serif text-[var(--color-ink)]">
                      No orders placed under this account yet
                    </p>
                    <p className="text-xs text-[var(--color-muted-light)]">
                      Explore our architectural editions or track an earlier guest consignment with its Order ID & Contact.
                    </p>
                    <div className="flex justify-center gap-3 pt-1">
                      <Link
                        href="/catalog"
                        className="rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)]"
                      >
                        Browse Editions
                      </Link>
                      <Link
                        href="/track"
                        className="rounded-full border border-[var(--color-control-border)] px-6 py-2.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)]"
                      >
                        Track Guest Order
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div
                        key={order.id}
                        className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/60 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-mono text-xs font-bold text-[var(--color-ink)]">
                              {order.orderNumber}
                            </span>
                            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {order.statusLabel}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--color-ink)] font-medium">
                            {order.items.map((i) => `${i.name} (×${i.quantity})`).join(", ")}
                          </p>
                          <p className="text-[11px] text-[var(--color-muted-light)]">
                            Placed {order.createdAt} · Destination: {order.city}, {order.state} · Total: ₹
                            {order.totalAmountRupees.toLocaleString("en-IN")}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <Link
                            href={`/track?orderId=${order.id}`}
                            className="rounded-full bg-[var(--color-ink)] px-5 py-2 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                          >
                            Track Milestones
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Architectural Proposals (30-Day Quotes) */}
              {quotes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--color-decorative-border)] pb-3">
                    <h2 className="text-lg font-serif text-[var(--color-ink)]">
                      Architectural Proposals ({quotes.length})
                    </h2>
                    <span className="text-[11px] uppercase tracking-wider text-[var(--color-bronze)] font-semibold">
                      30-Day Locked Offers
                    </span>
                  </div>
                  <div className="space-y-3">
                    {quotes.map((q) => {
                      const latest = q.versions?.[0];
                      const amount = Number(latest?.quotedAmount || 0);
                      const advance = Number(latest?.advanceRequired || 0);
                      return (
                        <div
                          key={q.id}
                          className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/60 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[var(--color-ink)]">
                                {q.quoteNumber}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-stone)] text-[var(--color-ink)] font-semibold">
                                Rev {latest?.versionNumber || 1}
                              </span>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${
                                  q.status === "ACCEPTED"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : q.status === "EXPIRED"
                                    ? "bg-rose-50 text-rose-800 border-rose-200"
                                    : "bg-amber-50 text-amber-800 border-amber-200"
                                }`}
                              >
                                {q.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--color-muted-light)]">
                              Total Quoted: <strong className="text-[var(--color-ink)]">₹{amount.toLocaleString("en-IN")}</strong> · 25% Advance: ₹{advance.toLocaleString("en-IN")} · Valid until{" "}
                              {new Date(q.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}
                            </p>
                          </div>
                          <Link
                            href={`/quote/${encodeURIComponent(q.quoteNumber)}`}
                            className="rounded-full bg-[var(--color-ink)] px-5 py-2 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shrink-0 text-center"
                          >
                            {q.status === "ISSUED" ? "Review & Pay 25% Advance ↗" : "View Proposal ↗"}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Client Services */}
              <div className="pt-4 border-t border-[var(--color-decorative-border)] grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="p-5 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/60 space-y-2">
                  <h4 className="font-semibold text-[var(--color-ink)]">
                    White-Glove Courier Support
                  </h4>
                  <p className="text-[11px] text-[var(--color-muted-light)] leading-relaxed">
                    Direct communication with our crating and logistics partner for scheduled delivery appointments.
                  </p>
                  <Link href="/contact" className="inline-block text-[11px] font-semibold text-[var(--color-bronze)] hover:underline">
                    Inquire with Dispatch Desk →
                  </Link>
                </div>

                <div className="p-5 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/60 space-y-2">
                  <h4 className="font-semibold text-[var(--color-ink)]">
                    Architectural & Bulk Quotations
                  </h4>
                  <p className="text-[11px] text-[var(--color-muted-light)] leading-relaxed">
                    Planning a corporate fit-out or hospitality edition? Submit commercial schedule requests.
                  </p>
                  <Link href="/contact?subject=Commercial%20Schedule" className="inline-block text-[11px] font-semibold text-[var(--color-bronze)] hover:underline">
                    Request Studio Schedule →
                  </Link>
                </div>

                <div className="p-5 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/60 space-y-2">
                  <h4 className="font-semibold text-[var(--color-ink)]">
                    Cancellations & 7-Day Grace
                  </h4>
                  <p className="text-[11px] text-[var(--color-muted-light)] leading-relaxed">
                    Made to Order pieces offer a full 100% refund during the first 7 calendar days before manufacturing starts.
                  </p>
                  <Link href="/returns-refunds" className="inline-block text-[11px] font-semibold text-[var(--color-bronze)] hover:underline">
                    Read Cancellation Policy →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AccountNav } from "@/components/AccountNav";
import { useAuth } from "@/context/AuthContext";
import { useOrders, OrderRecord } from "@/context/OrderContext";

export default function AccountOrdersPage() {
  const { isAuthenticated } = useAuth();
  const { orders } = useOrders();

  const [activeTab, setActiveTab] = useState<"ALL" | "READY_STOCK" | "MADE_TO_ORDER">("ALL");

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "ALL") return true;
    return order.mode === activeTab;
  });

  const formatPrice = (amountRupees: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amountRupees);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)]">
      <Header />
      <main className="flex-1">
        {!isAuthenticated ? (
          <div className="mx-auto max-w-lg py-24 px-6 text-center space-y-6">
            <h1 className="font-editorial text-4xl text-[var(--color-ink)]">
              Sign In to View Orders
            </h1>
            <p className="text-xs text-[var(--color-muted-light)]">
              Sign in to view your complete order history, or track a single order using your reference number.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/account/login"
                className="rounded-full bg-[var(--color-ink)] px-8 py-3 text-xs font-semibold text-[var(--color-canvas)]"
              >
                Sign In
              </Link>
              <Link
                href="/track"
                className="rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-8 py-3 text-xs font-semibold text-[var(--color-ink)]"
              >
                Guest Order Track
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <AccountNav />
            <div className="mx-auto max-w-6xl px-6 pb-16 space-y-8">
              {/* Page Title & Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-decorative-border)] pb-4">
                <div>
                  <h1 className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)]">
                    Orders & Milestones
                  </h1>
                  <p className="text-xs text-[var(--color-muted-light)] mt-1">
                    Complete history of your studio acquisitions, live carriage updates, and workshop progress.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("ALL")}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                      activeTab === "ALL"
                        ? "bg-[var(--color-ink)] text-[var(--color-canvas)]"
                        : "border border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    All ({orders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("READY_STOCK")}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                      activeTab === "READY_STOCK"
                        ? "bg-[var(--color-ink)] text-[var(--color-canvas)]"
                        : "border border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    Ready Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("MADE_TO_ORDER")}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                      activeTab === "MADE_TO_ORDER"
                        ? "bg-[var(--color-ink)] text-[var(--color-canvas)]"
                        : "border border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    Made to Order
                  </button>
                </div>
              </div>

              {/* Order Cards List */}
              {filteredOrders.length === 0 ? (
                <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-12 text-center space-y-4">
                  <p className="font-editorial text-2xl text-[var(--color-ink)]">
                    No orders found in this view
                  </p>
                  <p className="text-xs text-[var(--color-muted-light)]">
                    Explore our catalogue to discover signature brass and timber pieces.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-block rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)]"
                  >
                    Explore Catalogue
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] overflow-hidden shadow-sm"
                    >
                      {/* Order Banner */}
                      <div className="bg-[var(--color-ivory)] px-6 py-4 border-b border-[var(--color-decorative-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono font-bold text-[var(--color-ink)]">
                            {order.id}
                          </span>
                          <span className="rounded-md bg-[var(--color-canvas)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--color-ink)] border border-[var(--color-decorative-border)]">
                            {order.mode === "READY_STOCK" ? "Ready Stock" : "Made to Order"}
                          </span>
                          <span className="rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {order.statusLabel}
                          </span>
                        </div>
                        <div className="text-[var(--color-muted-light)]">
                          Ordered on <strong className="text-[var(--color-ink)]">{order.createdAt}</strong>
                        </div>
                      </div>

                      {/* Order Details Body */}
                      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Items Column (Span 7) */}
                        <div className="lg:col-span-7 space-y-3">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-light)] block">
                            Acquired Pieces
                          </span>
                          <div className="divide-y divide-[var(--color-decorative-border)]/60 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/40 overflow-hidden">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3.5 text-xs">
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

                          <div className="text-xs text-[var(--color-muted-light)] pt-1">
                            Destination: <strong>{order.city}, {order.state} ({order.destinationPin})</strong>
                          </div>
                        </div>

                        {/* Financial Ledger & Actions (Span 5) */}
                        <div className="lg:col-span-5 space-y-4">
                          <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-4 space-y-2 text-xs">
                            <div className="flex justify-between text-[var(--color-muted-light)]">
                              <span>1. Items (Tax Inclusive):</span>
                              <span className="font-semibold text-[var(--color-ink)]">
                                {formatPrice(order.itemsSubtotalRupees)}
                              </span>
                            </div>
                            <div className="flex justify-between text-[var(--color-muted-light)]">
                              <span>2. Insured Freight:</span>
                              <span className="font-semibold text-[var(--color-ink)]">
                                {order.deliveryFeeRupees === 0 ? "Complimentary" : formatPrice(order.deliveryFeeRupees)}
                              </span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-[var(--color-decorative-border)]/60 font-semibold text-[var(--color-ink)]">
                              <span>Total Value:</span>
                              <span>{formatPrice(order.totalAmountRupees)}</span>
                            </div>
                            <div className="flex justify-between text-emerald-800 font-semibold">
                              <span>Amount Paid:</span>
                              <span>{formatPrice(order.amountPaidRupees)}</span>
                            </div>
                            {order.balanceDueRupees > 0 && (
                              <div className="flex justify-between text-[var(--color-bronze)] font-semibold">
                                <span>Balance Due at Dispatch:</span>
                                <span>{formatPrice(order.balanceDueRupees)}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/track?orderId=${order.id}`}
                              className="flex-1 text-center rounded-full bg-[var(--color-ink)] py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                            >
                              Track Full Milestones
                            </Link>
                            <Link
                              href={`/contact?subject=Support%20Inquiry%20(${order.id})`}
                              className="rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors"
                            >
                              Inquire
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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


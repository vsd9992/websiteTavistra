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

interface AccountOrderRefund {
  amountRupees: number;
  status: string;
  gateway?: string;
  reference?: string;
  verifiedAt?: string | null;
  notes?: string | null;
}

interface AccountOrder {
  id: string;
  orderNumber: string;
  quoteNumber?: string;
  mode: string;
  addressLine1: string;
  city: string;
  state: string;
  destinationPin: string;
  items: AccountOrderItem[];
  itemsSubtotalRupees: number;
  deliveryFeeRupees: number;
  totalAmountRupees: number;
  amountPaidRupees: number;
  balanceDueRupees: number;
  carrierName: string;
  awbNumber?: string;
  status: string;
  statusLabel: string;
  statusDescription: string;
  paymentStatusLabel?: string;
  isFullyPaid?: boolean;
  isGraceActive?: boolean;
  releaseEligibleDate?: string | null;
  graceDaysRemaining?: number;
  qcImages?: string[];
  refund?: AccountOrderRefund | null;
  cancelledAt?: string | null;
  createdAt: string;
}

export default function AccountOrdersPage() {
  const { isAuthenticated, authLoading } = useAuth();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [balanceNotice, setBalanceNotice] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoadingOrders(true);
    setOrdersError("");
    try {
      const res = await fetch("/api/account/orders", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to fetch orders.");
      }
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : "Failed to load orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setOrders([]);
      return;
    }
    void loadOrders();
  }, [isAuthenticated]);

  const handlePayRemainingBalance = async (orderNumber: string) => {
    setPayingOrderId(orderNumber);
    setOrdersError("");
    setBalanceNotice(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/pay-balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateway: "PHONEPE" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to clear remaining balance.");
      }
      setBalanceNotice(data.message || `Remaining balance cleared for ${orderNumber}.`);
      await loadOrders();
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : "Network error processing balance.");
    } finally {
      setPayingOrderId(null);
    }
  };

  const formatPrice = (amountRupees: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amountRupees);

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
            <h1 className="text-3xl font-serif font-light text-[var(--color-ink)]">
              Sign in to view your orders
            </h1>
            <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
              Your authenticated order history and production milestones are protected behind your Tavistra account.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/account/login?next=/account/orders"
                className="rounded-full bg-[var(--color-ink)] px-8 py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)]"
              >
                Sign In
              </Link>
              <Link
                href="/track"
                className="rounded-full border border-[var(--color-control-border)] px-8 py-3 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)]"
              >
                Track Guest Order
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-1">
              <AccountNav />
            </div>

            <div className="lg:col-span-3 space-y-8">
              <div className="space-y-1 border-b border-[var(--color-decorative-border)] pb-5">
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted-light)]">
                  Fulfilment & Fabrication
                </span>
                <h1 className="text-3xl font-serif font-light text-[var(--color-ink)]">
                  My Orders & Production Milestones
                </h1>
              </div>

              {balanceNotice && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 font-medium">
                  ✓ {balanceNotice}
                </div>
              )}

              {ordersError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                  {ordersError}
                </div>
              )}

              {loadingOrders ? (
                <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/40 p-10 text-center text-xs text-[var(--color-muted-light)]">
                  Loading authenticated orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/40 p-10 text-center space-y-4">
                  <p className="text-base font-serif text-[var(--color-ink)]">
                    No account orders recorded yet
                  </p>
                  <p className="text-xs text-[var(--color-muted-light)] max-w-md mx-auto">
                    Guest checkouts remain isolated under guest records and can be tracked using your Order Reference and Billing Email or Mobile on the Track page.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Link
                      href="/catalog"
                      className="rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)]"
                    >
                      Explore Catalog
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
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/60 p-6 space-y-5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-decorative-border)] pb-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-mono text-sm font-bold text-[var(--color-ink)]">
                              {order.orderNumber}
                            </span>
                            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[var(--color-stone)] text-[var(--color-ink)]">
                              {order.mode === "MADE_TO_ORDER" ? "Made To Order" : "Ready Stock"}
                            </span>
                            {order.quoteNumber && (
                              <Link
                                href={`/quote/${encodeURIComponent(order.quoteNumber)}`}
                                className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
                              >
                                Quote: {order.quoteNumber} ↗
                              </Link>
                            )}
                          </div>
                          <p className="text-[11px] text-[var(--color-muted-light)]">
                            Placed on {order.createdAt} · Destination: {order.addressLine1}, {order.city}, {order.state} ({order.destinationPin})
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider border ${
                              order.status === "CANCELLED" || order.status === "REFUNDED"
                                ? "bg-rose-50 text-rose-800 border-rose-200"
                                : order.balanceDueRupees <= 0
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            {order.paymentStatusLabel ||
                              (order.balanceDueRupees <= 0 ? "100% Paid — Verified" : "25% Advance Paid")}
                          </span>
                          <span className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider bg-[var(--color-stone)] text-[var(--color-ink)] border border-[var(--color-decorative-border)]">
                            {order.statusLabel}
                          </span>
                          {order.qcImages && order.qcImages.length > 0 && (
                            <span className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                              ✓ QC Photos ({order.qcImages.length})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div className="space-y-2 text-xs">
                          <p className="font-semibold uppercase tracking-wider text-[var(--color-ink)] text-[11px]">
                            Architectural Editions
                          </p>
                          <ul className="space-y-1.5">
                            {order.items.map((item, idx) => (
                              <li key={idx} className="flex justify-between text-[var(--color-ink)]">
                                <span>
                                  {item.name} × {item.quantity}
                                </span>
                                <span className="font-mono">
                                  {formatPrice(Math.round((item.pricePaise * item.quantity) / 100))}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <p className="text-[11px] text-[var(--color-muted-light)] pt-2 leading-relaxed">
                            {order.statusDescription}
                          </p>

                          {(order.status === "CANCELLED" || order.status === "REFUNDED") && (
                            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 space-y-1 text-xs text-rose-950 mt-3">
                              <div className="flex items-center justify-between">
                                <strong className="text-rose-900 font-semibold flex items-center gap-1.5">
                                  <span>✓</span> 100% Pre-Production Statutory Refund
                                </strong>
                                <span className="font-mono font-bold text-rose-800">
                                  ₹{(order.refund?.amountRupees ?? order.amountPaidRupees).toLocaleString("en-IN")}
                                </span>
                              </div>
                              <p className="text-[11px] text-rose-800/90 leading-relaxed">
                                {order.refund?.status === "COMPLETED"
                                  ? `Refund successfully processed${order.refund?.reference ? ` under reference ${order.refund.reference}` : ""}${order.refund?.verifiedAt ? ` on ${order.refund.verifiedAt}` : ""}. Credited back to original payment method.`
                                  : "Refund initiated and queued with payment gateway. Funds reflect in your account within 5–7 business days."}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-4 space-y-1.5 text-xs">
                            <div className="flex justify-between text-[var(--color-muted-light)]">
                              <span>Pieces Subtotal:</span>
                              <span>{formatPrice(order.itemsSubtotalRupees)}</span>
                            </div>
                            <div className="flex justify-between text-[var(--color-muted-light)]">
                              <span>Delivery & Crating:</span>
                              <span>{formatPrice(order.deliveryFeeRupees)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-[var(--color-ink)] pt-1 border-t border-[var(--color-decorative-border)]">
                              <span>Order Total:</span>
                              <span>{formatPrice(order.totalAmountRupees)}</span>
                            </div>
                            {order.status === "CANCELLED" || order.status === "REFUNDED" ? (
                              <>
                                <div className="flex justify-between text-rose-800 font-semibold">
                                  <span>100% Refund Issued:</span>
                                  <span>{formatPrice(order.refund?.amountRupees ?? order.amountPaidRupees)}</span>
                                </div>
                                <div className="flex justify-between text-[var(--color-muted-light)]">
                                  <span>Settlement Status:</span>
                                  <span>Cancelled & Refunded</span>
                                </div>
                              </>
                            ) : (
                              <>
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
                              </>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            {order.balanceDueRupees > 0 &&
                              order.status !== "CANCELLED" &&
                              order.status !== "REFUNDED" && (
                                <button
                                  type="button"
                                  onClick={() => handlePayRemainingBalance(order.orderNumber)}
                                  disabled={payingOrderId === order.orderNumber}
                                  className="flex-1 text-center rounded-full bg-emerald-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                                >
                                  {payingOrderId === order.orderNumber
                                    ? "Verifying..."
                                    : `Pay Balance (${formatPrice(order.balanceDueRupees)})`}
                                </button>
                              )}
                            <Link
                              href={`/track?orderId=${order.id}`}
                              className="flex-1 text-center rounded-full bg-[var(--color-ink)] py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                            >
                              Track Full Milestones
                            </Link>
                            <Link
                              href={`/contact?intent=support&order=${encodeURIComponent(order.orderNumber || order.id)}&subject=${encodeURIComponent(`Assistance for Order ${order.orderNumber || order.id}`)}`}
                              className="rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors"
                            >
                              Raise Support Ticket
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

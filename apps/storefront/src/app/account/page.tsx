"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AccountNav } from "@/components/AccountNav";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";

export default function AccountOverviewPage() {
  const { user, isAuthenticated } = useAuth();
  const { orders } = useOrders();

  const defaultAddress = user?.addresses.find((a) => a.isDefault) || user?.addresses[0];
  const recentOrders = orders.slice(0, 2);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)]">
      <Header />
      <main className="flex-1">
        {!isAuthenticated ? (
          <div className="mx-auto max-w-lg py-24 px-6 text-center space-y-6">
            <span className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold">
              Tavistra Client Desk
            </span>
            <h1 className="font-editorial text-4xl text-[var(--color-ink)]">
              Client Portal
            </h1>
            <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
              Sign in to manage your addresses, view live production milestones, and access your purchase invoices.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/account/login"
                className="w-full sm:w-auto rounded-full bg-[var(--color-ink)] px-8 py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
              >
                Sign In
              </Link>
              <Link
                href="/account/register"
                className="w-full sm:w-auto rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-8 py-3 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors"
              >
                Create Account
              </Link>
            </div>
            <div className="pt-6 border-t border-[var(--color-decorative-border)]">
              <Link
                href="/track"
                className="text-xs text-[var(--color-muted-light)] hover:text-[var(--color-ink)] underline"
              >
                Or track an individual guest order without signing in →
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <AccountNav />
            <div className="mx-auto max-w-6xl px-6 pb-16 space-y-10">
              {/* Welcome Header */}
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold">
                  Client Dashboard
                </span>
                <h1 className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)]">
                  Welcome, {user?.name}
                </h1>
                <p className="text-xs text-[var(--color-muted-light)]">
                  Member since {user?.createdAt} · {user?.email}
                </p>
              </div>

              {/* Status Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Orders Card */}
                <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-light)]">
                      Consignments & Orders
                    </span>
                    <h3 className="text-2xl font-editorial text-[var(--color-ink)]">
                      {orders.length} Active {orders.length === 1 ? "Record" : "Records"}
                    </h3>
                    <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
                      Tracking Ready Stock dispatched consignments and Made to Order grace periods.
                    </p>
                  </div>
                  <Link
                    href="/account/orders"
                    className="text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-bronze)] underline flex items-center gap-1"
                  >
                    <span>View all orders</span>
                    <span>→</span>
                  </Link>
                </div>

                {/* Address Card */}
                <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-light)]">
                      Default Delivery Location
                    </span>
                    {defaultAddress ? (
                      <div className="space-y-1">
                        <span className="inline-block rounded-md bg-[var(--color-canvas)] border border-[var(--color-decorative-border)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-bronze)]">
                          {defaultAddress.label}
                        </span>
                        <p className="text-xs font-semibold text-[var(--color-ink)] pt-1">
                          {defaultAddress.fullName}
                        </p>
                        <p className="text-xs text-[var(--color-muted-light)] line-clamp-1">
                          {defaultAddress.addressLine1}, {defaultAddress.city} — {defaultAddress.pincode}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--color-muted-light)]">
                        No delivery address registered yet.
                      </p>
                    )}
                  </div>
                  <Link
                    href="/account/addresses"
                    className="text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-bronze)] underline flex items-center gap-1"
                  >
                    <span>Manage address book</span>
                    <span>→</span>
                  </Link>
                </div>

                {/* GSTIN & Tax Compliance */}
                <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-light)]">
                      Corporate Tax ID
                    </span>
                    {user?.gstin ? (
                      <div className="space-y-1">
                        <span className="inline-block rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                          GSTIN Verified
                        </span>
                        <p className="text-xs font-mono font-semibold text-[var(--color-ink)] pt-1">
                          {user.gstin}
                        </p>
                        <p className="text-[11px] text-[var(--color-muted-light)]">
                          Invoices automatically generate with input tax credit for this identity.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="inline-block rounded-md bg-[var(--color-stone)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-muted-light)]">
                          Personal / Retail Profile
                        </span>
                        <p className="text-xs text-[var(--color-muted-light)] pt-1">
                          Add your studio GSTIN to receive B2B tax-compliant invoices.
                        </p>
                      </div>
                    )}
                  </div>
                  <Link
                    href="/account/profile"
                    className="text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-bronze)] underline flex items-center gap-1"
                  >
                    <span>Edit profile & GSTIN</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>

              {/* Recent Orders Spotlight */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--color-decorative-border)] pb-3">
                  <h2 className="font-editorial text-2xl text-[var(--color-ink)]">
                    Recent Consignments
                  </h2>
                  <Link
                    href="/account/orders"
                    className="text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-bronze)] underline"
                  >
                    View All Orders →
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:border-[var(--color-control-border)] transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[var(--color-ink)]">
                            {order.id}
                          </span>
                          <span className="rounded-md bg-[var(--color-ivory)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-ink)] border border-[var(--color-decorative-border)]">
                            {order.mode === "READY_STOCK" ? "Ready Stock" : "Made to Order"}
                          </span>
                          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {order.statusLabel}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-ink)] font-medium">
                          {order.items.map((i) => `${i.name} (×${i.quantity})`).join(", ")}
                        </p>
                        <p className="text-[11px] text-[var(--color-muted-light)]">
                          Placed {order.createdAt} · Destination: {order.city}, {order.state} · Total: ₹{order.totalAmountRupees.toLocaleString("en-IN")}
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
              </div>

              {/* Quick Luxury Client Services */}
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


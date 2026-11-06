"use client";

import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import {
  resolveShippingZone,
  calculateDeliveryFee,
  ItemPhysicalSpec,
  ShippingCalculationResult,
} from "@tavistra/shared";

export default function CartPage() {
  const {
    readyStockItems,
    mtoItems,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [activeModeTab, setActiveModeTab] = useState<"READY_STOCK" | "MADE_TO_ORDER">(
    readyStockItems.length > 0 ? "READY_STOCK" : "MADE_TO_ORDER"
  );

  const [pincode, setPincode] = useState("");
  const [shippingResult, setShippingResult] = useState<ShippingCalculationResult | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);

  const formatPrice = (paise: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(paise / 100);

  // Ready Stock calculations
  const readyTotalPaise = readyStockItems.reduce(
    (acc, item) => acc + item.product.pricePaise * item.quantity,
    0
  );

  // MTO calculations
  const mtoTotalPaise = mtoItems.reduce(
    (acc, item) => acc + item.product.pricePaise * item.quantity,
    0
  );

  // Active items for physical shipping calculation
  const activeItems = activeModeTab === "READY_STOCK" ? readyStockItems : mtoItems;
  const activePhysicalSpecs: ItemPhysicalSpec[] = activeItems.flatMap(
    ({ product, quantity }) =>
      Array(quantity).fill({
        priceRupees: product.pricePaise / 100,
        weightGrams: product.weightGrams,
        lengthMm: product.lengthMm,
        widthMm: product.widthMm,
        heightMm: product.heightMm,
        isFragile: true,
      })
  );

  const handleEstimateShipping = (pinToTest?: string) => {
    const targetPin = (pinToTest || pincode).trim();
    if (!/^\d{6}$/.test(targetPin)) {
      setPinError("Please enter a valid 6-digit Indian PIN code.");
      setShippingResult(null);
      return;
    }

    if (activePhysicalSpecs.length === 0) {
      setShippingResult(null);
      return;
    }

    setPinError(null);
    const zone = resolveShippingZone(targetPin);
    const calculation = calculateDeliveryFee(zone, activePhysicalSpecs);
    setShippingResult(calculation);
  };

  const deliveryFeePaise = shippingResult
    ? shippingResult.totalDeliveryFeeRupees * 100
    : 0;

  // Active mode totals including delivery fee
  const activeItemsSubtotalPaise =
    activeModeTab === "READY_STOCK" ? readyTotalPaise : mtoTotalPaise;
  const activeTotalPaise = activeItemsSubtotalPaise + deliveryFeePaise;

  // MTO Advance: 25% of total order commitment
  const mtoAdvancePaise = Math.round(activeTotalPaise * 0.25);
  const mtoBalancePaise = activeTotalPaise - mtoAdvancePaise;

  const hasItems = readyStockItems.length > 0 || mtoItems.length > 0;
  const isMixedSelection = readyStockItems.length > 0 && mtoItems.length > 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-16 px-6 bg-[var(--color-canvas)]">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="border-b border-[var(--color-decorative-border)] pb-8 mb-8">
            <p className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2">
              Order Review & Disciplines
            </p>
            <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--color-ink)] mb-3">
              Your Cart
            </h1>
            <p className="text-xs text-[var(--color-muted-light)]">
              Per Tavistra operating rules, Ready Stock items and Made to Order pieces follow independent checkout, payment, and fulfilment paths.
            </p>
          </div>

          {!hasItems ? (
            <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-16 text-center">
              <span className="font-editorial text-3xl text-[var(--color-ink)] block mb-3">
                Your cart is empty
              </span>
              <p className="text-sm text-[var(--color-muted-light)] max-w-md mx-auto mb-8">
                Discover our studio collections, precision desk objects, and architectural lighting.
              </p>
              <Link
                href="/shop"
                className="inline-block rounded-full bg-[var(--color-ink)] px-8 py-3.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors"
              >
                Browse Collections
              </Link>
            </div>
          ) : (
            <div>
              {/* Mixed-Mode Separation Notice */}
              {isMixedSelection && (
                <div className="mb-8 rounded-xl border border-[var(--color-bronze)]/40 bg-[var(--color-ivory)] p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-bronze)] text-[10px] text-[var(--color-canvas)] font-bold">
                      !
                    </span>
                    <div className="text-xs leading-relaxed text-[var(--color-ink)]">
                      <strong>Independent Mode Notice:</strong> You have selected both immediate Ready Stock items and workshop Made to Order pieces. 
                      Because each mode maintains its own legal contracts, tax invoices, and carrier dispatches, you will check them out in two separate transactions.
                    </div>
                  </div>
                </div>
              )}

              {/* Mode Selection Tabs */}
              <div className="flex border-b border-[var(--color-decorative-border)] mb-8">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModeTab("READY_STOCK");
                    setShippingResult(null);
                  }}
                  className={`pb-4 px-6 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
                    activeModeTab === "READY_STOCK"
                      ? "text-[var(--color-ink)] border-b-2 border-[var(--color-ink)] font-bold"
                      : "text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  Ready Stock ({readyStockItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModeTab("MADE_TO_ORDER");
                    setShippingResult(null);
                  }}
                  className={`pb-4 px-6 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
                    activeModeTab === "MADE_TO_ORDER"
                      ? "text-[var(--color-ink)] border-b-2 border-[var(--color-ink)] font-bold"
                      : "text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  Made to Order ({mtoItems.length})
                </button>
              </div>

              {/* Active Tab: Ready Stock */}
              {activeModeTab === "READY_STOCK" && (
                <div>
                  {readyStockItems.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[var(--color-muted-light)]">
                      No Ready Stock items in this tab.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                      {/* Items List (Span 7) */}
                      <div className="lg:col-span-7 space-y-4">
                        {readyStockItems.map(({ product, quantity }) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-5"
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-light)] font-semibold">
                                Ready Stock
                              </span>
                              <h4 className="font-semibold text-sm text-[var(--color-ink)]">
                                {product.name}
                              </h4>
                              <p className="text-xs font-semibold text-[var(--color-ink)]">
                                {formatPrice(product.pricePaise)} each
                              </p>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-4">
                              <div className="flex items-center rounded-lg border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(product.id, "READY_STOCK", quantity - 1)
                                  }
                                  className="px-2.5 py-1 text-xs text-[var(--color-ink)] hover:bg-[var(--color-stone)]"
                                >
                                  -
                                </button>
                                <span className="px-3 text-xs font-semibold text-[var(--color-ink)]">
                                  {quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(product.id, "READY_STOCK", quantity + 1)
                                  }
                                  className="px-2.5 py-1 text-xs text-[var(--color-ink)] hover:bg-[var(--color-stone)]"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeFromCart(product.id, "READY_STOCK")}
                                className="text-xs text-[var(--color-error)] hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Ready Stock Checkout Panel (Span 5) */}
                      <div className="lg:col-span-5 rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 space-y-6">
                        <h3 className="font-editorial text-2xl text-[var(--color-ink)]">
                          Ready Stock Summary
                        </h3>

                        {/* PIN Code Delivery Estimator */}
                        <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-3.5 space-y-2">
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                            Delivery PIN Code
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              value={pincode}
                              onChange={(e) => {
                                setPincode(e.target.value.replace(/\D/g, ""));
                                if (pinError) setPinError(null);
                              }}
                              placeholder="Enter 6-digit PIN code"
                              className="flex-1 rounded-lg border border-[var(--color-control-border)] bg-[var(--color-ivory)] px-3 py-1.5 text-xs text-[var(--color-ink)] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleEstimateShipping()}
                              className="rounded-lg bg-[var(--color-ink)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-canvas)]"
                            >
                              Check
                            </button>
                          </div>
                          {pinError && <p className="text-[10px] text-red-600 font-medium">{pinError}</p>}
                          {shippingResult && (
                            <p className="text-[11px] text-[var(--color-muted-light)] leading-snug pt-0.5">
                              ✓ {shippingResult.carrierName} · Transit: {shippingResult.transitDaysEstimate}
                            </p>
                          )}
                        </div>

                        {/* Two-Component Price Summary */}
                        <div className="space-y-3 text-xs border-b border-[var(--color-decorative-border)] pb-4">
                          <div className="flex justify-between">
                            <span className="text-[var(--color-muted-light)]">
                              1. Product Subtotal (Tax Inclusive):
                            </span>
                            <span className="font-semibold text-[var(--color-ink)]">
                              {formatPrice(readyTotalPaise)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--color-muted-light)]">
                              2. Insured Crating & Delivery:
                            </span>
                            <span className="font-semibold text-[var(--color-ink)]">
                              {shippingResult
                                ? formatPrice(deliveryFeePaise)
                                : "Enter PIN Code above"}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between text-sm font-semibold text-[var(--color-ink)]">
                          <span>Payable at Order Confirmation:</span>
                          <span className="font-editorial text-2xl">
                            {formatPrice(activeTotalPaise)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <button
                            type="button"
                            className="w-full rounded-full bg-[var(--color-ink)] py-3.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                          >
                            Proceed to Ready Stock Checkout (100%)
                          </button>
                          <p className="text-[11px] text-[var(--color-muted-light)] text-center">
                            Dispatched in 24–48 hours upon verified electronic payment.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Active Tab: Made to Order */}
              {activeModeTab === "MADE_TO_ORDER" && (
                <div>
                  {mtoItems.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[var(--color-muted-light)]">
                      No Made to Order items in this tab.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                      {/* Items List (Span 7) */}
                      <div className="lg:col-span-7 space-y-4">
                        {mtoItems.map(({ product, quantity }) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-5"
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase tracking-wider text-[var(--color-bronze)] font-semibold">
                                Made to Order
                              </span>
                              <h4 className="font-semibold text-sm text-[var(--color-ink)]">
                                {product.name}
                              </h4>
                              <p className="text-xs font-semibold text-[var(--color-ink)]">
                                {formatPrice(product.pricePaise)} total
                              </p>
                              <p className="text-[11px] text-[var(--color-muted-light)]">
                                25% Production Advance: {formatPrice(Math.round(product.pricePaise * 0.25))}
                              </p>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-4">
                              <div className="flex items-center rounded-lg border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(product.id, "MADE_TO_ORDER", quantity - 1)
                                  }
                                  className="px-2.5 py-1 text-xs text-[var(--color-ink)] hover:bg-[var(--color-stone)]"
                                >
                                  -
                                </button>
                                <span className="px-3 text-xs font-semibold text-[var(--color-ink)]">
                                  {quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(product.id, "MADE_TO_ORDER", quantity + 1)
                                  }
                                  className="px-2.5 py-1 text-xs text-[var(--color-ink)] hover:bg-[var(--color-stone)]"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeFromCart(product.id, "MADE_TO_ORDER")}
                                className="text-xs text-[var(--color-error)] hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* MTO Checkout Panel (Span 5) */}
                      <div className="lg:col-span-5 rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 space-y-6">
                        <h3 className="font-editorial text-2xl text-[var(--color-ink)]">
                          Order Summary
                        </h3>

                        {/* PIN Code Delivery Estimator */}
                        <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-3.5 space-y-2">
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                            Delivery PIN Code
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              value={pincode}
                              onChange={(e) => {
                                setPincode(e.target.value.replace(/\D/g, ""));
                                if (pinError) setPinError(null);
                              }}
                              placeholder="Enter 6-digit PIN code"
                              className="flex-1 rounded-lg border border-[var(--color-control-border)] bg-[var(--color-ivory)] px-3 py-1.5 text-xs text-[var(--color-ink)] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleEstimateShipping()}
                              className="rounded-lg bg-[var(--color-ink)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-canvas)]"
                            >
                              Check
                            </button>
                          </div>
                          {pinError && <p className="text-[10px] text-red-600 font-medium">{pinError}</p>}
                          {shippingResult && (
                            <p className="text-[11px] text-[var(--color-muted-light)] leading-snug pt-0.5">
                              ✓ {shippingResult.carrierName} · Transit: {shippingResult.transitDaysEstimate}
                            </p>
                          )}
                        </div>

                        {/* Pricing Breakdown */}
                        <div className="space-y-3 text-xs border-b border-[var(--color-decorative-border)] pb-4">
                          <div className="flex justify-between">
                            <span className="text-[var(--color-muted-light)]">
                              1. Total Agreed Items Value:
                            </span>
                            <span className="font-semibold text-[var(--color-ink)]">
                              {formatPrice(mtoTotalPaise)}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-[var(--color-muted-light)]">
                              2. Insured Crating & Freight:
                            </span>
                            <span className="font-semibold text-[var(--color-ink)]">
                              {shippingResult
                                ? formatPrice(deliveryFeePaise)
                                : "Enter PIN Code above"}
                            </span>
                          </div>

                          <div className="flex justify-between pt-2 border-t border-[var(--color-decorative-border)]/60 text-[var(--color-bronze)] font-semibold text-sm">
                            <span>25% Advance Required to Start:</span>
                            <span>{formatPrice(mtoAdvancePaise)}</span>
                          </div>

                          <div className="flex justify-between text-[var(--color-muted-light)]">
                            <span>Remaining 75% Prior to Dispatch:</span>
                            <span>{formatPrice(mtoBalancePaise)}</span>
                          </div>
                        </div>

                        {/* Grace Period Box */}
                        <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-4 text-[11px] text-[var(--color-muted-light)] leading-relaxed space-y-1.5">
                          <strong className="text-[var(--color-ink)] block">
                            7-Day Post-Confirmation Grace Window
                          </strong>
                          You may request adjustments or full refund cancellation within 7 days. Workshop manufacturing begins on Day 8.
                        </div>

                        <div className="space-y-2">
                          <button
                            type="button"
                            className="w-full rounded-full bg-[var(--color-ink)] py-3.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                          >
                            Pay 25% Advance ({formatPrice(mtoAdvancePaise)})
                          </button>
                          <p className="text-[11px] text-[var(--color-muted-light)] text-center">
                            Remaining balance collected after QC inspection before carrier handover.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

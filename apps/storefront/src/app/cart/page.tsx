"use client";

import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import {
  resolveShippingZone,
  calculateDeliveryFee,
  calculateOrderDeliveryFee,
  checkBulkOrderCeiling,
  lookupPincode,
  PincodeLookupResult,
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
  const [resolvedLocation, setResolvedLocation] = useState<string | null>(null);
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

  // Bulk order check per 2026-11-06 Owner Policy:
  // <= 10 units per single product AND <= 10 line items
  const bulkCheck = checkBulkOrderCeiling(
    activeItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }))
  );

  const handleEstimateShipping = async (pinToTest?: string) => {
    const targetPin = (pinToTest || pincode).trim();
    if (!/^\d{6}$/.test(targetPin)) {
      setPinError("Please enter a valid 6-digit Indian PIN code.");
      setShippingResult(null);
      setResolvedLocation(null);
      return;
    }

    if (activeItems.length === 0) {
      setShippingResult(null);
      return;
    }

    try {
      const calcRes = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pincode: targetPin,
          items: activeItems.map(({ product, quantity }) => ({
            productId: product.id,
            slug: product.slug,
            title: product.name,
            quantity,
            priceRupees: product.pricePaise / 100,
            weightGrams: product.weightGrams,
            lengthMm: product.lengthMm,
            widthMm: product.widthMm,
            heightMm: product.heightMm,
          })),
        }),
      });

      if (calcRes.ok) {
        const data = await calcRes.json();
        const pinInfo = data.pincodeResult;
        if (!pinInfo.isServiceable) {
          setPinError(
            pinInfo.unserviceableReason ||
              `We cannot deliver to PIN code ${targetPin}. This destination is currently not serviceable for insured fragile consignments.`
          );
          setShippingResult(null);
          setResolvedLocation(pinInfo.city ? `${pinInfo.city}, ${pinInfo.state}` : null);
          return;
        }

        setPinError(null);
        setResolvedLocation(`${pinInfo.city}, ${pinInfo.state}`);
        setShippingResult({
          zone: {
            code: pinInfo.zoneCode,
            name: pinInfo.zoneName,
            regionDescription: pinInfo.zoneName,
            estimatedDaysMin: pinInfo.estimatedDaysMin,
            estimatedDaysMax: pinInfo.estimatedDaysMax,
          },
          carrierTier: data.carrierTier,
          carrierName: data.carrierName,
          actualWeightKg: data.actualWeightKg,
          volumetricWeightKg: data.volumetricWeightKg,
          billableWeightKg: data.billableWeightKg,
          packagingTier: "MEDIUM",
          packagingCostRupees: 0,
          insuranceFovRupees: 0,
          baseFreightRupees: 0,
          gstAmountRupees: data.gstIncludedRupees,
          totalDeliveryFeeRupees: data.totalDeliveryFeeRupees,
          transitDaysEstimate: pinInfo.transitDaysEstimate,
        });
        return;
      }
    } catch {
      // Fallback below
    }

    const lookup = lookupPincode(targetPin);
    if (!lookup.isServiceable) {
      setPinError(
        lookup.unserviceableReason ||
          `We cannot deliver to PIN code ${targetPin}. This destination is currently not serviceable for insured fragile consignments.`
      );
      setShippingResult(null);
      setResolvedLocation(lookup.city ? `${lookup.city}, ${lookup.state}` : null);
      return;
    }

    setPinError(null);
    setResolvedLocation(`${lookup.city}, ${lookup.state}`);
    const zone = lookup.zoneCode;

    // Multi-item highest product fee rule (Decision 0004):
    // For single-destination orders with multiple items, charge a single delivery fee
    // equal to the highest applicable product delivery fee, NOT the sum.
    const productCalcs = activeItems.map(({ product }) => {
      const spec: ItemPhysicalSpec = {
        productId: product.id,
        priceRupees: product.pricePaise / 100,
        weightGrams: product.weightGrams,
        lengthMm: product.lengthMm,
        widthMm: product.widthMm,
        heightMm: product.heightMm,
        isFragile: true,
      };
      return calculateDeliveryFee(zone, [spec]);
    });

    const highestFee = calculateOrderDeliveryFee(
      productCalcs.map((c) => c.totalDeliveryFeeRupees)
    );
    const primaryCalc = productCalcs.reduce(
      (max, curr) => (curr.totalDeliveryFeeRupees > max.totalDeliveryFeeRupees ? curr : max),
      productCalcs[0]
    );

    setShippingResult({
      ...primaryCalc,
      totalDeliveryFeeRupees: highestFee,
    });
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

  const getBulkEnquiryHref = () => {
    const lines = activeItems.map(
      (item) =>
        `• ${item.product.name} (Qty: ${item.quantity}) — ${formatPrice(item.product.pricePaise * item.quantity)}`
    );
    const totalQty = activeItems.reduce((acc, i) => acc + i.quantity, 0);
    const modeLabel = activeModeTab === "READY_STOCK" ? "Ready Stock" : "Made to Order";
    const subtotalFormatted = formatPrice(activeItemsSubtotalPaise);

    const messageLines = [
      `Bulk Order Quotation Request (${modeLabel})`,
      pincode ? `Destination PIN Code: ${pincode}` : "Destination PIN: (Not specified)",
      "",
      "Selected Products & Quantities:",
      ...lines,
      "",
      `Total Units: ${totalQty}`,
      `Estimated Items Subtotal: ${subtotalFormatted}`,
      "",
      "Please provide formal negotiated bulk quotation, commercial freight assessment, and dispatch schedule.",
    ];

    const primaryProduct = activeItems[0]?.product.name || "Multiple Products";
    const productNameSummary =
      activeItems.length > 1
        ? `${primaryProduct} + ${activeItems.length - 1} other item(s) (${totalQty} units)`
        : `${primaryProduct} (${totalQty} units)`;

    const params = new URLSearchParams({
      intent: "bulk",
      subject: "Bulk Order Quotation Request",
      productName: productNameSummary,
      pincode: pincode.trim(),
      message: messageLines.join("\n"),
    });

    return `/contact?${params.toString()}`;
  };

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
                          {pinError && (
                            <div className="rounded-lg bg-red-50 p-2.5 border border-red-200 text-xs text-red-700 font-medium leading-relaxed">
                              ⚠ {pinError}
                            </div>
                          )}
                          {shippingResult && (
                            <p className="text-[11px] text-[var(--color-muted-light)] leading-snug pt-0.5">
                              ✓ {resolvedLocation && <strong className="text-[var(--color-ink)]">{resolvedLocation} · </strong>}
                              {shippingResult.carrierName} · Transit: {shippingResult.transitDaysEstimate}
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

                        {bulkCheck.isBulkEnquiryRequired ? (
                          <div className="space-y-3">
                            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-[11px] text-amber-900 leading-relaxed">
                              <strong>Bulk Order Required:</strong> {bulkCheck.message}
                            </div>
                            <Link
                              href={getBulkEnquiryHref()}
                              className="block w-full text-center rounded-full bg-[var(--color-ink)] py-3.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                            >
                              Request Bulk Order Quotation
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Link
                              href={`/checkout?mode=ready_stock${pincode ? `&pincode=${encodeURIComponent(pincode.trim())}` : ""}`}
                              className="block w-full text-center rounded-full bg-[var(--color-ink)] py-3.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                            >
                              Proceed to Checkout
                            </Link>
                            <p className="text-[11px] text-[var(--color-muted-light)] text-center">
                              Dispatched in 24–48 hours upon verified electronic payment.
                            </p>
                          </div>
                        )}
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
                          {pinError && (
                            <div className="rounded-lg bg-red-50 p-2.5 border border-red-200 text-xs text-red-700 font-medium leading-relaxed">
                              ⚠ {pinError}
                            </div>
                          )}
                          {shippingResult && (
                            <p className="text-[11px] text-[var(--color-muted-light)] leading-snug pt-0.5">
                              ✓ {resolvedLocation && <strong className="text-[var(--color-ink)]">{resolvedLocation} · </strong>}
                              {shippingResult.carrierName} · Transit: {shippingResult.transitDaysEstimate}
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

                        {bulkCheck.isBulkEnquiryRequired ? (
                          <div className="space-y-3">
                            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-[11px] text-amber-900 leading-relaxed">
                              <strong>Bulk Order Required:</strong> {bulkCheck.message}
                            </div>
                            <Link
                              href={getBulkEnquiryHref()}
                              className="block w-full text-center rounded-full bg-[var(--color-ink)] py-3.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                            >
                              Request Bulk Order Quotation
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Link
                              href={`/checkout?mode=made_to_order${pincode ? `&pincode=${encodeURIComponent(pincode.trim())}` : ""}`}
                              className="block w-full text-center rounded-full bg-[var(--color-ink)] py-3.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                            >
                              Pay Advance & Checkout
                            </Link>
                            <p className="text-[11px] text-[var(--color-muted-light)] text-center">
                              Remaining balance collected after QC inspection before carrier handover.
                            </p>
                          </div>
                        )}
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

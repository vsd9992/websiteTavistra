"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart, getCartLineKey } from "@/context/CartContext";
import { checkBulkOrderCeiling, ShippingCalculationResult } from "@tavistra/shared";

export default function CartPage() {
  const {
    readyStockItems,
    mtoItems,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [activeModeTab, setActiveModeTab] = useState<"READY_STOCK" | "MADE_TO_ORDER">(
    "READY_STOCK"
  );
  const [pincode, setPincode] = useState("");
  const [shippingResult, setShippingResult] = useState<ShippingCalculationResult | null>(null);
  const [resolvedLocation, setResolvedLocation] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [checkingPin, setCheckingPin] = useState(false);

  // Switch default tab automatically if Ready Stock is empty and Made to Order has items
  useEffect(() => {
    if (readyStockItems.length === 0 && mtoItems.length > 0 && activeModeTab === "READY_STOCK") {
      setActiveModeTab("MADE_TO_ORDER");
    } else if (mtoItems.length === 0 && readyStockItems.length > 0 && activeModeTab === "MADE_TO_ORDER") {
      setActiveModeTab("READY_STOCK");
    }
  }, [readyStockItems.length, mtoItems.length, activeModeTab]);

  const formatPrice = (paise: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(paise / 100);

  const readyTotalPaise = readyStockItems.reduce(
    (acc, item) => acc + item.product.pricePaise * item.quantity,
    0
  );
  const mtoTotalPaise = mtoItems.reduce(
    (acc, item) => acc + item.product.pricePaise * item.quantity,
    0
  );

  const activeItems = activeModeTab === "READY_STOCK" ? readyStockItems : mtoItems;
  const activeCartSignature = useMemo(
    () =>
      activeItems
        .map((i) => `${getCartLineKey(i.product)}:${i.quantity}`)
        .join("|"),
    [activeItems]
  );

  // Reset stale shipping calculation if cart contents change
  useEffect(() => {
    setShippingResult(null);
  }, [activeCartSignature, activeModeTab]);

  // Bulk order boundary: <= 10 cumulative units AND <= 10 distinct line items
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

    setCheckingPin(true);
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

      const data = await calcRes.json();
      if (!calcRes.ok) {
        setPinError(data?.error || "Unable to verify delivery charge right now.");
        setShippingResult(null);
        setResolvedLocation(null);
        return;
      }

      const pinInfo = data.pincodeResult;
      if (!pinInfo?.isServiceable) {
        setPinError(
          pinInfo?.unserviceableReason ||
            `We cannot deliver to PIN code ${targetPin}. This destination is currently not serviceable for insured fragile consignments.`
        );
        setShippingResult(null);
        setResolvedLocation(pinInfo?.city ? `${pinInfo.city}, ${pinInfo.state}` : null);
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
    } catch {
      setPinError("Unable to reach delivery serviceability verification. Please try again.");
      setShippingResult(null);
      setResolvedLocation(null);
    } finally {
      setCheckingPin(false);
    }
  };

  const deliveryFeePaise = shippingResult
    ? shippingResult.totalDeliveryFeeRupees * 100
    : 0;

  const activeItemsSubtotalPaise =
    activeModeTab === "READY_STOCK" ? readyTotalPaise : mtoTotalPaise;
  const activeTotalPaise = activeItemsSubtotalPaise + deliveryFeePaise;
  const mtoAdvancePaise = Math.round(activeTotalPaise * 0.25);
  const mtoBalancePaise = activeTotalPaise - mtoAdvancePaise;

  const getBulkEnquiryHref = () => {
    const structuredItems = activeItems.map((item) => {
      const skuCode = item.product.sku || item.product.variantId;
      const skuTag = skuCode ? ` [${skuCode}]` : "";
      return {
        name: `${item.product.name}${skuTag}`,
        finish: item.product.variantTitle || "Standard Studio Finish",
        quantity: item.quantity,
        unitPriceRupees: Math.round(item.product.pricePaise / 100),
      };
    });

    const lines = activeItems.map((item) => {
      const skuCode = item.product.sku || item.product.variantId;
      const skuTag = skuCode ? ` [${skuCode}]` : "";
      const finishText = item.product.variantTitle ? ` (${item.product.variantTitle})` : "";
      return `- ${item.product.name}${skuTag}${finishText} × ${item.quantity} @ ₹${Math.round(
        item.product.pricePaise / 100
      ).toLocaleString("en-IN")} each`;
    });
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
      quantity: String(totalQty),
      pincode: pincode.trim(),
      items: JSON.stringify(structuredItems),
      message: messageLines.join("\n"),
    });

    return `/contact?${params.toString()}`;
  };

  const hasItems = readyStockItems.length > 0 || mtoItems.length > 0;
  const isMixedSelection = readyStockItems.length > 0 && mtoItems.length > 0;
  const isMtoTab = activeModeTab === "MADE_TO_ORDER";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-16 px-6 bg-[var(--color-canvas)]">
        <div className="mx-auto max-w-5xl">
          <div className="border-b border-[var(--color-decorative-border)] pb-8 mb-8">
            <p className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2">
              Order Review &amp; Disciplines
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

              {activeItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--color-muted-light)]">
                  No {isMtoTab ? "Made to Order" : "Ready Stock"} items in this tab.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  {/* Items List (Span 7) */}
                  <div className="lg:col-span-7 space-y-4">
                    {activeItems.map(({ product, quantity }) => {
                      const lineKey = getCartLineKey(product);
                      const maxStock =
                        !isMtoTab && typeof product.availableStock === "number"
                          ? product.availableStock
                          : undefined;
                      const lineSubtotalPaise = product.pricePaise * quantity;

                      return (
                        <div
                          key={lineKey}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-5"
                        >
                          <div className="flex items-start gap-4">
                            <Link
                              href={`/product/${product.slug}`}
                              className="h-20 w-20 shrink-0 rounded-lg border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] overflow-hidden flex items-center justify-center"
                            >
                              {product.primaryImageUrl ? (
                                <img
                                  src={product.primaryImageUrl}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-light)]">
                                  Tavistra
                                </span>
                              )}
                            </Link>

                            <div className="space-y-1">
                              <span
                                className={`text-[10px] uppercase tracking-wider font-semibold ${
                                  isMtoTab ? "text-[var(--color-bronze)]" : "text-[var(--color-muted-light)]"
                                }`}
                              >
                                {isMtoTab ? "Made to Order" : "Ready Stock"}
                              </span>
                              <Link
                                href={`/product/${product.slug}`}
                                className="block font-semibold text-sm text-[var(--color-ink)] hover:underline"
                              >
                                {product.name}
                              </Link>
                              {(product.variantTitle || product.sku) && (
                                <p className="text-[11px] text-[var(--color-muted-light)]">
                                  {product.variantTitle ? `${product.variantTitle}` : ""}
                                  {product.variantTitle && product.sku ? " · " : ""}
                                  {product.sku ? <span className="font-mono">{product.sku}</span> : null}
                                </p>
                              )}
                              <p className="text-xs font-semibold text-[var(--color-ink)]">
                                {formatPrice(product.pricePaise)} each ·{" "}
                                <span className="text-[var(--color-muted-light)] font-normal">
                                  Subtotal {formatPrice(lineSubtotalPaise)}
                                </span>
                              </p>
                              {isMtoTab ? (
                                <p className="text-[11px] text-[var(--color-muted-light)]">
                                  25% Production Advance: {formatPrice(Math.round(lineSubtotalPaise * 0.25))}
                                </p>
                              ) : (
                                maxStock !== undefined && (
                                  <p className="text-[11px] text-[var(--color-muted-light)]">
                                    Studio Stock Remaining: {maxStock} unit(s)
                                  </p>
                                )
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-4">
                            <div className="flex items-center rounded-lg border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(lineKey, activeModeTab, quantity - 1)
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
                                disabled={maxStock !== undefined && quantity >= maxStock}
                                onClick={() =>
                                  updateQuantity(lineKey, activeModeTab, quantity + 1)
                                }
                                className="px-2.5 py-1 text-xs text-[var(--color-ink)] hover:bg-[var(--color-stone)] disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFromCart(lineKey, activeModeTab)}
                              className="text-xs text-[var(--color-error)] hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Panel (Span 5) */}
                  <div className="lg:col-span-5 rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 space-y-6 h-fit">
                    <h3 className="font-editorial text-2xl text-[var(--color-ink)]">
                      {isMtoTab ? "Made to Order Summary" : "Ready Stock Summary"}
                    </h3>

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
                          className="flex-1 rounded-lg border border-[var(--color-control-border)] bg-[var(--color-ivory)] px-3 py-1.5 text-xs text-[var(--color-ink)] focus:outline-none font-mono"
                        />
                        <button
                          type="button"
                          disabled={checkingPin}
                          onClick={() => handleEstimateShipping()}
                          className="rounded-lg bg-[var(--color-ink)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-canvas)] disabled:opacity-50"
                        >
                          {checkingPin ? "..." : "Check"}
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
                          {shippingResult.zone.name} · Transit: {shippingResult.transitDaysEstimate}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 text-xs border-b border-[var(--color-decorative-border)] pb-4">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-muted-light)]">
                          1. Product Subtotal (Tax Inclusive):
                        </span>
                        <span className="font-semibold text-[var(--color-ink)]">
                          {formatPrice(activeItemsSubtotalPaise)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-muted-light)]">
                          2. Insured Crating &amp; Delivery:
                        </span>
                        <span className="font-semibold text-[var(--color-ink)]">
                          {shippingResult
                            ? shippingResult.totalDeliveryFeeRupees === 0
                              ? "Complimentary"
                              : formatPrice(deliveryFeePaise)
                            : "Enter PIN Code above"}
                        </span>
                      </div>
                      {isMtoTab && (
                        <>
                          <div className="flex justify-between pt-2 border-t border-[var(--color-decorative-border)]/60 text-[var(--color-bronze)] font-semibold text-sm">
                            <span>25% Advance Required to Start:</span>
                            <span>{formatPrice(mtoAdvancePaise)}</span>
                          </div>
                          <div className="flex justify-between text-[var(--color-muted-light)]">
                            <span>Remaining 75% Prior to Dispatch:</span>
                            <span>{formatPrice(mtoBalancePaise)}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {!isMtoTab && (
                      <div className="flex justify-between text-sm font-semibold text-[var(--color-ink)]">
                        <span>Payable at Order Confirmation:</span>
                        <span className="font-editorial text-2xl">
                          {formatPrice(activeTotalPaise)}
                        </span>
                      </div>
                    )}

                    {isMtoTab && (
                      <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-4 text-[11px] text-[var(--color-muted-light)] leading-relaxed space-y-1.5">
                        <strong className="text-[var(--color-ink)] block">
                          7-Day Post-Confirmation Grace Window
                        </strong>
                        You may request adjustments or full refund cancellation within 7 days. Workshop manufacturing begins on Day 8.
                      </div>
                    )}

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
                          href={`/checkout?mode=${
                            isMtoTab ? "made_to_order" : "ready_stock"
                          }${pincode ? `&pincode=${encodeURIComponent(pincode.trim())}` : ""}`}
                          className="block w-full text-center rounded-full bg-[var(--color-ink)] py-3.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                        >
                          {isMtoTab ? "Pay Advance & Checkout" : "Proceed to Checkout"}
                        </Link>
                        <p className="text-[11px] text-[var(--color-muted-light)] text-center">
                          {isMtoTab
                            ? "Remaining 75% balance collected after QC inspection before dispatch."
                            : "Dispatched in 24–48 hours upon verified electronic payment."}
                        </p>
                      </div>
                    )}
                  </div>
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

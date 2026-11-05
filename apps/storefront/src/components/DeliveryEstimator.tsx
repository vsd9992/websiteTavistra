"use client";

import { useState } from "react";
import {
  resolveShippingZone,
  calculateDeliveryFee,
  ItemPhysicalSpec,
  ShippingCalculationResult,
} from "@tavistra/shared";

interface DeliveryEstimatorProps {
  product: {
    pricePaise: number;
    weightGrams: number;
    lengthMm: number;
    widthMm: number;
    heightMm: number;
  };
}

export function DeliveryEstimator({ product }: DeliveryEstimatorProps) {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<ShippingCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const itemSpec: ItemPhysicalSpec = {
    priceRupees: product.pricePaise / 100,
    weightGrams: product.weightGrams,
    lengthMm: product.lengthMm,
    widthMm: product.widthMm,
    heightMm: product.heightMm,
    isFragile: true,
  };

  const handleEstimate = (pinToTest?: string) => {
    const targetPin = (pinToTest || pincode).trim();
    if (!/^\d{6}$/.test(targetPin)) {
      setError("Please enter a valid 6-digit Indian PIN code.");
      setResult(null);
      return;
    }

    setError(null);
    const zone = resolveShippingZone(targetPin);
    const calculation = calculateDeliveryFee(zone, [itemSpec]);
    setResult(calculation);
  };

  const handleQuickPin = (pin: string) => {
    setPincode(pin);
    handleEstimate(pin);
  };

  return (
    <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[var(--color-bronze)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Delivery & Transit Estimate</span>
        </h4>
        <span className="text-[10px] text-[var(--color-muted-light)] uppercase tracking-wider font-medium">
          Ex-Delhi Hub
        </span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          value={pincode}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            setPincode(val);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleEstimate();
            }
          }}
          placeholder="Enter 6-digit PIN code"
          className="flex-1 rounded-lg border border-[var(--color-control-border)] bg-[var(--color-ivory)] px-3 py-2 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] placeholder:text-[var(--color-muted-light)]"
        />
        <button
          type="button"
          onClick={() => handleEstimate()}
          className="rounded-lg bg-[var(--color-ink)] px-4 py-2 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors"
        >
          Check
        </button>
      </div>

      {/* Quick Location Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] text-[var(--color-muted-light)]">Quick check:</span>
        <button
          type="button"
          onClick={() => handleQuickPin("110001")}
          className="rounded bg-[var(--color-ivory)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors border border-[var(--color-decorative-border)]"
        >
          Delhi (110001)
        </button>
        <button
          type="button"
          onClick={() => handleQuickPin("560001")}
          className="rounded bg-[var(--color-ivory)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors border border-[var(--color-decorative-border)]"
        >
          Bengaluru (560001)
        </button>
        <button
          type="button"
          onClick={() => handleQuickPin("400001")}
          className="rounded bg-[var(--color-ivory)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors border border-[var(--color-decorative-border)]"
        >
          Mumbai (400001)
        </button>
        <button
          type="button"
          onClick={() => handleQuickPin("190001")}
          className="rounded bg-[var(--color-ivory)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors border border-[var(--color-decorative-border)]"
        >
          Srinagar (190001)
        </button>
      </div>

      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}

      {/* Calculation Breakdown Result */}
      {result && (
        <div className="rounded-lg border border-[var(--color-bronze)]/30 bg-[var(--color-ivory)]/80 p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-bronze)] font-semibold block">
                {result.zone.name}
              </span>
              <span className="text-xs font-semibold text-[var(--color-ink)]">
                {result.zone.regionDescription}
              </span>
            </div>
            <div className="text-right">
              <span className="font-editorial text-xl font-bold text-[var(--color-ink)] block">
                ₹{result.totalDeliveryFeeRupees.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-[var(--color-muted-light)] block">
                All-in (Insured + GST)
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--color-decorative-border)]/60 grid grid-cols-2 gap-2 text-[11px] text-[var(--color-muted-light)]">
            <div>
              <span className="block text-[var(--color-ink)] font-medium">Estimated Transit:</span>
              <span>{result.transitDaysEstimate}</span>
            </div>
            <div>
              <span className="block text-[var(--color-ink)] font-medium">Carrier Allocation:</span>
              <span className="truncate block" title={result.carrierName}>
                {result.carrierName}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--color-decorative-border)]/60 text-[10px] text-[var(--color-muted-light)] leading-relaxed space-y-1">
            <p className="flex items-center gap-1.5 text-[var(--color-ink)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>
                <strong>Carrier&apos;s Risk (FOV):</strong> 100% replacement protection included (₹{result.insuranceFovRupees} transit insurance).
              </span>
            </p>
            <p>
              <strong>Packaging Standard:</strong> Multi-layer shock-absorbing honeycomb + reinforced crating (Billable weight: {result.billableWeightKg} kg).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

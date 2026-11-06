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

  const handleEstimate = () => {
    const targetPin = pincode.trim();
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

  return (
    <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-[var(--color-bronze)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Delivery & Transit Estimate</span>
        </h4>
        {result && (
          <span className="text-xs font-semibold text-[var(--color-bronze)]">
            {result.transitDaysEstimate}
          </span>
        )}
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
          onClick={handleEstimate}
          className="rounded-lg bg-[var(--color-ink)] px-4 py-2 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors"
        >
          Check
        </button>
      </div>

      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}

      {/* Clean, Simple Estimation Result */}
      {result && (
        <div className="pt-3 border-t border-[var(--color-decorative-border)]/60 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <p className="font-semibold text-[var(--color-ink)]">
              Insured Delivery: ₹{result.totalDeliveryFeeRupees.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-[var(--color-muted-light)]">
              {result.carrierName} · Transit: {result.transitDaysEstimate}
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            100% Insured
          </span>
        </div>
      )}
    </div>
  );
}

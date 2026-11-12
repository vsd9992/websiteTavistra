"use client";

import { useState } from "react";

interface DeliveryEstimatorProps {
  product: {
    id?: string;
    slug?: string;
    name?: string;
    pricePaise: number;
    weightGrams: number;
    lengthMm: number;
    widthMm: number;
    heightMm: number;
  };
}

interface EstimatorDisplayResult {
  totalDeliveryFeeRupees: number;
  carrierName: string;
  transitDaysEstimate: string;
  zoneName: string;
}

export function DeliveryEstimator({ product }: DeliveryEstimatorProps) {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<EstimatorDisplayResult | null>(null);
  const [resolvedLocation, setResolvedLocation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEstimate = async () => {
    const targetPin = pincode.trim();
    if (!/^\d{6}$/.test(targetPin)) {
      setError("Please enter a valid 6-digit Indian PIN code.");
      setResult(null);
      setResolvedLocation(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pincode: targetPin,
          items: [
            {
              productId: product.id,
              slug: product.slug,
              title: product.name,
              quantity: 1,
              priceRupees: product.pricePaise / 100,
              weightGrams: product.weightGrams,
              lengthMm: product.lengthMm,
              widthMm: product.widthMm,
              heightMm: product.heightMm,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Unable to verify delivery availability right now.");
        setResult(null);
        setResolvedLocation(null);
        return;
      }

      const pinInfo = data.pincodeResult;
      if (!pinInfo?.isServiceable) {
        setError(
          pinInfo?.unserviceableReason ||
            `We cannot deliver to PIN code ${targetPin}. This destination is currently not serviceable for insured fragile consignments.`
        );
        setResult(null);
        setResolvedLocation(pinInfo?.city ? `${pinInfo.city}, ${pinInfo.state}` : null);
        return;
      }

      setError(null);
      setResolvedLocation(`${pinInfo.city}, ${pinInfo.state}`);
      setResult({
        totalDeliveryFeeRupees: data.totalDeliveryFeeRupees,
        carrierName: data.carrierName,
        transitDaysEstimate: pinInfo.transitDaysEstimate,
        zoneName: pinInfo.zoneName,
      });
    } catch {
      setError("Unable to reach the delivery serviceability server. Please try again.");
      setResult(null);
      setResolvedLocation(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-[var(--color-bronze)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Delivery &amp; Transit Estimate</span>
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
          placeholder="Enter 6-digit PIN (e.g. 110001, 560001, 400001)"
          className="flex-1 rounded-lg border border-[var(--color-control-border)] bg-[var(--color-ivory)] px-3 py-2 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] placeholder:text-[var(--color-muted-light)] font-mono"
        />
        <button
          type="button"
          onClick={handleEstimate}
          disabled={loading}
          className="rounded-lg bg-[var(--color-ink)] px-4 py-2 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Check"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50/90 border border-red-200 p-2.5 text-xs text-red-700 font-medium leading-relaxed">
          ⚠ {error}
        </div>
      )}

      {result && (
        <div className="rounded-lg bg-[var(--color-ivory)] border border-[var(--color-decorative-border)]/70 p-3 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-[var(--color-ink)]">
            <span className="font-semibold">
              {resolvedLocation ? `${resolvedLocation} · ` : ""}{result.zoneName}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Serviceable
            </span>
          </div>
          <div className="flex items-center justify-between text-[var(--color-muted-light)]">
            <span>Insured Crating &amp; Delivery Fee:</span>
            <span className="font-semibold text-[var(--color-ink)]">
              {result.totalDeliveryFeeRupees === 0
                ? "Complimentary"
                : `₹${result.totalDeliveryFeeRupees.toLocaleString("en-IN")}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

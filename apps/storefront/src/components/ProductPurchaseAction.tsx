"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { MockProduct } from "@/lib/products";
import { useCart } from "@/context/CartContext";

interface ProductPurchaseActionProps {
  product: MockProduct;
  formattedAdvance: string;
}

export function ProductPurchaseAction({
  product,
  formattedAdvance,
}: ProductPurchaseActionProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const isOutOfStock =
    product.mode === "READY_STOCK" &&
    typeof product.availableStock === "number" &&
    product.availableStock <= 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart(product);
    setAdded(true);
    setShowToast(true);
  };

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 2200);
    return () => clearTimeout(t);
  }, [added]);

  // Auto-hide toast after 8 seconds
  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 8000);
    return () => clearTimeout(t);
  }, [showToast]);

  const displayPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.pricePaise / 100);

  return (
    <div className="space-y-3">
      {product.mode === "READY_STOCK" && (
        <>
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAdd}
            className="w-full rounded-full bg-[var(--color-ink)] py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] transition-all hover:bg-[var(--color-charcoal)] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.99]"
          >
            {isOutOfStock ? "Out of Stock" : added ? "✓ Added to Cart" : "Add to Cart"}
          </button>
          <p className="text-center text-[11px] text-[var(--color-muted-light)]">
            Dispatches in 24–48 hours · {product.returnPolicyText}
          </p>
        </>
      )}

      {product.mode === "MADE_TO_ORDER" && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleAdd}
            className="w-full rounded-full bg-[var(--color-ink)] py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] transition-all hover:bg-[var(--color-charcoal)] shadow-sm active:scale-[0.99]"
          >
            {added ? "✓ Added to Cart" : "Add to Cart"}
          </button>
          <div className="text-center space-y-1">
            <p className="text-xs font-semibold text-[var(--color-bronze)]">
              Pay 25% to Order ({formattedAdvance})
            </p>
            <p className="text-[11px] text-[var(--color-muted-light)]">
              Remaining 75% balance needs to be paid before dispatch. Governed by 7-day confirmation grace period.
            </p>
          </div>
        </div>
      )}

      {product.mode === "QUOTE_ONLY" && (
        <div className="space-y-2">
          <Link
            href={`/contact?subject=Architectural%20%26%20Bespoke%20Order%20(Quote%20Only)&product=${encodeURIComponent(
              product.name
            )}&sku=${encodeURIComponent(product.sku || product.id)}&materials=${encodeURIComponent(
              product.materials.join(", ")
            )}`}
            className="block text-center w-full rounded-full bg-[var(--color-ink)] py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] transition-all hover:bg-[var(--color-charcoal)] shadow-sm"
          >
            Contact for Quote
          </Link>
          <p className="text-center text-[11px] text-[var(--color-muted-light)]">
            Custom dimensions & architectural proposals · 30-day locked terms
          </p>
        </div>
      )}

      {/* Floating Added-to-Cart Confirmation Toast (Bottom-Right) */}
      {showToast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[380px] rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)]/98 p-4 shadow-2xl backdrop-blur-md animate-fade-in space-y-3 pointer-events-auto"
        >
          <div className="flex items-center justify-between border-b border-[var(--color-decorative-border)]/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                ✓
              </span>
              <span className="text-xs font-semibold text-[var(--color-ink)]">
                Added to Shopping Bag
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="text-[var(--color-muted-light)] hover:text-[var(--color-ink)] text-xs p-1 rounded"
              title="Close"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-3">
            {product.primaryImageUrl && (
              <img
                src={product.primaryImageUrl}
                alt={product.name}
                className="h-12 w-12 rounded-lg object-cover border border-[var(--color-decorative-border)] shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-[var(--color-ink)] truncate">
                {product.name}
              </h4>
              {product.variantTitle && (
                <p className="text-[11px] text-[var(--color-muted-light)] truncate">
                  {product.variantTitle}
                </p>
              )}
              <p className="text-xs font-semibold text-[var(--color-bronze)]">
                {displayPrice}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] py-2 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors text-center"
            >
              Keep Shopping
            </button>
            <Link
              href="/cart"
              className="rounded-full bg-[var(--color-ink)] py-2 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors text-center shadow-sm"
            >
              Review Cart →
            </Link>
          </div>
        </aside>
      )}
    </div>
  );
}

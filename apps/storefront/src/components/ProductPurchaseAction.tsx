"use client";

import Link from "next/link";
import { useState } from "react";
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

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-3">
      {product.mode === "READY_STOCK" && (
        <>
          <button
            type="button"
            onClick={handleAdd}
            className="w-full rounded-full bg-[var(--color-ink)] py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] transition-all hover:bg-[var(--color-charcoal)] shadow-sm"
          >
            {added ? "✓ Added to Cart" : "Add to Cart"}
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
            className="w-full rounded-full bg-[var(--color-ink)] py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] transition-all hover:bg-[var(--color-charcoal)] shadow-sm"
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
            )}&sku=${encodeURIComponent(product.id)}&materials=${encodeURIComponent(
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
    </div>
  );
}

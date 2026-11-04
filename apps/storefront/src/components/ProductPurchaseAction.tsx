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
        <button
          type="button"
          onClick={handleAdd}
          className="w-full rounded-full bg-[var(--color-ink)] py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] transition-all hover:bg-[var(--color-charcoal)] shadow-sm"
        >
          {added ? "✓ Added to Ready Stock Cart" : "Add to Ready Stock Cart"}
        </button>
      )}

      {product.mode === "MADE_TO_ORDER" && (
        <button
          type="button"
          onClick={handleAdd}
          className="w-full rounded-full bg-[var(--color-ink)] py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] transition-all hover:bg-[var(--color-charcoal)] shadow-sm"
        >
          {added
            ? "✓ Commission Added to Cart"
            : `Commission Piece (Pay 25% Advance: ${formattedAdvance})`}
        </button>
      )}

      {product.mode === "QUOTE_ONLY" && (
        <Link
          href={`/contact?subject=Proposal%20Inquiry%20-%20${encodeURIComponent(product.name)}`}
          className="block text-center w-full rounded-full bg-[var(--color-ink)] py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] transition-all hover:bg-[var(--color-charcoal)] shadow-sm"
        >
          Request Architectural Proposal
        </Link>
      )}

      <p className="text-center text-[11px] text-[var(--color-muted-light)]">
        {product.returnPolicyText}
      </p>
    </div>
  );
}

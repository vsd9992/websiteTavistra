import Link from "next/link";
import { MockProduct } from "@/lib/products";

interface ProductCardProps {
  product: MockProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.pricePaise / 100);

  const modeBadge: Record<MockProduct["mode"], { label: string; badgeClass: string }> = {
    READY_STOCK: {
      label: "Ready Stock",
      badgeClass: "bg-[var(--color-stone)] text-[var(--color-ink)]",
    },
    MADE_TO_ORDER: {
      label: "Made to Order",
      badgeClass: "bg-[var(--color-bronze)]/15 text-[var(--color-bronze)]",
    },
    QUOTE_ONLY: {
      label: "Quote Only",
      badgeClass: "bg-[var(--color-charcoal)] text-[var(--color-canvas)]",
    },
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-5 transition-all hover:border-[var(--color-control-border)] hover:shadow-sm"
    >
      {/* Product Image Placeholder with Balanced Gallery Proportions */}
      <div className="relative mb-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-[var(--color-ivory)] border border-[var(--color-decorative-border)]/50">
        <span className="font-editorial text-xl italic text-[var(--color-bronze)]/40 transition-transform duration-500 group-hover:scale-105">
          Tavistra Edition
        </span>
        <span
          className={`absolute top-3 left-3 rounded-md px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${modeBadge[product.mode].badgeClass}`}
        >
          {modeBadge[product.mode].label}
        </span>
      </div>

      {/* Product Meta */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-[var(--color-muted-light)]">
            {product.subcategory}
          </span>
          <h3 className="font-semibold text-base text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-bronze)] mb-1">
            {product.name}
          </h3>
          <p className="text-xs text-[var(--color-muted-light)] line-clamp-2 leading-relaxed mb-3">
            {product.shortDescription}
          </p>
        </div>

        {/* Pricing / Mode Action Indicator */}
        <div className="pt-3 border-t border-[var(--color-decorative-border)]/60 flex items-center justify-between">
          <div>
            {product.mode === "QUOTE_ONLY" ? (
              <span className="text-xs font-semibold text-[var(--color-bronze)] uppercase tracking-wider">
                Price On Proposal
              </span>
            ) : (
              <div>
                <span className="text-sm font-semibold text-[var(--color-ink)]">
                  {formattedPrice}
                </span>
                <span className="block text-[10px] text-[var(--color-muted-light)]">
                  Tax Inclusive
                </span>
              </div>
            )}
          </div>
          <span className="text-xs font-medium text-[var(--color-bronze)] group-hover:underline">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}

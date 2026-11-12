"use client";

import { useState } from "react";
import Link from "next/link";
import { MockProduct, ProductVariantView } from "@/lib/products";
import { ProductPurchaseAction } from "@/components/ProductPurchaseAction";
import { DeliveryEstimator } from "@/components/DeliveryEstimator";

interface ProductInteractiveClientProps {
  product: MockProduct;
}

export function ProductInteractiveClient({ product }: ProductInteractiveClientProps) {
  const variants = product.variants && product.variants.length > 0 ? product.variants : [];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantView | null>(
    variants[0] || null
  );

  // Gallery images list
  const galleryImages: string[] = [];
  if (product.images && product.images.length > 0) {
    for (const img of product.images) {
      if (img.url && !galleryImages.includes(img.url)) {
        galleryImages.push(img.url);
      }
    }
  } else if (product.primaryImageUrl) {
    galleryImages.push(product.primaryImageUrl);
  }

  // Active active image state
  const initialImage = selectedVariant?.imageUrl || galleryImages[0] || null;
  const [activeImage, setActiveImage] = useState<string | null>(initialImage);

  // When variant changes, update price and optionally hero image
  const handleVariantChange = (v: ProductVariantView) => {
    setSelectedVariant(v);
    if (v.imageUrl && galleryImages.includes(v.imageUrl)) {
      setActiveImage(v.imageUrl);
    } else if (v.imageUrl) {
      setActiveImage(v.imageUrl);
    }
  };

  const currentPricePaise = selectedVariant ? selectedVariant.pricePaise : product.pricePaise;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku || product.id;
  const currentStock = selectedVariant ? selectedVariant.stock : undefined;

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(currentPricePaise / 100);

  const mtoAdvancePaise = Math.round(currentPricePaise * 0.25);
  const formattedAdvance = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(mtoAdvancePaise / 100);

  // Construct effective product payload for cart with selected variant
  const effectiveProductForCart: MockProduct = {
    ...product,
    pricePaise: currentPricePaise,
    sku: currentSku,
    primaryImageUrl: activeImage || product.primaryImageUrl,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Left Column: Visual Representation & Gallery (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="aspect-[4/3] rounded-2xl bg-[var(--color-ivory)] border border-[var(--color-decorative-border)] flex items-center justify-center relative overflow-hidden shadow-sm">
          {activeImage ? (
            <img
              src={activeImage}
              alt={product.name}
              className="h-full w-full object-cover transition-all duration-500"
            />
          ) : (
            <div className="text-center space-y-3 p-8">
              <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-canvas)] border border-[var(--color-control-border)] text-[10px] uppercase tracking-wider font-semibold text-[var(--color-bronze)]">
                {product.mode === "MADE_TO_ORDER"
                  ? "Crafted to Order"
                  : product.mode === "QUOTE_ONLY"
                  ? "Architectural Quotation"
                  : "Ready Stock Edition"}
              </span>
              <h2 className="font-editorial text-2xl text-[var(--color-ink)]">
                {product.name}
              </h2>
              <p className="text-xs text-[var(--color-muted-light)] max-w-md mx-auto">
                {product.materials.join(" · ")}
              </p>
            </div>
          )}

          <span className="absolute top-4 left-4 rounded-md bg-[var(--color-charcoal)]/85 text-[var(--color-canvas)] px-3 py-1 text-[10px] font-semibold tracking-wider uppercase backdrop-blur-sm">
            {product.mode === "MADE_TO_ORDER"
              ? "Made to Order"
              : product.mode === "QUOTE_ONLY"
              ? "Quote Only"
              : "Ready Stock"}
          </span>
        </div>

        {/* Gallery Thumbnails */}
        {galleryImages.length > 1 && (
          <div className="flex flex-wrap items-center gap-3">
            {galleryImages.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(imgUrl)}
                className={`relative h-20 w-24 overflow-hidden rounded-xl border-2 transition-all ${
                  activeImage === imgUrl
                    ? "border-[var(--color-bronze)] shadow-sm scale-105"
                    : "border-[var(--color-decorative-border)] opacity-70 hover:opacity-100 hover:border-[var(--color-control-border)]"
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`${product.name} view ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Dimension & Weight Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-decorative-border)] text-center text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-light)] block mb-1">
              Dimensions
            </span>
            <span className="font-semibold text-[var(--color-ink)]">
              {product.dimensions}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-light)] block mb-1">
              Net Weight
            </span>
            <span className="font-semibold text-[var(--color-ink)]">
              {(product.weightGrams / 1000).toFixed(2)} kg
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-light)] block mb-1">
              Lead Time
            </span>
            <span className="font-semibold text-[var(--color-ink)]">
              {product.estimatedLeadTime}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-light)] block mb-1">
              Policy
            </span>
            <span className="font-semibold text-[var(--color-ink)]">
              {product.returnPolicyText}
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Commercial & Action Pane (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="border-b border-[var(--color-decorative-border)] pb-6 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[var(--color-muted-light)] font-medium">
              {product.subcategory || product.categoryName} {product.productType ? `· ${product.productType}` : ""}
            </span>
            <span className="text-[10px] font-mono text-[var(--color-muted-light)]">
              SKU: {currentSku}
            </span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)]">
            {product.name}
          </h1>

          {/* Authoritative Tax-Inclusive Pricing */}
          <div className="pt-2 flex items-baseline gap-2">
            <span className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)] font-semibold">
              {product.mode === "QUOTE_ONLY" ? "Price On Proposal" : formattedPrice}
            </span>
            {product.mode !== "QUOTE_ONLY" && (
              <span className="text-xs text-[var(--color-muted-light)]">
                (Tax-inclusive / GST included)
              </span>
            )}
          </div>

          {/* Multi-Variant Selector (if variants exist) */}
          {variants.length > 1 && (
            <div className="pt-4 border-t border-[var(--color-decorative-border)] space-y-2">
              <label className="text-xs font-semibold text-[var(--color-ink)] block">
                Select Edition / Finish:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const vPrice = new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(v.pricePaise / 100);

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleVariantChange(v)}
                      className={`text-left p-3 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? "border-[var(--color-bronze)] bg-[var(--color-ivory)] shadow-sm font-semibold"
                          : "border-[var(--color-control-border)] bg-[var(--color-canvas)] hover:border-[var(--color-ink)]"
                      }`}
                    >
                      <div className="flex justify-between items-center text-[var(--color-ink)]">
                        <span className="truncate">{v.title}</span>
                        <span className="text-[var(--color-bronze)] ml-2">{vPrice}</span>
                      </div>
                      {v.materialFinish && (
                        <p className="text-[10px] text-[var(--color-muted-light)] mt-0.5 truncate">
                          {v.materialFinish}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Availability indicator for Ready Stock */}
          {product.mode === "READY_STOCK" && typeof currentStock === "number" && (
            <div className="flex items-center gap-2 text-xs pt-1">
              <span className={`h-2 w-2 rounded-full ${currentStock > 0 ? "bg-emerald-500" : "bg-rose-500"}`}></span>
              <span className="text-[var(--color-muted-light)]">
                {currentStock > 0 ? `${currentStock} units in workshop allocation` : "Edition currently out of stock"}
              </span>
            </div>
          )}

          {/* MTO Advance Callout if Applicable */}
          {product.mode === "MADE_TO_ORDER" && (
            <div className="p-3.5 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-bronze)]/30 text-xs space-y-1">
              <div className="flex justify-between items-center font-semibold text-[var(--color-ink)]">
                <span>25% Production Advance:</span>
                <span className="text-[var(--color-bronze)] font-editorial text-base">
                  {formattedAdvance}
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-muted-light)] leading-relaxed">
                Remaining 75% balance due upon workshop QC inspection photos and customer sign-off prior to dispatch.
              </p>
            </div>
          )}
        </div>

        {/* Short Description */}
        <div className="text-sm text-[var(--color-muted-light)] leading-relaxed space-y-4">
          <p>{product.shortDescription}</p>
        </div>

        {/* Materials Badge List */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
            Authoritative Materials & Craftsmanship
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.materials.map((m, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] text-xs text-[var(--color-ink)] font-medium"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic Distance-Band Delivery Estimator */}
        <DeliveryEstimator product={product} />

        {/* Purchase Action (Add to Cart / Request Quote) */}
        <div className="pt-4 border-t border-[var(--color-decorative-border)]">
          <ProductPurchaseAction product={effectiveProductForCart} formattedAdvance={formattedAdvance} />
        </div>

        {/* Full Editorial Description */}
        {product.fullDescription && product.fullDescription !== product.shortDescription && (
          <div className="pt-6 border-t border-[var(--color-decorative-border)] space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
              Workshop Editorial Description
            </h3>
            <div className="text-xs text-[var(--color-muted-light)] leading-relaxed whitespace-pre-line">
              {product.fullDescription}
            </div>
          </div>
        )}

        {/* Design & Engineering Highlights */}
        {product.features && product.features.length > 0 && (
          <div className="pt-6 border-t border-[var(--color-decorative-border)] space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
              Design & Engineering Highlights
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[var(--color-muted-light)]">
              {product.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Policy Quick Links */}
        <div className="pt-4 border-t border-[var(--color-decorative-border)] flex items-center justify-between text-xs text-[var(--color-muted-light)]">
          <Link href="/shipping" className="hover:text-[var(--color-bronze)] underline">
            Shipping & Distance Bands
          </Link>
          <Link href="/returns-refunds" className="hover:text-[var(--color-bronze)] underline">
            Returns & Cancellations
          </Link>
        </div>
      </div>
    </div>
  );
}


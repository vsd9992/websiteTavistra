"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MockProduct, ProductVariantView } from "@/lib/products";
import { ProductPurchaseAction } from "@/components/ProductPurchaseAction";
import { DeliveryEstimator } from "@/components/DeliveryEstimator";
import { ProductLightbox } from "@/components/ProductLightbox";
import { ProductShareModal } from "@/components/ProductShareModal";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

interface ProductInteractiveClientProps {
  product: MockProduct;
}

export function ProductInteractiveClient({ product }: ProductInteractiveClientProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const variants = product.variants && product.variants.length > 0 ? product.variants : [];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantView | null>(
    variants[0] || null
  );

  // Lightbox & Share states
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [showMobileSticky, setShowMobileSticky] = useState(false);
  const buyBoxRef = useRef<HTMLDivElement>(null);

  // Helper to resolve gallery images for a given variant (with fallback to master product gallery)
  const getGalleryForVariant = (v: ProductVariantView | null): string[] => {
    if (v?.images && v.images.length > 0) {
      const urls = v.images.map((img) => img.url).filter(Boolean);
      if (urls.length > 0) return urls;
    }
    if (v?.imageUrl) {
      return [v.imageUrl];
    }
    const masterGallery: string[] = [];
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.url && !masterGallery.includes(img.url)) {
          masterGallery.push(img.url);
        }
      }
    } else if (product.primaryImageUrl) {
      masterGallery.push(product.primaryImageUrl);
    }
    return masterGallery;
  };

  const currentGallery = getGalleryForVariant(selectedVariant);

  // Active hero image state
  const [activeImage, setActiveImage] = useState<string | null>(
    currentGallery[0] || selectedVariant?.imageUrl || product.primaryImageUrl || null
  );

  // When variant changes, update variant and switch gallery & hero image to the variant's images
  const handleVariantChange = (v: ProductVariantView) => {
    setSelectedVariant(v);
    const newGallery = getGalleryForVariant(v);
    setActiveImage(newGallery[0] || v.imageUrl || null);
  };

  // Mobile Sticky Bar Trigger (triggers when buy box scrolls past top viewport)
  useEffect(() => {
    const handleScroll = () => {
      if (!buyBoxRef.current) return;
      const rect = buyBoxRef.current.getBoundingClientRect();
      setShowMobileSticky(rect.bottom < 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Open Lightbox at specific image
  const handleOpenLightbox = (imgUrl?: string) => {
    const targetUrl = imgUrl || activeImage || currentGallery[0];
    const idx = currentGallery.findIndex((url) => url === targetUrl);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  // Dynamic values with fallback to master product
  const currentPricePaise = selectedVariant ? selectedVariant.pricePaise : product.pricePaise;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku || product.id;
  const currentStock = selectedVariant ? selectedVariant.stock : undefined;
  const currentDimensions = selectedVariant?.dimensions || product.dimensions;
  const currentWeightGrams = selectedVariant?.weightGrams ?? product.weightGrams;
  const currentDescription = selectedVariant?.description || product.shortDescription;
  const currentMaterialFinish =
    selectedVariant?.materialFinish ||
    (product.materials && product.materials.length > 0 ? product.materials.join(" · ") : "");

  // Variant-specific wishlist checking & toggling
  const currentVariantKey = selectedVariant?.id || currentSku;
  const isCurrentVariantInWishlist = isInWishlist(currentVariantKey);

  const handleToggleCurrentVariantWishlist = () => {
    toggleWishlist({
      id: product.id,
      slug: product.slug,
      title: product.name,
      variantId: selectedVariant?.id,
      variantTitle: selectedVariant?.title,
      sku: currentSku,
    });
  };

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

  // Construct effective product payload for cart with selected variant overrides
  const effectiveProductForCart: MockProduct = {
    ...product,
    pricePaise: currentPricePaise,
    sku: currentSku,
    variantId: selectedVariant?.id,
    variantTitle: selectedVariant?.title,
    availableStock: currentStock,
    dimensions: currentDimensions,
    weightGrams: currentWeightGrams,
    lengthMm: selectedVariant?.lengthMm ?? product.lengthMm,
    widthMm: selectedVariant?.widthMm ?? product.widthMm,
    heightMm: selectedVariant?.heightMm ?? product.heightMm,
    shortDescription: currentDescription,
    primaryImageUrl: activeImage || selectedVariant?.imageUrl || product.primaryImageUrl,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Left Column: Visual Representation & Gallery (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="aspect-[4/3] rounded-2xl bg-[var(--color-ivory)] border border-[var(--color-decorative-border)] flex items-center justify-center relative overflow-hidden shadow-sm group">
          {activeImage ? (
            <img
              src={activeImage}
              alt={product.name}
              onClick={() => handleOpenLightbox(activeImage)}
              className="h-full w-full object-cover transition-all duration-500 cursor-zoom-in"
              title="Click to zoom high-resolution photograph"
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

          <span className="absolute top-4 left-4 rounded-md bg-[var(--color-charcoal)]/85 text-[var(--color-canvas)] px-3 py-1 text-[10px] font-semibold tracking-wider uppercase backdrop-blur-sm pointer-events-none">
            {product.mode === "MADE_TO_ORDER"
              ? "Made to Order"
              : product.mode === "QUOTE_ONLY"
              ? "Quote Only"
              : "Ready Stock"}
          </span>

          {/* Lightbox Trigger Overlay Button */}
          {activeImage && (
            <button
              type="button"
              onClick={() => handleOpenLightbox(activeImage)}
              className="absolute bottom-4 right-4 p-2.5 rounded-full bg-[var(--color-ivory)]/90 hover:bg-white text-[var(--color-ink)] shadow-md backdrop-blur-sm border border-[var(--color-decorative-border)] transition-transform hover:scale-105 active:scale-95"
              title="Expand high-resolution gallery"
              aria-label="Expand high-resolution gallery"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            </button>
          )}
        </div>

        {/* Gallery Thumbnails for Selected Variant */}
        {currentGallery.length > 1 && (
          <div className="flex flex-wrap items-center gap-3">
            {currentGallery.map((imgUrl, idx) => (
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

        {/* Dimension & Weight Specs Grid — Dynamically updates with Variant Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-decorative-border)] text-center text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-light)] block mb-1">
              Dimensions
            </span>
            <span className="font-semibold text-[var(--color-ink)] transition-all">
              {currentDimensions}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-light)] block mb-1">
              Net Weight
            </span>
            <span className="font-semibold text-[var(--color-ink)] transition-all">
              {(currentWeightGrams / 1000).toFixed(2)} kg
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

          {/* Authoritative Tax-Inclusive Pricing (Updates live on variant selection) */}
          <div className="pt-2 flex items-baseline gap-2">
            <span className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)] font-semibold transition-all">
              {product.mode === "QUOTE_ONLY" ? "Price On Proposal" : formattedPrice}
            </span>
            {product.mode !== "QUOTE_ONLY" && (
              <span className="text-xs text-[var(--color-muted-light)]">
                (Tax-inclusive / GST included)
              </span>
            )}
          </div>

          {/* Client Wishlist & Universal Share Piece Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleCurrentVariantWishlist}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all ${
                isCurrentVariantInWishlist
                  ? "border-[var(--color-bronze)] bg-[var(--color-bronze)]/10 text-[var(--color-bronze)] font-semibold shadow-sm"
                  : "border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-ink)] hover:border-[var(--color-bronze)] hover:bg-[var(--color-ivory)]"
              }`}
              title={
                isCurrentVariantInWishlist
                  ? `Saved finish (${currentSku}) in your Studio Wishlist`
                  : `Save this finish (${currentSku}) to client wishlist`
              }
            >
              <svg
                className={`w-4 h-4 transition-transform active:scale-125 ${
                  isCurrentVariantInWishlist
                    ? "fill-[var(--color-bronze)] text-[var(--color-bronze)]"
                    : "fill-none text-current"
                }`}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              <span>{isCurrentVariantInWishlist ? "Saved Finish in Wishlist" : "Save this Finish to Wishlist"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2 text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-bronze)] hover:bg-[var(--color-ivory)] transition-all"
              title="Share piece via WhatsApp, link, or device apps"
            >
              <svg className="w-4 h-4 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
              <span>Share Piece</span>
            </button>
          </div>

          {/* Multi-Variant Capsule Button Selector (Clean title-only pills, no price repetition) */}
          {variants.length > 1 && (
            <div className="pt-5 border-t border-[var(--color-decorative-border)] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--color-ink)] block">
                  Select Edition / Finish:
                </label>
                {selectedVariant && (
                  <span className="text-[11px] text-[var(--color-bronze)] font-medium">
                    {selectedVariant.title}
                  </span>
                )}
              </div>

              {/* Capsule Buttons (Pills) */}
              <div className="flex flex-wrap gap-2.5">
                {variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleVariantChange(v)}
                      className={`inline-flex items-center rounded-full px-5 py-2.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-[var(--color-ink)] text-[var(--color-canvas)] ring-2 ring-[var(--color-bronze)] ring-offset-2 ring-offset-[var(--color-canvas)] shadow-sm font-semibold"
                          : "bg-[var(--color-canvas)] text-[var(--color-ink)] border border-[var(--color-control-border)] hover:border-[var(--color-ink)] hover:bg-[var(--color-ivory)]/40"
                      }`}
                    >
                      <span>{v.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Variant Finish Note */}
              {selectedVariant?.materialFinish && (
                <p className="text-xs text-[var(--color-muted-light)] italic pt-1 pl-1">
                  Finish: {selectedVariant.materialFinish}
                </p>
              )}
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

        {/* Short Description (Variant-Specific Override or Master Fallback) */}
        <div className="text-sm text-[var(--color-muted-light)] leading-relaxed space-y-4">
          <p>{currentDescription}</p>
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

        {/* Purchase Action (Add to Cart / Request Quote) */}
        <div ref={buyBoxRef} className="pt-4 border-t border-[var(--color-decorative-border)] space-y-4">
          <ProductPurchaseAction product={effectiveProductForCart} formattedAdvance={formattedAdvance} />

          {/* Dynamic Distance-Band Delivery Estimator (Under Add to Cart per User Request 3) */}
          <DeliveryEstimator product={effectiveProductForCart} />
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

      {/* Lightbox Modal */}
      <ProductLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={currentGallery}
        initialIndex={lightboxIndex}
        productName={product.name}
      />

      {/* Universal Share Modal */}
      <ProductShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        product={{
          title: product.name,
          slug: product.slug,
          sku: currentSku,
          categoryName: product.categoryName,
        }}
      />

      {/* PDP Mobile Sticky Action Bar */}
      {showMobileSticky && (
        <aside
          role="region"
          aria-label="Quick action bar"
          className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[var(--color-canvas)]/98 backdrop-blur-md border-t border-[var(--color-decorative-border)] p-3 shadow-2xl flex items-center justify-between gap-3 animate-fade-in"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {activeImage && (
              <img
                src={activeImage}
                alt={product.name}
                className="h-11 w-11 rounded-lg object-cover border border-[var(--color-decorative-border)] shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs font-serif font-medium text-[var(--color-ink)] truncate max-w-[130px] sm:max-w-[200px]">
                {product.name}
              </p>
              {selectedVariant?.title && (
                <p className="text-[10px] text-[var(--color-muted-light)] truncate max-w-[130px] sm:max-w-[200px]">
                  {selectedVariant.title}
                </p>
              )}
              <p className="text-xs font-semibold text-[var(--color-bronze)]">
                {product.mode === "QUOTE_ONLY" ? "On Proposal" : formattedPrice}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleToggleCurrentVariantWishlist}
              className={`p-2.5 rounded-full border transition-all ${
                isCurrentVariantInWishlist
                  ? "border-[var(--color-bronze)] bg-[var(--color-bronze)]/10 text-[var(--color-bronze)]"
                  : "border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-ink)]"
              }`}
              title={
                isCurrentVariantInWishlist
                  ? "Saved finish in Studio Wishlist"
                  : "Save this finish to Wishlist"
              }
              aria-label="Save this finish to Wishlist"
            >
              <svg
                className={`w-4 h-4 ${isCurrentVariantInWishlist ? "fill-[var(--color-bronze)]" : "fill-none"}`}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </button>

            {product.mode === "QUOTE_ONLY" ? (
              <Link
                href={`/contact?subject=Architectural%20%26%20Bespoke%20Order%20(Quote%20Only)&product=${encodeURIComponent(
                  product.name
                )}&sku=${encodeURIComponent(currentSku)}`}
                className="rounded-full bg-[var(--color-ink)] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] hover:bg-[var(--color-bronze)] transition-colors"
              >
                Quote
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  addToCart(effectiveProductForCart);
                }}
                className="rounded-full bg-[var(--color-ink)] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] hover:bg-[var(--color-bronze)] transition-colors shadow-sm active:scale-95"
              >
                Add to Bag
              </button>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

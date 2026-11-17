"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import AccountNav from "@/components/AccountNav";
import { useAuth } from "@/context/AuthContext";
import { useWishlist, WishlistProduct } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { MockProduct } from "@/lib/products";

export default function AccountWishlistPage() {
  const router = useRouter();
  const { isAuthenticated, authLoading } = useAuth();
  const { wishlistItems, wishlistCount, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [movingId, setMovingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/account/login?next=/account/wishlist");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleMoveToBag = async (item: WishlistProduct) => {
    setMovingId(item.productId);
    try {
      const mockProduct: MockProduct = {
        id: item.productId,
        slug: item.slug,
        sku: item.sku,
        name: item.title,
        categorySlug: "hardware",
        categoryName: "Architectural Hardware",
        subcategory: "Architectural Hardware",
        mode: item.mode,
        pricePaise: item.pricePaise,
        primaryImageUrl: item.imageUrl,
        shortDescription: item.title,
        materials: [],
        dimensions: "",
        weightGrams: 0,
        lengthMm: 0,
        widthMm: 0,
        heightMm: 0,
        estimatedLeadTime: item.mode === "MADE_TO_ORDER" ? "3-4 Weeks" : "3-5 Business Days",
        returnPolicyText: "Standard Return Policy",
        features: [],
      };

      addToCart(mockProduct);
      await removeFromWishlist(item.productId);
    } finally {
      setMovingId(null);
    }
  };

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      await removeFromWishlist(productId);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)]">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-12 lg:py-16">
        {authLoading || !isAuthenticated ? (
          <div className="py-24 text-center text-xs text-[var(--color-muted-light)]">
            Verifying your client session...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-1">
              <AccountNav />
            </div>

            <div className="lg:col-span-3 space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--color-decorative-border)] pb-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted-light)]">
                    Client Portal
                  </span>
                  <h1 className="text-3xl font-serif font-light text-[var(--color-ink)]">
                    Saved Studio Wishlist
                  </h1>
                  <p className="text-xs text-[var(--color-muted-light)]">
                    Curate your preferred architectural hardware editions across design concepts.
                  </p>
                </div>

                {wishlistCount > 0 && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] px-4 py-1.5 self-start sm:self-auto">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-bronze)]" />
                    <span className="text-xs font-semibold text-[var(--color-ink)] font-mono">
                      {wishlistCount} {wishlistCount === 1 ? "Edition" : "Editions"}
                    </span>
                  </div>
                )}
              </div>

              {/* Body */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/40 p-5 space-y-4 animate-pulse"
                    >
                      <div className="aspect-[4/3] w-full rounded-xl bg-[var(--color-stone)]" />
                      <div className="h-4 w-3/4 rounded bg-[var(--color-stone)]" />
                      <div className="h-3 w-1/2 rounded bg-[var(--color-stone)]" />
                      <div className="h-9 w-full rounded-full bg-[var(--color-stone)]" />
                    </div>
                  ))}
                </div>
              ) : wishlistItems.length === 0 ? (
                <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/40 p-12 text-center space-y-5">
                  <div className="mx-auto w-16 h-16 rounded-full bg-[var(--color-stone)] border border-[var(--color-decorative-border)] flex items-center justify-center text-[var(--color-bronze)]">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                      />
                    </svg>
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <p className="text-lg font-serif text-[var(--color-ink)]">
                      Your Studio Wishlist is empty
                    </p>
                    <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
                      Save architectural pieces while exploring collections to review finishes, dimensions, and specifications across all your client devices.
                    </p>
                  </div>
                  <div>
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-6 py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-bronze)] transition-colors shadow-sm"
                    >
                      <span>Explore Architectural Collections</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistItems.map((item) => {
                    const priceFormatted =
                      item.pricePaise > 0
                        ? `₹${(item.pricePaise / 100).toLocaleString("en-IN")}`
                        : "Price on Request";

                    const isMoving = movingId === item.productId;
                    const isRemoving = removingId === item.productId;

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/70 overflow-hidden flex flex-col justify-between p-5 hover:border-[var(--color-bronze)]/50 transition-all group"
                      >
                        <div className="space-y-4">
                          {/* Image Container */}
                          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[var(--color-stone)] border border-[var(--color-decorative-border)]/50">
                            <Link href={`/product/${item.slug}`}>
                              <Image
                                src={item.imageUrl || "/comingSoon_1.webp"}
                                alt={item.title}
                                fill
                                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            </Link>

                            {/* Mode Pill */}
                            <div className="absolute top-3 left-3">
                              {item.mode === "READY_STOCK" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 backdrop-blur-sm">
                                  Ready Stock
                                </span>
                              )}
                              {item.mode === "MADE_TO_ORDER" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-amber-950/80 text-amber-300 border border-amber-700/50 backdrop-blur-sm">
                                  Made to Order
                                </span>
                              )}
                              {item.mode === "QUOTE_ONLY" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-slate-900/80 text-slate-300 border border-slate-700/50 backdrop-blur-sm">
                                  Quote Only
                                </span>
                              )}
                            </div>

                            {/* Remove button overlay */}
                            <button
                              type="button"
                              onClick={() => handleRemove(item.productId)}
                              disabled={isRemoving}
                              title="Remove from wishlist"
                              className="absolute top-3 right-3 p-1.5 rounded-full bg-[var(--color-ivory)]/90 hover:bg-white text-[var(--color-muted-light)] hover:text-rose-600 transition-colors shadow-sm backdrop-blur-sm border border-[var(--color-decorative-border)]/60"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          {/* Edition Details */}
                          <div className="space-y-1.5">
                            {item.sku && (
                              <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted-light)]">
                                {item.sku}
                              </p>
                            )}
                            <h2 className="text-base font-serif font-medium text-[var(--color-ink)] hover:text-[var(--color-bronze)] transition-colors line-clamp-1">
                              <Link href={`/product/${item.slug}`}>{item.title}</Link>
                            </h2>
                            <p className="text-sm font-semibold text-[var(--color-ink)]">
                              {priceFormatted}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-5 mt-5 border-t border-[var(--color-decorative-border)] space-y-2">
                          {item.mode === "QUOTE_ONLY" ? (
                            <Link
                              href={`/quote?sku=${encodeURIComponent(item.sku)}&product=${encodeURIComponent(item.slug)}`}
                              className="w-full inline-flex items-center justify-center rounded-full bg-[var(--color-ink)] py-2.5 px-4 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-bronze)] transition-colors"
                            >
                              Request Custom Proposal
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMoveToBag(item)}
                              disabled={isMoving}
                              className="w-full inline-flex items-center justify-center rounded-full bg-[var(--color-ink)] py-2.5 px-4 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-bronze)] transition-colors disabled:opacity-50"
                            >
                              {isMoving ? "Moving to Bag..." : "Move to Bag"}
                            </button>
                          )}

                          <div className="flex items-center justify-between text-xs pt-1 px-1">
                            <Link
                              href={`/product/${item.slug}`}
                              className="text-[var(--color-muted-light)] hover:text-[var(--color-ink)] transition-colors"
                            >
                              View Specification →
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleRemove(item.productId)}
                              disabled={isRemoving}
                              className="text-xs text-[var(--color-muted-light)] hover:text-rose-600 transition-colors"
                            >
                              {isRemoving ? "Removing…" : "Remove"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

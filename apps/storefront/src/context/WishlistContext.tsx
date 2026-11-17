"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "./AuthContext";

export interface WishlistProduct {
  id: string;
  productId: string;
  slug: string;
  sku: string;
  title: string;
  pricePaise: number;
  imageUrl: string;
  mode: "READY_STOCK" | "MADE_TO_ORDER" | "QUOTE_ONLY";
  addedAt: string;
}

interface WishlistContextType {
  wishlistItems: WishlistProduct[];
  wishlistCount: number;
  loading: boolean;
  isInWishlist: (productIdOrSlug: string) => boolean;
  toggleWishlist: (product: {
    id: string;
    slug: string;
    title: string;
  }) => Promise<{ success: boolean; inWishlist: boolean }>;
  removeFromWishlist: (productIdOrWishlistId: string) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
  promptGuestSignIn: (nextUrl?: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [guestPromptOpen, setGuestPromptOpen] = useState(false);
  const [nextRedirectUrl, setNextRedirectUrl] = useState("/account/wishlist");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      setWishlistIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/account/wishlist", {
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const items: WishlistProduct[] = Array.isArray(data.wishlist) ? data.wishlist : [];
        setWishlistItems(items);
        const ids = new Set<string>();
        for (const item of items) {
          ids.add(item.productId);
          ids.add(item.slug);
        }
        setWishlistIds(ids);
      }
    } catch (err) {
      console.warn("Could not load wishlist:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refreshWishlist();
  }, [refreshWishlist, user?.id]);

  const isInWishlist = useCallback(
    (productIdOrSlug: string) => {
      if (!productIdOrSlug) return false;
      return wishlistIds.has(productIdOrSlug);
    },
    [wishlistIds]
  );

  const promptGuestSignIn = (nextUrl?: string) => {
    if (nextUrl) setNextRedirectUrl(nextUrl);
    setGuestPromptOpen(true);
  };

  const toggleWishlist = async (product: {
    id: string;
    slug: string;
    title: string;
  }): Promise<{ success: boolean; inWishlist: boolean }> => {
    if (!isAuthenticated) {
      promptGuestSignIn(`/product/${product.slug}`);
      return { success: false, inWishlist: false };
    }

    try {
      const res = await fetch("/api/account/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: product.id, slug: product.slug }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to update wishlist.");
      }

      const inWishlist = Boolean(data.inWishlist);
      showToast(inWishlist ? `Saved to your Studio Wishlist` : `Removed from Wishlist`);

      // Optimistically update set
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (inWishlist) {
          next.add(product.id);
          next.add(product.slug);
        } else {
          next.delete(product.id);
          next.delete(product.slug);
        }
        return next;
      });

      void refreshWishlist();
      return { success: true, inWishlist };
    } catch (err) {
      console.error("toggleWishlist error:", err);
      showToast((err as Error).message || "Could not update wishlist.");
      return { success: false, inWishlist: isInWishlist(product.id) };
    }
  };

  const removeFromWishlist = async (productIdOrWishlistId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    try {
      const res = await fetch(`/api/account/wishlist/${encodeURIComponent(productIdOrWishlistId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        showToast("Piece removed from your wishlist");
        void refreshWishlist();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist,
        promptGuestSignIn,
      }}
    >
      {children}

      {/* Floating Wishlist Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className="flex items-center gap-2.5 rounded-full bg-[var(--color-ink)] px-5 py-3 text-xs font-semibold text-[var(--color-canvas)] shadow-xl border border-[var(--color-bronze)]/40">
            <svg className="w-4 h-4 text-[var(--color-bronze)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Guest Sign-in Prompt Modal */}
      {guestPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-8 shadow-2xl text-center space-y-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-[var(--color-stone)] border border-[var(--color-decorative-border)] flex items-center justify-center text-[var(--color-bronze)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-bronze)] block">
                Tavistra Client Studio
              </span>
              <h3 className="font-editorial text-2xl text-[var(--color-ink)]">
                Save to Your Wishlist
              </h3>
              <p className="text-xs text-[var(--color-muted-light)] leading-relaxed max-w-sm mx-auto">
                Sign in to save architectural editions to your private client wishlist and seamlessly access them across all your devices.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Link
                href={`/account/login?next=${encodeURIComponent(nextRedirectUrl)}`}
                onClick={() => setGuestPromptOpen(false)}
                className="w-full rounded-full bg-[var(--color-ink)] py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm block text-center"
              >
                Sign In to Continue →
              </Link>
              <button
                type="button"
                onClick={() => setGuestPromptOpen(false)}
                className="w-full rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] py-2.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors text-center"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

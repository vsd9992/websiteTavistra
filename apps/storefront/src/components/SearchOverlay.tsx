"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { APPROVED_CATEGORIES } from "@/lib/taxonomy";

interface SearchCategoryMatch {
  name: string;
  slug: string;
  type: "category" | "subcategory";
  url: string;
}

interface SearchProductMatch {
  id: string;
  slug: string;
  name: string;
  sku: string;
  categoryName: string;
  categorySlug: string;
  mode: "READY_STOCK" | "MADE_TO_ORDER" | "QUOTE_ONLY";
  priceLabel: string;
  primaryImageUrl: string | null;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<SearchCategoryMatch[]>([]);
  const [products, setProducts] = useState<SearchProductMatch[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Ensure client mounting before portaling
  useEffect(() => {
    setMounted(true);
  }, []);

  // Flattened active suggestions list for arrow-key navigation
  const flatSuggestions = [
    ...categories.map((c) => ({ type: "category" as const, item: c, url: c.url })),
    ...products.map((p) => ({ type: "product" as const, item: p, url: `/product/${p.slug}` })),
  ];

  // Reset state and handle autofocus / body scroll when overlay opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setCategories([]);
      setProducts([]);
      setTotalCount(0);
      setSelectedIndex(-1);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Debounced live suggestion fetcher (WEB-039 Restrained Live Suggestions)
  const fetchSuggestions = useCallback((searchQuery: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setCategories([]);
      setProducts([]);
      setTotalCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          setProducts(data.products || []);
          setTotalCount(data.totalCount || 0);
        }
      } catch (err) {
        console.error("Live search lookup failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 220); // 220ms debounce
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedIndex(-1);
    fetchSuggestions(val);
  };

  const executeSearch = (targetQuery?: string) => {
    const q = (targetQuery !== undefined ? targetQuery : query).trim();
    if (!q) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (flatSuggestions.length > 0) {
        setSelectedIndex((prev) => (prev < flatSuggestions.length - 1 ? prev + 1 : 0));
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (flatSuggestions.length > 0) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatSuggestions.length - 1));
      }
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < flatSuggestions.length) {
        const target = flatSuggestions[selectedIndex];
        onClose();
        router.push(target.url);
      } else {
        executeSearch();
      }
    }
  };

  if (!isOpen || !mounted) return null;

  const modeBadgeText: Record<string, string> = {
    READY_STOCK: "Ready Stock",
    MADE_TO_ORDER: "Made to Order",
    QUOTE_ONLY: "Quote Only",
  };

  // Portal directly into document.body to prevent containing-block clipping from sticky/backdrop-blur headers
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Catalogue Search"
      className="fixed inset-0 z-[99999] flex flex-col justify-start items-center bg-black/60 backdrop-blur-md p-4 sm:p-6 md:p-8"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-2xl mt-12 sm:mt-20 overflow-hidden rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Input Bar */}
        <div className="relative flex items-center border-b border-[var(--color-decorative-border)] px-4 py-3.5 sm:px-6">
          <svg
            className="h-5 w-5 text-[var(--color-bronze)] flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search objects, materials, editions..."
            className="w-full bg-transparent px-3 text-sm sm:text-base text-[var(--color-ink)] placeholder-[var(--color-muted-light)] focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />

          <div className="flex items-center gap-2 flex-shrink-0">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategories([]);
                  setProducts([]);
                  setTotalCount(0);
                  inputRef.current?.focus();
                }}
                className="p-1 text-xs text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
                aria-label="Clear query"
              >
                Clear
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-muted-light)] transition-colors hover:text-[var(--color-ink)] hover:border-[var(--color-control-border)]"
              aria-label="Close search"
            >
              Esc
            </button>
          </div>
        </div>

        {/* Loading Bar */}
        {isLoading && (
          <div className="h-0.5 w-full bg-[var(--color-ivory)] overflow-hidden">
            <div className="h-full bg-[var(--color-bronze)] w-1/3 animate-pulse" />
          </div>
        )}

        {/* Body Content */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6">
          {/* State 1: Empty Query / Discovery Links */}
          {query.trim().length < 2 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-bronze)] mb-3">
                Explore Studio Collections
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {APPROVED_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    onClick={onClose}
                    className="flex flex-col rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/60 p-3 transition-colors hover:bg-[var(--color-ivory)] hover:border-[var(--color-control-border)]"
                  >
                    <span className="text-xs font-semibold text-[var(--color-ink)] line-clamp-1">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-[var(--color-muted-light)] line-clamp-1 mt-0.5">
                      {cat.subcategories.slice(0, 2).join(", ")}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--color-decorative-border)]/60 flex items-center justify-between">
                <span className="text-xs text-[var(--color-muted-light)]">
                  Type 2 or more characters to see live suggestions.
                </span>
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="text-xs font-semibold text-[var(--color-bronze)] hover:underline"
                >
                  Shop All Works →
                </Link>
              </div>
            </div>
          )}

          {/* State 2: Restrained Live Suggestions (WEB-039) */}
          {query.trim().length >= 2 && (
            <div className="space-y-4">
              {/* Category / Type Matches */}
              {categories.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-bronze)] mb-2">
                    Taxonomy &amp; Categories
                  </p>
                  <div className="space-y-1">
                    {categories.map((cat, idx) => {
                      const isSelected = selectedIndex === idx;
                      return (
                        <Link
                          key={cat.name}
                          href={cat.url}
                          onClick={onClose}
                          className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors ${
                            isSelected
                              ? "bg-[var(--color-ivory)] text-[var(--color-ink)] font-semibold"
                              : "text-[var(--color-muted-light)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-ink)]"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-[var(--color-bronze)]">
                              {cat.type === "category" ? "Category" : "Edition Type"}
                            </span>
                            <span className="text-[var(--color-ink)] font-medium">{cat.name}</span>
                          </span>
                          <span className="text-[11px] text-[var(--color-muted-light)]">→</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Product Matches */}
              {products.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-bronze)] mb-2">
                    Matching Objects ({products.length} of {totalCount})
                  </p>
                  <div className="space-y-1.5">
                    {products.map((p, idx) => {
                      const overallIndex = categories.length + idx;
                      const isSelected = selectedIndex === overallIndex;
                      return (
                        <Link
                          key={p.id}
                          href={`/product/${p.slug}`}
                          onClick={onClose}
                          className={`flex items-center justify-between rounded-xl p-2.5 transition-colors border ${
                            isSelected
                              ? "border-[var(--color-control-border)] bg-[var(--color-ivory)] shadow-sm"
                              : "border-transparent hover:border-[var(--color-decorative-border)] hover:bg-[var(--color-ivory)]/70"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {p.primaryImageUrl ? (
                              <img
                                src={p.primaryImageUrl}
                                alt={p.name}
                                className="h-10 w-10 rounded-lg object-cover flex-shrink-0 bg-[var(--color-ivory)] border border-[var(--color-decorative-border)]/50"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-[var(--color-ivory)] border border-[var(--color-decorative-border)]/50 flex items-center justify-center text-[10px] font-serif text-[var(--color-bronze)]">
                                T
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-[var(--color-ink)] truncate">
                                {p.name}
                              </h4>
                              <p className="text-[10px] text-[var(--color-muted-light)] truncate">
                                {p.categoryName} • {modeBadgeText[p.mode] || p.mode}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-[var(--color-ink)] ml-3 flex-shrink-0">
                            {p.priceLabel}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Zero Matches state inside suggestions */}
              {!isLoading && categories.length === 0 && products.length === 0 && (
                <div className="py-6 text-center">
                  <p className="text-xs font-medium text-[var(--color-ink)]">
                    No immediate pieces found for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-[11px] text-[var(--color-muted-light)] mt-1">
                    Press Enter to perform a full catalogue search across all specifications.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer / Submit Action */}
        {query.trim().length >= 2 && (
          <div className="border-t border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/50 px-4 py-3 sm:px-6 flex items-center justify-between">
            <span className="text-[11px] text-[var(--color-muted-light)]">
              Press <kbd className="rounded border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] px-1 py-0.5 text-[10px]">Enter</kbd> to search full catalogue
            </span>
            <button
              type="button"
              onClick={() => executeSearch()}
              className="text-xs font-semibold text-[var(--color-bronze)] hover:underline flex items-center gap-1"
            >
              <span>View all results {totalCount > 0 ? `(${totalCount})` : ""}</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

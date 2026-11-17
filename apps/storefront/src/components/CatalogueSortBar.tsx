"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export interface CatalogueCategoryOption {
  name: string;
  slug: string;
}

interface CatalogueSortBarProps {
  currentMode: string;
  currentSort: string;
  totalCount: number;
  basePath: string;
  extraParams?: Record<string, string | undefined>;
  categories?: CatalogueCategoryOption[];
  activeCategorySlug?: string;
  subcategories?: string[];
  activeSubcategory?: string;
}

export function CatalogueSortBar({
  currentMode = "all",
  currentSort = "featured",
  totalCount,
  basePath,
  extraParams = {},
  categories,
  activeCategorySlug,
  subcategories,
  activeSubcategory,
}: CatalogueSortBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Calculate active filter count for badge
  let activeFilterCount = 0;
  if (currentMode && currentMode.toLowerCase() !== "all") activeFilterCount++;
  if (activeSubcategory && activeSubcategory !== "all") activeFilterCount++;

  const handleClearAllFilters = () => {
    const params = new URLSearchParams();
    if (currentSort && currentSort !== "featured") {
      params.set("sort", currentSort);
    }
    const query = params.toString();
    router.push(`${basePath}${query ? `?${query}` : ""}`);
    setIsFilterDrawerOpen(false);
  };

  const handleUpdate = (mode: string, sort: string) => {
    const params = new URLSearchParams();

    // Preserve any extra parameters (such as 'sub' for subcategories)
    Object.entries(extraParams).forEach(([key, val]) => {
      if (val && val !== "all") params.set(key, val);
    });

    if (mode && mode.toLowerCase() !== "all") {
      params.set("mode", mode.toLowerCase());
    }
    if (sort && sort !== "featured") {
      params.set("sort", sort);
    }

    const query = params.toString();
    router.push(`${basePath}${query ? `?${query}` : ""}`);
  };

  const handleSubcategoryUpdate = (sub?: string) => {
    const params = new URLSearchParams();
    if (sub) {
      params.set("sub", sub);
    }
    if (currentMode && currentMode.toLowerCase() !== "all") {
      params.set("mode", currentMode.toLowerCase());
    }
    if (currentSort && currentSort !== "featured") {
      params.set("sort", currentSort);
    }

    const query = params.toString();
    router.push(`${basePath}${query ? `?${query}` : ""}`);
  };

  return (
    <>
      {/* =========================================================================
          DESKTOP TOOLBAR (sm:flex): Completely undisturbed desktop experience
         ========================================================================= */}
      <div className="hidden sm:flex items-center justify-between gap-4 pb-6 mb-8 border-b border-[var(--color-decorative-border)]/60 text-xs">
        {/* Mode Filters on Desktop */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[var(--color-ink)] mr-1 shrink-0">
            Edition Mode:
          </span>
          <button
            type="button"
            onClick={() => handleUpdate("all", currentSort)}
            className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              currentMode.toLowerCase() === "all"
                ? "bg-[var(--color-ink)] text-[var(--color-canvas)] font-semibold shadow-sm"
                : "border border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-ink)] hover:bg-[var(--color-ivory)]"
            }`}
          >
            All Works
          </button>
          <button
            type="button"
            onClick={() => handleUpdate("READY_STOCK", currentSort)}
            className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
              currentMode.toUpperCase() === "READY_STOCK"
                ? "bg-[var(--color-ink)] text-[var(--color-canvas)] font-semibold shadow-sm"
                : "border border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-ink)] hover:bg-[var(--color-ivory)]"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Ready Stock
          </button>
          <button
            type="button"
            onClick={() => handleUpdate("MADE_TO_ORDER", currentSort)}
            className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
              currentMode.toUpperCase() === "MADE_TO_ORDER"
                ? "bg-[var(--color-ink)] text-[var(--color-canvas)] font-semibold shadow-sm"
                : "border border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-ink)] hover:bg-[var(--color-ivory)]"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-bronze)]" />
            Made to Order
          </button>
        </div>

        {/* Counter & Sort Selector on Desktop */}
        <div className="flex items-center gap-4 shrink-0">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-xs text-[var(--color-muted-light)] hover:text-[var(--color-ink)] underline cursor-pointer transition-colors"
              title="Clear all active filters"
            >
              Clear filters
            </button>
          )}

          <span className="text-[11px] font-mono text-[var(--color-muted-light)]">
            {totalCount} {totalCount === 1 ? "piece" : "pieces"}
          </span>

          <div className="flex items-center gap-2">
            <label htmlFor="catalogue-sort-desktop" className="text-[11px] font-semibold text-[var(--color-ink)] whitespace-nowrap">
              Sort by:
            </label>
            <select
              id="catalogue-sort-desktop"
              value={currentSort}
              onChange={(e) => handleUpdate(currentMode, e.target.value)}
              className="rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-2.5 py-1 text-xs text-[var(--color-ink)] font-medium focus:outline-none focus:border-[var(--color-ink)] cursor-pointer"
            >
              <option value="featured">Curated Studio Order</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Alphabetical: A to Z</option>
              <option value="name_desc">Alphabetical: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE APP-STYLE TOOLBAR (sm:hidden): Clean single bar with Filter & Sort
         ========================================================================= */}
      <div className="flex sm:hidden items-center justify-between gap-3 pb-4 mb-6 border-b border-[var(--color-decorative-border)]/60 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono text-[var(--color-muted-light)] shrink-0">
            {totalCount} {totalCount === 1 ? "piece" : "pieces"}
          </span>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-[11px] text-[var(--color-muted-light)] hover:text-[var(--color-ink)] underline cursor-pointer font-medium transition-colors whitespace-nowrap"
              title="Clear active filters"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* App-Style Filter Button right next to Sort */}
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer shadow-sm active:scale-95 ${
              activeFilterCount > 0
                ? "border-[var(--color-bronze)] bg-[var(--color-bronze)]/10 text-[var(--color-bronze)] font-semibold"
                : "border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-ink)] hover:border-[var(--color-ink)]"
            }`}
            aria-label={`Open catalogue filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ""}`}
          >
            <svg className="w-3.5 h-3.5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
              />
            </svg>
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[var(--color-bronze)] text-[10px] text-white font-bold leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort Selector */}
          <select
            id="catalogue-sort-mobile"
            value={currentSort}
            onChange={(e) => handleUpdate(currentMode, e.target.value)}
            className="rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-3 py-1.5 text-xs text-[var(--color-ink)] font-medium focus:outline-none focus:border-[var(--color-ink)] cursor-pointer shadow-sm"
          >
            <option value="featured">Sort: Curated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A–Z</option>
            <option value="name_desc">Name: Z–A</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          MOBILE FILTER BOTTOM SHEET (Slide-up App Modal)
         ========================================================================= */}
      {isFilterDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter Editions"
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsFilterDrawerOpen(false)}
        >
          <div
            className="w-full max-h-[85vh] rounded-t-3xl border-t border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-6 shadow-2xl flex flex-col overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Touch Handle */}
            <div className="w-10 h-1 bg-[var(--color-stone)] rounded-full mx-auto mb-4 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-decorative-border)]/60 shrink-0">
              <div>
                <h3 className="text-base font-serif text-[var(--color-ink)] font-medium">
                  Refine Collection
                </h3>
                <p className="text-[11px] text-[var(--color-muted-light)]">
                  Filter by fulfilment discipline and design editions
                </p>
              </div>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="text-xs text-[var(--color-bronze)] hover:underline font-semibold cursor-pointer"
                  >
                    Clear All ({activeFilterCount})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-1 rounded-full text-[var(--color-muted-light)] hover:text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors"
                  aria-label="Close filters"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable Filter Options */}
            <div className="flex-1 overflow-y-auto py-5 space-y-6">
              {/* Section 1: Fulfilment Discipline */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-muted-light)] block">
                  Fulfilment Discipline
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdate("all", currentSort)}
                    className={`rounded-full px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${
                      currentMode.toLowerCase() === "all"
                        ? "bg-[var(--color-ink)] text-[var(--color-canvas)] font-semibold shadow-sm"
                        : "border border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-ink)]"
                    }`}
                  >
                    All Works
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate("READY_STOCK", currentSort)}
                    className={`rounded-full px-4 py-2 text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                      currentMode.toUpperCase() === "READY_STOCK"
                        ? "bg-[var(--color-ink)] text-[var(--color-canvas)] font-semibold shadow-sm"
                        : "border border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-ink)]"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Ready Stock (Immediate)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate("MADE_TO_ORDER", currentSort)}
                    className={`rounded-full px-4 py-2 text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                      currentMode.toUpperCase() === "MADE_TO_ORDER"
                        ? "bg-[var(--color-ink)] text-[var(--color-canvas)] font-semibold shadow-sm"
                        : "border border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-ink)]"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-[var(--color-bronze)]" />
                    Made to Order (Crafted)
                  </button>
                </div>
              </div>

              {/* Section 2: Categories (if on /shop) */}
              {categories && categories.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-[var(--color-decorative-border)]/40">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-muted-light)] block">
                    Studio Categories
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        router.push(`/shop${currentMode.toLowerCase() !== "all" ? `?mode=${currentMode.toLowerCase()}` : ""}`);
                        setIsFilterDrawerOpen(false);
                      }}
                      className={`rounded-full px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${
                        !activeCategorySlug
                          ? "bg-[var(--color-ink)] text-[var(--color-canvas)] font-semibold shadow-sm"
                          : "border border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-ink)]"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => {
                          router.push(`/category/${cat.slug}${currentMode.toLowerCase() !== "all" ? `?mode=${currentMode.toLowerCase()}` : ""}`);
                          setIsFilterDrawerOpen(false);
                        }}
                        className={`rounded-full px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${
                          activeCategorySlug === cat.slug
                            ? "bg-[var(--color-ink)] text-[var(--color-canvas)] font-semibold shadow-sm"
                            : "border border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-ink)]"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 3: Subcategories (if on /category/[slug]) */}
              {subcategories && subcategories.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-[var(--color-decorative-border)]/40">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-muted-light)] block">
                    Subcategories
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleSubcategoryUpdate(undefined);
                        setIsFilterDrawerOpen(false);
                      }}
                      className={`rounded-full px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${
                        !activeSubcategory
                          ? "bg-[var(--color-ink)] text-[var(--color-canvas)] font-semibold shadow-sm"
                          : "border border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-ink)]"
                      }`}
                    >
                      All Subcategories
                    </button>
                    {subcategories.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => {
                          handleSubcategoryUpdate(sub);
                          setIsFilterDrawerOpen(false);
                        }}
                        className={`rounded-full px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${
                          activeSubcategory === sub
                            ? "bg-[var(--color-ink)] text-[var(--color-canvas)] font-semibold shadow-sm"
                            : "border border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-ink)]"
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 4: Sort Order */}
              <div className="space-y-2.5 pt-2 border-t border-[var(--color-decorative-border)]/40">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-muted-light)] block">
                  Sort Order
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "featured", label: "Curated Studio Order" },
                    { id: "price_asc", label: "Price: Low to High" },
                    { id: "price_desc", label: "Price: High to Low" },
                    { id: "name_asc", label: "Name: A to Z" },
                    { id: "name_desc", label: "Name: Z to A" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleUpdate(currentMode, opt.id)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        currentSort === opt.id
                          ? "bg-[var(--color-ink)] text-[var(--color-canvas)] font-semibold shadow-sm"
                          : "border border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-ink)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Sticky Action Button */}
            <div className="pt-3 border-t border-[var(--color-decorative-border)] shrink-0">
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-full rounded-full bg-[var(--color-ink)] py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] hover:bg-[var(--color-bronze)] transition-colors shadow-sm"
              >
                Show {totalCount} {totalCount === 1 ? "Piece" : "Pieces"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

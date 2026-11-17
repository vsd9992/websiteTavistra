"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface CatalogueSortBarProps {
  currentMode: string;
  currentSort: string;
  totalCount: number;
  basePath: string;
  extraParams?: Record<string, string | undefined>;
}

export function CatalogueSortBar({
  currentMode = "all",
  currentSort = "featured",
  totalCount,
  basePath,
  extraParams = {},
}: CatalogueSortBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleUpdate = (mode: string, sort: string) => {
    const params = new URLSearchParams();

    // Preserve any extra parameters (such as 'sub' for subcategories)
    Object.entries(extraParams).forEach(([key, val]) => {
      if (val && val !== "all") params.set(key, val);
    });

    if (mode && mode !== "all") {
      params.set("mode", mode);
    }
    if (sort && sort !== "featured") {
      params.set("sort", sort);
    }

    const query = params.toString();
    router.push(`${basePath}${query ? `?${query}` : ""}`);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[var(--color-decorative-border)]/60 text-xs">
      {/* Mode Filters (Mobile: Touch rail; Desktop: Inline pills) */}
      <div className="flex sm:flex-wrap items-center gap-2 overflow-x-auto sm:overflow-visible no-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0 py-1 sm:py-0 scroll-smooth">
        <span className="hidden sm:inline font-semibold text-[var(--color-ink)] mr-1 shrink-0">
          Edition Mode:
        </span>
        <button
          type="button"
          onClick={() => handleUpdate("all", currentSort)}
          className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
            currentMode === "all"
              ? "bg-[var(--color-ink)] text-[var(--color-canvas)] font-semibold shadow-sm"
              : "border border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-ink)] hover:bg-[var(--color-ivory)]"
          }`}
        >
          All Works
        </button>
        <button
          type="button"
          onClick={() => handleUpdate("READY_STOCK", currentSort)}
          className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-medium transition-colors inline-flex items-center gap-1.5 ${
            currentMode === "READY_STOCK"
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
          className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-medium transition-colors inline-flex items-center gap-1.5 ${
            currentMode === "MADE_TO_ORDER"
              ? "bg-[var(--color-ink)] text-[var(--color-canvas)] font-semibold shadow-sm"
              : "border border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-ink)] hover:bg-[var(--color-ivory)]"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-bronze)]" />
          Made to Order
        </button>
      </div>

      {/* Counter & Sort Selector */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0">
        <span className="text-[11px] font-mono text-[var(--color-muted-light)]">
          {totalCount} {totalCount === 1 ? "piece" : "pieces"}
        </span>

        <div className="flex items-center gap-2">
          <label htmlFor="catalogue-sort" className="text-[11px] font-semibold text-[var(--color-ink)] whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="catalogue-sort"
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
  );
}

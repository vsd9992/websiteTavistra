"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MockProduct } from "@/lib/products";
import { APPROVED_CATEGORIES } from "@/lib/taxonomy";
import { ProductCard } from "@/components/ProductCard";

interface SearchResultsViewProps {
  initialQuery: string;
  initialCategory?: string;
  initialMode?: string;
  initialSort?: string;
  allProducts: MockProduct[];
}

export function SearchResultsView({
  initialQuery,
  initialCategory = "all",
  initialMode = "all",
  initialSort = "relevance",
  allProducts,
}: SearchResultsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedMode, setSelectedMode] = useState(initialMode);
  const [selectedSort, setSelectedSort] = useState(initialSort);

  // Synchronize URL query params
  const updateUrl = (newQ: string, newCat: string, newMode: string, newSort: string) => {
    const params = new URLSearchParams();
    if (newQ.trim()) params.set("q", newQ.trim());
    if (newCat && newCat !== "all") params.set("category", newCat);
    if (newMode && newMode !== "all") params.set("mode", newMode);
    if (newSort && newSort !== "relevance") params.set("sort", newSort);

    router.push(`/search?${params.toString()}`);
  };

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(query, selectedCategory, selectedMode, selectedSort);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    updateUrl(query, cat, selectedMode, selectedSort);
  };

  const handleModeChange = (mode: string) => {
    setSelectedMode(mode);
    updateUrl(query, selectedCategory, mode, selectedSort);
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    updateUrl(query, selectedCategory, selectedMode, sort);
  };

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedMode("all");
    setSelectedSort("relevance");
    updateUrl(query, "all", "all", "relevance");
  };

  // Filter and Rank products according to WEB-040, WEB-040A, WEB-040B, WEB-040C
  const { filteredProducts, pricedProducts, unpricedProducts, isPriceSorted } = useMemo(() => {
    const qLower = query.trim().toLowerCase();

    // 1. Text Query Matching
    let matched = allProducts.filter((p) => {
      if (!qLower) return true;

      // Exact title or SKU match
      if (p.name.toLowerCase().includes(qLower) || (p.sku && p.sku.toLowerCase().includes(qLower))) {
        return true;
      }
      // Taxonomy match (category, subcategory, productType)
      if (
        p.categoryName.toLowerCase().includes(qLower) ||
        p.subcategory.toLowerCase().includes(qLower) ||
        (p.productType && p.productType.toLowerCase().includes(qLower))
      ) {
        return true;
      }
      // Materials match
      if (p.materials && p.materials.some((m) => m.toLowerCase().includes(qLower))) {
        return true;
      }
      // Description match
      if (
        (p.shortDescription && p.shortDescription.toLowerCase().includes(qLower)) ||
        (p.fullDescription && p.fullDescription.toLowerCase().includes(qLower))
      ) {
        return true;
      }
      return false;
    });

    // 2. Minimal Launch Filters (WEB-040A: Category + Purchase Mode)
    if (selectedCategory !== "all") {
      matched = matched.filter((p) => p.categorySlug === selectedCategory);
    }
    if (selectedMode !== "all") {
      matched = matched.filter((p) => p.mode === selectedMode);
    }

    // 3. Sorting (WEB-040B & WEB-040C)
    const isPrice = selectedSort === "price-asc" || selectedSort === "price-desc";

    if (selectedSort === "relevance") {
      // Relevance heuristic: exact title match > category/type match > description match
      matched.sort((a, b) => {
        if (!qLower) return 0;
        const aTitleMatch = a.name.toLowerCase().includes(qLower);
        const bTitleMatch = b.name.toLowerCase().includes(qLower);
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        return 0;
      });
    } else if (selectedSort === "newest") {
      // Newest
      matched.sort((a, b) => (b.id > a.id ? 1 : -1));
    }

    // WEB-040C: Price sorting requires priced items first, unpriced/quote-only afterward
    if (isPrice) {
      const priced = matched.filter((p) => p.mode !== "QUOTE_ONLY" && p.pricePaise > 0);
      const unpriced = matched.filter((p) => p.mode === "QUOTE_ONLY" || p.pricePaise === 0);

      if (selectedSort === "price-asc") {
        priced.sort((a, b) => {
          const priceA = a.minPricePaise || a.pricePaise;
          const priceB = b.minPricePaise || b.pricePaise;
          return priceA - priceB;
        });
      } else {
        priced.sort((a, b) => {
          const priceA = a.maxPricePaise || a.pricePaise;
          const priceB = b.maxPricePaise || b.pricePaise;
          return priceB - priceA;
        });
      }

      return {
        filteredProducts: [...priced, ...unpriced],
        pricedProducts: priced,
        unpricedProducts: unpriced,
        isPriceSorted: true,
      };
    }

    return {
      filteredProducts: matched,
      pricedProducts: matched,
      unpricedProducts: [],
      isPriceSorted: false,
    };
  }, [allProducts, query, selectedCategory, selectedMode, selectedSort]);

  const hasActiveFilters = selectedCategory !== "all" || selectedMode !== "all" || selectedSort !== "relevance";

  const modeLabels: Record<string, string> = {
    READY_STOCK: "Ready Stock",
    MADE_TO_ORDER: "Made to Order",
    QUOTE_ONLY: "Quote Only",
  };

  return (
    <div className="space-y-8">
      {/* 1. Header & Live Search Input */}
      <div className="border-b border-[var(--color-decorative-border)] pb-8">
        <p className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2">
          Catalogue Search
        </p>
        <h1 className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)] mb-4">
          {query.trim() ? (
            <>
              Results for &ldquo;{query.trim()}&rdquo;
            </>
          ) : (
            "Explore All Editions"
          )}
        </h1>
        <p className="text-xs text-[var(--color-muted-light)] mb-6">
          Showing {filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"} matching your criteria.
        </p>

        {/* Refined Search Form */}
        <form onSubmit={handleQuerySubmit} className="max-w-xl">
          <div className="relative flex items-center rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] shadow-sm focus-within:border-[var(--color-ink)] focus-within:ring-1 focus-within:ring-[var(--color-ink)]">
            <svg
              className="h-4 w-4 ml-4 text-[var(--color-muted-light)] flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search objects, materials, styles..."
              className="w-full bg-transparent px-3 py-3 text-sm text-[var(--color-ink)] placeholder-[var(--color-muted-light)] focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  updateUrl("", selectedCategory, selectedMode, selectedSort);
                }}
                className="mr-2 text-xs text-[var(--color-muted-light)] hover:text-[var(--color-ink)] px-2 py-1"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="mr-2 rounded-lg bg-[var(--color-ink)] px-4 py-2 text-xs font-semibold text-[var(--color-canvas)] transition-opacity hover:opacity-90"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* 2. Minimal Launch Filters (WEB-040A) & Sorting (WEB-040B) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-decorative-border)]/70">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <label htmlFor="filter-category" className="font-semibold text-[var(--color-muted-light)]">
              Category:
            </label>
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="rounded-lg border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
            >
              <option value="all">All Categories</option>
              {APPROVED_CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Purchase Mode Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <label htmlFor="filter-mode" className="font-semibold text-[var(--color-muted-light)]">
              Purchase Mode:
            </label>
            <select
              id="filter-mode"
              value={selectedMode}
              onChange={(e) => handleModeChange(e.target.value)}
              className="rounded-lg border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
            >
              <option value="all">All Modes</option>
              <option value="READY_STOCK">Ready Stock</option>
              <option value="MADE_TO_ORDER">Made to Order</option>
              <option value="QUOTE_ONLY">Quote Only</option>
            </select>
          </div>
        </div>

        {/* Sorting Policy (WEB-040B) */}
        <div className="flex items-center gap-1.5 text-xs self-start md:self-auto">
          <label htmlFor="filter-sort" className="font-semibold text-[var(--color-muted-light)]">
            Sort By:
          </label>
          <select
            id="filter-sort"
            value={selectedSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="rounded-lg border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
          >
            <option value="relevance">Relevance (Default)</option>
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* 3. Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
          <span className="text-[11px] font-semibold text-[var(--color-muted-light)] mr-1">
            Active filters:
          </span>

          {selectedCategory !== "all" && (
            <button
              type="button"
              onClick={() => handleCategoryChange("all")}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-control-border)] bg-[var(--color-ivory)] px-3 py-1 text-xs text-[var(--color-ink)] transition-colors hover:bg-[var(--color-stone)]"
            >
              <span>Category: {APPROVED_CATEGORIES.find((c) => c.slug === selectedCategory)?.name || selectedCategory}</span>
              <span className="text-[10px]">✕</span>
            </button>
          )}

          {selectedMode !== "all" && (
            <button
              type="button"
              onClick={() => handleModeChange("all")}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-control-border)] bg-[var(--color-ivory)] px-3 py-1 text-xs text-[var(--color-ink)] transition-colors hover:bg-[var(--color-stone)]"
            >
              <span>Mode: {modeLabels[selectedMode] || selectedMode}</span>
              <span className="text-[10px]">✕</span>
            </button>
          )}

          {selectedSort !== "relevance" && (
            <button
              type="button"
              onClick={() => handleSortChange("relevance")}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-control-border)] bg-[var(--color-ivory)] px-3 py-1 text-xs text-[var(--color-ink)] transition-colors hover:bg-[var(--color-stone)]"
            >
              <span>
                Sort: {selectedSort === "newest" ? "Newest" : selectedSort === "price-asc" ? "Price Low-High" : "Price High-Low"}
              </span>
              <span className="text-[10px]">✕</span>
            </button>
          )}

          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-semibold text-[var(--color-bronze)] hover:underline ml-2"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* 4. Product Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/40 p-12 text-center my-8">
          <p className="font-editorial text-2xl text-[var(--color-ink)] mb-2">
            No matching pieces found
          </p>
          <p className="text-xs text-[var(--color-muted-light)] max-w-md mx-auto mb-6">
            We couldn&rsquo;t find any objects matching your search criteria. Try adjusting your search term, clearing active filters, or exploring our curated categories.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="rounded-lg bg-[var(--color-ink)] px-4 py-2 text-xs font-semibold text-[var(--color-canvas)] transition-opacity hover:opacity-90"
              >
                Reset Filters
              </button>
            )}
            <Link
              href="/shop"
              className="rounded-lg border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-ivory)]"
            >
              Browse Complete Catalogue
            </Link>
          </div>
        </div>
      ) : isPriceSorted && unpricedProducts.length > 0 ? (
        // WEB-040C: Price sorted display separates priced items from unpriced / quote-only items
        <div className="space-y-12">
          {pricedProducts.length > 0 && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {pricedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

          {/* WEB-040C Unpriced / Price on Request Group */}
          <div className="border-t border-[var(--color-decorative-border)] pt-8">
            <div className="mb-6">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-bronze)] block mb-1">
                Bespoke &amp; Architectural Inquiries
              </span>
              <h3 className="font-editorial text-xl text-[var(--color-ink)]">
                Price on Request ({unpricedProducts.length})
              </h3>
              <p className="text-xs text-[var(--color-muted-light)] mt-1">
                Custom commissions, limited gallery editions, or pieces requiring formal workshop evaluation.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {unpricedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Standard Grid (Relevance / Newest)
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

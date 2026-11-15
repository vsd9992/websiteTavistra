"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MockProduct } from "@/lib/products";
import { APPROVED_CATEGORIES } from "@/lib/taxonomy";
import { ProductCard } from "@/components/ProductCard";

interface SearchResultsViewProps {
  initialQuery: string;
  initialCategory?: string;
  initialSubcategory?: string;
  initialMode?: string;
  initialSort?: string;
  allProducts: MockProduct[];
}

export function SearchResultsView({
  initialQuery,
  initialCategory = "all",
  initialSubcategory = "all",
  initialMode = "all",
  initialSort = "relevance",
  allProducts,
}: SearchResultsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read single source of truth directly from searchParams (fallback to initial props)
  const query = searchParams.get("q") ?? initialQuery;
  const selectedCategory = searchParams.get("category") ?? initialCategory;
  const selectedSubcategory = searchParams.get("sub") ?? initialSubcategory;
  const selectedMode = searchParams.get("mode") ?? initialMode;
  const selectedSort = searchParams.get("sort") ?? initialSort;

  // Dynamically extract available subcategories from products (sorted alphabetically A-Z)
  const availableSubcategories = useMemo(() => {
    const source =
      selectedCategory === "all"
        ? allProducts
        : allProducts.filter((p) => p.categorySlug === selectedCategory);

    const subs = new Set<string>();
    for (const p of source) {
      if (p.subcategory && p.subcategory.trim()) {
        subs.add(p.subcategory.trim());
      }
    }
    return Array.from(subs).sort((a, b) => a.localeCompare(b));
  }, [allProducts, selectedCategory]);

  // Synchronize URL query params
  const updateUrl = (
    newQ: string,
    newCat: string,
    newSub: string,
    newMode: string,
    newSort: string
  ) => {
    const params = new URLSearchParams();
    if (newQ.trim()) params.set("q", newQ.trim());
    if (newCat && newCat !== "all") params.set("category", newCat);
    if (newSub && newSub !== "all") params.set("sub", newSub);
    if (newMode && newMode !== "all") params.set("mode", newMode);
    if (newSort && newSort !== "relevance") params.set("sort", newSort);

    router.push(`/search?${params.toString()}`);
  };

  const handleCategoryChange = (cat: string) => {
    // Reset subcategory when switching category
    updateUrl(query, cat, "all", selectedMode, selectedSort);
  };

  const handleSubcategoryChange = (sub: string) => {
    updateUrl(query, selectedCategory, sub, selectedMode, selectedSort);
  };

  const handleModeChange = (mode: string) => {
    updateUrl(query, selectedCategory, selectedSubcategory, mode, selectedSort);
  };

  const handleSortChange = (sort: string) => {
    updateUrl(query, selectedCategory, selectedSubcategory, selectedMode, sort);
  };

  const clearAllFilters = () => {
    updateUrl(query, "all", "all", "all", "relevance");
  };

  // Filter and Rank products according to WEB-040, WEB-040A, WEB-040B, WEB-040C
  const { filteredProducts, pricedProducts, unpricedProducts, isPriceSorted } = useMemo(() => {
    const qLower = query.trim().toLowerCase();

    // 1. Text Query Matching across searchable fields
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

    // 2. Minimal Launch Filters (WEB-040A: Category + Subcategory + Purchase Mode)
    if (selectedCategory !== "all") {
      matched = matched.filter((p) => p.categorySlug === selectedCategory);
    }
    if (selectedSubcategory !== "all") {
      matched = matched.filter((p) => p.subcategory === selectedSubcategory);
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
  }, [allProducts, query, selectedCategory, selectedSubcategory, selectedMode, selectedSort]);

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedSubcategory !== "all" ||
    selectedMode !== "all" ||
    selectedSort !== "relevance";

  const modeLabels: Record<string, string> = {
    READY_STOCK: "Ready Stock",
    MADE_TO_ORDER: "Made to Order",
    QUOTE_ONLY: "Quote Only",
  };

  return (
    <div className="space-y-8">
      {/* 1. Header (Clean & Minimalist without redundant search input) */}
      <div className="border-b border-[var(--color-decorative-border)] pb-6">
        <p className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2">
          Catalogue Search
        </p>
        <h1 className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)] mb-3">
          {query.trim() ? (
            <>
              Results for &ldquo;{query.trim()}&rdquo;
            </>
          ) : (
            "Explore All Editions"
          )}
        </h1>
        <p className="text-xs text-[var(--color-muted-light)]">
          Showing {filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"} matching your criteria.
        </p>
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

          {/* Subcategory Filter (Dynamic from available products, sorted A-Z) */}
          {availableSubcategories.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <label htmlFor="filter-subcategory" className="font-semibold text-[var(--color-muted-light)]">
                Subcategory:
              </label>
              <select
                id="filter-subcategory"
                value={selectedSubcategory}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                className="rounded-lg border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
              >
                <option value="all">All Subcategories</option>
                {availableSubcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}

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

          {selectedSubcategory !== "all" && (
            <button
              type="button"
              onClick={() => handleSubcategoryChange("all")}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-control-border)] bg-[var(--color-ivory)] px-3 py-1 text-xs text-[var(--color-ink)] transition-colors hover:bg-[var(--color-stone)]"
            >
              <span>Subcategory: {selectedSubcategory}</span>
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
            We couldn&rsquo;t find any objects matching your search criteria. Try adjusting your search term via the search icon above, clearing active filters, or exploring our curated categories.
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

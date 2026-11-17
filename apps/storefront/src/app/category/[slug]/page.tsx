import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CatalogueSortBar } from "@/components/CatalogueSortBar";
import { getPublishedProducts } from "@/lib/catalogueService";
import { APPROVED_CATEGORIES } from "@/lib/taxonomy";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    sub?: string;
    mode?: string;
    sort?: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = APPROVED_CATEGORIES.find((cat) => cat.slug === slug);
  if (!category) return { title: "Category — Tavistra" };
  return {
    title: `${category.name} — Tavistra`,
    description: `Explore design-led ${category.name.toLowerCase()} editions master-crafted in India by Tavistra.`,
  };
}

async function CategoryContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string; mode?: string; sort?: string }>;
}) {
  await connection();
  const { slug } = await params;
  const resolvedParams = await searchParams;
  const activeSubcategory = resolvedParams.sub;
  const currentMode = (resolvedParams.mode || "all").toUpperCase();
  const currentSort = resolvedParams.sort || "featured";

  const category = APPROVED_CATEGORIES.find((cat) => cat.slug === slug);

  if (!category) {
    notFound();
  }

  const published = await getPublishedProducts();
  const allCategoryProducts = published.filter((p) => p.categorySlug === category.slug);

  // Dynamically extract available subcategories from published products in this category (sorted A-Z)
  const availableSubcategories = Array.from(
    new Set(
      allCategoryProducts
        .map((p) => p.subcategory?.trim())
        .filter((sub): sub is string => Boolean(sub))
    )
  ).sort((a, b) => a.localeCompare(b));

  // 1. Filter by Subcategory
  let categoryProducts = allCategoryProducts.filter((p) => {
    if (activeSubcategory && p.subcategory !== activeSubcategory) return false;
    return true;
  });

  // 2. Filter by Fulfilment Mode
  if (currentMode === "READY_STOCK") {
    categoryProducts = categoryProducts.filter((p) => p.mode === "READY_STOCK");
  } else if (currentMode === "MADE_TO_ORDER") {
    categoryProducts = categoryProducts.filter((p) => p.mode === "MADE_TO_ORDER");
  }

  // 3. Sort
  if (currentSort === "price_asc") {
    categoryProducts.sort((a, b) => a.pricePaise - b.pricePaise);
  } else if (currentSort === "price_desc") {
    categoryProducts.sort((a, b) => b.pricePaise - a.pricePaise);
  } else if (currentSort === "name_asc") {
    categoryProducts.sort((a, b) => a.name.localeCompare(b.name));
  } else if (currentSort === "name_desc") {
    categoryProducts.sort((a, b) => b.name.localeCompare(a.name));
  }

  // Breadcrumb Schema (AEO/SEO)
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://tavistra.com",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shop",
        "item": "https://tavistra.com/shop",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": category.name,
        "item": `https://tavistra.com/category/${category.slug}`,
      },
      ...(activeSubcategory
        ? [
            {
              "@type": "ListItem",
              "position": 4,
              "name": activeSubcategory,
              "item": `https://tavistra.com/category/${category.slug}?sub=${encodeURIComponent(activeSubcategory)}`,
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumbs (Desktop only; hidden on mobile for clean app-like viewport) */}
      <nav className="hidden lg:flex items-center gap-2 text-xs text-[var(--color-muted-light)] mb-8 whitespace-nowrap overflow-hidden">
        <Link href="/" className="hover:text-[var(--color-ink)] shrink-0">
          Home
        </Link>
        <span className="shrink-0">/</span>
        <Link href="/shop" className="hover:text-[var(--color-ink)] shrink-0">
          Shop
        </Link>
        <span className="shrink-0">/</span>
        <span className="text-[var(--color-ink)] font-semibold shrink-0">
          {category.name}
        </span>
        {activeSubcategory && (
          <>
            <span className="shrink-0">/</span>
            <span className="text-[var(--color-bronze)] font-semibold shrink-0">
              {activeSubcategory}
            </span>
          </>
        )}
      </nav>

      {/* Category Banner */}
      <div className="border-b border-[var(--color-decorative-border)] pb-8 mb-6">
        <p className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2">
          Canonical Category
        </p>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--color-ink)] mb-4">
          {category.name}
        </h1>

        {/* Interactive Subcategory Filter Pills (Desktop only; on mobile accessed via Filter button in sort bar) */}
        {availableSubcategories.length > 0 && (
          <div className="hidden lg:flex lg:flex-wrap items-center gap-2 pt-2 pb-1">
            <span className="text-xs font-semibold text-[var(--color-ink)] mr-1 shrink-0">
              Subcategory:
            </span>
            <Link
              href={`/category/${category.slug}${currentMode !== "ALL" ? `?mode=${currentMode.toLowerCase()}` : ""}`}
              className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                !activeSubcategory
                  ? "bg-[var(--color-ink)] text-[var(--color-canvas)] font-semibold shadow-sm"
                  : "border border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-ink)] hover:bg-[var(--color-ivory)]"
              }`}
            >
              All Subcategories
            </Link>
            {availableSubcategories.map((sub) => {
              const isSelected = activeSubcategory === sub;
              const subHref = `/category/${category.slug}?sub=${encodeURIComponent(sub)}${
                currentMode !== "ALL" ? `&mode=${currentMode.toLowerCase()}` : ""
              }${currentSort !== "featured" ? `&sort=${currentSort}` : ""}`;

              return (
                <Link
                  key={sub}
                  href={subHref}
                  className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    isSelected
                      ? "bg-[var(--color-ink)] text-[var(--color-canvas)] font-semibold shadow-sm"
                      : "border border-[var(--color-control-border)] bg-[var(--color-canvas)] text-[var(--color-ink)] hover:bg-[var(--color-ivory)]"
                  }`}
                >
                  {sub}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Sort & Mode Control Toolbar */}
      <CatalogueSortBar
        currentMode={currentMode}
        currentSort={currentSort}
        totalCount={categoryProducts.length}
        basePath={`/category/${category.slug}`}
        extraParams={{ sub: activeSubcategory }}
        categories={APPROVED_CATEGORIES}
        activeCategorySlug={category.slug}
        subcategories={availableSubcategories}
        activeSubcategory={activeSubcategory}
      />

      {/* Product Listing Grid */}
      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-12 text-center space-y-4">
          <h3 className="font-editorial text-2xl text-[var(--color-ink)]">
            No pieces match this selection
          </h3>
          <p className="text-xs text-[var(--color-muted-light)] max-w-md mx-auto">
            No active pieces are currently listed under this subcategory or fulfilment mode.
          </p>
          <Link
            href={`/category/${category.slug}`}
            className="inline-block rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)]"
          >
            Clear Subcategory Filter
          </Link>
        </div>
      )}
    </>
  );
}

export default function CategoryPage({ params, searchParams }: CategoryPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-8 sm:py-16 px-4 sm:px-6 bg-[var(--color-canvas)]">
        <div className="mx-auto max-w-7xl">
          <Suspense
            fallback={
              <div className="py-20 text-center text-xs text-[var(--color-muted-light)]">
                Loading category pieces...
              </div>
            }
          >
            <CategoryContent params={params} searchParams={searchParams} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CatalogueSortBar } from "@/components/CatalogueSortBar";
import { getPublishedProducts } from "@/lib/catalogueService";
import { APPROVED_CATEGORIES } from "@/lib/taxonomy";

export const metadata = {
  title: "Complete Catalogue — Tavistra",
  description:
    "Explore our complete range of design-led lifestyle objects, architectural décor, lighting, and workspace editions.",
};

interface ShopPageProps {
  searchParams: Promise<{
    mode?: string;
    sort?: string;
  }>;
}

async function ShopContent({ searchParams }: ShopPageProps) {
  await connection();
  const params = await searchParams;
  const currentMode = (params.mode || "all").toUpperCase();
  const currentSort = params.sort || "featured";

  const allPublished = await getPublishedProducts();

  // 1. Filter by Fulfilment Mode
  let filtered = allPublished.filter((p) => {
    if (currentMode === "READY_STOCK" && p.mode !== "READY_STOCK") return false;
    if (currentMode === "MADE_TO_ORDER" && p.mode !== "MADE_TO_ORDER") return false;
    return true;
  });

  // 2. Sort by Specified Criterion
  if (currentSort === "price_asc") {
    filtered.sort((a, b) => a.pricePaise - b.pricePaise);
  } else if (currentSort === "price_desc") {
    filtered.sort((a, b) => b.pricePaise - a.pricePaise);
  } else if (currentSort === "name_asc") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (currentSort === "name_desc") {
    filtered.sort((a, b) => b.name.localeCompare(a.name));
  }

  return (
    <>
      {/* Header */}
      <div className="border-b border-[var(--color-decorative-border)] pb-8 mb-8">
        <p className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2">
          Studio &amp; Workshop Editions
        </p>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--color-ink)] mb-4">
          The Complete Collection
        </h1>
        <p className="max-w-2xl text-sm text-[var(--color-muted-light)] leading-relaxed">
          Explore our architectural décor, lighting, workspace, and personal carry objects. 
          Every piece is presented with honest tax-inclusive pricing and governed under its authoritative fulfilment mode.
        </p>
      </div>

      {/* Category Filter Navigation (Desktop only; on mobile accessed via Filter button in sort bar) */}
      <div className="hidden sm:flex sm:flex-wrap items-center gap-2 mb-6 pb-4 border-b border-[var(--color-decorative-border)]/60">
        <span className="text-xs font-semibold text-[var(--color-ink)] mr-2 shrink-0">
          Category:
        </span>
        <Link
          href="/shop"
          className="shrink-0 rounded-full bg-[var(--color-ink)] px-4 py-1.5 text-xs font-semibold text-[var(--color-canvas)] whitespace-nowrap shadow-sm"
        >
          All Categories ({allPublished.length})
        </Link>
        {APPROVED_CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="shrink-0 rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-1.5 text-xs font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] hover:bg-[var(--color-ivory)] whitespace-nowrap"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Sort & Mode Control Toolbar */}
      <CatalogueSortBar
        currentMode={currentMode}
        currentSort={currentSort}
        totalCount={filtered.length}
        basePath="/shop"
        categories={APPROVED_CATEGORIES}
      />

      {/* Product Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-12 text-center space-y-4">
          <h3 className="font-editorial text-2xl text-[var(--color-ink)]">
            No pieces match this selection
          </h3>
          <p className="text-xs text-[var(--color-muted-light)] max-w-md mx-auto">
            No editions are currently listed under the chosen mode filter.
          </p>
          <Link
            href="/shop"
            className="inline-block rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)]"
          >
            Reset Filters
          </Link>
        </div>
      )}
    </>
  );
}

export default function ShopPage({ searchParams }: ShopPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-8 sm:py-16 px-4 sm:px-6 bg-[var(--color-canvas)]">
        <div className="mx-auto max-w-7xl">
          <Suspense
            fallback={
              <div className="py-20 text-center text-xs text-[var(--color-muted-light)]">
                Loading studio collection...
              </div>
            }
          >
            <ShopContent searchParams={searchParams} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

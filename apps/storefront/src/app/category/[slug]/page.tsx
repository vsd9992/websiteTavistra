import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { MOCK_PRODUCTS } from "@/lib/products";
import { APPROVED_CATEGORIES } from "@/lib/taxonomy";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    sub?: string;
  }>;
}

export async function generateStaticParams() {
  return APPROVED_CATEGORIES.map((cat) => ({
    slug: cat.slug,
  }));
}

async function CategoryContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string }>;
}) {
  const { slug } = await params;
  const { sub: activeSubcategory } = await searchParams;
  const category = APPROVED_CATEGORIES.find((cat) => cat.slug === slug);

  if (!category) {
    notFound();
  }

  const categoryProducts = MOCK_PRODUCTS.filter((p) => {
    if (p.categorySlug !== category.slug) return false;
    if (activeSubcategory && p.subcategory !== activeSubcategory) return false;
    return true;
  });

  return (
    <>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[var(--color-muted-light)] mb-8">
        <Link href="/" className="hover:text-[var(--color-ink)]">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[var(--color-ink)]">
          Shop
        </Link>
        <span>/</span>
        <span className="text-[var(--color-ink)] font-semibold">
          {category.name}
        </span>
        {activeSubcategory && (
          <>
            <span>/</span>
            <span className="text-[var(--color-bronze)] font-semibold">
              {activeSubcategory}
            </span>
          </>
        )}
      </nav>

      {/* Category Banner */}
      <div className="border-b border-[var(--color-decorative-border)] pb-8 mb-8">
        <p className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2">
          Canonical Category
        </p>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--color-ink)] mb-4">
          {category.name}
        </h1>

        {/* Interactive Subcategory Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-semibold text-[var(--color-ink)] mr-1">
            Filter Subcategory:
          </span>
          <Link
            href={`/category/${category.slug}`}
            className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
              !activeSubcategory
                ? "bg-[var(--color-ink)] text-[var(--color-canvas)] font-semibold"
                : "border border-[var(--color-control-border)] bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-ivory)]"
            }`}
          >
            All Subcategories
          </Link>
          {category.subcategories.map((sub) => {
            const isSelected = activeSubcategory === sub;
            return (
              <Link
                key={sub}
                href={`/category/${category.slug}?sub=${encodeURIComponent(sub)}`}
                className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-[var(--color-ink)] text-[var(--color-canvas)] font-semibold"
                    : "border border-[var(--color-control-border)] bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-ivory)]"
                }`}
              >
                {sub}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Product Listing Grid */}
      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-12 text-center">
          <h3 className="font-editorial text-2xl text-[var(--color-ink)] mb-2">
            New Editions in Fabrication
          </h3>
          <p className="text-sm text-[var(--color-muted-light)] max-w-md mx-auto mb-6">
            No active pieces currently listed under{" "}
            <strong className="text-[var(--color-ink)]">
              {activeSubcategory || category.name}
            </strong>
            . Our workshop is preparing upcoming editions.
          </p>
          <Link
            href={`/category/${category.slug}`}
            className="inline-block rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)]"
          >
            Clear Subcategory Filter
          </Link>
        </div>
      )}
    </>
  );
}

export default function CategoryPage(props: CategoryPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-16 px-6 bg-[var(--color-canvas)]">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={<div className="py-20 text-center text-xs text-[var(--color-muted-light)]">Loading category...</div>}>
            <CategoryContent params={props.params} searchParams={props.searchParams} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import Link from "next/link";
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
}

export async function generateStaticParams() {
  return APPROVED_CATEGORIES.map((cat) => ({
    slug: cat.slug,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = APPROVED_CATEGORIES.find((cat) => cat.slug === slug);

  if (!category) {
    notFound();
  }

  const categoryProducts = MOCK_PRODUCTS.filter(
    (p) => p.categorySlug === category.slug
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-16 px-6 bg-[var(--color-canvas)]">
        <div className="mx-auto max-w-7xl">
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
          </nav>

          {/* Category Banner */}
          <div className="border-b border-[var(--color-decorative-border)] pb-8 mb-12">
            <p className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2">
              Canonical Category
            </p>
            <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--color-ink)] mb-4">
              {category.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted-light)]">
              <span className="font-semibold text-[var(--color-ink)]">Subcategories:</span>
              {category.subcategories.map((sub, i) => (
                <span key={sub} className="inline-block bg-[var(--color-ivory)] px-2.5 py-1 rounded-md border border-[var(--color-decorative-border)]/50">
                  {sub}
                </span>
              ))}
            </div>
          </div>

          {/* Listing */}
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
                Our studio is currently crafting the upcoming batch for {category.name}. Check back shortly or explore our active catalogue.
              </p>
              <Link
                href="/shop"
                className="inline-block rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)]"
              >
                Return to Shop
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

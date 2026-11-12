import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getPublishedProducts } from "@/lib/catalogueService";
import { APPROVED_CATEGORIES } from "@/lib/taxonomy";

export const metadata = {
  title: "Complete Catalogue — Tavistra",
  description:
    "Explore our complete range of design-led lifestyle objects, architectural décor, lighting, and workspace editions.",
};

async function ShopContent() {
  await connection();
  const publishedProducts = await getPublishedProducts();

  return (
    <>
      {/* Header */}
      <div className="border-b border-[var(--color-decorative-border)] pb-8 mb-12">
        <p className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2">
          Studio & Workshop Editions
        </p>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--color-ink)] mb-4">
          The Complete Collection
        </h1>
        <p className="max-w-2xl text-sm text-[var(--color-muted-light)] leading-relaxed">
          Explore our architectural décor, lighting, workspace, and personal carry objects. 
          Every piece is presented with honest tax-inclusive pricing and governed under its authoritative fulfilment mode.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-[var(--color-decorative-border)]/60">
        <span className="text-xs font-semibold text-[var(--color-ink)] mr-2">Filter Category:</span>
        <Link
          href="/shop"
          className="rounded-full bg-[var(--color-ink)] px-4 py-1.5 text-xs font-semibold text-[var(--color-canvas)]"
        >
          All Pieces ({publishedProducts.length})
        </Link>
        {APPROVED_CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="rounded-full border border-[var(--color-control-border)] bg-transparent px-4 py-1.5 text-xs font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] hover:bg-[var(--color-ivory)]"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {publishedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}

export default function ShopPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-16 px-6 bg-[var(--color-canvas)]">
        <div className="mx-auto max-w-7xl">
          <Suspense
            fallback={
              <div className="py-20 text-center text-xs text-[var(--color-muted-light)]">
                Loading studio collection...
              </div>
            }
          >
            <ShopContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

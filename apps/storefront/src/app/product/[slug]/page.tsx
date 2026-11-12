import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MOCK_PRODUCTS } from "@/lib/products";
import { getPublishedProductBySlug } from "@/lib/catalogueService";
import { ProductInteractiveClient } from "@/components/ProductInteractiveClient";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function ProductDetailContent({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[var(--color-muted-light)] mb-10">
        <Link href="/" className="hover:text-[var(--color-ink)]">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[var(--color-ink)]">
          Shop
        </Link>
        <span>/</span>
        <Link
          href={`/category/${product.categorySlug}`}
          className="hover:text-[var(--color-ink)]"
        >
          {product.categoryName}
        </Link>
        <span>/</span>
        <span className="text-[var(--color-ink)] font-semibold truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Interactive Product & Variant Pane */}
      <ProductInteractiveClient product={product} />
    </>
  );
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-16 px-6 bg-[var(--color-canvas)]">
        <div className="mx-auto max-w-7xl">
          <Suspense
            fallback={
              <div className="py-20 text-center text-xs text-[var(--color-muted-light)]">
                Loading product specifications...
              </div>
            }
          >
            <ProductDetailContent params={params} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

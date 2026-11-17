import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getPublishedProductBySlug } from "@/lib/catalogueService";
import { ProductInteractiveClient } from "@/components/ProductInteractiveClient";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    variant?: string;
    sku?: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) return { title: "Edition Not Found — Tavistra" };
  return {
    title: `${product.name} — Tavistra`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} — Tavistra`,
      description: product.shortDescription,
      images: product.primaryImageUrl ? [{ url: product.primaryImageUrl }] : [],
    },
  };
}

async function ProductDetailContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ variant?: string; sku?: string }>;
}) {
  await connection();
  const [{ slug }, search] = await Promise.all([
    params,
    searchParams ? searchParams : Promise.resolve(undefined),
  ]);
  const product = await getPublishedProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const initialVariantQuery = search?.variant || search?.sku;

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
        "name": product.categoryName,
        "item": `https://tavistra.com/category/${product.categorySlug}`,
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": product.name,
        "item": `https://tavistra.com/product/${product.slug}`,
      },
    ],
  };

  // Product Schema (AEO/SEO Rich Snippet)
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: product.primaryImageUrl ? [product.primaryImageUrl] : [],
    sku: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: "Tavistra",
    },
    offers: {
      "@type": "Offer",
      url: `https://tavistra.com/product/${product.slug}`,
      priceCurrency: "INR",
      price: (product.pricePaise / 100).toFixed(2),
      availability:
        product.mode === "READY_STOCK" && (product.availableStock ?? 1) <= 0
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      {/* Breadcrumbs (Desktop only; hidden on mobile for clean app-like viewport) */}
      <nav className="hidden lg:flex items-center gap-2 text-xs text-[var(--color-muted-light)] mb-10 whitespace-nowrap overflow-hidden">
        <Link href="/" className="hover:text-[var(--color-ink)] shrink-0">
          Home
        </Link>
        <span className="shrink-0">/</span>
        <Link href="/shop" className="hover:text-[var(--color-ink)] shrink-0">
          Shop
        </Link>
        <span className="shrink-0">/</span>
        <Link
          href={`/category/${product.categorySlug}`}
          className="hover:text-[var(--color-ink)] shrink-0"
        >
          {product.categoryName}
        </Link>
        <span className="shrink-0">/</span>
        <span className="text-[var(--color-ink)] font-semibold truncate max-w-sm shrink">
          {product.name}
        </span>
      </nav>

      {/* Interactive Product & Variant Pane */}
      <ProductInteractiveClient product={product} initialVariantQuery={initialVariantQuery} />
    </>
  );
}

export default function ProductDetailPage({ params, searchParams }: ProductPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-6 sm:py-16 px-4 sm:px-6 bg-[var(--color-canvas)]">
        <div className="mx-auto max-w-7xl">
          <Suspense
            fallback={
              <div className="py-20 text-center text-xs text-[var(--color-muted-light)]">
                Loading product specifications...
              </div>
            }
          >
            <ProductDetailContent params={params} searchParams={searchParams} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MOCK_PRODUCTS } from "@/lib/products";
import { getPublishedProductBySlug } from "@/lib/catalogueService";
import { ProductPurchaseAction } from "@/components/ProductPurchaseAction";
import { DeliveryEstimator } from "@/components/DeliveryEstimator";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return MOCK_PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

async function ProductDetailContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.pricePaise / 100);

  const mtoAdvancePaise = Math.round(product.pricePaise * 0.25);
  const formattedAdvance = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(mtoAdvancePaise / 100);

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

      {/* Product Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Visual Representation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="aspect-[4/3] rounded-2xl bg-[var(--color-ivory)] border border-[var(--color-decorative-border)] flex items-center justify-center p-8 relative overflow-hidden shadow-sm">
            <div className="text-center space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-canvas)] border border-[var(--color-control-border)] text-[10px] uppercase tracking-wider font-semibold text-[var(--color-bronze)]">
                {product.mode === "MADE_TO_ORDER"
                  ? "Crafted to Order"
                  : product.mode === "QUOTE_ONLY"
                  ? "Architectural Quotation"
                  : "Ready Stock Edition"}
              </span>
              <h2 className="font-editorial text-2xl text-[var(--color-ink)]">
                {product.name}
              </h2>
              <p className="text-xs text-[var(--color-muted-light)] max-w-md mx-auto">
                {product.materials.join(" · ")}
              </p>
            </div>
          </div>

          {/* Dimension & Weight Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-decorative-border)] text-center text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-light)] block mb-1">
                Dimensions
              </span>
              <span className="font-semibold text-[var(--color-ink)]">
                {product.dimensions}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-light)] block mb-1">
                Net Weight
              </span>
              <span className="font-semibold text-[var(--color-ink)]">
                {(product.weightGrams / 1000).toFixed(2)} kg
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-light)] block mb-1">
                Lead Time
              </span>
              <span className="font-semibold text-[var(--color-ink)]">
                {product.estimatedLeadTime}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-light)] block mb-1">
                Policy
              </span>
              <span className="font-semibold text-[var(--color-ink)]">
                {product.returnPolicyText}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Commercial & Action Pane (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-b border-[var(--color-decorative-border)] pb-6 space-y-3">
            <h1 className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)]">
              {product.name}
            </h1>
            <p className="text-xs text-[var(--color-muted-light)]">
              Category: {product.categoryName} · {product.subcategory}
            </p>

            {/* Authoritative Tax-Inclusive Pricing */}
            <div className="pt-2">
              <span className="font-editorial text-3xl text-[var(--color-ink)]">
                {formattedPrice}
              </span>
              <span className="ml-2 text-xs text-[var(--color-muted-light)]">
                (Inclusive of all applicable GST taxes)
              </span>
            </div>

            {/* MTO Advance Callout if Applicable */}
            {product.mode === "MADE_TO_ORDER" && (
              <div className="p-3.5 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-bronze)]/30 text-xs space-y-1">
                <div className="flex justify-between items-center font-semibold text-[var(--color-ink)]">
                  <span>25% Production Advance:</span>
                  <span className="text-[var(--color-bronze)] font-editorial text-base">
                    {formattedAdvance}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--color-muted-light)] leading-relaxed">
                  Remaining 75% balance due upon workshop QC inspection and customer approval prior to white-glove dispatch.
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="text-sm text-[var(--color-muted-light)] leading-relaxed space-y-4">
            <p>{product.shortDescription}</p>
          </div>

          {/* Materials Badge List */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-2">
              Authoritative Materials & Craftsmanship
            </h3>
            <div className="flex flex-wrap gap-2">
              {product.materials.map((m, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] text-xs text-[var(--color-ink)] font-medium"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Dynamic Distance-Band Delivery Estimator */}
          <DeliveryEstimator product={product} />

          {/* Purchase Action (Add to Cart / Request Quote) */}
          <div className="pt-4 border-t border-[var(--color-decorative-border)]">
            <ProductPurchaseAction product={product} formattedAdvance={formattedAdvance} />
          </div>

          {/* Design & Engineering Highlights */}
          <div className="pt-6 border-t border-[var(--color-decorative-border)] space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
              Design & Engineering Highlights
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[var(--color-muted-light)]">
              {product.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          {/* Policy Quick Links */}
          <div className="pt-4 border-t border-[var(--color-decorative-border)] flex items-center justify-between text-xs text-[var(--color-muted-light)]">
            <Link href="/shipping" className="hover:text-[var(--color-bronze)] underline">
              Shipping & Distance Bands
            </Link>
            <Link href="/returns-refunds" className="hover:text-[var(--color-bronze)] underline">
              Returns & Cancellations
            </Link>
          </div>
        </div>
      </div>
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

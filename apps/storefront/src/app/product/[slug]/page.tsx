import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MOCK_PRODUCTS } from "@/lib/products";
import { ProductPurchaseAction } from "@/components/ProductPurchaseAction";

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

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug);

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
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-16 px-6 bg-[var(--color-canvas)]">
        <div className="mx-auto max-w-7xl">
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

          {/* Product Layout: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left: Gallery Showcase */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-8">
                <div className="text-center">
                  <span className="font-editorial text-4xl italic text-[var(--color-bronze)]/50 block mb-2">
                    Tavistra Studio Edition
                  </span>
                  <span className="text-xs uppercase tracking-widest text-[var(--color-muted-light)]">
                    {product.name}
                  </span>
                </div>
              </div>

              {/* Material & Dimension Callouts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)]">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-light)] mb-1">
                    Primary Materials
                  </h4>
                  <p className="text-xs font-semibold text-[var(--color-ink)]">
                    {product.materials.join(" · ")}
                  </p>
                </div>
                <div className="p-5 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)]">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-light)] mb-1">
                    Dimensions
                  </h4>
                  <p className="text-xs font-semibold text-[var(--color-ink)]">
                    {product.dimensions}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Commercial Information & Purchase Gate */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                {/* Mode Tag */}
                <div className="mb-3">
                  <span className="inline-block rounded-md bg-[var(--color-stone)] px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
                    {product.mode === "READY_STOCK" && "Ready Stock · Available Now"}
                    {product.mode === "MADE_TO_ORDER" && "Made to Order · Workshop Batch"}
                    {product.mode === "QUOTE_ONLY" && "Quote Only · Architectural Commission"}
                  </span>
                </div>

                <h1 className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)] leading-tight mb-3">
                  {product.name}
                </h1>

                <p className="text-sm text-[var(--color-muted-light)] leading-relaxed">
                  {product.shortDescription}
                </p>
              </div>

              {/* Price & Fulfilment Transparency */}
              <div className="p-6 rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] space-y-4">
                {product.mode === "QUOTE_ONLY" ? (
                  <div>
                    <span className="text-xs font-semibold text-[var(--color-bronze)] uppercase tracking-wider">
                      Price On Proposal
                    </span>
                    <p className="text-xs text-[var(--color-muted-light)] mt-1">
                      Final quotation tailored to site dimensions, electrical requirements, and custom finishes.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-3">
                      <span className="font-editorial text-3xl font-semibold text-[var(--color-ink)]">
                        {formattedPrice}
                      </span>
                      <span className="text-xs text-[var(--color-muted-light)] font-medium">
                        Tax Inclusive (GST Included)
                      </span>
                    </div>

                    {product.mode === "MADE_TO_ORDER" && (
                      <div className="mt-3 pt-3 border-t border-[var(--color-decorative-border)]/60 text-xs text-[var(--color-muted-light)] space-y-1">
                        <p className="text-[var(--color-ink)] font-semibold">
                          Advance Gate: {formattedAdvance} (25% to start production)
                        </p>
                        <p className="text-[11px]">
                          Governed by 7-day confirmation grace period. Remaining 75% balance payable upon QC clearance prior to dispatch.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Lead Time & Dispatch */}
                <div className="text-xs text-[var(--color-muted-light)] pt-3 border-t border-[var(--color-decorative-border)]/60 flex items-center justify-between">
                  <span>Logistics Status:</span>
                  <span className="font-semibold text-[var(--color-ink)]">
                    {product.estimatedLeadTime}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <ProductPurchaseAction
                product={product}
                formattedAdvance={formattedAdvance}
              />

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
        </div>
      </main>

      <Footer />
    </div>
  );
}


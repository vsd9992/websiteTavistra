import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { APPROVED_CATEGORIES } from "@/lib/taxonomy";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Editorial Hero Section */}
        <section className="relative overflow-hidden bg-[var(--color-ivory)] px-6 py-24 sm:py-32 border-b border-[var(--color-decorative-border)]">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-xs uppercase tracking-widest text-[var(--color-bronze)] mb-4 font-semibold">
              Contemporary Craftsmanship
            </p>
            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl tracking-tight text-[var(--color-ink)] leading-[1.08] mb-6">
              Design-led objects shaped for intentional spaces.
            </h1>
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-[var(--color-muted-light)] leading-relaxed mb-10">
              Architectural décor, precision workspace objects, and ambient lighting. 
              Built with uncompromising material integrity across three transparent fulfilment models.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/shop"
                className="rounded-full bg-[var(--color-ink)] px-8 py-3.5 text-sm font-semibold text-[var(--color-canvas)] transition-all hover:bg-[var(--color-charcoal)] hover:shadow-sm"
              >
                Explore Catalogue
              </Link>
              <Link
                href="/bespoke"
                className="rounded-full border border-[var(--color-control-border)] bg-transparent px-8 py-3.5 text-sm font-semibold text-[var(--color-ink)] transition-all hover:border-[var(--color-ink)] hover:bg-[var(--color-canvas)]"
              >
                Made to Order & Bespoke
              </Link>
            </div>
          </div>
        </section>

        {/* 3 Disciplined Fulfillment Modes Highlight */}
        <section className="px-6 py-20 bg-[var(--color-canvas)] border-b border-[var(--color-decorative-border)]">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-xs uppercase tracking-widest text-[var(--color-muted-light)] font-semibold mb-2">
                Order Disciplines
              </h2>
              <p className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)]">
                Three independent ways to commission and collect
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Ready Stock */}
              <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-8 flex flex-col justify-between">
                <div>
                  <span className="inline-block rounded-md bg-[var(--color-stone)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-ink)] mb-4">
                    Immediate Dispatch
                  </span>
                  <h3 className="text-xl font-semibold text-[var(--color-ink)] mb-2">
                    Ready Stock
                  </h3>
                  <p className="text-sm text-[var(--color-muted-light)] leading-relaxed mb-6">
                    Finished pieces in stock at our studio. Reserved authoritatively at order confirmation and dispatched with verified packaging.
                  </p>
                </div>
                <div className="pt-4 border-t border-[var(--color-decorative-border)]/60 text-xs text-[var(--color-muted-light)]">
                  Standard dispatch: 24–48 hours
                </div>
              </div>

              {/* Made to Order */}
              <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-8 flex flex-col justify-between">
                <div>
                  <span className="inline-block rounded-md bg-[var(--color-stone)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-ink)] mb-4">
                    Batch & Custom
                  </span>
                  <h3 className="text-xl font-semibold text-[var(--color-ink)] mb-2">
                    Made to Order
                  </h3>
                  <p className="text-sm text-[var(--color-muted-light)] leading-relaxed mb-6">
                    Crafted to your finish preferences. Enters production upon 25% verified advance, with full remaining balance cleared prior to carrier dispatch.
                  </p>
                </div>
                <div className="pt-4 border-t border-[var(--color-decorative-border)]/60 text-xs text-[var(--color-muted-light)]">
                  Governed 7-day post-confirmation window
                </div>
              </div>

              {/* Quote Only / Architectural */}
              <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-8 flex flex-col justify-between">
                <div>
                  <span className="inline-block rounded-md bg-[var(--color-stone)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-ink)] mb-4">
                    Architectural & Bespoke
                  </span>
                  <h3 className="text-xl font-semibold text-[var(--color-ink)] mb-2">
                    Quote Only
                  </h3>
                  <p className="text-sm text-[var(--color-muted-light)] leading-relaxed mb-6">
                    Consultation with our design team for site-specific installations, dimensional adjustments, and material customizations.
                  </p>
                </div>
                <div className="pt-4 border-t border-[var(--color-decorative-border)]/60 text-xs text-[var(--color-muted-light)]">
                  Versioned 30-day locked proposals
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6 Core Categories Showcase */}
        <section className="px-6 py-20 bg-[var(--color-ivory)]">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <h2 className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2">
                  Taxonomy & Collections
                </h2>
                <p className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)]">
                  Explore by category
                </p>
              </div>
              <Link
                href="/shop"
                className="mt-4 md:mt-0 text-sm font-semibold text-[var(--color-bronze)] hover:underline"
              >
                View all collections →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {APPROVED_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="group rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-6 transition-all hover:border-[var(--color-control-border)] hover:shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-bronze)] transition-colors mb-2">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[var(--color-muted-light)] line-clamp-2">
                    {cat.subcategories.join(" · ")}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

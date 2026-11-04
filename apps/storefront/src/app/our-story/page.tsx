import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Our Story & Architectural Lineage — Tavistra",
  description:
    "The craftsmanship heritage of Tavistra by VDesign: standalone design-led objects, honest material integrity, and intentional living.",
};

export default function OurStoryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Editorial Story Hero */}
        <section className="bg-[var(--color-ivory)] px-6 py-24 sm:py-32 border-b border-[var(--color-decorative-border)]">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-3">
              Studio Heritage & Lineage
            </p>
            <h1 className="font-editorial text-4xl sm:text-6xl text-[var(--color-ink)] leading-tight mb-6">
              Born from bespoke architectural craft. Designed for timeless domestic living.
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-muted-light)] leading-relaxed max-w-2xl mx-auto">
              Tavistra is the design-led lifestyle sub-brand of <strong>VDesign</strong>. Where VDesign crafts extensive, site-integrated custom furniture, Tavistra creates standalone sculptural objects, ambient lighting, and tactile workspace editions.
            </p>
          </div>
        </section>

        {/* Brand Principles */}
        <section className="py-20 px-6 bg-[var(--color-canvas)] border-b border-[var(--color-decorative-border)]">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2 block">
                  Material Honesty
                </span>
                <h2 className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)] mb-4">
                  Uncompromised substance. No imitation veneers.
                </h2>
                <div className="space-y-4 text-sm text-[var(--color-muted-light)] leading-relaxed">
                  <p>
                    Every Tavistra piece originates from raw architectural matter: monolithic aerospace-grade aluminium, unlacquered solid brass that matures into an authentic natural patina, sustainably harvested hardwood, and composite cast stone.
                  </p>
                  <p>
                    We reject decorative hollow shells and transient planned obsolescence. Our objects are weighted, tactile, and engineered with enduring structural permanence.
                  </p>
                </div>
              </div>

              {/* Visual Card */}
              <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-10 flex flex-col justify-center items-center text-center aspect-square">
                <span className="font-editorial text-5xl text-[var(--color-bronze)]/50 block mb-4 italic">
                  VDesign
                </span>
                <p className="text-xs uppercase tracking-widest text-[var(--color-ink)] font-semibold">
                  Architectural & Studio Workshop
                </p>
                <p className="text-[11px] text-[var(--color-muted-light)] mt-2 max-w-xs">
                  Freestanding master-crafted objects requiring no structural installation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Disciplines & Small Batch Philosophy */}
        <section className="py-20 px-6 bg-[var(--color-ivory)]">
          <div className="mx-auto max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2 block">
                Production Philosophy
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)]">
                Governed editions & small batch fabrication
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-6 space-y-2">
                <span className="font-editorial text-2xl text-[var(--color-ink)] block">
                  Small Runs (≤ 10 Pieces)
                </span>
                <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
                  We maintain strict quality control by fabricating in limited batches, ensuring microscopic attention to fit and artisan finish.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-6 space-y-2">
                <span className="font-editorial text-2xl text-[var(--color-ink)] block">
                  Honest Pricing
                </span>
                <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
                  Direct from workshop to patron. All catalog prices are tax-inclusive with upfront distance-band delivery quotes and zero surprise charges.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-6 space-y-2">
                <span className="font-editorial text-2xl text-[var(--color-ink)] block">
                  Statutory Protection
                </span>
                <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
                  Governed 7-day confirmation grace windows on commissions, full replacement guarantees on transit defects, and formal GST invoicing.
                </p>
              </div>
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/shop"
                className="inline-block rounded-full bg-[var(--color-ink)] px-8 py-3.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors"
              >
                Explore Current Studio Editions
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

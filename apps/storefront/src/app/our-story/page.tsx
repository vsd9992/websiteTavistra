import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Our Story, Origin & Heritage — Tavistra",
  description:
    "The origin of Tavistra: inspired by Tvastr, the Vedic divine artisan. Standalone architectural objects and design-led lifestyle pieces by VDesign.",
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
              The Divine Artisan & Contemporary Form
            </p>
            <h1 className="font-editorial text-4xl sm:text-6xl text-[var(--color-ink)] leading-tight mb-6">
              Born from the spirit of creation. Shaped for intentional spaces.
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-muted-light)] leading-relaxed max-w-2xl mx-auto">
              Tavistra is the design-led lifestyle sub-brand of <strong>VDesign</strong>. 
              Grounded in the timeless craft of transforming raw elements into objects of character, purpose, and enduring beauty.
            </p>
          </div>
        </section>

        {/* Naming & Heritage: The Story of Tvastr */}
        <section className="py-20 px-6 bg-[var(--color-canvas)] border-b border-[var(--color-decorative-border)]">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Visual Motif Card */}
              <div className="md:col-span-5 flex flex-col justify-between rounded-3xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-10 aspect-square">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-bronze)] block mb-2">
                    Name Origin
                  </span>
                  <span className="font-editorial text-4xl text-[var(--color-ink)] block mb-1">
                    Tvashtr (त्वष्टृ)
                  </span>
                  <span className="text-xs text-[var(--color-muted-light)] block">
                    The Vedic Artisan & Shaper of Matter
                  </span>
                </div>

                <div className="pt-8 border-t border-[var(--color-decorative-border)]">
                  <p className="text-xs text-[var(--color-ink)] font-editorial text-xl italic">
                    &ldquo;To give enduring form to human imagination.&rdquo;
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-muted-light)] mt-2">
                    VDesign Studio Lineage
                  </p>
                </div>
              </div>

              {/* Right Column: Narrative */}
              <div className="md:col-span-7 space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2 block">
                    The Origin of Tavistra
                  </span>
                  <h2 className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)] mb-4 leading-snug">
                    Rooted in heritage. Expressed in contemporary restraint.
                  </h2>
                </div>

                <div className="space-y-4 text-sm text-[var(--color-muted-light)] leading-relaxed">
                  <p>
                    Tavistra draws its name and creative ethos from <strong>Tvashtr</strong> (also transliterated <em>Tvaṣṭṛ</em>), the Vedic divine fashioner and master artisan who embodies the power of creation. In ancient philosophy, Tvashtr represents the sacred impulse to take unformed stone, raw molten metal, and wood, and give them resolved, harmonious existence.
                  </p>
                  <p>
                    As a coined brand name, <strong>Tavistra</strong> reflects this lineage: bringing mindful craftsmanship into contemporary daily rituals. We do not look at heritage as nostalgia or static ornament, but as a living standard of structural integrity and deep tactile respect for raw matter.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Boundary: VDesign vs Tavistra */}
        <section className="py-20 px-6 bg-[var(--color-ivory)] border-b border-[var(--color-decorative-border)]">
          <div className="mx-auto max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2 block">
                Studio Architecture
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)]">
                The dialogue between furniture and objects
              </h2>
              <p className="text-xs text-[var(--color-muted-light)] mt-3">
                A deliberate distinction between large-scale built spaces and portable design objects.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* VDesign */}
              <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-8 space-y-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-light)] block">
                  The Parent House
                </span>
                <h3 className="font-editorial text-3xl text-[var(--color-ink)]">
                  VDesign
                </h3>
                <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
                  The architectural custom-furniture studio. VDesign engineers permanent built-ins, site-integrated luxury furniture, custom dressing consoles, structural wood cladding, and bespoke interior installations.
                </p>
                <div className="pt-4 border-t border-[var(--color-decorative-border)]/60 text-[11px] text-[var(--color-ink)] font-semibold">
                  Focus: Permanent & Site-Integrated Architecture
                </div>
              </div>

              {/* Tavistra */}
              <div className="rounded-2xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] p-8 space-y-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-bronze)] block">
                  The Lifestyle & Décor Sub-Brand
                </span>
                <h3 className="font-editorial text-3xl text-[var(--color-ink)]">
                  Tavistra
                </h3>
                <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
                  Freestanding and simply mounted objects requiring zero structural construction. Architectural wall clocks, minimalist mirrors, weighted desk instruments, and atmospheric ambient lighting that move with your life.
                </p>
                <div className="pt-4 border-t border-[var(--color-decorative-border)]/60 text-[11px] text-[var(--color-bronze)] font-semibold">
                  Focus: Standalone Design Objects & Ambient Living
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Material Principles */}
        <section className="py-20 px-6 bg-[var(--color-canvas)]">
          <div className="mx-auto max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold mb-2 block">
                Material Authenticity
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)]">
                Weight, texture & permanence
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 space-y-2">
                <span className="font-editorial text-2xl text-[var(--color-ink)] block">
                  Hardwood & Fine Joinery
                </span>
                <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
                  Grounded in VDesign&apos;s woodworking roots: sustainably sourced solid timber, precision-joined plywood, and architectural veneer accents crafted with hand-milled integrity.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 space-y-2">
                <span className="font-editorial text-2xl text-[var(--color-ink)] block">
                  Architectural Metals & Stone
                </span>
                <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
                  Unlacquered solid brass that matures gracefully, precision-machined aluminium, and cast mineral stone chosen for tactile permanence and authentic weight.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 space-y-2">
                <span className="font-editorial text-2xl text-[var(--color-ink)] block">
                  Small Batch Discipline
                </span>
                <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
                  Fabricated in controlled small runs (typically ≤ 10 pieces per batch), ensuring microscopic attention to assembly tolerances and personal artisan accountability.
                </p>
              </div>
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/shop"
                className="inline-block rounded-full bg-[var(--color-ink)] px-8 py-3.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors"
              >
                Browse the Current Catalogue
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

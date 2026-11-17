import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "404 — Edition Not Found | Tavistra",
  description: "The requested architectural edition or studio page could not be located.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <Header />

      <main className="flex-1 flex items-center justify-center py-20 px-6">
        <div className="mx-auto max-w-2xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-bronze)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-bronze)]">
              Catalogue Index 404
            </span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl text-[var(--color-ink)] font-normal tracking-tight leading-[1.1]">
            This piece is absent from our active catalogue.
          </h1>

          <p className="text-xs sm:text-sm text-[var(--color-muted-light)] leading-relaxed max-w-lg mx-auto">
            The edition or page you requested may have been archived, transferred to a bespoke private commission, or the URL address was misdirected. Explore our active studio works below.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop"
              className="rounded-full bg-[var(--color-ink)] px-7 py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
            >
              Explore Collection
            </Link>
            <Link
              href="/search"
              className="rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-7 py-3 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors"
            >
              Search Catalogue
            </Link>
            <Link
              href="/track"
              className="rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-7 py-3 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors"
            >
              Track Order
            </Link>
          </div>

          <div className="pt-8 border-t border-[var(--color-decorative-border)]/60 text-[11px] text-[var(--color-muted-light)]">
            Need bespoke assistance?{" "}
            <Link href="/contact" className="font-medium text-[var(--color-bronze)] underline hover:text-[var(--color-ink)]">
              Consult our Client Desk
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

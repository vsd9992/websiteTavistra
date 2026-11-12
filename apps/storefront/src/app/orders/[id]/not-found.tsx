import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function OrderNotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <Header />
      <main className="flex-1 mx-auto max-w-xl px-6 py-24 text-center space-y-6">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-bronze)] block">
          404 · Consignment Not Located
        </span>
        <h1 className="font-editorial text-4xl text-[var(--color-ink)]">
          Order Record Not Found
        </h1>
        <p className="text-xs text-[var(--color-muted-light)] leading-relaxed max-w-md mx-auto">
          We could not find an active studio order matching this reference. Please verify your Order Reference number from your confirmation email or search directly via the tracking desk.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/track"
            className="rounded-full bg-[var(--color-ink)] px-7 py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors"
          >
            Open Order Tracker
          </Link>
          <Link
            href="/account/orders"
            className="rounded-full border border-[var(--color-control-border)] px-7 py-3 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors"
          >
            My Orders
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

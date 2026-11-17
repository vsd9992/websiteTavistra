"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Tavistra Client Exception]:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <Header />

      <main className="flex-1 flex items-center justify-center py-20 px-6">
        <div className="mx-auto max-w-xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-800">
              System Notice · Runtime Interruption
            </span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-5xl text-[var(--color-ink)] font-normal tracking-tight leading-[1.1]">
            Our digital workshop encountered an unexpected hiccup.
          </h1>

          <p className="text-xs sm:text-sm text-[var(--color-muted-light)] leading-relaxed max-w-md mx-auto">
            A temporary runtime condition interrupted this view. You may reload this view or return to our homepage safely.
          </p>

          {error.digest && (
            <p className="font-mono text-[10px] text-[var(--color-muted-light)] bg-[var(--color-ivory)] py-1 px-3 rounded-md inline-block border border-[var(--color-decorative-border)]">
              Reference Code: {error.digest}
            </p>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-full bg-[var(--color-ink)] px-7 py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-7 py-3 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors"
            >
              Return to Homepage
            </Link>
            <Link
              href="/contact?intent=support"
              className="rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-7 py-3 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors"
            >
              Support Desk
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

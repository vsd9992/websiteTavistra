import Link from "next/link";
import { APPROVED_CATEGORIES } from "@/lib/taxonomy";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--color-decorative-border)] bg-[var(--color-canvas)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex flex-col">
            <span className="font-editorial text-2xl tracking-wider text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-bronze)]">
              TAVISTRA
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[var(--color-muted-light)]">
              BY VDESIGN
            </span>
          </Link>
        </div>

        {/* Primary Taxonomy Navigation */}
        <nav className="hidden lg:flex items-center gap-7">
          {APPROVED_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="text-[13px] font-medium tracking-wide text-[var(--color-muted-light)] transition-colors hover:text-[var(--color-ink)]"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Right Utility Navigation */}
        <div className="flex items-center gap-5">
          <Link
            href="/search"
            className="text-[13px] font-medium text-[var(--color-muted-light)] transition-colors hover:text-[var(--color-ink)]"
          >
            Search
          </Link>
          <Link
            href="/cart"
            className="flex items-center gap-1.5 rounded-full border border-[var(--color-stone)] bg-[var(--color-ivory)] px-3.5 py-1.5 text-[12px] font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-control-border)]"
          >
            <span>Cart</span>
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-ink)] text-[10px] text-[var(--color-canvas)]">
              0
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}


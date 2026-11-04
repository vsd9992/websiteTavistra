import Link from "next/link";
import Image from "next/image";
import { APPROVED_CATEGORIES } from "@/lib/taxonomy";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-decorative-border)] bg-[var(--color-charcoal)] text-[var(--color-ivory)]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* 5-Column Grid with Centerpiece Full Logo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 items-start">
          {/* Column 1: Brand Statement */}
          <div className="space-y-3">
            <span className="font-editorial text-2xl tracking-wider text-[var(--color-canvas)] block">
              Tavistra
            </span>
            <p className="text-xs leading-relaxed text-[var(--color-muted-dark)]">
              Design-led lifestyle and architectural décor sub-brand of VDesign. Master-crafted in India across Ready Stock, Made to Order, and Bespoke editions.
            </p>
            <p className="text-[11px] text-[var(--color-muted-dark)]/80">
              Tax-inclusive pricing with independent mode fulfilment.
            </p>
          </div>

          {/* Column 2: Catalogue */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-canvas)] mb-4">
              Catalogue
            </h4>
            <ul className="space-y-2 text-xs text-[var(--color-muted-dark)]">
              {APPROVED_CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="hover:text-[var(--color-canvas)] transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 (Center): Centerpiece Full Logo */}
          <div className="flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-[var(--color-muted-dark)]/15 bg-[var(--color-canvas)]/5 self-stretch">
            <Image
              src="/logo-full-light.png"
              alt="Tavistra Full Logo"
              width={260}
              height={86}
              className="h-16 w-auto object-contain mb-3 opacity-95"
            />
            <span className="text-[10px] uppercase tracking-widest text-[var(--color-muted-dark)] font-medium">
              Architectural Editions
            </span>
            <p className="text-[10px] text-[var(--color-muted-dark)]/60 mt-1">
              By VDesign Studio
            </p>
          </div>

          {/* Column 4: Policies & Operations */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-canvas)] mb-4">
              Policies
            </h4>
            <ul className="space-y-2 text-xs text-[var(--color-muted-dark)]">
              <li>
                <Link href="/shipping" className="hover:text-[var(--color-canvas)] transition-colors">
                  Delivery & Shipping
                </Link>
              </li>
              <li>
                <Link href="/returns-refunds" className="hover:text-[var(--color-canvas)] transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--color-canvas)] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--color-canvas)] transition-colors">
                  Privacy & Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact & Studio */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-canvas)] mb-4">
              Studio
            </h4>
            <div className="space-y-2 text-xs text-[var(--color-muted-dark)]">
              <p>VDesign Studio</p>
              <p>Email: studio@vdesign.in</p>
              <p>Support: support@tavistra.in</p>
              <p className="pt-2 text-[11px] text-[var(--color-muted-dark)]/60">
                GST invoicing provided with every confirmed order.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[var(--color-muted-dark)]/20 flex flex-col md:flex-row justify-between items-center text-[11px] text-[var(--color-muted-dark)]">
          <p>© 2026 Tavistra by VDesign. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Crafted for endurance and timeless living.
          </p>
        </div>
      </div>
    </footer>
  );
}

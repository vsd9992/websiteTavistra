import Link from "next/link";
import Image from "next/image";
import { APPROVED_CATEGORIES } from "@/lib/taxonomy";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-decorative-border)] bg-[var(--color-charcoal)] text-[var(--color-ivory)]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Centerpiece Full Logo */}
        <div className="mb-14 pb-12 border-b border-[var(--color-muted-dark)]/20 flex flex-col items-center justify-center text-center">
          <Image
            src="/tavistra-brand-lockup-light.png"
            alt="Tavistra Full Brand"
            width={240}
            height={48}
            className="h-9 sm:h-11 w-auto object-contain opacity-95 mb-4"
          />
          <p className="text-xs uppercase tracking-widest text-[var(--color-muted-dark)]">
            Design-Led Objects · Architectural Décor · Contemporary Living
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Philosophy */}
          <div className="space-y-4">
            <span className="font-editorial text-2xl tracking-wider text-[var(--color-canvas)] block">
              Tavistra
            </span>
            <p className="text-xs leading-relaxed text-[var(--color-muted-dark)]">
              A design-led lifestyle and architectural décor sub-brand of VDesign. 
              Master-crafted in India across Ready Stock, Made to Order, and Bespoke editions.
            </p>
            <p className="text-[11px] text-[var(--color-muted-dark)]/80">
              Operating strictly on transparent, tax-inclusive pricing with independent mode fulfilment.
            </p>
          </div>

          {/* Discovery / Categories */}
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

          {/* Transparent Policies (PhonePe Review Readiness) */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-canvas)] mb-4">
              Policies & Operations
            </h4>
            <ul className="space-y-2 text-xs text-[var(--color-muted-dark)]">
              <li>
                <Link href="/shipping" className="hover:text-[var(--color-canvas)] transition-colors">
                  Delivery & Distance Bands
                </Link>
              </li>
              <li>
                <Link href="/returns-refunds" className="hover:text-[var(--color-canvas)] transition-colors">
                  Returns & Cancellations
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--color-canvas)] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--color-canvas)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Merchant Identity */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-canvas)] mb-4">
              Contact & Studio
            </h4>
            <div className="space-y-2 text-xs text-[var(--color-muted-dark)]">
              <p>VDesign Studio & Workshop</p>
              <p>Email: studio@vdesign.in</p>
              <p>Support: support@tavistra.in</p>
              <p className="pt-2 text-[11px] text-[var(--color-muted-dark)]/60">
                GST & Invoicing details provided with every confirmed order.
              </p>
            </div>
          </div>
        </div>

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

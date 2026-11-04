import Link from "next/link";
import Image from "next/image";
import { APPROVED_CATEGORIES } from "@/lib/taxonomy";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-decorative-border)] bg-[var(--color-charcoal)] text-[var(--color-ivory)]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Philosophy */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--color-canvas)] rounded-lg p-1.5 flex items-center justify-center">
                <Image
                  src="/logo-mark.png"
                  alt="Tavistra Mark"
                  width={24}
                  height={19}
                  className="h-4 w-auto object-contain"
                />
              </div>
              <Image
                src="/logo-name-light.png"
                alt="Tavistra"
                width={130}
                height={22}
                className="h-4 w-auto object-contain"
              />
            </div>
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

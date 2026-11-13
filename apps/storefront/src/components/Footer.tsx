"use client";

import Link from "next/link";
import Image from "next/image";
import { APPROVED_CATEGORIES } from "@/lib/taxonomy";

export function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="mt-auto border-t border-[var(--color-decorative-border)] bg-[var(--color-charcoal)] text-[var(--color-ivory)] relative">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-12 lg:pt-20 lg:pb-14">
        {/* Block 1: Centered Logo & Tagline */}
        <div className="flex flex-col items-center justify-center text-center pb-12 border-b border-[var(--color-muted-dark)]/20">
          <Link href="/" className="inline-block transition-opacity hover:opacity-85">
            <Image
              src="/logo-full-light.png"
              alt="Tavistra by VDesign"
              width={260}
              height={86}
              priority={false}
              className="h-12 md:h-14 w-auto object-contain mx-auto"
            />
          </Link>
          <p className="mt-3 text-xs md:text-sm text-[var(--color-muted-dark)] tracking-wider">
            Design-led lifestyle & architectural décor by VDesign
          </p>
        </div>

        {/* Content Columns: Blocks 2, 3, 4 + Contact Us (All Top-Aligned) */}
        <div className="pt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Column 1: About Tavistra (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-sm font-semibold tracking-wide text-[var(--color-bronze)]">
              About Tavistra
            </h4>
            <div className="space-y-3 text-xs text-[var(--color-muted-dark)] leading-relaxed">
              <p>
                Tavistra draws its creative ethos from <em>Tvashtr</em>, the Vedic divine artisan who embodies the sacred impulse to shape raw matter into resolved form. As the design-led lifestyle sub-brand of VDesign, we engineer standalone décor, weighted desk instruments, and atmospheric ambient editions.
              </p>
              <p>
                Every piece is master-crafted in India with deep tactile reverence for solid hardwood, architectural metals, and fine joinery—built for endurance and timeless domestic rituals.
              </p>
              <div className="pt-1 text-[11px] text-[var(--color-muted-dark)]/80 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-bronze)]"></span>
                <span>Small-batch discipline · Zero structural installation required</span>
              </div>
            </div>
          </div>

          {/* Column 2: Information / Catalogue (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-semibold tracking-wide text-[var(--color-bronze)]">
              Information
            </h4>
            <ul className="space-y-2.5 text-xs text-[var(--color-muted-dark)]">
              <li>
                <Link href="/our-story" className="hover:text-[var(--color-canvas)] transition-colors">
                  About Us (Our Story)
                </Link>
              </li>
              {APPROVED_CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Helpful Links (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-semibold tracking-wide text-[var(--color-bronze)]">
              Helpful Links
            </h4>
            <ul className="space-y-2.5 text-xs text-[var(--color-muted-dark)]">
              <li>
                <Link href="/track" className="hover:text-[var(--color-canvas)] transition-colors">
                  Track Order Milestones
                </Link>
              </li>
              <li>
                <Link href="/track-ticket" className="hover:text-[var(--color-canvas)] transition-colors">
                  Track Support Ticket
                </Link>
              </li>
              <li>
                <Link href="/contact?intent=support" className="hover:text-[var(--color-canvas)] transition-colors">
                  Raise Support Ticket
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[var(--color-canvas)] transition-colors">
                  Client Account Portal
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--color-canvas)] transition-colors">
                  Contact &amp; Studio Inquiry
                </Link>
              </li>
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
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[var(--color-canvas)] transition-colors">
                  Review Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us (Replacing Subscribe More Info) (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-semibold tracking-wide text-[var(--color-bronze)]">
              Contact Us
            </h4>
            <div className="space-y-3 text-xs text-[var(--color-muted-dark)] leading-relaxed">
              <p>
                Our client desk assists with bespoke specifications, quote proposals, and order tracking across India.
              </p>

              <ul className="space-y-2.5 pt-1">
                <li className="flex items-center gap-2.5">
                  <svg className="w-3.5 h-3.5 text-[var(--color-bronze)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:support@tavistra.in" className="hover:text-[var(--color-canvas)] transition-colors font-medium">
                    support@tavistra.in
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-3.5 h-3.5 text-[var(--color-bronze)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Mon – Sat, 10:00 AM – 7:00 PM IST</span>
                </li>
                <li className="flex items-center gap-2.5 text-[11px] text-[var(--color-muted-dark)]/80">
                  <svg className="w-3.5 h-3.5 text-[var(--color-bronze)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Pan-India dispatch · Statutory GST invoices</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] bg-[var(--color-bronze)] hover:bg-[#6e5842] rounded transition-colors"
                >
                  <span>Open Inquiry Desk</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Divider Line */}
        <div className="mt-14 pt-6 border-t border-[var(--color-muted-dark)]/20 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Social Icons in Bronze Circles */}
          <div className="flex items-center gap-3">
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-7 h-7 rounded-full bg-[var(--color-bronze)] text-[var(--color-canvas)] flex items-center justify-center hover:opacity-85 transition-opacity"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* Pinterest */}
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pinterest"
              className="w-7 h-7 rounded-full bg-[var(--color-bronze)] text-[var(--color-canvas)] flex items-center justify-center hover:opacity-85 transition-opacity"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.332 1.357-.053.211-.174.256-.402.155-1.499-.696-2.435-2.883-2.435-4.643 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
              </svg>
            </a>

            {/* Email / Direct Inquiry */}
            <Link
              href="/contact"
              aria-label="Direct Inquiry"
              className="w-7 h-7 rounded-full bg-[var(--color-bronze)] text-[var(--color-canvas)] flex items-center justify-center hover:opacity-85 transition-opacity"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </Link>
          </div>

          {/* Copyright Notice */}
          <div className="text-xs text-[var(--color-muted-dark)] text-center md:text-right">
            <span>© 2026 Tavistra by VDesign. All rights reserved.</span>
          </div>
        </div>
      </div>

      {/* Floating Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="absolute right-6 bottom-20 md:bottom-12 w-8 h-8 rounded bg-[var(--color-bronze)] text-[var(--color-canvas)] flex items-center justify-center shadow-lg hover:bg-[#6e5842] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </footer>
  );
}

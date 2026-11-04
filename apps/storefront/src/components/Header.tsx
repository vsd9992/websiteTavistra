"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { APPROVED_CATEGORIES } from "@/lib/taxonomy";
import { useCart } from "@/context/CartContext";

export function Header() {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { totalItemCount } = useCart();

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsShopOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsShopOpen(false);
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-decorative-border)] bg-[var(--color-canvas)]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex flex-col">
            <span className="font-editorial text-2xl tracking-wider text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-bronze)]">
              TAVISTRA
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[var(--color-muted-light)]">
              BY VDESIGN
            </span>
          </Link>
        </div>

        {/* Primary Desktop Navigation (WEB-035 Curated Mega-Menu Architecture) */}
        <nav className="hidden lg:flex items-center gap-8" ref={dropdownRef}>
          {/* Shop with Curated Mega-Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsShopOpen(!isShopOpen)}
              onMouseEnter={() => setIsShopOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-light)] transition-colors hover:text-[var(--color-ink)] py-2"
              aria-expanded={isShopOpen}
            >
              <span>Shop</span>
              <svg
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  isShopOpen ? "rotate-180 text-[var(--color-bronze)]" : "text-[var(--color-muted-light)]"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Curated Mega-Menu Panel */}
            {isShopOpen && (
              <div
                onMouseLeave={() => setIsShopOpen(false)}
                className="absolute -left-12 top-full mt-1 w-[720px] rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-8 shadow-xl"
              >
                <div className="grid grid-cols-12 gap-8">
                  {/* Left: 6 Approved Categories in 2 Columns */}
                  <div className="col-span-8">
                    <div className="flex items-center justify-between border-b border-[var(--color-decorative-border)]/60 pb-3 mb-4">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-bronze)]">
                        Catalogue Taxonomy
                      </span>
                      <Link
                        href="/shop"
                        onClick={() => setIsShopOpen(false)}
                        className="text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-bronze)] hover:underline"
                      >
                        View All Collections →
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {APPROVED_CATEGORIES.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/category/${cat.slug}`}
                          onClick={() => setIsShopOpen(false)}
                          className="group rounded-xl p-3 transition-colors hover:bg-[var(--color-ivory)]"
                        >
                          <h4 className="text-xs font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-bronze)] transition-colors mb-1">
                            {cat.name}
                          </h4>
                          <p className="text-[11px] text-[var(--color-muted-light)] line-clamp-1">
                            {cat.subcategories.slice(0, 2).join(", ")}...
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Right: Curated Editorial Feature Card (Mandated by WEB-035) */}
                  <div className="col-span-4 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-5 flex flex-col justify-between">
                    <div>
                      <span className="inline-block rounded-md bg-[var(--color-stone)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-3">
                        Featured Batch
                      </span>
                      <h4 className="font-editorial text-lg text-[var(--color-ink)] leading-snug mb-2">
                        Architectural Lighting & Décor
                      </h4>
                      <p className="text-[11px] text-[var(--color-muted-light)] leading-relaxed">
                        Handcrafted brass sconces and kinetic desk lamps with 2700K optical warmth.
                      </p>
                    </div>
                    <Link
                      href="/category/lighting-ambience"
                      onClick={() => setIsShopOpen(false)}
                      className="mt-4 text-xs font-semibold text-[var(--color-bronze)] hover:underline"
                    >
                      Explore Lighting →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/shop"
            className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-light)] transition-colors hover:text-[var(--color-ink)]"
          >
            Collections
          </Link>
          <Link
            href="/our-story"
            className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-light)] transition-colors hover:text-[var(--color-ink)]"
          >
            Our Story
          </Link>
          <Link
            href="/contact"
            className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-light)] transition-colors hover:text-[var(--color-ink)]"
          >
            Contact
          </Link>
        </nav>

        {/* Right Utility Navigation */}
        <div className="flex items-center gap-5">
          <Link
            href="/shop"
            className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-light)] transition-colors hover:text-[var(--color-ink)]"
          >
            Search
          </Link>
          <Link
            href="/cart"
            className="flex items-center gap-2 rounded-full border border-[var(--color-stone)] bg-[var(--color-ivory)] px-4 py-2 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-control-border)]"
          >
            <span>Cart</span>
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-ink)] text-[10px] text-[var(--color-canvas)]">
              {totalItemCount}
            </span>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[var(--color-ink)]"
            aria-label="Toggle navigation menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer (WEB-036) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--color-decorative-border)] bg-[var(--color-canvas)] px-6 py-8 space-y-6">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-bronze)] block mb-3">
              Explore Collections
            </span>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-semibold text-sm text-[var(--color-ink)] block hover:text-[var(--color-bronze)]"
                >
                  All Works (Shop All)
                </Link>
              </li>
              {APPROVED_CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xs text-[var(--color-muted-light)] block hover:text-[var(--color-ink)]"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6 border-t border-[var(--color-decorative-border)] space-y-2 text-xs">
            <Link
              href="/shipping"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
            >
              Shipping & Distance Bands
            </Link>
            <Link
              href="/returns-refunds"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
            >
              Returns & Cancellations
            </Link>
            <Link
              href="/terms"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
            >
              Terms of Service
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
            >
              Contact Studio
            </Link>
            <Link
              href="/privacy"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
            >
              Privacy & Cookies
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

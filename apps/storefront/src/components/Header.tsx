"use client";

import Link from "next/link";
import Image from "next/image";
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
        {/* Brand Mark Only */}
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center">
            <Image
              src="/logo-mark.png"
              alt="Tavistra"
              width={40}
              height={32}
              priority
              className="h-8 w-auto object-contain transition-opacity group-hover:opacity-80"
            />
          </Link>
        </div>

        {/* Primary Desktop Navigation (WEB-035 Curated Mega-Menu Architecture) */}
        <nav className="hidden lg:flex items-center gap-8" ref={dropdownRef}>
          {/* Shop with Curated Mega-Menu */}
          <div
            className="relative"
            onMouseEnter={() => setIsShopOpen(true)}
            onMouseLeave={() => setIsShopOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsShopOpen(!isShopOpen)}
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
                className="absolute -left-12 top-full pt-2 w-[720px]"
              >
                <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-8 shadow-xl grid grid-cols-12 gap-8">
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

        {/* Right Utility Navigation (Minimalist Luxury Symbols) */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Search Icon */}
          <Link
            href="/shop"
            className="p-1.5 text-[var(--color-muted-light)] transition-colors hover:text-[var(--color-ink)]"
            aria-label="Search catalogue"
            title="Search"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </Link>

          {/* Account Icon */}
          <Link
            href="/account"
            className="p-1.5 text-[var(--color-muted-light)] transition-colors hover:text-[var(--color-ink)]"
            aria-label="Client account"
            title="Account"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </Link>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative p-1.5 text-[var(--color-muted-light)] transition-colors hover:text-[var(--color-ink)]"
            aria-label={`Shopping bag with ${totalItemCount} items`}
            title="Cart"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.993z"
              />
            </svg>
            {totalItemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--color-ink)] px-1 text-[9px] font-semibold text-[var(--color-canvas)] leading-none">
                {totalItemCount}
              </span>
            )}
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
              href="/track"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-semibold text-[var(--color-ink)] hover:text-[var(--color-bronze)]"
            >
              Track Order Milestones
            </Link>
            <Link
              href="/account"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-semibold text-[var(--color-ink)] hover:text-[var(--color-bronze)]"
            >
              Client Account & Addresses
            </Link>
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

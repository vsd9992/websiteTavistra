"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { APPROVED_CATEGORIES } from "@/lib/taxonomy";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { SearchOverlay } from "@/components/SearchOverlay";

export function Header() {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [systemNotice, setSystemNotice] = useState<{
    maintenanceMode: boolean;
    studioHiatus: boolean;
    announcementBanner: string;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const { totalItemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  // Load system notices & hiatus announcements
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.maintenanceMode || data.studioHiatus)) {
          setSystemNotice(data);
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsShopOpen(false);
      }
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(e.target as Node)
      ) {
        setIsAccountOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsShopOpen(false);
        setIsAccountOpen(false);
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

  // Global search shortcut (/ or Cmd/Ctrl+K)
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        const target = e.target as HTMLElement | null;
        const isInput =
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable);
        if (!isInput) {
          e.preventDefault();
          setIsSearchOpen((prev) => !prev);
        }
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-decorative-border)] bg-[var(--color-canvas)]/95 backdrop-blur-md">
      {systemNotice && (systemNotice.maintenanceMode || systemNotice.studioHiatus) && (
        <aside
          role="status"
          aria-live="polite"
          className="bg-[#1f1a16] text-[#c59b6d] border-b border-[#3e3428] px-4 py-2 text-center text-xs tracking-wide flex items-center justify-center gap-2"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#c59b6d] animate-pulse" />
          <span className="font-semibold uppercase tracking-wider text-[10px]">
            {systemNotice.maintenanceMode ? "Studio Operations Notice" : "Workshop Hiatus"}:
          </span>
          <span className="text-[#e2ded9] text-[11px] font-medium">
            {systemNotice.announcementBanner}
          </span>
        </aside>
      )}
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
                className="absolute left-0 top-full pt-2 w-[520px]"
              >
                <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-6 shadow-xl">
                  {/* 6 Approved Categories in 2 Columns */}
                  <div className="flex items-center justify-between border-b border-[var(--color-decorative-border)]/60 pb-3 mb-4">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-bronze)]">
                      Product Categories
                    </span>
                    <Link
                      href="/shop"
                      onClick={() => setIsShopOpen(false)}
                      className="text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-bronze)] hover:underline"
                    >
                      View All Collections →
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
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
                        {cat.description && (
                          <p className="text-[11px] text-[var(--color-muted-light)] line-clamp-1">
                            {cat.description}
                          </p>
                        )}
                      </Link>
                    ))}
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
          {/* Search Button (WEB-037 Compact Search Overlay) */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsSearchOpen(true);
            }}
            aria-haspopup="dialog"
            aria-expanded={isSearchOpen}
            className="p-1.5 text-[var(--color-muted-light)] transition-colors hover:text-[var(--color-ink)]"
            aria-label="Search catalogue"
            title="Search (or press /)"
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
          </button>

          {/* Account Icon with Hover Menu */}
          <div
            className="relative"
            ref={accountDropdownRef}
            onMouseEnter={() => setIsAccountOpen(true)}
            onMouseLeave={() => setIsAccountOpen(false)}
          >
            <Link
              href={isAuthenticated ? "/account" : "/account/login"}
              onClick={() => setIsAccountOpen(false)}
              className="relative flex items-center gap-1.5 p-1.5 text-[var(--color-muted-light)] transition-colors hover:text-[var(--color-ink)]"
              aria-label={isAuthenticated && user ? `Signed in as ${user.name}` : "Sign in to client account"}
              title={isAuthenticated && user ? `Account: ${user.name}` : "Sign In"}
              aria-expanded={isAccountOpen}
              aria-haspopup="menu"
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
              {isAuthenticated && user && (
                <span
                  className="hidden sm:inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-ink)] px-1.5 text-[10px] font-semibold uppercase text-[var(--color-canvas)]"
                >
                  {user.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((p) => p[0] || "")
                    .join("") || "U"}
                </span>
              )}
            </Link>

            {/* Hover Menu Panel */}
            {isAccountOpen && (
              <div className="absolute right-0 top-full pt-2 w-64 sm:w-72 z-50">
                <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-4 shadow-xl text-xs">
                  {isAuthenticated && user ? (
                    /* Set 1: Authenticated User Menu */
                    <div>
                      {/* Identity Header */}
                      <div className="pb-3 mb-2 border-b border-[var(--color-decorative-border)]">
                        <p className="font-semibold text-sm text-[var(--color-ink)] truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-[var(--color-muted-light)] truncate">
                          {user.email}
                        </p>
                        {user.practiceOrStudio && (
                          <span className="inline-block mt-1 text-[10px] uppercase tracking-wider text-[var(--color-bronze)] font-medium">
                            {user.practiceOrStudio}
                          </span>
                        )}
                      </div>

                      {/* Primary Navigation */}
                      <div className="space-y-1 py-1">
                        <Link
                          href="/account"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[var(--color-ink)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-bronze)] transition-colors font-medium"
                        >
                          <span>Overview Dashboard</span>
                          <span className="text-[11px] text-[var(--color-muted-light)]">→</span>
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[var(--color-ink)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-bronze)] transition-colors font-medium"
                        >
                          <span>Orders &amp; Quotations</span>
                          <span className="text-[11px] text-[var(--color-muted-light)]">→</span>
                        </Link>
                        <Link
                          href="/account/tickets"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[var(--color-ink)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-bronze)] transition-colors font-medium"
                        >
                          <span>Support Tickets</span>
                          <span className="text-[11px] text-[var(--color-muted-light)]">→</span>
                        </Link>
                        <Link
                          href="/account/addresses"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[var(--color-ink)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-bronze)] transition-colors font-medium"
                        >
                          <span>Saved Addresses</span>
                          <span className="text-[11px] text-[var(--color-muted-light)]">→</span>
                        </Link>
                        <Link
                          href="/account/profile"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[var(--color-ink)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-bronze)] transition-colors font-medium"
                        >
                          <span>Profile &amp; Security</span>
                          <span className="text-[11px] text-[var(--color-muted-light)]">→</span>
                        </Link>
                      </div>

                      {/* Guest Tools */}
                      <div className="pt-2 mt-1 border-t border-[var(--color-decorative-border)] space-y-1">
                        <Link
                          href="/track"
                          onClick={() => setIsAccountOpen(false)}
                          className="block rounded-lg px-2.5 py-1.5 text-[11px] text-[var(--color-muted-light)] hover:text-[var(--color-ink)] hover:bg-[var(--color-ivory)] transition-colors"
                        >
                          Track Order Milestones
                        </Link>
                        <Link
                          href="/track-ticket"
                          onClick={() => setIsAccountOpen(false)}
                          className="block rounded-lg px-2.5 py-1.5 text-[11px] text-[var(--color-muted-light)] hover:text-[var(--color-ink)] hover:bg-[var(--color-ivory)] transition-colors"
                        >
                          Track Support Ticket
                        </Link>
                      </div>

                      {/* Sign Out */}
                      <div className="pt-2 mt-2 border-t border-[var(--color-decorative-border)]">
                        <button
                          type="button"
                          onClick={async () => {
                            setIsAccountOpen(false);
                            await logout();
                            window.location.assign("/account/login");
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold text-[var(--color-error)] hover:bg-[var(--color-ivory)] transition-colors"
                        >
                          <span>Sign Out</span>
                          <span>⎋</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Set 2: Guest / Not Logged In Menu */
                    <div>
                      <div className="pb-3 mb-3 border-b border-[var(--color-decorative-border)]">
                        <p className="font-semibold text-sm text-[var(--color-ink)]">
                          Client Account
                        </p>
                        <p className="text-[11px] text-[var(--color-muted-light)] mt-0.5 leading-relaxed">
                          Sign in to access your orders, active quotations, and customer support.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Link
                            href="/account/login"
                            onClick={() => setIsAccountOpen(false)}
                            className="flex-1 rounded-lg bg-[var(--color-ink)] py-2 text-center text-xs font-semibold text-[var(--color-canvas)] transition-opacity hover:opacity-90"
                          >
                            Sign In
                          </Link>
                          <Link
                            href="/account/register"
                            onClick={() => setIsAccountOpen(false)}
                            className="flex-1 rounded-lg border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] py-2 text-center text-xs font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-control-border)]"
                          >
                            Register
                          </Link>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-bronze)] block px-2.5 py-1">
                          Client Services
                        </span>
                        <Link
                          href="/track"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-ink)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-bronze)] transition-colors"
                        >
                          <span>Track Order Status</span>
                          <span className="text-[11px] text-[var(--color-muted-light)]">→</span>
                        </Link>
                        <Link
                          href="/track-ticket"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-ink)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-bronze)] transition-colors"
                        >
                          <span>Track Support Ticket</span>
                          <span className="text-[11px] text-[var(--color-muted-light)]">→</span>
                        </Link>
                        <Link
                          href="/contact"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-ink)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-bronze)] transition-colors"
                        >
                          <span>Contact Customer Support</span>
                          <span className="text-[11px] text-[var(--color-muted-light)]">→</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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
          {/* Quick Search Action */}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsSearchOpen(true);
            }}
            className="flex w-full items-center justify-between rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] px-4 py-3 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-control-border)]"
          >
            <span className="flex items-center gap-2.5">
              <svg className="h-4 w-4 text-[var(--color-bronze)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span>Search Objects &amp; Materials</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-bronze)]">Search</span>
          </button>

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

          <div className="pt-6 border-t border-[var(--color-decorative-border)] space-y-3 text-xs">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="pb-2 border-b border-[var(--color-decorative-border)]/50">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-bronze)] font-semibold block">
                    Signed in client
                  </span>
                  <span className="font-semibold text-sm text-[var(--color-ink)] block">{user.name}</span>
                </div>
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block font-semibold text-[var(--color-ink)] hover:text-[var(--color-bronze)]"
                >
                  Client Account Dashboard
                </Link>
                <Link
                  href="/account/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
                >
                  Orders &amp; Quotations
                </Link>
                <Link
                  href="/account/tickets"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
                >
                  Support Tickets
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    setIsMobileMenuOpen(false);
                    await logout();
                    window.location.assign("/account/login");
                  }}
                  className="block pt-1 text-[var(--color-error)] text-left font-medium"
                >
                  Sign Out ⎋
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/account/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block font-semibold text-[var(--color-ink)] hover:text-[var(--color-bronze)]"
                >
                  Sign In to Client Account
                </Link>
                <Link
                  href="/account/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
                >
                  Create Client Account
                </Link>
              </div>
            )}

            <div className="pt-3 border-t border-[var(--color-decorative-border)]/50 space-y-2">
              <Link
                href="/track"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block font-semibold text-[var(--color-ink)] hover:text-[var(--color-bronze)]"
              >
                Track Order Milestones
              </Link>
              <Link
                href="/track-ticket"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block font-semibold text-[var(--color-ink)] hover:text-[var(--color-bronze)]"
              >
                Track Support Ticket
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
        </div>
      )}

      {/* Compact Search Overlay (WEB-037 / WEB-039) */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { APPROVED_CATEGORIES } from "@/lib/taxonomy";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { SearchOverlay } from "@/components/SearchOverlay";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMenuClosing, setIsMobileMenuClosing] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAccountClosing, setIsAccountClosing] = useState(false);
  const [systemNotice, setSystemNotice] = useState<{
    maintenanceMode: boolean;
    studioHiatus: boolean;
    announcementBanner: string;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(65);
  const { totalItemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlistCount } = useWishlist();

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeMobileMenu = useCallback(() => {
    if (isMobileMenuClosing) return;
    setIsMobileMenuClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsMobileMenuClosing(false);
    }, 240);
  }, [isMobileMenuClosing]);

  const openMobileMenu = useCallback(() => {
    setIsMobileMenuClosing(false);
    setIsMobileMenuOpen(true);
  }, []);

  const closeAccountModal = useCallback(() => {
    if (isAccountClosing) return;
    setIsAccountClosing(true);
    setTimeout(() => {
      setIsAccountOpen(false);
      setIsAccountClosing(false);
    }, 240);
  }, [isAccountClosing]);

  const openAccountModal = useCallback(() => {
    setIsAccountClosing(false);
    setIsAccountOpen(true);
  }, []);

  // Track header height for mobile navigation drawer positioning
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, [systemNotice]);

  // Prevent background scroll when mobile navigation or mobile client portal is active
  useEffect(() => {
    const isMobileModalActive =
      (isMobileMenuOpen || isMobileMenuClosing) ||
      ((isAccountOpen || isAccountClosing) && typeof window !== "undefined" && window.innerWidth < 1024);

    if (isMobileModalActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen, isMobileMenuClosing, isAccountOpen, isAccountClosing]);

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
        window.innerWidth >= 1024 &&
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(e.target as Node)
      ) {
        setIsAccountOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsShopOpen(false);
        if (window.innerWidth >= 1024) {
          setIsAccountOpen(false);
        } else {
          closeAccountModal();
        }
        closeMobileMenu();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeAccountModal, closeMobileMenu]);

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
    <header ref={headerRef} className="sticky top-0 z-50 w-full border-b border-[var(--color-decorative-border)] bg-[var(--color-canvas)]/95 backdrop-blur-md">
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
            {/* Desktop Account Icon with Hover Menu (hidden on mobile; Batch 3 Locked Structure) */}
            <Link
              href={isAuthenticated ? "/account" : "/account/login"}
              onClick={() => setIsAccountOpen(false)}
              className="hidden lg:flex relative items-center gap-1.5 p-1.5 text-[var(--color-muted-light)] transition-colors hover:text-[var(--color-ink)]"
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

            {/* Mobile User Icon Toggle (opens portalled bottom sheet) */}
            <button
              type="button"
              onClick={() => {
                if (isAccountOpen) {
                  closeAccountModal();
                } else {
                  openAccountModal();
                }
              }}
              className="lg:hidden relative flex items-center gap-1.5 p-1.5 text-[var(--color-muted-light)] transition-colors hover:text-[var(--color-ink)] cursor-pointer"
              aria-label={isAuthenticated && user ? `Signed in as ${user.name}` : "Sign in to client account"}
              title={isAuthenticated && user ? `Account: ${user.name}` : "Sign In / Client Portal"}
              aria-expanded={isAccountOpen}
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
                <span className="h-2 w-2 rounded-full bg-[var(--color-bronze)]" />
              )}
            </button>

            {/* Desktop Hover Menu Panel (hidden on mobile/tablet; accessed via bottom sheet) */}
            {isAccountOpen && (
              <div className="hidden lg:block absolute right-0 top-full pt-2 w-64 sm:w-72 z-50">
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
                          href="/account/wishlist"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[var(--color-ink)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-bronze)] transition-colors font-medium"
                        >
                          <span className="flex items-center gap-1.5">
                            <span>Saved Wishlist</span>
                            {wishlistCount > 0 && (
                              <span className="text-[9px] font-mono font-bold bg-[var(--color-stone)] px-1.5 py-0.5 rounded-full text-[var(--color-bronze)]">
                                {wishlistCount}
                              </span>
                            )}
                          </span>
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

                      {/* Tracking Utility */}
                      <div className="pt-2 mt-1 border-t border-[var(--color-decorative-border)] space-y-1">
                        <Link
                          href="/track"
                          onClick={() => setIsAccountOpen(false)}
                          className="block rounded-lg px-2.5 py-1.5 text-[11px] text-[var(--color-muted-light)] hover:text-[var(--color-ink)] hover:bg-[var(--color-ivory)] transition-colors"
                        >
                          Track Order Milestones
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
            onClick={() => {
              if (isMobileMenuOpen) {
                closeMobileMenu();
              } else {
                openMobileMenu();
              }
            }}
            className="lg:hidden p-2 text-[var(--color-ink)]"
            aria-label="Toggle navigation menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen && !isMobileMenuClosing ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay Menu (WEB-036) — App-Style Overlay portalled to document.body */}
      {mounted && (isMobileMenuOpen || isMobileMenuClosing) && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
          style={{ top: `${headerHeight}px` }}
          className={`fixed inset-x-0 bottom-0 z-40 lg:hidden flex justify-end bg-black/50 backdrop-blur-sm ${
            isMobileMenuClosing ? "animate-fade-out" : "animate-fade-in"
          }`}
          onClick={closeMobileMenu}
        >
          <div
            className={`w-full h-full max-w-sm bg-[var(--color-canvas)] p-6 shadow-2xl flex flex-col overflow-y-auto text-left border-l border-[var(--color-decorative-border)] ${
              isMobileMenuClosing ? "animate-slide-right" : "animate-slide-left"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header of Overlay (without duplicate logo; header remains fully visible above) */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-decorative-border)] shrink-0">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-bronze)]">
                  Directory
                </p>
                <p className="font-serif text-sm text-[var(--color-ink)]">
                  Editions &amp; Navigation
                </p>
              </div>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="p-1.5 rounded-full text-[var(--color-muted-light)] hover:text-[var(--color-ink)] hover:bg-[var(--color-ivory)] transition-colors cursor-pointer"
                aria-label="Close navigation menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Quick Search in Overlay */}
            <div className="py-4 shrink-0">
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  setIsSearchOpen(true);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] px-4 py-2.5 text-xs text-[var(--color-muted-light)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-[var(--color-bronze)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <span>Search collection &amp; materials...</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-bronze)] font-semibold">Search</span>
              </button>
            </div>

            {/* Pure Brand & Catalogue Navigation (NO Client Portal Duplication) */}
            <div className="flex-1 py-2 space-y-6">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-bronze)] block mb-3">
                  Studio Editions
                </span>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/shop"
                      onClick={closeMobileMenu}
                      className="font-editorial text-lg text-[var(--color-ink)] block hover:text-[var(--color-bronze)] transition-colors"
                    >
                      All Works (Shop All)
                    </Link>
                  </li>
                  {APPROVED_CATEGORIES.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={`/category/${cat.slug}`}
                        onClick={closeMobileMenu}
                        className="text-xs text-[var(--color-muted-light)] hover:text-[var(--color-ink)] block py-0.5 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-[var(--color-decorative-border)]/60">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-bronze)] block mb-3">
                  Studio &amp; Governance
                </span>
                <ul className="space-y-2.5 text-xs">
                  <li>
                    <Link
                      href="/our-story"
                      onClick={closeMobileMenu}
                      className="text-[var(--color-ink)] hover:text-[var(--color-bronze)] font-medium block transition-colors"
                    >
                      Our Story &amp; Philosophy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      onClick={closeMobileMenu}
                      className="text-[var(--color-ink)] hover:text-[var(--color-bronze)] font-medium block transition-colors"
                    >
                      Contact Concierge &amp; Studio
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/shipping"
                      onClick={closeMobileMenu}
                      className="text-[var(--color-muted-light)] hover:text-[var(--color-ink)] block transition-colors"
                    >
                      Shipping &amp; Delivery Band Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/returns-refunds"
                      onClick={closeMobileMenu}
                      className="text-[var(--color-muted-light)] hover:text-[var(--color-ink)] block transition-colors"
                    >
                      Returns &amp; Cancellations
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Brand Stamp */}
            <div className="pt-4 border-t border-[var(--color-decorative-border)] text-[11px] text-[var(--color-muted-light)] shrink-0">
              <p>© {new Date().getFullYear()} Tavistra · Architectural Lifestyle</p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Mobile Client Portal Bottom Sheet Modal portalled to document.body */}
      {mounted && (isAccountOpen || isAccountClosing) && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Client Portal"
          className={`fixed inset-0 z-[70] flex flex-col justify-end bg-black/60 backdrop-blur-sm lg:hidden text-left ${
            isAccountClosing ? "animate-fade-out" : "animate-fade-in"
          }`}
          onClick={closeAccountModal}
        >
          <div
            className={`w-full max-h-[85vh] rounded-t-3xl border-t border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-6 shadow-2xl flex flex-col overflow-y-auto text-left ${
              isAccountClosing ? "animate-slide-down" : "animate-slide-up"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Touch Handle */}
            <div className="w-10 h-1 bg-[var(--color-stone)] rounded-full mx-auto mb-4 shrink-0" />

            {/* Header with Title & Close */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-decorative-border)] shrink-0">
              <div>
                <h3 className="text-base font-serif text-[var(--color-ink)] font-medium">
                  Tavistra Client Portal
                </h3>
                <p className="text-[11px] text-[var(--color-muted-light)]">
                  {isAuthenticated && user ? `Signed in as ${user.name}` : "Access orders, wishlist & concierge"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeAccountModal}
                className="p-1.5 rounded-full text-[var(--color-muted-light)] hover:text-[var(--color-ink)] hover:bg-[var(--color-ivory)] transition-colors cursor-pointer"
                aria-label="Close client portal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Account Content */}
            <div className="py-4 space-y-3">
              {isAuthenticated && user ? (
                <div>
                  {/* Identity Badge */}
                  <div className="pb-3 mb-2 border-b border-[var(--color-decorative-border)]/60">
                    <p className="font-semibold text-sm text-[var(--color-ink)]">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-[var(--color-muted-light)]">
                      {user.email}
                    </p>
                    {user.practiceOrStudio && (
                      <span className="inline-block mt-1 text-[10px] uppercase tracking-wider text-[var(--color-bronze)] font-medium">
                        {user.practiceOrStudio}
                      </span>
                    )}
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-1 py-1">
                    <Link
                      href="/account"
                      onClick={closeAccountModal}
                      className="flex items-center justify-between rounded-lg px-2.5 py-2.5 text-xs text-[var(--color-ink)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-bronze)] transition-colors font-medium"
                    >
                      <span>Overview Dashboard</span>
                      <span className="text-[11px] text-[var(--color-muted-light)]">→</span>
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={closeAccountModal}
                      className="flex items-center justify-between rounded-lg px-2.5 py-2.5 text-xs text-[var(--color-ink)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-bronze)] transition-colors font-medium"
                    >
                      <span>Orders &amp; Quotations</span>
                      <span className="text-[11px] text-[var(--color-muted-light)]">→</span>
                    </Link>
                    <Link
                      href="/account/wishlist"
                      onClick={closeAccountModal}
                      className="flex items-center justify-between rounded-lg px-2.5 py-2.5 text-xs text-[var(--color-ink)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-bronze)] transition-colors font-medium"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>Saved Wishlist</span>
                        {wishlistCount > 0 && (
                          <span className="text-[9px] font-mono font-bold bg-[var(--color-stone)] px-1.5 py-0.5 rounded-full text-[var(--color-bronze)]">
                            {wishlistCount}
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] text-[var(--color-muted-light)]">→</span>
                    </Link>
                    <Link
                      href="/account/tickets"
                      onClick={closeAccountModal}
                      className="flex items-center justify-between rounded-lg px-2.5 py-2.5 text-xs text-[var(--color-ink)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-bronze)] transition-colors font-medium"
                    >
                      <span>Support Tickets</span>
                      <span className="text-[11px] text-[var(--color-muted-light)]">→</span>
                    </Link>
                    <Link
                      href="/account/addresses"
                      onClick={closeAccountModal}
                      className="flex items-center justify-between rounded-lg px-2.5 py-2.5 text-xs text-[var(--color-ink)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-bronze)] transition-colors font-medium"
                    >
                      <span>Saved Addresses</span>
                      <span className="text-[11px] text-[var(--color-muted-light)]">→</span>
                    </Link>
                    <Link
                      href="/account/profile"
                      onClick={closeAccountModal}
                      className="flex items-center justify-between rounded-lg px-2.5 py-2.5 text-xs text-[var(--color-ink)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-bronze)] transition-colors font-medium"
                    >
                      <span>Profile &amp; Security</span>
                      <span className="text-[11px] text-[var(--color-muted-light)]">→</span>
                    </Link>
                  </div>

                  {/* Order Tracker */}
                  <div className="pt-2 mt-1 border-t border-[var(--color-decorative-border)]">
                    <Link
                      href="/track"
                      onClick={closeAccountModal}
                      className="block rounded-lg px-2.5 py-2 text-xs text-[var(--color-muted-light)] hover:text-[var(--color-ink)] hover:bg-[var(--color-ivory)] transition-colors"
                    >
                      Track Order Milestones
                    </Link>
                  </div>

                  {/* Sign Out */}
                  <div className="pt-3 mt-2 border-t border-[var(--color-decorative-border)]">
                    <button
                      type="button"
                      onClick={async () => {
                        closeAccountModal();
                        await logout();
                        window.location.assign("/account/login");
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2.5 text-xs font-semibold text-[var(--color-error)] hover:bg-[var(--color-ivory)] transition-colors cursor-pointer"
                    >
                      <span>Sign Out</span>
                      <span>⎋</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Guest View */
                <div>
                  <div className="pb-3 mb-3 border-b border-[var(--color-decorative-border)]">
                    <p className="font-semibold text-sm text-[var(--color-ink)]">
                      Client Account
                    </p>
                    <p className="text-[11px] text-[var(--color-muted-light)] mt-0.5 leading-relaxed">
                      Sign in to access your orders, active quotations, and customer support.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Link
                        href="/account/login"
                        onClick={closeAccountModal}
                        className="flex-1 rounded-xl bg-[var(--color-ink)] py-2.5 text-center text-xs font-semibold text-[var(--color-canvas)] transition-opacity hover:opacity-90 shadow-sm"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/account/register"
                        onClick={closeAccountModal}
                        className="flex-1 rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] py-2.5 text-center text-xs font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-control-border)]"
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
                      onClick={closeAccountModal}
                      className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-[var(--color-ink)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-bronze)] transition-colors"
                    >
                      <span>Track Order Status</span>
                      <span className="text-[11px] text-[var(--color-muted-light)]">→</span>
                    </Link>
                    <Link
                      href="/track-ticket"
                      onClick={closeAccountModal}
                      className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-[var(--color-ink)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-bronze)] transition-colors"
                    >
                      <span>Track Support Ticket</span>
                      <span className="text-[11px] text-[var(--color-muted-light)]">→</span>
                    </Link>
                    <Link
                      href="/contact"
                      onClick={closeAccountModal}
                      className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-[var(--color-ink)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-bronze)] transition-colors"
                    >
                      <span>Contact Customer Support</span>
                      <span className="text-[11px] text-[var(--color-muted-light)]">→</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Compact Search Overlay (WEB-037 / WEB-039) */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}

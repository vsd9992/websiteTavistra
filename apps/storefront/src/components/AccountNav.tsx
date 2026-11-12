"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/account", label: "Account Overview" },
  { href: "/account/orders", label: "Orders & Production" },
  { href: "/account/addresses", label: "Delivery Addresses" },
  { href: "/account/profile", label: "Profile & GSTIN" },
];

export default function AccountNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.assign("/account/login");
  };

  return (
    <aside className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/80 p-6 space-y-6 shadow-sm">
      <div className="space-y-1 pb-4 border-b border-[var(--color-decorative-border)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-muted-light)]">
          Tavistra Client Portal
        </p>
        <p className="text-base font-serif text-[var(--color-ink)] truncate">
          {user?.name || "Verified Client"}
        </p>
        <p className="text-xs text-[var(--color-muted-light)] truncate">
          {user?.email}
        </p>
        {user?.practiceOrStudio && (
          <p className="text-[11px] font-medium text-[var(--color-bronze)] truncate">
            {user.practiceOrStudio}
          </p>
        )}
      </div>

      <nav className="space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors ${
                active
                  ? "bg-[var(--color-ink)] text-[var(--color-canvas)]"
                  : "text-[var(--color-ink)] hover:bg-[var(--color-stone)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-[var(--color-decorative-border)]">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] py-2.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

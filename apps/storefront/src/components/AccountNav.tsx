"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function AccountNav() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const navItems = [
    { label: "Overview", href: "/account" },
    { label: "Orders & Milestones", href: "/account/orders" },
    { label: "Address Book", href: "/account/addresses" },
    { label: "Profile & GSTIN", href: "/account/profile" },
  ];

  return (
    <div className="border-b border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/40 mb-8">
      <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* User Info Capsule */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[var(--color-ink)] text-[var(--color-canvas)] flex items-center justify-center font-editorial font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : "V"}
          </div>
          <div>
            <h2 className="text-xs font-semibold text-[var(--color-ink)]">
              {user?.name || "Client Account"}
            </h2>
            <p className="text-[11px] text-[var(--color-muted-light)]">
              {user?.email || "Guest Session"}
            </p>
          </div>
        </div>

        {/* Tab Links */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-[var(--color-ink)] text-[var(--color-canvas)] shadow-sm"
                    : "text-[var(--color-muted-light)] hover:text-[var(--color-ink)] hover:bg-[var(--color-ivory)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={logout}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap ml-2"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

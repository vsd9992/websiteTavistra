"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import AccountNav from "@/components/AccountNav";
import { useAuth } from "@/context/AuthContext";

export default function AccountProfilePage() {
  const { user, isAuthenticated, authLoading, updateProfile } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [practiceOrStudio, setPracticeOrStudio] = useState("");
  const [gstin, setGstin] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setPracticeOrStudio(user.practiceOrStudio || "");
      setGstin(user.gstin || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!name.trim() || !phone.trim()) {
      setErrorMessage("Name and mobile number are required.");
      return;
    }

    setSaving(true);
    const result = await updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      practiceOrStudio: practiceOrStudio.trim(),
      gstin: gstin.trim(),
    });
    setSaving(false);

    if (!result.success) {
      setErrorMessage(result.error || "Unable to save profile changes.");
      return;
    }

    setSuccessMessage("Profile details and GST credentials saved.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)]">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-12 lg:py-16">
        {authLoading ? (
          <div className="py-24 text-center text-xs text-[var(--color-muted-light)]">
            Loading your VDesign client profile...
          </div>
        ) : !isAuthenticated ? (
          <div className="mx-auto max-w-md text-center space-y-6 py-16">
            <h1 className="text-3xl font-serif font-light text-[var(--color-ink)]">
              Sign in to manage your profile
            </h1>
            <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
              Sign in to inspect your verified email credentials, practice details, and B2B GSTIN information.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/account/login?next=/account/profile"
                className="rounded-full bg-[var(--color-ink)] px-8 py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)]"
              >
                Sign In
              </Link>
              <Link
                href="/account/register"
                className="rounded-full border border-[var(--color-control-border)] px-8 py-3 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)]"
              >
                Create Account
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-1">
              <AccountNav />
            </div>

            <div className="lg:col-span-3 space-y-8">
              <div className="space-y-1 border-b border-[var(--color-decorative-border)] pb-5">
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted-light)]">
                  Identity & Invoicing
                </span>
                <h1 className="text-3xl font-serif font-light text-[var(--color-ink)]">
                  Profile & GSTIN Settings
                </h1>
              </div>

              <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/60 p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                        Mobile / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                        Registered Email
                      </label>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          user?.emailVerified
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {user?.emailVerified ? "Verified" : "Pending Verification"}
                      </span>
                    </div>
                    <input
                      type="email"
                      readOnly
                      value={user?.email || ""}
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-stone)]/40 px-4 py-2.5 text-sm text-[var(--color-muted-light)] cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                        Architectural Practice / Studio
                      </label>
                      <input
                        type="text"
                        value={practiceOrStudio}
                        onChange={(e) => setPracticeOrStudio(e.target.value)}
                        placeholder="Optional studio or company name"
                        className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                        GSTIN (B2B Tax Invoices)
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                        placeholder="15-character GSTIN"
                        className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm font-mono text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 font-medium">
                      {errorMessage}
                    </div>
                  )}

                  {successMessage && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 font-medium">
                      {successMessage}
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-[var(--color-ink)] px-8 py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-60 transition-colors shadow-sm"
                    >
                      {saving ? "Saving Changes..." : "Save Profile Changes"}
                    </button>
                    <span className="text-[11px] text-[var(--color-muted-light)]">
                      Client since {user?.createdAt}
                    </span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

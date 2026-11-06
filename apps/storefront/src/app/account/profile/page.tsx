"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AccountNav } from "@/components/AccountNav";
import { useAuth } from "@/context/AuthContext";
import { validateEmail, validateIndianMobile } from "@tavistra/shared";

export default function AccountProfilePage() {
  const { user, isAuthenticated, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gstin: "",
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        gstin: user.gstin || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (successMessage) setSuccessMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    }

    const emailRes = validateEmail(formData.email);
    if (!emailRes.isValid) {
      newErrors.email = emailRes.error;
    }

    const phoneRes = validateIndianMobile(formData.phone);
    if (!phoneRes.isValid) {
      newErrors.phone = phoneRes.error;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateProfile({
      name: formData.name.trim(),
      email: emailRes.normalizedEmail || formData.email.trim().toLowerCase(),
      phone: phoneRes.normalizedPhone || formData.phone.trim(),
      gstin: formData.gstin.trim().toUpperCase() || undefined,
    });

    setSuccessMessage("Your profile information and corporate GSTIN have been updated successfully.");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)]">
      <Header />
      <main className="flex-1">
        {!isAuthenticated ? (
          <div className="mx-auto max-w-lg py-24 px-6 text-center space-y-6">
            <h1 className="font-editorial text-4xl text-[var(--color-ink)]">
              Sign In to View Profile
            </h1>
            <p className="text-xs text-[var(--color-muted-light)]">
              Access your studio identity and manage your corporate tax preferences.
            </p>
            <Link
              href="/account/login"
              className="inline-block rounded-full bg-[var(--color-ink)] px-8 py-3 text-xs font-semibold text-[var(--color-canvas)]"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <div>
            <AccountNav />
            <div className="mx-auto max-w-3xl px-6 pb-16 space-y-8">
              {/* Header */}
              <div className="border-b border-[var(--color-decorative-border)] pb-4 space-y-1">
                <h1 className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)]">
                  Profile & Corporate GSTIN
                </h1>
                <p className="text-xs text-[var(--color-muted-light)]">
                  Manage your personal client identity and business invoicing tax identifiers.
                </p>
              </div>

              {/* Form Card */}
              <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-8 shadow-sm space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                      Full Name / Architectural Practice *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
                    />
                    {errors.name && (
                      <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
                      />
                      {errors.email ? (
                        <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>
                      ) : (
                        <p className="text-[11px] text-[var(--color-muted-light)] mt-1">
                          Direct corporate or personal email. Relays banned.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                        Indian Mobile Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
                      />
                      {errors.phone ? (
                        <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>
                      ) : (
                        <p className="text-[11px] text-[var(--color-muted-light)] mt-1">
                          Used for shipment milestone dispatch updates.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                      GSTIN (Goods and Services Tax Identification Number)
                    </label>
                    <input
                      type="text"
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleChange}
                      placeholder="e.g. 07AAAAA0000A1Z5"
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-mono uppercase transition-colors"
                    />
                    <p className="text-[11px] text-[var(--color-muted-light)] mt-1">
                      When present, B2B tax invoices are issued with this GSTIN to enable input tax credit under Indian tax rules.
                    </p>
                  </div>

                  {successMessage && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 font-medium">
                      {successMessage}
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="submit"
                      className="rounded-full bg-[var(--color-ink)] px-8 py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm"
                    >
                      Save Profile Changes
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

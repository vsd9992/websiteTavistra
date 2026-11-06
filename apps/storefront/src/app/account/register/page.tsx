"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { validateEmail, validateIndianMobile } from "@tavistra/shared";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

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
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
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

    setIsSubmitting(true);
    const result = register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      gstin: formData.gstin,
    });
    setIsSubmitting(false);

    if (result.success) {
      router.push("/account");
    } else {
      setErrors({ general: result.error || "Unable to complete registration." });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)]">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16 px-6">
        <div className="w-full max-w-lg space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold">
              Tavistra Client Desk
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)]">
              Create Client Account
            </h1>
            <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
              Register for simplified re-ordering, saved studio addresses, and live milestone tracking.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-8 shadow-sm space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                  Full Name / Studio Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ar. Vikramaditya Sharma"
                  className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
                />
                {errors.name && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

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
                  placeholder="e.g. vikramaditya@studiovishnu.in"
                  className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
                />
                {errors.email ? (
                  <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>
                ) : (
                  <p className="text-[11px] text-[var(--color-muted-light)] mt-1">
                    Direct personal or corporate email required. Disposable & privacy relays are disallowed.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                  Mobile Number (India) *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
                />
                {errors.phone ? (
                  <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>
                ) : (
                  <p className="text-[11px] text-[var(--color-muted-light)] mt-1">
                    10-digit Indian mobile number for courier dispatch SMS alerts.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                  GSTIN (Optional for B2B Invoicing)
                </label>
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  placeholder="e.g. 07AAAAA0000A1Z5"
                  className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] transition-colors uppercase font-mono"
                />
                <p className="text-[11px] text-[var(--color-muted-light)] mt-1">
                  Enables input tax credit under Indian CGST / SGST rules.
                </p>
              </div>

              {errors.general && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {errors.general}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-[var(--color-ink)] py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSubmitting ? "Creating Account..." : "Complete Registration"}
              </button>
            </form>

            <div className="pt-4 border-t border-[var(--color-decorative-border)]/60 text-center">
              <p className="text-xs text-[var(--color-muted-light)]">
                Already registered?{" "}
                <Link
                  href="/account/login"
                  className="font-semibold text-[var(--color-ink)] hover:text-[var(--color-bronze)] underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


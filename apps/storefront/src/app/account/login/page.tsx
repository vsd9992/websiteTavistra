"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { validateEmail } from "@tavistra/shared";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateEmail(email);
    if (!validation.isValid) {
      setError(validation.error || "Please enter a valid personal or corporate email address.");
      return;
    }

    setIsSubmitting(true);
    const result = login(email);
    setIsSubmitting(false);

    if (result.success) {
      router.push("/account");
    } else {
      setError(result.error || "Unable to sign in. Please verify your details.");
    }
  };

  const handleDemoSignIn = () => {
    login("vikramaditya@studiovishnu.in");
    router.push("/account");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)]">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16 px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-[var(--color-bronze)] font-semibold">
              Tavistra Client Desk
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)]">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
              Access your saved addresses, corporate GSTIN, and live order tracking.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-8 shadow-sm space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. ar.vikram@studio.com"
                  className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
                />
                <p className="text-[11px] text-[var(--color-muted-light)] mt-1">
                  Anonymous relay domains (@duck.com, @mozmail.com) are restricted for security & GST compliance.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full rounded-full bg-[var(--color-ink)] py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {isSubmitting ? "Signing in..." : "Continue to Account"}
              </button>
            </form>

            <div className="pt-4 border-t border-[var(--color-decorative-border)]/60 text-center space-y-3">
              <p className="text-xs text-[var(--color-muted-light)]">
                Do not have an account?{" "}
                <Link
                  href="/account/register"
                  className="font-semibold text-[var(--color-ink)] hover:text-[var(--color-bronze)] underline"
                >
                  Register here
                </Link>
              </p>

              <button
                type="button"
                onClick={handleDemoSignIn}
                className="inline-block rounded-full border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] px-4 py-1.5 text-[11px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors"
              >
                Quick Preview with Sample Client
              </button>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/track"
              className="text-xs text-[var(--color-muted-light)] hover:text-[var(--color-ink)] transition-colors"
            >
              Looking for a single order? <span className="underline font-medium">Track Guest Order →</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { isAuthenticated, authLoading, registerAccount, verifyRegistrationEmail } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<"details" | "verify">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [practiceOrStudio, setPracticeOrStudio] = useState("");
  const [gstin, setGstin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/account");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Full name, email address, and phone number are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    const result = await registerAccount({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      gstin: gstin.trim() || undefined,
      practiceOrStudio: practiceOrStudio.trim() || undefined,
    });
    setBusy(false);

    if (!result.success) {
      setError(result.error || "Unable to create account.");
      return;
    }

    setOtpCode("");
    setStep("verify");
    setInfoMessage(
      result.message || "Verification code sent to your email. Enter the 6-digit code below."
    );
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otpCode.trim().length !== 6) {
      setError("Please enter the 6-digit email verification code.");
      return;
    }

    setBusy(true);
    const result = await verifyRegistrationEmail(email.trim(), otpCode.trim());
    setBusy(false);

    if (!result.success) {
      setError(result.error || "Verification code is invalid or expired.");
      return;
    }

    router.push("/account");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-6 py-16 lg:py-24">
        <div className="w-full max-w-lg space-y-7 bg-[var(--color-ivory)]/80 border border-[var(--color-decorative-border)] rounded-2xl p-8 md:p-10 shadow-sm">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted-light)]">
              {step === "details" ? "VDesign Client Registration" : "Verify Email Address"}
            </span>
            <h1 className="text-3xl font-serif font-light tracking-tight text-[var(--color-ink)]">
              {step === "details" ? "Create a Client Account" : "Enter Verification Code"}
            </h1>
            <p className="text-xs text-[var(--color-muted-light)]">
              {step === "details"
                ? "Save verified architectural delivery locations, GST credentials, and order milestones."
                : `We dispatched a 6-digit verification OTP to ${email}.`}
            </p>
          </div>

          {infoMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 leading-relaxed">
              {infoMessage}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 leading-relaxed">
              {error}
            </div>
          )}

          {step === "details" ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Mehta"
                    className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1">
                    Mobile / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@architecturalstudio.in"
                  className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1">
                    Practice / Studio (Optional)
                  </label>
                  <input
                    type="text"
                    value={practiceOrStudio}
                    onChange={(e) => setPracticeOrStudio(e.target.value)}
                    placeholder="e.g. Studio Atelier"
                    className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1">
                    GSTIN (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 24ABCDE1234F1Z5"
                    className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm font-mono text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-[var(--color-ink)] py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-60 transition-colors shadow-sm"
              >
                {busy ? "Creating Account..." : "Continue & Verify Email"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                  6-Digit Email Verification Code *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-center text-lg font-mono tracking-[0.4em] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                />
              </div>

              <button
                type="submit"
                disabled={busy || otpCode.length !== 6}
                className="w-full rounded-full bg-[var(--color-ink)] py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-60 transition-colors shadow-sm"
              >
                {busy ? "Verifying Code..." : "Activate Account & Continue"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("details");
                  setError("");
                }}
                className="w-full text-center text-xs text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
              >
                Edit registration details or resend code
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-[var(--color-decorative-border)] text-center text-xs text-[var(--color-muted-light)]">
            Already registered?{" "}
            <Link href="/account/login" className="font-semibold text-[var(--color-ink)] hover:underline">
              Sign In Instead
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  PASSWORD_ALLOWED_SYMBOLS,
  PASSWORD_MAX_LENGTH,
  validateEmail,
  validateGstin,
  validateIndianMobile,
  validateStrongPassword,
} from "@tavistra/shared";

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
  const [touched, setTouched] = useState<{
    email?: boolean;
    phone?: boolean;
    gstin?: boolean;
    password?: boolean;
  }>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const resetRegisterState = useCallback(() => {
    setStep("details");
    setName("");
    setEmail("");
    setPhone("");
    setPracticeOrStudio("");
    setGstin("");
    setPassword("");
    setConfirmPassword("");
    setOtpCode("");
    setTouched({});
    setError("");
    setInfoMessage("");
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      resetRegisterState();
      router.replace("/account");
    }
  }, [authLoading, isAuthenticated, router, resetRegisterState]);

  const emailVal = validateEmail(email);
  const mobileVal = validateIndianMobile(phone);
  const gstinVal = validateGstin(gstin);
  const pwVal = validateStrongPassword(password);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setTouched({ email: true, phone: true, gstin: true, password: true });

    if (name.trim().length < 2) {
      setError("Full name must be at least 2 characters.");
      return;
    }
    if (!emailVal.isValid) {
      setError(emailVal.error || "Please enter a valid email address.");
      return;
    }
    if (!mobileVal.isValid) {
      setError(mobileVal.error || "Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (gstin.trim() && !gstinVal.isValid) {
      setError(gstinVal.error || "Please enter a valid 15-character GSTIN.");
      return;
    }
    if (!pwVal.isValid) {
      setError(pwVal.error || "Password does not meet security requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    const result = await registerAccount({
      name: name.trim(),
      email: emailVal.normalizedEmail || email.trim(),
      phone: mobileVal.normalizedPhone || phone.trim(),
      password,
      gstin: gstinVal.normalizedGstin || undefined,
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
    const result = await verifyRegistrationEmail(
      emailVal.normalizedEmail || email.trim(),
      otpCode.trim()
    );
    setBusy(false);

    if (!result.success) {
      setError(result.error || "Verification code is invalid or expired.");
      return;
    }

    resetRegisterState();
    router.push("/account");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-6 py-16 lg:py-20">
        <div className="w-full max-w-lg space-y-7 bg-[var(--color-ivory)]/80 border border-[var(--color-decorative-border)] rounded-2xl p-8 md:p-10 shadow-sm">
          <div className="text-center space-y-2">
            <img
              src="/logo-name.png"
              alt="Tavistra"
              className="h-6 w-auto mx-auto object-contain mb-2"
            />
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted-light)] block">
              {step === "details" ? "Tavistra Client Registration" : "Verify Email Address"}
            </span>
            <h1 className="text-3xl font-serif font-light tracking-tight text-[var(--color-ink)]">
              {step === "details" ? "Create a Client Account" : "Enter Verification Code"}
            </h1>
            <p className="text-xs text-[var(--color-muted-light)]">
              {step === "details"
                ? "Save verified architectural delivery locations, validated GST credentials, and order milestones."
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                      Mobile Number *
                    </label>
                    {phone && mobileVal.isValid && (
                      <span className="text-[10px] font-semibold text-emerald-700">✓ Valid</span>
                    )}
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm font-mono text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                  />
                  {(phone || touched.phone) && !mobileVal.isValid && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium leading-snug">
                      ⚠ {mobileVal.error}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                    Email Address *
                  </label>
                  {email && emailVal.isValid && (
                    <span className="text-[10px] font-semibold text-emerald-700">✓ Verified Domain</span>
                  )}
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@architecturalstudio.in"
                  className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                />
                {(email || touched.email) && !emailVal.isValid && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium leading-snug">
                    ⚠ {emailVal.error}
                  </p>
                )}
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                      GSTIN (B2B Invoices)
                    </label>
                    {gstin.trim() && gstinVal.isValid && (
                      <span className="text-[10px] font-semibold text-emerald-700">✓ Valid</span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={15}
                    value={gstin}
                    onBlur={() => setTouched((prev) => ({ ...prev, gstin: true }))}
                    onChange={(e) => setGstin(e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, ""))}
                    placeholder="e.g. 27AAACT2727Q1ZW"
                    className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm font-mono text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                  />
                  {gstin.trim() && !gstinVal.isValid && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium leading-snug">
                      ⚠ {gstinVal.error}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1">
                    Password (8–15 Chars) *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    maxLength={PASSWORD_MAX_LENGTH}
                    value={password}
                    onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8–15 chars with symbol"
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
                    maxLength={PASSWORD_MAX_LENGTH}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                  />
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">
                      ⚠ Passwords do not match.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-3.5 space-y-2 text-[11px]">
                <p className="font-semibold text-[var(--color-ink)] uppercase tracking-wider text-[10px]">
                  Password Security Requirements
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <span className={pwVal.checks.length ? "text-emerald-700 font-medium" : "text-[var(--color-muted-light)]"}>
                    {pwVal.checks.length ? "✓" : "•"} 8–15 characters
                  </span>
                  <span className={pwVal.checks.uppercase ? "text-emerald-700 font-medium" : "text-[var(--color-muted-light)]"}>
                    {pwVal.checks.uppercase ? "✓" : "•"} Uppercase (A–Z)
                  </span>
                  <span className={pwVal.checks.lowercase ? "text-emerald-700 font-medium" : "text-[var(--color-muted-light)]"}>
                    {pwVal.checks.lowercase ? "✓" : "•"} Lowercase (a–z)
                  </span>
                  <span className={pwVal.checks.number ? "text-emerald-700 font-medium" : "text-[var(--color-muted-light)]"}>
                    {pwVal.checks.number ? "✓" : "•"} Number (0–9)
                  </span>
                  <span className={`col-span-2 ${pwVal.checks.symbol && pwVal.checks.allowedCharsOnly ? "text-emerald-700 font-medium" : "text-[var(--color-muted-light)]"}`}>
                    {pwVal.checks.symbol && pwVal.checks.allowedCharsOnly ? "✓" : "•"} Symbol ({PASSWORD_ALLOWED_SYMBOLS}) — no spaces
                  </span>
                </div>
                {touched.password && password && !pwVal.isValid && (
                  <p className="text-red-600 font-medium pt-1">⚠ {pwVal.error}</p>
                )}
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

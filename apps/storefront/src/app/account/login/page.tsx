"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

type LoginMode =
  | "password"
  | "otp_request"
  | "otp_verify"
  | "forgot_request"
  | "forgot_reset"
  | "verify_email";

function LoginContent() {
  const {
    isAuthenticated,
    authLoading,
    loginWithPassword,
    requestLoginOtp,
    verifyLoginOtp,
    verifyRegistrationEmail,
    requestPasswordReset,
    resetPasswordWithOtp,
  } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/account";

  const [mode, setMode] = useState<LoginMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(nextPath);
    }
  }, [authLoading, isAuthenticated, router, nextPath]);

  const clearAlerts = () => {
    setError("");
    setInfoMessage("");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!email.trim() || !password) {
      setError("Please enter both your email address and password.");
      return;
    }

    setBusy(true);
    const result = await loginWithPassword(email.trim(), password);
    setBusy(false);

    if (result.requiresVerification) {
      setMode("verify_email");
      setOtpCode("");
      setInfoMessage(
        result.error ||
          "Please enter the 6-digit verification code sent to your email address to activate your account."
      );
      return;
    }

    if (!result.success) {
      setError(result.error || "Sign in failed.");
      return;
    }

    router.push(nextPath);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }
    setBusy(true);
    const result = await requestLoginOtp(email.trim());
    setBusy(false);

    if (!result.success) {
      setError(result.error || "Could not send login code.");
      return;
    }

    setOtpCode("");
    setMode("otp_verify");
    setInfoMessage(
      result.message || "A 6-digit sign-in code has been sent to your email."
    );
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (otpCode.trim().length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    setBusy(true);
    const result = await verifyLoginOtp(email.trim(), otpCode.trim());
    setBusy(false);

    if (!result.success) {
      setError(result.error || "Invalid or expired code.");
      return;
    }

    router.push(nextPath);
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (otpCode.trim().length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    setBusy(true);
    const result = await verifyRegistrationEmail(email.trim(), otpCode.trim());
    setBusy(false);

    if (!result.success) {
      setError(result.error || "Verification failed.");
      return;
    }

    router.push(nextPath);
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }
    setBusy(true);
    const result = await requestPasswordReset(email.trim());
    setBusy(false);

    if (!result.success) {
      setError(result.error || "Unable to send reset code.");
      return;
    }

    setOtpCode("");
    setNewPassword("");
    setConfirmNewPassword("");
    setMode("forgot_reset");
    setInfoMessage(
      result.message || "If an account exists, a 6-digit reset code has been sent."
    );
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (otpCode.trim().length !== 6) {
      setError("Please enter the 6-digit reset code.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    setBusy(true);
    const result = await resetPasswordWithOtp(
      email.trim(),
      otpCode.trim(),
      newPassword
    );
    setBusy(false);

    if (!result.success) {
      setError(result.error || "Could not reset password.");
      return;
    }

    setPassword("");
    setOtpCode("");
    setMode("password");
    setInfoMessage("Password updated successfully. You may now sign in.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-6 py-16 lg:py-24">
        <div className="w-full max-w-md space-y-7 bg-[var(--color-ivory)]/80 border border-[var(--color-decorative-border)] rounded-2xl p-8 md:p-10 shadow-sm">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted-light)]">
              VDesign Client Concierge
            </span>
            <h1 className="text-3xl font-serif font-light tracking-tight text-[var(--color-ink)]">
              {mode === "forgot_request" || mode === "forgot_reset"
                ? "Reset Password"
                : mode === "verify_email"
                  ? "Verify Your Email"
                  : "Sign In to VDesign"}
            </h1>
            <p className="text-xs text-[var(--color-muted-light)]">
              Access your studio addresses, active fabrication milestones, and tax invoices.
            </p>
          </div>

          {(mode === "password" || mode === "otp_request" || mode === "otp_verify") && (
            <div className="grid grid-cols-2 rounded-full border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  clearAlerts();
                  setMode("password");
                }}
                className={`rounded-full py-2 font-semibold transition-colors ${
                  mode === "password"
                    ? "bg-[var(--color-ink)] text-[var(--color-canvas)]"
                    : "text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAlerts();
                  setMode("otp_request");
                }}
                className={`rounded-full py-2 font-semibold transition-colors ${
                  mode === "otp_request" || mode === "otp_verify"
                    ? "bg-[var(--color-ink)] text-[var(--color-canvas)]"
                    : "text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
                }`}
              >
                Email Code
              </button>
            </div>
          )}

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

          {mode === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@architecturalstudio.in"
                  className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      clearAlerts();
                      setMode("forgot_request");
                    }}
                    className="text-[11px] font-semibold text-[var(--color-bronze)] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-[var(--color-ink)] py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-60 transition-colors shadow-sm"
              >
                {busy ? "Signing In..." : "Sign In"}
              </button>
            </form>
          )}

          {mode === "otp_request" && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                  Registered Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@architecturalstudio.in"
                  className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                />
              </div>
              <p className="text-[11px] text-[var(--color-muted-light)] leading-relaxed">
                We will email a 6-digit single-use sign-in code valid for 15 minutes.
              </p>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-[var(--color-ink)] py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-60 transition-colors shadow-sm"
              >
                {busy ? "Sending Code..." : "Send 6-Digit Sign-In Code"}
              </button>
            </form>
          )}

          {mode === "otp_verify" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                  6-Digit Sign-In Code *
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
                {busy ? "Verifying..." : "Verify & Sign In"}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAlerts();
                  setMode("otp_request");
                }}
                className="w-full text-center text-xs text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
              >
                Use another email or resend code
              </button>
            </form>
          )}

          {mode === "verify_email" && (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-3 text-xs text-[var(--color-ink)]">
                Account: <span className="font-semibold">{email}</span>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                  6-Digit Verification Code *
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
                {busy ? "Activating Account..." : "Verify Email & Sign In"}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAlerts();
                  setMode("password");
                }}
                className="w-full text-center text-xs text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
              >
                Back to Password Sign In
              </button>
            </form>
          )}

          {mode === "forgot_request" && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                  Account Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@architecturalstudio.in"
                  className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-[var(--color-ink)] py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-60 transition-colors shadow-sm"
              >
                {busy ? "Sending Code..." : "Send Password Reset Code"}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAlerts();
                  setMode("password");
                }}
                className="w-full text-center text-xs text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {mode === "forgot_reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                  6-Digit Reset Code *
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
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-3 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-[var(--color-ink)] py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-60 transition-colors shadow-sm"
              >
                {busy ? "Updating Password..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAlerts();
                  setMode("password");
                }}
                className="w-full text-center text-xs text-[var(--color-muted-light)] hover:text-[var(--color-ink)]"
              >
                Cancel
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-[var(--color-decorative-border)] text-center space-y-2 text-xs text-[var(--color-muted-light)]">
            <p>
              New to VDesign?{" "}
              <Link href="/account/register" className="font-semibold text-[var(--color-ink)] hover:underline">
                Create a Client Account
              </Link>
            </p>
            <p>
              Placed a guest order?{" "}
              <Link href="/track" className="font-semibold text-[var(--color-bronze)] hover:underline">
                Track with Order ID & Contact
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-canvas)] text-xs text-[var(--color-muted-light)]">
          Loading sign-in portal...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

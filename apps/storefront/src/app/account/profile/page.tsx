"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import AccountNav from "@/components/AccountNav";
import { useAuth } from "@/context/AuthContext";
import {
  PASSWORD_ALLOWED_SYMBOLS,
  PASSWORD_MAX_LENGTH,
  validateGstin,
  validateIndianMobile,
  validateStrongPassword,
} from "@tavistra/shared";

export default function AccountProfilePage() {
  const {
    user,
    isAuthenticated,
    authLoading,
    updateProfile,
    changePassword,
    setupTotpMfa,
    verifyTotpMfa,
    requestEmailMfaSetup,
    verifyEmailMfaSetup,
    disableMfa,
  } = useAuth();

  // Profile form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [practiceOrStudio, setPracticeOrStudio] = useState("");
  const [gstin, setGstin] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // MFA setup & disable state
  const [mfaStep, setMfaStep] = useState<"idle" | "totp_qr" | "email_otp" | "disable">("idle");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpQrDataUrl, setTotpQrDataUrl] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [mfaBusy, setMfaBusy] = useState(false);
  const [mfaError, setMfaError] = useState("");
  const [mfaSuccess, setMfaSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setPracticeOrStudio(user.practiceOrStudio || "");
      setGstin(user.gstin || "");
    }
  }, [user]);

  const mobileVal = validateIndianMobile(phone);
  const gstinVal = validateGstin(gstin);
  const pwVal = validateStrongPassword(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (name.trim().length < 2) {
      setErrorMessage("Full name must be at least 2 characters.");
      return;
    }
    if (!mobileVal.isValid) {
      setErrorMessage(mobileVal.error || "Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (gstin.trim() && !gstinVal.isValid) {
      setErrorMessage(gstinVal.error || "Please enter a valid 15-character GSTIN.");
      return;
    }

    setSaving(true);
    const result = await updateProfile({
      name: name.trim(),
      phone: mobileVal.normalizedPhone || phone.trim(),
      practiceOrStudio: practiceOrStudio.trim(),
      gstin: gstinVal.normalizedGstin || "",
    });
    setSaving(false);

    if (!result.success) {
      setErrorMessage(result.error || "Unable to save profile changes.");
      return;
    }

    setSuccessMessage("Profile details and GST credentials saved.");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!currentPassword) {
      setPwError("Please enter your current password.");
      return;
    }
    if (!pwVal.isValid) {
      setPwError(pwVal.error || "New password does not meet security requirements.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    setPwBusy(true);
    const result = await changePassword(currentPassword, newPassword);
    setPwBusy(false);

    if (!result.success) {
      setPwError(result.error || "Could not update password.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPwSuccess(result.message || "Password updated cleanly.");
  };

  const handleStartTotp = async () => {
    setMfaError("");
    setMfaSuccess("");
    setMfaBusy(true);
    const res = await setupTotpMfa();
    setMfaBusy(false);

    if (!res.success || !res.qrDataUrl || !res.secret) {
      setMfaError(res.error || "Unable to initialize authenticator setup.");
      return;
    }

    setTotpSecret(res.secret);
    setTotpQrDataUrl(res.qrDataUrl);
    setMfaCode("");
    setMfaStep("totp_qr");
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError("");
    setMfaSuccess("");
    setMfaBusy(true);
    const res = await verifyTotpMfa(mfaCode.trim());
    setMfaBusy(false);

    if (!res.success) {
      setMfaError(res.error || "Invalid authenticator code.");
      return;
    }

    setMfaStep("idle");
    setMfaCode("");
    setTotpQrDataUrl("");
    setTotpSecret("");
    setMfaSuccess(res.message || "Authenticator App MFA enabled.");
  };

  const handleStartEmailMfa = async () => {
    setMfaError("");
    setMfaSuccess("");
    setMfaBusy(true);
    const res = await requestEmailMfaSetup();
    setMfaBusy(false);

    if (!res.success) {
      setMfaError(res.error || "Could not dispatch setup verification code.");
      return;
    }

    setMfaCode("");
    setMfaStep("email_otp");
    setMfaSuccess(res.message || "Confirmation code sent to your email.");
  };

  const handleVerifyEmailMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError("");
    setMfaBusy(true);
    const res = await verifyEmailMfaSetup(mfaCode.trim());
    setMfaBusy(false);

    if (!res.success) {
      setMfaError(res.error || "Invalid confirmation code.");
      return;
    }

    setMfaStep("idle");
    setMfaCode("");
    setMfaSuccess(res.message || "Email MFA enabled.");
  };

  const handleDisableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError("");
    setMfaBusy(true);
    const res = await disableMfa(disablePassword);
    setMfaBusy(false);

    if (!res.success) {
      setMfaError(res.error || "Could not disable MFA.");
      return;
    }

    setDisablePassword("");
    setMfaStep("idle");
    setMfaSuccess(res.message || "Multi-Factor Authentication disabled.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)]">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-12 lg:py-16">
        {authLoading ? (
          <div className="py-24 text-center text-xs text-[var(--color-muted-light)]">
            Loading your Tavistra client profile...
          </div>
        ) : !isAuthenticated ? (
          <div className="mx-auto max-w-md text-center space-y-6 py-16">
            <h1 className="text-3xl font-serif font-light text-[var(--color-ink)]">
              Sign in to manage your profile
            </h1>
            <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
              Sign in to manage your contact details, GSTIN invoicing credentials, password, and two-factor authentication.
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
                  Identity, Invoicing &amp; Security
                </span>
                <h1 className="text-3xl font-serif font-light text-[var(--color-ink)]">
                  Profile, Password &amp; MFA
                </h1>
              </div>

              {/* Section 1: Identity & GSTIN */}
              <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/60 p-8 shadow-sm">
                <h2 className="text-lg font-serif text-[var(--color-ink)] mb-5">
                  Client Identity &amp; GSTIN Credentials
                </h2>
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
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                          Mobile / WhatsApp *
                        </label>
                        {phone && mobileVal.isValid && (
                          <span className="text-[10px] font-semibold text-emerald-700">✓ Valid Indian Mobile</span>
                        )}
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm font-mono text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                      />
                      {phone && !mobileVal.isValid && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">
                          ⚠ {mobileVal.error}
                        </p>
                      )}
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
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                          GSTIN (B2B Tax Invoices)
                        </label>
                        {gstin.trim() && gstinVal.isValid && (
                          <span className="text-[10px] font-semibold text-emerald-700">✓ Verified GSTIN</span>
                        )}
                      </div>
                      <input
                        type="text"
                        maxLength={15}
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, ""))}
                        placeholder="15-character registered GSTIN"
                        className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm font-mono text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                      />
                      {gstin.trim() && !gstinVal.isValid && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">
                          ⚠ {gstinVal.error}
                        </p>
                      )}
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

              {/* Section 2: Change Password */}
              <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/60 p-8 shadow-sm">
                <div className="space-y-1 mb-5">
                  <h2 className="text-lg font-serif text-[var(--color-ink)]">
                    Change Account Password
                  </h2>
                  <p className="text-xs text-[var(--color-muted-light)]">
                    Updating your password preserves this session and automatically signs out other devices.
                  </p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                        New Password (8–15 Chars) *
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        maxLength={PASSWORD_MAX_LENGTH}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New strong password"
                        className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
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
                        maxLength={PASSWORD_MAX_LENGTH}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-3.5 grid grid-cols-2 gap-1.5 text-[11px]">
                    <span className={pwVal.checks.length ? "text-emerald-700 font-medium" : "text-[var(--color-muted-light)]"}>
                      {pwVal.checks.length ? "✓" : "•"} 8–15 characters
                    </span>
                    <span className={pwVal.checks.uppercase ? "text-emerald-700 font-medium" : "text-[var(--color-muted-light)]"}>
                      {pwVal.checks.uppercase ? "✓" : "•"} Uppercase letter
                    </span>
                    <span className={pwVal.checks.lowercase ? "text-emerald-700 font-medium" : "text-[var(--color-muted-light)]"}>
                      {pwVal.checks.lowercase ? "✓" : "•"} Lowercase letter
                    </span>
                    <span className={pwVal.checks.number ? "text-emerald-700 font-medium" : "text-[var(--color-muted-light)]"}>
                      {pwVal.checks.number ? "✓" : "•"} Number (0–9)
                    </span>
                    <span className={`col-span-2 ${pwVal.checks.symbol && pwVal.checks.allowedCharsOnly ? "text-emerald-700 font-medium" : "text-[var(--color-muted-light)]"}`}>
                      {pwVal.checks.symbol && pwVal.checks.allowedCharsOnly ? "✓" : "•"} Allowed symbol ({PASSWORD_ALLOWED_SYMBOLS}) — no spaces
                    </span>
                  </div>

                  {pwError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 font-medium">
                      {pwError}
                    </div>
                  )}

                  {pwSuccess && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 font-medium">
                      {pwSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={pwBusy}
                    className="rounded-full bg-[var(--color-ink)] px-7 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-60 transition-colors shadow-sm"
                  >
                    {pwBusy ? "Updating Password..." : "Update Password"}
                  </button>
                </form>
              </div>

              {/* Section 3: Multi-Factor Authentication */}
              <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/60 p-8 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="text-lg font-serif text-[var(--color-ink)]">
                      Multi-Factor Authentication (MFA)
                    </h2>
                    <p className="text-xs text-[var(--color-muted-light)]">
                      Require a 6-digit security code via Authenticator App or Email OTP during sign-in.
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider border ${
                      user?.mfaEnabled
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-stone-100 text-[var(--color-muted-light)] border-[var(--color-decorative-border)]"
                    }`}
                  >
                    {user?.mfaEnabled
                      ? `Active · ${user.mfaMethod === "TOTP" ? "Authenticator App" : "Email OTP"}`
                      : "MFA Not Enabled"}
                  </span>
                </div>

                {mfaError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 font-medium">
                    {mfaError}
                  </div>
                )}

                {mfaSuccess && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 font-medium">
                    {mfaSuccess}
                  </div>
                )}

                {mfaStep === "idle" && (
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={mfaBusy}
                      onClick={handleStartTotp}
                      className="rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-60"
                    >
                      {user?.mfaEnabled && user.mfaMethod === "TOTP"
                        ? "Reconfigure Authenticator App"
                        : "Use Authenticator App (TOTP)"}
                    </button>
                    <button
                      type="button"
                      disabled={mfaBusy}
                      onClick={handleStartEmailMfa}
                      className="rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-6 py-2.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] disabled:opacity-60"
                    >
                      {user?.mfaEnabled && user.mfaMethod === "EMAIL"
                        ? "Email MFA Active"
                        : "Use Email Verification MFA"}
                    </button>
                    {user?.mfaEnabled && (
                      <button
                        type="button"
                        disabled={mfaBusy}
                        onClick={() => {
                          setMfaError("");
                          setMfaStep("disable");
                        }}
                        className="rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        Disable MFA
                      </button>
                    )}
                  </div>
                )}

                {mfaStep === "totp_qr" && (
                  <div className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-6 space-y-5 max-w-xl">
                    <div className="flex flex-col sm:flex-row gap-6 items-center">
                      {totpQrDataUrl && (
                        <img
                          src={totpQrDataUrl}
                          alt="Scan QR Code in Google Authenticator or Authy"
                          className="h-44 w-44 rounded-xl border border-[var(--color-decorative-border)] p-2 bg-[#faf9f6]"
                        />
                      )}
                      <div className="space-y-2 text-xs">
                        <p className="font-semibold text-[var(--color-ink)]">
                          Scan this QR code in Google Authenticator, Authy, or Microsoft Authenticator
                        </p>
                        <p className="text-[var(--color-muted-light)] leading-relaxed">
                          If your device cannot scan the QR image, enter this manual setup key:
                        </p>
                        <div className="rounded-lg bg-[var(--color-ivory)] border border-[var(--color-decorative-border)] px-3 py-2 font-mono text-[11px] break-all text-[var(--color-ink)] select-all">
                          {totpSecret}
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleVerifyTotp} className="space-y-3">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                        Enter 6-Digit Code Shown in App *
                      </label>
                      <div className="flex flex-wrap gap-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          required
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="000000"
                          className="w-40 rounded-xl border border-[var(--color-control-border)] bg-[var(--color-ivory)] px-4 py-2.5 text-center font-mono text-base tracking-[0.3em] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                        />
                        <button
                          type="submit"
                          disabled={mfaBusy || mfaCode.length !== 6}
                          className="rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-60"
                        >
                          {mfaBusy ? "Verifying..." : "Verify & Enable Authenticator MFA"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setMfaStep("idle")}
                          className="text-xs text-[var(--color-muted-light)] hover:text-[var(--color-ink)] px-3"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {mfaStep === "email_otp" && (
                  <form
                    onSubmit={handleVerifyEmailMfa}
                    className="rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-6 space-y-4 max-w-lg"
                  >
                    <p className="text-xs text-[var(--color-ink)]">
                      Enter the 6-digit confirmation code dispatched to <strong>{user?.email}</strong> to activate Email MFA.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        className="w-40 rounded-xl border border-[var(--color-control-border)] bg-[var(--color-ivory)] px-4 py-2.5 text-center font-mono text-base tracking-[0.3em] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                      />
                      <button
                        type="submit"
                        disabled={mfaBusy || mfaCode.length !== 6}
                        className="rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] disabled:opacity-60"
                      >
                        {mfaBusy ? "Activating..." : "Confirm & Enable Email MFA"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMfaStep("idle")}
                        className="text-xs text-[var(--color-muted-light)] hover:text-[var(--color-ink)] px-3"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {mfaStep === "disable" && (
                  <form
                    onSubmit={handleDisableMfa}
                    className="rounded-xl border border-red-200 bg-[var(--color-canvas)] p-6 space-y-4 max-w-lg"
                  >
                    <p className="text-xs text-[var(--color-ink)] font-medium">
                      Confirm your current password to disable two-factor authentication on your Tavistra account.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <input
                        type="password"
                        required
                        value={disablePassword}
                        onChange={(e) => setDisablePassword(e.target.value)}
                        placeholder="Current password"
                        className="flex-1 min-w-48 rounded-xl border border-[var(--color-control-border)] bg-[var(--color-ivory)] px-4 py-2.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                      />
                      <button
                        type="submit"
                        disabled={mfaBusy}
                        className="rounded-full bg-red-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        {mfaBusy ? "Disabling..." : "Confirm Disable MFA"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMfaStep("idle")}
                        className="text-xs text-[var(--color-muted-light)] hover:text-[var(--color-ink)] px-3"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

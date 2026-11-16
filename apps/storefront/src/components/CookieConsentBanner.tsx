"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCookieConsent } from "@/context/CookieConsentContext";

export function CookieConsentBanner() {
  const {
    consent,
    isBannerOpen,
    isSettingsModalOpen,
    acceptAll,
    rejectNonEssential,
    saveCustomPreferences,
    openSettingsModal,
    closeSettingsModal,
  } = useCookieConsent();

  // Local draft states for modal
  const [analyticsDraft, setAnalyticsDraft] = useState(consent.analytics);
  const [marketingDraft, setMarketingDraft] = useState(consent.marketing);

  const handleOpenModal = () => {
    setAnalyticsDraft(consent.analytics);
    setMarketingDraft(consent.marketing);
    openSettingsModal();
  };

  const handleSaveModal = () => {
    saveCustomPreferences({
      analytics: analyticsDraft,
      marketing: marketingDraft,
    });
  };

  return (
    <>
      {/* 1. First-Visit Cookie Banner */}
      {isBannerOpen && (
        <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-black/30 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="mx-auto max-w-5xl rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 pr-0 md:pr-6">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-bronze)] animate-pulse" />
                  <span className="text-xs uppercase font-bold tracking-wider text-[var(--color-ink)]">
                    Cookie &amp; Privacy Preferences
                  </span>
                </div>
                <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
                  We use cookies to maintain your shopping cart, secure authentication, and verify fraud protection.
                  With your consent, we also use performance cookies (Google Analytics) and marketing tags (Pinterest) to measure site interaction. Trackers remain inactive until you choose to accept.
                </p>
                <div className="pt-1 text-[11px] text-[var(--color-muted-light)]">
                  Read our full{" "}
                  <Link href="/privacy" className="font-medium underline hover:text-[var(--color-ink)]">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/terms" className="font-medium underline hover:text-[var(--color-ink)]">
                    Terms of Service
                  </Link>
                  .
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="rounded-full border border-[var(--color-control-border)] bg-[var(--color-ivory)] px-4 py-2.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors text-center"
                >
                  Cookie Settings
                </button>
                <button
                  type="button"
                  onClick={rejectNonEssential}
                  className="rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors text-center"
                >
                  Reject Non-Essential
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm text-center"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Detailed Cookie Preference Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-decorative-border)] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-bronze)]">
                  Privacy Center
                </span>
                <h3 className="font-editorial text-2xl text-[var(--color-ink)]">
                  Cookie Preferences &amp; Data Control
                </h3>
              </div>
              <button
                type="button"
                onClick={closeSettingsModal}
                className="rounded-full p-2 text-[var(--color-muted-light)] hover:text-[var(--color-ink)] transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
              Tailor your cookie settings below. Essential cookies are required for core storefront operation,
              while analytics and marketing cookies help us optimize our catalogue and understand customer preferences.
            </p>

            {/* Category Cards */}
            <div className="space-y-4">
              {/* Category 1: Strictly Necessary */}
              <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/70 p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--color-ink)]">
                      Strictly Necessary Cookies
                    </span>
                    <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
                      Always Active
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700">Required</span>
                </div>
                <p className="text-[11px] text-[var(--color-muted-light)] leading-relaxed">
                  Essential for website security, CSRF validation, shopping bag persistence, delivery address handling, and client authentication. Cannot be switched off.
                </p>
              </div>

              {/* Category 2: Performance & Analytics */}
              <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[var(--color-ink)] block">
                      Analytics &amp; Performance (Google Analytics / GTM)
                    </span>
                    <span className="text-[10px] text-[var(--color-muted-light)]">
                      Measures traffic volume, page load performance, and popular catalogue items.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={analyticsDraft}
                      onChange={(e) => setAnalyticsDraft(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-ink)]"></div>
                  </label>
                </div>
              </div>

              {/* Category 3: Marketing & Social */}
              <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[var(--color-ink)] block">
                      Marketing &amp; Social Pixels (Pinterest)
                    </span>
                    <span className="text-[10px] text-[var(--color-muted-light)]">
                      Connects domain verification and visual board engagement with Pinterest.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={marketingDraft}
                      onChange={(e) => setMarketingDraft(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-ink)]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-[var(--color-decorative-border)]">
              <button
                type="button"
                onClick={closeSettingsModal}
                className="flex-1 rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] py-3 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="flex-1 rounded-full bg-[var(--color-ink)] py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors text-center shadow-sm"
              >
                Save My Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

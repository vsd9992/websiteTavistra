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
    closeBanner,
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

  const handleAcceptAllFromModal = () => {
    setAnalyticsDraft(true);
    setMarketingDraft(true);
    acceptAll();
  };

  const handleRejectAllFromModal = () => {
    setAnalyticsDraft(false);
    setMarketingDraft(false);
    rejectNonEssential();
  };

  return (
    <>
      {/* 1. Initial Floating Popup Card (Bottom-Left) */}
      {isBannerOpen && !isSettingsModalOpen && (
        <aside
          role="dialog"
          aria-label="Cookie & Privacy Choices"
          className="fixed bottom-5 left-5 z-50 w-[calc(100vw-2.5rem)] sm:w-[420px] rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)]/98 p-5 shadow-2xl backdrop-blur-md animate-fade-in space-y-3.5 pointer-events-auto"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--color-bronze)] animate-pulse" />
              <span className="text-xs uppercase font-bold tracking-wider text-[var(--color-ink)]">
                Cookie &amp; Privacy Choices
              </span>
            </div>
            <button
              type="button"
              onClick={closeBanner}
              className="text-[var(--color-muted-light)] hover:text-[var(--color-ink)] p-1 rounded transition-colors text-sm"
              title="Dismiss for now"
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
            We use essential cookies to secure your shopping cart and enable checkout. With your consent, we also use performance and marketing cookies to measure interactions and refine our offerings. Trackers remain inactive until you choose to accept.
          </p>

          <div className="text-[11px] text-[var(--color-muted-light)]">
            Read our{" "}
            <Link href="/privacy" className="font-medium underline hover:text-[var(--color-ink)]">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="font-medium underline hover:text-[var(--color-ink)]">
              Terms of Service
            </Link>
            .
          </div>

          {/* Quick Buttons */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={rejectNonEssential}
                className="rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-3 py-2 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors text-center"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-full bg-[var(--color-ink)] px-3 py-2 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors shadow-sm text-center"
              >
                Accept All
              </button>
            </div>
            <button
              type="button"
              onClick={handleOpenModal}
              className="w-full text-center py-1.5 text-[11px] font-semibold text-[var(--color-bronze)] hover:text-[var(--color-ink)] underline transition-colors"
            >
              Customize Preferences &amp; Details →
            </button>
          </div>
        </aside>
      )}

      {/* 2. Persistent Floating Trigger Button (Bottom-Left) */}
      {!isBannerOpen && !isSettingsModalOpen && (
        <button
          type="button"
          onClick={handleOpenModal}
          className="fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full border border-[var(--color-decorative-border)] bg-[var(--color-canvas)]/95 px-3 py-2 text-xs font-medium text-[var(--color-ink)] shadow-lg backdrop-blur-md hover:bg-[var(--color-ivory)] hover:border-[var(--color-ink)] transition-all group cursor-pointer"
          title="Cookie & Privacy Settings"
          aria-label="Cookie & Privacy Settings"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-stone)] text-[var(--color-bronze)] group-hover:bg-[var(--color-bronze)] group-hover:text-[var(--color-canvas)] transition-colors">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </span>
          <span className="hidden sm:inline text-[11px] font-semibold tracking-wide text-[var(--color-ink)]">
            Cookie Preferences
          </span>
        </button>
      )}

      {/* 3. Detailed Cookie Preference Settings Modal */}
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
              while performance and marketing cookies help us optimize our catalogue and understand customer preferences.
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
                  Essential for website security, bot prevention, shopping bag persistence, delivery estimation, and client authentication. Cannot be switched off.
                </p>
              </div>

              {/* Category 2: Performance & Analytics */}
              <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[var(--color-ink)] block">
                      Performance &amp; Analytics Cookies
                    </span>
                    <span className="text-[10px] text-[var(--color-muted-light)]">
                      Collects anonymous traffic metrics, page load speeds, and popular catalogue interactions to optimize performance.
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

              {/* Category 3: Marketing & Personalization */}
              <div className="rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[var(--color-ink)] block">
                      Marketing &amp; Personalization Cookies
                    </span>
                    <span className="text-[10px] text-[var(--color-muted-light)]">
                      Enables personalized recommendations, visual inspiration features, and external campaign attribution.
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
                onClick={handleRejectAllFromModal}
                className="flex-1 rounded-full border border-[var(--color-control-border)] bg-[var(--color-canvas)] py-3 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors text-center"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={handleAcceptAllFromModal}
                className="flex-1 rounded-full border border-[var(--color-control-border)] bg-[var(--color-ivory)] py-3 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors text-center"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="flex-1 rounded-full bg-[var(--color-ink)] py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors text-center shadow-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

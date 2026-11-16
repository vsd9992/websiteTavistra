"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieConsentContextType {
  consent: CookiePreferences;
  hasChosen: boolean;
  isBannerOpen: boolean;
  isSettingsModalOpen: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  saveCustomPreferences: (prefs: { analytics: boolean; marketing: boolean }) => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
}

const STORAGE_KEY = "tavistra_cookie_consent_v1";

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

const CookieConsentContext = createContext<CookieConsentContextType>({
  consent: DEFAULT_PREFERENCES,
  hasChosen: false,
  isBannerOpen: false,
  isSettingsModalOpen: false,
  acceptAll: () => {},
  rejectNonEssential: () => {},
  saveCustomPreferences: () => {},
  openSettingsModal: () => {},
  closeSettingsModal: () => {},
});

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [hasChosen, setHasChosen] = useState(false);
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Read stored preferences on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConsent({
          necessary: true,
          analytics: Boolean(parsed.analytics),
          marketing: Boolean(parsed.marketing),
        });
        setHasChosen(true);
        setIsBannerOpen(false);
      } else {
        // First visit: Show banner, DO NOT enable tracking
        setIsBannerOpen(true);
      }
    } catch {
      setIsBannerOpen(true);
    }

    const handleOpenSettings = () => {
      setIsSettingsModalOpen(true);
    };
    window.addEventListener("open-cookie-settings", handleOpenSettings);
    return () => {
      window.removeEventListener("open-cookie-settings", handleOpenSettings);
    };
  }, []);

  // Dynamically load Google Tag Manager / Google Analytics ONLY when analytics consent is granted
  useEffect(() => {
    if (!consent.analytics || typeof window === "undefined") return;

    const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-53L7GLXK";

    // Prevent duplicate injection
    if (document.getElementById("gtm-script")) return;

    const dl = (window.dataLayer = window.dataLayer || []);
    window.gtag = function (...args: any[]) {
      dl.push(args);
    };
    window.gtag("js", new Date());

    const script = document.createElement("script");
    script.id = "gtm-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
    document.head.appendChild(script);
  }, [consent.analytics]);

  const saveToStorage = (newConsent: CookiePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConsent));
      document.cookie = `tavistra_consent=${JSON.stringify(newConsent)}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (err) {
      console.warn("Unable to save cookie preferences:", err);
    }
    setConsent(newConsent);
    setHasChosen(true);
    setIsBannerOpen(false);
    setIsSettingsModalOpen(false);
  };

  const acceptAll = () => {
    saveToStorage({ necessary: true, analytics: true, marketing: true });
  };

  const rejectNonEssential = () => {
    saveToStorage({ necessary: true, analytics: false, marketing: false });
  };

  const saveCustomPreferences = (prefs: { analytics: boolean; marketing: boolean }) => {
    saveToStorage({
      necessary: true,
      analytics: Boolean(prefs.analytics),
      marketing: Boolean(prefs.marketing),
    });
  };

  const openSettingsModal = () => {
    setIsSettingsModalOpen(true);
  };

  const closeSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        hasChosen,
        isBannerOpen,
        isSettingsModalOpen,
        acceptAll,
        rejectNonEssential,
        saveCustomPreferences,
        openSettingsModal,
        closeSettingsModal,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  return useContext(CookieConsentContext);
}

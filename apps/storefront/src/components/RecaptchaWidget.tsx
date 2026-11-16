"use client";

import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement | string,
        parameters: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark";
          size?: "normal" | "compact";
        }
      ) => number;
      reset: (opt_widget_id?: number) => void;
      getResponse: (opt_widget_id?: number) => string;
      ready: (callback: () => void) => void;
    };
    onTavistraRecaptchaLoad?: () => void;
  }
}

interface RecaptchaWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  theme?: "light" | "dark";
}

export function RecaptchaWidget({ onVerify, onExpire, theme = "light" }: RecaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const siteKey =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6Ld7wxkuAAAAAHX2z5sIxV3FuXGrqBT-CZ7BtA2N";

  useEffect(() => {
    // If reCAPTCHA script is already loaded
    if (typeof window !== "undefined" && window.grecaptcha && typeof window.grecaptcha.render === "function") {
      setLoaded(true);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.getElementById("google-recaptcha-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-recaptcha-script";
      script.src = "https://www.google.com/recaptcha/api.js?onload=onTavistraRecaptchaLoad&render=explicit";
      script.async = true;
      script.defer = true;
      script.onerror = () => setLoadError(true);

      window.onTavistraRecaptchaLoad = () => {
        setLoaded(true);
      };

      document.head.appendChild(script);
    } else {
      window.onTavistraRecaptchaLoad = () => {
        setLoaded(true);
      };
    }
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current || !window.grecaptcha || widgetIdRef.current !== null) {
      return;
    }

    try {
      window.grecaptcha.ready(() => {
        if (!containerRef.current) return;
        // Clear previous container contents before rendering
        containerRef.current.innerHTML = "";
        const id = window.grecaptcha!.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            onVerify(token);
          },
          "expired-callback": () => {
            if (onExpire) onExpire();
          },
          "error-callback": () => {
            console.warn("[reCAPTCHA] Encountered challenge error.");
          },
          theme,
          size: "normal",
        });
        widgetIdRef.current = id;
      });
    } catch (err) {
      console.warn("[reCAPTCHA] Render warning:", err);
    }
  }, [loaded, siteKey, onVerify, onExpire, theme]);

  if (loadError) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        Security verification service is unreachable. You may proceed; server security checks remain active.
      </div>
    );
  }

  return (
    <div className="py-2 flex flex-col items-start gap-1">
      <div ref={containerRef} className="min-h-[78px] flex items-center" />
      <span className="text-[10px] text-[var(--color-muted-light)]">
        Protected by Google reCAPTCHA ·{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Privacy
        </a>{" "}
        &amp;{" "}
        <a
          href="https://policies.google.com/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Terms
        </a>
      </span>
    </div>
  );
}

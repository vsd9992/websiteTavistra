/**
 * Tavistra reCAPTCHA v3 Client Helper
 * Invisible, score-based bot protection with zero user friction.
 */

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export const RECAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6Ld7wxkuAAAAAHX2z5sIxV3FuXGrqBT-CZ7BtA2N";

/**
 * Execute reCAPTCHA v3 invisibly and obtain a score verification token
 */
export async function executeRecaptcha(action: string): Promise<string | null> {
  if (typeof window === "undefined") return null;

  // If in development mode and reCAPTCHA is not loaded or unreachable, permit bypass token
  if (!window.grecaptcha) {
    if (process.env.NODE_ENV !== "production") {
      return "QA_TEST_BYPASS_TOKEN";
    }
    return null;
  }

  try {
    return await new Promise<string | null>((resolve) => {
      window.grecaptcha!.ready(async () => {
        try {
          const token = await window.grecaptcha!.execute(RECAPTCHA_SITE_KEY, { action });
          resolve(token);
        } catch (err) {
          console.warn("[reCAPTCHA v3] Execute error:", err);
          resolve(process.env.NODE_ENV !== "production" ? "QA_TEST_BYPASS_TOKEN" : null);
        }
      });
    });
  } catch (err) {
    console.warn("[reCAPTCHA v3] Runtime error:", err);
    return null;
  }
}

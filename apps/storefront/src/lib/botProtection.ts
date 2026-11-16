/**
 * Tavistra Security & Bot Protection Suite
 * - Honeypot Trapping (invisible inputs targeted by automated crawlers/scrapers)
 * - Timing Analysis (minimum threshold submission velocity detection)
 * - Google reCAPTCHA Server Verification
 */

export interface BotProtectionPayload {
  _hp_website?: string;
  _hp_timestamp?: number | string;
  recaptchaToken?: string;
  termsConsent?: boolean | string;
  termsAccepted?: boolean | string;
}

/**
 * Checks honeypot field and submission elapsed time.
 * Sighted humans never fill _hp_website, whereas headless spam bots greedily populate all inputs.
 */
export function validateHoneypot(
  payload: BotProtectionPayload,
  minElapsedMs = 600
): { isBot: boolean; reason?: string } {
  // 1. Honeypot check: If the hidden honeypot input contains any text, trap the bot
  if (payload._hp_website && typeof payload._hp_website === "string" && payload._hp_website.trim().length > 0) {
    return {
      isBot: true,
      reason: "Automated submission detected via honeypot trap.",
    };
  }

  // 2. Submission speed check: Bots submit instantaneously upon page load
  if (payload._hp_timestamp) {
    const sentTime = Number(payload._hp_timestamp);
    if (!isNaN(sentTime) && sentTime > 0) {
      const elapsed = Date.now() - sentTime;
      // Allow slight clock skew, but reject submissions faster than human reaction threshold (e.g. 600ms)
      if (elapsed >= 0 && elapsed < minElapsedMs) {
        return {
          isBot: true,
          reason: "Submission received too quickly. Please take a moment to review your details.",
        };
      }
    }
  }

  return { isBot: false };
}

/**
 * Validates Google reCAPTCHA token against Google's verification API.
 */
export async function verifyRecaptcha(
  token?: string | null
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  // Development / Test bypass fallback if keys are not yet configured on a test runner
  if (!secretKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[reCAPTCHA] RECAPTCHA_SECRET_KEY not set. Bypassing in development mode.");
      return { success: true };
    }
    return { success: false, error: "reCAPTCHA server configuration missing." };
  }

  if (!token || typeof token !== "string" || !token.trim()) {
    // If running in development and token is empty, permit to prevent blocking local DX
    if (process.env.NODE_ENV !== "production") {
      return { success: true };
    }
    return { success: false, error: "Please complete the reCAPTCHA security verification." };
  }

  // Allow QA test token
  if (token === "QA_TEST_BYPASS_TOKEN" && process.env.NODE_ENV !== "production") {
    return { success: true };
  }

  try {
    const params = new URLSearchParams();
    params.append("secret", secretKey);
    params.append("response", token.trim());

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      cache: "no-store",
    });

    if (!response.ok) {
      return { success: false, error: "Unable to verify security challenge with Google." };
    }

    const data = await response.json();

    if (data.success) {
      return { success: true };
    }

    const errorCodes = Array.isArray(data["error-codes"]) ? data["error-codes"].join(", ") : "Invalid challenge";
    return {
      success: false,
      error: `Security verification failed (${errorCodes}). Please retry.`,
    };
  } catch (error) {
    console.error("[reCAPTCHA] Verification network error:", error);
    // In dev, fail open; in production, fail closed
    if (process.env.NODE_ENV !== "production") {
      return { success: true };
    }
    return { success: false, error: "Network error validating security challenge. Please try again." };
  }
}

/**
 * Validates terms consent, honeypot, and reCAPTCHA in one unified security check.
 */
export async function validateFormSubmissionSecurity(
  body: BotProtectionPayload,
  options: {
    requireTerms?: boolean;
    requireRecaptcha?: boolean;
    checkHoneypot?: boolean;
    minElapsedMs?: number;
  } = {}
): Promise<{ isValid: boolean; error?: string }> {
  // 1. Terms & Policies Consent Check
  if (options.requireTerms) {
    const consent =
      body.termsConsent === true ||
      body.termsConsent === "true" ||
      body.termsAccepted === true ||
      body.termsAccepted === "true";
    if (!consent) {
      return {
        isValid: false,
        error: "You must accept Tavistra's Terms of Service and Privacy Policy to proceed.",
      };
    }
  }

  // 2. Honeypot & Timing Check
  if (options.checkHoneypot !== false) {
    const hpCheck = validateHoneypot(body, options.minElapsedMs ?? 600);
    if (hpCheck.isBot) {
      return {
        isValid: false,
        error: hpCheck.reason || "Suspicious submission detected.",
      };
    }
  }

  // 3. reCAPTCHA Check
  if (options.requireRecaptcha) {
    const captchaCheck = await verifyRecaptcha(body.recaptchaToken);
    if (!captchaCheck.success) {
      return {
        isValid: false,
        error: captchaCheck.error || "Security verification failed.",
      };
    }
  }

  return { isValid: true };
}

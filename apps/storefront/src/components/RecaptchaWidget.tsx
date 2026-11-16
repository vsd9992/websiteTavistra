"use client";

import React from "react";

interface RecaptchaAttributionProps {
  className?: string;
}

/**
 * Standard legal attribution text required by Google when reCAPTCHA v3 badge is hidden.
 */
export function RecaptchaWidget({ className = "" }: RecaptchaAttributionProps) {
  return (
    <p className={`text-[10px] text-[var(--color-muted-light)] leading-tight ${className}`}>
      This site is protected by reCAPTCHA and the Google{" "}
      <a
        href="https://policies.google.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-[var(--color-ink)]"
      >
        Privacy Policy
      </a>{" "}
      and{" "}
      <a
        href="https://policies.google.com/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-[var(--color-ink)]"
      >
        Terms of Service
      </a>{" "}
      apply.
    </p>
  );
}

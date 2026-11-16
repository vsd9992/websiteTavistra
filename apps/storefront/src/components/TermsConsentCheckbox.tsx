"use client";

import React from "react";
import Link from "next/link";

interface TermsConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  labelContext?: string;
  className?: string;
}

export function TermsConsentCheckbox({
  checked,
  onChange,
  labelContext,
  className = "",
}: TermsConsentCheckboxProps) {
  return (
    <div className={`rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)]/50 p-3.5 ${className}`}>
      <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
        <input
          type="checkbox"
          required
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-[var(--color-control-border)] accent-[var(--color-ink)] cursor-pointer shrink-0"
        />
        <span className="text-[var(--color-ink)] leading-snug">
          I have read and agree to Tavistra&apos;s{" "}
          <Link
            href="/terms"
            target="_blank"
            className="font-semibold text-[var(--color-bronze)] underline hover:text-[var(--color-ink)]"
          >
            Terms of Service
          </Link>
          {" "}and{" "}
          <Link
            href="/privacy"
            target="_blank"
            className="font-semibold text-[var(--color-bronze)] underline hover:text-[var(--color-ink)]"
          >
            Privacy Policy
          </Link>
          {labelContext ? ` for ${labelContext}` : ""}.
        </span>
      </label>
    </div>
  );
}

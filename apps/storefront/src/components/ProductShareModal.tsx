"use client";

import React, { useState, useEffect } from "react";

interface ProductShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    title: string;
    slug: string;
    sku?: string;
    categoryName?: string;
  };
}

export function ProductShareModal({
  isOpen,
  onClose,
  product,
}: ProductShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanNativeShare(true);
    }
  }, []);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!isOpen) return null;

  const currentUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/product/${product.slug}`
      : `https://tavistra.com/product/${product.slug}`;

  const shareText = `Discover the ${product.title} architectural edition by Tavistra:`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const input = document.createElement("input");
        input.value = currentUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
    } catch (err) {
      console.warn("Failed to copy link:", err);
    }
  };

  const handleWhatsAppShare = () => {
    const message = `${shareText} ${currentUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.title} — Tavistra`,
          text: shareText,
          url: currentUrl,
        });
        onClose();
      } catch (err) {
        // User cancelled or share failed
      }
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`${product.title} | Tavistra Architectural Hardware`);
    const body = encodeURIComponent(
      `Hello,\n\nI wanted to share this architectural edition from Tavistra with you:\n\n${product.title}\n${currentUrl}\n\nTavistra — Architectural Hardware & Fine Castings`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share Architectural Edition"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--color-decorative-border)] bg-[var(--color-ivory)] p-6 sm:p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted-light)]">
              Share Edition
            </span>
            <h3 className="text-xl font-serif text-[var(--color-ink)]">
              {product.title}
            </h3>
            {product.sku && (
              <p className="text-[10px] font-mono text-[var(--color-muted-light)]">
                SKU: {product.sku}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--color-stone)] text-[var(--color-muted-light)] hover:text-[var(--color-ink)] transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-1 gap-2.5">
          {/* WhatsApp */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center gap-3.5 w-full rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-3 text-left hover:border-emerald-600/50 hover:bg-emerald-50/30 transition-all group"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 2C6.495 2 2 6.494 2 12.029c0 1.94.555 3.754 1.517 5.289L2.001 22l4.839-1.488A9.97 9.97 0 0012.031 22c5.536 0 10.03-4.495 10.03-10.029 0-5.536-4.494-10.03-10.03-10.03zm5.82 14.288c-.244.686-1.42 1.309-1.954 1.365-.494.053-1.127.085-3.342-.832-2.316-.957-3.805-3.31-3.921-3.465-.116-.154-.937-1.246-.937-2.378 0-1.131.593-1.687.805-1.919.212-.232.463-.29.617-.29.155 0 .31.002.444.01.144.007.337-.054.526.401.193.463.657 1.602.715 1.718.058.116.096.252.019.405-.077.155-.116.252-.232.387-.116.136-.244.303-.349.407-.116.116-.238.242-.102.474.136.233.603.996 1.294 1.611.89.792 1.639 1.037 1.872 1.153.232.116.368.097.503-.058.136-.155.58-.677.735-.91.155-.232.31-.193.522-.116.213.078 1.353.639 1.585.755.232.116.387.174.444.271.058.097.058.561-.186 1.247z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--color-ink)]">Share via WhatsApp</p>
              <p className="text-[11px] text-[var(--color-muted-light)] truncate">Send edition link and specifications to client or colleague</p>
            </div>
            <span className="text-xs text-[var(--color-muted-light)] group-hover:text-[var(--color-ink)]">→</span>
          </button>

          {/* Native Device Share (Mobile / Tablet) */}
          {canNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="flex items-center gap-3.5 w-full rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-3 text-left hover:border-[var(--color-bronze)] hover:bg-[var(--color-stone)] transition-all group"
            >
              <div className="w-9 h-9 rounded-full bg-[var(--color-stone)] flex items-center justify-center text-[var(--color-bronze)] flex-shrink-0 group-hover:bg-[var(--color-bronze)] group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--color-ink)]">Share via Device Apps</p>
                <p className="text-[11px] text-[var(--color-muted-light)] truncate">AirDrop, Messages, Instagram, or system share sheet</p>
              </div>
              <span className="text-xs text-[var(--color-muted-light)] group-hover:text-[var(--color-ink)]">→</span>
            </button>
          )}

          {/* Email */}
          <button
            type="button"
            onClick={handleEmailShare}
            className="flex items-center gap-3.5 w-full rounded-xl border border-[var(--color-decorative-border)] bg-[var(--color-canvas)] p-3 text-left hover:border-[var(--color-bronze)] hover:bg-[var(--color-stone)] transition-all group"
          >
            <div className="w-9 h-9 rounded-full bg-[var(--color-stone)] flex items-center justify-center text-[var(--color-ink)] flex-shrink-0 group-hover:bg-[var(--color-ink)] group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--color-ink)]">Send via Email</p>
              <p className="text-[11px] text-[var(--color-muted-light)] truncate">Pre-composed email with title, link, and atelier details</p>
            </div>
            <span className="text-xs text-[var(--color-muted-light)] group-hover:text-[var(--color-ink)]">→</span>
          </button>
        </div>

        {/* Copy Link Input */}
        <div className="space-y-2 pt-2 border-t border-[var(--color-decorative-border)]">
          <label className="text-[11px] font-semibold text-[var(--color-ink)] block">
            Or copy direct link:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 rounded-xl border border-[var(--color-control-border)] bg-[var(--color-canvas)] px-3 py-2 text-xs text-[var(--color-ink)] font-mono select-all focus:outline-none focus:ring-1 focus:ring-[var(--color-bronze)] truncate"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-[var(--color-ink)] text-[var(--color-canvas)] hover:bg-[var(--color-bronze)]"
              }`}
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

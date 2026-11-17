"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";

interface ProductLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  productName: string;
}

export function ProductLightbox({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  productName,
}: ProductLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsZoomed(false);
  }, [initialIndex, isOpen]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation & body lock
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="High-resolution edition gallery lightbox"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 text-white backdrop-blur-md animate-fade-in select-none"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 z-10 bg-black/40">
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-widest text-white/50 font-medium">
            Tavistra Architectural Gallery
          </span>
          <span className="text-white/20">|</span>
          <span className="text-xs text-white/80 font-serif truncate max-w-xs md:max-w-md">
            {productName}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-white/60">
            {currentIndex + 1} / {images.length}
          </span>
          <button
            type="button"
            onClick={() => setIsZoomed((prev) => !prev)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white/80 transition-colors"
            title={isZoomed ? "Reset Zoom" : "Zoom Image"}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isZoomed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              )}
            </svg>
            <span>{isZoomed ? "Fit" : "Zoom"}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            aria-label="Close lightbox"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden">
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 md:left-8 z-20 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white transition-colors border border-white/10 backdrop-blur-sm"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        {/* Image with zoom toggle */}
        <div
          onClick={() => setIsZoomed((prev) => !prev)}
          className={`relative max-h-full max-w-full transition-transform duration-300 ease-out flex items-center justify-center cursor-${isZoomed ? "zoom-out" : "zoom-in"}`}
        >
          <img
            src={currentImage}
            alt={`${productName} view ${currentIndex + 1}`}
            className={`max-h-[75vh] max-w-[85vw] object-contain rounded-lg transition-transform duration-300 ${
              isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
            }`}
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 md:right-8 z-20 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white transition-colors border border-white/10 backdrop-blur-sm"
            aria-label="Next image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-3 px-6 py-4 border-t border-white/10 bg-black/40 overflow-x-auto z-10">
          {images.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setIsZoomed(false);
                setCurrentIndex(idx);
              }}
              className={`relative h-14 w-18 md:h-16 md:w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                currentIndex === idx
                  ? "border-[var(--color-bronze)] scale-105 opacity-100 ring-2 ring-[var(--color-bronze)]/50"
                  : "border-white/20 opacity-50 hover:opacity-80"
              }`}
            >
              <img
                src={url}
                alt={`Thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

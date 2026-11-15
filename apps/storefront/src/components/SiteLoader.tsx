"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface SiteLoaderProps {
  /** If true, runs on every hard refresh/visit; if false, runs once per session */
  runOncePerSession?: boolean;
}

export function SiteLoader({ runOncePerSession = false }: SiteLoaderProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if session storage already has loader marked (if runOncePerSession is true)
    if (runOncePerSession) {
      const alreadyLoaded = sessionStorage.getItem("tavistra_site_loaded");
      if (alreadyLoaded) {
        setShouldRender(false);
        setLoading(false);
        return;
      }
    }

    // Smooth architectural progress simulation
    const startTime = performance.now();
    const duration = 1200; // 1.2s smooth reveal

    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const rawRatio = Math.min(elapsed / duration, 1);
      // Ease-out cubic curve
      const easedProgress = Math.round((1 - Math.pow(1 - rawRatio, 3)) * 100);

      setProgress(easedProgress);

      if (rawRatio < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        // Complete loading
        setIsFading(true);
        setTimeout(() => {
          setLoading(false);
          setShouldRender(false);
          if (runOncePerSession) {
            sessionStorage.setItem("tavistra_site_loaded", "true");
          }
        }, 600); // 600ms curtain transition duration
      }
    };

    requestAnimationFrame(updateProgress);
  }, [runOncePerSession]);

  if (!shouldRender) return null;

  return (
    <div
      aria-hidden={!loading}
      role="status"
      aria-label="Loading Tavistra architectural editions"
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[var(--color-canvas)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isFading ? "opacity-0 pointer-events-none scale-102" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center text-center space-y-6 max-w-sm px-6">
        {/* Architectural Emblem with subtle breathing glow */}
        <div className="relative flex items-center justify-center animate-pulse">
          <Image
            src="/logo-mark.png"
            alt="Tavistra"
            width={56}
            height={44}
            priority
            className="h-12 w-auto object-contain drop-shadow-sm"
          />
        </div>

        {/* Wordmark and Monograph Subtitle */}
        <div className="space-y-1">
          <span className="font-editorial text-2xl tracking-[0.25em] uppercase text-[var(--color-ink)] block">
            Tavistra
          </span>
          <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[var(--color-bronze)] block">
            Architectural Objects & Fine Hardware
          </span>
        </div>

        {/* 1px Architectural Hairline Progress Track */}
        <div className="w-48 h-[1.5px] bg-[var(--color-stone)] rounded-full overflow-hidden mt-4 relative">
          <div
            className="h-full bg-[var(--color-bronze)] transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Subtle percentage indicator */}
        <span className="text-[11px] font-mono text-[var(--color-muted-light)] tracking-widest tabular-nums">
          {progress.toString().padStart(2, "0")}%
        </span>
      </div>
    </div>
  );
}

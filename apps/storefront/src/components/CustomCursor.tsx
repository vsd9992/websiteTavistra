"use client";

import { useEffect, useState, useRef } from "react";

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Target mouse coordinates
  const targetPos = useRef({ x: -100, y: -100 });
  // Trailing follower coordinates (smooth interpolated)
  const trailPos = useRef({ x: -100, y: -100 });
  // Direct ball point element ref
  const dotRef = useRef<HTMLDivElement>(null);
  // Trailing follower ring ref
  const trailRef = useRef<HTMLDivElement>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    // Only enable on desktop devices with fine pointer (mouse / trackpad)
    if (typeof window === "undefined") return;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;

    setEnabled(true);

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Instantly position the ball point dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }

      // Check if hovering over any clickable element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = Boolean(
          target.closest(
            'a, button, [role="button"], select, summary, input[type="button"], input[type="submit"], input[type="reset"], input[type="checkbox"], input[type="radio"], label[for], .cursor-pointer'
          )
        );
        setIsHoveringClickable(isClickable);
      }
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Smooth Lerp Animation Loop for the trailing follower
    const renderLoop = () => {
      const lerp = 0.16; // Smoothness factor
      trailPos.current.x += (targetPos.current.x - trailPos.current.x) * lerp;
      trailPos.current.y += (targetPos.current.y - trailPos.current.y) * lerp;

      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${trailPos.current.x}px, ${trailPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      animFrameId.current = requestAnimationFrame(renderLoop);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    animFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isVisible]);

  if (!enabled) return null;

  return (
    <>
      {/* 1. Sharp Ball Point (Instant Pointer) */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className={`pointer-events-none fixed top-0 left-0 z-[9999] rounded-full transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        } ${
          isHoveringClickable ? "scale-75 opacity-60" : "scale-100 opacity-100"
        }`}
        style={{
          width: "7px",
          height: "7px",
          backgroundColor: "var(--color-ink)",
          boxShadow: "0 0 0 1px rgba(252, 251, 248, 0.8), 0 0 4px rgba(128, 103, 79, 0.4)",
          willChange: "transform",
        }}
      />

      {/* 2. Trailing Follower Ring (Smooth Fluid Momentum) */}
      <div
        ref={trailRef}
        aria-hidden="true"
        className={`pointer-events-none fixed top-0 left-0 z-[9998] rounded-full transition-all duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{
          width: isHoveringClickable ? "50px" : isMouseDown ? "26px" : "34px",
          height: isHoveringClickable ? "50px" : isMouseDown ? "26px" : "34px",
          border: isHoveringClickable
            ? "1.5px solid rgba(128, 103, 79, 0.85)"
            : "1.5px solid rgba(128, 103, 79, 0.45)",
          backgroundColor: isHoveringClickable
            ? "rgba(128, 103, 79, 0.08)"
            : "rgba(128, 103, 79, 0.02)",
          backdropFilter: isHoveringClickable ? "blur(1px)" : "none",
          willChange: "transform, width, height",
        }}
      />
    </>
  );
}

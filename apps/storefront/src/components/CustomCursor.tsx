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

    const checkIsClickableOrInput = (el: HTMLElement | null): boolean => {
      if (!el) return false;

      // 1. Check interactive tag names and attributes
      if (
        el.closest(
          'a, button, [role="button"], select, summary, input, textarea, label, [tabindex]:not([tabindex="-1"]), .cursor-pointer'
        )
      ) {
        return true;
      }

      // 2. Check computed CSS cursor property
      try {
        const cursor = window.getComputedStyle(el).cursor;
        if (cursor === "pointer" || cursor === "text" || cursor === "grab" || cursor === "grabbing") {
          return true;
        }
      } catch {
        // Ignore style access error on detached elements
      }

      return false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      const isClickable = checkIsClickableOrInput(target);
      setIsHoveringClickable(isClickable);

      // Instantly position the ball point dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }

      // If over clickable, sync trail position so it doesn't fly across when exiting
      if (isClickable) {
        trailPos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsHoveringClickable(false);
    };
    const handleMouseEnter = () => setIsVisible(true);

    // Smooth Lerp Animation Loop for the trailing follower
    const renderLoop = () => {
      const lerp = 0.18; // Smooth liquid follow
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

  // When hovering a clickable or input, the ball point and trailing animation completely vanish,
  // letting the native hand pointer (cursor: pointer) take over cleanly.
  const shouldHide = !isVisible || isHoveringClickable;

  return (
    <>
      {/* 1. Sharp Ball Point (Lead Pointer) - Disappears completely over clickables */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className={`pointer-events-none fixed top-0 left-0 z-[9999] rounded-full transition-all duration-150 ease-out ${
          shouldHide ? "opacity-0 scale-0 pointer-events-none" : "opacity-100 scale-100"
        }`}
        style={{
          width: "7px",
          height: "7px",
          backgroundColor: "var(--color-ink)",
          boxShadow: "0 0 0 1px rgba(252, 251, 248, 0.8), 0 0 4px rgba(128, 103, 79, 0.4)",
          willChange: "transform",
        }}
      />

      {/* 2. Trailing Follower Ring (Smooth Momentum) - Disappears completely over clickables */}
      <div
        ref={trailRef}
        aria-hidden="true"
        className={`pointer-events-none fixed top-0 left-0 z-[9998] rounded-full transition-all duration-150 ease-out ${
          shouldHide ? "opacity-0 scale-0 pointer-events-none" : "opacity-100 scale-100"
        }`}
        style={{
          width: isMouseDown ? "26px" : "34px",
          height: isMouseDown ? "26px" : "34px",
          border: "1.5px solid rgba(128, 103, 79, 0.55)",
          backgroundColor: "rgba(128, 103, 79, 0.03)",
          willChange: "transform, width, height",
        }}
      />
    </>
  );
}

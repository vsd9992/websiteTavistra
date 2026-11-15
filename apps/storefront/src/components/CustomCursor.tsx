"use client";

import { useEffect, useState, useRef } from "react";

function CursorRenderer() {
  const dotRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  const targetPos = useRef({ x: -100, y: -100 });
  const trailPos = useRef({ x: -100, y: -100 });
  const isHoveringRef = useRef(false);
  const isVisibleRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const trail = trailRef.current;
    if (!dot || !trail) return;

    const checkIsClickableOrInput = (el: HTMLElement | null): boolean => {
      if (!el) return false;

      // 1. Check interactive tags and roles
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
        if (
          cursor === "pointer" ||
          cursor === "text" ||
          cursor === "grab" ||
          cursor === "grabbing"
        ) {
          return true;
        }
      } catch {
        // Ignore style access error
      }

      return false;
    };

    const updateVisibility = () => {
      const shouldHide = !isVisibleRef.current || isHoveringRef.current;
      const targetOpacity = shouldHide ? "0" : "1";
      dot.style.opacity = targetOpacity;
      trail.style.opacity = targetOpacity;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        trailPos.current.x = e.clientX;
        trailPos.current.y = e.clientY;
      }

      // Position lead ball point directly via hardware-accelerated translate3d
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;

      const target = e.target as HTMLElement | null;
      const isClickable = checkIsClickableOrInput(target);
      isHoveringRef.current = isClickable;

      // Keep trail position aligned while hovering clickables so it never has to catch up from an old spot
      if (isClickable) {
        trailPos.current.x = e.clientX;
        trailPos.current.y = e.clientY;
      }

      updateVisibility();
    };

    const handleMouseDown = () => {
      isMouseDownRef.current = true;
      trail.style.width = "26px";
      trail.style.height = "26px";
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
      trail.style.width = "34px";
      trail.style.height = "34px";
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      isHoveringRef.current = false;
      updateVisibility();
    };

    const handleMouseEnter = (e: MouseEvent) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;
      trailPos.current.x = e.clientX;
      trailPos.current.y = e.clientY;
      isVisibleRef.current = true;
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      trail.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      updateVisibility();
    };

    // Smooth Lerp Animation Loop for the trailing follower ring
    const renderLoop = () => {
      const lerp = 0.18;
      trailPos.current.x += (targetPos.current.x - trailPos.current.x) * lerp;
      trailPos.current.y += (targetPos.current.y - trailPos.current.y) * lerp;

      trail.style.transform = `translate3d(${trailPos.current.x}px, ${trailPos.current.y}px, 0) translate(-50%, -50%)`;

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
  }, []);

  return (
    <>
      {/* 1. Sharp Ball Point (Lead Pointer) - Fades strictly in place with opacity transition only */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full"
        style={{
          width: "7px",
          height: "7px",
          backgroundColor: "var(--color-ink)",
          boxShadow: "0 0 0 1px rgba(252, 251, 248, 0.8), 0 0 4px rgba(128, 103, 79, 0.4)",
          opacity: 0,
          transform: "translate3d(-100px, -100px, 0)",
          transition: "opacity 120ms ease-out",
          willChange: "transform, opacity",
        }}
      />

      {/* 2. Trailing Follower Ring - Fades strictly in place; transform has zero CSS transition */}
      <div
        ref={trailRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9998] rounded-full"
        style={{
          width: "34px",
          height: "34px",
          border: "1.5px solid rgba(128, 103, 79, 0.55)",
          backgroundColor: "rgba(128, 103, 79, 0.03)",
          opacity: 0,
          transform: "translate3d(-100px, -100px, 0)",
          transition: "opacity 140ms ease-out, width 150ms ease-out, height 150ms ease-out",
          willChange: "transform, opacity",
        }}
      />
    </>
  );
}

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Only enable on desktop devices with fine pointer (mouse / trackpad)
    if (typeof window === "undefined") return;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (isFinePointer) {
      setEnabled(true);
    }
  }, []);

  if (!enabled) return null;

  return <CursorRenderer />;
}

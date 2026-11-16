"use client";

import React, { useEffect, useState } from "react";

interface HoneypotFieldProps {
  value: string;
  onChange: (val: string) => void;
  onTimestampChange?: (ts: number) => void;
}

/**
 * Invisible Honeypot Trap Input
 * Hidden visually and from screen readers. Automated bots scan the DOM and blindly fill all inputs.
 */
export function HoneypotField({ value, onChange, onTimestampChange }: HoneypotFieldProps) {
  const [mountedTime, setMountedTime] = useState<number>(0);

  useEffect(() => {
    const now = Date.now();
    setMountedTime(now);
    if (onTimestampChange) {
      onTimestampChange(now);
    }
  }, [onTimestampChange]);

  return (
    <div
      style={{
        position: "absolute",
        left: "-9999px",
        top: "-9999px",
        opacity: 0,
        pointerEvents: "none",
        height: 0,
        width: 0,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      <label htmlFor="_hp_website">Do not fill this field</label>
      <input
        type="text"
        id="_hp_website"
        name="_hp_website"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <input type="hidden" name="_hp_timestamp" value={mountedTime} />
    </div>
  );
}

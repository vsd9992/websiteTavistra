import { useState, useEffect } from "react";

export type AdminTheme = "light" | "dark";

interface ThemeSwitcherProps {
  className?: string;
  onThemeChange?: (theme: AdminTheme) => void;
}

export function ThemeSwitcher({ className = "", onThemeChange }: ThemeSwitcherProps) {
  const [theme, setTheme] = useState<AdminTheme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tavistra_admin_theme") as AdminTheme | null;
      if (saved === "light" || saved === "dark") return saved;
    }
    return "light"; // Default to Light Mode per user specification
  });

  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    // Apply theme attribute to document element
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("tavistra_admin_theme", theme);
    } catch {}
    if (onThemeChange) {
      onThemeChange(theme);
    }
  }, [theme, onThemeChange]);

  // Keyboard shortcut listener (Alt + T)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "t" || e.key === "T")) {
        e.preventDefault();
        toggleTheme();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [theme]);

  const toggleTheme = () => {
    setIsRotating(true);
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    setTimeout(() => setIsRotating(false), 500);
  };

  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={`Switch to ${isLight ? "Nocturne Studio (Dark)" : "Atelier Daylight (Light)"} [Alt+T]`}
      className={`group relative flex items-center p-1 rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#9E7238]/40 ${
        isLight
          ? "bg-[#EDE9E1] hover:bg-[#E5E0D6] border-[#D6CFC4] shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)]"
          : "bg-[#181614] hover:bg-[#201D1A] border-[#38332C] shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]"
      } ${className}`}
      style={{ width: "66px", height: "32px" }}
      aria-label={`Toggle visual mode. Current: ${isLight ? "Daylight" : "Nocturne"}`}
    >
      {/* Background Track Glyphs (Architectural Compass Rose on Left, Celestial Orbital Crescent on Right) */}
      <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none select-none">
        {/* Left Track Glyph: Daylight Aperture */}
        <svg
          viewBox="0 0 16 16"
          className={`w-3.5 h-3.5 transition-opacity duration-300 ${
            isLight ? "opacity-0" : "opacity-35 text-[#857F75]"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        >
          <circle cx="8" cy="8" r="2.5" />
          <line x1="8" y1="1" x2="8" y2="3.2" strokeLinecap="round" />
          <line x1="8" y1="12.8" x2="8" y2="15" strokeLinecap="round" />
          <line x1="1" y1="8" x2="3.2" y2="8" strokeLinecap="round" />
          <line x1="12.8" y1="8" x2="15" y2="8" strokeLinecap="round" />
        </svg>

        {/* Right Track Glyph: Nocturne Orbital Horizon */}
        <svg
          viewBox="0 0 16 16"
          className={`w-3.5 h-3.5 transition-opacity duration-300 ${
            isLight ? "opacity-35 text-[#857F75]" : "opacity-0"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        >
          <path
            d="M12.5 8.5C11.8 11.2 9.2 13 6.5 12.3C4.2 11.7 2.6 9.6 2.5 7.2C2.4 4.8 3.8 2.7 6 1.8C4.8 3.2 4.6 5.3 5.4 6.9C6.2 8.5 7.8 9.5 9.6 9.5C10.6 9.5 11.6 9.1 12.5 8.5Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Moving Machined Brass Thumb Indicator */}
      <div
        className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isLight
            ? "translate-x-0.5 bg-gradient-to-br from-[#FFFDF9] via-[#F4ECE1] to-[#E2D4BF] text-[#7A5420] shadow-[0_2px_5px_rgba(0,0,0,0.15),0_0_0_1px_rgba(200,165,115,0.4)]"
            : "translate-x-[34px] bg-gradient-to-br from-[#E2B376] via-[#B58544] to-[#7D5321] text-[#141312] shadow-[0_2px_6px_rgba(0,0,0,0.5),0_0_0_1px_rgba(230,185,125,0.5),0_0_8px_rgba(212,163,102,0.35)]"
        } ${isRotating ? "scale-95" : "scale-100"}`}
      >
        {/* Kinetic Inner Morphing SVG Icon */}
        <div
          className={`w-4 h-4 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isLight ? "rotate-0" : "rotate-180"
          }`}
        >
          {isLight ? (
            /* DAYLIGHT ICON: The Architectural Solar Chronometer (Central ring + 8 cardinal draftsmanship ticks) */
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 animate-in fade-in zoom-in duration-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {/* Central Solid Brass Core with Inner Void */}
              <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.25" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />

              {/* 8 Geometric Architectural Collimator Rays */}
              <line x1="12" y1="2" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
              <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
              <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" />
              <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
            </svg>
          ) : (
            /* NOCTURNE ICON: The Astrolabe Eclipse (Concentric lunar crescent + orbital horizon axis + celestial stars) */
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 animate-in fade-in zoom-in duration-300 -rotate-180"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              {/* Crescent Moon Silhouette */}
              <path
                d="M17 12.5C16.1 16.2 12.6 18.8 8.8 18.2C5.6 17.7 3.2 15 3.0 11.8C2.8 8.5 4.8 5.6 7.8 4.5C6.3 6.4 6.1 9.2 7.2 11.4C8.3 13.6 10.5 15 13.0 15C14.4 15 15.8 14.3 17 12.5Z"
                fill="currentColor"
                stroke="none"
              />
              {/* Celestial Orbit Hairline Ring */}
              <ellipse
                cx="12"
                cy="12"
                rx="9"
                ry="4.5"
                transform="rotate(-25 12 12)"
                stroke="currentColor"
                strokeOpacity="0.4"
                strokeDasharray="2 2"
              />
              {/* 2 Tiny Constellation Points */}
              <circle cx="18" cy="6" r="0.9" fill="currentColor" stroke="none" />
              <circle cx="16" cy="18" r="0.75" fill="currentColor" stroke="none" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}

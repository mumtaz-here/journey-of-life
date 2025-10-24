/**
 * Journey of Life — Page: Settings
 * -------------------------------
 * Minimal calm configuration page for theme & font.
 */

import React, { useState, useEffect } from "react";
import { save, load } from "../utils/storage";

const container =
  "max-w-2xl mx-auto px-5 py-8 flex flex-col gap-8 text-[#2E2A26]";

export default function Settings() {
  const [theme, setTheme] = useState(() => load("theme") || "cream");
  const [font, setFont] = useState(() => load("font") || "inter");

  useEffect(() => {
    save("theme", theme);
    save("font", font);
    document.documentElement.style.setProperty("--bg-base", theme);
    document.body.style.fontFamily =
      font === "playfair" ? '"Playfair Display", serif' : '"Inter", sans-serif';
  }, [theme, font]);

  const themes = {
    cream: "#FAF7F2",
    beige: "#EDE7E0",
    sage: "#E5ECE7",
  };

  const fonts = {
    inter: "Inter",
    playfair: "Playfair Display",
    dm: "DM Sans",
  };

  return (
    <main className={container}>
      <section className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft animate-fadeIn">
        <h2 className="text-xl font-semibold mb-2">Settings</h2>
        <p className="text-[#7E7A74] text-sm leading-relaxed">
          Adjust how your space feels — softly, without hurry.
        </p>
      </section>

      {/* 🌿 Theme */}
      <section className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft">
        <h3 className="text-lg font-semibold mb-3">Theme</h3>
        <div className="flex gap-3">
          {Object.entries(themes).map(([key, color]) => (
            <button
              key={key}
              onClick={() => setTheme(color)}
              className={`w-8 h-8 rounded-full border ${
                theme === color ? "ring-2 ring-[#CBB9A8]" : "border-[#E8E1DA]"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </section>

      {/* ✍️ Font */}
      <section className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft">
        <h3 className="text-lg font-semibold mb-3">Font Style</h3>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(fonts).map(([key, name]) => (
            <button
              key={key}
              onClick={() => setFont(key)}
              className={`px-3 py-1 rounded-xl border ${
                font === key
                  ? "bg-[#CBB9A8]/30 text-[#2E2A26]"
                  : "bg-[#FAF7F2] text-[#7E7A74]"
              } transition-all duration-200`}
              style={{ fontFamily: name }}
            >
              {name}
            </button>
          ))}
        </div>
      </section>

      {/* 🌸 Info */}
      <section className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft">
        <p className="text-sm text-[#7E7A74]">
          Language: <span className="text-[#2E2A26] font-medium">English</span>
        </p>
        <p className="text-xs text-[#7E7A74] mt-2 italic">
          (More personalization coming soon — gentle modes, background textures,
          and reflection themes.)
        </p>
      </section>
    </main>
  );
}

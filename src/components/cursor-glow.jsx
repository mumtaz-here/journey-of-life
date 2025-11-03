/**
 * Journey of Life — Component: CursorGlow
 * ---------------------------------------
 * Soft aura following the cursor, subtle presence feedback.
 */

import React, { useEffect, useRef } from "react";

export default function CursorGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const move = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999] w-20 h-20 rounded-full 
                 bg-sage/20 blur-3xl opacity-70 transition-transform duration-500 ease-breath"
      style={{ mixBlendMode: "soft-light" }}
    />
  );
}

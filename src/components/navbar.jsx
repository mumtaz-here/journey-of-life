/**
 * Journey of Life — Component: Navbar
 * -----------------------------------
 * Calm bottom navigation bar, mobile-friendly, floating with glow.
 */

import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/my-journey", label: "Journey" },
    { to: "/summary", label: "Summary" },
    { to: "/progress", label: "Progress" },
    { to: "/highlights", label: "Highlights" },
    { to: "/habits", label: "Habits" },
    { to: "/my-story", label: "Story" },
    { to: "/settings", label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border border-[#E8E1DA] shadow-soft rounded-full px-4 py-2 flex gap-3 overflow-x-auto">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end
          className={({ isActive }) =>
            `px-3 py-1 rounded-full text-sm transition-all duration-200 ${
              isActive
                ? "bg-[#9EC3B0]/60 text-[#2E2A26]"
                : "text-[#7E7A74] hover:text-[#2E2A26]"
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

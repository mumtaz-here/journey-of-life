/**
 * Journey of Life — App Shell (Rebranding v2 FINAL)
 * --------------------------------------------------
 * - Layout ultra ringan (no re-render berlebihan)
 * - Sidebar lembut, smooth, bebas glitch
 * - Navigation stabil, tetap simple dan elegan
 * - Kompatibel dengan TanStack Persist + Virtuoso
 */

import { useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  NavLink,
  Outlet,
} from "react-router-dom";

import Home from "./pages/home.jsx";
import MyJourney from "./pages/my-journey.jsx";
import MyHabits from "./pages/my-habits.jsx";
import MyStory from "./pages/my-story.jsx";

/* ---------------------------------------------------------
   UI: Hamburger Button
--------------------------------------------------------- */
function Hamburger({ onClick }) {
  return (
    <button
      aria-label="Open menu"
      onClick={onClick}
      className="p-2 rounded-xl border border-[#E8E1DA] bg-white hover:bg-[#FAF7F2] transition active:scale-95"
    >
      <div className="w-5 h-[2px] bg-[#2E2A26] mb-[5px] rounded" />
      <div className="w-5 h-[2px] bg-[#2E2A26] mb-[5px] rounded" />
      <div className="w-5 h-[2px] bg-[#2E2A26] rounded" />
    </button>
  );
}

/* ---------------------------------------------------------
   UI: Sidebar Link
--------------------------------------------------------- */
function SideLink({ to, icon, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-4 py-3 rounded-xl text-[#2E2A26] transition select-none",
          "hover:bg-[#FAF7F2]",
          isActive
            ? "bg-white shadow-sm border border-[#E8E1DA]"
            : "border border-transparent",
        ].join(" ")
      }
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{children}</span>
    </NavLink>
  );
}

/* ---------------------------------------------------------
   MAIN LAYOUT
--------------------------------------------------------- */
function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openMenu = useCallback(() => setMenuOpen(true), []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2E2A26] relative">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/80 backdrop-blur supports-[backdrop-filter]:bg-[#FAF7F2]/50 border-b border-[#E8E1DA]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Hamburger onClick={openMenu} />
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-semibold tracking-wide">
              Journey of Life
            </h1>
            <span className="text-xs px-2 py-[2px] rounded-full bg-white border border-[#E8E1DA]">
              calm • simple • fun
            </span>
          </div>
        </div>
      </header>

      {/* OVERLAY */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10 animate-fadeIn"
          onClick={closeMenu}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={[
          "fixed z-50 top-0 left-0 h-full w-[280px] bg-[#F7F1EA] border-r border-[#E8E1DA]",
          "shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.25,.8,.25,1)]",
          menuOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-hidden={!menuOpen}
      >
        {/* Sidebar Header */}
        <div className="px-4 py-4 flex items-center justify-between border-b border-[#E8E1DA]">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold">Menu</span>
            <span className="text-[10px] px-2 py-[2px] rounded-full bg-white border border-[#E8E1DA]">
              JOL
            </span>
          </div>

          <button
            aria-label="Close menu"
            onClick={closeMenu}
            className="p-2 rounded-xl border border-[#E8E1DA] bg-white hover:bg-[#FAF7F2] transition active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="p-3 flex flex-col gap-2">
          <SideLink to="/" icon="🏠" onClick={closeMenu}>
            Home
          </SideLink>

          <SideLink to="/my-journey" icon="🧭" onClick={closeMenu}>
            My Journey
          </SideLink>

          <SideLink to="/my-habits" icon="🌱" onClick={closeMenu}>
            My Habits
          </SideLink>

          <SideLink to="/my-story" icon="📖" onClick={closeMenu}>
            My Story
          </SideLink>
        </nav>

        {/* Bottom Quote */}
        <div className="mt-auto p-3 text-[11px] opacity-60">
          <div className="bg-white border border-[#E8E1DA] rounded-xl p-3 shadow-sm">
            “A calm step is still a step.”
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

/* ---------------------------------------------------------
   ROUTER
--------------------------------------------------------- */
export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          {/* Primary pages */}
          <Route path="/" element={<Home />} />
          <Route path="/my-journey" element={<MyJourney />} />
          <Route path="/my-habits" element={<MyHabits />} />
          <Route path="/my-story" element={<MyStory />} />

          {/* Old routes redirect */}
          <Route path="/summary" element={<Navigate to="/my-journey" replace />} />
          <Route path="/progress" element={<Navigate to="/my-journey" replace />} />
          <Route path="/highlights" element={<Navigate to="/my-journey" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

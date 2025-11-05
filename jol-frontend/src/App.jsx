/**
 * Journey of Life — App Shell (Rebranding v1)
 * - Satu layout tenang & elegan
 * - Header dengan tombol hamburger
 * - Sidebar lembut (slide-in) berisi menu utama
 * - Routing dibungkus Layout (Home tetap pusat)
 *
 * Catatan:
 * - Tidak menambah file komponen baru; semua komponen ada di file ini.
 * - Rute lama (summary/progress/highlights) tetap redirect ke /my-journey.
 * - Tidak mengubah halaman lain dulu. Nanti kita rapikan per halaman, step-by-step.
 */

import { useState } from "react";
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

/* ---------- UI Helpers ---------- */

// Tombol hamburger (tanpa library)
function Hamburger({ open, onClick }) {
  return (
    <button
      aria-label="Open menu"
      onClick={onClick}
      className="p-2 rounded-xl border border-[#E8E1DA] bg-white hover:bg-[#FAF7F2] transition"
    >
      <div className="w-5 h-[2px] bg-[#2E2A26] mb-[5px] rounded" />
      <div className="w-5 h-[2px] bg-[#2E2A26] mb-[5px] rounded" />
      <div className="w-5 h-[2px] bg-[#2E2A26] rounded" />
    </button>
  );
}

// Link sidebar (aktif = tebal + badge kecil)
function SideLink({ to, icon, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-4 py-3 rounded-xl transition",
          "text-[#2E2A26] hover:bg-[#FAF7F2]",
          isActive ? "bg-white shadow-sm border border-[#E8E1DA]" : "border border-transparent",
        ].join(" ")
      }
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{children}</span>
    </NavLink>
  );
}

/* ---------- Layout Shell ---------- */

function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2E2A26]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/80 backdrop-blur supports-[backdrop-filter]:bg-[#FAF7F2]/60 border-b border-[#E8E1DA]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Hamburger open={menuOpen} onClick={() => setMenuOpen(true)} />
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-semibold tracking-wide">Journey of Life</h1>
            <span className="text-xs px-2 py-[2px] rounded-full bg-white border border-[#E8E1DA]">
              calm • simple • fun
            </span>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={[
          "fixed z-50 top-0 left-0 h-full w-[280px] bg-[#F7F1EA] border-r border-[#E8E1DA]",
          "shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.22,.61,.36,1)]",
          menuOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-hidden={!menuOpen}
      >
        <div className="px-4 py-4 flex items-center justify-between border-b border-[#E8E1DA]">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold">Menu</span>
            <span className="text-[10px] px-2 py-[2px] rounded-full bg-white border border-[#E8E1DA]">
              JOL
            </span>
          </div>
          <button
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="p-2 rounded-xl border border-[#E8E1DA] bg-white hover:bg-[#FAF7F2] transition"
          >
            ✕
          </button>
        </div>

        <nav className="p-3 flex flex-col gap-2">
          <SideLink to="/" icon="🏠" onClick={() => setMenuOpen(false)}>
            Home
          </SideLink>
          <SideLink to="/my-journey" icon="🧭" onClick={() => setMenuOpen(false)}>
            My Journey
          </SideLink>
          <SideLink to="/my-habits" icon="🌱" onClick={() => setMenuOpen(false)}>
            My Habits
          </SideLink>
          <SideLink to="/my-story" icon="📖" onClick={() => setMenuOpen(false)}>
            My Story
          </SideLink>

          {/* Catatan:
             Rute Highlights akan kita buat setelah halaman Highlights jadi.
             Untuk sekarang, rute lama masih redirect ke /my-journey (di bawah).
           */}
        </nav>

        <div className="mt-auto p-3 text-[11px] opacity-60">
          <div className="bg-white border border-[#E8E1DA] rounded-xl p-3">
            “A calm step is still a step.”
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

/* ---------- App with Nested Routes ---------- */

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          {/* Halaman utama (Home = tempat nulis) */}
          <Route path="/" element={<Home />} />

          {/* Hasil olahan */}
          <Route path="/my-journey" element={<MyJourney />} />
          <Route path="/my-habits" element={<MyHabits />} />
          <Route path="/my-story" element={<MyStory />} />

          {/* Redirect rute lama */}
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

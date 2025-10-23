// src/components/SectionNav.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "./Icon.jsx";

function Item({ label, to, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition ${
        active ? "bg-white shadow-sm border-neutral-300 text-neutral-900"
               : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-white"
      }`}
      aria-label={label}
    >
      {label}
    </button>
  );
}

export default function SectionNav() {
  const [open, setOpen] = useState({ core: true, habit: false, bacaan: false });
  const loc = useLocation();
  const nav = useNavigate();

  const is = (paths = []) => paths.some((p) => loc.pathname === p);

  return (
    <div className="sticky top-0 z-20 w-full border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="max-w-3xl mx-auto px-4 py-2 space-y-2">
        {/* CORE */}
        <div className="rounded-xl border border-neutral-200 bg-white">
          <button
            className="w-full flex items-center justify-between px-3 py-2"
            onClick={() => setOpen((o) => ({ ...o, core: !o.core }))}
          >
            <div className="flex items-center gap-2">
              <Icon name="home" className="w-4 h-4 text-neutral-700" />
              <span className="text-sm font-medium text-neutral-800">Core</span>
            </div>
            <Icon
              name="chevron-down"
              className={`w-4 h-4 text-neutral-500 transition ${open.core ? "rotate-180" : ""}`}
            />
          </button>

          {open.core && (
            <div className="px-3 pb-3 flex flex-wrap gap-2">
              <Item
                label="My Journey"
                active={is(["/"])}
                onClick={() => nav("/")}
              />
              <Item
                label="Summary"
                active={is(["/summary"])}
                onClick={() => nav("/summary")}
              />
              <Item
                label="Progress"
                active={is(["/progress"])}
                onClick={() => nav("/progress")}
              />
              <Item
                label="Highlights"
                active={is(["/highlights"])}
                onClick={() => nav("/highlights")}
              />
            </div>
          )}
        </div>

        {/* HABIT */}
        <div className="rounded-xl border border-neutral-200 bg-white">
          <button
            className="w-full flex items-center justify-between px-3 py-2"
            onClick={() => setOpen((o) => ({ ...o, habit: !o.habit }))}
          >
            <div className="flex items-center gap-2">
              <Icon name="sparkle" className="w-4 h-4 text-neutral-700" />
              <span className="text-sm font-medium text-neutral-800">Habit</span>
            </div>
            <Icon
              name="chevron-down"
              className={`w-4 h-4 text-neutral-500 transition ${open.habit ? "rotate-180" : ""}`}
            />
          </button>

          {open.habit && (
            <div className="px-3 pb-3 flex flex-wrap gap-2">
              <Item
                label="Habit Utama"
                active={is(["/habit/utama"])}
                onClick={() => nav("/habit/utama")}
              />
              <Item
                label="Dalam Proses"
                active={is(["/habit/rencana"])}
                onClick={() => nav("/habit/rencana")}
              />
              <Item
                label="Insight Habit"
                active={is(["/habit/insight"])}
                onClick={() => nav("/habit/insight")}
              />
            </div>
          )}
        </div>

        {/* BACAAN */}
        <div className="rounded-xl border border-neutral-200 bg-white">
          <button
            className="w-full flex items-center justify-between px-3 py-2"
            onClick={() => setOpen((o) => ({ ...o, bacaan: !o.bacaan }))}
          >
            <div className="flex items-center gap-2">
              <Icon name="book" className="w-4 h-4 text-neutral-700" />
              <span className="text-sm font-medium text-neutral-800">Bacaan</span>
            </div>
            <Icon
              name="chevron-down"
              className={`w-4 h-4 text-neutral-500 transition ${open.bacaan ? "rotate-180" : ""}`}
            />
          </button>

          {open.bacaan && (
            <div className="px-3 pb-3 flex flex-wrap gap-2">
              <Item
                label="Cerita Hidupku"
                active={is(["/bacaan/cerita"])}
                onClick={() => nav("/bacaan/cerita")}
              />
              <Item
                label="Bacaan Harian"
                active={is(["/bacaan/harian"])}
                onClick={() => nav("/bacaan/harian")}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

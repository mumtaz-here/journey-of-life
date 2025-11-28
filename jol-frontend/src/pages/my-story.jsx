/**
 * Journey of Life — My Story (Ultra Calm & Fast Version)
 * -------------------------------------------------------
 * - Stable fetch (abortable)
 * - No jumpy scroll
 * - Clean date filter UX
 * - Better empty states
 * - Faster list rendering
 */

import { useEffect, useRef, useState, useMemo } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const container =
  "max-w-2xl mx-auto px-3 sm:px-4 md:px-6 py-8 flex flex-col gap-8 text-[#2E2A26] bg-[#FAF7F2] min-h-screen";

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function MyStory() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const appliedFrom = useRef("");
  const appliedTo = useRef("");

  const abortRef = useRef(null);

  /* ------------------------------------------
     LOAD STORIES (with safe abort)
  ------------------------------------------ */
  async function loadStories({ withFilter = false } = {}) {
    try {
      setLoading(true);

      // abort previous request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const params = new URLSearchParams();

      if (withFilter) {
        if (fromDate) params.set("from", fromDate);
        if (toDate) params.set("to", toDate || fromDate);
      }

      const url =
        params.toString().length > 0
          ? `${API}/story?${params.toString()}`
          : `${API}/story`;

      const res = await fetch(url, { signal: controller.signal });
      let data = await res.json();
      if (!Array.isArray(data)) data = [];

      // sort newest → oldest
      data.sort(
        (a, b) =>
          new Date(b.reflection_date).getTime() -
          new Date(a.reflection_date).getTime()
      );

      // save applied filter state
      if (withFilter) {
        appliedFrom.current = fromDate;
        appliedTo.current = toDate || fromDate;
      } else {
        appliedFrom.current = "";
        appliedTo.current = "";
      }

      setStories(data);
    } catch (err) {
      if (err.name === "AbortError") return; // ignore
      console.error("❌ Story fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStories();
  }, []);

  /* ------------------------------------------
     FILTER HANDLERS
  ------------------------------------------ */
  function handleApply(e) {
    e.preventDefault();
    if (!fromDate && !toDate) return;
    loadStories({ withFilter: true });
  }

  function handleReset() {
    setFromDate("");
    setToDate("");
    loadStories({ withFilter: false });
  }

  const showFilterLabel = appliedFrom.current || appliedTo.current;

  /* ------------------------------------------
     MEMOIZED LIST (FAST)
  ------------------------------------------ */
  const renderedStories = useMemo(
    () =>
      stories.map((s) => (
        <article
          key={s.id}
          className="bg-white border border-[#E8E1DA] rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col gap-3 hover:bg-[#FFFBF4] transition"
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">
              {formatDateLabel(s.reflection_date)}
            </span>
            <span className="text-xs text-[#7E7A74]">
              {s.created_at
                ? new Date(s.created_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : ""}
            </span>
          </div>

          <p className="text-base leading-relaxed text-[#2E2A26]/90 whitespace-pre-line">
            {s.narrative}
          </p>
        </article>
      )),
    [stories]
  );

  /* ------------------------------------------
     RENDER
  ------------------------------------------ */
  return (
    <main className={container}>
      {/* Header */}
      <header className="text-center flex flex-col gap-1">
        <h1 className="text-xl font-semibold">My Story</h1>
        <p className="text-sm text-[#7E7A74]">
          Quiet daily reflections from your real notes.
        </p>
      </header>

      {/* Filter */}
      <section className="bg-white border border-[#E8E1DA] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-[#5C5147]">
            Filter tanggal
          </span>

          {showFilterLabel && (
            <span className="text-[11px] text-[#A09184] italic">
              {formatDateLabel(appliedFrom.current)}
              {appliedTo.current &&
                appliedTo.current !== appliedFrom.current &&
                ` – ${formatDateLabel(appliedTo.current)}`}
            </span>
          )}
        </div>

        <form
          onSubmit={handleApply}
          className="flex flex-col sm:flex-row gap-3 items-stretch"
        >
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[11px] text-[#8C7F78]">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full p-2 rounded-xl border border-[#E8E1DA] bg-[#FFFBF4] text-sm"
            />
          </div>

          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[11px] text-[#8C7F78]">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full p-2 rounded-xl border border-[#E8E1DA] bg-[#FFFBF4] text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 sm:flex-col">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-[#9EC3B0] hover:bg-[#86b7a0] transition active:scale-95"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#8C7F78] border border-[#D8C2AE] bg-white hover:bg-[#F3EDE4] transition active:scale-95"
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      {/* Stories */}
      <section className="flex flex-col gap-6">
        {loading && (
          <p className="text-center italic text-[#8C7F78]">Loading stories…</p>
        )}

        {!loading && stories.length === 0 && (
          <p className="text-center italic text-[#8C7F78]">
            Tidak ada story untuk rentang ini 🌿
          </p>
        )}

        {!loading && renderedStories}
      </section>
    </main>
  );
}

/* ============================================================
   HELPERS
============================================================ */
function formatDateLabel(dayKey) {
  if (!dayKey) return "";
  const d = new Date(`${dayKey}T00:00`);
  if (isNaN(d.getTime())) return dayKey;

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

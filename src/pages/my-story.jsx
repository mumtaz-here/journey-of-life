/**
 * Journey of Life — Page: My Story (auto narrative ✅)
 * ----------------------------------------------------
 * - Auto-fetch stories from backend
 * - Auto-generate this week's story if missing
 * - Calm 3rd-person narrative tone
 */

import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const container =
  "max-w-2xl mx-auto px-5 py-8 flex flex-col gap-6 text-[#2E2A26] bg-[#FAF7F2] min-h-screen";

/* =========================================================
   MAIN
========================================================= */
export default function MyStory() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  async function fetchStories() {
    try {
      const res = await fetch(`${API}/story`);
      const data = await res.json();
      setStories(data);

      // ✅ auto-generate if this week's story is missing
      const currentWeek = getIsoWeekKey();
      const hasThisWeek = data.some((s) => s.week === currentWeek);

      if (!hasThisWeek) {
        console.log("🪶 Auto-generating this week's story...");
        await fetch(`${API}/story/generate`, { method: "POST" });
        const refresh = await fetch(`${API}/story`);
        const newData = await refresh.json();
        setStories(newData);
      }
    } catch (err) {
      console.error("❌ Fetch stories error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={container}>
      <header className="text-center">
        <h1 className="text-xl font-semibold">My Story</h1>
        <p className="text-sm text-[#7E7A74]">
          Calm weekly reflections from your real entries.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        {loading && (
          <p className="text-center italic text-[#8C7F78]">Loading stories…</p>
        )}

        {!loading && stories.length === 0 && (
          <p className="text-center italic text-[#8C7F78]">
            No stories yet 🌿
          </p>
        )}

        {stories.map((s) => (
          <article
            key={s.id}
            className="bg-white border border-[#E8E1DA] rounded-2xl shadow-sm p-5 animate-fadeIn"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-[#2E2A26]">
                Week {s.week}
              </span>
              <span className="text-xs text-[#7E7A74]">
                {new Date(s.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#2E2A26]/90 whitespace-pre-line">
              {s.narrative}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

/* =========================================================
   Helper — ISO Week Key
========================================================= */
function getIsoWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

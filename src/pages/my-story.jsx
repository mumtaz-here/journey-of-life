/**
 * Journey of Life — Page: My Story (daily diary view)
 * ---------------------------------------------------
 * - Shows one block per day
 * - Uses factual summaries from backend (/summaries)
 * - Calm, simple, not over-dramatic
 */

import { useEffect, useState } from "react";
import { fetchSummaries as apiFetchSummaries } from "../utils/api";

const container =
  "max-w-2xl mx-auto px-4 py-6 text-[#2E2A26] bg-[#FAF7F2] min-h-screen flex flex-col gap-4";
const card =
  "bg-white border border-[#E8E1DA] rounded-2xl shadow-sm";
const sub = "text-sm opacity-70";

/** Format: Thursday, 06 Nov 2025 */
function formatFullDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function MyStory() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔁 Load daily summaries as "story base"
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = (await apiFetchSummaries()) || [];
        // Urut dari terbaru ke lama (diary feel)
        data.sort(
          (a, b) => new Date(b.summary_date) - new Date(a.summary_date)
        );
        setDays(data);
      } catch (err) {
        console.error("❌ MyStory fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className={container}>
      {/* Header */}
      <section className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-sm">
        <h1 className="text-xl font-semibold mb-1">My Story</h1>
        <p className={sub}>
          A calm daily diary based on what you actually wrote.
        </p>
      </section>

      {/* Story list */}
      <section className="flex flex-col gap-4">
        {loading && (
          <div className={card + " p-4"}>
            <p className="text-sm italic text-[#7E7A74]">
              Loading your story…
            </p>
          </div>
        )}

        {!loading && days.length === 0 && (
          <div className={card + " p-4"}>
            <p className="text-sm italic text-[#7E7A74]">
              No story yet. Start by writing in your Home page.
            </p>
          </div>
        )}

        {!loading &&
          days.map((d) => (
            <article key={d.summary_date} className={card + " p-4"}>
              {/* Date */}
              <h2 className="text-base font-semibold mb-1">
                {formatFullDate(d.summary_date)}
              </h2>
              <p className={sub}>Based on your reflections that day.</p>

              {/* Text — simple, not lebay */}
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">
                {d.summary_text}
              </p>
            </article>
          ))}
      </section>
    </main>
  );
}

import { useEffect, useState } from "react";
import {
  fetchHabits,
  toggleHabit,
  fetchHighlights,
  toggleHighlight,
} from "../utils/api";
import { useNavigate } from "react-router-dom";

const container =
  "max-w-2xl mx-auto px-5 py-8 flex flex-col gap-8 text-[#2E2A26] bg-[#FAF7F2] min-h-screen";

// Placeholder quote — can be dynamic later
function Quote() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm text-center italic opacity-75">
      “A calm step is still a step.”
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const [habits, setHabits] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const h = await fetchHabits();
    const hl = await fetchHighlights();
    setHabits(h);
    setHighlights(hl);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  // Light Tasks (3 habits)
  const lightTasks = habits.slice(0, 3);

  // Priorities = highlights not done
  const priorities = highlights
    .filter((h) => h.status !== "done")
    .slice(0, 3);

  // Today’s Plans = highlights with planned status
  const todaysPlans = highlights
    .filter((h) => h.status === "planned")
    .slice(0, 3);

  if (loading) {
    return (
      <main className={container}>
        <p className="text-center opacity-75">Loading...</p>
      </main>
    );
  }

  return (
    <main className={container}>

      {/* QUOTE */}
      <Quote />

      {/* LIGHT TASKS */}
      <section>
        <h2 className="font-semibold mb-3">Light Tasks</h2>
        <div className="space-y-2">
          {lightTasks.length === 0 && (
            <p className="text-sm opacity-60">No habits yet.</p>
          )}
          {lightTasks.map((h) => (
            <div
              key={h.id}
              className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm"
            >
              <span>{h.title}</span>
              <button
                className="w-5 h-5 rounded-full border"
                onClick={async () => {
                  await toggleHabit(h.id);
                  loadData();
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* PRIORITIES */}
      <section>
        <h2 className="font-semibold mb-3">Today’s Top Priorities</h2>
        <div className="space-y-2">
          {priorities.length === 0 && (
            <p className="text-sm opacity-60">No priorities yet.</p>
          )}
          {priorities.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm"
            >
              <span>{p.text}</span>
              <button
                className="w-5 h-5 rounded-full border"
                onClick={async () => {
                  await toggleHighlight(p.id);
                  loadData();
                }}
              />
            </div>
          ))}
        </div>
        <button
          className="mt-2 text-sm underline opacity-70"
          onClick={() => navigate("/highlights")}
        >
          Add priority
        </button>
      </section>

      {/* TODAY PLANS */}
      <section>
        <h2 className="font-semibold mb-3">Today’s Plans</h2>
        <div className="space-y-2">
          {todaysPlans.length === 0 && (
            <p className="text-sm opacity-60">No plans today.</p>
          )}
          {todaysPlans.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm"
            >
              <span>{p.text}</span>
              <button
                className="w-5 h-5 rounded-full border border-green-500 bg-green-500"
                onClick={async () => {
                  await toggleHighlight(p.id);
                  loadData();
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* MAIN NAV */}
      <section>
        <h2 className="font-semibold mb-3">Explore</h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            className="bg-white p-4 rounded-xl shadow-sm text-sm"
            onClick={() => navigate("/my-journey")}
          >
            My Journey
          </button>
          <button
            className="bg-white p-4 rounded-xl shadow-sm text-sm"
            onClick={() => navigate("/my-habits")}
          >
            My Habits
          </button>
          <button
            className="bg-white p-4 rounded-xl shadow-sm text-sm"
            onClick={() => navigate("/my-story")}
          >
            My Story
          </button>
        </div>
      </section>

    </main>
  );
}

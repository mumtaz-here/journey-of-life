/**
 * Journey of Life — Page: Progress
 * --------------------------------
 * Displays your weekly journaling activity and gentle reflection.
 * Combines small data with calm tone.
 */

import React, { useEffect, useState } from "react";
import { load } from "../utils/storage";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const container =
  "max-w-2xl mx-auto px-5 py-8 flex flex-col gap-8 text-[#2E2A26]";

export default function Progress() {
  const [entries, setEntries] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [reflection, setReflection] = useState("");

  useEffect(() => {
    const saved = load("entries") || [];
    setEntries(saved);

    // group by week
    const byWeek = {};
    saved.forEach((e) => {
      const date = new Date(e.created_at);
      const week = getWeekKey(date);
      byWeek[week] = (byWeek[week] || 0) + 1;
    });

    const data = Object.entries(byWeek)
      .map(([w, count]) => ({ week: w, entries: count }))
      .sort((a, b) => (a.week > b.week ? 1 : -1));

    setChartData(data);

    // gentle reflection logic
    if (saved.length === 0) {
      setReflection("You haven’t started writing yet — it’s never too late to begin.");
    } else if (saved.length < 4) {
      setReflection(
        "You’re slowly building a rhythm. Each entry plants a small seed of clarity."
      );
    } else if (saved.length < 10) {
      setReflection(
        "You’ve written consistently — it’s not about quantity, but awareness in each moment."
      );
    } else {
      setReflection(
        "Your journaling practice is becoming part of your flow — a quiet form of growth."
      );
    }
  }, []);

  function getWeekKey(date) {
    const year = date.getFullYear();
    const week = Math.ceil(
      ((date - new Date(year, 0, 1)) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7
    );
    return `${year}-W${week}`;
  }

  return (
    <main className={container}>
      {/* 🪞 Overview */}
      <section className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft animate-fadeIn">
        <h2 className="text-xl font-semibold mb-2">Progress Overview</h2>
        <p className="text-[#7E7A74] text-sm leading-relaxed">
          A calm look at how your reflections have been flowing over time.
        </p>
      </section>

      {/* 📈 Weekly Entries Chart */}
      <section className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft">
        <h3 className="text-lg font-semibold mb-3">Weekly Entries</h3>
        {chartData.length === 0 ? (
          <p className="text-[#7E7A74] italic text-sm">
            No activity yet. Start writing to see your rhythm grow.
          </p>
        ) : (
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(200,200,200,0.2)"
                />
                <XAxis
                  dataKey="week"
                  stroke="#7E7A74"
                  fontSize={12}
                  tickMargin={8}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FAF7F2",
                    border: "1px solid #E8E1DA",
                    borderRadius: "10px",
                    fontSize: "12px",
                    color: "#2E2A26",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="entries"
                  stroke="#9EC3B0"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#CBB9A8" }}
                  activeDot={{ r: 6 }}
                  animationDuration={600}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* 🌿 Reflection Note */}
      <section className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E1DA] shadow-soft">
        <h3 className="text-lg font-semibold mb-3">Reflection Note</h3>
        <p className="text-sm leading-relaxed text-[#2E2A26]/90">
          {reflection}
        </p>
      </section>
    </main>
  );
}

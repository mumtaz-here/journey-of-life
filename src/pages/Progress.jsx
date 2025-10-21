import { useEffect, useState } from "react";
import Icon from "../components/Icon.jsx";
import { format } from "date-fns";
import id from "date-fns/locale/id";

export default function Progress({ onBack }) {
  const [entries, setEntries] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState({
    total: 0,
    topHour: null,
    mood: "netral",
    days: [],
  });

  // Ambil data dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("journeyEntries");
    if (saved) {
      const all = JSON.parse(saved);
      setEntries(all);
      computeWeekly(all);
    }
  }, []);

  // Hitung pola mingguan
  const computeWeekly = (data) => {
    if (!data || !data.length) return;

    // ambil 7 hari terakhir
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);

    const filtered = data.filter((e) => {
      const entryDate = new Date(e.id);
      return entryDate >= sevenDaysAgo && entryDate <= now;
    });

    // total entri
    const total = filtered.length;

    // hitung jam menulis
    const hourCounts = {};
    filtered.forEach((e) => {
      const d = new Date(e.id);
      const h = d.getHours();
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    });
    const topHour =
      Object.keys(hourCounts).length > 0
        ? Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0][0]
        : null;

    // deteksi mood sederhana
    const moodWords = {
      bahagia: ["senang", "gembira", "yeey", "lega", "semangat"],
      sedih: ["sedih", "capek", "lelah", "kecewa"],
      marah: ["marah", "bete", "kesal"],
      tenang: ["tenang", "santai", "damai"],
      cemas: ["cemas", "takut", "gelisah"],
    };
    const moodCount = {};
    filtered.forEach((e) => {
      const txt = e.text.toLowerCase();
      for (const mood in moodWords) {
        if (moodWords[mood].some((word) => txt.includes(word))) {
          moodCount[mood] = (moodCount[mood] || 0) + 1;
        }
      }
    });
    const mood =
      Object.keys(moodCount).length > 0
        ? Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0][0]
        : "netral";

    // kelompokkan per hari
    const dayMap = {};
    filtered.forEach((e) => {
      const d = new Date(e.id);
      const key = format(d, "EEEE", { locale: id });
      dayMap[key] = (dayMap[key] || 0) + 1;
    });

    const days = Object.keys(dayMap).map((day) => ({
      name: day,
      count: dayMap[day],
    }));

    setWeeklyStats({ total, topHour, mood, days });
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-3 flex items-center gap-2 bg-white shadow-sm sticky top-0 z-10">
        <button
          onClick={onBack}
          className="rounded-full bg-white p-2 shadow hover:bg-gray-100"
        >
          <Icon name="menu" className="w-5 h-5 text-neutral-800" />
        </button>

        <div className="flex-1 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow">
            <Icon name="chart" className="w-4 h-4 text-[#A68B73]" />
            <span className="text-sm text-neutral-900 font-medium">
              Progress Mingguan
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-full bg-white p-2 shadow hover:bg-gray-100">
            <Icon name="search" className="w-5 h-5 text-neutral-800" />
          </button>
          <button className="rounded-full bg-white p-2 shadow hover:bg-gray-100">
            <Icon name="more" className="w-5 h-5 text-neutral-800" />
          </button>
        </div>
      </div>

      {/* Konten utama */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {!entries.length ? (
          <div className="text-center text-gray-400 mt-10">
            Belum ada data untuk ditampilkan 🌿
          </div>
        ) : (
          <>
            {/* Kartu ringkasan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-xs text-gray-500 mb-1">Total Entri Minggu Ini</p>
                <p className="text-2xl font-bold text-gray-900">{weeklyStats.total}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-xs text-gray-500 mb-1">Jam Aktif Menulis</p>
                <p className="text-2xl font-bold text-gray-900">
                  {weeklyStats.topHour
                    ? `${weeklyStats.topHour}:00`
                    : "Belum terdeteksi"}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-xs text-gray-500 mb-1">Mood Dominan</p>
                <p className="capitalize text-2xl font-bold text-gray-900">
                  {weeklyStats.mood}
                </p>
              </div>
            </div>

            {/* Grafik batang sederhana */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm font-medium text-gray-900 mb-3">
                Aktivitas 7 Hari Terakhir
              </p>
              <div className="flex items-end justify-between h-40">
                {weeklyStats.days.map((d) => (
                  <div key={d.name} className="flex flex-col items-center flex-1">
                    <div
                      className="w-6 bg-[#D8BFAA] rounded-t-md transition-all duration-300"
                      style={{ height: `${d.count * 30}px` }}
                    ></div>
                    <p className="text-xs mt-2 text-gray-600">
                      {d.name.slice(0, 3)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

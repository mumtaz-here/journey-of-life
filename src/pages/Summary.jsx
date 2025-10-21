import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  MoreVertical,
  Calendar,
  BarChart2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format, parse } from "date-fns";
import id from "date-fns/locale/id";

export default function Summary() {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [entries, setEntries] = useState([]);

  // ambil semua catatan dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("journeyEntries");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  // fungsi buat bikin ringkasan sederhana
  const summarizeEntries = (entries) => {
    if (!entries.length) return null;

    // total entri
    const total = entries.length;

    // hitung emosi (pakai kata kunci sederhana)
    const moodKeywords = {
      bahagia: ["senang", "gembira", "yeey", "hepi", "lega"],
      sedih: ["sedih", "kecewa", "menangis", "capek", "hilang"],
      marah: ["marah", "kesal", "bete"],
      tenang: ["tenang", "santai", "lega"],
      cemas: ["cemas", "takut", "gelisah"],
    };

    const moodCounts = {};
    entries.forEach((e) => {
      const text = e.text.toLowerCase();
      for (const mood in moodKeywords) {
        if (moodKeywords[mood].some((w) => text.includes(w))) {
          moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        }
      }
    });

    const dominantMood =
      Object.keys(moodCounts).length > 0
        ? Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0]
        : "netral";

    // ambil tanggal terbaru
    const lastDate = entries[0]?.date || "";

    // ambil kata kunci umum (misal kata “beli”, “bayar”)
    const keywordCounts = {};
    entries.forEach((e) => {
      const words = e.text.toLowerCase().split(/\s+/);
      words.forEach((w) => {
        if (["beli", "bayar", "makan", "kerja", "belajar"].includes(w)) {
          keywordCounts[w] = (keywordCounts[w] || 0) + 1;
        }
      });
    });

    const topKeywords = Object.keys(keywordCounts)
      .sort((a, b) => keywordCounts[b] - keywordCounts[a])
      .slice(0, 3);

    return { total, dominantMood, lastDate, topKeywords };
  };

  const summary = summarizeEntries(entries);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900">
              Ringkasan Harian
            </h1>
            <p className="text-xs text-gray-500">
              {format(new Date(), "EEEE, d MMMM yyyy", { locale: id })}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full">
        {!entries.length ? (
          <p className="text-center text-gray-400 italic mt-10">
            Belum ada catatan untuk diringkas 🌿
          </p>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">
                    Total Entri
                  </h3>
                  <Calendar className="w-5 h-5 text-[#A68B73]" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.total}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  terakhir: {summary.lastDate}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">
                    Emosi Dominan
                  </h3>
                  <BarChart2 className="w-5 h-5 text-[#A68B73]" />
                </div>
                <p className="text-2xl font-bold capitalize text-gray-900">
                  {summary.dominantMood}
                </p>
              </div>
            </div>

            {/* Keyword Section */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">
                  Pola Aktivitas
                </h2>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center text-sm text-[#A68B73] hover:underline"
                >
                  Detail
                  {showDetails ? (
                    <ChevronUp className="w-4 h-4 ml-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </button>
              </div>

              <div className="mt-3">
                {summary.topKeywords.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">
                    Belum ada pola yang terdeteksi.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {summary.topKeywords.map((k) => (
                      <li
                        key={k}
                        className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700"
                      >
                        • Aktivitas sering muncul: <b>{k}</b>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {showDetails && (
                <div className="mt-4 border-t border-gray-100 pt-3">
                  {entries.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      className="mb-2 text-sm text-gray-600 border-b border-gray-50 pb-2"
                    >
                      <span className="text-gray-500">{e.date}</span>
                      <p className="mt-1">{e.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

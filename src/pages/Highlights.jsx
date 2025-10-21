import { useState, useEffect } from "react";
import { format } from "date-fns";
import id from "date-fns/locale/id";
import Icon from "../components/Icon.jsx";

export default function Highlights({ onBack }) {
  const [highlights, setHighlights] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ status: "", note: "" });

  // list saran ringan (bisa dari sistem / AI)
  const [suggestions, setSuggestions] = useState([]);

  const STATUS_STYLE = {
    pending: "bg-white border-neutral-200",
    done: "bg-green-50 border-green-100",
    skipped: "bg-amber-50 border-amber-100",
  };

  useEffect(() => {
    const saved = localStorage.getItem("journeyHighlights");
    if (saved) setHighlights(JSON.parse(saved));

    // contoh saran otomatis sederhana
    setSuggestions([
      {
        id: "sg1",
        text: "Roti yang dibeli kemarin: sudah dikonsumsi?",
        related: "pembelian makanan",
      },
      {
        id: "sg2",
        text: "Panci listrik sudah 2 bulan digunakan, pertimbangkan untuk dibersihkan.",
        related: "perawatan barang",
      },
    ]);
  }, []);

  const startEdit = (item) => {
    setEditingId(item.id);
    setDraft({ status: item.status || "pending", note: item.note || "" });
  };

  const saveEdit = () => {
    const updated = highlights.map((h) =>
      h.id === editingId ? { ...h, ...draft } : h
    );
    setHighlights(updated);
    localStorage.setItem("journeyHighlights", JSON.stringify(updated));
    setEditingId(null);
  };

  // tambahkan saran ke highlights
  const addSuggestionToHighlights = (sug) => {
    const newItem = {
      id: Date.now(),
      text: sug.text,
      status: "pending",
      note: "",
    };
    const updated = [newItem, ...highlights];
    setHighlights(updated);
    localStorage.setItem("journeyHighlights", JSON.stringify(updated));
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
            <Icon name="pin" className="w-4 h-4 text-rose-700" />
            <span className="text-sm text-neutral-900 font-medium">
              Highlights
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

        {/* Bagian saran ringan */}
        {suggestions.length > 0 && (
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-4">
            <div className="flex items-center mb-3">
              <Icon name="lightbulb" className="w-4 h-4 text-yellow-600 mr-2" />
              <h2 className="text-sm font-medium text-neutral-800">
                Saran yang perlu diperhatikan
              </h2>
            </div>

            <ul className="space-y-2">
              {suggestions.map((sug) => (
                <li
                  key={sug.id}
                  className="flex items-start justify-between border-b border-neutral-100 pb-2 last:border-none"
                >
                  <p className="text-sm text-neutral-700">{sug.text}</p>
                  <button
                    onClick={() => addSuggestionToHighlights(sug)}
                    className="text-xs text-neutral-500 hover:text-neutral-800 transition"
                  >
                    + Tambahkan
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Daftar highlights */}
        {!highlights.length ? (
          <div className="text-center text-gray-400 mt-10">
            Belum ada sorotan dari catatan 🌿
          </div>
        ) : (
          <div className="space-y-4">
            {highlights.map((it) => (
              <div
                key={it.id}
                className={`relative border rounded-2xl p-3 shadow-sm transition-all ${STATUS_STYLE[it.status]}`}
                onClick={() => startEdit(it)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">
                    {format(new Date(it.id), "EEEE, d MMM yyyy HH:mm", {
                      locale: id,
                    })}
                  </span>
                  <Icon name="star" className="w-4 h-4 text-rose-600" />
                </div>

                <p className="text-gray-800 text-sm whitespace-pre-line">
                  {it.text}
                </p>

                {editingId === it.id && (
                  <div className="mt-3 border-t pt-3 animate-fadein">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {[
                        { key: "pending", label: "Belum" },
                        { key: "done", label: "Selesai" },
                        { key: "skipped", label: "Dilepas" },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() =>
                            setDraft((d) => ({ ...d, status: opt.key }))
                          }
                          className={`px-2.5 py-1 rounded-full text-xs border transition ${
                            draft.status === opt.key
                              ? "bg-white shadow-sm border-neutral-300"
                              : "bg-neutral-50 hover:bg-white"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={2}
                      value={draft.note}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, note: e.target.value }))
                      }
                      className="w-full text-sm rounded-lg border border-neutral-200 p-2 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300"
                      placeholder="catatan kecil (opsional)…"
                    />

                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        className="text-xs text-neutral-600 hover:underline"
                        onClick={() => setEditingId(null)}
                      >
                        Batal
                      </button>
                      <button
                        className="text-xs bg-neutral-900 text-white px-3 py-1.5 rounded-lg"
                        onClick={saveEdit}
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

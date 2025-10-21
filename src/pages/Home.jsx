// src/pages/Home.jsx
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import id from "date-fns/locale/id";
import { getEntries, saveEntry } from "../utils/storage.js";

export default function Home() {
  const [entry, setEntry] = useState("");
  const [items, setItems] = useState([]);
  const textareaRef = useRef(null);

  // pertama kali load: ambil dari localStorage
  useEffect(() => {
    setItems(getEntries());
  }, []);

  // auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [entry]);

  const onSubmit = (e) => {
    e.preventDefault();
    const text = entry.trim();
    if (!text) return;

    // simpan ke localStorage
    const added = saveEntry({ text });
    // update UI (masukkan paling atas)
    setItems((prev) => [added, ...prev]);
    setEntry("");
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header sederhana */}
      <div className="sticky top-0 z-10 bg-white border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <h1 className="text-base font-semibold text-neutral-900">Catatan</h1>
          <p className="text-xs text-neutral-500">
            Tulis bebas; catatanmu tersimpan di perangkat ini.
          </p>
        </div>
      </div>

      {/* Daftar catatan */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-neutral-400 py-16">
              Belum ada catatan. Mulai dari hal kecil pun boleh 🌿
            </div>
          ) : (
            items.map((it) => (
              <article
                key={it.id}
                className="bg-white border border-neutral-200 rounded-xl shadow-sm p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-neutral-500">
                    {format(new Date(Number(it.createdAt)), "EEEE, d MMM yyyy HH:mm", { locale: id })}
                  </span>
                </div>
                <p className="text-sm text-neutral-800 whitespace-pre-line">{it.text}</p>
              </article>
            ))
          )}
        </div>
      </main>

      {/* Composer */}
      <div className="border-t border-neutral-200 bg-white">
        <form onSubmit={onSubmit} className="max-w-3xl mx-auto px-4 py-3">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 focus-within:bg-white">
            <textarea
              ref={textareaRef}
              rows={1}
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="Bagaimana harimu?"
              className="w-full bg-transparent resize-none border-0 focus:ring-0 text-sm p-3"
            />
            <div className="flex items-center justify-end border-t border-neutral-100 p-2">
              <button
                type="submit"
                disabled={!entry.trim()}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  entry.trim()
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                }`}
              >
                Simpan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

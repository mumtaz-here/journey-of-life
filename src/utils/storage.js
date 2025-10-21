// src/utils/storage.js

const KEY = "journeyEntries";

/** Ambil semua entri (array paling baru di atas) */
export function getEntries() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    // sort terbaru dulu
    return arr.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

/** Simpan satu entri baru */
export function saveEntry({ text }) {
  const now = Date.now();
  const entry = {
    id: now,              // unique id
    text: (text || "").trim(),
    createdAt: now,       // unix ms
  };
  const all = getEntries();
  const next = [entry, ...all];
  localStorage.setItem(KEY, JSON.stringify(next));
  return entry;
}

/** Hapus semua (buat debugging) */
export function clearEntries() {
  localStorage.removeItem(KEY);
}

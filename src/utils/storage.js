const KEY_ENTRIES = "journey-entries";
const KEY_SUMMARIES = "journey-summaries";
const KEY_HIGHLIGHTS = "journey-highlights";
const KEY_REFLECTIONS = "journey-weekly-reflections";

/** Ambil semua entri (array paling baru di atas) */
export function getEntries() {
  try {
    const raw = localStorage.getItem(KEY_ENTRIES);
    const arr = raw ? JSON.parse(raw) : [];
    return arr.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

/** Simpan satu entri baru (teks + hasil analisis opsional) */
export function saveEntry({ text, analysis }) {
  const now = Date.now();
  const entry = {
    id: now,
    text: (text || "").trim(),
    analysis: analysis || null,
    createdAt: now,
  };

  const all = getEntries();
  const next = [entry, ...all];
  localStorage.setItem(KEY_ENTRIES, JSON.stringify(next));

  if (analysis?.type === "summary") addToSummaries(entry);
  if (analysis?.type === "highlight") addToHighlights(entry);
  if (analysis) addToWeeklyReflections(entry); // ✨ tambah refleksi mingguan

  return entry;
}

/** Tambahkan ke daftar summary */
export function addToSummaries(entry) {
  const raw = localStorage.getItem(KEY_SUMMARIES);
  const arr = raw ? JSON.parse(raw) : [];
  const next = [entry, ...arr];
  localStorage.setItem(KEY_SUMMARIES, JSON.stringify(next));
}

/** Tambahkan ke daftar highlight */
export function addToHighlights(entry) {
  const raw = localStorage.getItem(KEY_HIGHLIGHTS);
  const arr = raw ? JSON.parse(raw) : [];
  const next = [entry, ...arr];
  localStorage.setItem(KEY_HIGHLIGHTS, JSON.stringify(next));
}

/** ✿ Simpan refleksi mingguan sederhana */
export function addToWeeklyReflections(entry) {
  const raw = localStorage.getItem(KEY_REFLECTIONS);
  const arr = raw ? JSON.parse(raw) : [];

  // hitung minggu dari timestamp
  const week = new Date(entry.createdAt).getWeekNumber
    ? new Date(entry.createdAt).getWeekNumber()
    : Math.ceil(entry.createdAt / (7 * 24 * 60 * 60 * 1000));

  const existing = arr.find((r) => r.week === week);
  if (existing) {
    existing.entries.push(entry);
  } else {
    arr.push({ week, entries: [entry] });
  }
  localStorage.setItem(KEY_REFLECTIONS, JSON.stringify(arr));
}

/** Hapus semua (buat debugging) */
export function clearEntries() {
  localStorage.removeItem(KEY_ENTRIES);
  localStorage.removeItem(KEY_SUMMARIES);
  localStorage.removeItem(KEY_HIGHLIGHTS);
  localStorage.removeItem(KEY_REFLECTIONS);
}

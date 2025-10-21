import levenshtein from "js-levenshtein";

// ✿ Kata dasar
const keywordGroups = {
  beli: ["beli", "bli", "belii", "buy", "jajan", "traktir"],
  bayar: ["bayar", "byr", "blayar"],
  utang: ["utang", "utg", "hutang", "htg"],
  tugas: ["tugas", "pr", "deadline", "ujian", "kerjaan"],
  bantu: ["bantu", "nemenin", "nganterin", "menemani"],
  waktu: ["besok", "bsk", "nanti", "lusa", "minggu depan", "jumat", "tanggal", "tgl"],
};

const intentWords = ["mau", "pengen", "ingin", "rencana", "perlu", "pgn"];

const emotionWords = {
  senang: ["senang", "happy", "lega", "tenang", "bahagia"],
  sedih: ["sedih", "nangis", "kecewa", "down"],
  marah: ["marah", "kesel", "emosi"],
  capek: ["capek", "lelah", "letih", "pusing"],
  cemas: ["cemas", "takut", "khawatir"],
};

// ✿ Bantu cek mirip kata
function isSimilar(word, list) {
  return list.some((target) => levenshtein(word, target) <= 2);
}

// ✿ Analisis utama
export function analyzeText(textRaw) {
  const text = textRaw.toLowerCase();
  const words = text.split(/\s+/);

  const result = {
    type: null, // summary / highlight
    category: null, // keuangan / sosial / tugas / agenda / emosi
    note: "",
    dueDate: null, // tanggal khusus kalau terdeteksi
  };

  const hasIntent = intentWords.some((w) => text.includes(w));
  const hasPast = text.includes("tadi") || text.includes("kemarin") || text.includes("barusan");
  const hasFuture = words.some((w) => isSimilar(w, keywordGroups.waktu));

  // ✿ Emosi
  for (let [label, list] of Object.entries(emotionWords)) {
    if (list.some((w) => text.includes(w))) {
      result.category = "emosi";
      result.note = `perasaan dominan: ${label}`;
      result.type = "summary";
    }
  }

  // ✿ Tugas
  if (words.some((w) => isSimilar(w, keywordGroups.tugas))) {
    if (hasFuture || text.includes("deadline") || text.includes("depan")) {
      result.category = "tugas";
      result.type = "highlight";
      result.note = "ada tugas atau deadline yang perlu disiapkan 📚";
    } else {
      result.category = "tugas";
      result.type = "summary";
      result.note = "menyebut tugas atau pekerjaan hari ini 🗒️";
    }
  }

  // ✿ Aktivitas keuangan
  if (["beli", "bayar", "utang"].some((key) => words.some((w) => isSimilar(w, keywordGroups[key])))) {
    if (hasIntent && hasFuture) {
      result.category = "rencana-keuangan";
      result.type = "highlight";
      result.note = "rencana membeli atau membayar sesuatu 💸";
    } else {
      result.category = "keuangan";
      result.type = "summary";
      result.note = "aktivitas finansial hari ini 💰";
    }
  }

  // ✿ Sosial
  if (words.some((w) => isSimilar(w, keywordGroups.bantu))) {
    result.category = "sosial";
    result.type = hasPast ? "summary" : "highlight";
    result.note = hasPast
      ? "kegiatan sosial yang sudah dilakukan 💬"
      : "rencana membantu seseorang 🤝";
  }

  // ✿ Agenda waktu
  if (hasFuture && result.type !== "summary") {
    result.category = "agenda";
    result.type = "highlight";
    result.note ||= "ada rencana untuk hari mendatang 📅";
  }

  // Default fallback
  if (!result.type) {
    result.type = "summary";
    result.category = "umum";
    result.note = "catatan umum hari ini ✨";
  }

  return result;
}

// src/pages/habit/HabitInsight.jsx
export default function HabitInsight() {
  // nanti ambil dari analytics sederhana (jumlah muncul kata, jam menulis, dsb)
  const data = {
    peakWriting: "21:00–23:00",
    frequentKeywords: ["mandi", "minum air", "istirahat"],
    suggestedSlots: ["Sebelum mulai kerja", "Setelah makan siang"],
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 space-y-3">
        <h1 className="text-base font-semibold text-neutral-900">Insight Habit</h1>
        <div className="text-sm text-neutral-700">
          <p>Waktu menulis dominan: <b>{data.peakWriting}</b></p>
          <p>Kata rutin yang sering muncul: {data.frequentKeywords.join(", ")}</p>
          <p>Slot yang cocok untuk menyisipkan kebiasaan: {data.suggestedSlots.join(" / ")}</p>
        </div>
      </div>
    </div>
  );
}

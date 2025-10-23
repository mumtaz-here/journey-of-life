// src/pages/bacaan/BacaanHarian.jsx
import { useEffect, useState } from "react";

export default function BacaanHarian() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Dummy bacaan harian berbasis keadaan (simple, non-dramatis)
    setItems([
      { id: "b1", title: "Tentang ritme kecil", body: "Simpan jeda pendek sebelum dan sesudah aktivitas. Cukup 1 menit." },
      { id: "b2", title: "Menata ulang beban", body: "Jika pekerjaan padat, susun 1 hal yang perlu selesai, sisanya sekunder." },
    ]);
  }, []);

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
        <h1 className="text-base font-semibold text-neutral-900 mb-3">Bacaan Harian</h1>
        {!items.length ? (
          <p className="text-sm text-neutral-500">Belum ada bacaan hari ini.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((x) => (
              <li key={x.id} className="border border-neutral-200 rounded-lg p-3">
                <div className="text-sm font-medium text-neutral-900">{x.title}</div>
                <p className="text-sm text-neutral-700 mt-1">{x.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

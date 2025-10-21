// src/pages/bacaan/BacaanCerita.jsx
import { useEffect, useState } from "react";

export default function BacaanCerita() {
  const [text, setText] = useState("");

  useEffect(() => {
    // Dummy narasi; nanti bisa diisi dari ringkasan AI
    setText(
      `Hari-hari berjalan pelan. Kamu menulis tentang hal-hal kecil — kopi, tugas, istirahat.
Di antara rutinitas itu, masih ada ruang untuk mengenali diri sendiri.
Kamu tidak buru-buru; kamu hanya ingin melanjutkan, secukupnya.`
    );
  }, []);

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 leading-relaxed">
        <h1 className="text-base font-semibold text-neutral-900 mb-2">Cerita Hidupku</h1>
        <p className="text-sm text-neutral-800 whitespace-pre-line">{text}</p>
      </div>
    </div>
  );
}

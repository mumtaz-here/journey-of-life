// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SectionNav from "./components/SectionNav.jsx";

// Halaman CORE (sudah ada punyamu)
import Home from "./pages/Home.jsx";            // My Journey (kamu bisa pakai MyJourney.jsx kalau namanya itu)
import Summary from "./pages/Summary.jsx";
import Progress from "./pages/Progress.jsx";
import Highlights from "./pages/Highlights.jsx";

// Halaman HABIT (baru)
import HabitMain from "./pages/habit/HabitMain.jsx";
import HabitBuild from "./pages/habit/HabitBuild.jsx";
import HabitInsight from "./pages/habit/HabitInsight.jsx";

// Halaman BACAAN (baru)
import BacaanCerita from "./pages/bacaan/BacaanCerita.jsx";
import BacaanHarian from "./pages/bacaan/BacaanHarian.jsx";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="h-screen w-full flex flex-col bg-gray-50">
        {/* SectionNav tampil di semua halaman; tenang & non-intrusif */}
        <SectionNav />

        <div className="flex-1 overflow-hidden">
          <div className="max-w-3xl mx-auto h-full">
            <Routes>
              {/* CORE */}
              <Route path="/" element={<Home />} />
              <Route path="/summary" element={<Summary />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/highlights" element={<Highlights />} />

              {/* HABIT */}
              <Route path="/habit/utama" element={<HabitMain />} />
              <Route path="/habit/rencana" element={<HabitBuild />} />
              <Route path="/habit/insight" element={<HabitInsight />} />

              {/* BACAAN */}
              <Route path="/bacaan/cerita" element={<BacaanCerita />} />
              <Route path="/bacaan/harian" element={<BacaanHarian />} />

              {/* fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

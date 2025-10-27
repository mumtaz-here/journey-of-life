/**
 * Journey of Life — App Routing (Updated)
 * -------------------------------
 * Removes standalone pages: Summary, Progress, Highlights
 * All moved into My Journey tabs
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home";
import MyJourney from "./pages/my-journey";
import MyStory from "./pages/my-story";
import HabitMain from "./pages/habits/habit-main"; // only main habits page needed now

export default function App() {
  return (
    <Router>
      <div className="min-h-screen w-full">
        <Routes>
          {/* ✅ Main root */}
          <Route path="/" element={<Home />} />

          {/* ✅ My Journey (with internal tabs) */}
          <Route path="/my-journey" element={<MyJourney />} />

          {/* ✅ Habits */}
          <Route path="/habits" element={<HabitMain />} />

          {/* ✅ My Story */}
          <Route path="/my-story" element={<MyStory />} />

          {/* ✅ Redirect legacy pages to My Journey */}
          <Route path="/summary" element={<Navigate to="/my-journey" replace />} />
          <Route path="/progress" element={<Navigate to="/my-journey" replace />} />
          <Route path="/highlights" element={<Navigate to="/my-journey" replace />} />

          {/* ✅ Catch all → Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

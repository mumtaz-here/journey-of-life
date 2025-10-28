/**
 * Journey of Life — App Routing (FINAL FIX)
 */

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/home.jsx";
import MyJourney from "./pages/my-journey.jsx";
import MyHabits from "./pages/my-habits.jsx";
import MyStory from "./pages/my-story.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* ✅ KEY PAGE */}
        <Route path="/my-journey" element={<MyJourney />} />

        <Route path="/my-habits" element={<MyHabits />} />
        <Route path="/my-story" element={<MyStory />} />

        {/* ✅ Redirect old routes */}
        <Route path="/summary" element={<Navigate to="/my-journey" replace />} />
        <Route path="/progress" element={<Navigate to="/my-journey" replace />} />
        <Route path="/highlights" element={<Navigate to="/my-journey" replace />} />

        {/* ✅ Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

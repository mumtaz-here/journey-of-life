/**
 * Journey of Life — App.jsx (Final)
 * ---------------------------------
 * Integrates all pages, transitions, cursor glow, and navbar.
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PageWrapper from "./components/page-wrapper";
import CursorGlow from "./components/cursor-glow";
import Navbar from "./components/navbar";

import Home from "./pages/home";
import MyJourney from "./pages/my-journey";
import Summary from "./pages/summary";
import Progress from "./pages/progress";
import Highlights from "./pages/highlights";
import HabitMain from "./pages/habits/habit-main";
import HabitPlan from "./pages/habits/habit-plan";
import HabitInsight from "./pages/habits/habit-insight";
import MyStory from "./pages/my-story";
import Settings from "./pages/settings";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen w-full bg-gradient-to-br from-[#FAF7F2] via-[#F6F2EC] to-[#EDE7E0] text-[#2E2A26]">
        {/* ✨ Global effects */}
        <CursorGlow />

        {/* 🌿 Page transitions */}
        <PageWrapper>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/my-journey" element={<MyJourney />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/highlights" element={<Highlights />} />
            <Route path="/habits" element={<HabitMain />} />
            <Route path="/habits/plan" element={<HabitPlan />} />
            <Route path="/habits/insight" element={<HabitInsight />} />
            <Route path="/my-story" element={<MyStory />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </PageWrapper>

        {/* 🪷 Floating Navbar */}
        <Navbar />
      </div>
    </Router>
  );
}

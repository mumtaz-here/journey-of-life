/**
 * Journey of Life — Home v3 (Planner UI + Paper Navigation)
 */

import React from "react";
import Quote from "../components/quote";
import LightTasksCard from "../components/light-tasks-card";
import PriorityCard from "../components/priority-card";
import TodayPlansCard from "../components/today-plans-card";
import MainNavCards from "../components/main-nav-cards";

const container =
  "max-w-2xl mx-auto px-5 py-8 flex flex-col gap-8 text-[#2E2A26]";

export default function Home() {
  return (
    <main className={container}>
      <Quote />
      <LightTasksCard />
      <PriorityCard />
      <TodayPlansCard />
      <MainNavCards />
    </main>
  );
}

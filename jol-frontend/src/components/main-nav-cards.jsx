/**
 * Journey of Life — Main Navigation Cards (Paper-Cut Icons)
 * Navigation uses kebab-case — safe from label changes
 */

import { useNavigate } from "react-router-dom";

const items = [
  {
    label: "My Journey",
    route: "/my-journey",
    icon: "/icons/paper-journey.svg",
    color: "from-[#F2B8A2]/80 to-[#EAD5C5]/70",
  },
  {
    label: "My Habits",
    route: "/my-habits",
    icon: "/icons/paper-habit.svg",
    color: "from-[#9EC3B0]/80 to-[#CFE4D8]/70",
  },
  {
    label: "My Story",
    route: "/my-story",
    icon: "/icons/paper-story.svg",
    color: "from-[#E8E1DA]/90 to-[#D5CCC3]/60",
  },
];

export default function MainNavCards() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <button
          key={item.route}
          onClick={() => navigate(item.route)}
          className={`
            rounded-[18px]
            p-3
            bg-gradient-to-br ${item.color}
            border border-[#E8E1DA]
            shadow-sm
            flex flex-col items-center gap-1
            transition-transform duration-300 ease-in-out
            hover:-translate-y-1 hover:shadow-md
            active:scale-[0.97]
          `}
        >
          <img
            src={item.icon}
            alt={item.label}
            className="w-[34px] h-[34px] object-contain"
          />
          <span className="text-[13px] font-medium text-[#2E2A26] tracking-tight">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

import React from "react";
import { Home, Apple, BarChart3, User } from "lucide-react";
import { UZ } from "../constants/uz";

interface NavigationProps {
  currentPage: "dashboard" | "meals" | "stats" | "profile";
  onPageChange: (page: "dashboard" | "meals" | "stats" | "profile") => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onPageChange,
}) => {
  const items = [
    { id: "dashboard" as const, label: UZ.nav.dashboard, icon: Home },
    { id: "meals" as const, label: UZ.nav.meals, icon: Apple },
    { id: "stats" as const, label: UZ.nav.stats, icon: BarChart3 },
    { id: "profile" as const, label: UZ.nav.profile, icon: User },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-16 shadow-lg dark:shadow-2xl flex-shrink-0">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onPageChange(id)}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-all ${
            currentPage === id
              ? "text-blue-500 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          <Icon size={20} />
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </nav>
  );
};

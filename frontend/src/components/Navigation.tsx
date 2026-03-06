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
    <nav
      className="fixed bottom-0 left-0 right-0 h-[78px] backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map(({ id, label, icon: Icon }) => {
        const active = currentPage === id;

        return (
          <button
            key={id}
            onClick={() => onPageChange(id)}
            className="flex flex-col items-center justify-center gap-1 px-4 py-2 relative"
          >
            {active && (
              <div className="absolute -top-1 w-10 h-10 rounded-full bg-blue-500/15 dark:bg-blue-400/15 blur-md" />
            )}

            <Icon
              size={22}
              className={`transition ${
                active
                  ? "text-blue-500 dark:text-blue-400 scale-110"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            />

            <span
              className={`text-[11px] font-medium ${
                active
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
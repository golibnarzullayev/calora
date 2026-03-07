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
      className="fixed bottom-0 left-0 right-0 min-h-[72px] dark:bg-gray-900 border-t border-gray-700 flex justify-around items-center z-50"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {items.map(({ id, label, icon: Icon }) => {
        const active = currentPage === id;

        return (
          <button
            key={id}
            onClick={() => onPageChange(id)}
            className="flex flex-col items-center justify-center gap-1 px-4 py-2"
          >
            <Icon
              size={22}
              className={`transition-colors ${
                active ? "text-blue-400" : "text-gray-400"
              }`}
            />

            <span
              className={`text-[11px] font-medium ${
                active ? "text-blue-400" : "text-gray-400"
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
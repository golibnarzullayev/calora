import React, { useEffect, useState } from "react";
import { useAppStore } from "./store/useAppStore";
import { initTelegramWebApp, getTelegramUserId } from "./utils/telegram";
import { Onboarding } from "./components/Onboarding";
import { Dashboard } from "./components/Dashboard";
import { Meals } from "./components/Meals";
import { Stats } from "./components/Stats";
import { Profile } from "./components/Profile";
import { MealDetail } from "./components/MealDetail";
import { Navigation } from "./components/Navigation";
import { ToastContainer } from "./components/Toast";
import { useUser, useCalorieTarget } from "./hooks/useQueries";
import { useToast } from "./hooks/useToast";
import { authAPI } from "./services/api";
import type { Meal } from "./store/useAppStore";

export const App: React.FC = () => {
  const {
    isOnboarded,
    user: storeUser,
    setUser,
    setCalorieTarget,
    setOnboarded,
  } = useAppStore();
  const { toasts, removeToast } = useToast();
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "meals" | "stats" | "profile"
  >("dashboard");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  
  const { data: user, isLoading: userLoading } = useUser(telegramId || null);
  const { data: calorieTarget } = useCalorieTarget(telegramId || null);

  const isLoading = userLoading && !user && telegramId;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user has web auth token
        const token = localStorage.getItem("authToken");
        if (token) {
          try {
            const response = await authAPI.verifyToken();
            if (response.data.user && response.data.calorieTarget) {
              setUser(response.data.user);
              setCalorieTarget(response.data.calorieTarget);
              setOnboarded(true);
              return;
            }
          } catch (error) {
            localStorage.removeItem("authToken");
          }
        }

        // Check for Telegram
        initTelegramWebApp();
        const id = getTelegramUserId();
        if (id) {
          setTelegramId(id);
          // For Telegram users, skip onboarding and go directly to dashboard
          setOnboarded(true);
          return;
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [setUser, setCalorieTarget, setOnboarded]);

  useEffect(() => {
    if (user && calorieTarget) {
      setUser(user);
      setCalorieTarget(calorieTarget);
      setOnboarded(true);
    }
  }, [user, calorieTarget, setUser, setCalorieTarget, setOnboarded]);

  if (isCheckingAuth || isLoading) {
    return (
      <div className="h-screen bg-gradient-to-b from-blue-500 to-blue-600 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center overflow-hidden">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!isOnboarded || !storeUser) {
    return <Onboarding telegramId={telegramId || ""} />;
  }

  if (selectedMeal) {
    return (
      <MealDetail
        meal={selectedMeal}
        onBack={() => setSelectedMeal(null)}
        onDelete={() => setSelectedMeal(null)}
      />
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {currentPage === "dashboard" && <Dashboard />}
      {currentPage === "meals" && <Meals onMealClick={setSelectedMeal} />}
      {currentPage === "stats" && <Stats />}
      {currentPage === "profile" && <Profile />}
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default App;

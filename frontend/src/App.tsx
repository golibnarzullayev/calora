import React, { useEffect, useState } from "react";
import { useAppStore } from "./store/useAppStore";
import { initTelegramWebApp, getTelegramUserId } from "./utils/telegram";
import { Onboarding } from "./components/Onboarding";
import { Dashboard } from "./components/Dashboard";
import { Meals } from "./components/Meals";
import { Stats } from "./components/Stats";
import { Profile } from "./components/Profile";
import { Subscriptions } from "./components/Subscriptions";
import { PaymentCallback } from "./components/PaymentCallback";
import { MealDetail } from "./components/MealDetail";
import { Navigation } from "./components/Navigation";
import { ToastContainer } from "./components/Toast";
import AdminPanel from "./components/AdminPanel";
import { authAPI, userAPI } from "./services/api";
import type { Meal } from "./store/useAppStore";
import { useToast } from "./context/ToastContext";

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
    | "dashboard"
    | "meals"
    | "stats"
    | "profile"
    | "subscriptions"
    | "payment-callback"
    | "admin"
  >("dashboard");

  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (window.location.pathname === "/payment-callback") {
          setCurrentPage("payment-callback");
          return;
        }

        // Telegram WebApp init
        initTelegramWebApp();

        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.ready();
        }

        // 1️⃣ Web token orqali auth tekshirish
        const token = localStorage.getItem("authToken");

        if (token) {
          try {
            const response = await authAPI.verifyToken();

            if (response.data.user) {
              setUser(response.data.user);
              setCalorieTarget(response.data.calorieTarget);
              setOnboarded(true);
              return;
            }
          } catch {
            localStorage.removeItem("authToken");
          }
        }

        // 2️⃣ Telegram orqali auth
        const id = getTelegramUserId();

        if (id) {
          setTelegramId(id);

          try {
            const response = await userAPI.getUserWithTelegramId(id);

            if (response.data.user) {
              setUser(response.data.user);
              setCalorieTarget(response.data.calorieTarget);
              setOnboarded(true);

              if (response.data.token) {
                localStorage.setItem("authToken", response.data.token);
              }

              return;
            }
          } catch {
            console.error("Telegram auth failed");
          }
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [setUser, setCalorieTarget, setOnboarded]);

  if (isCheckingAuth) {
    return (
      <div className="h-screen bg-gradient-to-b from-blue-500 to-blue-600 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center overflow-hidden">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (currentPage === "payment-callback") {
    return (
      <>
        <PaymentCallback />
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </>
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
    <div className="h-[100dvh] flex flex-col">
      <main
        className="flex-1 overflow-y-auto"
        style={{
          paddingBottom: "max(72px, env(safe-area-inset-bottom))",
        }}
      >
        {currentPage === "dashboard" && (
          <Dashboard
            onNavigateToSubscriptions={() => setCurrentPage("subscriptions")}
          />
        )}

        {currentPage === "meals" && (
          <Meals
            onMealClick={setSelectedMeal}
            onNavigateToSubscriptions={() => setCurrentPage("subscriptions")}
          />
        )}

        {currentPage === "stats" && (
          <Stats
            onNavigateToSubscriptions={() => setCurrentPage("subscriptions")}
          />
        )}

        {currentPage === "profile" && (
          <Profile onNavigateToAdmin={() => setCurrentPage("admin")} />
        )}

        {currentPage === "subscriptions" && <Subscriptions />}

        {currentPage === "admin" && (
          <AdminPanel
            onLogout={() => {
              localStorage.removeItem("authToken");
              setCurrentPage("dashboard");
            }}
          />
        )}
      </main>

      {currentPage !== "admin" && (
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default App;

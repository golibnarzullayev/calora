import { create } from "zustand";

export interface User {
  _id: string;
  telegramId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  age: number;
  weight: number;
  height: number;
  workoutFrequency: number;
  goal: "lose" | "maintain" | "gain";
  isAdmin: boolean;
}

export interface CalorieTarget {
  bmr: number;
  tdee: number;
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface Meal {
  _id: string;
  userId: string;
  createdAt: string;
  imageUrl: string;
  aiResult: {
    isFood: boolean;
    mealName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: number;
  };
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface DailyStats {
  _id?: string;
  userId: string;
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
}

interface AppStore {
  user: User | null;
  calorieTarget: CalorieTarget | null;
  meals: Meal[];
  dailyStats: DailyStats | null;
  isLoading: boolean;
  error: string | null;
  isOnboarded: boolean;

  setUser: (user: User) => void;
  setCalorieTarget: (target: CalorieTarget) => void;
  setMeals: (meals: Meal[]) => void;
  addMeal: (meal: Meal) => void;
  removeMeal: (mealId: string) => void;
  setDailyStats: (stats: DailyStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setOnboarded: (onboarded: boolean) => void;
  reset: () => void;
  logout: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  calorieTarget: null,
  meals: [],
  dailyStats: null,
  isLoading: false,
  error: null,
  isOnboarded: false,

  setUser: (user) => set({ user }),
  setCalorieTarget: (calorieTarget) => set({ calorieTarget }),
  setMeals: (meals) => set({ meals }),
  addMeal: (meal) =>
    set((state) => ({
      meals: [meal, ...state.meals],
    })),
  removeMeal: (mealId) =>
    set((state) => ({
      meals: state.meals.filter((m) => m._id !== mealId),
    })),
  setDailyStats: (dailyStats) => set({ dailyStats }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setOnboarded: (isOnboarded) => set({ isOnboarded }),
  reset: () =>
    set({
      user: null,
      calorieTarget: null,
      meals: [],
      dailyStats: null,
      isLoading: false,
      error: null,
      isOnboarded: false,
    }),
  logout: () => {
    localStorage.removeItem("authToken");
    set({ user: null });
  },
}));

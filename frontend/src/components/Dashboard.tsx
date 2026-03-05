import React from "react";
import { useAppStore } from "../store/useAppStore";
import { UZ } from "../constants/uz";
import { Camera } from "lucide-react";
import { useMeals, useDailyStats, useUploadMeal } from "../hooks/useQueries";
import { formatDateWithDay } from "../utils/dateFormatter";
import type { Meal } from "../store/useAppStore";
import { getErrorMessage } from "../utils/errorHandler";
import { useToast } from "../context/ToastContext";

export const Dashboard: React.FC = () => {
  const { user, calorieTarget } = useAppStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { error: showError } = useToast();

  const { data: meals = [] } = useMeals(user?._id || null);
  const { data: dailyStats } = useDailyStats(user?._id || null);
  const uploadMealMutation = useUploadMeal();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const formData = new FormData();
      formData.append("image", file);

      await uploadMealMutation.mutateAsync({
        userId: user._id,
        formData,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      showError(errorMsg);
    }
  };

  if (!calorieTarget) {
    return <div className="p-4 text-center">{UZ.common.loading}</div>;
  }

  const consumed = dailyStats?.totalCalories || 0;
  const remaining = Math.max(0, calorieTarget.dailyCalories - consumed);
  const percentage = Math.min(
    100,
    (consumed / calorieTarget.dailyCalories) * 100,
  );

  return (
    <div className="bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Creative Header */}
        <div className="pt-2 mb-6">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-1">
            {UZ.dashboard.title || "Today"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {formatDateWithDay(new Date())}
          </p>
        </div>

        {/* Calorie Progress Ring - Creative Card */}
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 dark:from-cyan-600 dark:to-blue-700 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 mb-6">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 160 160"
                >
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth="8"
                    strokeDasharray={`${(percentage / 100) * 440} 440`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-black">
                    {Math.round(consumed)}
                  </div>
                  <div className="text-cyan-100 text-xs mt-1 font-semibold">
                    {UZ.dashboard.consumed}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-cyan-100 mb-2">
                  {UZ.dashboard.remaining}: {Math.round(remaining)} kkal /{" "}
                  {calorieTarget.dailyCalories} kkal
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Macros Progress - Creative Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-purple-400 to-indigo-500 dark:from-purple-600 dark:to-indigo-700 rounded-2xl p-4 text-white shadow-lg">
            <p className="text-purple-100 text-xs mb-2 font-semibold">
              {UZ.dashboard.protein}
            </p>
            <p className="text-2xl font-black">
              {dailyStats?.totalProtein || 0}g
            </p>
            <p className="text-purple-100 text-xs mt-1">
              / {calorieTarget.macros.protein}g
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-400 to-amber-500 dark:from-yellow-600 dark:to-amber-700 rounded-2xl p-4 text-white shadow-lg">
            <p className="text-yellow-100 text-xs mb-2 font-semibold">
              {UZ.dashboard.carbs}
            </p>
            <p className="text-2xl font-black">
              {dailyStats?.totalCarbs || 0}g
            </p>
            <p className="text-yellow-100 text-xs mt-1">
              / {calorieTarget.macros.carbs}g
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-orange-500 dark:from-orange-600 dark:to-orange-700 rounded-2xl p-4 text-white shadow-lg">
            <p className="text-orange-100 text-xs mb-2 font-semibold">
              {UZ.dashboard.fat}
            </p>
            <p className="text-2xl font-black">{dailyStats?.totalFat || 0}g</p>
            <p className="text-orange-100 text-xs mt-1">
              / {calorieTarget.macros.fat}g
            </p>
          </div>
        </div>

        {/* Today's Meals - Creative Section */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
            {UZ.dashboard.title}
          </h3>
          {meals.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-md">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {UZ.dashboard.noMeals}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {meals.map((meal: Meal) => (
                <MealCard key={meal._id} meal={meal} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button - Creative */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadMealMutation.isPending}
        className="fixed bottom-20 right-2 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 text-white rounded-full p-4 shadow-xl hover:shadow-2xl flex items-center gap-2 transition-all"
      >
        {uploadMealMutation.isPending ? (
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
        ) : (
          <Camera size={24} />
        )}
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

const MealCard: React.FC<{ meal: Meal }> = ({ meal }) => {
  return (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-all border-l-4 border-cyan-500">
      <img
        src={meal.imageUrl}
        alt={meal.aiResult.mealName}
        className="w-16 h-16 rounded-lg object-cover"
      />
      <div className="flex-1">
        <div className="font-bold text-gray-900 dark:text-white">
          {meal.aiResult.mealName}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-0.5">
          <div className="flex gap-3">
            <span className="font-semibold text-red-600 dark:text-red-400">
              {meal.aiResult.calories} kkal
            </span>
            <span className="font-semibold text-yellow-600 dark:text-yellow-400">
              Oqsil: {meal.aiResult.protein}g
            </span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Uglevod: {meal.aiResult.carbs}g
            </span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Yog': {meal.aiResult.fat}g
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

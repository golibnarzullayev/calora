import React from "react";
import { ArrowLeft, Trash2, Flame, Zap, Droplets } from "lucide-react";
import { UZ } from "../constants/uz";
import { formatDateWithTime } from "../utils/dateFormatter";
import { mealAPI } from "../services/api";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/errorHandler";
import type { Meal } from "../store/useAppStore";

interface MealDetailProps {
  meal: Meal;
  onBack: () => void;
  onDelete: () => void;
}

export const MealDetail: React.FC<MealDetailProps> = ({
  meal,
  onBack,
  onDelete,
}) => {
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Siz rostdan ham bu ovqatni o'chirmoqchisiz?")) {
      return;
    }

    setLoading(true);
    try {
      await mealAPI.deleteMeal(meal._id);
      showSuccess(UZ.success.mealDeleted);
      onDelete();
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!meal || !meal.aiResult) {
    return null;
  }

  const macroTotal =
    meal.aiResult.protein + meal.aiResult.carbs + meal.aiResult.fat;
  const proteinPercent = (meal.aiResult.protein / macroTotal) * 100;
  const carbsPercent = (meal.aiResult.carbs / macroTotal) * 100;
  const fatPercent = (meal.aiResult.fat / macroTotal) * 100;

  return (
    <div className="h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="p-4 flex items-center gap-3 max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
            {meal.aiResult.mealName}
          </h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Meal Image */}
        {meal.imageUrl && (
          <div className="rounded-3xl overflow-hidden shadow-lg">
            <img
              src={meal.imageUrl}
              alt={meal.aiResult.mealName}
              className="w-full h-80 object-cover"
            />
          </div>
        )}

        {/* Time Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {UZ.common.time}
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatDateWithTime(meal.createdAt)}
          </p>
        </div>

        {/* Main Calories Card */}
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
          <p className="text-sm opacity-90 mb-2">{UZ.meals.calories}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black">
              {meal.aiResult.calories}
            </span>
            <span className="text-xl opacity-75">kcal</span>
          </div>
        </div>

        {/* Macros Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Protein */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                <Zap
                  size={20}
                  className="text-yellow-600 dark:text-yellow-400"
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {UZ.meals.protein}
              </p>
            </div>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {meal.aiResult.protein}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">g</p>
            <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all"
                style={{ width: `${proteinPercent}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {proteinPercent.toFixed(0)}%
            </p>
          </div>

          {/* Carbs */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Droplets
                  size={20}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {UZ.meals.carbs}
              </p>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {meal.aiResult.carbs}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">g</p>
            <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${carbsPercent}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {carbsPercent.toFixed(0)}%
            </p>
          </div>

          {/* Fat */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                <Flame
                  size={20}
                  className="text-orange-600 dark:text-orange-400"
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {UZ.meals.fat}
              </p>
            </div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {meal.aiResult.fat}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">g</p>
            <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${fatPercent}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {fatPercent.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Batafsil ma'lumot
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">
                Jami Kaloriya
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {meal.aiResult.calories} kcal
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">
                Oqsil (Protein)
              </span>
              <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                {meal.aiResult.protein}g
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">
                Uglevodlar (Carbs)
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {meal.aiResult.carbs}g
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Yog'lar (Fat)
              </span>
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                {meal.aiResult.fat}g
              </span>
            </div>
          </div>
        </div>

        {/* Confidence Score */}
        {meal.aiResult.confidence && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI Aniqlik
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {(meal.aiResult.confidence * 100).toFixed(0)}%
              </p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${meal.aiResult.confidence * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          disabled={loading}
          className="w-full px-4 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          <Trash2 size={18} />
          {loading ? UZ.common.loading : UZ.meals.delete}
        </button>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { mealAPI } from "../services/api";
import { UZ } from "../constants/uz";
import { Trash2, Upload, Camera, ChevronRight } from "lucide-react";
import { useMeals, useRefreshMeals } from "../hooks/useMeals";
import { useToast } from "../hooks/useToast";
import { formatDateWithTime } from "../utils/dateFormatter";
import { getErrorMessage } from "../utils/errorHandler";
import type { Meal } from "../store/useAppStore";

interface MealsProps {
  onMealClick?: (meal: Meal) => void;
}

export const Meals: React.FC<MealsProps> = ({ onMealClick }) => {
  const { user } = useAppStore();
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: meals = [] } = useMeals(user?._id || null);
  const refreshMeals = useRefreshMeals();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      await mealAPI.uploadMeal(user._id, formData);
      setSelectedFile(null);
      setPreview("");
      refreshMeals();
      showSuccess(UZ.success.mealAdded);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mealId: string) => {
    try {
      await mealAPI.deleteMeal(mealId);
      refreshMeals();
      showSuccess(UZ.success.mealDeleted);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      showError(errorMsg);
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 h-full overflow-y-auto">
      <div className="p-4 max-w-2xl mx-auto">
        {/* Creative Header */}
        <div className="mb-8 pt-2">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
            {UZ.meals.title}
          </h1>
        </div>

        {/* Upload Section - Creative Card */}
        <div className="mb-6">
          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative overflow-hidden rounded-3xl cursor-pointer group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-green-400 to-emerald-500 dark:from-green-600 dark:to-emerald-700 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all">
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
                    <Camera size={40} className="text-white" />
                  </div>
                  <span className="text-lg font-bold mb-1">
                    {UZ.meals.uploadImage}
                  </span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-lg space-y-3">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-2xl"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview("");
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  {UZ.common.cancel}
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-sm hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <Upload size={16} />
                  {loading ? UZ.common.loading : UZ.meals.uploadImage}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Meals List */}
        <div className="space-y-3">
          {meals.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-md">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {UZ.meals.notFoundFood}
              </p>
            </div>
          ) : (
            meals.map((meal: Meal) => {
              if (!meal || !meal.aiResult) {
                return null;
              }
              return (
                <div
                  key={meal._id}
                  onClick={() => onMealClick?.(meal)}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all border-l-4 border-orange-500 cursor-pointer group"
                >
                  {meal.imageUrl && (
                    <img
                      src={meal.imageUrl}
                      alt={meal.aiResult.mealName}
                      className="w-full h-40 object-cover rounded-xl mb-4"
                    />
                  )}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {meal.aiResult.mealName}
                      </h3>
                      <ChevronRight
                        size={20}
                        className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-violet-50 dark:bg-violet-900/20 p-3 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">
                          {UZ.meals.calories}
                        </p>
                        <p className="font-bold text-violet-600 dark:text-violet-400 text-sm">
                          {meal.aiResult.calories}
                        </p>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">
                          {UZ.meals.protein}
                        </p>
                        <p className="font-bold text-yellow-600 dark:text-yellow-400 text-sm">
                          {meal.aiResult.protein}g
                        </p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">
                          {UZ.meals.carbs}
                        </p>
                        <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                          {meal.aiResult.carbs}g
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateWithTime(meal.createdAt)}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(meal._id);
                      }}
                      disabled={loading}
                      className="w-full mt-3 px-3 py-2 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg font-semibold text-xs hover:bg-red-100 dark:hover:bg-red-900 transition-all flex items-center justify-center gap-1"
                    >
                      <Trash2 size={14} />
                      {UZ.meals.delete}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

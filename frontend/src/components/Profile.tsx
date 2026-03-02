import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { UZ } from "../constants/uz";
import { LogOut, Edit2, Save, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { LogoutModal } from "./LogoutModal";
import {
  useUser,
  useCalorieTarget,
  useUpdateWeight,
} from "../hooks/useQueries";

export const Profile: React.FC = () => {
  const { user: storeUser, reset, logout } = useAppStore();
  const { theme, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [formData, setFormData] = useState({
    weight: storeUser?.weight || 0,
  });

  const { data: user } = useUser(storeUser?._id || null);
  const { data: calorieTarget } = useCalorieTarget(storeUser?._id || null);
  const updateWeightMutation = useUpdateWeight();

  const handleWeightUpdate = async () => {
    if (!storeUser) return;

    try {
      await updateWeightMutation.mutateAsync({
        userId: storeUser._id,
        weight: formData.weight,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    reset();
    logout();
  };

  if (!user || !calorieTarget) {
    return (
      <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">{UZ.common.loading}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 h-full overflow-y-auto">
      <div className="p-4 max-w-2xl mx-auto">
        {/* Creative Header Card */}
        <div className="relative mb-8 pt-2">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl blur-xl opacity-20"></div>
          <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-black mb-1">{user.firstName}</h1>
                <p className="text-blue-100 text-sm font-semibold">
                  {user.lastName}
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
                title={theme === "light" ? "Dark mode" : "Light mode"}
              >
                {theme === "light" ? (
                  <Moon size={24} className="text-white" />
                ) : (
                  <Sun size={24} className="text-yellow-300" />
                )}
              </button>
            </div>
            <div className="flex gap-4 mt-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex-1">
                <p className="text-blue-100 text-xs mb-1">
                  {UZ.profile.weight}
                </p>
                <p className="text-2xl font-black">{user.weight} kg</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex-1">
                <p className="text-blue-100 text-xs mb-1">{UZ.profile.age}</p>
                <p className="text-2xl font-black">{user.age}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex-1">
                <p className="text-blue-100 text-xs mb-1">
                  {UZ.profile.height}
                </p>
                <p className="text-2xl font-black">{user.height} sm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Info - Creative Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border-l-4 border-blue-500">
            <p className="text-gray-600 dark:text-gray-400 text-xs mb-1 font-semibold">
              {UZ.profile.firstName}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {user.firstName}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border-l-4 border-purple-500">
            <p className="text-gray-600 dark:text-gray-400 text-xs mb-1 font-semibold">
              {UZ.profile.lastName}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {user.lastName}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border-l-4 border-indigo-500">
            <p className="text-gray-600 dark:text-gray-400 text-xs mb-1 font-semibold">
              {UZ.profile.phone}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {user.phoneNumber}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border-l-4 border-pink-500">
            <p className="text-gray-600 dark:text-gray-400 text-xs mb-1 font-semibold">
              {UZ.profile.goal}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {UZ.onboarding[`goal_${user.goal}` as keyof typeof UZ.onboarding]}
            </p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md mb-4 hidden">
          <h2 className="font-bold text-gray-800 dark:text-white mb-4">
            {UZ.profile.personalInfo}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {UZ.profile.firstName}
              </span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {user.firstName}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {UZ.profile.lastName}
              </span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {user.lastName}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {UZ.profile.phone}
              </span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {user.phoneNumber}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {UZ.profile.age}
              </span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {user.age} {UZ.onboarding.times_per_week}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {UZ.profile.height}
              </span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {user.height} sm
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {UZ.profile.goal}
              </span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {
                  UZ.onboarding[
                    `goal_${user.goal}` as keyof typeof UZ.onboarding
                  ]
                }
              </span>
            </div>
          </div>
        </div>

        {/* Weight Management - Creative Card */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
            {UZ.profile.updateWeight}
          </h3>
          {isEditing ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weight: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="kg"
                />
                <span className="flex items-center text-gray-600 dark:text-gray-400 font-semibold">
                  kg
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  {UZ.common.cancel}
                </button>
                <button
                  onClick={handleWeightUpdate}
                  disabled={updateWeightMutation.isPending}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-sm hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-1"
                >
                  <Save size={16} />
                  {updateWeightMutation.isPending
                    ? UZ.common.loading
                    : UZ.common.save}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 dark:from-emerald-600 dark:to-teal-700 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-emerald-100 text-sm mb-2 font-semibold">
                Current Weight
              </p>
              <div className="flex justify-between items-end">
                <p className="text-5xl font-black">{user.weight}</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <Edit2 size={20} className="text-white" />
                </button>
              </div>
              <p className="text-emerald-100 text-xs mt-2">kg</p>
            </div>
          )}
        </div>

        {/* Calorie Target - Creative Grid */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
            {UZ.profile.calorieTarget}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-orange-400 to-red-500 dark:from-orange-600 dark:to-red-700 rounded-2xl p-4 text-white shadow-lg">
              <p className="text-orange-100 text-xs mb-2 font-semibold">
                {UZ.profile.bmr}
              </p>
              <p className="text-2xl font-black">{calorieTarget.bmr}</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 dark:from-cyan-600 dark:to-blue-700 rounded-2xl p-4 text-white shadow-lg">
              <p className="text-cyan-100 text-xs mb-2 font-semibold">
                {UZ.profile.tdee}
              </p>
              <p className="text-2xl font-black">{calorieTarget.tdee}</p>
            </div>
            <div className="bg-gradient-to-br from-violet-400 to-purple-500 dark:from-violet-600 dark:to-purple-700 rounded-2xl p-4 text-white shadow-lg">
              <p className="text-violet-100 text-xs mb-2 font-semibold">
                Daily
              </p>
              <p className="text-2xl font-black">
                {calorieTarget.dailyCalories}
              </p>
            </div>
          </div>
        </div>

        {/* Macro Target - Creative Cards */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
            {UZ.profile.macroTarget}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-yellow-400 to-amber-500 dark:from-yellow-600 dark:to-amber-700 rounded-2xl p-4 text-white shadow-lg text-center">
              <p className="text-yellow-100 text-xs mb-2 font-semibold">
                {UZ.meals.protein}
              </p>
              <p className="text-3xl font-black">
                {calorieTarget.macros.protein}
              </p>
              <p className="text-yellow-100 text-xs mt-1">g</p>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-700 rounded-2xl p-4 text-white shadow-lg text-center">
              <p className="text-blue-100 text-xs mb-2 font-semibold">
                {UZ.meals.carbs}
              </p>
              <p className="text-3xl font-black">
                {calorieTarget.macros.carbs}
              </p>
              <p className="text-blue-100 text-xs mt-1">g</p>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 dark:from-green-600 dark:to-emerald-700 rounded-2xl p-4 text-white shadow-lg text-center">
              <p className="text-green-100 text-xs mb-2 font-semibold">
                {UZ.meals.fat}
              </p>
              <p className="text-3xl font-black">{calorieTarget.macros.fat}</p>
              <p className="text-green-100 text-xs mt-1">g</p>
            </div>
          </div>
        </div>

        {/* Logout Button - Creative */}
        <button
          onClick={handleLogoutClick}
          className="w-full px-4 py-4 bg-gradient-to-r from-slate-600 to-gray-700 dark:from-slate-700 dark:to-gray-800 hover:from-slate-700 hover:to-gray-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
        >
          <LogOut size={20} />
          {UZ.profile.logout}
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
};

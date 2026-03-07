import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { UZ } from "../constants/uz";
import { Flame, Zap, Droplets, Activity } from "lucide-react";
import {
  useDailyStats,
  useMonthlyStats,
  useWeeklyStats,
} from "../hooks/useQueries";

export const Stats: React.FC = () => {
  const { user } = useAppStore();
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month">(
    "today",
  );

  const { data: dailyStatsData, isFetching: dailyLoading } = useDailyStats(
    user?._id || null,
    timeframe,
  );
  const { data: weeklyStatsData, isFetching: weeklyLoading } = useWeeklyStats(
    user?._id || null,
    timeframe,
  );
  const { data: monthlyStatsData, isFetching: monthlyLoading } =
    useMonthlyStats(user?._id || null, timeframe);

  const statsData = React.useMemo(() => {
    if (timeframe === "today") return dailyStatsData;

    const source = timeframe === "week" ? weeklyStatsData : monthlyStatsData;

    if (!source) return null;

    return source.reduce(
      (acc: any, item: any) => ({
        totalCalories: acc.totalCalories + item.totalCalories,
        totalProtein: acc.totalProtein + item.totalProtein,
        totalCarbs: acc.totalCarbs + item.totalCarbs,
        totalFat: acc.totalFat + item.totalFat,
        mealCount: acc.mealCount + item.mealCount,
      }),
      {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        mealCount: 0,
      },
    );
  }, [timeframe, dailyStatsData, weeklyStatsData, monthlyStatsData]);

  const getMacroPercentages = () => {
    if (!statsData) return { protein: 0, carbs: 0, fat: 0 };

    const total =
      statsData.totalProtein + statsData.totalCarbs + statsData.totalFat;

    if (total === 0) return { protein: 0, carbs: 0, fat: 0 };

    return {
      protein: Math.round((statsData.totalProtein / total) * 100),
      carbs: Math.round((statsData.totalCarbs / total) * 100),
      fat: Math.round((statsData.totalFat / total) * 100),
    };
  };

  const macroPercentages = getMacroPercentages();

  const isLoading =
    (timeframe === "today" && dailyLoading) ||
    (timeframe === "week" && weeklyLoading) ||
    (timeframe === "month" && monthlyLoading);

  return (
    <div className="bg-gradient-to-b from-white via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 h-full overflow-y-auto overflow-x-hidden">
      <div className="p-3 max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8 pt-6">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
            {UZ.stats.title}
          </h1>
          <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
            {timeframe === "today"
              ? "Bugungi statistika"
              : timeframe === "week"
                ? "Haftalik ko'rsatkich"
                : "Oylik ko'rsatkich"}
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2 mb-8 overflow-hidden">
          {(["today", "week", "month"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                timeframe === tf
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
              }`}
            >
              {tf === "today"
                ? UZ.stats.today
                : tf === "week"
                  ? UZ.stats.week
                  : UZ.stats.month}
            </button>
          ))}
        </div>

        {/* Main Stats Card */}
        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          statsData && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                    {UZ.stats.totalCalories}
                  </p>
                  <p className="text-5xl font-black text-gray-900 dark:text-white">
                    {statsData.totalCalories}
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 text-xs mt-1 font-semibold">
                    kkal
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-400 to-amber-500 p-4 rounded-2xl">
                  <Flame size={32} className="text-white" />
                </div>
              </div>

              {/* Macro Breakdown */}
              <div className="grid grid-cols-3 gap-3">
                <MacroCard
                  icon={<Zap size={20} />}
                  label={UZ.meals.protein}
                  value={statsData.totalProtein}
                  unit="g"
                  percentage={macroPercentages.protein}
                  color="from-yellow-400 to-yellow-500"
                  bgColor="bg-yellow-50"
                />
                <MacroCard
                  icon={<Activity size={20} />}
                  label={UZ.meals.carbs}
                  value={statsData.totalCarbs}
                  unit="g"
                  percentage={macroPercentages.carbs}
                  color="from-blue-400 to-blue-500"
                  bgColor="bg-blue-50"
                />
                <MacroCard
                  icon={<Droplets size={20} />}
                  label={UZ.meals.fat}
                  value={statsData.totalFat}
                  unit="g"
                  percentage={macroPercentages.fat}
                  color="from-green-400 to-green-500"
                  bgColor="bg-green-50"
                />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const MacroCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  percentage: number;
  color: string;
  bgColor: string;
}> = ({ icon, label, value, unit, percentage, color, bgColor }) => {
  const darkBgMap: Record<string, string> = {
    "bg-yellow-50": "dark:bg-yellow-900/20",
    "bg-blue-50": "dark:bg-blue-900/20",
    "bg-green-50": "dark:bg-green-900/20",
  };

  return (
    <div
      className={`${bgColor} ${darkBgMap[bgColor] || "dark:bg-gray-700"} rounded-2xl p-4 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all`}
    >
      <div className={`bg-gradient-to-br ${color} p-2 rounded-lg w-fit mb-3`}>
        <div className="text-white">{icon}</div>
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-xs mb-2 font-semibold">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {value}
        <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
          {unit}
        </span>
      </p>
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
        <div
          className={`bg-gradient-to-r ${color} h-full transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
        {percentage}%
      </p>
    </div>
  );
};

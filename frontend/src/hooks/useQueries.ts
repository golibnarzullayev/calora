import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI, mealAPI, statsAPI } from "../services/api";
import { useAppStore } from "../store/useAppStore";
import type { User, CalorieTarget, DailyStats } from "../store/useAppStore";

// User Queries
export const useUser = (userId: string | null) => {
  const { user: storeUser } = useAppStore();

  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId) return storeUser;
      const response = await userAPI.getUser(userId);
      return response.data.user as User;
    },
    enabled: !!userId,
    initialData: storeUser || undefined,
  });
};

export const useUserWithTelegramId = (telegramId: string | null) => {
  return useQuery({
    queryKey: ["user", telegramId],
    queryFn: async () => {
      if (!telegramId) return null;
      const response = await userAPI.getUserWithTelegramId(telegramId);
      return response.data.user as User;
    },
    enabled: !!telegramId,
  });
};

export const useCalorieTarget = (userId: string | null) => {
  const { calorieTarget: storeCalorieTarget } = useAppStore();

  return useQuery({
    queryKey: ["calorieTarget", userId],
    queryFn: async () => {
      if (!userId) return storeCalorieTarget;
      const response = await userAPI.getUser(userId);
      return response.data.calorieTarget as CalorieTarget;
    },
    enabled: !!userId,
    initialData: storeCalorieTarget || undefined,
  });
};

// Meal Queries
export const useMeals = (userId: string | null) => {
  return useQuery({
    queryKey: ["meals", userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await mealAPI.getTodayMeals(userId);
      return response.data.meals || [];
    },
    enabled: !!userId,
  });
};

export const useMealsByDate = (userId: string | null, date: string) => {
  return useQuery({
    queryKey: ["meals", userId, date],
    queryFn: async () => {
      if (!userId) return [];
      const response = await mealAPI.getMealsByDate(userId, date);
      return response.data.meals || [];
    },
    enabled: !!userId && !!date,
  });
};

// Stats Queries
export const useDailyStats = (userId: string | null, date?: string) => {
  return useQuery({
    queryKey: ["dailyStats", userId, date],
    queryFn: async () => {
      if (!userId) return null;
      const response = await statsAPI.getDailyStats(userId, date);
      return response.data.stats as DailyStats;
    },
    enabled: !!userId,
  });
};

export const useWeeklyStats = (userId: string | null, startDate?: string) => {
  return useQuery({
    queryKey: ["weeklyStats", userId, startDate],
    queryFn: async () => {
      if (!userId) return [];
      const response = await statsAPI.getWeeklyStats(userId, startDate);
      return response.data.stats || [];
    },
    enabled: !!userId,
  });
};

export const useMonthlyStats = (
  userId: string | null,
  year?: number,
  month?: number,
) => {
  return useQuery({
    queryKey: ["monthlyStats", userId, year, month],
    queryFn: async () => {
      if (!userId) return [];
      const response = await statsAPI.getMonthlyStats(userId, year, month);
      return response.data.stats || [];
    },
    enabled: !!userId,
  });
};

export const useWeightProgress = (userId: string | null, days?: number) => {
  return useQuery({
    queryKey: ["weightProgress", userId, days],
    queryFn: async () => {
      if (!userId) return [];
      const response = await statsAPI.getWeightProgress(userId, days);
      return response.data || [];
    },
    enabled: !!userId,
  });
};

// Mutations
export const useCreateOrUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => userAPI.createOrUpdate(data),
    onSuccess: (response) => {
      const userId = response.data.user._id;
      queryClient.setQueryData(["user", userId], response.data.user);
      queryClient.setQueryData(
        ["calorieTarget", userId],
        response.data.calorieTarget,
      );
    },
  });
};

export const useUpdateWeight = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, weight }: { userId: string; weight: number }) =>
      userAPI.updateWeight(userId, weight),
    onSuccess: (response, { userId }) => {
      queryClient.setQueryData(["user", userId], response.data.user);
      queryClient.invalidateQueries({ queryKey: ["calorieTarget", userId] });
    },
  });
};

export const useUploadMeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      formData,
    }: {
      userId: string;
      formData: FormData;
    }) => mealAPI.uploadMeal(userId, formData),
    onSuccess: (_response, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["meals", userId] });
      queryClient.invalidateQueries({ queryKey: ["dailyStats", userId] });
    },
  });
};

export const useDeleteMeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mealId: string) => mealAPI.deleteMeal(mealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
    },
  });
};

export const useRecordWeight = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      weight,
      date,
    }: {
      userId: string;
      weight: number;
      date: string;
    }) => statsAPI.recordWeight(userId, weight, date),
    onSuccess: (_response, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["weightProgress", userId] });
    },
  });
};

// Refresh helpers
export const useRefreshMeals = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["meals"] });
  };
};

export const useRefreshStats = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
    queryClient.invalidateQueries({ queryKey: ["weeklyStats"] });
    queryClient.invalidateQueries({ queryKey: ["monthlyStats"] });
  };
};

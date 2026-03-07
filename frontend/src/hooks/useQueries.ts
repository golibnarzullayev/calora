import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI, mealAPI, statsAPI, subscriptionAPI } from "../services/api";
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
export const useDailyStats = (
  userId: string | null,
  timeframe: "today" | "week" | "month" = "today",
) => {
  return useQuery({
    queryKey: ["dailyStats", userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await statsAPI.getDailyStats(
        userId,
        new Date().toISOString().split("T")[0],
      );
      return response.data.stats as DailyStats;
    },
    enabled: !!userId && timeframe === "today",
  });
};

export const useWeeklyStats = (
  userId: string | null,
  timeframe: "today" | "week" | "month",
) => {
  return useQuery({
    queryKey: ["weeklyStats", userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await statsAPI.getWeeklyStats(userId);
      return response.data.stats || [];
    },
    enabled: !!userId && timeframe === "week",
  });
};

export const useMonthlyStats = (
  userId: string | null,
  timeframe: "today" | "week" | "month",
) => {
  return useQuery({
    queryKey: ["monthlyStats", userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await statsAPI.getMonthlyStats(userId);
      return response.data.stats || [];
    },
    enabled: !!userId && timeframe === "month",
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

// Subscription Queries
export const useSubscriptions = () => {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const response = await subscriptionAPI.getAllSubscriptions();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUserActiveSubscription = () => {
  return useQuery({
    queryKey: ["userActiveSubscription"],
    queryFn: async () => {
      const response = await subscriptionAPI.getUserActiveSubscription();
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useHasActiveSubscription = () => {
  return useQuery({
    queryKey: ["hasActiveSubscription"],
    queryFn: async () => {
      const response = await subscriptionAPI.hasActiveSubscription();
      return response.data.hasActive;
    },
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useCreateSubscriptionOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subscriptionId: string) =>
      subscriptionAPI.createOrder(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userActiveSubscription"] });
      queryClient.invalidateQueries({ queryKey: ["hasActiveSubscription"] });
    },
  });
};

// Admin Queries
export interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  age: number;
  weight: number;
  height: number;
  isAdmin: boolean;
  createdAt: string;
}

export interface AdminOrder {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  subscriptionId: {
    name: string;
    price: number;
  };
  amount: number;
  status: "pending" | "paid" | "cancelled";
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  paidOrders: number;
  pendingOrders: number;
  adminUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
}

export interface AdminPayment {
  _id: string;
  orderId: string;
  userId: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  amount: number;
  status: "pending" | "completed" | "failed";
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export const useAllUsers = (page: number = 1, limit: number = 10) => {
  return useQuery<PaginatedResponse<AdminUser>>({
    queryKey: ["adminUsers", page, limit],
    queryFn: async () => {
      const response = await userAPI.getAllUsers(page, limit);
      return response.data;
    },
  });
};

export const useAllOrders = (page: number = 1, limit: number = 10) => {
  return useQuery<PaginatedResponse<AdminOrder>>({
    queryKey: ["adminOrders", page, limit],
    queryFn: async () => {
      const response = await subscriptionAPI.getAllOrders(page, limit);
      return response.data;
    },
  });
};

export const useAdminStats = () => {
  return useQuery<AdminStats>({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const response = await userAPI.getAdminStats();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const useAdminPayments = (
  days: number = 30,
  page: number = 1,
  limit: number = 10,
) => {
  return useQuery<PaginatedResponse<AdminPayment>>({
    queryKey: ["adminPayments", days, page, limit],
    queryFn: async () => {
      const response = await userAPI.getAdminPayments(days, page, limit);
      return response.data;
    },
  });
};

export const useToggleUserAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) =>
      userAPI.toggleUserAdmin(userId, isAdmin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userAPI.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });
};

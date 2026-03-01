import { useQuery, useQueryClient } from "@tanstack/react-query";
import { mealAPI } from "../services/api";

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

export const useRefreshMeals = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["meals"] });
    queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
  };
};

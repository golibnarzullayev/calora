import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_APP_API_URL || "http://localhost:4040/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: any) => api.post("/auth/register", data),
  login: (phoneNumber: string, password: string) =>
    api.post("/auth/login", { phoneNumber, password }),
  verifyToken: () => api.get("/auth/verify"),
};

export const userAPI = {
  createOrUpdate: (data: any) => api.post("/users", data),
  getUser: (userId: string) => api.get(`/users/${userId}`),
  updateWeight: (userId: string, weight: number) =>
    api.patch(`/users/${userId}/weight`, { weight }),
  getUserWithTelegramId: (telegramId: string) =>
    api.get(`/users/telegram/${telegramId}`),
};

export const mealAPI = {
  uploadMeal: (userId: string, formData: FormData) =>
    api.post(`/meals/${userId}/upload`, formData),
  getTodayMeals: (userId: string) => api.get(`/meals/${userId}/today`),
  getMealsByDate: (userId: string, date: string) =>
    api.get(`/meals/${userId}/by-date`, { params: { date } }),
  deleteMeal: (mealId: string) => api.delete(`/meals/${mealId}`),
};

export const statsAPI = {
  getDailyStats: (userId: string, date?: string) =>
    api.get(`/stats/${userId}/daily`, {
      params: { date: date || new Date().toISOString().split("T")[0] },
    }),
  getWeeklyStats: (userId: string) => api.get(`/stats/${userId}/weekly`),
  getMonthlyStats: (userId: string) => api.get(`/stats/${userId}/monthly`),
  recordWeight: (userId: string, weight: number, date?: string) =>
    api.post(`/stats/${userId}/weight`, {
      weight,
      date: date || new Date().toISOString().split("T")[0],
    }),
  getWeightProgress: (userId: string, days: number = 30) =>
    api.get(`/stats/${userId}/weight-progress`, { params: { days } }),
};

export const subscriptionAPI = {
  getAllSubscriptions: () => api.get("/subscriptions/subscriptions"),
  getSubscriptionById: (id: string) =>
    api.get(`/subscriptions/subscriptions/${id}`),
  getUserActiveSubscription: () => api.get("/subscriptions/user/subscription"),
  getUserSubscriptionHistory: () =>
    api.get("/subscriptions/user/subscription-history"),
  hasActiveSubscription: () => api.get("/subscriptions/user/has-subscription"),
  getUserFeatures: () => api.get("/subscriptions/user/features"),
  createOrder: (subscriptionId: string) =>
    api.post("/subscriptions/orders", { subscriptionId }),
  getOrder: (orderId: string) => api.get(`/subscriptions/orders/${orderId}`),
  getUserOrders: () => api.get("/subscriptions/user/orders"),
};

export const paymentAPI = {
  getPaymentStatus: (orderId: string) =>
    api.get(`/payments/payment-status/${orderId}`),
};

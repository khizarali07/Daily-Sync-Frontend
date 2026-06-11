import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;
  const stored = localStorage.getItem("auth-storage");
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch (e) {
      console.error("Failed to parse auth storage", e);
    }
  }
  return config;
});

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post("/api/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),
  verifyEmail: (data: { email: string; otp: string }) =>
    api.post("/api/auth/verify-email", data),
  resendOTP: (data: { email: string }) =>
    api.post("/api/auth/resend-otp", data),
  forgotPassword: (data: { email: string }) =>
    api.post("/api/auth/forgot-password", data),
  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post("/api/auth/reset-password", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post("/api/auth/change-password", data),
  me: () => api.get("/api/auth/me"),
};

// Schedule API
export const scheduleApi = {
  uploadCSV: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/schedule/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getTemplates: () => api.get("/api/schedule/templates"),
  createTemplate: (data: {
    name: string;
    startTime: string;
    endTime: string;
    category?: string;
    description?: string;
    daysOfWeek?: string;
  }) => api.post("/api/schedule/templates", data),
  updateTemplate: (id: string, data: {
    name: string;
    startTime: string;
    endTime: string;
    category?: string;
    description?: string;
    daysOfWeek?: string;
  }) => api.put(`/api/schedule/templates/${id}`, data),
  deleteTemplate: (id: string) => api.delete(`/api/schedule/templates/${id}`),
  deleteAllTemplates: () => api.delete("/api/schedule/templates"),
};

// Tasks API
export const tasksApi = {
  getToday: () => api.get("/api/tasks/today"),
  getByDate: (date: string) => api.get(`/api/tasks/${date}`),
  completeTask: (id: string, data: { isCompleted?: boolean; notes?: string; missedReason?: string }) =>
    api.patch(`/api/tasks/${id}/complete`, data),
  updateTask: (id: string, data: {
    name?: string;
    startTime?: string;
    endTime?: string;
    category?: string;
    description?: string;
    notes?: string;
    imageUrl?: string;
    aiData?: object;
  }) =>
    api.patch(`/api/tasks/${id}`, data),
  createTask: (data: { name: string; date: string; startTime: string; endTime: string; category?: string }) =>
    api.post("/api/tasks", data),
  deleteTask: (id: string) => api.delete(`/api/tasks/${id}`),
  deleteTasksByDate: (date: string) => api.delete(`/api/tasks/date/${date}`),
};

// AI API
export const aiApi = {
  analyzeFood: (image: string) => api.post("/api/ai/analyze-food", { image }),
  recalculateFood: (foodItems: any[]) => api.post("/api/ai/recalculate-food", { foodItems }),
  analyzeWorkout: (image: string) => api.post("/api/ai/analyze-workout", { image }),
  analyzeGeneral: (image: string, prompt?: string) =>
    api.post("/api/ai/analyze-general", { image, prompt }),
  generateSummary: (date: string) => api.post("/api/ai/generate-summary", { date }),
  getJournal: (date: string) => api.get(`/api/ai/journal/${date}`),
  getJournals: () => api.get("/api/ai/journals"),
  getConsistency: (days?: number) =>
    api.get(`/api/ai/stats/consistency${days ? `?days=${days}` : ""}`),
};

// Health API
export const healthApi = {
  getToday: () => api.get("/api/health/today"),
  getByDate: (date: string) => api.get(`/api/health/${date}`),
  getRange: (startDate: string, endDate: string) =>
    api.get(`/api/health/range?startDate=${startDate}&endDate=${endDate}`),
  upsert: (data: Record<string, unknown>) => api.post("/api/health", data),
  getWeeklyStats: () => api.get("/api/health/stats/weekly"),
  deleteByDate: (date: string) => api.delete(`/api/health/${date}`),
};

// Nutrition Targets API
export const nutritionTargetsApi = {
  getAll: () => api.get("/api/nutrition-targets"),
  updateTarget: (data: { nutrient: string; min?: number | null; max?: number | null; target?: number | null; unit: string }) =>
    api.put("/api/nutrition-targets", data),
  bulkUpdate: (targets: Array<{ nutrient: string; min?: number | null; max?: number | null; target?: number | null; unit: string }>) =>
    api.put("/api/nutrition-targets/bulk", { targets }),
};

// Meals API
export const mealsApi = {
  getByDate: (date: string) => api.get(`/api/meals?date=${date}`),
  create: (data: any) => api.post("/api/meals", data),
  update: (id: string, data: any) => api.put(`/api/meals/${id}`, data),
  delete: (id: string) => api.delete(`/api/meals/${id}`),
};

// Workouts API
export const workoutsApi = {
  getAll: () => api.get("/api/workouts"),
  getById: (id: string) => api.get(`/api/workouts/${id}`),
  create: (data: { name: string; exercises: any[]; estimatedCalories?: number }) => api.post("/api/workouts", data),
  update: (id: string, data: { name?: string; exercises?: any[]; estimatedCalories?: number }) => api.put(`/api/workouts/${id}`, data),
  delete: (id: string) => api.delete(`/api/workouts/${id}`),
};

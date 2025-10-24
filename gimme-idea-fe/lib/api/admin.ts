import { apiClient } from "@/lib/api-client";

export interface SystemStats {
  users: number;
  projects: number;
  feedback: number;
  transactions: number;
}

export const adminApi = {
  clearAllData() {
    return apiClient.delete("/admin/clear-data");
  },
  getStats() {
    return apiClient.get<SystemStats>("/admin/stats");
  },
};

import { apiClient } from "@/services/apiClient";
import type { DashboardStats } from "@/services/types";

export function getDashboardStats(period = "week"): Promise<DashboardStats> {
  return apiClient.get<DashboardStats>(`/stats/dashboard?period=${period}`);
}

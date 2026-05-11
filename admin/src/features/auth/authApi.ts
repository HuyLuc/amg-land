import { apiClient } from "@/services/apiClient";
import type { LoginResponse } from "@/services/types";

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/auth/login", { email, password });
}

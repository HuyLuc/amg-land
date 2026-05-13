import { apiClient } from "@/services/apiClient";
import type { PageResponse, User } from "@/services/types";

export interface UserFilters {
  page?: number;
  limit?: number;
  keyword?: string;
  role?: string;
  isActive?: string;
}

export interface UserPayload {
  email: string;
  password?: string;
  full_name: string;
  phone?: string | null;
  role: User["role"];
  is_active?: boolean;
}

export function listUsers(filters: UserFilters = {}): Promise<PageResponse<User>> {
  const params = new URLSearchParams();
  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 20));
  if (filters.keyword) {
    params.set("keyword", filters.keyword);
  }
  if (filters.role) {
    params.set("role", filters.role);
  }
  if (filters.isActive) {
    params.set("is_active", filters.isActive);
  }
  return apiClient.get<PageResponse<User>>(`/users?${params.toString()}`);
}

export function createUser(payload: UserPayload): Promise<User> {
  return apiClient.post<User>("/users", payload);
}

export function updateUser(userId: string, payload: Partial<Omit<UserPayload, "password">>): Promise<User> {
  return apiClient.put<User>(`/users/${userId}`, payload);
}

export function updateUserPassword(userId: string, password: string): Promise<{ message: string }> {
  return apiClient.put<{ message: string }>(`/users/${userId}/password`, { password });
}

export function deactivateUser(userId: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/users/${userId}`);
}

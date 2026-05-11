import { apiClient } from "@/services/apiClient";
import type { PageResponse, User } from "@/services/types";

export function listUsers(): Promise<PageResponse<User>> {
  return apiClient.get<PageResponse<User>>("/users?limit=50");
}

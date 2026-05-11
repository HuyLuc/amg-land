import { apiClient } from "@/services/apiClient";
import type { PageResponse, Post } from "@/services/types";

export function listPosts(): Promise<PageResponse<Post>> {
  return apiClient.get<PageResponse<Post>>("/posts?limit=50");
}

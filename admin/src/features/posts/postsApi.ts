import { apiClient } from "@/services/apiClient";
import type { Category, PageResponse, Post } from "@/services/types";

export interface PostFilters {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
  category?: string;
  projectId?: string;
  apartmentId?: string;
}

export interface PostPayload {
  title: string;
  excerpt?: string | null;
  content: string;
  category_id: string;
  thumbnail?: string | null;
  project_id?: string | null;
  apartment_id?: string | null;
  status: Post["status"];
  published_at?: string | null;
}

export function listPosts(filters: PostFilters = {}): Promise<PageResponse<Post>> {
  const params = new URLSearchParams();
  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 20));
  if (filters.keyword) params.set("keyword", filters.keyword);
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (filters.projectId) params.set("project_id", filters.projectId);
  if (filters.apartmentId) params.set("apartment_id", filters.apartmentId);
  return apiClient.get<PageResponse<Post>>(`/posts?${params.toString()}`);
}

export function createPost(payload: PostPayload): Promise<Post> {
  return apiClient.post<Post>("/posts", payload);
}

export function updatePost(postId: string, payload: Partial<PostPayload>): Promise<Post> {
  return apiClient.put<Post>(`/posts/${postId}`, payload);
}

export function deletePost(postId: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/posts/${postId}`);
}

export function uploadPostThumbnail(postId: string, file: File): Promise<Post> {
  const body = new FormData();
  body.append("image", file);
  return apiClient.post<Post>(`/posts/${postId}/thumbnail`, body);
}

export function listCategories(): Promise<Category[]> {
  return apiClient.get<Category[]>("/categories");
}

export function createCategory(payload: { name: string; description?: string | null }): Promise<Category> {
  return apiClient.post<Category>("/categories", payload);
}

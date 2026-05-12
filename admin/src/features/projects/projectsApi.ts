import { apiClient } from "@/services/apiClient";
import type { Amenity, Apartment, FloorPlan, PageResponse, Project, ProjectDetail } from "@/services/types";

export interface ProjectFilters {
  page?: number;
  limit?: number;
  keyword?: string;
  district?: string;
  status?: string;
}

export interface ProjectPayload {
  name: string;
  description?: string | null;
  location: string;
  district: string;
  city: string;
  price_from: number;
  status: Project["status"];
}

export interface FloorPlanPayload {
  floor_number: number;
  image_url: string;
  description?: string | null;
}

export function listProjects(filters: ProjectFilters = {}): Promise<PageResponse<Project>> {
  const params = new URLSearchParams({
    page: String(filters.page ?? 1),
    limit: String(filters.limit ?? 20),
  });
  if (filters.keyword?.trim()) {
    params.set("keyword", filters.keyword.trim());
  }
  if (filters.district?.trim()) {
    params.set("district", filters.district.trim());
  }
  if (filters.status) {
    params.set("status", filters.status);
  }
  return apiClient.get<PageResponse<Project>>(`/projects?${params.toString()}`);
}

export function getProjectDetail(slug: string): Promise<ProjectDetail> {
  return apiClient.get<ProjectDetail>(`/projects/${slug}`);
}

export function createProject(payload: ProjectPayload): Promise<Project> {
  return apiClient.post<Project>("/projects", payload);
}

export function updateProject(id: string, payload: Partial<ProjectPayload>): Promise<Project> {
  return apiClient.put<Project>(`/projects/${id}`, payload);
}

export function deleteProject(id: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/projects/${id}`);
}

export function uploadProjectImages(id: string, files: FileList): Promise<Array<{ image_id: string; image_url: string; is_thumbnail: boolean }>> {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append("files", file));
  return apiClient.post<Array<{ image_id: string; image_url: string; is_thumbnail: boolean }>>(`/projects/${id}/images`, formData);
}

export function createFloorPlan(projectId: string, payload: FloorPlanPayload): Promise<FloorPlan> {
  return apiClient.post<FloorPlan>(`/projects/${projectId}/floor-plans`, payload);
}

export function deleteFloorPlan(id: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/floor-plans/${id}`);
}

export function listProjectApartments(projectId: string): Promise<PageResponse<Apartment>> {
  return apiClient.get<PageResponse<Apartment>>(`/projects/${projectId}/apartments?limit=100`);
}

export function listAmenities(): Promise<Amenity[]> {
  return apiClient.get<Amenity[]>("/amenities");
}

export function assignAmenity(projectId: string, amenityId: string): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(`/projects/${projectId}/amenities`, { amenity_id: amenityId });
}

export function unassignAmenity(projectId: string, amenityId: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/projects/${projectId}/amenities/${amenityId}`);
}

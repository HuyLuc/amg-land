import { apiClient } from "@/services/apiClient";
import type { Apartment, ApartmentMedia, PageResponse } from "@/services/types";

export interface ApartmentFilters {
  page?: number;
  limit?: number;
  projectId?: string;
  status?: string;
  floor?: string;
  bedrooms?: string;
  direction?: string;
  priceMin?: string;
  priceMax?: string;
  areaMin?: string;
  areaMax?: string;
}

export interface ApartmentPayload {
  project_id: string;
  code: string;
  floor: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  direction: string;
  price: number;
  status: Apartment["status"];
  feng_shui_element?: string | null;
}

export function listApartments(filters: ApartmentFilters = {}): Promise<PageResponse<Apartment>> {
  const params = new URLSearchParams({
    page: String(filters.page ?? 1),
    limit: String(filters.limit ?? 20),
  });
  if (filters.projectId) {
    params.set("project_id", filters.projectId);
  }
  if (filters.status) {
    params.set("status", filters.status);
  }
  if (filters.floor) {
    params.set("floor", filters.floor);
  }
  if (filters.bedrooms) {
    params.set("bedrooms", filters.bedrooms);
  }
  if (filters.direction) {
    params.set("direction", filters.direction);
  }
  if (filters.priceMin) {
    params.set("price_min", filters.priceMin);
  }
  if (filters.priceMax) {
    params.set("price_max", filters.priceMax);
  }
  if (filters.areaMin) {
    params.set("area_min", filters.areaMin);
  }
  if (filters.areaMax) {
    params.set("area_max", filters.areaMax);
  }
  return apiClient.get<PageResponse<Apartment>>(`/apartments?${params.toString()}`);
}

export function createApartment(payload: ApartmentPayload): Promise<Apartment> {
  return apiClient.post<Apartment>("/apartments", payload);
}

export function getApartment(id: string): Promise<Apartment> {
  return apiClient.get<Apartment>(`/apartments/${id}`);
}

export function updateApartment(id: string, payload: Partial<ApartmentPayload>): Promise<Apartment> {
  return apiClient.put<Apartment>(`/apartments/${id}`, payload);
}

export function deleteApartment(id: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/apartments/${id}`);
}

export function listApartmentMedia(apartmentId: string): Promise<ApartmentMedia[]> {
  return apiClient.get<ApartmentMedia[]>(`/apartments/${apartmentId}/media`);
}

export function uploadApartmentMedia(apartmentId: string, mediaType: "image" | "video", file: File, caption?: string | null): Promise<ApartmentMedia> {
  const formData = new FormData();
  formData.append("media_type", mediaType);
  formData.append("file", file);
  if (caption?.trim()) {
    formData.append("caption", caption.trim());
  }
  return apiClient.post<ApartmentMedia>(`/apartments/${apartmentId}/media`, formData);
}

export function updateApartmentMedia(id: string, payload: { caption?: string | null; sort_order?: number; is_thumbnail?: boolean }): Promise<ApartmentMedia> {
  return apiClient.put<ApartmentMedia>(`/apartment-media/${id}`, payload);
}

export function deleteApartmentMedia(id: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/apartment-media/${id}`);
}

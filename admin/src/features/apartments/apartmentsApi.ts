import { apiClient } from "@/services/apiClient";
import type { Apartment, PageResponse } from "@/services/types";

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

export function updateApartment(id: string, payload: Partial<ApartmentPayload>): Promise<Apartment> {
  return apiClient.put<Apartment>(`/apartments/${id}`, payload);
}

export function deleteApartment(id: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/apartments/${id}`);
}

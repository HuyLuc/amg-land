import { apiClient } from "@/services/apiClient";
import type { Apartment } from "@/services/types";

export interface SearchApartmentsResponse {
  items: Apartment[];
  total: number;
  page: number;
  limit: number;
}

export function searchApartments(): Promise<SearchApartmentsResponse> {
  return apiClient.get<SearchApartmentsResponse>("/search?limit=50");
}

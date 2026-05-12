import { apiClient } from "@/services/apiClient";
import type { Contact, PageResponse } from "@/services/types";

export interface ContactFilters {
  status?: string;
  keyword?: string;
  assignedTo?: string;
  projectId?: string;
}

export function listContacts(page = 1, filters: ContactFilters = {}): Promise<PageResponse<Contact>> {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (filters.status) {
    params.set("status", filters.status);
  }
  if (filters.keyword?.trim()) {
    params.set("keyword", filters.keyword.trim());
  }
  if (filters.assignedTo) {
    params.set("assigned_to", filters.assignedTo);
  }
  if (filters.projectId) {
    params.set("project_id", filters.projectId);
  }
  return apiClient.get<PageResponse<Contact>>(`/contacts?${params.toString()}`);
}

export interface ContactUpdatePayload {
  status?: Contact["status"];
  note?: string | null;
  assigned_to?: string | null;
}

export function updateContact(id: string, payload: ContactUpdatePayload): Promise<Contact> {
  return apiClient.patch<Contact>(`/contacts/${id}`, payload);
}

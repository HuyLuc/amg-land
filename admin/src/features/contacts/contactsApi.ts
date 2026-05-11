import { apiClient } from "@/services/apiClient";
import type { Contact, PageResponse } from "@/services/types";

export function listContacts(page = 1, status = ""): Promise<PageResponse<Contact>> {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (status) {
    params.set("status", status);
  }
  return apiClient.get<PageResponse<Contact>>(`/contacts?${params.toString()}`);
}

export function updateContactStatus(id: string, status: Contact["status"]): Promise<Contact> {
  return apiClient.patch<Contact>(`/contacts/${id}`, { status });
}

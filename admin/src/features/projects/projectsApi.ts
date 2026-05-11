import { apiClient } from "@/services/apiClient";
import type { PageResponse, Project } from "@/services/types";

export function listProjects(): Promise<PageResponse<Project>> {
  return apiClient.get<PageResponse<Project>>("/projects?limit=50");
}

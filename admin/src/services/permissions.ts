import type { AuthUser } from "@/services/types";

export type AppRole = AuthUser["role"];

const consultantRoles: AppRole[] = ["consultant", "editor"];

export function isAdminRole(role: AppRole | undefined): boolean {
  return role === "admin";
}

export function isConsultantRole(role: AppRole | undefined): boolean {
  return Boolean(role && consultantRoles.includes(role));
}

export function isContentRole(role: AppRole | undefined): boolean {
  return role === "content";
}

export function isInternalRole(role: AppRole | undefined): boolean {
  return role === "admin" || role === "content" || isConsultantRole(role);
}

export function getDefaultPath(role: AppRole | undefined): string {
  if (isConsultantRole(role)) {
    return "/contacts";
  }
  if (role === "content") {
    return "/projects";
  }
  return "/dashboard";
}

export function canAccessPath(role: AppRole | undefined, path: string): boolean {
  if (role === "admin") {
    return true;
  }
  if (isConsultantRole(role)) {
    return ["/contacts", "/projects", "/apartments"].some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  }
  if (role === "content") {
    return ["/projects", "/apartments", "/posts"].some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  }
  return false;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "editor" | "viewer";
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_info: AuthUser;
}

export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface DashboardStats {
  period: string;
  visits: number;
  new_contacts: number;
  top_projects: Array<{ id: string; name: string; views: number }>;
  top_apartments: Array<{ id: string; code: string; views: number }>;
}

export interface Contact {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  project_id: string | null;
  message: string | null;
  status: "new" | "processing" | "done";
  assigned_to: string | null;
  note: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  location: string;
  district: string;
  city: string;
  price_from: number;
  status: "draft" | "active" | "closed";
}

export interface Apartment {
  id: string;
  project_id: string;
  code: string;
  floor: number;
  area: string;
  bedrooms: number;
  bathrooms: number;
  direction: string;
  price: number;
  status: "available" | "reserved" | "sold";
  feng_shui_element: string | null;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  thumbnail: string | null;
  category_id: string;
  author_id: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "editor" | "viewer";
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

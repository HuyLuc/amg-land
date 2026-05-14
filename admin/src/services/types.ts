export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "editor" | "consultant" | "content" | "viewer" | "customer";
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
  scope?: "admin" | "consultant";
  visits: number;
  new_contacts: number;
  total_contacts: number;
  project_counts: { total: number; active: number; draft: number; closed: number };
  apartment_counts: { total: number; available: number; reserved: number; sold: number };
  contact_counts: { new: number; processing: number; done: number };
  post_counts: { total: number; published: number; draft: number; archived: number };
  lead_series: Array<{ date: string; total: number; new: number; processing: number; done: number }>;
  top_projects: Array<{ id: string; name: string; views: number }>;
  top_apartments: Array<{ id: string; code: string; project_name: string; views: number }>;
  recent_contacts: Array<{ id: string; full_name: string; phone: string; status: Contact["status"]; project_name: string | null; apartment_code: string | null; created_at: string }>;
  work_items: Array<{ label: string; value: number; tone: "urgent" | "warning" | "ok" }>;
}

export interface Contact {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  project_id: string | null;
  project_name: string | null;
  apartment_id: string | null;
  apartment_code: string | null;
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
  short_description: string | null;
  description: string | null;
  location: string;
  district: string;
  city: string;
  price_from: number;
  status: "draft" | "active" | "closed";
  consultant_id: string | null;
}

export interface ProjectImage {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  is_thumbnail: boolean;
}

export interface FloorPlan {
  id: string;
  project_id: string;
  floor_number: number;
  image_url: string;
  description: string | null;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string | null;
  category: "internal" | "external" | "other";
  description: string | null;
}

export interface ProjectDetail {
  project_detail: Project;
  amenities: Array<{ id: string; name: string; category: string }>;
  floor_plans: FloorPlan[];
  images: ProjectImage[];
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
  consultant_id: string | null;
}

export interface ApartmentMedia {
  id: string;
  apartment_id: string;
  media_type: "image" | "video";
  url: string;
  caption: string | null;
  sort_order: number;
  is_thumbnail: boolean;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  images: string[];
  project_id: string | null;
  apartment_id: string | null;
  author_id: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
  linked_project: Project | null;
  linked_apartment: Apartment | null;
  linked_amenities: Array<{ id: string; name: string; icon: string | null; category: Amenity["category"] }>;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: AuthUser["role"];
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

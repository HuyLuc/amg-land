import type { Apartment, ApartmentMedia, ApartmentStatus, Project, ProjectStatus } from "../../types/domain";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

type ApiPage<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

type ApiProject = {
  id: string;
  slug: string;
  name: string;
  short_description?: string | null;
  description?: string | null;
  location: string;
  district: string;
  city: string;
  price_from: number;
  status: "active" | "closed";
};

type ApiProjectDetail = {
  project_detail: ApiProject;
  amenities: Array<{ id: string; name: string; category: string }>;
  images: Array<{ id: string; image_url: string; caption?: string | null; sort_order: number; is_thumbnail: boolean }>;
};

type ApiApartment = {
  id: string;
  code: string;
  floor: number;
  area: string | number;
  bedrooms: number;
  bathrooms: number;
  direction: "N" | "S" | "E" | "W" | "NE" | "NW" | "SE" | "SW";
  price: number;
  status: ApartmentStatus;
  feng_shui_element?: string | null;
};

type ApiApartmentMedia = {
  id: string;
  apartment_id: string;
  media_type: "image" | "video";
  url: string;
  caption?: string | null;
  sort_order: number;
  is_thumbnail: boolean;
};

const projectStatusLabel: Record<ApiProject["status"], ProjectStatus> = {
  active: "Đang mở bán",
  closed: "Đã bàn giao",
};

const directionLabel: Record<ApiApartment["direction"], string> = {
  N: "Bắc",
  S: "Nam",
  E: "Đông",
  W: "Tây",
  NE: "Đông Bắc",
  NW: "Tây Bắc",
  SE: "Đông Nam",
  SW: "Tây Nam",
};

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(typeof data?.detail === "string" ? data.detail : "Không thể tải dữ liệu dự án.");
  }

  return data as T;
}

function mapApartment(apartment: ApiApartment): Apartment {
  return {
    id: apartment.id,
    code: apartment.code,
    floor: apartment.floor,
    area: Number(apartment.area),
    bedrooms: apartment.bedrooms,
    bathrooms: apartment.bathrooms,
    direction: directionLabel[apartment.direction] ?? apartment.direction,
    price: apartment.price,
    status: apartment.status,
    fengShui: apartment.feng_shui_element ? [apartment.feng_shui_element] : [],
  };
}

function mapProject(detail: ApiProjectDetail, apartments: ApiApartment[]): Project {
  const project = detail.project_detail;
  const gallery = detail.images
    .sort((first, second) => first.sort_order - second.sort_order)
    .map((image) => image.image_url);
  const thumbnail = detail.images.find((image) => image.is_thumbnail)?.image_url ?? gallery[0] ?? null;

  return {
    id: project.id,
    slug: project.slug,
    name: project.name,
    district: project.district,
    city: project.city,
    location: project.location,
    priceFrom: project.price_from,
    status: projectStatusLabel[project.status],
    summary: project.short_description || project.description || "Thông tin dự án đang được AMG Land cập nhật.",
    description: project.description ?? null,
    image: thumbnail,
    gallery,
    amenities: detail.amenities.map((amenity) => amenity.name),
    apartments: apartments.map(mapApartment),
  };
}

async function fetchProject(project: ApiProject): Promise<Project> {
  const [detail, apartments] = await Promise.all([
    fetchJson<ApiProjectDetail>(`/projects/${project.slug}`),
    fetchJson<ApiPage<ApiApartment>>(`/projects/${project.id}/apartments?limit=100`),
  ]);

  return mapProject(detail, apartments.items);
}

export async function fetchProjects(): Promise<Project[]> {
  const page = await fetchJson<ApiPage<ApiProject>>("/projects?status=active&limit=100");
  return Promise.all(page.items.map(fetchProject));
}

export async function fetchApartmentMedia(apartmentId: string): Promise<ApartmentMedia[]> {
  const items = await fetchJson<ApiApartmentMedia[]>(`/apartments/${apartmentId}/media`);
  return items.map((item) => ({
    id: item.id,
    apartmentId: item.apartment_id,
    mediaType: item.media_type,
    url: item.url,
    caption: item.caption ?? null,
    sortOrder: item.sort_order,
    isThumbnail: item.is_thumbnail,
  }));
}

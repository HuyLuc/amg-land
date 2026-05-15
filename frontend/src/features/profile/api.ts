import type { ProjectStatus } from "../../types/domain";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

export type ProfileProject = {
  id: string;
  name: string;
  slug: string;
  location: string;
  district: string;
  city: string;
  priceFrom: number;
  status: ProjectStatus;
  imageUrl: string | null;
};

export type ProfileConsultation = {
  id: string;
  projectName: string | null;
  projectSlug: string | null;
  apartmentCode: string | null;
  message: string | null;
  status: "new" | "processing" | "done";
  createdAt: string;
};

export type ProfileActivity = {
  id: string;
  label: string;
  createdAt: string;
};

export type ProfileSavedCommunityPost = {
  id: string;
  title: string;
  content: string;
  category: string;
  images: string[];
  createdAt: string;
  authorName: string;
};

export type CustomerProfile = {
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
    lastLogin: string | null;
  };
  stats: {
    interestedProjects: number;
    consultationRequests: number;
    unreadNotifications: number;
  };
  interestedProjects: ProfileProject[];
  consultations: ProfileConsultation[];
  activities: ProfileActivity[];
  savedCommunityPosts: ProfileSavedCommunityPost[];
};

type ApiProfile = {
  user: {
    id: string;
    full_name: string;
    email: string;
    phone?: string | null;
    role: string;
    is_active: boolean;
    created_at: string;
    last_login?: string | null;
  };
  stats: {
    interested_projects: number;
    consultation_requests: number;
    unread_notifications: number;
  };
  interested_projects: Array<{
    id: string;
    name: string;
    slug: string;
    location: string;
    district: string;
    city: string;
    price_from: number;
    status: "active" | "closed" | "draft";
    image_url?: string | null;
  }>;
  consultations: Array<{
    id: string;
    project_name?: string | null;
    project_slug?: string | null;
    apartment_code?: string | null;
    message?: string | null;
    status: "new" | "processing" | "done";
    created_at: string;
  }>;
  activities: Array<{
    id: string;
    label: string;
    created_at: string;
  }>;
  saved_community_posts?: Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    images?: string[];
    created_at: string;
    author_name: string;
  }>;
};

const projectStatusLabel: Record<ApiProfile["interested_projects"][number]["status"], ProjectStatus> = {
  active: "Đang mở bán",
  closed: "Đã bàn giao",
  draft: "Sắp mở bán",
};

function mapProfile(data: ApiProfile): CustomerProfile {
  return {
    user: {
      id: data.user.id,
      fullName: data.user.full_name,
      email: data.user.email,
      phone: data.user.phone ?? null,
      role: data.user.role,
      isActive: data.user.is_active,
      createdAt: data.user.created_at,
      lastLogin: data.user.last_login ?? null,
    },
    stats: {
      interestedProjects: data.stats.interested_projects,
      consultationRequests: data.stats.consultation_requests,
      unreadNotifications: data.stats.unread_notifications,
    },
    interestedProjects: data.interested_projects.map((project) => ({
      id: project.id,
      name: project.name,
      slug: project.slug,
      location: project.location,
      district: project.district,
      city: project.city,
      priceFrom: project.price_from,
      status: projectStatusLabel[project.status],
      imageUrl: project.image_url ?? null,
    })),
    consultations: data.consultations.map((item) => ({
      id: item.id,
      projectName: item.project_name ?? null,
      projectSlug: item.project_slug ?? null,
      apartmentCode: item.apartment_code ?? null,
      message: item.message ?? null,
      status: item.status,
      createdAt: item.created_at,
    })),
    activities: data.activities.map((item) => ({
      id: item.id,
      label: item.label,
      createdAt: item.created_at,
    })),
    savedCommunityPosts: (data.saved_community_posts ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      images: item.images ?? [],
      createdAt: item.created_at,
      authorName: item.author_name,
    })),
  };
}

export async function fetchCustomerProfile(accessToken: string): Promise<CustomerProfile> {
  const response = await fetch(`${API_BASE_URL}/profile/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = (await response.json().catch(() => null)) as ApiProfile | { detail?: unknown } | null;

  if (!response.ok) {
    const detail = data && "detail" in data ? data.detail : null;
    throw new Error(typeof detail === "string" ? detail : "Không thể tải hồ sơ khách hàng.");
  }

  return mapProfile(data as ApiProfile);
}

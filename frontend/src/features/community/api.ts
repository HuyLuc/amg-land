import type { CommunityAuthor, CommunityComment, CommunityPost, CommunityPostPayload } from "./types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

type ApiPage<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type CommunityPostPage = {
  items: CommunityPost[];
  total: number;
  page: number;
  limit: number;
};

type ApiCommunityAuthor = {
  id: string | null;
  name: string;
  role: string;
  avatar: string;
};

type ApiCommunityComment = {
  id: string;
  author: ApiCommunityAuthor;
  content: string;
  created_at: string;
};

type ApiCommunityPost = {
  id: string;
  author: ApiCommunityAuthor;
  title: string;
  content: string;
  category: string;
  image_url?: string | null;
  created_at: string;
  likes: number;
  shares: number;
  liked: boolean;
  bookmarked: boolean;
  comments: ApiCommunityComment[];
};

function formatDate(value: string): string {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function authHeaders(token?: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (!(options.body instanceof FormData) && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof data?.detail === "string" ? data.detail : "Không thể tải dữ liệu cộng đồng.");
  }
  return data as T;
}

function mapAuthor(author: ApiCommunityAuthor): CommunityAuthor {
  return {
    id: author.id,
    name: author.name,
    role: author.role,
    avatar: author.avatar,
  };
}

function mapComment(comment: ApiCommunityComment): CommunityComment {
  return {
    id: comment.id,
    author: mapAuthor(comment.author),
    content: comment.content,
    createdAt: formatDate(comment.created_at),
  };
}

function mapPost(post: ApiCommunityPost): CommunityPost {
  return {
    id: post.id,
    author: mapAuthor(post.author),
    title: post.title,
    content: post.content,
    category: post.category,
    createdAt: formatDate(post.created_at),
    image: post.image_url ?? null,
    liked: post.liked,
    bookmarked: post.bookmarked,
    likes: post.likes,
    shares: post.shares,
    comments: post.comments.map(mapComment),
  };
}

export async function fetchCommunityPosts(token?: string | null, pageNumber = 1, limit = 10, mine = false): Promise<CommunityPostPage> {
  const mineQuery = mine ? "&mine=true" : "";
  const page = await fetchJson<ApiPage<ApiCommunityPost>>(`/community/posts?page=${pageNumber}&limit=${limit}${mineQuery}`, {
    headers: authHeaders(token),
  });
  return {
    items: page.items.map(mapPost),
    total: page.total,
    page: page.page,
    limit: page.limit,
  };
}

export async function createCommunityPost(payload: CommunityPostPayload, token: string): Promise<CommunityPost> {
  const post = await fetchJson<ApiCommunityPost>("/community/posts", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return mapPost(post);
}

export async function updateCommunityPost(postId: string, payload: CommunityPostPayload, token: string): Promise<CommunityPost> {
  const post = await fetchJson<ApiCommunityPost>(`/community/posts/${postId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return mapPost(post);
}

export async function deleteCommunityPost(postId: string, token: string): Promise<void> {
  await fetchJson<{ message: string }>(`/community/posts/${postId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function uploadCommunityImage(file: File, token: string): Promise<string> {
  const formData = new FormData();
  formData.append("files", file);
  const uploaded = await fetchJson<Array<{ image_url: string }>>("/community/images", {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });
  return uploaded[0]?.image_url ?? "";
}

export async function addCommunityComment(postId: string, content: string, token: string): Promise<CommunityPost> {
  const post = await fetchJson<ApiCommunityPost>(`/community/posts/${postId}/comments`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ content }),
  });
  return mapPost(post);
}

export async function toggleCommunityLike(postId: string, token: string): Promise<CommunityPost> {
  const post = await fetchJson<ApiCommunityPost>(`/community/posts/${postId}/like`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return mapPost(post);
}

export async function toggleCommunityBookmark(postId: string, token: string): Promise<CommunityPost> {
  const post = await fetchJson<ApiCommunityPost>(`/community/posts/${postId}/bookmark`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return mapPost(post);
}

import type { Post } from "../../types/domain";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

type ApiPage<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

type ApiPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  images?: string[] | null;
  published_at?: string | null;
  created_at: string;
};

type ApiExternalNewsArticle = {
  id: string;
  title: string;
  excerpt: string;
  content?: string | null;
  image_url?: string | null;
  published_at?: string | null;
  source_name: string;
  source_url?: string | null;
  article_url: string;
};

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(typeof data?.detail === "string" ? data.detail : "Không thể tải dữ liệu tin tức.");
  }

  return data as T;
}

function htmlToPlainText(value: string): string {
  return value
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?p>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

function formatPostDate(value: string | null | undefined): string {
  if (!value) return "Đang cập nhật";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function mapPost(post: ApiPost): Post {
  const plainContent = htmlToPlainText(post.content ?? "");
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt?.trim() || plainContent || "AMG Land đang cập nhật nội dung bài viết.",
    content: post.content ?? "",
    images: post.images ?? [],
    date: formatPostDate(post.published_at ?? post.created_at),
  };
}

export async function fetchPosts(limit = 20): Promise<Post[]> {
  const page = await fetchJson<ApiPage<ApiPost>>(`/posts?limit=${limit}`);
  return page.items.map(mapPost);
}

export async function fetchPost(slug: string): Promise<Post> {
  const post = await fetchJson<ApiPost>(`/posts/${slug}`);
  return mapPost(post);
}

function mapExternalArticle(article: ApiExternalNewsArticle): Post {
  return {
    id: article.id,
    title: article.title,
    excerpt: article.excerpt?.trim() || "Đang cập nhật mô tả bài viết.",
    content: article.content ?? "",
    images: article.image_url ? [article.image_url] : [],
    date: formatPostDate(article.published_at),
    sourceName: article.source_name,
    sourceUrl: article.source_url ?? undefined,
    externalUrl: article.article_url,
    isExternal: true,
  };
}

export type ExternalNewsFilters = {
  page?: number;
  limit?: number;
};

export async function fetchExternalNews(filters: ExternalNewsFilters = {}): Promise<{ items: Post[]; total: number; page: number; limit: number }> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const page = await fetchJson<ApiPage<ApiExternalNewsArticle>>(`/news/external?${params.toString()}`);
  return {
    items: page.items.map(mapExternalArticle),
    total: page.total,
    page: page.page,
    limit: page.limit,
  };
}

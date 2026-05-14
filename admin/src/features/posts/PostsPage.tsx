import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Edit3, FileText, Filter, Plus, Search, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { SelectMenu } from "@/components/SelectMenu";
import { StatusBadge } from "@/components/StatusBadge";
import { listApartmentMedia, listApartments } from "@/features/apartments/apartmentsApi";
import { createCategory, createPost, deletePost, listCategories, listPosts, updatePost } from "@/features/posts/postsApi";
import type { PostPayload } from "@/features/posts/postsApi";
import { getProjectDetail, listProjects } from "@/features/projects/projectsApi";
import type { Apartment, ApartmentMedia, Post, ProjectImage } from "@/services/types";

interface PostFormState {
  title: string;
  excerpt: string;
  content: string;
  category_id: string;
  project_id: string;
  apartment_id: string;
  status: Post["status"];
  thumbnail: string;
}

interface ConfirmState {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

interface PostImageOption {
  id: string;
  url: string;
  label: string;
  source: "project" | "apartment";
}

const emptyForm: PostFormState = {
  title: "",
  excerpt: "",
  content: "",
  category_id: "",
  project_id: "",
  apartment_id: "",
  status: "draft",
  thumbnail: "",
};

const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "draft", label: "Bản nháp" },
  { value: "published", label: "Đã đăng" },
  { value: "archived", label: "Lưu trữ" },
];

const pageSizeOptions = [
  { value: "10", label: "10 / trang" },
  { value: "20", label: "20 / trang" },
  { value: "50", label: "50 / trang" },
];

function formatDate(value: string | null): string {
  if (!value) return "Chưa đăng";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function summarizeContent(post: Post): string {
  if (post.excerpt?.trim()) return post.excerpt;
  const text = (post.content ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text || "Chưa có mô tả ngắn.";
}

export function PostsPage(): JSX.Element {
  const queryClient = useQueryClient();
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [projectId, setProjectId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [form, setForm] = useState<PostFormState>(emptyForm);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmState | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => setKeyword(keywordInput.trim()), 350);
    return () => window.clearTimeout(handle);
  }, [keywordInput]);

  useEffect(() => {
    setPage(1);
  }, [keyword, status, category, projectId, pageSize]);

  const postsQuery = useQuery({
    queryKey: ["posts", page, pageSize, keyword, status, category, projectId],
    queryFn: () => listPosts({ page, limit: pageSize, keyword, status, category, projectId }),
  });
  const allPostsQuery = useQuery({ queryKey: ["posts", "summary"], queryFn: () => listPosts({ limit: 100 }) });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const projectsQuery = useQuery({ queryKey: ["projects", "post-options"], queryFn: () => listProjects({ limit: 100 }) });
  const apartmentsQuery = useQuery({
    queryKey: ["apartments", "post-options", form.project_id],
    queryFn: () => listApartments({ limit: 100, projectId: form.project_id }),
    enabled: formOpen && Boolean(form.project_id),
  });

  const posts = postsQuery.data?.items ?? [];
  const allPosts = allPostsQuery.data?.items ?? [];
  const categories = categoriesQuery.data ?? [];
  const projects = projectsQuery.data?.items ?? [];
  const apartments = apartmentsQuery.data?.items ?? [];
  const selectedProject = projects.find((item) => item.id === form.project_id) ?? null;
  const projectImagesQuery = useQuery({
    queryKey: ["project-detail", selectedProject?.slug, "post-images"],
    queryFn: () => getProjectDetail(selectedProject?.slug ?? ""),
    enabled: formOpen && Boolean(selectedProject?.slug),
  });
  const apartmentMediaQuery = useQuery({
    queryKey: ["apartment-media", form.apartment_id, "post-images"],
    queryFn: () => listApartmentMedia(form.apartment_id),
    enabled: formOpen && Boolean(form.apartment_id),
  });
  const totalPages = Math.max(1, Math.ceil((postsQuery.data?.total ?? 0) / (postsQuery.data?.limit ?? pageSize)));

  const categoryOptions = useMemo(() => [{ value: "", label: "Tất cả danh mục" }, ...categories.map((item) => ({ value: item.slug, label: item.name }))], [categories]);
  const formCategoryOptions = useMemo(() => categories.map((item) => ({ value: item.id, label: item.name })), [categories]);
  const projectOptions = useMemo(() => [{ value: "", label: "Tất cả dự án" }, ...projects.map((item) => ({ value: item.id, label: item.name }))], [projects]);
  const formProjectOptions = useMemo(() => [{ value: "", label: "Không gắn dự án" }, ...projects.map((item) => ({ value: item.id, label: item.name }))], [projects]);
  const apartmentOptions = useMemo(
    () => [{ value: "", label: form.project_id ? "Không gắn căn hộ" : "Chọn dự án trước" }, ...apartments.map((item: Apartment) => ({ value: item.id, label: `${item.code} - Tầng ${item.floor}` }))],
    [apartments, form.project_id],
  );
  const categoryNameById = useMemo(() => new Map(categories.map((item) => [item.id, item.name])), [categories]);
  const projectNameById = useMemo(() => new Map(projects.map((item) => [item.id, item.name])), [projects]);
  const apartmentCodeById = useMemo(() => new Map(apartments.map((item) => [item.id, item.code])), [apartments]);
  const imageOptions = useMemo<PostImageOption[]>(() => {
    const projectImages =
      projectImagesQuery.data?.images.map((image: ProjectImage) => ({
        id: `project-${image.id}`,
        url: image.image_url,
        label: image.caption || "Ảnh dự án",
        source: "project" as const,
      })) ?? [];
    const apartmentImages =
      apartmentMediaQuery.data
        ?.filter((media: ApartmentMedia) => media.media_type === "image")
        .map((media: ApartmentMedia) => ({
          id: `apartment-${media.id}`,
          url: media.url,
          label: media.caption || "Ảnh căn hộ",
          source: "apartment" as const,
        })) ?? [];
    return [...projectImages, ...apartmentImages];
  }, [apartmentMediaQuery.data, projectImagesQuery.data]);
  const stats = useMemo(
    () => ({
      total: allPosts.length,
      draft: allPosts.filter((item) => item.status === "draft").length,
      published: allPosts.filter((item) => item.status === "published").length,
      archived: allPosts.filter((item) => item.status === "archived").length,
      linked: allPosts.filter((item) => item.project_id || item.apartment_id).length,
    }),
    [allPosts],
  );

  function showToast(message: string): void {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }

  function openCreateForm(): void {
    setEditingPost(null);
    setForm({ ...emptyForm, category_id: categories[0]?.id ?? "" });
    setFormOpen(true);
  }

  function openEditForm(post: Post): void {
    setEditingPost(post);
    setForm({
      title: post.title,
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",
      category_id: post.category_id,
      project_id: post.project_id ?? "",
      apartment_id: post.apartment_id ?? "",
      status: post.status,
      thumbnail: post.thumbnail ?? "",
    });
    setFormOpen(true);
  }

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      setFormOpen(false);
      showToast("Đã tạo bài viết.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ postId, payload }: { postId: string; payload: Partial<PostPayload> }) => updatePost(postId, payload),
    onSuccess: () => {
      setFormOpen(false);
      showToast("Đã cập nhật bài viết.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      showToast("Đã xóa bài viết.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (created) => {
      setCategoryModalOpen(false);
      setCategoryName("");
      setForm((current) => ({ ...current, category_id: created.id }));
      showToast("Đã thêm danh mục.");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim(),
      category_id: form.category_id,
      thumbnail: form.thumbnail.trim() || null,
      project_id: form.project_id || null,
      apartment_id: form.apartment_id || null,
      status: form.status,
      published_at: form.status === "published" ? editingPost?.published_at ?? new Date().toISOString() : null,
    };
    if (editingPost) {
      await updateMutation.mutateAsync({ postId: editingPost.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <section className="page-stack posts-page">
      <PageHeader
        title="Bài viết"
        description="Quản lý nội dung gắn với dự án, căn hộ, chính sách bán hàng và tư vấn mua nhà."
        action={
          <button className="primary-button" type="button" onClick={openCreateForm}>
            <Plus size={17} />
            Thêm bài viết
          </button>
        }
      />

      <div className="post-summary-strip" aria-label="Tổng quan bài viết">
        <button className={status === "" ? "active" : ""} type="button" onClick={() => setStatus("")}>Tổng <strong>{stats.total}</strong></button>
        <button className={status === "published" ? "active" : ""} type="button" onClick={() => setStatus("published")}>Đã đăng <strong>{stats.published}</strong></button>
        <button className={status === "draft" ? "active" : ""} type="button" onClick={() => setStatus("draft")}>Bản nháp <strong>{stats.draft}</strong></button>
        <button className={status === "archived" ? "active" : ""} type="button" onClick={() => setStatus("archived")}>Lưu trữ <strong>{stats.archived}</strong></button>
        <span>Gắn dự án/căn hộ <strong>{stats.linked}</strong></span>
      </div>

      <section className="filter-panel">
        <div className="filter-title">
          <Filter size={18} />
          <span>Bộ lọc bài viết</span>
        </div>
        <div className="posts-filter-grid">
          <label className="search-control">
            <Search size={17} />
            <input value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} placeholder="Tìm theo tiêu đề bài viết..." />
          </label>
          <SelectMenu label="Danh mục" value={category} options={categoryOptions} onChange={setCategory} />
          <SelectMenu label="Dự án liên quan" value={projectId} options={projectOptions} onChange={setProjectId} />
          <SelectMenu label="Trạng thái" value={status} options={statusOptions} onChange={setStatus} />
          <button className="secondary-button filter-reset" type="button" onClick={() => { setKeywordInput(""); setKeyword(""); setCategory(""); setProjectId(""); setStatus(""); }}>Xóa lọc</button>
        </div>
      </section>

      <section className="panel posts-list-panel">
        <div className="panel-header">
          <div>
            <h2>Danh sách bài viết</h2>
            <p>{postsQuery.data?.total ?? 0} bài viết phù hợp với bộ lọc hiện tại</p>
          </div>
        </div>
        {postsQuery.error ? <div className="alert-error">Không tải được bài viết.</div> : null}
        <div className="table-wrap post-table-wrap">
          <table className="post-table">
            <thead>
              <tr>
                <th>Bài viết</th>
                <th>Danh mục</th>
                <th>Liên quan</th>
                <th>Trạng thái</th>
                <th>Ngày đăng</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div className="post-title-cell">
                      {post.thumbnail ? <img src={post.thumbnail} alt={post.title} /> : <span><FileText size={18} /></span>}
                      <div>
                        <strong>{post.title}</strong>
                        <p>{summarizeContent(post)}</p>
                      </div>
                    </div>
                  </td>
                  <td>{categoryNameById.get(post.category_id) ?? "Chưa rõ"}</td>
                  <td>
                    <div className="post-link-cell">
                      <strong>{post.project_id ? projectNameById.get(post.project_id) ?? "Dự án liên quan" : "Không gắn dự án"}</strong>
                      <span>{post.apartment_id ? `Căn ${apartmentCodeById.get(post.apartment_id) ?? post.apartment_id.slice(0, 8)}` : "Không gắn căn hộ"}</span>
                    </div>
                  </td>
                  <td><StatusBadge value={post.status} /></td>
                  <td>{formatDate(post.published_at)}</td>
                  <td>
                    <div className="post-actions">
                      <button type="button" title="Sửa bài viết" aria-label={`Sửa ${post.title}`} onClick={() => openEditForm(post)}><Edit3 size={15} /></button>
                      <button
                        className="danger-text-button"
                        type="button"
                        title="Xóa bài viết"
                        aria-label={`Xóa ${post.title}`}
                        onClick={() => setConfirmDialog({
                          title: "Xóa bài viết",
                          description: `Bạn chắc chắn muốn xóa bài viết "${post.title}"?`,
                          confirmLabel: "Xóa bài viết",
                          onConfirm: () => {
                            setConfirmDialog(null);
                            deleteMutation.mutate(post.id);
                          },
                        })}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {postsQuery.isLoading ? <div className="empty-state">Đang tải dữ liệu...</div> : null}
        {!postsQuery.isLoading && !posts.length ? <div className="empty-state">Chưa có bài viết phù hợp.</div> : null}
        <div className="pagination-bar">
          <div className="pagination-summary">Hiển thị <strong>{posts.length}</strong> / <strong>{postsQuery.data?.total ?? 0}</strong> bài viết</div>
          <div className="pagination-controls">
            <SelectMenu label="Số dòng" value={String(pageSize)} options={pageSizeOptions} onChange={(value) => setPageSize(Number(value))} />
            <button className="pagination-nav" type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={16} /><span>Trước</span></button>
            <button className="active" type="button">{page}</button>
            <button className="pagination-nav" type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}><span>Sau</span><ChevronRight size={16} /></button>
          </div>
        </div>
      </section>

      {formOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setFormOpen(false)}>
          <section className="modal-panel post-form-modal" role="dialog" aria-modal="true" aria-labelledby="post-form-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 id="post-form-title">{editingPost ? "Sửa bài viết" : "Thêm bài viết"}</h2>
                <p>Viết nội dung về dự án, căn hộ, chính sách bán hàng hoặc tư vấn mua nhà.</p>
              </div>
              <button className="icon-button" type="button" aria-label="Đóng form" onClick={() => setFormOpen(false)}><X size={18} /></button>
            </div>
            <form className="post-form" onSubmit={handleSubmit}>
              <div className="post-form-layout">
                <div className="post-form-main">
                  <label>
                    <span>Tiêu đề</span>
                    <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
                  </label>
                  <label>
                    <span>Mô tả ngắn</span>
                    <textarea value={form.excerpt} onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))} maxLength={500} placeholder="Tóm tắt ngắn để hiển thị ở danh sách và SEO." />
                  </label>
                  <label>
                    <span>Nội dung</span>
                    <textarea className="post-content-input" value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} required placeholder="Nhập nội dung bài viết..." />
                  </label>
                </div>
                <aside className="post-form-side">
                  <SelectMenu label="Danh mục" value={form.category_id} options={formCategoryOptions.length ? formCategoryOptions : [{ value: "", label: "Chưa có danh mục" }]} onChange={(value) => setForm((current) => ({ ...current, category_id: value }))} />
                  <button className="secondary-button" type="button" onClick={() => setCategoryModalOpen(true)}>Thêm danh mục</button>
                  <SelectMenu label="Dự án liên quan" value={form.project_id} options={formProjectOptions} onChange={(value) => setForm((current) => ({ ...current, project_id: value, apartment_id: "", thumbnail: "" }))} />
                  <SelectMenu label="Căn hộ liên quan" value={form.apartment_id} options={apartmentOptions} onChange={(value) => setForm((current) => ({ ...current, apartment_id: value, thumbnail: "" }))} />
                  <SelectMenu label="Trạng thái" value={form.status} options={statusOptions.slice(1)} onChange={(value) => setForm((current) => ({ ...current, status: value as Post["status"] }))} />
                  <div className="post-image-library">
                    <div className="post-image-library-head">
                      <strong>Ảnh bài viết</strong>
                      <span>Chọn từ ảnh đã setup của dự án/căn hộ.</span>
                    </div>
                    {form.thumbnail ? (
                      <div className="post-selected-image">
                        <img src={form.thumbnail} alt="Ảnh đang chọn cho bài viết" />
                        <button className="secondary-button" type="button" onClick={() => setForm((current) => ({ ...current, thumbnail: "" }))}>
                          Bỏ chọn
                        </button>
                      </div>
                    ) : null}
                    <div className="post-image-option-grid">
                      {imageOptions.map((image) => (
                        <button
                          key={image.id}
                          className={form.thumbnail === image.url ? "selected" : ""}
                          type="button"
                          onClick={() => setForm((current) => ({ ...current, thumbnail: image.url }))}
                        >
                          <img src={image.url} alt={image.label} />
                          <span>{image.source === "project" ? "Dự án" : "Căn hộ"}</span>
                        </button>
                      ))}
                    </div>
                    {projectImagesQuery.isLoading || apartmentMediaQuery.isLoading ? <p>Đang tải thư viện ảnh...</p> : null}
                    {!projectImagesQuery.isLoading && !apartmentMediaQuery.isLoading && !imageOptions.length ? (
                      <p>Chọn dự án/căn hộ đã có ảnh để dùng cho bài viết.</p>
                    ) : null}
                  </div>
                </aside>
              </div>
              {createMutation.error || updateMutation.error ? <div className="form-error">Không lưu được bài viết. Vui lòng kiểm tra danh mục hoặc dự án/căn hộ liên quan.</div> : null}
              <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={() => setFormOpen(false)} disabled={saving}>Hủy</button>
                <button className="primary-button" type="submit" disabled={saving || !form.category_id}>{saving ? "Đang lưu..." : "Lưu bài viết"}</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {categoryModalOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setCategoryModalOpen(false)}>
          <section className="modal-panel category-form-modal" role="dialog" aria-modal="true" aria-labelledby="category-form-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 id="category-form-title">Thêm danh mục</h2>
                <p>Ví dụ: Tin dự án, Căn hộ nổi bật, Chính sách bán hàng, Tư vấn mua nhà.</p>
              </div>
              <button className="icon-button" type="button" aria-label="Đóng form" onClick={() => setCategoryModalOpen(false)}><X size={18} /></button>
            </div>
            <form className="category-form" onSubmit={(event) => { event.preventDefault(); createCategoryMutation.mutate({ name: categoryName.trim() }); }}>
              <label>
                <span>Tên danh mục</span>
                <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} required />
              </label>
              <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={() => setCategoryModalOpen(false)}>Hủy</button>
                <button className="primary-button" type="submit" disabled={createCategoryMutation.isPending}>{createCategoryMutation.isPending ? "Đang lưu..." : "Lưu danh mục"}</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      <ConfirmDialog open={Boolean(confirmDialog)} title={confirmDialog?.title ?? ""} description={confirmDialog?.description ?? ""} confirmLabel={confirmDialog?.confirmLabel} loading={deleteMutation.isPending} onClose={() => setConfirmDialog(null)} onConfirm={() => confirmDialog?.onConfirm()} />
      {toast ? <div className="toast-message">{toast}</div> : null}
    </section>
  );
}

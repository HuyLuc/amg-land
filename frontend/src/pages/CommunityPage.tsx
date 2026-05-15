import { MessageSquareText, Newspaper, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Page } from "../app/types";
import { CommunityPostCard } from "../features/community/components/CommunityPostCard";
import { PostComposer } from "../features/community/components/PostComposer";
import {
  addCommunityComment,
  createCommunityPost,
  deleteCommunityPost,
  fetchCommunityPosts,
  toggleCommunityBookmark,
  toggleCommunityLike,
  updateCommunityPost,
  uploadCommunityImage,
} from "../features/community/api";
import type { CommunityPost, CommunityPostPayload } from "../features/community/types";
import type { AuthUser } from "../features/auth/types";

type CommunityPageProps = {
  user: AuthUser | null;
  onNavigate: (page: Page) => void;
};

const PAGE_SIZE = 10;
const categoryOptions = ["Tin dự án", "Hỏi đáp", "Thị trường", "Phong thủy", "Kinh nghiệm"];
type CommunityFilter = "all" | "mine";

export function CommunityPage({ user, onNavigate }: CommunityPageProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<CommunityFilter>("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [busyPostId, setBusyPostId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [deletingPost, setDeletingPost] = useState<CommunityPost | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const token = user?.accessToken ?? null;
  const hasMorePosts = posts.length < totalPosts;

  const totalInteractions = useMemo(() => {
    return posts.reduce((total, post) => total + post.likes + post.comments.length, 0);
  }, [posts]);

  const replacePost = (updatedPost: CommunityPost) => {
    setPosts((current) => current.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
  };

  const requireLogin = () => {
    setNotice("Bạn cần đăng nhập để tham gia cộng đồng.");
  };

  useEffect(() => {
    if (filter === "mine" && !token) {
      setFilter("all");
      return;
    }

    let mounted = true;
    setLoading(true);
    setCurrentPage(1);

    fetchCommunityPosts(token, 1, PAGE_SIZE, filter === "mine")
      .then((page) => {
        if (!mounted) return;
        setPosts(page.items);
        setTotalPosts(page.total);
        setError("");
      })
      .catch((fetchError) => {
        if (!mounted) return;
        setError(fetchError instanceof Error ? fetchError.message : "Không thể tải cộng đồng.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [filter, token]);

  const loadMorePosts = async () => {
    if (loadingMore || !hasMorePosts) {
      return;
    }

    const nextPage = currentPage + 1;
    setLoadingMore(true);
    setNotice("");
    try {
      const page = await fetchCommunityPosts(token, nextPage, PAGE_SIZE, filter === "mine");
      setPosts((current) => {
        const existingIds = new Set(current.map((post) => post.id));
        const nextItems = page.items.filter((post) => !existingIds.has(post.id));
        return [...current, ...nextItems];
      });
      setTotalPosts(page.total);
      setCurrentPage(page.page);
    } catch (loadError) {
      setNotice(loadError instanceof Error ? loadError.message : "Không thể tải thêm bài viết.");
    } finally {
      setLoadingMore(false);
    }
  };

  const updatePost = async (postId: string, payload: CommunityPostPayload) => {
    if (!token) {
      requireLogin();
      return;
    }
    setSaving(true);
    setNotice("");
    try {
      const updatedPost = await updateCommunityPost(postId, payload, token);
      replacePost(updatedPost);
      setEditingPost(null);
    } catch (updateError) {
      setNotice(updateError instanceof Error ? updateError.message : "Không thể cập nhật bài viết.");
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async () => {
    if (!token || !deletingPost) {
      return;
    }
    const postId = deletingPost.id;
    setBusyPostId(postId);
    setNotice("");
    try {
      await deleteCommunityPost(postId, token);
      setPosts((current) => current.filter((post) => post.id !== postId));
      setTotalPosts((current) => Math.max(0, current - 1));
      setDeletingPost(null);
    } catch (deleteError) {
      setNotice(deleteError instanceof Error ? deleteError.message : "Không thể xóa bài viết.");
    } finally {
      setBusyPostId(null);
    }
  };

  const createPost = async (payload: CommunityPostPayload) => {
    if (!token) {
      requireLogin();
      return;
    }
    setSaving(true);
    setNotice("");
    try {
      const post = await createCommunityPost(payload, token);
      setPosts((current) => [post, ...current]);
      setTotalPosts((current) => current + 1);
    } catch (createError) {
      setNotice(createError instanceof Error ? createError.message : "Không thể đăng bài.");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File) => {
    if (!token) {
      requireLogin();
      return "";
    }
    setImageUploading(true);
    setNotice("");
    try {
      return await uploadCommunityImage(file, token);
    } catch (uploadError) {
      setNotice(uploadError instanceof Error ? uploadError.message : "Không thể tải ảnh cộng đồng.");
      return "";
    } finally {
      setImageUploading(false);
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!token) {
      requireLogin();
      return;
    }
    setBusyPostId(postId);
    setNotice("");
    try {
      replacePost(await addCommunityComment(postId, content, token));
    } catch (commentError) {
      setNotice(commentError instanceof Error ? commentError.message : "Không thể gửi bình luận.");
    } finally {
      setBusyPostId(null);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!token) {
      requireLogin();
      return;
    }
    setBusyPostId(postId);
    setNotice("");
    try {
      replacePost(await toggleCommunityLike(postId, token));
    } catch (likeError) {
      setNotice(likeError instanceof Error ? likeError.message : "Không thể cập nhật lượt thích.");
    } finally {
      setBusyPostId(null);
    }
  };

  const toggleBookmark = async (postId: string) => {
    if (!token) {
      requireLogin();
      return;
    }
    setBusyPostId(postId);
    setNotice("");
    try {
      replacePost(await toggleCommunityBookmark(postId, token));
    } catch (bookmarkError) {
      setNotice(bookmarkError instanceof Error ? bookmarkError.message : "Không thể lưu bài viết.");
    } finally {
      setBusyPostId(null);
    }
  };

  return (
    <section className="section-wrap">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="section-heading">
            <h1>Cộng đồng AMG Land</h1>
            <p>Không gian chia sẻ tin tức, câu hỏi và kinh nghiệm mua bán bất động sản giữa khách hàng và đội ngũ AMG Land.</p>
          </div>

          {notice ? <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">{notice}</div> : null}
          {error ? <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : null}

          <div className="grid gap-6">
            <PostComposer user={user} loading={saving} imageUploading={imageUploading} onCreatePost={createPost} onUploadImage={uploadImage} onLogin={() => onNavigate("login")} />
            <div className="flex flex-wrap items-center gap-2">
              <button
                className={`rounded border px-4 py-2 text-sm font-semibold transition ${filter === "all" ? "border-brand-900 bg-brand-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-brand-300"}`}
                onClick={() => setFilter("all")}
                type="button"
              >
                Tất cả bài viết
              </button>
              <button
                className={`rounded border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${filter === "mine" ? "border-brand-900 bg-brand-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-brand-300"}`}
                disabled={!token}
                onClick={() => token ? setFilter("mine") : requireLogin()}
                type="button"
              >
                Bài của tôi
              </button>
            </div>
            {loading ? <div className="surface-card rounded p-6 text-center text-slate-600">Đang tải cộng đồng...</div> : null}
            {!loading && posts.length === 0 ? <div className="surface-card rounded p-6 text-center text-slate-600">{filter === "mine" ? "Bạn chưa đăng bài viết cộng đồng nào." : "Chưa có bài đăng cộng đồng."}</div> : null}
            {posts.map((post) => (
              <CommunityPostCard
                key={post.id}
                post={post}
                busy={busyPostId === post.id}
                canInteract={Boolean(token)}
                canManage={Boolean(user?.id && post.author.id === user.id)}
                onAddComment={addComment}
                onBookmark={toggleBookmark}
                onDelete={setDeletingPost}
                onEdit={setEditingPost}
                onLike={toggleLike}
                onRequireLogin={requireLogin}
              />
            ))}
            {!loading && posts.length > 0 ? (
              <div className="flex flex-col items-center gap-3 rounded bg-white p-4 shadow-soft">
                <p className="text-sm font-medium text-slate-600">
                  Đang hiển thị {posts.length} / {totalPosts} bài viết
                </p>
                {hasMorePosts ? (
                  <button className="btn-secondary h-11 px-6 disabled:cursor-not-allowed disabled:opacity-60" disabled={loadingMore} onClick={loadMorePosts} type="button">
                    {loadingMore ? "Đang tải..." : "Xem thêm bài viết"}
                  </button>
                ) : (
                  <p className="text-sm font-semibold text-brand-900">Đã hiển thị tất cả bài viết.</p>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
          <div className="premium-panel rounded p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded bg-brand-900 text-white">
                <Users size={20} />
              </span>
              <div>
                <h2 className="font-semibold text-slate-950">Tổng quan cộng đồng</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <StatRow icon={<Newspaper size={17} />} label="Bài đăng" value={`${totalPosts}`} />
              <StatRow icon={<MessageSquareText size={17} />} label="Tương tác" value={`${totalInteractions}`} />
            </div>
          </div>
        </aside>
      </div>
      {editingPost ? (
        <EditPostModal
          post={editingPost}
          saving={saving}
          imageUploading={imageUploading}
          onClose={() => setEditingPost(null)}
          onSave={updatePost}
          onUploadImage={uploadImage}
        />
      ) : null}
      {deletingPost ? (
        <DeletePostModal
          loading={busyPostId === deletingPost.id}
          post={deletingPost}
          onCancel={() => setDeletingPost(null)}
          onConfirm={deletePost}
        />
      ) : null}
    </section>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-slate-200 px-4 py-3">
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span className="text-brand-900">{icon}</span>
        {label}
      </span>
      <span className="text-sm font-bold text-brand-900">{value}</span>
    </div>
  );
}

function EditPostModal({
  imageUploading,
  onClose,
  onSave,
  onUploadImage,
  post,
  saving,
}: {
  imageUploading?: boolean;
  onClose: () => void;
  onSave: (postId: string, payload: CommunityPostPayload) => Promise<void>;
  onUploadImage: (file: File) => Promise<string>;
  post: CommunityPost;
  saving?: boolean;
}) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [category, setCategory] = useState(post.category);
  const [imageUrl, setImageUrl] = useState(post.image ?? "");

  const titleValid = title.trim().length >= 5;
  const contentValid = content.trim().length >= 10;
  const canSave = titleValid && contentValid && !saving && !imageUploading;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-950">Sửa bài viết</h2>
          <p className="mt-1 text-sm text-slate-600">Cập nhật nội dung bài viết cộng đồng của bạn.</p>
        </div>
        <div className="grid gap-4 p-5">
          <input
            className="h-12 rounded border border-slate-300 bg-white px-4 text-sm font-semibold outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            onChange={(event) => setTitle(event.target.value)}
            value={title}
          />
          <textarea
            className="min-h-32 rounded border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            onChange={(event) => setContent(event.target.value)}
            value={content}
          />
          <div className="grid gap-3 md:grid-cols-[220px_1fr]">
            <select
              className="h-12 rounded border border-slate-300 bg-white px-4 text-sm font-semibold outline-none transition focus:border-brand-700"
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            >
              {categoryOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <label className="flex h-12 cursor-pointer items-center rounded border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600">
              {imageUploading ? "Đang tải ảnh..." : imageUrl ? "Đổi ảnh minh họa" : "Chọn ảnh minh họa"}
              <input
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={imageUploading}
                type="file"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setImageUrl(await onUploadImage(file));
                    event.currentTarget.value = "";
                  }
                }}
              />
            </label>
          </div>
          {imageUrl ? (
            <div className="relative overflow-hidden rounded border border-slate-200">
              <img alt="" className="h-44 w-full object-cover" src={imageUrl} />
              <button className="absolute right-3 top-3 rounded bg-white/95 px-3 py-1 text-xs font-bold text-red-600 shadow-soft" onClick={() => setImageUrl("")} type="button">
                Bỏ ảnh
              </button>
            </div>
          ) : null}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button className="btn-secondary h-11 px-5" onClick={onClose} type="button">
            Hủy
          </button>
          <button
            className="btn-primary h-11 px-5 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canSave}
            onClick={() => onSave(post.id, { title: title.trim(), content: content.trim(), category, image_url: imageUrl || null })}
            type="button"
          >
            {saving ? "Đang lưu..." : "Lưu bài viết"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeletePostModal({ loading, onCancel, onConfirm, post }: { loading?: boolean; onCancel: () => void; onConfirm: () => void; post: CommunityPost }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
      <div className="w-full max-w-md rounded bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
        <h2 className="text-lg font-bold text-slate-950">Xóa bài viết?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Bài viết <span className="font-semibold text-slate-900">"{post.title}"</span> sẽ bị xóa khỏi cộng đồng. Thao tác này không thể hoàn tác.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button className="btn-secondary h-11 px-5" disabled={loading} onClick={onCancel} type="button">
            Hủy
          </button>
          <button className="h-11 rounded bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} onClick={onConfirm} type="button">
            {loading ? "Đang xóa..." : "Xóa bài viết"}
          </button>
        </div>
      </div>
    </div>
  );
}

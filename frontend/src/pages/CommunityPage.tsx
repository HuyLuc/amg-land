import { Flame, MessageSquareText, Newspaper, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Page } from "../app/types";
import { CommunityPostCard } from "../features/community/components/CommunityPostCard";
import { PostComposer } from "../features/community/components/PostComposer";
import {
  addCommunityComment,
  createCommunityPost,
  fetchCommunityPosts,
  toggleCommunityBookmark,
  toggleCommunityLike,
  uploadCommunityImage,
} from "../features/community/api";
import type { CommunityPost, CommunityPostPayload } from "../features/community/types";
import type { AuthUser } from "../features/auth/types";

type CommunityPageProps = {
  user: AuthUser | null;
  onNavigate: (page: Page) => void;
};

const PAGE_SIZE = 10;

export function CommunityPage({ user, onNavigate }: CommunityPageProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [busyPostId, setBusyPostId] = useState<string | null>(null);
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
    let mounted = true;
    setLoading(true);
    setCurrentPage(1);

    fetchCommunityPosts(token, 1, PAGE_SIZE)
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
  }, [token]);

  const loadMorePosts = async () => {
    if (loadingMore || !hasMorePosts) {
      return;
    }

    const nextPage = currentPage + 1;
    setLoadingMore(true);
    setNotice("");
    try {
      const page = await fetchCommunityPosts(token, nextPage, PAGE_SIZE);
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
            {loading ? <div className="surface-card rounded p-6 text-center text-slate-600">Đang tải cộng đồng...</div> : null}
            {!loading && posts.length === 0 ? <div className="surface-card rounded p-6 text-center text-slate-600">Chưa có bài đăng cộng đồng.</div> : null}
            {posts.map((post) => (
              <CommunityPostCard
                key={post.id}
                post={post}
                busy={busyPostId === post.id}
                canInteract={Boolean(token)}
                onAddComment={addComment}
                onBookmark={toggleBookmark}
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
              <StatRow icon={<Flame size={17} />} label="Chủ đề nổi bật" value={posts[0]?.category ?? "Đang cập nhật"} />
            </div>
          </div>
        </aside>
      </div>
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

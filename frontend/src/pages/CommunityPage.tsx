import { Flame, MessageSquareText, Newspaper, ShieldCheck, Users } from "lucide-react";
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

export function CommunityPage({ user, onNavigate }: CommunityPageProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [busyPostId, setBusyPostId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const token = user?.accessToken ?? null;

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
    fetchCommunityPosts(token)
      .then((items) => {
        if (!mounted) return;
        setPosts(items);
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
                <p className="text-sm text-slate-600">Dữ liệu đang lưu trực tiếp trong hệ thống</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <StatRow icon={<Newspaper size={17} />} label="Bài đăng" value={`${posts.length}`} />
              <StatRow icon={<MessageSquareText size={17} />} label="Tương tác" value={`${totalInteractions}`} />
              <StatRow icon={<Flame size={17} />} label="Chủ đề nổi bật" value={posts[0]?.category ?? "Đang cập nhật"} />
            </div>
          </div>

          <div className="rounded bg-brand-900 p-5 text-white shadow-lift">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-gold-400" size={22} />
              <h2 className="font-semibold">Quy tắc đăng bài</h2>
            </div>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-brand-100">
              <li>Chia sẻ thông tin rõ nguồn hoặc trải nghiệm thực tế.</li>
              <li>Không đăng số điện thoại khách hàng nếu chưa có đồng ý.</li>
              <li>Bình luận lịch sự, tập trung vào nhu cầu và giải pháp.</li>
            </ul>
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

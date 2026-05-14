import { Flame, MessageSquareText, Newspaper, ShieldCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { CommunityPostCard } from "../features/community/components/CommunityPostCard";
import { PostComposer } from "../features/community/components/PostComposer";
import { seedCommunityPosts } from "../features/community/data/communityPosts";
import type { CommunityPost } from "../features/community/types";

export function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>(seedCommunityPosts);

  const totalInteractions = useMemo(() => {
    return posts.reduce((total, post) => total + post.likes + post.shares + post.comments.length, 0);
  }, [posts]);

  const createPost = (post: CommunityPost) => {
    setPosts((current) => [post, ...current]);
  };

  const toggleLike = (postId: string) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? Math.max(0, post.likes - 1) : post.likes + 1
            }
          : post
      )
    );
  };

  const toggleBookmark = (postId: string) => {
    setPosts((current) =>
      current.map((post) => (post.id === postId ? { ...post, bookmarked: !post.bookmarked } : post))
    );
  };

  const sharePost = (postId: string) => {
    setPosts((current) => current.map((post) => (post.id === postId ? { ...post, shares: post.shares + 1 } : post)));
  };

  const addComment = (postId: string, content: string) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: `comment-${Date.now()}`,
                  author: "Bạn",
                  content,
                  createdAt: "Vừa xong"
                }
              ]
            }
          : post
      )
    );
  };

  return (
    <section className="section-wrap">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="section-heading">
            <h1>Cộng đồng AMG News</h1>
            <p>Không gian chia sẻ tin tức, câu hỏi và kinh nghiệm mua bán bất động sản theo phong cách bảng tin tương tác.</p>
          </div>

          <div className="grid gap-6">
            <PostComposer onCreatePost={createPost} />
            {posts.map((post) => (
              <CommunityPostCard
                key={post.id}
                post={post}
                onAddComment={addComment}
                onBookmark={toggleBookmark}
                onLike={toggleLike}
                onShare={sharePost}
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
                <p className="text-sm text-slate-600">Hoạt động demo trong phiên hiện tại</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <StatRow icon={<Newspaper size={17} />} label="Bài đăng" value={`${posts.length}`} />
              <StatRow icon={<MessageSquareText size={17} />} label="Tương tác" value={`${totalInteractions}`} />
              <StatRow icon={<Flame size={17} />} label="Chủ đề nổi bật" value="Tin dự án" />
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


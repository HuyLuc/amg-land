import { useEffect, useState } from "react";
import { fetchPosts } from "../features/posts/api";
import { NewsCard } from "../features/posts/components/NewsCard";
import type { Post } from "../types/domain";

type NewsPageProps = {
  onOpenPost: (post: Post) => void;
};

export function NewsPage({ onOpenPost }: NewsPageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    fetchPosts(30)
      .then((items) => {
        if (!mounted) return;
        setPosts(items);
        setError("");
      })
      .catch((fetchError) => {
        if (!mounted) return;
        setError(fetchError instanceof Error ? fetchError.message : "Không thể tải dữ liệu tin tức.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="section-wrap">
      <div className="section-heading">
        <h1>Tin tức bất động sản</h1>
        <p>Thông tin thị trường và kinh nghiệm lựa chọn căn hộ được biên tập cho khách hàng AMG Land.</p>
      </div>
      {loading ? <div className="surface-card rounded p-6 text-center text-slate-600">Đang tải tin tức...</div> : null}
      {error ? <div className="rounded border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : null}
      {!loading && !error && posts.length === 0 ? <div className="surface-card rounded p-6 text-center text-slate-600">Chưa có bài viết đã đăng.</div> : null}
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <NewsCard key={post.id} post={post} onOpen={onOpenPost} />
        ))}
      </div>
    </section>
  );
}

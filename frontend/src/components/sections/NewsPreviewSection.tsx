import { useEffect, useState } from "react";
import { fetchExternalNews } from "../../features/posts/api";
import { NewsCard } from "../../features/posts/components/NewsCard";
import type { Post } from "../../types/domain";

type NewsPreviewSectionProps = {
  onNavigateNews: () => void;
  onOpenPost: (post: Post) => void;
};

export function NewsPreviewSection({ onNavigateNews, onOpenPost }: NewsPreviewSectionProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    fetchExternalNews({ limit: 3 })
      .then((result) => {
        if (!mounted) return;
        setPosts(result.items);
        setError("");
      })
      .catch((fetchError) => {
        if (!mounted) return;
        setError(fetchError instanceof Error ? fetchError.message : "Không thể tải tin tức mới.");
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
        <h2>Tin tức mới</h2>
        <p>Cập nhật thị trường, kinh nghiệm mua căn hộ và góc nhìn phong thủy ứng dụng.</p>
      </div>
      {loading ? <div className="surface-card rounded p-6 text-center text-slate-600">Đang tải tin tức...</div> : null}
      {error ? <div className="rounded border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : null}
      {!loading && !error && posts.length ? (
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <NewsCard key={post.id} post={post} onOpen={onOpenPost} />
          ))} 
        </div>
      ) : null}
      {!loading && !error && posts.length === 0 ? <div className="surface-card rounded p-6 text-center text-slate-600">Chưa có tin tức phù hợp từ nguồn bên ngoài.</div> : null}
      <div className="mt-8 text-center">
        <button className="btn-secondary" onClick={onNavigateNews} type="button">
          Xem tất cả tin tức
        </button>
      </div>
    </section>
  );
}

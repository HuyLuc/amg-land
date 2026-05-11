import { posts } from "../../assets/data/mockData";
import { NewsCard } from "../../features/posts/components/NewsCard";

type NewsPreviewSectionProps = {
  onNavigateNews: () => void;
};

export function NewsPreviewSection({ onNavigateNews }: NewsPreviewSectionProps) {
  return (
    <section className="section-wrap">
      <div className="section-heading">
        <h2>Tin tức mới</h2>
        <p>Cập nhật thị trường, kinh nghiệm mua căn hộ và góc nhìn phong thủy ứng dụng.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <NewsCard key={post.id} post={post} />
        ))}
      </div>
      <div className="mt-8 text-center">
        <button className="btn-secondary" onClick={onNavigateNews} type="button">
          Xem tất cả tin tức
        </button>
      </div>
    </section>
  );
}

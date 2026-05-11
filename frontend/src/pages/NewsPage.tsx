import { posts } from "../assets/data/mockData";
import { NewsCard } from "../features/posts/components/NewsCard";

export function NewsPage() {
  return (
    <section className="section-wrap">
      <div className="section-heading">
        <h1>Tin tức bất động sản</h1>
        <p>Thông tin thị trường và kinh nghiệm lựa chọn căn hộ được biên tập cho khách hàng AMG Land.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <NewsCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}

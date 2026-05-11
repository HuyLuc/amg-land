import type { Post } from "../../../types/domain";

type NewsCardProps = {
  post: Post;
};

export function NewsCard({ post }: NewsCardProps) {
  return (
    <article className="surface-card group overflow-hidden rounded">
      <div className="image-sheen h-52">
        <img alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={post.image} />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
          <span>{post.category}</span>
          <span>{post.date}</span>
        </div>
        <h3 className="font-display mt-4 text-xl font-bold leading-7 text-slate-950">{post.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-700">{post.excerpt}</p>
      </div>
    </article>
  );
}

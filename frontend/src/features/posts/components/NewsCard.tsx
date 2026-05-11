import type { Post } from "../../../types/domain";

type NewsCardProps = {
  post: Post;
};

export function NewsCard({ post }: NewsCardProps) {
  return (
    <article className="overflow-hidden rounded bg-white shadow-soft">
      <img alt={post.title} className="h-52 w-full object-cover" src={post.image} />
      <div className="p-5">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          <span>{post.category}</span>
          <span>{post.date}</span>
        </div>
        <h3 className="mt-4 text-lg font-semibold leading-7 text-slate-950">{post.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>
      </div>
    </article>
  );
}


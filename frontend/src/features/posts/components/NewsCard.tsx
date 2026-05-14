import type { Post } from "../../../types/domain";

type NewsCardProps = {
  post: Post;
  onOpen?: (post: Post) => void;
};

export function NewsCard({ post, onOpen }: NewsCardProps) {
  const coverImage = post.images[0];

  return (
    <article className="surface-card group overflow-hidden rounded">
      <button className="block h-full w-full text-left" type="button" onClick={() => onOpen?.(post)}>
      {coverImage ? (
        <div className="image-sheen h-52">
          <img alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={coverImage} />
        </div>
      ) : null}
      <div className="p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">{post.date}</div>
        <h3 className="font-display mt-4 text-xl font-bold leading-7 text-slate-950">{post.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-700">{post.excerpt}</p>
      </div>
      </button>
    </article>
  );
}

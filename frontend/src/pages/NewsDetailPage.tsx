import { ArrowLeft, CalendarDays } from "lucide-react";
import type { Post } from "../types/domain";

type NewsDetailPageProps = {
  post: Post;
  onBack: () => void;
};

export function NewsDetailPage({ post, onBack }: NewsDetailPageProps) {
  const coverImage = post.images[0];
  const galleryImages = post.images.slice(1);

  return (
    <article className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
          <button className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-brand-900 transition hover:text-gold-500" type="button" onClick={onBack}>
            <ArrowLeft size={17} />
            Quay lại tin tức
          </button>

          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500">
            <span className="inline-flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2">
              <CalendarDays size={16} />
              {post.date}
            </span>
            <span>Tin tức AMG Land</span>
          </div>

          <h1 className="font-display mt-6 max-w-4xl text-4xl font-bold leading-tight text-brand-900 md:text-5xl">{post.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">{post.excerpt}</p>
        </div>
      </section>

      {coverImage ? (
        <section className="mx-auto max-w-5xl px-5 pt-10 lg:px-8">
          <img alt={post.title} className="h-[420px] w-full rounded object-cover shadow-soft" src={coverImage} />
        </section>
      ) : null}

      <section className="section-wrap pt-10">
        <div className="mx-auto max-w-3xl">
          <div className="surface-card rounded p-7 md:p-9">
            {post.content ? (
              <div className="prose prose-slate max-w-none text-[16px] leading-8" dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              <p className="text-[16px] leading-8 text-slate-700">{post.excerpt}</p>
            )}
          </div>

          {galleryImages.length ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {galleryImages.map((imageUrl) => (
                <img key={imageUrl} alt="" className="h-56 w-full rounded object-cover shadow-soft" src={imageUrl} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </article>
  );
}

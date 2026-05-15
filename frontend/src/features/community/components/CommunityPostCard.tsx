import { Bookmark, ChevronLeft, ChevronRight, Heart, MessageCircle, Pencil, Send, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { CommunityPost } from "../types";

type CommunityPostCardProps = {
  post: CommunityPost;
  busy?: boolean;
  canInteract: boolean;
  canManage?: boolean;
  onAddComment: (postId: string, content: string) => Promise<void>;
  onBookmark: (postId: string) => Promise<void>;
  onEdit?: (post: CommunityPost) => void;
  onDelete?: (post: CommunityPost) => void;
  onLike: (postId: string) => Promise<void>;
  onRequireLogin: () => void;
};

export function CommunityPostCard({ post, busy, canInteract, canManage, onAddComment, onBookmark, onEdit, onDelete, onLike, onRequireLogin }: CommunityPostCardProps) {
  const [comment, setComment] = useState("");
  const [expandedComments, setExpandedComments] = useState(post.comments.length <= 1);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const submitComment = async () => {
    if (!comment.trim()) return;
    if (!canInteract) {
      onRequireLogin();
      return;
    }
    await onAddComment(post.id, comment.trim());
    setComment("");
    setExpandedComments(true);
  };

  const images = post.images.length ? post.images : post.image ? [post.image] : [];
  const visibleComments = expandedComments ? post.comments : post.comments.slice(0, 1);

  return (
    <article className="surface-card overflow-hidden rounded">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded bg-brand-900 text-sm font-bold text-white shadow-soft">
              {post.author.avatar}
            </span>
            <div>
              <h3 className="font-semibold text-slate-950">{post.author.name}</h3>
              <p className="text-sm text-slate-600">{post.author.role} · {post.createdAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-900 ring-1 ring-brand-100">
              {post.category}
            </span>
            {canManage ? (
              <div className="flex items-center gap-1">
                <IconButton disabled={busy} label="Sửa bài viết" onClick={() => onEdit?.(post)}>
                  <Pencil size={16} />
                </IconButton>
                <IconButton danger disabled={busy} label="Xóa bài viết" onClick={() => onDelete?.(post)}>
                  <Trash2 size={16} />
                </IconButton>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5">
          <h2 className="font-display text-2xl font-bold leading-8 text-brand-900">{post.title}</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-800">{post.content}</p>
        </div>
      </div>

      {images.length ? <PostImageGrid images={images} title={post.title} onOpen={setLightboxIndex} /> : null}

      <div className="px-5 py-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-sm text-slate-600">
          <span>{post.likes} lượt thích</span>
          <span>{post.comments.length} bình luận</span>
        </div>

        <div className="grid grid-cols-3 gap-2 border-b border-slate-200 py-3">
          <ActionButton active={post.liked} disabled={busy} icon={<Heart size={18} />} label="Thích" onClick={() => canInteract ? onLike(post.id) : onRequireLogin()} />
          <ActionButton icon={<MessageCircle size={18} />} label="Bình luận" onClick={() => canInteract ? setExpandedComments(true) : onRequireLogin()} />
          <ActionButton active={post.bookmarked} disabled={busy} icon={<Bookmark size={18} />} label="Lưu" onClick={() => canInteract ? onBookmark(post.id) : onRequireLogin()} />
        </div>

        {post.comments.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {visibleComments.map((item) => (
              <div className="rounded bg-slate-50 px-4 py-3" key={item.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-950">{item.author.name}</span>
                  <span className="text-xs text-slate-500">{item.createdAt}</span>
                </div>
                <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{item.content}</p>
              </div>
            ))}
            {!expandedComments && post.comments.length > 1 ? (
              <button className="w-fit text-sm font-semibold text-brand-900" onClick={() => setExpandedComments(true)} type="button">
                Xem thêm bình luận
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex gap-3">
          <input
            className="h-11 flex-1 rounded border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            onChange={(event) => setComment(event.target.value)}
            onFocus={() => {
              if (!canInteract) onRequireLogin();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") submitComment();
            }}
            placeholder={canInteract ? "Viết bình luận..." : "Đăng nhập để bình luận..."}
            value={comment}
          />
          <button className="grid h-11 w-11 place-items-center rounded bg-brand-900 text-white transition hover:bg-brand-700 disabled:opacity-50" disabled={busy || !comment.trim()} onClick={submitComment} type="button">
            <Send size={17} />
          </button>
        </div>
      </div>

      {lightboxIndex !== null ? (
        <ImageLightbox
          images={images}
          index={lightboxIndex}
          title={post.title}
          onClose={() => setLightboxIndex(null)}
          onMove={(nextIndex) => setLightboxIndex(nextIndex)}
        />
      ) : null}
    </article>
  );
}

function PostImageGrid({ images, onOpen, title }: { images: string[]; onOpen: (index: number) => void; title: string }) {
  const visibleImages = images.slice(0, 4);
  return (
    <div className={`grid gap-1 border-y border-slate-200 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
      {visibleImages.map((image, index) => (
        <button className="group relative h-56 overflow-hidden bg-slate-100 text-left" key={`${image}-${index}`} onClick={() => onOpen(index)} type="button">
          <img alt={`${title} ${index + 1}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={image} />
          {index === 3 && images.length > 4 ? (
            <span className="absolute inset-0 grid place-items-center bg-slate-950/55 text-2xl font-bold text-white">+{images.length - 4}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

function ImageLightbox({ images, index, onClose, onMove, title }: { images: string[]; index: number; onClose: () => void; onMove: (index: number) => void; title: string }) {
  const previousIndex = (index - 1 + images.length) % images.length;
  const nextIndex = (index + 1) % images.length;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/85 p-4">
      <button aria-label="Đóng ảnh" className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded bg-white/10 text-white transition hover:bg-white/20" onClick={onClose} type="button">
        <X size={22} />
      </button>
      {images.length > 1 ? (
        <>
          <button aria-label="Ảnh trước" className="absolute left-5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded bg-white/10 text-white transition hover:bg-white/20" onClick={() => onMove(previousIndex)} type="button">
            <ChevronLeft size={24} />
          </button>
          <button aria-label="Ảnh sau" className="absolute right-5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded bg-white/10 text-white transition hover:bg-white/20" onClick={() => onMove(nextIndex)} type="button">
            <ChevronRight size={24} />
          </button>
        </>
      ) : null}
      <div className="max-h-[86vh] max-w-5xl">
        <img alt={title} className="max-h-[82vh] w-auto rounded object-contain shadow-[0_24px_80px_rgba(0,0,0,0.35)]" src={images[index]} />
        <p className="mt-3 text-center text-sm font-semibold text-white/80">{index + 1} / {images.length}</p>
      </div>
    </div>
  );
}

function IconButton({ children, danger, disabled, label, onClick }: { children: React.ReactNode; danger?: boolean; disabled?: boolean; label: string; onClick: () => void }) {
  return (
    <button
      aria-label={label}
      className={`grid h-9 w-9 place-items-center rounded border bg-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger ? "border-red-200 text-red-600 hover:bg-red-50" : "border-slate-200 text-brand-900 hover:bg-brand-50"
      }`}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function ActionButton({ active, disabled, icon, label, onClick }: { active?: boolean; disabled?: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        active ? "bg-brand-50 text-brand-900" : "text-slate-700 hover:bg-slate-100 hover:text-brand-900"
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

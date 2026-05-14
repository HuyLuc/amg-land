import { Bookmark, Heart, MessageCircle, Send, Share2 } from "lucide-react";
import { useState } from "react";
import type { CommunityPost } from "../types";

type CommunityPostCardProps = {
  post: CommunityPost;
  busy?: boolean;
  canInteract: boolean;
  onAddComment: (postId: string, content: string) => Promise<void>;
  onBookmark: (postId: string) => Promise<void>;
  onLike: (postId: string) => Promise<void>;
  onShare: (postId: string) => Promise<void>;
  onRequireLogin: () => void;
};

export function CommunityPostCard({ post, busy, canInteract, onAddComment, onBookmark, onLike, onShare, onRequireLogin }: CommunityPostCardProps) {
  const [comment, setComment] = useState("");
  const [expandedComments, setExpandedComments] = useState(post.comments.length <= 1);

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
          <span className="rounded bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-900 ring-1 ring-brand-100">
            {post.category}
          </span>
        </div>

        <div className="mt-5">
          <h2 className="font-display text-2xl font-bold leading-8 text-brand-900">{post.title}</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-800">{post.content}</p>
        </div>
      </div>

      {post.image ? (
        <div className="image-sheen group h-72 overflow-hidden border-y border-slate-200">
          <img alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={post.image} />
        </div>
      ) : null}

      <div className="px-5 py-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-sm text-slate-600">
          <span>{post.likes} lượt thích</span>
          <span>{post.comments.length} bình luận · {post.shares} chia sẻ</span>
        </div>

        <div className="grid grid-cols-4 gap-2 border-b border-slate-200 py-3">
          <ActionButton active={post.liked} disabled={busy} icon={<Heart size={18} />} label="Thích" onClick={() => canInteract ? onLike(post.id) : onRequireLogin()} />
          <ActionButton icon={<MessageCircle size={18} />} label="Bình luận" onClick={() => canInteract ? setExpandedComments(true) : onRequireLogin()} />
          <ActionButton disabled={busy} icon={<Share2 size={18} />} label="Chia sẻ" onClick={() => onShare(post.id)} />
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
    </article>
  );
}

function ActionButton({
  active,
  disabled,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
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

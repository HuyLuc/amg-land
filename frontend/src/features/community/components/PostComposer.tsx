import { ImagePlus, PenLine, Send, Tag } from "lucide-react";
import { useState } from "react";
import type { CommunityPost } from "../types";

type PostComposerProps = {
  onCreatePost: (post: CommunityPost) => void;
};

const categoryOptions = ["Tin dự án", "Hỏi đáp", "Thị trường", "Phong thủy", "Kinh nghiệm"];

export function PostComposer({ onCreatePost }: PostComposerProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(categoryOptions[0]);
  const [image, setImage] = useState("");

  const canSubmit = title.trim().length > 4 && content.trim().length > 10;

  const submitPost = () => {
    if (!canSubmit) return;

    onCreatePost({
      id: `community-${Date.now()}`,
      author: "Bạn",
      avatar: "B",
      role: "Thành viên AMG News",
      title: title.trim(),
      content: content.trim(),
      category,
      createdAt: "Vừa xong",
      image: image.trim() || undefined,
      liked: false,
      bookmarked: false,
      likes: 0,
      shares: 0,
      comments: []
    });

    setTitle("");
    setContent("");
    setImage("");
    setCategory(categoryOptions[0]);
  };

  return (
    <section className="premium-panel overflow-hidden rounded">
      <div className="border-b border-slate-200 bg-brand-900 px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded bg-white/10">
            <PenLine size={19} />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Đăng bài viết mới</h2>
            <p className="text-sm text-brand-100">Chia sẻ tin tức, câu hỏi hoặc kinh nghiệm bất động sản.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5">
        <input
          className="h-12 rounded border border-slate-300 bg-white px-4 text-sm font-semibold outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Tiêu đề bài viết"
          value={title}
        />

        <textarea
          className="min-h-32 rounded border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          onChange={(event) => setContent(event.target.value)}
          placeholder="Bạn muốn chia sẻ điều gì hôm nay?"
          value={content}
        />

        <div className="grid gap-3 md:grid-cols-[1fr_1.3fr]">
          <label className="flex h-12 items-center gap-3 rounded border border-slate-300 bg-white px-4">
            <Tag className="text-brand-900" size={18} />
            <select className="w-full bg-transparent text-sm font-semibold outline-none" onChange={(event) => setCategory(event.target.value)} value={category}>
              {categoryOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="flex h-12 items-center gap-3 rounded border border-slate-300 bg-white px-4">
            <ImagePlus className="text-brand-900" size={18} />
            <input
              className="w-full bg-transparent text-sm outline-none"
              onChange={(event) => setImage(event.target.value)}
              placeholder="URL ảnh minh họa, nếu có"
              value={image}
            />
          </label>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-600">Bài đăng sẽ hiển thị ngay trên bảng tin demo.</p>
          <button className="btn-primary h-11 px-5 disabled:cursor-not-allowed disabled:opacity-45" disabled={!canSubmit} onClick={submitPost} type="button">
            Đăng bài
            <Send size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}


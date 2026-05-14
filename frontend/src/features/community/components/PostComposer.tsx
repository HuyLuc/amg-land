import { ImagePlus, PenLine, Send, Tag } from "lucide-react";
import { useState } from "react";
import type { AuthUser } from "../../auth/types";
import type { CommunityPostPayload } from "../types";

type PostComposerProps = {
  user: AuthUser | null;
  loading?: boolean;
  imageUploading?: boolean;
  onCreatePost: (post: CommunityPostPayload) => Promise<void>;
  onUploadImage: (file: File) => Promise<string>;
  onLogin: () => void;
};

const categoryOptions = ["Tin dự án", "Hỏi đáp", "Thị trường", "Phong thủy", "Kinh nghiệm"];

export function PostComposer({ user, loading, imageUploading, onCreatePost, onUploadImage, onLogin }: PostComposerProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(categoryOptions[0]);
  const [imageUrl, setImageUrl] = useState("");

  const titleValid = title.trim().length >= 5;
  const contentValid = content.trim().length >= 10;
  const canSubmit = Boolean(user) && titleValid && contentValid && !loading && !imageUploading;

  const submitPost = async () => {
    if (!canSubmit) return;
    await onCreatePost({
      title: title.trim(),
      content: content.trim(),
      category,
      image_url: imageUrl || null,
    });
    setTitle("");
    setContent("");
    setImageUrl("");
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

      {!user ? (
        <div className="grid gap-4 p-5">
          <p className="text-sm leading-6 text-slate-700">Bạn cần đăng nhập để đăng bài, bình luận, thích hoặc lưu bài viết trong cộng đồng.</p>
          <button className="btn-primary h-11 w-fit px-5" type="button" onClick={onLogin}>
            Đăng nhập để tham gia
          </button>
        </div>
      ) : (
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
            <label className="flex h-12 cursor-pointer items-center gap-3 rounded border border-slate-300 bg-white px-4">
              <ImagePlus className="text-brand-900" size={18} />
              <span className="flex-1 truncate text-sm font-semibold text-slate-600">
                {imageUploading ? "Đang tải ảnh..." : imageUrl ? "Đã chọn ảnh minh họa" : "Chọn ảnh minh họa"}
              </span>
              <input
                className="hidden"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={imageUploading}
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    const uploadedUrl = await onUploadImage(file);
                    setImageUrl(uploadedUrl);
                    event.currentTarget.value = "";
                  }
                }}
              />
            </label>
          </div>

          {imageUrl ? (
            <div className="relative overflow-hidden rounded border border-slate-200">
              <img alt="" className="h-48 w-full object-cover" src={imageUrl} />
              <button className="absolute right-3 top-3 rounded bg-white/95 px-3 py-1 text-xs font-bold text-red-600 shadow-soft" type="button" onClick={() => setImageUrl("")}>
                Bỏ ảnh
              </button>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              {!titleValid ? "Tiêu đề cần tối thiểu 5 ký tự." : !contentValid ? "Nội dung cần tối thiểu 10 ký tự." : "Bài đăng sẽ được lưu thật vào cộng đồng AMG Land."}
            </p>
            <button className="btn-primary h-11 px-5 disabled:cursor-not-allowed disabled:opacity-45" disabled={!canSubmit} onClick={submitPost} type="button">
              {loading ? "Đang đăng..." : "Đăng bài"}
              <Send size={17} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

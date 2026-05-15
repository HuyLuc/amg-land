import { Check, ChevronDown, ImagePlus, PenLine, Send, Tag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { AuthUser } from "../../auth/types";
import type { CommunityPostPayload } from "../types";

type PostComposerProps = {
  user: AuthUser | null;
  loading?: boolean;
  imageUploading?: boolean;
  onCreatePost: (post: CommunityPostPayload) => Promise<void>;
  onUploadImages: (files: File[]) => Promise<string[]>;
  onLogin: () => void;
};

const categoryOptions = ["Tin dự án", "Hỏi đáp", "Thị trường", "Phong thủy", "Kinh nghiệm"];

export function PostComposer({ user, loading, imageUploading, onCreatePost, onUploadImages, onLogin }: PostComposerProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(categoryOptions[0]);
  const [images, setImages] = useState<string[]>([]);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);

  const titleValid = title.trim().length >= 5;
  const contentValid = content.trim().length >= 10;
  const canSubmit = Boolean(user) && titleValid && contentValid && !loading && !imageUploading;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setCategoryMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const submitPost = async () => {
    if (!canSubmit) return;
    await onCreatePost({
      title: title.trim(),
      content: content.trim(),
      category,
      images,
      image_url: images[0] ?? null,
    });
    setTitle("");
    setContent("");
    setImages([]);
    setCategory(categoryOptions[0]);
  };

  const uploadSelectedImages = async (files: FileList | null) => {
    if (!files?.length) return;
    const uploadedUrls = await onUploadImages(Array.from(files));
    setImages((current) => [...current, ...uploadedUrls].slice(0, 12));
  };

  return (
    <section className="premium-panel overflow-visible rounded">
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
            <div className="relative" ref={categoryMenuRef}>
              <button
                className={`flex h-12 w-full items-center gap-3 rounded border bg-white px-4 text-left transition ${
                  categoryMenuOpen ? "border-brand-500 ring-4 ring-brand-100" : "border-slate-300 hover:border-brand-300"
                }`}
                onClick={() => setCategoryMenuOpen((current) => !current)}
                type="button"
              >
                <Tag className="text-brand-900" size={18} />
                <span className="flex-1 text-sm font-semibold text-slate-900">{category}</span>
                <ChevronDown className={`text-slate-500 transition ${categoryMenuOpen ? "rotate-180" : ""}`} size={17} />
              </button>
              {categoryMenuOpen ? (
                <div className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded border border-slate-200 bg-white p-1 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
                  {categoryOptions.map((option) => (
                    <button
                      className={`flex w-full items-center justify-between rounded px-3 py-2.5 text-left text-sm font-semibold transition ${
                        option === category ? "bg-brand-900 text-white" : "text-slate-700 hover:bg-brand-50 hover:text-brand-900"
                      }`}
                      key={option}
                      onClick={() => {
                        setCategory(option);
                        setCategoryMenuOpen(false);
                      }}
                      type="button"
                    >
                      <span>{option}</span>
                      {option === category ? <Check size={16} /> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <label className="flex h-12 cursor-pointer items-center gap-3 rounded border border-slate-300 bg-white px-4">
              <ImagePlus className="text-brand-900" size={18} />
              <span className="flex-1 truncate text-sm font-semibold text-slate-600">
                {imageUploading ? "Đang tải ảnh..." : images.length ? `Đã chọn ${images.length} ảnh` : "Chọn ảnh minh họa"}
              </span>
              <input
                className="hidden"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={imageUploading}
                onChange={async (event) => {
                  const input = event.currentTarget;
                  await uploadSelectedImages(event.target.files);
                  input.value = "";
                }}
              />
            </label>
          </div>

          {images.length ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {images.map((imageUrl) => (
                <div className="relative overflow-hidden rounded border border-slate-200" key={imageUrl}>
                  <img alt="" className="h-28 w-full object-cover" src={imageUrl} />
                  <button className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded bg-white/95 text-red-600 shadow-soft" type="button" onClick={() => setImages((current) => current.filter((item) => item !== imageUrl))}>
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              {!titleValid ? "Tiêu đề cần tối thiểu 5 ký tự." : !contentValid ? "Nội dung cần tối thiểu 10 ký tự." : "Bài đăng sẽ được lưu vào cộng đồng AMG Land."}
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

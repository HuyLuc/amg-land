import { Bot, MessageCircle, Send, X } from "lucide-react";

type ChatbotProps = {
  open: boolean;
  onToggle: () => void;
};

export function Chatbot({ open, onToggle }: ChatbotProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-4 w-[calc(100vw-40px)] max-w-sm overflow-hidden rounded bg-white shadow-lift ring-1 ring-slate-300 animate-fade-up">
          <div className="flex items-center justify-between bg-[linear-gradient(135deg,#1f3864,#244c82)] px-4 py-3 text-white">
            <div className="flex items-center gap-2 font-semibold">
              <Bot size={19} />
              Tư vấn AMG AI
            </div>
            <button aria-label="Đóng chat" onClick={onToggle} type="button">
              <X size={19} />
            </button>
          </div>
          <div className="grid gap-3 p-4">
            <div className="max-w-[85%] rounded border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 shadow-sm">
              Chào bạn, bạn đang tìm căn hộ theo ngân sách hay theo hướng phong thủy?
            </div>
            <div className="ml-auto max-w-[85%] rounded bg-brand-900 px-4 py-3 text-sm leading-6 text-white">
              Tôi muốn căn 2 phòng ngủ tại Hà Nội.
            </div>
            <div className="rounded border border-brand-200 bg-brand-50 p-3">
              <div className="text-sm font-semibold text-slate-950">Gợi ý nhanh</div>
              <div className="mt-2 text-sm text-slate-800">The Aurora Riverside - căn A-1208, hướng Đông Nam, 78 m2.</div>
            </div>
          </div>
          <div className="flex gap-2 border-t border-slate-100 p-3">
            <input className="h-10 flex-1 rounded border border-slate-200 px-3 text-sm outline-none" placeholder="Nhập câu hỏi..." />
            <button className="grid h-10 w-10 place-items-center rounded bg-brand-900 text-white" type="button">
              <Send size={17} />
            </button>
          </div>
        </div>
      )}
      <button
        aria-label="Mở chatbot"
        className="relative grid h-14 w-14 place-items-center rounded-full bg-brand-900 text-white shadow-gold transition hover:-translate-y-1"
        onClick={onToggle}
        type="button"
      >
        <span className="absolute inset-0 rounded-full bg-gold-400/35 animate-subtle-pulse" />
        <MessageCircle className="relative z-10" size={24} />
      </button>
    </div>
  );
}

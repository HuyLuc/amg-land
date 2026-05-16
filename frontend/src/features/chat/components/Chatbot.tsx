import { Bot, LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchChatHistory, sendChatMessage, type ChatApartmentSuggestion, type ChatMessage } from "../api";

type ChatbotProps = {
  open: boolean;
  onToggle: () => void;
};

const STORAGE_KEY = "amg_chat_session_id";
const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Chào bạn, mình hỗ trợ nhanh về dự án, căn hộ, ngân sách và khu vực Hà Nội.",
  ts: new Date().toISOString(),
};

export function Chatbot({ open, onToggle }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(() => window.localStorage.getItem(STORAGE_KEY));
  const [suggestions, setSuggestions] = useState<ChatApartmentSuggestion[]>([]);

  useEffect(() => {
    if (!open || !sessionId) {
      return;
    }

    let mounted = true;

    fetchChatHistory(sessionId)
      .then((history) => {
        if (!mounted || !history.messages.length) {
          return;
        }
        setMessages(history.messages);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }
        window.localStorage.removeItem(STORAGE_KEY);
        setSessionId(null);
      });

    return () => {
      mounted = false;
    };
  }, [open, sessionId]);

  const submitMessage = async () => {
    const nextMessage = input.trim();
    if (!nextMessage || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: nextMessage,
      ts: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await sendChatMessage(nextMessage, sessionId);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.reply,
          ts: new Date().toISOString(),
        },
      ]);
      setSuggestions(response.suggested_apartments ?? []);
      setSessionId(response.session_id);
      window.localStorage.setItem(STORAGE_KEY, response.session_id);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể gửi câu hỏi lúc này.");
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end sm:bottom-5 sm:right-5">
      {open && (
        <div className="mb-3 w-[min(23rem,calc(100vw-1rem))] overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] ring-1 ring-slate-900/5 animate-fade-up backdrop-blur">
          <div className="relative overflow-hidden bg-[linear-gradient(135deg,#1f3864_0%,#274b7c_100%)] px-4 py-3.5 text-white">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/14 ring-1 ring-white/15">
                  <Bot size={18} />
                </span>
                <div>
                  <div className="font-semibold tracking-[0.01em]">Tư vấn AMG AI</div>
                  <p className="mt-0.5 text-xs text-white/75">Hỏi nhanh về căn hộ, dự án và nhu cầu tại Hà Nội</p>
                </div>
              </div>
              <button
                aria-label="Đóng chat"
                className="grid h-8 w-8 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
                onClick={onToggle}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="max-h-[27rem] overflow-y-auto bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_18%,#ffffff_100%)] px-3.5 py-3.5">
            <div className="grid gap-2.5">
              {messages.map((message, index) => (
                <div
                  className={
                    message.role === "assistant"
                      ? "max-w-[88%] rounded-2xl rounded-tl-md border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                      : "ml-auto max-w-[82%] rounded-2xl rounded-br-md bg-brand-900 px-3.5 py-3 text-sm leading-6 text-white shadow-[0_12px_28px_rgba(31,56,100,0.22)]"
                  }
                  key={`${message.ts}-${index}`}
                >
                  {message.content}
                </div>
              ))}

              {suggestions.length > 0 ? (
                <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-brand-50/75 p-3 shadow-[0_12px_28px_rgba(31,56,100,0.06)]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-slate-950">Gợi ý phù hợp</div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-900 ring-1 ring-brand-100">
                      {suggestions.length} căn
                    </span>
                  </div>
                  <div className="mt-2.5 grid gap-2">
                    {suggestions.map((item) => (
                      <div className="rounded-2xl border border-white bg-white/95 px-3 py-2.5 text-sm leading-5 text-slate-700 shadow-sm" key={item.id}>
                        <div className="font-semibold text-brand-900">{item.project_name}</div>
                        <div className="mt-1 text-slate-600">
                          Căn {item.code} • {item.bedrooms} PN • {Math.round(item.area)} m2
                        </div>
                        <div className="mt-1 font-medium text-slate-800">
                          {new Intl.NumberFormat("vi-VN").format(item.price)} VND • {item.district}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {loading ? (
                <div className="flex items-center gap-2 px-1 text-sm text-slate-500">
                  <LoaderCircle className="animate-spin" size={16} />
                  AMG AI đang trả lời...
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">
                  {error}
                </div>
              ) : null}
            </div>
          </div>

          <div className="border-t border-slate-200/80 bg-white px-3 py-3">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition focus-within:border-brand-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-100/70">
              <input
                className="h-10 flex-1 bg-transparent px-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void submitMessage();
                  }
                }}
                placeholder="Hỏi về căn hộ, dự án, ngân sách..."
                value={input}
              />
              <button
                className="grid h-10 w-10 place-items-center rounded-xl bg-brand-900 text-white shadow-[0_10px_24px_rgba(31,56,100,0.20)] transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading || !input.trim()}
                onClick={() => void submitMessage()}
                type="button"
              >
                <Send size={17} />
              </button>
            </div>
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

  return content;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

export type ChatApartmentSuggestion = {
  id: string;
  project_id: string;
  project_name: string;
  project_slug: string;
  district: string;
  city: string;
  code: string;
  bedrooms: number;
  area: number;
  price: number;
  direction: string;
  feng_shui_element?: string | null;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  ts: string;
};

type ChatMessageResponse = {
  reply: string;
  suggested_apartments: ChatApartmentSuggestion[];
  session_id: string;
};

type ChatHistoryResponse = {
  messages: ChatMessage[];
  created_at: string;
};

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof data?.detail === "string" ? data.detail : "Không thể kết nối chatbot.");
  }
  return data as T;
}

export async function sendChatMessage(message: string, sessionId?: string | null): Promise<ChatMessageResponse> {
  return fetchJson<ChatMessageResponse>("/chat/message", {
    method: "POST",
    body: JSON.stringify({
      message,
      session_id: sessionId ?? null,
    }),
  });
}

export async function fetchChatHistory(sessionId: string): Promise<ChatHistoryResponse> {
  return fetchJson<ChatHistoryResponse>(`/chat/${sessionId}`);
}

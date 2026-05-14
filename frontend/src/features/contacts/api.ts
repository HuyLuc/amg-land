type ContactPayload = {
  full_name: string;
  phone: string;
  email?: string | null;
  project_id?: string | null;
  apartment_id?: string | null;
  message?: string | null;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

export async function createContact(payload: ContactPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 422) {
      throw new Error("Thông tin tư vấn chưa hợp lệ. Vui lòng kiểm tra lại.");
    }
    throw new Error(typeof data?.detail === "string" ? data.detail : "Không thể gửi yêu cầu tư vấn lúc này.");
  }
}

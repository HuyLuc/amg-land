import type { AuthUser } from "./types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

type RegisterPayload = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
};

type AuthResponse = {
  access_token: string;
  refresh_token?: string | null;
  user_info: {
    id?: string;
    full_name?: string;
    email?: string;
    phone?: string | null;
    role?: string;
  };
};

function getApiErrorMessage(status: number, detail: unknown) {
  if (status === 400 && detail === "Email already registered") {
    return "Email này đã được đăng ký.";
  }

  if (status === 422) {
    return "Thông tin đăng ký chưa hợp lệ. Vui lòng kiểm tra lại.";
  }

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  return "Không thể tạo tài khoản lúc này. Vui lòng thử lại.";
}

export async function registerCustomer(payload: RegisterPayload): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as AuthResponse | { detail?: unknown } | null;

  if (!response.ok) {
    throw new Error(getApiErrorMessage(response.status, data && "detail" in data ? data.detail : undefined));
  }

  const authData = data as AuthResponse;
  return {
    id: authData.user_info.id,
    name: authData.user_info.full_name ?? payload.full_name,
    email: authData.user_info.email ?? payload.email,
    phone: authData.user_info.phone ?? payload.phone,
    role: "Khách hàng",
    accessToken: authData.access_token,
    refreshToken: authData.refresh_token ?? null,
  };
}

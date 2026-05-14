import type { AuthUser } from "./types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

type RegisterPayload = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
};

type LoginPayload = {
  email: string;
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
  if (status === 401 && detail === "Invalid credentials") {
    return "Email hoặc mật khẩu không đúng.";
  }

  if (status === 423) {
    return "Tài khoản đang bị tạm khóa. Vui lòng thử lại sau.";
  }

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

function toAuthUser(authData: AuthResponse, fallback: { email: string; phone?: string; fullName?: string }): AuthUser {
  return {
    id: authData.user_info.id,
    name: authData.user_info.full_name ?? fallback.fullName ?? fallback.email,
    email: authData.user_info.email ?? fallback.email,
    phone: authData.user_info.phone ?? fallback.phone ?? "Chưa cập nhật",
    role: authData.user_info.role === "customer" ? "Khách hàng" : "Nhà đầu tư",
    accessToken: authData.access_token,
    refreshToken: authData.refresh_token ?? null,
  };
}

async function parseAuthResponse(response: Response) {
  const data = (await response.json().catch(() => null)) as AuthResponse | { detail?: unknown } | null;

  if (!response.ok) {
    throw new Error(getApiErrorMessage(response.status, data && "detail" in data ? data.detail : undefined));
  }

  return data as AuthResponse;
}

export async function registerCustomer(payload: RegisterPayload): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const authData = await parseAuthResponse(response);
  return toAuthUser(authData, { email: payload.email, phone: payload.phone, fullName: payload.full_name });
}

export async function loginCustomer(payload: LoginPayload): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const authData = await parseAuthResponse(response);
  return toAuthUser(authData, { email: payload.email });
}

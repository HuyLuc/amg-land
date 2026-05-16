export type AuthUser = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: "Khách hàng" | "Nhà đầu tư";
  backendRole?: string;
  accessToken?: string;
  refreshToken?: string | null;
};

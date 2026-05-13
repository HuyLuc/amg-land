import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { TextInput } from "../components/ui/TextInput";
import { AuthShell } from "../features/auth/components/AuthShell";
import type { AuthUser } from "../features/auth/types";
import type { Page } from "../app/types";

type LoginPageProps = {
  onLogin: (user: AuthUser) => void;
  onNavigate: (page: Page) => void;
};

export function LoginPage({ onLogin, onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin({
      name: "Nguyễn Minh Anh",
      email: email || "khachhang@amgland.vn",
      phone: "0900 000 000",
      role: "Khách hàng"
    });
  };

  return (
    <AuthShell
      title="Đăng nhập"
      description="Theo dõi dự án yêu thích, lịch tư vấn và thông tin cá nhân của bạn."
    >
      <form className="mx-auto grid max-w-md gap-4" onSubmit={submitLogin}>
        <TextInput autoComplete="email" label="Email" onChange={setEmail} placeholder="email@example.com" required type="email" value={email} />
        <TextInput autoComplete="current-password" label="Mật khẩu" onChange={setPassword} placeholder="Nhập mật khẩu" required type="password" value={password} />
        <button className="btn-primary h-12 justify-center" type="submit">
          Đăng nhập
          <ArrowRight size={17} />
        </button>
        <p className="text-center text-sm text-slate-600">
          Chưa có tài khoản?{" "}
          <button className="font-semibold text-brand-900 transition hover:text-gold-500" onClick={() => onNavigate("register")} type="button">
            Đăng ký ngay
          </button>
        </p>
      </form>
    </AuthShell>
  );
}

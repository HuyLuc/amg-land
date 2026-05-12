import { useState, type FormEvent } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { TextInput } from "../components/ui/TextInput";
import { AuthShell } from "../features/auth/components/AuthShell";
import type { AuthUser } from "../features/auth/types";
import type { Page } from "../app/types";

type LoginPageProps = {
  onLogin: (user: AuthUser) => void;
  onNavigate: (page: Page) => void;
};

export function LoginPage({ onLogin, onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState("khachhang@amgland.vn");
  const [password, setPassword] = useState("amgland2026");

  const submitLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin({
      name: "Nguyễn Minh Anh",
      email,
      phone: "0900 000 000",
      role: "Khách hàng"
    });
  };

  return (
    <AuthShell
      title="Đăng nhập"
      description="Truy cập tài khoản AMG để theo dõi dự án yêu thích, lịch tư vấn và hoạt động trong cộng đồng khách hàng."
    >
      <form className="mx-auto grid max-w-md gap-5" onSubmit={submitLogin}>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-500">AMG Account</p>
          <h2 className="font-display mt-2 text-3xl font-bold text-brand-900">Chào mừng quay lại</h2>
        </div>

        <TextInput label="Email" onChange={setEmail} placeholder="email@example.com" type="email" value={email} />
        <TextInput label="Mật khẩu" onChange={setPassword} placeholder="Nhập mật khẩu" type="password" value={password} />

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex items-center gap-2 font-medium text-slate-600">
            <input className="h-4 w-4 rounded border-slate-300 text-brand-900" type="checkbox" />
            Ghi nhớ đăng nhập
          </label>
          <button className="font-semibold text-brand-900 transition hover:text-gold-500" type="button">
            Quên mật khẩu?
          </button>
        </div>

        <button className="btn-primary h-12 justify-center" type="submit">
          Đăng nhập
          <ArrowRight size={17} />
        </button>

        <div className="rounded bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          <div className="flex items-center gap-2 font-semibold text-brand-900">
            <Mail size={16} />
            Tài khoản demo
          </div>
          <p className="mt-1">Bạn có thể bấm đăng nhập ngay với thông tin đã điền sẵn.</p>
        </div>

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

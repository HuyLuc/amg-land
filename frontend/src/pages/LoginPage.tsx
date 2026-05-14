import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { TextInput } from "../components/ui/TextInput";
import { AuthShell } from "../features/auth/components/AuthShell";
import { loginCustomer } from "../features/auth/api";
import type { AuthUser } from "../features/auth/types";
import type { Page } from "../app/types";

type LoginPageProps = {
  onLogin: (user: AuthUser) => void;
  onNavigate: (page: Page) => void;
};

export function LoginPage({ onLogin, onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const user = await loginCustomer({
        email: email.trim(),
        password,
      });
      onLogin(user);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Không thể đăng nhập lúc này. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Đăng nhập"
      description="Theo dõi dự án yêu thích, lịch tư vấn và thông tin cá nhân của bạn."
    >
      <form className="mx-auto grid max-w-md gap-4" onSubmit={submitLogin}>
        {formError && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {formError}
          </div>
        )}

        <TextInput autoComplete="email" label="Email" onChange={setEmail} placeholder="email@example.com" required type="email" value={email} />
        <TextInput autoComplete="current-password" label="Mật khẩu" onChange={setPassword} placeholder="Nhập mật khẩu" required type="password" value={password} />
        <button className="btn-primary h-12 justify-center disabled:cursor-not-allowed disabled:opacity-70" disabled={submitting} type="submit">
          {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
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

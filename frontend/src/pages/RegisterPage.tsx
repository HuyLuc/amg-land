import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { TextInput } from "../components/ui/TextInput";
import { AuthShell } from "../features/auth/components/AuthShell";
import type { AuthUser } from "../features/auth/types";
import type { Page } from "../app/types";

type RegisterPageProps = {
  onRegister: (user: AuthUser) => void;
  onNavigate: (page: Page) => void;
};

export function RegisterPage({ onRegister, onNavigate }: RegisterPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const submitRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setPasswordError("Mật khẩu nhập lại chưa khớp.");
      return;
    }

    setPasswordError("");
    onRegister({
      name: name || "Khách hàng AMG",
      email: email || "khachhang@amgland.vn",
      phone: "Chưa cập nhật",
      role: "Nhà đầu tư"
    });
  };

  return (
    <AuthShell
      title="Đăng ký tài khoản"
      description="Tạo tài khoản để lưu dự án quan tâm và theo dõi lịch hẹn với AMG Land."
    >
      <form className="mx-auto grid max-w-md gap-4" onSubmit={submitRegister}>
        <TextInput autoComplete="name" label="Họ và tên" onChange={setName} placeholder="Nhập họ tên" required value={name} />
        <TextInput autoComplete="email" label="Email" onChange={setEmail} placeholder="email@example.com" required type="email" value={email} />
        <TextInput
          autoComplete="new-password"
          label="Mật khẩu"
          minLength={8}
          onChange={(value) => {
            setPassword(value);
            setPasswordError("");
          }}
          placeholder="Tối thiểu 8 ký tự"
          required
          type="password"
          value={password}
        />
        <TextInput
          autoComplete="new-password"
          error={passwordError}
          label="Nhập lại mật khẩu"
          minLength={8}
          onChange={(value) => {
            setConfirmPassword(value);
            setPasswordError("");
          }}
          placeholder="Nhập lại mật khẩu"
          required
          type="password"
          value={confirmPassword}
        />
        <button className="btn-primary h-12 justify-center" type="submit">
          Tạo tài khoản
          <ArrowRight size={17} />
        </button>

        <p className="text-center text-sm text-slate-600">
          Đã có tài khoản?{" "}
          <button className="font-semibold text-brand-900 transition hover:text-gold-500" onClick={() => onNavigate("login")} type="button">
            Đăng nhập
          </button>
        </p>
      </form>
    </AuthShell>
  );
}

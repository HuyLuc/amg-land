import { useState, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";
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
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const submitRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onRegister({
      name: name || "Khách hàng AMG",
      email: email || "khachhang@amgland.vn",
      phone: phone || "0900 000 000",
      role: "Nhà đầu tư"
    });
  };

  return (
    <AuthShell
      title="Đăng ký tài khoản"
      description="Tạo tài khoản để lưu dự án quan tâm, tham gia cộng đồng, nhận tư vấn và theo dõi lịch hẹn với AMG Land."
    >
      <form className="mx-auto grid max-w-md gap-5" onSubmit={submitRegister}>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-500">Tạo hồ sơ khách hàng</p>
          <h2 className="font-display mt-2 text-3xl font-bold text-brand-900">Bắt đầu với AMG Land</h2>
        </div>

        <TextInput label="Họ và tên" onChange={setName} placeholder="Nhập họ tên" value={name} />
        <TextInput label="Email" onChange={setEmail} placeholder="email@example.com" type="email" value={email} />
        <TextInput label="Số điện thoại" onChange={setPhone} placeholder="0900 000 000" type="tel" value={phone} />
        <TextInput label="Mật khẩu" onChange={setPassword} placeholder="Tối thiểu 8 ký tự" type="password" value={password} />

        <div className="grid gap-2 rounded bg-brand-50 p-4 text-sm text-slate-700">
          {["Nhận thông báo dự án phù hợp", "Lưu căn hộ yêu thích", "Tương tác trong cộng đồng khách hàng"].map((item) => (
            <span className="flex items-center gap-2" key={item}>
              <Check className="text-brand-900" size={16} />
              {item}
            </span>
          ))}
        </div>

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

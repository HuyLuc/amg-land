import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "@/features/auth/authApi";
import { ApiError } from "@/services/apiClient";
import { isInternalUser, saveAuth } from "@/services/authStorage";
import { getDefaultPath } from "@/services/permissions";

export function LoginPage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await login(email, password);
      if (!isInternalUser(response.user_info)) {
        setError("Tài khoản này không có quyền truy cập web nội bộ.");
        return;
      }
      saveAuth(response.access_token, response.refresh_token, response.user_info);
      navigate(getDefaultPath(response.user_info.role), { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("Email hoặc mật khẩu không đúng.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Không thể kết nối tới API. Hãy kiểm tra URL đang mở và cấu hình CORS local.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual" aria-hidden="true">
        <img src="/brand/background.jpg" alt="" />
        <div className="login-visual-overlay">
          <div className="visual-kicker">AMG Land</div>
          <h2>Không gian làm việc cho đội ngũ kinh doanh và vận hành.</h2>
          <div className="visual-stats">
            <span>Leads</span>
            <span>Dự án</span>
            <span>Nội dung</span>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-brand">
          <img className="login-logo-image" src="/brand/logo.png" alt="AMG Land" />
        </div>

        <div className="login-intro">
          <div className="login-intro-icon">
            <ShieldCheck size={18} />
          </div>
          <div>
            <strong>Đăng nhập hệ thống</strong>
            <span>Quản lý khách hàng, dự án và nội dung nội bộ.</span>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          </label>
          <label>
            Mật khẩu
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {error ? <div className="form-error">{error}</div> : null}
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </section>
    </main>
  );
}

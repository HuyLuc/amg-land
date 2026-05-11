import type { ReactNode } from "react";
import { ArrowRight, Building2, Mail, MapPin, Phone, Send } from "lucide-react";
import { navItems } from "../../app/navigation";
import type { Page } from "../../app/types";

type FooterProps = {
  onNavigate: (page: Page) => void;
};

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="relative overflow-hidden bg-brand-900 text-white">
      <div className="absolute inset-0 opacity-[0.07] luxury-grid" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr_0.9fr_1fr]">
          <div>
            <button className="group flex items-center gap-3" onClick={() => onNavigate("home")} type="button">
              <span className="grid h-12 w-12 place-items-center rounded bg-white text-brand-900 shadow-gold transition duration-300 group-hover:-translate-y-0.5">
                <Building2 size={24} strokeWidth={1.9} />
              </span>
              <span className="text-left">
                <span className="font-display block text-2xl font-bold leading-6">AMG News</span>
                <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">AMG Land</span>
              </span>
            </button>

            <p className="mt-5 max-w-sm text-sm leading-7 text-brand-100">
              Nền tảng thông tin bất động sản, bảng tin dự án và kênh kết nối khách hàng chính thống của AMG Land.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {["Dự án chọn lọc", "Tư vấn phong thủy", "Cộng đồng khách hàng"].map((item) => (
                <span className="rounded border border-white/15 px-3 py-1.5 text-xs font-semibold text-brand-100" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-400">Điều hướng</h2>
            <div className="mt-5 grid gap-2">
              {navItems.map((item) => (
                <button
                  className="group flex w-fit items-center gap-2 rounded py-1.5 text-sm font-medium text-brand-100 transition hover:text-white"
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  type="button"
                >
                  <ArrowRight className="opacity-0 transition group-hover:opacity-100" size={15} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-400">Liên hệ</h2>
            <div className="mt-5 grid gap-4 text-sm text-brand-100">
              <FooterContact icon={<Phone size={17} />} text="0900 000 000" />
              <FooterContact icon={<Mail size={17} />} text="contact@amgland.vn" />
              <FooterContact icon={<MapPin size={17} />} text="Hà Nội, Việt Nam" />
            </div>
            <button className="mt-6 inline-flex h-11 items-center gap-2 rounded bg-white px-4 text-sm font-semibold text-brand-900 transition hover:-translate-y-0.5" onClick={() => onNavigate("contact")} type="button">
              Đăng ký tư vấn
              <ArrowRight size={16} />
            </button>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-400">Nhận tin mới</h2>
            <p className="mt-5 text-sm leading-7 text-brand-100">
              Nhận cập nhật dự án, bảng hàng mới và các bài phân tích thị trường từ AMG News.
            </p>
            <div className="mt-5 flex overflow-hidden rounded border border-white/15 bg-white">
              <input
                className="h-12 min-w-0 flex-1 px-4 text-sm text-slate-900 outline-none"
                placeholder="Email của bạn"
              />
              <button className="grid h-12 w-12 place-items-center bg-gold-400 text-brand-900 transition hover:bg-gold-500" type="button">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-brand-100 md:flex-row md:items-center md:justify-between">
          <p>© 2026 AMG News. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <button className="transition hover:text-white" type="button">Chính sách bảo mật</button>
            <button className="transition hover:text-white" type="button">Điều khoản sử dụng</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterContact({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-gold-400">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

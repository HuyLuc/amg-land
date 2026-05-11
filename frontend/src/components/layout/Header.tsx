import { Building2, Menu, X } from "lucide-react";
import { useState } from "react";
import { navItems } from "../../app/navigation";
import type { Page } from "../../app/types";

type HeaderProps = {
  page: Page;
  onNavigate: (page: Page) => void;
};

export function Header({ page, onNavigate }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (nextPage: Page) => {
    onNavigate(nextPage);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <button className="flex items-center gap-3" onClick={() => navigate("home")} type="button">
          <span className="grid h-11 w-11 place-items-center rounded bg-brand-900 text-white shadow-soft">
            <Building2 size={23} strokeWidth={1.9} />
          </span>
          <span className="text-left">
            <span className="block text-lg font-semibold leading-5 text-brand-900">AMG News</span>
            <span className="block text-xs font-medium text-slate-500">AMG Land</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <button
              className={`rounded px-4 py-2 text-sm font-semibold transition ${
                page === item.page ? "bg-brand-50 text-brand-900" : "text-slate-600 hover:bg-slate-100"
              }`}
              key={item.page}
              onClick={() => navigate(item.page)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a className="text-sm font-semibold text-brand-900" href="tel:0900000000">
            0900 000 000
          </a>
          <button className="btn-primary" onClick={() => navigate("contact")} type="button">
            Đăng ký tư vấn
          </button>
        </div>

        <button
          aria-label="Mở menu"
          className="grid h-11 w-11 place-items-center rounded border border-slate-200 text-brand-900 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          type="button"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-5 pb-5 md:hidden">
          <div className="grid gap-2 pt-4">
            {navItems.map((item) => (
              <button
                className={`rounded px-4 py-3 text-left text-sm font-semibold ${
                  page === item.page ? "bg-brand-50 text-brand-900" : "text-slate-700"
                }`}
                key={item.page}
                onClick={() => navigate(item.page)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}


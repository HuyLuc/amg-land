import { Building2, LogOut, Menu, UserRound, X } from "lucide-react";
import { useState } from "react";
import { navItems } from "../../app/navigation";
import type { Page } from "../../app/types";
import type { AuthUser } from "../../features/auth/types";

type HeaderProps = {
  page: Page;
  user: AuthUser | null;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
};

export function Header({ page, user, onLogout, onNavigate }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (nextPage: Page) => {
    onNavigate(nextPage);
    setMobileOpen(false);
  };

  const logout = () => {
    onLogout();
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <button className="group flex items-center gap-3" onClick={() => navigate("home")} type="button">
          <span className="grid h-11 w-11 place-items-center rounded bg-brand-900 text-white shadow-[0_10px_22px_rgba(31,56,100,0.22)] ring-1 ring-brand-700 transition duration-300 group-hover:-translate-y-0.5">
            <Building2 size={23} strokeWidth={1.9} />
          </span>
          <span className="text-left">
            <span className="font-display block text-xl font-bold leading-5 text-brand-900">AMG News</span>
            <span className="block text-xs font-medium text-slate-500">AMG Land</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <button
              className={`relative rounded px-4 py-2 text-sm font-semibold transition ${
                page === item.page ? "bg-brand-900 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100 hover:text-brand-900"
              }`}
              key={item.page}
              onClick={() => navigate(item.page)}
              type="button"
            >
              {item.label}
              {page === item.page && <span className="absolute inset-x-4 -bottom-1 h-0.5 rounded-full bg-gold-400" />}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <button className={`inline-flex h-11 items-center gap-2 rounded px-4 text-sm font-semibold transition ${page === "profile" ? "bg-brand-900 text-white" : "bg-brand-50 text-brand-900 hover:bg-brand-100"}`} onClick={() => navigate("profile")} type="button">
                <UserRound size={17} />
                {user.name.split(" ").slice(-1)[0]}
              </button>
              <button aria-label="Đăng xuất" className="grid h-11 w-11 place-items-center rounded border border-slate-200 text-slate-600 transition hover:border-brand-900 hover:text-brand-900" onClick={logout} type="button">
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <button className="text-sm font-semibold text-brand-900 transition hover:text-gold-500" onClick={() => navigate("login")} type="button">
                Đăng nhập
              </button>
              <button className="btn-primary" onClick={() => navigate("register")} type="button">
                Đăng ký
              </button>
            </>
          )}
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
            <div className="mt-3 grid gap-2 border-t border-slate-100 pt-4">
              {user ? (
                <>
                  <button
                    className={`rounded px-4 py-3 text-left text-sm font-semibold ${
                      page === "profile" ? "bg-brand-50 text-brand-900" : "text-slate-700"
                    }`}
                    onClick={() => navigate("profile")}
                    type="button"
                  >
                    Hồ sơ cá nhân
                  </button>
                  <button className="rounded px-4 py-3 text-left text-sm font-semibold text-slate-700" onClick={logout} type="button">
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`rounded px-4 py-3 text-left text-sm font-semibold ${
                      page === "login" ? "bg-brand-50 text-brand-900" : "text-slate-700"
                    }`}
                    onClick={() => navigate("login")}
                    type="button"
                  >
                    Đăng nhập
                  </button>
                  <button
                    className={`rounded px-4 py-3 text-left text-sm font-semibold ${
                      page === "register" ? "bg-brand-50 text-brand-900" : "text-slate-700"
                    }`}
                    onClick={() => navigate("register")}
                    type="button"
                  >
                    Đăng ký
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import type { Page } from "../../app/types";
import type { AuthUser } from "../../features/auth/types";

type AppLayoutProps = {
  children: ReactNode;
  currentPage: Page;
  user: AuthUser | null;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
};

export function AppLayout({ children, currentPage, user, onLogout, onNavigate }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header page={currentPage} user={user} onLogout={onLogout} onNavigate={onNavigate} />
      <main>{children}</main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}

import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import type { Page } from "../../app/types";

type AppLayoutProps = {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
};

export function AppLayout({ children, currentPage, onNavigate }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header page={currentPage} onNavigate={onNavigate} />
      <main>{children}</main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}


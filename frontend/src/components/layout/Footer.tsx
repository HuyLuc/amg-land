import { navItems } from "../../app/navigation";
import type { Page } from "../../app/types";

type FooterProps = {
  onNavigate: (page: Page) => void;
};

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-slate-950 py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <div className="text-xl font-semibold">AMG News</div>
          <p className="mt-2 text-sm text-slate-400">Website thông tin bất động sản và tìm kiếm khách hàng AMG Land.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <button className="rounded px-3 py-2 text-sm text-slate-300 hover:bg-white/10" key={item.page} onClick={() => onNavigate(item.page)} type="button">
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}


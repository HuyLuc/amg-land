import type { ReactNode } from "react";
import { companyAssets, companyInfo } from "../../../app/company";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <section className="section-wrap">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded bg-white shadow-lift lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="relative overflow-hidden bg-brand-900 p-7 text-white lg:p-9">
          <div className="absolute inset-0 opacity-[0.08] luxury-grid" />
          <div className="relative">
            <img alt={companyInfo.brandName} className="h-20 w-auto rounded bg-white p-2 shadow-gold" src={companyAssets.logo} />
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-gold-400">{companyInfo.tagline}</p>
            <h1 className="font-display mt-3 text-4xl font-bold leading-tight md:text-5xl">{title}</h1>
            <p className="mt-4 max-w-sm text-sm leading-7 text-brand-100">{description}</p>
          </div>
        </aside>

        <div className="p-6 md:p-8 lg:p-9">{children}</div>
      </div>
    </section>
  );
}

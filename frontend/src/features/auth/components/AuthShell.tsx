import type { ReactNode } from "react";
import { Building2, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <section className="section-wrap">
      <div className="grid overflow-hidden rounded bg-white shadow-lift lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative overflow-hidden bg-brand-900 p-8 text-white lg:p-10">
          <div className="absolute inset-0 opacity-[0.08] luxury-grid" />
          <div className="relative">
            <span className="grid h-14 w-14 place-items-center rounded bg-white text-brand-900 shadow-gold">
              <Building2 size={27} />
            </span>
            <h1 className="font-display mt-8 text-4xl font-bold leading-tight md:text-5xl">{title}</h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-brand-100">{description}</p>

            <div className="mt-10 grid gap-4">
              <AuthBenefit icon={<ShieldCheck size={18} />} text="Thông tin tư vấn và lịch hẹn được lưu tập trung." />
              <AuthBenefit icon={<Sparkles size={18} />} text="Theo dõi dự án, căn hộ và bảng hàng yêu thích." />
              <AuthBenefit icon={<CheckCircle2 size={18} />} text="Trải nghiệm cộng đồng AMG Land cá nhân hóa hơn." />
            </div>
          </div>
        </aside>

        <div className="p-6 md:p-8 lg:p-10">{children}</div>
      </div>
    </section>
  );
}

function AuthBenefit({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded border border-white/10 bg-white/5 p-4 text-sm leading-6 text-brand-50">
      <span className="mt-0.5 text-gold-300">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

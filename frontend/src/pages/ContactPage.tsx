import type { ReactNode } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { companyInfo } from "../app/company";
import { ContactForm } from "../features/contacts/components/ContactForm";
import type { AuthUser } from "../features/auth/types";
import type { Apartment, Project } from "../types/domain";

export type ContactContext = {
  project: Project | null;
  apartment: Apartment | null;
};

type ContactPageProps = {
  context?: ContactContext | null;
  projects?: Project[];
  user?: AuthUser | null;
};

export function ContactPage({ context, projects = [], user = null }: ContactPageProps) {
  return (
    <section className="section-wrap">
      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="rounded bg-white p-6 shadow-soft">
          <h1 className="font-display text-4xl font-bold leading-tight text-brand-900 md:text-5xl">Đăng ký tư vấn</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Chia sẻ nhu cầu của bạn, AMG Land sẽ liên hệ với bảng hàng và thông tin dự án phù hợp.
          </p>

          <a className="mt-8 flex items-center justify-between gap-4 rounded bg-brand-900 px-5 py-4 text-white shadow-gold transition hover:-translate-y-0.5 hover:bg-brand-700" href={`tel:${companyInfo.phone}`}>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-brand-100">Hotline tư vấn</span>
              <span className="mt-1 block text-2xl font-bold">{companyInfo.phone}</span>
            </span>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded bg-white/10">
              <Phone size={20} />
            </span>
          </a>

          <div className="mt-7 grid gap-5 border-t border-slate-200 pt-6">
            <ContactLine icon={<Mail size={18} />} label="Email" value={companyInfo.email} href={`mailto:${companyInfo.email}`} />
            <ContactLine icon={<MapPin size={18} />} label="Văn phòng" value={companyInfo.address} />
            <ContactLine icon={<Clock size={18} />} label="Thời gian làm việc" value="08:30 - 18:00" />
          </div>

          <p className="mt-8 text-sm font-semibold text-brand-900">
            AMG Land phản hồi yêu cầu trong giờ làm việc
          </p>
        </div>

        <ContactForm context={context} projects={projects} user={user} />
      </div>
    </section>
  );
}

function ContactLine({ icon, label, value, href }: { icon: ReactNode; label: string; value: string; href?: string }) {
  const content = (
    <>
      <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded bg-brand-50 text-brand-900">{icon}</span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
        <span className="mt-1 block text-sm font-semibold leading-6 text-slate-900">{value}</span>
      </span>
    </>
  );

  if (href) {
    return (
      <a className="flex items-start gap-3 transition hover:text-brand-900" href={href}>
        {content}
      </a>
    );
  }

  return (
    <div className="flex items-start gap-3">
      {content}
    </div>
  );
}

import type { ReactNode } from "react";

type ContactInfoProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

export function ContactInfo({ icon, label, value }: ContactInfoProps) {
  return (
    <div className="flex items-center gap-4 rounded bg-white p-4 shadow-soft">
      <span className="grid h-11 w-11 place-items-center rounded bg-brand-50 text-brand-900">{icon}</span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
        <span className="mt-1 block font-semibold text-slate-950">{value}</span>
      </span>
    </div>
  );
}


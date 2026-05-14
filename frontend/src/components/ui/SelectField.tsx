import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

type SelectFieldProps = {
  icon: ReactNode;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

export function SelectField({ icon, label, options, value, onChange }: SelectFieldProps) {
  return (
    <label className="flex min-h-16 items-center gap-3 rounded border border-slate-300 bg-white px-4 transition duration-300 hover:-translate-y-0.5 hover:border-brand-700 hover:shadow-soft">
      <span className="text-brand-900">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">{label}</span>
        <select
          className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </span>
      <ChevronDown className="text-slate-400" size={17} />
    </label>
  );
}

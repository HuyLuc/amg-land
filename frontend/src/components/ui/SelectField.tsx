import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type SelectFieldProps = {
  icon: ReactNode;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

export function SelectField({ icon, label, options, value, onChange }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <button
        className={`flex min-h-16 w-full items-center gap-3 rounded border bg-white px-4 text-left transition duration-300 ${
          open ? "border-brand-700 shadow-soft ring-2 ring-brand-100" : "border-slate-300 hover:-translate-y-0.5 hover:border-brand-700 hover:shadow-soft"
        }`}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="text-brand-900">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">{label}</span>
          <span className="mt-1 block truncate text-sm font-semibold text-slate-900">{value}</span>
        </span>
        <ChevronDown className={`text-slate-400 transition ${open ? "rotate-180 text-brand-900" : ""}`} size={17} />
      </button>

      {open ? (
        <div className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded border border-slate-200 bg-white p-1 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
          {options.map((option) => (
            <button
              className={`flex w-full items-center justify-between rounded px-3 py-2.5 text-left text-sm font-semibold transition ${
                option === value ? "bg-brand-900 text-white" : "text-slate-700 hover:bg-brand-50 hover:text-brand-900"
              }`}
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              type="button"
            >
              <span>{option}</span>
              {option === value ? <Check size={16} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

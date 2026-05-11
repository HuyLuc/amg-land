type TextInputProps = {
  label: string;
  placeholder: string;
};

export function TextInput({ label, placeholder }: TextInputProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-brand-500"
        placeholder={placeholder}
      />
    </label>
  );
}


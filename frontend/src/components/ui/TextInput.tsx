type TextInputProps = {
  label: string;
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function TextInput({ label, placeholder, type = "text", value, onChange }: TextInputProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-brand-500"
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

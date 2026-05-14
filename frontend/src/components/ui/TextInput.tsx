import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type TextInputProps = {
  label: string;
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
  autoComplete?: string;
  error?: string;
  minLength?: number;
  required?: boolean;
};

export function TextInput({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  autoComplete,
  error,
  minLength,
  required
}: TextInputProps) {
  const inputId = useId();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="block">
      <label className="text-sm font-semibold text-slate-700" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative mt-2">
        <input
          aria-describedby={error ? `${inputId}-error` : undefined}
          aria-invalid={error ? true : undefined}
          autoComplete={autoComplete}
          className={`h-12 w-full rounded border bg-slate-50 py-0 pl-4 text-sm outline-none transition focus:border-brand-500 ${
            error ? "border-red-300 focus:border-red-500" : "border-slate-200"
          } ${isPassword ? "pr-12" : "pr-4"}`}
          id={inputId}
          minLength={minLength}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          required={required}
          type={inputType}
          value={value}
        />
        {isPassword && (
          <button
            aria-label={showPassword ? `Ẩn ${label.toLowerCase()}` : `Hiện ${label.toLowerCase()}`}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-500 transition hover:text-brand-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-100"
            onClick={() => setShowPassword((current) => !current)}
            type="button"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm font-medium text-red-600" id={`${inputId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

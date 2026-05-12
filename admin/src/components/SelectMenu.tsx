import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectMenuProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

export function SelectMenu({ label, value, options, onChange }: SelectMenuProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    function handlePointerDown(event: MouseEvent): void {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div className="select-menu" ref={rootRef}>
      <span className="select-menu-label">{label}</span>
      <button className={`select-menu-trigger ${open ? "open" : ""}`} type="button" onClick={() => setOpen((current) => !current)}>
        <span>{selectedOption.label}</span>
        <ChevronDown size={17} />
      </button>
      {open ? (
        <div className="select-menu-popover" role="listbox">
          {options.map((option) => (
            <button
              key={option.value || "empty"}
              className={`select-menu-option ${option.value === value ? "selected" : ""}`}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span>{option.label}</span>
              {option.value === value ? <Check size={16} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

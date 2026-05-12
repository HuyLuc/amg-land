import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function toInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplay(value: string): string {
  if (!value) {
    return "Chọn ngày";
  }
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildCalendarDays(monthDate: Date): Date[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + index));
}

export function DatePicker({ label, value, onChange }: DatePickerProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => (value ? new Date(`${value}T00:00:00`) : new Date()));
  const rootRef = useRef<HTMLDivElement | null>(null);
  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const todayValue = toInputValue(new Date());

  useEffect(() => {
    function handlePointerDown(event: MouseEvent): void {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function moveMonth(delta: number): void {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  function selectDate(date: Date): void {
    onChange(toInputValue(date));
    setViewDate(date);
    setOpen(false);
  }

  return (
    <div className="date-picker" ref={rootRef}>
      <span className="date-picker-label">{label}</span>
      <button className={`date-picker-trigger ${open ? "open" : ""} ${value ? "has-value" : ""}`} type="button" onClick={() => setOpen((current) => !current)}>
        <span>{formatDisplay(value)}</span>
        <CalendarDays size={17} />
      </button>

      {open ? (
        <div className="date-picker-popover">
          <div className="date-picker-header">
            <button type="button" aria-label="Tháng trước" onClick={() => moveMonth(-1)}>
              <ChevronLeft size={18} />
            </button>
            <strong>{monthLabel(viewDate)}</strong>
            <button type="button" aria-label="Tháng sau" onClick={() => moveMonth(1)}>
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="date-picker-weekdays">
            {weekdays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="date-picker-grid">
            {days.map((day) => {
              const itemValue = toInputValue(day);
              const isCurrentMonth = day.getMonth() === viewDate.getMonth();
              return (
                <button
                  key={itemValue}
                  className={`${isCurrentMonth ? "" : "muted"} ${itemValue === value ? "selected" : ""} ${itemValue === todayValue ? "today" : ""}`}
                  type="button"
                  onClick={() => selectDate(day)}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="date-picker-actions">
            <button type="button" onClick={() => selectDate(new Date())}>
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              <X size={14} />
              Xóa ngày
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

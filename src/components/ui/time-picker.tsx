import * as React from "react";
import { cn } from "@/lib/utils";

export interface TimePickerProps {
  value?: string; // format: "HH:mm"
  onChange?: (value: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"));

export const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  ({ value = "", onChange, label, disabled, className, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [hour, setHour] = React.useState<string>(value.split(":")[0] || "");
    const [minute, setMinute] = React.useState<string>(value.split(":")[1] || "");

    React.useEffect(() => {
      if (hour && minute && onChange) {
        onChange(`${hour}:${minute}`);
      }
    }, [hour, minute, onChange]);

    React.useEffect(() => {
      if (value) {
        setHour(value.split(":")[0] || "");
        setMinute(value.split(":")[1] || "");
      }
    }, [value]);

    return (
      <div className={cn("relative flex flex-col", className)} ref={ref} {...props}>
        {label && <label className="mb-1 text-sm font-medium text-muted-foreground">{label}</label>}
        <button
          type="button"
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => setOpen((o) => !o)}
          disabled={disabled}
        >
          {hour && minute ? `${hour}:${minute}` : <span className="text-muted-foreground">Select time</span>}
          <svg className="ml-2 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {open && !disabled && (
          <div className="absolute z-10 mt-2 flex w-full rounded-md border bg-popover p-2 shadow-lg">
            <select
              className="mr-2 flex-1 rounded-md border px-2 py-1 text-base focus:outline-none"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
            >
              <option value="">HH</option>
              {hours.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span className="mx-1 self-center text-base font-semibold text-muted-foreground">:</span>
            <select
              className="flex-1 rounded-md border px-2 py-1 text-base focus:outline-none"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
            >
              <option value="">MM</option>
              {minutes.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <button
              className="ml-2 rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              onClick={() => setOpen(false)}
              type="button"
            >
              OK
            </button>
          </div>
        )}
      </div>
    );
  }
);
TimePicker.displayName = "TimePicker";

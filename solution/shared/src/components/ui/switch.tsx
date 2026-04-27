import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Switch({
  className,
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={cn("ui-switch", className)}>
      <input type="checkbox" {...props} />
      <span className="ui-switch__control" />
      <span className="ui-switch__label">{label}</span>
    </label>
  );
}

import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type Tone = "default" | "secondary" | "outline" | "success";

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return <span className={cn("ui-badge", `ui-badge--${tone}`, className)} {...props} />;
}

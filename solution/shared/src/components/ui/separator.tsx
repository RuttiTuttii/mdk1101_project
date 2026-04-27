import { cn } from "../../lib/utils";

export function Separator({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("ui-separator", className)} />;
}

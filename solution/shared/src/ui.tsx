export { cn } from "./lib/utils";
export {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label as FieldLabel,
  Select,
  Separator,
  Skeleton,
  Switch,
} from "./components/ui";

export function Metric({
  className,
  value,
  label,
}: {
  className?: string;
  value: string | number;
  label: string;
}) {
  return (
    <div className={["ui-metric", className].filter(Boolean).join(" ")}>
      <div className="ui-metric__value">{value}</div>
      <div className="ui-metric__label">{label}</div>
    </div>
  );
}

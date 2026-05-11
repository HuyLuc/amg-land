import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

export function MetricCard({ icon: Icon, label, value }: MetricCardProps): JSX.Element {
  return (
    <section className="metric-card">
      <div className="metric-icon">
        <Icon size={20} />
      </div>
      <div>
        <div className="metric-label">{label}</div>
        <div className="metric-value">{value}</div>
      </div>
    </section>
  );
}

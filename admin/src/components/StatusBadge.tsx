interface StatusBadgeProps {
  value: string;
}

export function StatusBadge({ value }: StatusBadgeProps): JSX.Element {
  return <span className={`status-badge status-${value}`}>{value}</span>;
}

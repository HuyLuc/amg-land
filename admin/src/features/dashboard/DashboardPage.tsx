import { Building2, Eye, MessageSquare, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getDashboardStats } from "@/features/dashboard/dashboardApi";
import { MetricCard } from "@/components/MetricCard";
import { PageHeader } from "@/components/PageHeader";

export function DashboardPage(): JSX.Element {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", "week"],
    queryFn: () => getDashboardStats("week"),
  });

  return (
    <section className="page-stack">
      <PageHeader title="Dashboard" description="Tong quan tu van, truy cap va du an noi bat." />

      {error ? <div className="alert-error">Khong tai duoc dashboard.</div> : null}

      <div className="metric-grid">
        <MetricCard icon={Eye} label="Luot xem" value={isLoading ? "..." : data?.visits ?? 0} />
        <MetricCard icon={MessageSquare} label="Lead moi" value={isLoading ? "..." : data?.new_contacts ?? 0} />
        <MetricCard icon={Building2} label="Top du an" value={isLoading ? "..." : data?.top_projects.length ?? 0} />
        <MetricCard icon={TrendingUp} label="Chu ky" value="7 ngay" />
      </div>

      <div className="content-grid two-columns">
        <section className="panel">
          <div className="panel-header">
            <h2>Du an duoc xem nhieu</h2>
          </div>
          <div className="rank-list">
            {(data?.top_projects ?? []).map((item) => (
              <div className="rank-row" key={item.id}>
                <span>{item.name}</span>
                <strong>{item.views}</strong>
              </div>
            ))}
            {!isLoading && !data?.top_projects.length ? <div className="empty-state">Chua co du lieu.</div> : null}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Can ho duoc xem nhieu</h2>
          </div>
          <div className="rank-list">
            {(data?.top_apartments ?? []).map((item) => (
              <div className="rank-row" key={item.id}>
                <span>{item.code}</span>
                <strong>{item.views}</strong>
              </div>
            ))}
            {!isLoading && !data?.top_apartments.length ? <div className="empty-state">Chua co du lieu.</div> : null}
          </div>
        </section>
      </div>
    </section>
  );
}

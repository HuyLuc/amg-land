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
      <PageHeader title="Dashboard" description="Tổng quan tư vấn, truy cập và dự án nổi bật." />

      {error ? <div className="alert-error">Không tải được dashboard.</div> : null}

      <div className="metric-grid">
        <MetricCard icon={Eye} label="Lượt xem" value={isLoading ? "..." : data?.visits ?? 0} />
        <MetricCard icon={MessageSquare} label="Lead mới" value={isLoading ? "..." : data?.new_contacts ?? 0} />
        <MetricCard icon={Building2} label="Top dự án" value={isLoading ? "..." : data?.top_projects.length ?? 0} />
        <MetricCard icon={TrendingUp} label="Chu kỳ" value="7 ngày" />
      </div>

      <div className="content-grid two-columns">
        <section className="panel">
          <div className="panel-header">
            <h2>Dự án được xem nhiều</h2>
          </div>
          <div className="rank-list">
            {(data?.top_projects ?? []).map((item) => (
              <div className="rank-row" key={item.id}>
                <span>{item.name}</span>
                <strong>{item.views}</strong>
              </div>
            ))}
            {!isLoading && !data?.top_projects.length ? <div className="empty-state">Chưa có dữ liệu.</div> : null}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Căn hộ được xem nhiều</h2>
          </div>
          <div className="rank-list">
            {(data?.top_apartments ?? []).map((item) => (
              <div className="rank-row" key={item.id}>
                <span>{item.code}</span>
                <strong>{item.views}</strong>
              </div>
            ))}
            {!isLoading && !data?.top_apartments.length ? <div className="empty-state">Chưa có dữ liệu.</div> : null}
          </div>
        </section>
      </div>
    </section>
  );
}

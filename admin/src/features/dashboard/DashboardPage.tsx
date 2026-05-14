import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, FileText, Home, MessageSquare, MousePointer2, PhoneCall, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

import { MetricCard } from "@/components/MetricCard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { getDashboardStats } from "@/features/dashboard/dashboardApi";
import { getAuthUser } from "@/services/authStorage";
import { isConsultantRole } from "@/services/permissions";
import type { DashboardStats } from "@/services/types";

const periodOptions = [
  { value: "week", label: "7 ngày" },
  { value: "month", label: "30 ngày" },
  { value: "all", label: "Tất cả" },
];

function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(new Date(value));
}

function percent(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function LeadChart({ data }: { data: DashboardStats["lead_series"] }): JSX.Element {
  const max = Math.max(1, ...data.map((item) => item.total));

  return (
    <div className="lead-chart" aria-label="Lead theo ngày">
      <div className="lead-chart-bars">
        {data.map((item) => (
          <div className="lead-chart-column" key={item.date}>
            <div className="lead-bar-stack" title={`${formatShortDate(item.date)}: ${item.total} lead`}>
              <span className="lead-bar-new" style={{ height: `${(item.new / max) * 100}%` }} />
              <span className="lead-bar-processing" style={{ height: `${(item.processing / max) * 100}%` }} />
              <span className="lead-bar-done" style={{ height: `${(item.done / max) * 100}%` }} />
            </div>
            <small>{formatShortDate(item.date)}</small>
          </div>
        ))}
      </div>
      <div className="chart-legend">
        <span><i className="legend-new" />Mới</span>
        <span><i className="legend-processing" />Đang xử lý</span>
        <span><i className="legend-done" />Hoàn tất</span>
      </div>
    </div>
  );
}

function ApartmentDonut({ counts }: { counts: DashboardStats["apartment_counts"] }): JSX.Element {
  const total = counts.total || 0;
  const available = percent(counts.available, total);
  const reserved = percent(counts.reserved, total);
  const sold = percent(counts.sold, total);
  const background = `conic-gradient(#1f8a5b 0 ${available}%, #a86800 ${available}% ${available + reserved}%, #b42318 ${available + reserved}% ${available + reserved + sold}%, #e5edf6 ${available + reserved + sold}% 100%)`;

  return (
    <div className="apartment-donut-panel">
      <div className="donut-chart" style={{ background }}>
        <div>
          <strong>{total}</strong>
          <span>căn</span>
        </div>
      </div>
      <div className="donut-breakdown">
        <div><span className="dot available" />Còn trống <strong>{counts.available}</strong></div>
        <div><span className="dot reserved" />Đã giữ <strong>{counts.reserved}</strong></div>
        <div><span className="dot sold" />Đã bán <strong>{counts.sold}</strong></div>
      </div>
    </div>
  );
}

function RankList({
  title,
  items,
}: {
  title: string;
  items: Array<{ id: string; label: string; subLabel?: string; value: number }>;
}): JSX.Element {
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <section className="panel dashboard-rank-panel">
      <div className="panel-header">
        <h2>{title}</h2>
      </div>
      <div className="dashboard-rank-list">
        {items.map((item, index) => (
          <div className="dashboard-rank-row" key={item.id}>
            <span className="rank-index">{index + 1}</span>
            <div>
              <strong>{item.label}</strong>
              {item.subLabel ? <span>{item.subLabel}</span> : null}
              <em style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
            <b>{item.value}</b>
          </div>
        ))}
        {!items.length ? <div className="empty-state">Chưa có dữ liệu.</div> : null}
      </div>
    </section>
  );
}

export function DashboardPage(): JSX.Element {
  const [period, setPeriod] = useState("week");
  const consultantDashboard = isConsultantRole(getAuthUser()?.role);
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", period],
    queryFn: () => getDashboardStats(period),
  });

  const topProjects = useMemo(
    () => (data?.top_projects ?? []).map((item) => ({ id: item.id, label: item.name, value: item.views })),
    [data?.top_projects],
  );
  const topApartments = useMemo(
    () => (data?.top_apartments ?? []).map((item) => ({ id: item.id, label: item.code, subLabel: item.project_name, value: item.views })),
    [data?.top_apartments],
  );

  return (
    <section className="page-stack dashboard-page">
      <PageHeader
        title="Dashboard"
        description={consultantDashboard ? "Tổng quan lead, dự án và căn hộ được giao phụ trách." : "Tổng quan vận hành bán hàng, giỏ căn, nội dung và dữ liệu cần xử lý."}
        action={
          <div className="dashboard-period-switcher" role="tablist" aria-label="Chu kỳ dashboard">
            {periodOptions.map((option) => (
              <button className={period === option.value ? "active" : ""} type="button" key={option.value} onClick={() => setPeriod(option.value)}>
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      {error ? <div className="alert-error">Không tải được dashboard.</div> : null}

      <div className="metric-grid dashboard-metrics">
        {consultantDashboard ? (
          <>
            <MetricCard icon={MessageSquare} label="Lead được giao" value={isLoading ? "..." : data?.total_contacts ?? 0} />
            <MetricCard icon={PhoneCall} label="Lead mới" value={isLoading ? "..." : data?.new_contacts ?? 0} />
            <MetricCard icon={Home} label="Căn còn trống" value={isLoading ? "..." : data?.apartment_counts.available ?? 0} />
            <MetricCard icon={TrendingUp} label="Dự án phụ trách" value={isLoading ? "..." : data?.project_counts.total ?? 0} />
          </>
        ) : (
          <>
            <MetricCard icon={MousePointer2} label="Lượt xem" value={isLoading ? "..." : data?.visits ?? 0} />
            <MetricCard icon={MessageSquare} label="Lead mới" value={isLoading ? "..." : data?.new_contacts ?? 0} />
            <MetricCard icon={Home} label="Căn còn trống" value={isLoading ? "..." : data?.apartment_counts.available ?? 0} />
            <MetricCard icon={FileText} label="Bài đã đăng" value={isLoading ? "..." : data?.post_counts.published ?? 0} />
          </>
        )}
      </div>

      <div className="dashboard-main-grid">
        <section className="panel lead-chart-panel">
          <div className="panel-header dashboard-panel-header">
            <div>
              <h2>Lead theo thời gian</h2>
              <p>{data?.total_contacts ?? 0} lead trong chu kỳ đang chọn</p>
            </div>
            <TrendingUp size={18} />
          </div>
          <LeadChart data={data?.lead_series ?? []} />
        </section>

        <section className="panel">
          <div className="panel-header dashboard-panel-header">
            <div>
              <h2>Trạng thái giỏ căn</h2>
              <p>Còn trống, đã giữ và đã bán</p>
            </div>
            <Home size={18} />
          </div>
          <ApartmentDonut counts={data?.apartment_counts ?? { total: 0, available: 0, reserved: 0, sold: 0 }} />
        </section>
      </div>

      <div className="dashboard-ops-grid">
        <section className="panel dashboard-work-panel">
          <div className="panel-header dashboard-panel-header">
            <div>
              <h2>Việc cần xử lý</h2>
              <p>Các điểm làm nghẽn vận hành nội dung và bán hàng</p>
            </div>
            <AlertTriangle size={18} />
          </div>
          <div className="work-item-list">
            {(data?.work_items ?? []).map((item) => (
              <div className={`work-item work-item-${item.tone}`} key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel dashboard-contact-panel">
          <div className="panel-header dashboard-panel-header">
            <div>
              <h2>Lead mới gần đây</h2>
              <p>5 lead trạng thái mới, gần nhất theo thời gian</p>
            </div>
            <PhoneCall size={18} />
          </div>
          <div className="recent-contact-list">
            {(data?.recent_contacts ?? []).map((contact) => (
              <div className="recent-contact-row" key={contact.id}>
                <div>
                  <strong>{contact.full_name}</strong>
                  <span>{contact.phone}</span>
                </div>
                <div>
                  <span>{contact.project_name ?? "Chưa chọn dự án"}</span>
                  {contact.apartment_code ? <small>Căn {contact.apartment_code}</small> : null}
                </div>
                <StatusBadge value={contact.status} />
              </div>
            ))}
            {!isLoading && !data?.recent_contacts.length ? <div className="empty-state">Chưa có lead mới.</div> : null}
          </div>
        </section>
      </div>

      {!consultantDashboard ? <div className="content-grid two-columns">
        <RankList title="Dự án được xem nhiều" items={topProjects} />
        <RankList title="Căn hộ được xem nhiều" items={topApartments} />
      </div> : null}

    </section>
  );
}

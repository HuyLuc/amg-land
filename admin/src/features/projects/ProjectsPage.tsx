import { useQuery } from "@tanstack/react-query";
import { Building2, CheckCircle2, ChevronLeft, ChevronRight, Eye, Pencil, Plus, Search, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { MetricCard } from "@/components/MetricCard";
import { PageHeader } from "@/components/PageHeader";
import { SelectMenu } from "@/components/SelectMenu";
import { StatusBadge } from "@/components/StatusBadge";
import { ProjectFormModal } from "@/features/projects/ProjectFormModal";
import { listProjects } from "@/features/projects/projectsApi";
import type { Project } from "@/services/types";

const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "draft", label: "Bản nháp" },
  { value: "active", label: "Đang mở" },
  { value: "closed", label: "Đã đóng" },
];

const pageSizeOptions = [
  { value: "10", label: "10 / trang" },
  { value: "20", label: "20 / trang" },
  { value: "50", label: "50 / trang" },
];

function formatCurrency(value: number): string {
  return `${value.toLocaleString("vi-VN")} VND`;
}

function formatShortCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`;
  }
  return `${Math.round(value / 1_000_000).toLocaleString("vi-VN")} triệu`;
}

function projectStatusValue(status: Project["status"]): string {
  return status === "active" ? "active_project" : status;
}

export function ProjectsPage(): JSX.Element {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [district, setDistrict] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedKeyword(keyword), 350);
    return () => window.clearTimeout(timeoutId);
  }, [keyword]);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword, district, pageSize, status]);

  const projectsQuery = useQuery({
    queryKey: ["projects", page, pageSize, debouncedKeyword, district, status],
    queryFn: () => listProjects({ page, limit: pageSize, keyword: debouncedKeyword, district, status }),
  });

  const allProjectsQuery = useQuery({
    queryKey: ["projects", "all-for-filters"],
    queryFn: () => listProjects({ limit: 100 }),
  });

  const projects = projectsQuery.data?.items ?? [];
  const allProjects = allProjectsQuery.data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((projectsQuery.data?.total ?? 0) / (projectsQuery.data?.limit ?? pageSize)));

  const districtOptions = useMemo(() => {
    const districts = Array.from(new Set(allProjects.map((project) => project.district).filter(Boolean))).sort((a, b) => a.localeCompare(b, "vi"));
    return [{ value: "", label: "Tất cả khu vực" }, ...districts.map((item) => ({ value: item, label: item }))];
  }, [allProjects]);

  const summary = useMemo(
    () => ({
      total: allProjects.length,
      active: allProjects.filter((project) => project.status === "active").length,
      draft: allProjects.filter((project) => project.status === "draft").length,
      closed: allProjects.filter((project) => project.status === "closed").length,
    }),
    [allProjects],
  );

  function showToast(message: string): void {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }

  return (
    <section className="page-stack projects-page">
      <PageHeader
        title="Dự án"
        description="Quản lý danh mục dự án, thông tin bán hàng, gallery, mặt bằng, tiện ích và giỏ hàng căn hộ."
        action={
          <button className="primary-button" type="button" onClick={() => setFormOpen(true)}>
            <Plus size={17} />
            Thêm dự án
          </button>
        }
      />

      <div className="metric-grid projects-metrics">
        <MetricCard icon={Building2} label="Tổng dự án" value={summary.total} />
        <MetricCard icon={CheckCircle2} label="Đang mở" value={summary.active} />
        <MetricCard icon={Pencil} label="Bản nháp" value={summary.draft} />
        <MetricCard icon={XCircle} label="Đã đóng" value={summary.closed} />
      </div>

      <section className="filter-panel">
        <div className="filter-title">
          <Search size={18} />
          <span>Bộ lọc dự án</span>
        </div>
        <div className="projects-filter-grid">
          <label className="search-control">
            <Search size={17} />
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo tên dự án..." />
          </label>
          <SelectMenu label="Trạng thái" value={status} options={statusOptions} onChange={setStatus} />
          <SelectMenu label="Khu vực" value={district} options={districtOptions} onChange={setDistrict} />
          <button
            className="secondary-button filter-reset"
            type="button"
            onClick={() => {
              setKeyword("");
              setDebouncedKeyword("");
              setDistrict("");
              setStatus("");
            }}
          >
            Xóa lọc
          </button>
        </div>
      </section>

      <section className="panel projects-list-panel">
        <div className="panel-header project-list-header">
          <div>
            <h2>Danh sách dự án</h2>
            <p>{projectsQuery.data?.total ?? projects.length} dự án phù hợp với bộ lọc hiện tại</p>
          </div>
        </div>

        <div className="table-wrap project-table-wrap">
          <table className="project-table">
            <thead>
              <tr>
                <th>Dự án</th>
                <th>Khu vực</th>
                <th>Giá từ</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <strong>{project.name}</strong>
                    <span>{project.location}</span>
                  </td>
                  <td>
                    <strong>{project.district}</strong>
                    <span>{project.city}</span>
                  </td>
                  <td>
                    <strong>{formatShortCurrency(project.price_from)}</strong>
                    <span>{formatCurrency(project.price_from)}</span>
                  </td>
                  <td>
                    <StatusBadge value={projectStatusValue(project.status)} />
                  </td>
                  <td>
                    <button className="icon-button" type="button" aria-label="Xem dự án" onClick={() => navigate(`/projects/${project.slug}`)}>
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {projectsQuery.isLoading ? <div className="empty-state">Đang tải dữ liệu...</div> : null}
        {!projectsQuery.isLoading && !projects.length ? <div className="empty-state">Không có dự án phù hợp với bộ lọc.</div> : null}

        <div className="pagination-bar">
          <div className="pagination-summary">
            Hiển thị <strong>{projects.length}</strong> / <strong>{projectsQuery.data?.total ?? 0}</strong> dự án
          </div>
          <div className="pagination-controls">
            <SelectMenu label="Số dòng" value={String(pageSize)} options={pageSizeOptions} onChange={(value) => setPageSize(Number(value))} />
            <button className="pagination-nav" type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              <ChevronLeft size={16} />
              <span>Trước</span>
            </button>
            <button className="active" type="button">
              {page}
            </button>
            <button className="pagination-nav" type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
              <span>Sau</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <ProjectFormModal open={formOpen} project={null} onClose={() => setFormOpen(false)} onSaved={(_, message) => showToast(message)} />

      {toast ? <div className="toast-message">{toast}</div> : null}
    </section>
  );
}

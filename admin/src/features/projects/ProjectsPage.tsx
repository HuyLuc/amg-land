import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { listProjects } from "@/features/projects/projectsApi";

export function ProjectsPage(): JSX.Element {
  const { data, isLoading, error } = useQuery({ queryKey: ["projects"], queryFn: listProjects });

  return (
    <section className="page-stack">
      <PageHeader title="Dự án" description="Danh sách dự án đang quản lý trong hệ thống." />
      <section className="panel">
        {error ? <div className="alert-error">Không tải được dự án.</div> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ten du an</th>
                <th>Khu vực</th>
                <th>Giá từ</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((project) => (
                <tr key={project.id}>
                  <td>
                    <strong>{project.name}</strong>
                    <span>{project.location}</span>
                  </td>
                  <td>{project.district}, {project.city}</td>
                  <td>{project.price_from.toLocaleString("vi-VN")} VND</td>
                  <td><StatusBadge value={project.status === "active" ? "active_project" : project.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isLoading ? <div className="empty-state">Đang tải dữ liệu...</div> : null}
        {!isLoading && !data?.items.length ? <div className="empty-state">Chưa có dự án.</div> : null}
      </section>
    </section>
  );
}

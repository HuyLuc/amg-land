import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { listProjects } from "@/features/projects/projectsApi";

export function ProjectsPage(): JSX.Element {
  const { data, isLoading, error } = useQuery({ queryKey: ["projects"], queryFn: listProjects });

  return (
    <section className="page-stack">
      <PageHeader title="Du an" description="Danh sach du an dang quan ly trong he thong." />
      <section className="panel">
        {error ? <div className="alert-error">Khong tai duoc du an.</div> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ten du an</th>
                <th>Khu vuc</th>
                <th>Gia tu</th>
                <th>Trang thai</th>
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
                  <td><StatusBadge value={project.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isLoading ? <div className="empty-state">Dang tai du lieu...</div> : null}
        {!isLoading && !data?.items.length ? <div className="empty-state">Chua co du an.</div> : null}
      </section>
    </section>
  );
}

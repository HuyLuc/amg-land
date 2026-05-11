import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { listUsers } from "@/features/users/usersApi";

export function UsersPage(): JSX.Element {
  const { data, isLoading, error } = useQuery({ queryKey: ["users"], queryFn: listUsers });

  return (
    <section className="page-stack">
      <PageHeader title="Nhan su" description="Tai khoan noi bo va phan quyen truy cap." />
      <section className="panel">
        {error ? <div className="alert-error">Khong tai duoc danh sach nhan su.</div> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ho ten</th>
                <th>Email</th>
                <th>Vai tro</th>
                <th>Trang thai</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.full_name}</strong></td>
                  <td>{user.email}</td>
                  <td><StatusBadge value={user.role} /></td>
                  <td><StatusBadge value={user.is_active ? "active" : "inactive"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isLoading ? <div className="empty-state">Dang tai du lieu...</div> : null}
        {!isLoading && !data?.items.length ? <div className="empty-state">Chua co nhan su.</div> : null}
      </section>
    </section>
  );
}

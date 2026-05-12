import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { listUsers } from "@/features/users/usersApi";

export function UsersPage(): JSX.Element {
  const { data, isLoading, error } = useQuery({ queryKey: ["users"], queryFn: listUsers });

  return (
    <section className="page-stack">
      <PageHeader title="Nhân sự" description="Tài khoản nội bộ và phân quyền truy cập." />
      <section className="panel">
        {error ? <div className="alert-error">Không tải được danh sách nhân sự.</div> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
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
        {isLoading ? <div className="empty-state">Đang tải dữ liệu...</div> : null}
        {!isLoading && !data?.items.length ? <div className="empty-state">Chưa có nhân sự.</div> : null}
      </section>
    </section>
  );
}

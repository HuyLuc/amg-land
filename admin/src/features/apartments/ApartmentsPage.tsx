import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { searchApartments } from "@/features/apartments/apartmentsApi";

export function ApartmentsPage(): JSX.Element {
  const { data, isLoading, error } = useQuery({ queryKey: ["apartments"], queryFn: searchApartments });

  return (
    <section className="page-stack">
      <PageHeader title="Căn hộ" description="Theo dõi giỏ hàng căn hộ đang mở bán." />
      <section className="panel">
        {error ? <div className="alert-error">Không tải được danh sách căn hộ.</div> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã căn</th>
                <th>Tầng</th>
                <th>Diện tích</th>
                <th>Hướng</th>
                <th>Giá</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((apartment) => (
                <tr key={apartment.id}>
                  <td><strong>{apartment.code}</strong></td>
                  <td>{apartment.floor}</td>
                  <td>{apartment.area} m2</td>
                  <td>{apartment.direction}</td>
                  <td>{apartment.price.toLocaleString("vi-VN")} VND</td>
                  <td><StatusBadge value={apartment.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isLoading ? <div className="empty-state">Đang tải dữ liệu...</div> : null}
        {!isLoading && !data?.items.length ? <div className="empty-state">Chưa có căn hộ phù hợp.</div> : null}
      </section>
    </section>
  );
}

import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { searchApartments } from "@/features/apartments/apartmentsApi";

export function ApartmentsPage(): JSX.Element {
  const { data, isLoading, error } = useQuery({ queryKey: ["apartments"], queryFn: searchApartments });

  return (
    <section className="page-stack">
      <PageHeader title="Can ho" description="Theo doi gio hang can ho dang mo ban." />
      <section className="panel">
        {error ? <div className="alert-error">Khong tai duoc danh sach can ho.</div> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ma can</th>
                <th>Tang</th>
                <th>Dien tich</th>
                <th>Huong</th>
                <th>Gia</th>
                <th>Trang thai</th>
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
        {isLoading ? <div className="empty-state">Dang tai du lieu...</div> : null}
        {!isLoading && !data?.items.length ? <div className="empty-state">Chua co can ho phu hop.</div> : null}
      </section>
    </section>
  );
}

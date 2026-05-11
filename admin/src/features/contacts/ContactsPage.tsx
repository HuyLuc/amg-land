import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { listContacts, updateContactStatus } from "@/features/contacts/contactsApi";
import type { Contact } from "@/services/types";

const statuses: Array<"" | Contact["status"]> = ["", "new", "processing", "done"];

export function ContactsPage(): JSX.Element {
  const [status, setStatus] = useState("");
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["contacts", status],
    queryFn: () => listContacts(1, status),
  });
  const mutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: Contact["status"] }) => updateContactStatus(id, nextStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return (
    <section className="page-stack">
      <PageHeader title="Leads tu van" description="Theo doi va xu ly yeu cau tu khach hang." />

      <div className="toolbar">
        <div className="segmented">
          {statuses.map((item) => (
            <button key={item || "all"} className={status === item ? "selected" : ""} type="button" onClick={() => setStatus(item)}>
              {item || "all"}
            </button>
          ))}
        </div>
      </div>

      <section className="panel">
        {error ? <div className="alert-error">Khong tai duoc danh sach leads.</div> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Khach hang</th>
                <th>Lien he</th>
                <th>Trang thai</th>
                <th>Ngay tao</th>
                <th>Xu ly</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((contact) => (
                <tr key={contact.id}>
                  <td>
                    <strong>{contact.full_name}</strong>
                    <span>{contact.message ?? "Khong co ghi chu"}</span>
                  </td>
                  <td>
                    <strong>{contact.phone}</strong>
                    <span>{contact.email ?? "Chua co email"}</span>
                  </td>
                  <td>
                    <StatusBadge value={contact.status} />
                  </td>
                  <td>{new Date(contact.created_at).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <select
                      value={contact.status}
                      onChange={(event) => mutation.mutate({ id: contact.id, nextStatus: event.target.value as Contact["status"] })}
                    >
                      <option value="new">new</option>
                      <option value="processing">processing</option>
                      <option value="done">done</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isLoading ? <div className="empty-state">Dang tai du lieu...</div> : null}
        {!isLoading && !data?.items.length ? <div className="empty-state">Chua co lead nao.</div> : null}
      </section>
    </section>
  );
}

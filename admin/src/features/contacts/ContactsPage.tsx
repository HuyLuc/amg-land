import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Clock3, Filter, MessageSquare, Phone, Search, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { MetricCard } from "@/components/MetricCard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { listContacts, updateContact } from "@/features/contacts/contactsApi";
import { listProjects } from "@/features/projects/projectsApi";
import { listUsers } from "@/features/users/usersApi";
import type { Contact } from "@/services/types";

const statusOptions: Array<{ value: "" | Contact["status"]; label: string }> = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "new", label: "Mới" },
  { value: "processing", label: "Đang xử lý" },
  { value: "done", label: "Hoàn tất" },
];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ContactsPage(): JSX.Element {
  const [status, setStatus] = useState<"" | Contact["status"]>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [assignee, setAssignee] = useState("");
  const [projectId, setProjectId] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<Contact["status"]>("new");
  const [draftAssignee, setDraftAssignee] = useState("");
  const [draftNote, setDraftNote] = useState("");

  const queryClient = useQueryClient();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search), 350);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const contactsQuery = useQuery({
    queryKey: ["contacts", status, debouncedSearch, assignee, projectId],
    queryFn: () =>
      listContacts(1, {
        status,
        keyword: debouncedSearch,
        assignedTo: assignee,
        projectId,
      }),
  });
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: listUsers });
  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: listProjects });

  const contacts = contactsQuery.data?.items ?? [];
  const users = usersQuery.data?.items ?? [];
  const projects = projectsQuery.data?.items ?? [];

  const userNameById = useMemo(() => new Map(users.map((user) => [user.id, user.full_name])), [users]);
  const projectNameById = useMemo(() => new Map(projects.map((project) => [project.id, project.name])), [projects]);

  const summary = useMemo(
    () => ({
      total: contacts.length,
      newCount: contacts.filter((item) => item.status === "new").length,
      processingCount: contacts.filter((item) => item.status === "processing").length,
      doneCount: contacts.filter((item) => item.status === "done").length,
    }),
    [contacts],
  );

  const selectedContact = contacts.find((contact) => contact.id === selectedId) ?? contacts[0] ?? null;

  useEffect(() => {
    if (!selectedContact) {
      return;
    }
    setDraftStatus(selectedContact.status);
    setDraftAssignee(selectedContact.assigned_to ?? "");
    setDraftNote(selectedContact.note ?? "");
  }, [selectedContact]);

  const mutation = useMutation({
    mutationFn: () =>
      selectedContact
        ? updateContact(selectedContact.id, {
            status: draftStatus,
            assigned_to: draftAssignee || null,
            note: draftNote.trim() || null,
          })
        : Promise.reject(new Error("Chưa chọn khách tư vấn")),
    onSuccess: (updatedContact) => {
      setSelectedId(updatedContact.id);
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  function openContact(contact: Contact): void {
    setSelectedId(contact.id);
    setDraftStatus(contact.status);
    setDraftAssignee(contact.assigned_to ?? "");
    setDraftNote(contact.note ?? "");
  }

  function resetFilters(): void {
    setStatus("");
    setSearch("");
    setDebouncedSearch("");
    setAssignee("");
    setProjectId("");
  }

  return (
    <section className="page-stack leads-page">
      <PageHeader title="Khách tư vấn" description="Theo dõi, phân loại và xử lý yêu cầu tư vấn từ khách hàng." />

      <div className="metric-grid leads-metrics">
        <MetricCard icon={MessageSquare} label="Tổng yêu cầu" value={summary.total} />
        <MetricCard icon={Clock3} label="Mới" value={summary.newCount} />
        <MetricCard icon={Phone} label="Đang xử lý" value={summary.processingCount} />
        <MetricCard icon={CheckCircle2} label="Hoàn tất" value={summary.doneCount} />
      </div>

      <section className="filter-panel">
        <div className="filter-title">
          <Filter size={18} />
          <span>Bộ lọc khách tư vấn</span>
        </div>
        <div className="filter-grid">
          <label className="search-control">
            <Search size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên, số điện thoại, email, ghi chú..." />
          </label>
          <label className="select-control">
            <span>Trạng thái</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as "" | Contact["status"])}>
              {statusOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="select-control">
            <span>Dự án quan tâm</span>
            <select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
              <option value="">Tất cả dự án</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label className="select-control">
            <span>Phụ trách</span>
            <select value={assignee} onChange={(event) => setAssignee(event.target.value)}>
              <option value="">Tất cả nhân sự</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name}
                </option>
              ))}
            </select>
          </label>
          <button className="secondary-button filter-reset" type="button" onClick={resetFilters}>
            Xóa lọc
          </button>
        </div>
      </section>

      {contactsQuery.error ? <div className="alert-error">Không tải được danh sách khách tư vấn.</div> : null}

      <div className="leads-workspace">
        <section className="panel leads-table-panel">
          <div className="panel-header leads-panel-header">
            <div>
              <h2>Danh sách khách</h2>
              <p>{contactsQuery.data?.total ?? contacts.length} yêu cầu phù hợp</p>
            </div>
          </div>
          <div className="table-wrap">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Nhu cầu</th>
                  <th>Dự án</th>
                  <th>Phụ trách</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className={selectedContact?.id === contact.id ? "selected-row" : ""} onClick={() => openContact(contact)}>
                    <td>
                      <strong>{contact.full_name}</strong>
                      <span>{contact.phone}</span>
                      <span>{contact.email ?? "Chưa có email"}</span>
                    </td>
                    <td className="lead-message">{contact.message ?? "Khách chưa để lại nội dung"}</td>
                    <td>{contact.project_id ? projectNameById.get(contact.project_id) ?? "Dự án đã chọn" : "Chưa chọn dự án"}</td>
                    <td>{contact.assigned_to ? userNameById.get(contact.assigned_to) ?? "Đã gán" : "Chưa gán"}</td>
                    <td>
                      <StatusBadge value={contact.status} />
                    </td>
                    <td>{formatDate(contact.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {contactsQuery.isLoading ? <div className="empty-state">Đang tải dữ liệu...</div> : null}
          {!contactsQuery.isLoading && !contacts.length ? <div className="empty-state">Không có khách tư vấn phù hợp với bộ lọc.</div> : null}
        </section>

        <aside className="lead-detail-panel">
          {selectedContact ? (
            <>
              <div className="lead-detail-header">
                <div>
                  <span>Hồ sơ khách tư vấn</span>
                  <h2>{selectedContact.full_name}</h2>
                </div>
                <StatusBadge value={selectedContact.status} />
              </div>

              <div className="lead-contact-card">
                <div>
                  <Phone size={17} />
                  <strong>{selectedContact.phone}</strong>
                </div>
                <div>
                  <UserRound size={17} />
                  <span>{selectedContact.email ?? "Chưa có email"}</span>
                </div>
                <div>
                  <CalendarDays size={17} />
                  <span>{formatDate(selectedContact.created_at)}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Nội dung khách gửi</h3>
                <p>{selectedContact.message ?? "Khách chưa để lại nội dung cụ thể."}</p>
              </div>

              <div className="detail-form">
                <label className="select-control">
                  <span>Trạng thái xử lý</span>
                  <select value={draftStatus} onChange={(event) => setDraftStatus(event.target.value as Contact["status"])}>
                    {statusOptions.slice(1).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="select-control">
                  <span>Nhân sự phụ trách</span>
                  <select value={draftAssignee} onChange={(event) => setDraftAssignee(event.target.value)}>
                    <option value="">Chưa gán</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="textarea-control">
                  <span>Ghi chú nội bộ</span>
                  <textarea value={draftNote} onChange={(event) => setDraftNote(event.target.value)} placeholder="Nhập ghi chú chăm sóc, lịch hẹn, nhu cầu tài chính..." />
                </label>

                {mutation.error ? <div className="form-error">Không lưu được thay đổi. Vui lòng thử lại.</div> : null}

                <button className="primary-button" type="button" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
                  {mutation.isPending ? "Đang lưu..." : "Lưu cập nhật"}
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">Chọn một khách tư vấn để xem chi tiết.</div>
          )}
        </aside>
      </div>
    </section>
  );
}

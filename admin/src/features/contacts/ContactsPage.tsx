import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Filter, MessageSquare, Phone, Search, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { MetricCard } from "@/components/MetricCard";
import { PageHeader } from "@/components/PageHeader";
import { DatePicker } from "@/components/DatePicker";
import { SelectMenu } from "@/components/SelectMenu";
import { StatusBadge } from "@/components/StatusBadge";
import { listContacts, updateContact } from "@/features/contacts/contactsApi";
import { listProjects } from "@/features/projects/projectsApi";
import { listUsers } from "@/features/users/usersApi";
import { getAuthUser } from "@/services/authStorage";
import { isAdminRole } from "@/services/permissions";
import type { Contact, User } from "@/services/types";

const statusOptions: Array<{ value: "" | Contact["status"]; label: string }> = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "new", label: "Mới" },
  { value: "processing", label: "Đang xử lý" },
  { value: "done", label: "Hoàn tất" },
];

const pageSizeOptions = [
  { value: "10", label: "10 / trang" },
  { value: "20", label: "20 / trang" },
  { value: "50", label: "50 / trang" },
];

interface ConfirmState {
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
}

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
  const currentUser = getAuthUser();
  const canAssignContacts = isAdminRole(currentUser?.role);
  const [status, setStatus] = useState<"" | Contact["status"]>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [assignee, setAssignee] = useState("");
  const [projectId, setProjectId] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<Contact["status"]>("new");
  const [draftAssignee, setDraftAssignee] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmState | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search), 350);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [assignee, createdFrom, createdTo, debouncedSearch, pageSize, projectId, status]);

  const contactsQuery = useQuery({
    queryKey: ["contacts", page, pageSize, status, debouncedSearch, assignee, projectId, createdFrom, createdTo],
    queryFn: () =>
      listContacts(page, {
        status,
        keyword: debouncedSearch,
        assignedTo: assignee,
        projectId,
        createdFrom: createdFrom ? new Date(`${createdFrom}T00:00:00`).toISOString() : undefined,
        createdTo: createdTo ? new Date(`${createdTo}T23:59:59`).toISOString() : undefined,
        limit: pageSize,
      }),
  });
  const usersQuery = useQuery({
    queryKey: ["users", "consultants-for-contact-assignment"],
    queryFn: () => listUsers({ limit: 100, role: "consultant", isActive: "true" }),
    enabled: canAssignContacts,
  });
  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: () => listProjects({ limit: 100 }) });

  const contacts = contactsQuery.data?.items ?? [];
  const users = canAssignContacts
    ? usersQuery.data?.items ?? []
    : currentUser
      ? [{ id: currentUser.id, email: currentUser.email, full_name: currentUser.full_name, phone: null, role: currentUser.role, is_active: true, created_at: "", last_login: null } as User]
      : [];
  const projects = projectsQuery.data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((contactsQuery.data?.total ?? 0) / (contactsQuery.data?.limit ?? pageSize)));

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

  const isDirty = selectedContact
    ? draftStatus !== selectedContact.status ||
      draftAssignee !== (selectedContact.assigned_to ?? "") ||
      draftNote !== (selectedContact.note ?? "")
    : false;

  const projectOptions = useMemo(
    () => [{ value: "", label: "Tất cả dự án" }, ...projects.map((project) => ({ value: project.id, label: project.name }))],
    [projects],
  );
  const userOptions = useMemo(
    () => [{ value: "", label: "Tất cả người phụ trách" }, ...users.map((user) => ({ value: user.id, label: user.full_name }))],
    [users],
  );
  const detailUserOptions = useMemo(
    () => [{ value: "", label: "Chưa gán" }, ...users.map((user) => ({ value: user.id, label: user.full_name }))],
    [users],
  );
  const mutation = useMutation({
    mutationFn: () =>
      selectedContact
        ? updateContact(selectedContact.id, {
            status: draftStatus,
            ...(canAssignContacts ? { assigned_to: draftAssignee || null } : {}),
            note: draftNote.trim() || null,
          })
        : Promise.reject(new Error("Chưa chọn khách tư vấn")),
    onSuccess: (updatedContact) => {
      setSelectedId(updatedContact.id);
      setToast("Đã lưu cập nhật khách tư vấn.");
      window.setTimeout(() => setToast(null), 2600);
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  function selectContact(contact: Contact): void {
    setSelectedId(contact.id);
    setDraftStatus(contact.status);
    setDraftAssignee(contact.assigned_to ?? "");
    setDraftNote(contact.note ?? "");
  }

  function openContact(contact: Contact): void {
    if (isDirty) {
      setConfirmDialog({
        title: "Bỏ thay đổi chưa lưu?",
        description: "Bạn đang có thay đổi chưa lưu. Nếu chuyển sang khách khác, các thay đổi hiện tại sẽ bị bỏ qua.",
        confirmLabel: "Tiếp tục",
        tone: "default",
        onConfirm: () => {
          setConfirmDialog(null);
          selectContact(contact);
        },
      });
      return;
    }
    selectContact(contact);
  }

  function resetFilters(): void {
    setStatus("");
    setSearch("");
    setDebouncedSearch("");
    setAssignee("");
    setProjectId("");
    setCreatedFrom("");
    setCreatedTo("");
    setPage(1);
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
          <SelectMenu label="Trạng thái" value={status} options={statusOptions} onChange={(value) => setStatus(value as "" | Contact["status"])} />
          <SelectMenu label="Dự án quan tâm" value={projectId} options={projectOptions} onChange={setProjectId} />
          {canAssignContacts ? <SelectMenu label="Phụ trách" value={assignee} options={userOptions} onChange={setAssignee} /> : null}
          <DatePicker label="Từ ngày" value={createdFrom} onChange={setCreatedFrom} />
          <DatePicker label="Đến ngày" value={createdTo} onChange={setCreatedTo} />
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
                  <th>Căn hộ quan tâm</th>
                  <th>Dự án</th>
                  <th>Phụ trách</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className={selectedContact?.id === contact.id ? "selected-row" : ""} onClick={() => openContact(contact)}>
                    <td className="lead-customer-cell">
                      <strong>{contact.full_name}</strong>
                      <span>{contact.phone}</span>
                      <span>{contact.email ?? "Chưa có email"}</span>
                    </td>
                    <td>{contact.apartment_code ?? "Chưa chọn căn hộ"}</td>
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
          <div className="pagination-bar">
            <div className="pagination-summary">
              Hiển thị <strong>{contacts.length}</strong> / <strong>{contactsQuery.data?.total ?? 0}</strong> khách tư vấn
            </div>
            <div className="pagination-controls">
              <SelectMenu label="Số dòng" value={String(pageSize)} options={pageSizeOptions} onChange={(value) => setPageSize(Number(value))} />
              <button className="pagination-nav" type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                <ChevronLeft size={16} />
                <span>Trước</span>
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter((item) => item === 1 || item === totalPages || Math.abs(item - page) <= 1)
                .map((item, index, pages) => {
                  const previous = pages[index - 1];
                  return (
                    <span className="pagination-item-wrap" key={item}>
                      {previous && item - previous > 1 ? <span className="pagination-ellipsis">...</span> : null}
                      <button className={item === page ? "active" : ""} type="button" onClick={() => setPage(item)}>
                        {item}
                      </button>
                    </span>
                  );
                })}
              <button className="pagination-nav" type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
                <span>Sau</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
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
                <SelectMenu label="Trạng thái xử lý" value={draftStatus} options={statusOptions.slice(1)} onChange={(value) => setDraftStatus(value as Contact["status"])} />
                {canAssignContacts ? <SelectMenu label="Người phụ trách" value={draftAssignee} options={detailUserOptions} onChange={setDraftAssignee} /> : null}
                <div className="readonly-field">
                  <span>Dự án quan tâm</span>
                  <strong>{selectedContact.project_id ? projectNameById.get(selectedContact.project_id) ?? "Dự án đã chọn" : "Chưa chọn dự án"}</strong>
                </div>
                <div className="readonly-field">
                  <span>Căn hộ quan tâm</span>
                  <strong>{selectedContact.apartment_code ?? "Chưa chọn căn hộ"}</strong>
                </div>

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

      <ConfirmDialog
        open={Boolean(confirmDialog)}
        title={confirmDialog?.title ?? ""}
        description={confirmDialog?.description ?? ""}
        confirmLabel={confirmDialog?.confirmLabel}
        tone={confirmDialog?.tone ?? "danger"}
        onClose={() => setConfirmDialog(null)}
        onConfirm={() => confirmDialog?.onConfirm()}
      />

      {toast ? <div className="toast-message">{toast}</div> : null}
    </section>
  );
}
